'use strict';
(function(){
const get=id=>document.getElementById(id);
const p={rows:[],fraction:0,running:false,handle:0,last:0,points:[]};
function clear(){if(!state.viewer)return;for(const point of p.points)state.viewer.entities.remove(point);p.points=[]}
function draw(){
 clear();
 if(!p.rows.length){get('replayClock').textContent='No shift selected';return}
 const begin=p.rows[0].ms,end=p.rows[p.rows.length-1].ms;
 const t=begin+(end-begin)*p.fraction;
 const rows=p.rows.filter(r=>r.ms<=t);
 get('replayClock').textContent=new Date(t).toLocaleString('en-GB')+' · '+rows.length+' / '+p.rows.length;
 if(!get('geoReplay').open||!state.viewer)return;
 if(rows.length>1){const pos=rows.map(r=>Cesium.Cartesian3.fromDegrees(r.lon,r.lat));p.points.push(state.viewer.entities.add({name:'Site shift events',polyline:{positions:pos,width:4,material:Cesium.Color.YELLOW}}))}
 const last=rows[rows.length-1];
 if(last)p.points.push(state.viewer.entities.add({name:'Current replay event',position:Cesium.Cartesian3.fromDegrees(last.lon,last.lat),point:{pixelSize:14,color:Cesium.Color.YELLOW}}));
 state.viewer.scene.requestRender();
}
function pause(){p.running=false;if(p.handle)cancelAnimationFrame(p.handle);p.handle=0;p.last=0;get('replayPlay').textContent='▶ Play'}
function seek(n){p.fraction=Math.max(0,Math.min(1,n));get('replayTimeline').value=Math.round(p.fraction*1000);draw()}
function prepare(){
 pause();const site=get('replaySite').value;const shift=get('replayDate').value+' '+get('replayShift').value;
 p.rows=state.gps.filter(r=>r.site===site&&r.shift===shift).sort((a,b)=>a.ms-b.ms);p.fraction=0;
 const ready=p.rows.length>0;
 for(const id of ['replayPlay','replayStart','replayEnd','replayTimeline'])get(id).disabled=!ready;
 get('replayCount').textContent=ready?p.rows.length+' recorded events for '+shift:'No records for this selection';draw();
}
function dates(){
 const site=get('replaySite').value,select=get('replayDate'),previous=select.value;
 const days=Array.from(new Set(state.gps.filter(r=>r.site===site).map(r=>String(r.shift).slice(0,10)).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)))).sort().reverse();
 select.replaceChildren(new Option('Choose date',''));for(const day of days)select.add(new Option(day,day));
 select.value=days.includes(previous)?previous:(days[0]||'');prepare();
}
function refresh(){
 const only=filtersApplied()?new Set(filteredSites().map(s=>String(s.name).toLowerCase().replace(/[^a-z0-9]/g,''))):null;
 const names=Array.from(new Set(state.gps.map(r=>r.site))).filter(s=>s&&(!only||only.has(String(s).toLowerCase().replace(/[^a-z0-9]/g,'')))).sort();
 const select=get('replaySite'),previous=select.value;
 select.replaceChildren(new Option('Choose site',''));for(const name of names)select.add(new Option(name,name));
 const focus=state.sites.find(s=>s.id===state.selected);
 const match=focus?names.find(x=>String(x).toLowerCase()===String(focus.name).toLowerCase()):null;
 select.value=match||(names.includes(previous)?previous:'');dates();
}
function tick(now){
 if(!p.running)return;if(!p.last)p.last=now;
 const dt=Math.min(250,now-p.last);p.last=now;
 const duration=Math.max(1,p.rows[p.rows.length-1].ms-p.rows[0].ms);
 seek(Math.min(1,p.fraction+dt*Number(get('replaySpeed').value)/duration));
 if(p.fraction>=1){pause();return}p.handle=requestAnimationFrame(tick);
}
function play(){
 if(p.running){pause();return}if(!p.rows.length)return;
 if(p.fraction>=1)seek(0);p.running=true;p.last=0;get('replayPlay').textContent='Ⅱ Pause';p.handle=requestAnimationFrame(tick);
}
get('replaySite').onchange=dates;get('replayDate').onchange=prepare;get('replayShift').onchange=prepare;
get('replayPlay').onclick=play;
get('replayStart').onclick=()=>{pause();seek(0)};
get('replayEnd').onclick=()=>{pause();seek(1)};
get('replayTimeline').oninput=()=>{pause();seek(Number(get('replayTimeline').value)/1000)};
get('geoReplay').addEventListener('toggle',()=>{if(!get('geoReplay').open)pause();draw()});
window.geoCheckpointReplay={refresh,draw,pause};
refresh();
})();