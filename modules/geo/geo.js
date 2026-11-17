'use strict';
// TALOS Geo Intelligence: read-only TALOS overlays + selected original God's Eye public feed sources.
// No sample coordinates, sample incidents or simulated patrols.
const $ = id => document.getElementById(id);
const num = value => value !== null && value !== undefined && String(value).trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
const norm = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const state = {viewer:null,sites:[],estateLoaded:false,gpsLoaded:false,gps:[],selected:null,quakes:[],eonet:[],feedStatus:{quakes:'Off',eonet:'Off'},lastFeedRefresh:0};
const entities = {sites:[],checkpoints:[],patrols:[],quakes:[],eonet:[]};
const ukView = () => Cesium.Cartesian3.fromDegrees(-2.65,54.1,1450000);
const at = (lat,lon) => Cesium.Cartesian3.fromDegrees(lon,lat);
const safe = text => String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clear(key){for(const entity of entities[key])state.viewer.entities.remove(entity);entities[key]=[]}
function add(key,definition){entities[key].push(state.viewer.entities.add(definition))}
function status(){
 $('summary').textContent = [
  state.estateLoaded?state.sites.length+' mapped TALOS estates':'Loading TALOS estate records…',
  state.gpsLoaded?state.gps.length+' attributed historical GPS/checkpoint records':'Loading GPS/checkpoint records…'
 ].join(' · ');
 $('feedStatus').textContent='USGS earthquakes: '+state.feedStatus.quakes+' | NASA EONET: '+state.feedStatus.eonet;
}
function renderSites(){
 const host=$('sites');host.replaceChildren();
 if(!state.estateLoaded){host.textContent='Waiting for Estate Manager list…';return}
 if(!state.sites.length){host.textContent='No estates with usable coordinates. Check the Estate Manager Latitude/Longitude fields.';return}
 const all=document.createElement('button');all.type='button';all.textContent='All mapped estates';all.className=!state.selected?'active':'';all.onclick=()=>{state.selected=null;draw();renderSites();home()};host.appendChild(all);
 for(const site of state.sites){const button=document.createElement('button');button.type='button';button.textContent=site.name;button.className=state.selected===site.id?'active':'';button.onclick=()=>{state.selected=site.id;draw();renderSites();state.viewer.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(site.longitude,site.latitude,8000),duration:1.1})};host.appendChild(button)}
}
function draw(){
 if(!state.viewer)return;
 Object.keys(entities).forEach(clear);
 const {sites,gps,selected}=state;
 if($('layerSites').checked)for(const s of sites)add('sites',{name:s.name,position:at(s.latitude,s.longitude),point:{pixelSize:10,color:Cesium.Color.DODGERBLUE,outlineColor:Cesium.Color.WHITE,outlineWidth:2},label:{text:s.name,font:'12px sans-serif',fillColor:Cesium.Color.WHITE,showBackground:true,backgroundColor:Cesium.Color.fromCssColorString('#112b40').withAlpha(.85),pixelOffset:new Cesium.Cartesian2(0,-22),distanceDisplayCondition:new Cesium.DistanceDisplayCondition(0,170000)},description:'TALOS estate record. Coordinates provided by Estate Manager.'});
 const focus=sites.find(s=>s.id===selected);
 const relevant=focus?gps.filter(r=>norm(r.site)===norm(focus.name)):gps;
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
 if($('layerQuakes').checked)for(const q of state.quakes)add('quakes',{name:'USGS earthquake M'+q.mag,position:at(q.lat,q.lon),point:{pixelSize:Math.max(5,Math.min(17,q.mag*2.8)),color:Cesium.Color.fromCssColorString(q.depth<70?'#f26d5b':q.depth<300?'#e6a448':'#daca5c'),outlineColor:Cesium.Color.WHITE,outlineWidth:1},description:'USGS earthquake: M'+q.mag+' · '+safe(q.place)+' · '+new Date(q.ms).toLocaleString('en-GB')+' · depth '+q.depth+' km. Source: USGS.'});
 if($('layerEonet').checked)for(const e of state.eonet)add('eonet',{name:e.title,position:at(e.lat,e.lon),point:{pixelSize:9,color:Cesium.Color.MAGENTA,outlineColor:Cesium.Color.WHITE,outlineWidth:1},description:'NASA EONET natural event · '+safe(e.category)+' · '+safe(e.title)+'. Source: NASA EONET.'});
 status();
}
function home(){state.viewer?.camera.flyTo({destination:ukView(),duration:1.2})}
function receiveEstates(rows){
 state.estateLoaded=true;
 state.sites=(Array.isArray(rows)?rows:[]).map(r=>({id:String(r.id??''),name:String(r.name??'Unnamed').slice(0,110),latitude:num(r.latitude),longitude:num(r.longitude)})).filter(r=>r.id&&r.latitude!==null&&r.longitude!==null&&Math.abs(r.latitude)<=90&&Math.abs(r.longitude)<=180);
 if(state.selected&&!state.sites.some(r=>r.id===state.selected))state.selected=null;
 renderSites();draw();
}
function receiveGps(rows){
 state.gpsLoaded=true;
 state.gps=(Array.isArray(rows)?rows:[]).map(r=>({site:String(r.site||''),type:r.type==='gps'?'gps':'checkpoint',event:String(r.event||'Checkpoint'),lat:num(r.lat),lon:num(r.lon),ms:num(r.ms),shift:String(r.shift||'')})).filter(r=>r.lat!==null&&r.lon!==null&&r.ms!==null&&Math.abs(r.lat)<=90&&Math.abs(r.lon)<=180);
 draw();
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
function init(){
 if(typeof Cesium==='undefined'){$('loading').textContent='Cesium did not load. Check browser/network restrictions.';return}
 try{
  Cesium.Ion.defaultAccessToken=undefined;
  const imagery= new Cesium.UrlTemplateImageryProvider({url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',credit:'© OpenStreetMap contributors',maximumLevel:18});
  state.viewer=new Cesium.Viewer('map',{baseLayer:new Cesium.ImageryLayer(imagery),terrainProvider:new Cesium.EllipsoidTerrainProvider(),animation:false,timeline:false,baseLayerPicker:false,geocoder:false,homeButton:false,sceneModePicker:false,navigationHelpButton:false,infoBox:true,selectionIndicator:true,requestRenderMode:true,maximumRenderTimeChange:Infinity});
  state.viewer.camera.setView({destination:ukView()});
  $('loading').hidden=true;
  ['layerSites','layerCheckpoints','layerPatrols','layerQuakes','layerEonet'].forEach(id=>$(id).addEventListener('change',()=>{
   draw();if(id==='layerQuakes'&&$(id).checked)refreshEarthquakes();if(id==='layerEonet'&&$(id).checked)refreshEonet();
  }));
  $('home').onclick=home;
  $('refreshFeeds').onclick=()=>{refreshEarthquakes();refreshEonet()};
  renderSites();draw();
  window.parent.postMessage({talosGeoReady:true},location.origin);
  // Public-source refreshes only while enabled; never fabricate unavailable points.
  setInterval(()=>{if(document.visibilityState==='visible'){if($('layerQuakes').checked)refreshEarthquakes();if($('layerEonet').checked)refreshEonet()}},300000);
 }catch(error){$('loading').textContent='Map failed: '+error.message}
}
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==window.parent)return;
 const data=event.data||{};
 if(data.talosTheme)document.body.classList.toggle('light',data.talosTheme==='light');
 if(Array.isArray(data.talosGeoSites))receiveEstates(data.talosGeoSites);
 if(Array.isArray(data.talosGeoCheckpoints))receiveGps(data.talosGeoCheckpoints);
});
init();
