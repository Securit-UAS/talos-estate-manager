'use strict';
// TALOS Shift Handovers V2.0.20 — read-only; uses an authorised Power Automate read endpoint.
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=x=>String(x??'').trim();
const lower=x=>text(x).toLowerCase();
const f=(r,n)=>r?.['field_'+n]??r?.['Field_'+n]??'';
let records=[],context=null,loading=false;
function stamp(x){if(!x)return '—';const d=new Date(x);return Number.isFinite(d.valueOf())?new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Europe/London'}).format(d):text(x)}
function handover(r){
 const status=lower(f(r,25)), recipient=lower(f(r,9)||f(r,10)),received=lower(f(r,33));
 if(status.includes('no recipient')||recipient==='no one'||recipient==='nobody')return {key:'review',css:'warn',label:status.includes('acknowledged')?'No recipient · acknowledged':'No recipient · review'};
 if(status.includes('exception')||status.includes('failed')||status.includes('not received')||(received==='no'&&text(f(r,32))))return {key:'exception',css:'bad',label:'Handover exception'};
 if(status.includes('await')||status.includes('pending'))return {key:'awaiting',css:'bad',label:'Awaiting handover'};
 if((status.includes('confirmed')&&(lower(f(r,26))==='yes'||lower(f(r,27))==='yes'))||(lower(f(r,26))==='yes'&&received==='yes')||lower(f(r,27))==='yes')return {key:'confirmed',css:'good',label:'Confirmed'};
 return {key:'awaiting',css:'bad',label:'Not confirmed'};
}
function gpsIndividual(status,lat,lon){
 const s=lower(status);
 if(/outside|off.site|out.of.range|failed|critical/.test(s))return {key:'offsite',css:'bad',label:'Outside range'};
 if(/review|warn|uncertain|borderline/.test(s))return {key:'review',css:'warn',label:'Review'};
 if(/within|in.range|inside|^ok$|^good$|^pass$|valid/.test(s))return {key:'good',css:'good',label:'Within range'};
 if(/missing|not.capture|no.gps|no.location|unavailable/.test(s))return {key:'missing',css:'missing',label:'No GPS'};
 if(text(lat)&&text(lon))return {key:'review',css:'warn',label:'Unassessed GPS'};
 return {key:'missing',css:'missing',label:'No GPS'};
}
function gps(r){
 const stages=[[23,21,22],[52,50,51],[56,54,55]];
 const present=stages.filter(([s,a,b])=>text(f(r,s))||text(f(r,a))||text(f(r,b)));
 if(!present.length)return {key:'missing',css:'missing',label:'No GPS'};
 const items=present.map(([s,a,b])=>gpsIndividual(f(r,s),f(r,a),f(r,b)));
 if(items.some(x=>x.key==='offsite'))return {key:'offsite',css:'bad',label:'Outside range'};
 if(items.some(x=>x.key==='review'))return {key:'review',css:'warn',label:'GPS review'};
 if(items.some(x=>x.key==='missing'))return {key:'review',css:'warn',label:'Partial GPS'};
 return {key:'good',css:'good',label:'Within range'};
}
function state(s){return `<span class="state ${esc(s.css)}"><i class="dot" aria-hidden="true"></i>${esc(s.label)}</span>`}
function rowsFrom(result){
 if(Array.isArray(result))return result;
 if(Array.isArray(result?.records))return result.records;
 if(Array.isArray(result?.value))return result.value;
 if(Array.isArray(result?.body))return result.body;
 if(Array.isArray(result?.body?.value))return result.body.value;
 if(Array.isArray(result?.data?.value))return result.data.value;
 throw Error('Unexpected handover API response. Expected an array, records, or value.');
}
function notice(message,error=false){$('notice').textContent=message;$('notice').classList.toggle('error',error)}
function stat(id,n){$(id).textContent=String(n)}
function render(){
 const query=lower($('search').value),h=$('handoverFilter').value,g=$('gpsFilter').value;
 const found=records.filter(r=>(!h||handover(r).key===h)&&(!g||gps(r).key===g)&&(!query||[f(r,1),f(r,2),f(r,5),f(r,9),f(r,11),f(r,29),f(r,34),f(r,25)].some(x=>lower(x).includes(query))));
 $('resultsCount').textContent=`${found.length} shown of ${records.length}`;
 const tb=$('rows');
 if(!found.length){tb.innerHTML='<tr><td colspan="9" class="empty">'+(records.length?'No records match the filters.':'No handover records returned.')+'</td></tr>';return;}
 tb.innerHTML=found.map(r=>{
  const hs=handover(r),gs=gps(r),ref=text(f(r,1))||text(r.Title)||String(r.ID??''),key=String(r.ID??ref);
  return `<tr><td>${esc(stamp(f(r,6)||f(r,4)))}</td><td><strong>${esc(f(r,2)||'Site not recorded')}</strong><small>Ref ${esc(ref)}</small></td><td>${esc(f(r,5)||'—')}</td><td>${esc(f(r,9)||f(r,10)||'—')}<small>${esc(f(r,11)||'')}</small></td><td>${state(hs)}<small>${esc(f(r,25)||'')}</small></td><td>${state(gs)}</td><td>${esc(f(r,29)||'—')}</td><td>${esc(stamp(f(r,63)))}</td><td><button type="button" class="open" data-id="${esc(key)}">View →</button></td></tr>`;
 }).join('');
}
const sections=[
 ['Outgoing declaration',[[1,'Handover reference'],[2,'Site'],[3,'Postcode'],[4,'Shift end date'],[5,'Outgoing officer'],[6,'Shift finish'],[7,'Submitted at'],[8,'Outgoing submission ID'],[9,'Recipient type'],[10,'Handover to'],[11,'Recipient recorded'],[12,'Verbal handover completed'],[13,'No handover reason']]],
 ['Outgoing observations',[[14,'Ongoing issues'],[15,'Issue details'],[16,'Instruction changes'],[17,'Instruction details'],[18,'Maintenance issues'],[19,'Maintenance details'],[20,'Handover instructions']]],
 ['Incoming officer confirmation',[[25,'Handover status'],[26,'Officer confirmed'],[29,'Incoming officer'],[30,'Incoming shift start'],[31,'Incoming submitted at'],[32,'Incoming submission ID'],[33,'Handover received'],[34,'Handover provider'],[35,'Information received'],[36,'No handover reason'],[37,'ARC / Ops informed'],[38,'Aware of issues'],[39,'Issue details'],[40,'Discrepancies'],[41,'Discrepancy details'],[42,'Initial patrol'],[43,'Patrol notes']]],
 ['Client / management',[[27,'Client confirmed'],[28,'Management acknowledged'],[44,'Client representative'],[45,'Client handover completed'],[46,'Client aware of issues'],[47,'Client comments'],[48,'Client submitted at'],[58,'Management acknowledged by'],[59,'Management acknowledged at']]],
 ['GPS evidence',[[23,'Outgoing GPS status'],[24,'Outgoing distance (m)'],[21,'Outgoing latitude'],[22,'Outgoing longitude'],[52,'Incoming GPS status'],[53,'Incoming distance (m)'],[50,'Incoming latitude'],[51,'Incoming longitude'],[56,'Client GPS status'],[57,'Client distance (m)'],[54,'Client latitude'],[55,'Client longitude']]],
 ['Audit / exceptions',[[61,'Exception flag'],[62,'Exception reason'],[63,'Last updated at']]]
];
const dateFields=new Set([6,7,30,31,48,59,63]);
function openDetail(id){
 const r=records.find(x=>String(x.ID??(text(f(x,1))||x.Title))===id);if(!r)return;
 $('detailPanel').hidden=false;$('detailTitle').textContent=text(f(r,2))||'Handover record';$('detailSubtitle').textContent='Reference '+text(f(r,1))+' · '+text(f(r,25));
 $('detailBody').innerHTML='<div class="detailgrid">'+sections.map(([name,fields])=>'<section class="detailgroup"><h3>'+esc(name)+'</h3>'+fields.map(([n,label])=>'<div class="detailfield"><span>'+esc(label)+'</span><b>'+esc(dateFields.has(n)?stamp(f(r,n)):text(f(r,n))||'—')+'</b></div>').join('')+'</section>').join('')+'</div>';
 $('detailPanel').scrollIntoView({behavior:'smooth',block:'start'});
}
function updateStats(){
 stat('statTotal',records.length);stat('statAwaiting',records.filter(r=>handover(r).key==='awaiting').length);stat('statConfirmed',records.filter(r=>handover(r).key==='confirmed').length);stat('statReview',records.filter(r=>handover(r).key==='review').length);stat('statOffsite',records.filter(r=>gps(r).key==='offsite').length);
}
async function load(){
 if(loading)return;
 if(!context?.apiRead){$('sourceStatus').textContent='API not configured';$('sourceStatus').className='source error';notice('The page is ready, but the SharePoint handover read flow is not connected. Configure api.handoverRead in config.js to display real records.',true);$('rows').innerHTML='<tr><td colspan="9" class="empty">Handover API not configured — no records loaded.</td></tr>';return;}
 loading=true;$('reload').disabled=true;$('sourceStatus').textContent='Loading…';$('sourceStatus').className='source';notice('Loading the latest SharePoint handover records…');
 try{
  const res=await fetch(context.apiRead,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:context.email,token:context.token,action:'listHandovers'})});
  if(!res.ok)throw Error('Read API returned HTTP '+res.status);
  const data=await res.json();if(data?.success===false)throw Error(text(data.message||data.error?.message)||'Read API reported failure');
  records=rowsFrom(data);records.sort((a,b)=>new Date(f(b,7)||b.Created||0)-new Date(f(a,7)||a.Created||0));
  updateStats();render();$('sourceStatus').textContent=records.length+' records';$('sourceStatus').className='source ok';
  notice(`Loaded ${records.length} handover records from the configured TALOS read endpoint. Indicators reflect the fields currently stored in SharePoint.`);
 }catch(err){records=[];updateStats();render();$('sourceStatus').textContent='Read failed';$('sourceStatus').className='source error';notice('Unable to load handovers: '+err.message,true)}finally{loading=false;$('reload').disabled=false;}
}
['search','handoverFilter','gpsFilter'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',render));
$('reload').addEventListener('click',load);
$('rows').addEventListener('click',e=>{const btn=e.target.closest('button[data-id]');if(btn)openDetail(btn.dataset.id)});
$('closeDetail').addEventListener('click',()=>{$('detailPanel').hidden=true});
window.addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.data?.talosTheme)document.body.dataset.theme=e.data.talosTheme;if(e.source===window.parent&&e.data?.talosHandoversContext){context=e.data.talosHandoversContext;load();}});
window.parent.postMessage({talosHandoversRequestContext:true},location.origin);
