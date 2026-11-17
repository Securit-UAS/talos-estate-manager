'use strict';
// TALOS Geo Intelligence proof-of-concept. Never connects to C247 or writes site records.
const $=id=>document.getElementById(id);
let sites=[],viewer=null,focused=null,gpsRecords=[],gpsReceived=false,estateReceived=false;
const layers={sites:[],checkpoints:[],patrols:[]};
const numeric=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&Number.isFinite(Number(v))?Number(v):null;
function cleanSites(input){
 if(!Array.isArray(input))return[];
 return input.slice(0,2000).map(s=>({id:String(s.id??''),name:String(s.name??'Unnamed site').slice(0,100),latitude:numeric(s.latitude),longitude:numeric(s.longitude),source:'talos'}))
 .filter(s=>s.id&&s.latitude!==null&&s.longitude!==null&&Math.abs(s.latitude)<=90&&Math.abs(s.longitude)<=180);
}
function point(lat,lon){return Cesium.Cartesian3.fromDegrees(lon,lat)}
function clearLayer(key){for(const entity of layers[key])viewer.entities.remove(entity);layers[key]=[]}
function put(key,entity){layers[key].push(viewer.entities.add(entity))}
function draw(){
 if(!viewer)return;
 for(const k of Object.keys(layers))clearLayer(k);
 const drawSites=$('layerSites').checked,drawPoints=$('layerCheckpoints').checked,drawPatrols=$('layerPatrols').checked;
 if(drawSites)for(const s of sites)put('sites',{name:s.name,position:point(s.latitude,s.longitude),point:{pixelSize:12,color:Cesium.Color.DODGERBLUE,outlineColor:Cesium.Color.WHITE,outlineWidth:2},label:{text:s.name,font:'12px sans-serif',fillColor:Cesium.Color.WHITE,outlineColor:Cesium.Color.BLACK,outlineWidth:3,style:Cesium.LabelStyle.FILL_AND_OUTLINE,pixelOffset:new Cesium.Cartesian2(0,-22),distanceDisplayCondition:new Cesium.DistanceDisplayCondition(0,1500000)},description:'TALOS Estate site ('+s.source+').'});
 const base=sites.find(s=>String(s.id)===String(focused))||sites[0];
 if(gpsReceived){
  const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const matched=focused&&base?gpsRecords.filter(r=>norm(r.site)===norm(base.name)):gpsRecords;
  const recent=matched.filter(r=>Number.isFinite(r.lat)&&Number.isFinite(r.lon)).sort((a,b)=>a.ms-b.ms).slice(-4000);
  const unique=new Map();
  recent.filter(r=>r.type==='checkpoint').forEach(r=>{const key=norm(r.site)+'|'+norm(r.event);const old=unique.get(key);if(!old||r.ms>old.ms)unique.set(key,r)});
  if(drawPoints)for(const r of [...unique.values()].slice(0,900))put('checkpoints',{name:r.event+' · '+r.site,position:point(r.lat,r.lon),point:{pixelSize:7,color:Cesium.Color.CYAN,outlineColor:Cesium.Color.BLACK,outlineWidth:1},description:'Latest recorded checkpoint scan position. This is not a surveyed checkpoint location.'});
  if(drawPatrols){
   const grouped=new Map();
   for(const r of recent.filter(r=>r.type==='gps')){const key=r.site+'|'+r.shift;if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(r)}
   for(const group of [...grouped.values()].slice(-15)){const sorted=group.sort((a,b)=>a.ms-b.ms);if(sorted.length>1)put('patrols',{name:'Historical GPS trace · '+sorted[0].site,polyline:{positions:sorted.slice(-700).map(r=>point(r.lat,r.lon)),width:2,material:Cesium.Color.ORANGE},description:'Historical recorded GPS data, not a live position.'})}
  }
  $('summary').textContent=sites.length+' TALOS estate sites with coordinates · '+unique.size+' distinct checkpoint scan locations · '+recent.length+' historical records in scope';
  return;
 }
 const statusParts=[sites.length+' estate sites with coordinates'];
 if(!estateReceived)statusParts.push('estate data pending');
 if(!gpsReceived)statusParts.push('GPS/checkpoint data pending');
 else statusParts.push(gpsRecords.length+' attributed GPS/checkpoint records');
 $('summary').textContent=statusParts.join(' · ');

}
function focusSite(s){focused=s.id;viewer.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(s.longitude,s.latitude,5500),duration:1.4});draw();renderSites()}
function renderSites(){
 const host=$('sites');host.replaceChildren();
 sites.slice(0,120).forEach(s=>{const b=document.createElement('button');b.type='button';b.textContent=s.name;b.className=String(focused)===String(s.id)?'active':'';b.onclick=()=>focusSite(s);host.appendChild(b)});
}
function updateSiteData(data){
 const valid=cleanSites(data);
 sites=valid;estateReceived=true;
 focused=null;renderSites();draw();
 $('status').textContent=valid.length?'Estate coordinates received from TALOS · checkpoint data loads from existing GPS module':'No estate locations with valid coordinates returned by TALOS';
}
function init(){
 if(typeof Cesium==='undefined'){ $('loading').textContent='Cesium script unavailable. Check internet access / CSP settings.';return }
 try{
  viewer=new Cesium.Viewer('map',{baseLayer:new Cesium.ImageryLayer(new Cesium.OpenStreetMapImageryProvider({url:'https://tile.openstreetmap.org/'})),terrainProvider:new Cesium.EllipsoidTerrainProvider(),animation:false,timeline:false,baseLayerPicker:false,geocoder:false,homeButton:false,sceneModePicker:true,navigationHelpButton:false,infoBox:true,selectionIndicator:true});
  viewer.camera.setView({destination:Cesium.Cartesian3.fromDegrees(-2.0,54.2,1100000)});
  $('loading').hidden=true;renderSites();draw();
  ['layerSites','layerCheckpoints','layerPatrols'].forEach(id=>$(id).addEventListener('change',draw));
  $('home').onclick=()=>viewer.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(-2,54.2,1100000)});
  window.parent.postMessage({talosGeoReady:true},location.origin);
 }catch(e){$('loading').textContent='Globe could not initialise: '+e.message}
}
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==window.parent)return;
 const d=event.data||{};
 if(d.talosTheme)document.body.classList.toggle('light',d.talosTheme==='light');
 if(d.talosGeoSites)updateSiteData(d.talosGeoSites);
 if(Array.isArray(d.talosGeoCheckpoints)){
  gpsReceived=true;
  gpsRecords=d.talosGeoCheckpoints.slice(0,25000).map(r=>({site:String(r.site||''),type:r.type==='gps'?'gps':'checkpoint',event:String(r.event||'Checkpoint'),lat:numeric(r.lat),lon:numeric(r.lon),ms:Number(r.ms)||0,shift:String(r.shift||'')})).filter(r=>r.lat!==null&&r.lon!==null&&Math.abs(r.lat)<=90&&Math.abs(r.lon)<=180);
  $('status').textContent=gpsRecords.length?'Checkpoint data loaded from existing TALOS GPS module · historical, not live':'No checkpoint records available from existing TALOS GPS module';
  draw();
 }
});
init();
