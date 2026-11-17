'use strict';
// TALOS Geo Intelligence proof-of-concept. Never connects to C247 or writes site records.
const $=id=>document.getElementById(id);
const mockSites=[
{id:'demo-1',name:'Demo logistics estate · Midlands',latitude:52.7584,longitude:-1.4718,source:'mock'},
{id:'demo-2',name:'Demo industrial site · Yorkshire',latitude:53.6912,longitude:-1.4203,source:'mock'},
{id:'demo-3',name:'Demo retail estate · Bristol',latitude:51.4545,longitude:-2.5879,source:'mock'}];
let sites=mockSites.slice(),viewer=null,focused=null;
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
 if(base){
  // Synthetic offsets; not surveyed coordinates and never sent to an API.
  const c=[[.0018,-.0021],[-.0012,-.0016],[.0011,.0014],[-.0016,.0018]];
  if(drawPoints)c.forEach((p,i)=>put('checkpoints',{name:'DEMO checkpoint '+(i+1),position:point(base.latitude+p[0],base.longitude+p[1]),point:{pixelSize:9,color:Cesium.Color.CYAN,outlineColor:Cesium.Color.BLACK,outlineWidth:1},description:'Simulated checkpoint. Not linked to C247.'}));
  if(drawPatrols)put('patrols',{name:'Simulated patrol route',polyline:{positions:c.map(p=>point(base.latitude+p[0],base.longitude+p[1])),width:4,material:Cesium.Color.ORANGE},description:'Illustrative synthetic patrol path.'});
 }
 $('summary').textContent=sites.length+' mapped sites · '+(drawPoints&&base?'4 demo checkpoints':'0 checkpoints')+' · '+(drawPatrols&&base?'1 demo route':'0 routes');
}
function focusSite(s){focused=s.id;viewer.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(s.longitude,s.latitude,5500),duration:1.4});draw();renderSites()}
function renderSites(){
 const host=$('sites');host.replaceChildren();
 sites.slice(0,120).forEach(s=>{const b=document.createElement('button');b.type='button';b.textContent=s.name;b.className=String(focused)===String(s.id)?'active':'';b.onclick=()=>focusSite(s);host.appendChild(b)});
}
function updateSiteData(data){
 const valid=cleanSites(data);
 sites=valid.length?valid:mockSites.slice();
 focused=null;renderSites();draw();
 $('status').textContent=valid.length?'Estate coordinates received from TALOS · checkpoints and patrols remain simulated':'Using wholly simulated estate data (no valid TALOS coordinates available)';
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
});
init();
