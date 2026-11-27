'use strict';
// TALOS Geo Intelligence: read-only TALOS overlays + selected original God's Eye public feed sources.
// No sample coordinates, sample incidents or simulated patrols.
const $ = id => document.getElementById(id);
const num = value => value !== null && value !== undefined && String(value).trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
const norm = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const state = {viewer:null,sites:[],estateRaw:[],postcodeLookup:new Map(),resolvingPostcodes:false,estateLoaded:false,gpsLoaded:false,gps:[],selected:null,quakes:[],eonet:[],aircraft:[],aircraftRequest:0,aircraftLoading:false,feedStatus:{quakes:'Off',eonet:'Off',aircraft:'Off'},lastFeedRefresh:0,incidentRecords:null,incidentLoad:null,incidentError:null,incidentSelection:0};
const entities = {sites:[],checkpoints:[],patrols:[],quakes:[],eonet:[],aircraft:[]};
const ukView = () => Cesium.Cartesian3.fromDegrees(-2.65,54.1,1450000);
const at = (lat,lon) => Cesium.Cartesian3.fromDegrees(lon,lat);
const safe = text => String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clear(key){for(const entity of entities[key])state.viewer.entities.remove(entity);entities[key]=[]}
function add(key,definition){entities[key].push(state.viewer.entities.add(definition))}
const filterIds=['geoSearch','geoStatus','geoClient','geoType','geoRegion'];
function siteStatus(value){
 const s=String(value??'').trim().toLowerCase();
 if(['yes','true','1','active'].includes(s))return 'active';
 if(['no','false','0','inactive','non-active','not active'].includes(s))return 'inactive';
 return 'unknown';
}
function filtersApplied(){return filterIds.some(id=>String($(id).value||'').trim()!=='')}
function filteredSites(){
 const query=String($('geoSearch').value||'').trim().toLowerCase().replace(/\bmcl\b/g,'mclaren');
 const terms=query.split(/\s+/).filter(Boolean);
 return state.sites.filter(s=>{
  if($('geoStatus').value&&siteStatus(s.active)!==$('geoStatus').value)return false;
  if($('geoClient').value&&s.client!==$('geoClient').value)return false;
  if($('geoType').value&&s.type!==$('geoType').value)return false;
  if($('geoRegion').value&&s.region!==$('geoRegion').value)return false;
  const hay=[s.name,s.client,s.postcode,s.type,s.region].join(' ').toLowerCase();
  return terms.every(term=>hay.includes(term));
 }).sort((a,b)=>a.name.localeCompare(b.name));
}
function refillSelect(id,values,defaultLabel){
 const el=$(id),previous=el.value;
 const unique=[...new Set(values.map(s=>String(s||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 el.replaceChildren(new Option(defaultLabel,''));
 for(const value of unique)el.add(new Option(value,value));
 if(unique.includes(previous))el.value=previous;
}
function refreshFilterChoices(){
 refillSelect('geoClient',state.estateRaw.map(s=>s.client),'All clients');
 refillSelect('geoType',state.estateRaw.map(s=>s.type),'All types');
 refillSelect('geoRegion',state.estateRaw.map(s=>s.region),'All regions');
 const count=state.estateRaw.filter(s=>s.client).length;
 $('geoClient').disabled=count===0;
 $('geoClientHint').textContent=count?'Client options reflect '+count+' estate records containing client values.':'No dedicated client field was provided by the current Estate List response; search can match site names.';
}
function refreshFilters(){
 const shown=filteredSites();
 $('geoFilterCount').textContent=shown.length+' shown / '+state.sites.length+' mapped';
 if(state.selected&&!shown.some(s=>s.id===state.selected))state.selected=null;
 renderSites();currentSitePanel();window.geoCheckpointReplay?.refresh();draw();
}
function status(){
 $('summary').textContent = [
  state.estateLoaded?(state.sites.length+' mapped / '+state.estateRaw.length+' TALOS estates ('+state.sites.filter(s=>s.sourceLabel.startsWith('Estate')).length+' exact, '+state.sites.filter(s=>s.sourceLabel.startsWith('NEW START')).length+' from NEW START, '+state.sites.filter(s=>s.sourceLabel.startsWith('Postcode')).length+' postcode)'):'Loading TALOS estate records…',
  state.gpsLoaded?state.gps.length+' attributed historical GPS/checkpoint records':'Loading GPS/checkpoint records…'
 ].join(' · ');
 $('feedStatus').textContent='USGS earthquakes: '+state.feedStatus.quakes+' | NASA EONET: '+state.feedStatus.eonet+' | ADS-B aircraft: '+state.feedStatus.aircraft;
}

function currentSitePanel(){
 const site=state.sites.find(s=>s.id===state.selected);
 $('geoSiteName').textContent=site?.name||'Select a site marker';
 $('geoSiteLocation').textContent=site?
   'Location: '+site.sourceLabel+(site.postcode?' · '+site.postcode:'')+' · '+siteStatus(site.active):
   'Click a site marker or choose an estate from the list.';
 if(!site){$('geoSiteIncident').textContent='Select a site to check its incident register.';return}
 showLatestIncident(site);
}
function incidentRows(payload){
 const body=payload&&typeof payload==='object'&&!Array.isArray(payload)&&payload.body&&!Array.isArray(payload.body)?payload.body:payload;
 if(Array.isArray(body))return body;
 if(Array.isArray(body?.incidents))return body.incidents;
 if(Array.isArray(body?.value))return body.value;
 if(Array.isArray(body?.body?.value))return body.body.value;
 return [];
}
function incidentTimestamp(row){
 const value=row.incidentDateTime??row.incidentTime??row.field_7??row.created??row.Created??row.date??row.Date;
 if(!value)return null;
 const time=typeof value==='number'?value:Date.parse(String(value));
 return Number.isFinite(time)?time:null;
}
async function getIncidents(){
 if(state.incidentRecords)return state.incidentRecords;
 if(state.incidentLoad)return state.incidentLoad;
 const url=String(window.SECURIT_INCIDENT_API_URL||'').trim();
 if(!url){state.incidentError='Incident API not configured';return null}
 state.incidentLoad=(async()=>{
  try{
   const response=await fetch(url,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:'{}'});
   if(!response.ok)throw Error('HTTP '+response.status);
   const json=await response.json();
   state.incidentRecords=incidentRows(json).map(r=>({
    site:String(r.site??r.field_6??'').trim(),
    type:String(r.incidentType??r.field_8??'').trim(),
    time:incidentTimestamp(r)
   })).filter(r=>r.site&&r.time!==null).sort((a,b)=>b.time-a.time);
   state.incidentError=null;return state.incidentRecords;
  }catch(error){state.incidentError=error.message;return null}
  finally{state.incidentLoad=null}
 })();
 return state.incidentLoad;
}
async function showLatestIncident(site){
 const revision=++state.incidentSelection;
 $('geoSiteIncident').textContent='Checking incident register…';
 const incidents=await getIncidents();
 if(revision!==state.incidentSelection||state.selected!==site.id)return;
 if(!incidents){$('geoSiteIncident').textContent='Incident register unavailable: '+(state.incidentError||'unknown error');return}
 const result=incidents.find(r=>norm(r.site)===norm(site.name));
 $('geoSiteIncident').textContent=result?
   (result.type||'Incident, type unspecified')+' · '+new Date(result.time).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}):
   'No incident found matching this exact site name.';
}
function chooseSite(site){
 state.selected=site.id;state.aircraft=[];currentSitePanel();
 draw();renderSites();window.geoCheckpointReplay?.refresh();
 state.viewer?.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(site.longitude,site.latitude,8000),duration:1});
 if($('layerAircraft').checked)refreshAircraft();
}

function renderSites(){
 const host=$('sites');host.replaceChildren();
 const visible=filteredSites();
 if(!state.estateLoaded){host.textContent='Waiting for Estate Manager list…';return}
 if(!state.sites.length){host.textContent='No locations resolved yet. Checking estate coordinates, NEW START scans and postcodes.';return}
 if(!visible.length){host.textContent='No mapped estates match these filters.';return}
 const all=document.createElement('button');all.type='button';all.textContent='All mapped estates';all.className=!state.selected?'active':'';all.onclick=()=>{state.selected=null;state.aircraft=[];state.incidentSelection++;currentSitePanel();draw();renderSites();window.geoCheckpointReplay?.refresh();home();if($('layerAircraft').checked)refreshAircraft()};host.appendChild(all);
 for(const site of visible){const button=document.createElement('button');button.type='button';button.textContent=site.name+' · '+(site.sourceLabel.startsWith('Estate')?'Coordinates':site.sourceLabel.startsWith('NEW START')?'NEW START average':'Postcode approximate');button.className=state.selected===site.id?'active':'';button.onclick=()=>chooseSite(site);host.appendChild(button)}
}
function draw(){
 if(!state.viewer)return;
 Object.keys(entities).forEach(clear);
 const {gps,selected}=state;
 const sites=filteredSites();
 if($('layerSites').checked)for(const s of sites)add('sites',{id:'talos-estate-'+s.id,name:s.name,position:at(s.latitude,s.longitude),point:{pixelSize:10,color:Cesium.Color.DODGERBLUE,outlineColor:Cesium.Color.WHITE,outlineWidth:2},label:{text:s.name,font:'12px sans-serif',fillColor:Cesium.Color.WHITE,showBackground:true,backgroundColor:Cesium.Color.fromCssColorString('#112b40').withAlpha(.85),pixelOffset:new Cesium.Cartesian2(0,-22),distanceDisplayCondition:new Cesium.DistanceDisplayCondition(0,170000)},description:'TALOS estate: '+safe(s.name)+' · Location method: '+safe(s.sourceLabel)+'. '+(s.samples?'NEW START scans used: '+s.samples+'. ':'')+(s.postcode?'Postcode: '+safe(s.postcode)+'. ':'')+'Approximate markers are not verified site boundaries.'});
 const focus=sites.find(s=>s.id===selected);
 const selectedNames=new Set(sites.map(s=>norm(s.name)));
 // Heavy GPS/checkpoint overlays are only generated after selecting an estate.
 const needHistory=!!focus&&($('layerCheckpoints').checked||$('layerPatrols').checked);
 const relevant=needHistory?gps.filter(r=>norm(r.site)===norm(focus.name)):[];
 if($('layerCheckpoints').checked){
  const latest=new Map();
  for(const r of relevant.filter(r=>r.type==='checkpoint')){const key=norm(r.site)+'|'+norm(r.event);const prev=latest.get(key);if(!prev||r.ms>prev.ms)latest.set(key,r)}
  for(const r of latest.values())add('checkpoints',{name:r.event,position:at(r.lat,r.lon),point:{pixelSize:8,color:Cesium.Color.CYAN,outlineColor:Cesium.Color.BLACK,outlineWidth:1},description:'Recorded checkpoint scan at '+safe(r.site)+'; timestamp: '+new Date(r.ms).toLocaleString('en-GB')+'. A recorded scan location is not a fixed surveyed checkpoint coordinate.'});
 }
 if($('layerPatrols').checked){
  const groups=new Map();
  for(const r of relevant.filter(r=>r.type==='gps')){const key=r.site+'|'+r.shift;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r)}
  for(const [key,items] of groups){const sorted=items.sort((a,b)=>a.ms-b.ms);if(sorted.length>1)add('patrols',{name:key,polyline:{positions:sorted.map(r=>at(r.lat,r.lon)),width:2,material:Cesium.Color.ORANGE},description:'Historical GPS trace from TALOS; not a live officer location.'})}
 }
 if($('layerAircraft').checked)for(const a of state.aircraft)add('aircraft',{name:a.flight||a.hex,position:Cesium.Cartesian3.fromDegrees(a.lon,a.lat,a.altFt===null?0:a.altFt*0.3048),point:{pixelSize:9,color:Cesium.Color.LIME,outlineColor:Cesium.Color.BLACK,outlineWidth:1,heightReference:a.altFt===null?Cesium.HeightReference.CLAMP_TO_GROUND:Cesium.HeightReference.NONE},label:{text:a.flight||a.hex,font:'11px sans-serif',pixelOffset:new Cesium.Cartesian2(0,-17),fillColor:Cesium.Color.WHITE,showBackground:true,backgroundColor:Cesium.Color.fromCssColorString('#0b1829').withAlpha(.75),distanceDisplayCondition:new Cesium.DistanceDisplayCondition(0,180000)},description:'SecurIT Radar ADS-B feed (Airplanes.live via original Worker). Flight: '+safe(a.flight||'Unlisted')+' · ICAO: '+safe(a.hex)+' · altitude: '+(a.altFt===null?'unknown':a.altFt+' ft')+' · speed: '+(a.speed===null?'unknown':a.speed+' kt')+' · heading: '+(a.heading===null?'unknown':a.heading+'°')+' · position age: '+(a.seen===null?'unknown':a.seen+' s')+'. Informational only; not aviation separation data.'});
 if($('layerQuakes').checked)for(const q of state.quakes)add('quakes',{name:'USGS earthquake M'+q.mag,position:at(q.lat,q.lon),point:{pixelSize:Math.max(5,Math.min(17,q.mag*2.8)),color:Cesium.Color.fromCssColorString(q.depth<70?'#f26d5b':q.depth<300?'#e6a448':'#daca5c'),outlineColor:Cesium.Color.WHITE,outlineWidth:1},description:'USGS earthquake: M'+q.mag+' · '+safe(q.place)+' · '+new Date(q.ms).toLocaleString('en-GB')+' · depth '+q.depth+' km. Source: USGS.'});
 if($('layerEonet').checked)for(const e of state.eonet)add('eonet',{name:e.title,position:at(e.lat,e.lon),point:{pixelSize:9,color:Cesium.Color.MAGENTA,outlineColor:Cesium.Color.WHITE,outlineWidth:1},description:'NASA EONET natural event · '+safe(e.category)+' · '+safe(e.title)+'. Source: NASA EONET.'});
 status();
}
function home(){state.viewer?.camera.flyTo({destination:ukView(),duration:1.2})}
const ukBounds=()=>Cesium.Rectangle.fromDegrees(-11.5,49.4,3.4,59.4);
function updateModeButton(){
 const mode=state.viewer?.scene.mode;
 $('toggle3D').textContent=mode===Cesium.SceneMode.SCENE2D?'Switch to 3D':'Switch to 2D';
}
function resetUK2D(){
 const viewer=state.viewer;if(!viewer)return;
 const move=()=>{
  viewer.camera.setView({destination:ukBounds(),orientation:{heading:0,pitch:Cesium.Math.toRadians(-90),roll:0}});
  viewer.scene.requestRender();
  updateModeButton();
 };
 if(viewer.scene.mode===Cesium.SceneMode.SCENE2D){move();return}
 const remove=viewer.scene.morphComplete.addEventListener(()=>{remove();move()});
 viewer.scene.morphTo2D(0.8);
}
function zoomMap(closer){
 const viewer=state.viewer;if(!viewer)return;
 const magnitude=viewer.camera.getMagnitude();
 if(!Number.isFinite(magnitude)||magnitude<=0)return;
 const delta=magnitude*.09;
 if(closer)viewer.camera.zoomIn(delta);
 else viewer.camera.zoomOut(delta);
 viewer.scene.requestRender();
}
function rotateMap(left){
 const viewer=state.viewer;if(!viewer)return;
 const angle=Cesium.Math.toRadians(15);
 if(left)viewer.camera.rotateLeft(angle);
 else viewer.camera.rotateRight(angle);
 viewer.scene.requestRender();
}
function toggleMapMode(){
 const viewer=state.viewer;if(!viewer)return;
 if(viewer.scene.mode===Cesium.SceneMode.SCENE2D){
  const remove=viewer.scene.morphComplete.addEventListener(()=>{remove();home();updateModeButton()});
  viewer.scene.morphTo3D(0.8);
 }else resetUK2D();
}
// Matching uses site names already present in both TALOS feeds; never guess across different names.
// "NEW START" records are *recorded scan positions*, not fixed surveyed entrance points.
let scanCache=null;
function startScanSitePositions(){
 if(scanCache)return scanCache;
 const bySite=new Map();
 for(const record of state.gps){
  if(record.type!=='checkpoint'||!norm(record.event).startsWith('newstart'))continue;
  const key=norm(record.site);
  if(!key)continue;
  if(!bySite.has(key))bySite.set(key,[]);
  bySite.get(key).push(record);
 }
 const locations=new Map();
 for(const [key,allRows] of bySite){
  const rows=allRows.sort((a,b)=>b.ms-a.ms).slice(0,500);
  // Use the densest cluster around an observed scan to prevent GPS outliers skewing the location.
  let best=[];
  for(const centre of rows){
   const nearby=rows.filter(r=>distanceMetres(centre,r)<=125);
   if(nearby.length>best.length)best=nearby;
  }
  if(!best.length)continue;
  if(rows.length>1&&best.length/rows.length<0.6)continue; // ambiguous multiple scan clusters
  locations.set(key,{latitude:best.reduce((sum,r)=>sum+r.lat,0)/best.length,longitude:best.reduce((sum,r)=>sum+r.lon,0)/best.length,samples:best.length,total:rows.length});
 }
 scanCache=locations;
 return locations;
}
function distanceMetres(a,b){
 const radius=6371000,rad=Math.PI/180;
 const dLat=(a.lat-b.lat)*rad,dLon=(a.lon-b.lon)*rad;
 const h=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLon/2)**2;
 return 2*radius*Math.asin(Math.min(1,Math.sqrt(h)));
}
function rebuildEstateLocations(){
 const starts=startScanSitePositions();
 const mapped=[];
 for(const record of state.estateRaw){
  const directLat=num(record.latitude),directLon=num(record.longitude);
  const direct=directLat!==null&&directLon!==null&&Math.abs(directLat)<=90&&Math.abs(directLon)<=180&&!(directLat===0&&directLon===0);
  const scan=starts.get(norm(record.name));
  const postcode=state.postcodeLookup.get(record.postcode.replace(/\s+/g,'').toUpperCase());
  let loc;
  if(direct)loc={latitude:directLat,longitude:directLon,sourceLabel:'Estate Manager coordinates'};
  else if(scan)loc={latitude:scan.latitude,longitude:scan.longitude,sourceLabel:'NEW START checkpoint scan average (GPS-derived)',samples:scan.samples};
  else if(postcode)loc={latitude:postcode.latitude,longitude:postcode.longitude,sourceLabel:'Postcode centroid (approximate)'};
  if(loc)mapped.push({...record,...loc});
 }
 state.sites=mapped;
 window.geoCheckpointReplay?.refresh();
 $('geoFilterCount').textContent=filteredSites().length+' shown / '+mapped.length+' mapped';
 if(state.selected&&!mapped.some(s=>s.id===state.selected))state.selected=null;
 renderSites();currentSitePanel();draw();
}
async function resolvePostcodes(){
 // Browser-side postcode resolution only for estates lacking explicit coordinates and NEW START scans.
 // postcodes.io receives postcode only, not site names, officer names, or patrol records.
 if(state.resolvingPostcodes)return;
 state.resolvingPostcodes=true;
 try{
  const starts=startScanSitePositions(),seen=new Set();
  const waiting=state.estateRaw.filter(s=>{
   const lat=num(s.latitude),lon=num(s.longitude);
   if(lat!==null&&lon!==null&&Math.abs(lat)<=90&&Math.abs(lon)<=180)return false;
   if(starts.has(norm(s.name)))return false;
   const code=s.postcode.replace(/\s+/g,'').toUpperCase();
   if(!/^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/.test(code))return false;
   if(state.postcodeLookup.has(code)||seen.has(code))return false;
   seen.add(code);return true;
  });
  // Modest concurrency to avoid hammering the public service.
  let next=0;
  async function worker(){
   while(next<waiting.length){
    const s=waiting[next++],code=s.postcode.replace(/\s+/g,'').toUpperCase();
    if(state.postcodeLookup.has(code))continue;
    try{
     const response=await fetch('https://api.postcodes.io/postcodes/'+encodeURIComponent(code),{cache:'force-cache'});
     if(!response.ok)continue;
     const json=await response.json(),lat=num(json.result?.latitude),lon=num(json.result?.longitude);
     if(json.status===200&&lat!==null&&lon!==null&&Math.abs(lat)<=90&&Math.abs(lon)<=180){
      state.postcodeLookup.set(code,{latitude:lat,longitude:lon});
      rebuildEstateLocations();
     }
    }catch(_){/* Unavailable postcodes remain absent, never replaced with invented points. */}
   }
  }
  await Promise.all(Array.from({length:Math.min(3,waiting.length)},worker));
 }finally{state.resolvingPostcodes=false;rebuildEstateLocations()}
}
function receiveEstates(rows){
 state.estateLoaded=true;
 state.estateRaw=(Array.isArray(rows)?rows:[]).map(r=>({
  id:String(r.id??''),name:String(r.name??'Unnamed').slice(0,110),
  postcode:String(r.postcode||'').trim().toUpperCase(),
  active:r.active??'',type:String(r.type||''),region:String(r.region||''),client:String(r.client||''),
  latitude:r.latitude,longitude:r.longitude
 })).filter(r=>r.id);
 refreshFilterChoices();
 rebuildEstateLocations();
 resolvePostcodes();
 if($('layerAircraft').checked)refreshAircraft();
}
function receiveGps(rows){
 scanCache=null;
 state.gpsLoaded=true;
 state.gps=(Array.isArray(rows)?rows:[]).map(r=>({site:String(r.site||''),type:r.type==='gps'?'gps':'checkpoint',event:String(r.event||'Checkpoint'),lat:num(r.lat),lon:num(r.lon),ms:num(r.ms),shift:String(r.shift||'')})).filter(r=>r.lat!==null&&r.lon!==null&&r.ms!==null&&Math.abs(r.lat)<=90&&Math.abs(r.lon)<=180);
 rebuildEstateLocations();
 resolvePostcodes();
 window.geoCheckpointReplay?.refresh();
}
async function refreshEarthquakes(){
 if(!$('layerQuakes').checked)return;
 state.feedStatus.quakes='Loading';status();
 try{
  // Same USGS source as God's Eye View's src/layers/earthquakes/source.js.
  const response=await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',{cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const obj=await response.json();
  if(!Array.isArray(obj.features))throw Error('Unexpected response');
  state.quakes=obj.features.map(f=>({lat:num(f.geometry?.coordinates?.[1]),lon:num(f.geometry?.coordinates?.[0]),depth:num(f.geometry?.coordinates?.[2])??0,mag:num(f.properties?.mag),place:String(f.properties?.place||'Unknown'),ms:num(f.properties?.time)})).filter(q=>q.lat!==null&&q.lon!==null&&q.mag!==null&&q.ms!==null&&Math.abs(q.lat)<=90&&Math.abs(q.lon)<=180).slice(0,500);
  state.feedStatus.quakes=state.quakes.length+' events / 24h';
 }catch(err){state.quakes=[];state.feedStatus.quakes='Unavailable: '+err.message}
 draw();
}
async function refreshEonet(){
 if(!$('layerEonet').checked)return;
 state.feedStatus.eonet='Loading';status();
 try{
  // NASA EONET is catalogued by God's Eye View among its browser-direct open data sources.
  const response=await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=250',{cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const obj=await response.json();
  if(!Array.isArray(obj.events))throw Error('Unexpected response');
  state.eonet=obj.events.map(event=>{
   const g=event.geometry?.at(-1);const coords=g?.coordinates;
   if(g?.type!=='Point'||!Array.isArray(coords))return null;
   return {lat:num(coords[1]),lon:num(coords[0]),title:String(event.title||'Natural event'),category:String(event.categories?.[0]?.title||'Natural event')};
  }).filter(e=>e&&e.lat!==null&&e.lon!==null&&Math.abs(e.lat)<=90&&Math.abs(e.lon)<=180);
  state.feedStatus.eonet=state.eonet.length+' located open events';
 }catch(err){state.eonet=[];state.feedStatus.eonet='Unavailable: '+err.message}
 draw();
}
// Reuses Securit-UAS/Radar: Cloudflare Worker /point with Airplanes.live ADS-B fields.
// Opt-in, 30 second refresh, no fallback aircraft or direct provider bypass.
const RADAR_WORKER='https://raspy-breeze-3e34.j-wilkinson.workers.dev';
const RADAR_SEARCH_KM=100;
const RADAR_STALE_SEC=30;
const RADAR_ALT_CEILING_FT=30000;
function radarCentre(){
 const selected=state.sites.find(s=>s.id===state.selected);
 // Use the selected estate, otherwise the original Radar head-office centre.
 return selected?{lat:selected.latitude,lon:selected.longitude}:{lat:53.10643205468523,lon:-1.3190169903418059};
}
async function refreshAircraft(){
 if(!$('layerAircraft').checked)return;
 if(state.aircraftLoading)return;
 state.aircraftLoading=true;
 const request=++state.aircraftRequest;
 state.feedStatus.aircraft='Loading';status();
 try{
  const centre=radarCentre(),radiusNm=(RADAR_SEARCH_KM/1.852).toFixed(2);
  const url=RADAR_WORKER+'/point?lat='+encodeURIComponent(centre.lat)+'&lon='+encodeURIComponent(centre.lon)+'&radiusNm='+encodeURIComponent(radiusNm);
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw Error('Radar Worker HTTP '+response.status);
  const payload=await response.json();
  if(!Array.isArray(payload.ac))throw Error('Unexpected Radar response');
  if(!$('layerAircraft').checked||request!==state.aircraftRequest)return;
  state.aircraft=payload.ac.map(r=>{
   const lat=num(r.lat),lon=num(r.lon),alt=num(r.alt_baro)??num(r.alt_geom),seen=num(r.seen_pos);
   if(lat===null||lon===null||Math.abs(lat)>90||Math.abs(lon)>180||!r.hex||alt!==null&&alt>RADAR_ALT_CEILING_FT||seen!==null&&seen>RADAR_STALE_SEC)return null;
   return {lat,lon,hex:String(r.hex),flight:String(r.flight||'').trim(),altFt:alt,speed:num(r.gs),heading:num(r.true_heading)??num(r.track),seen};
  }).filter(Boolean);
  state.feedStatus.aircraft=state.aircraft.length+' reports · '+new Date().toLocaleTimeString('en-GB',{hour12:false});
 }catch(error){
  if(request===state.aircraftRequest){state.aircraft=[];state.feedStatus.aircraft='Unavailable: '+error.message}
 }finally{state.aircraftLoading=false;draw()}
}
function init(){
 if(typeof Cesium==='undefined'){$('loading').textContent='Cesium did not load. Check browser/network restrictions.';return}
 try{
  Cesium.Ion.defaultAccessToken=undefined;
  const imagery= new Cesium.UrlTemplateImageryProvider({url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',credit:'© OpenStreetMap contributors',maximumLevel:18});
  state.viewer=new Cesium.Viewer('map',{mapMode2D:Cesium.MapMode2D.ROTATE,baseLayer:new Cesium.ImageryLayer(imagery),terrainProvider:new Cesium.EllipsoidTerrainProvider(),animation:false,timeline:false,baseLayerPicker:false,geocoder:false,homeButton:false,sceneModePicker:false,navigationHelpButton:false,infoBox:false,selectionIndicator:true,requestRenderMode:true,maximumRenderTimeChange:Infinity});
  state.viewer.camera.setView({destination:ukView()});
  state.viewer.selectedEntityChanged.addEventListener(entity=>{const raw=String(entity?.id||'');if(!raw.startsWith('talos-estate-'))return;const id=raw.slice(13);const site=state.sites.find(s=>s.id===id);if(site&&site.id!==state.selected)chooseSite(site)});
  $('loading').hidden=true;
  ['layerSites','layerCheckpoints','layerPatrols','layerQuakes','layerEonet','layerAircraft'].forEach(id=>$(id).addEventListener('change',()=>{
   if((id==='layerCheckpoints'||id==='layerPatrols')&&$(id).checked&&!state.selected){
    $(id).checked=false;
    $('replayCount').textContent='Select an estate first to display its historical checkpoint or GPS overlays.';
    return;
   }

   draw();if(id==='layerQuakes'&&$(id).checked)refreshEarthquakes();if(id==='layerEonet'&&$(id).checked)refreshEonet();if(id==='layerAircraft'){if($(id).checked)refreshAircraft();else{state.aircraftRequest++;state.aircraft=[];state.feedStatus.aircraft='Off';draw()}}
  }));
  for(const id of filterIds)$(id).addEventListener(id==='geoSearch'?'input':'change',refreshFilters);
  $('geoClearFilters').onclick=()=>{for(const id of filterIds)$(id).value='';$('geoStatus').value='active';refreshFilters()};
  $('home').onclick=home;
  $('resetUK2D').onclick=resetUK2D;
  $('zoomIn').onclick=()=>zoomMap(true);
  $('zoomOut').onclick=()=>zoomMap(false);
  $('rotateLeft').onclick=()=>rotateMap(true);
  $('rotateRight').onclick=()=>rotateMap(false);
  $('toggle3D').onclick=toggleMapMode;
  updateModeButton();
  $('refreshFeeds').onclick=()=>{refreshEarthquakes();refreshEonet();refreshAircraft()};
  renderSites();currentSitePanel();draw();
  window.parent.postMessage({talosGeoReady:true},location.origin);
  // Public-source refreshes only while enabled; never fabricate unavailable points.
  setInterval(()=>{if(document.visibilityState==='visible'){if($('layerQuakes').checked)refreshEarthquakes();if($('layerEonet').checked)refreshEonet()}},300000);
  setInterval(()=>{if(document.visibilityState==='visible'&&$('layerAircraft').checked)refreshAircraft()},30000);
 }catch(error){$('loading').textContent='Map failed: '+error.message}
}
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==window.parent)return;
 const data=event.data||{};
 if(data.talosTheme)document.body.classList.remove('light');
 if(Array.isArray(data.talosGeoSites))receiveEstates(data.talosGeoSites);
 if(Array.isArray(data.talosGeoCheckpoints))receiveGps(data.talosGeoCheckpoints);
});
init();
