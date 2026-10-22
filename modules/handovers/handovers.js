'use strict';
// TALOS Shift Handovers V2.0.23 — read-only; uses an authorised Power Automate read endpoint.
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
// Report presentation mirrors TALOS_Shift_Handover_Email_v4.html while keeping the data read-only.
const dateFields=new Set([6,7,30,31,48,59,63]);
const details={
 outgoing:[
  [5,'Outgoing officer'],[6,'Shift finish'],[7,'Declaration submitted'],[9,'Recipient type'],[10,'Handover to'],[11,'Recipient recorded'],[12,'Verbal handover completed?'],[13,'Reason handover not completed']
 ],
 observations:[
  [14,'Ongoing issues / concerns'],[15,'Details of ongoing issues'],[16,'Instruction changes'],[17,'Instruction details'],[18,'Maintenance / equipment issues'],[19,'Maintenance details'],[20,'Handover instructions']
 ],
 incoming:[
  [29,'Incoming officer'],[30,'Shift start'],[31,'Confirmation submitted'],[33,'Handover received?'],[34,'Handover provided by'],[35,'Information passed to incoming officer'],[36,'Reason no handover was received'],[37,'ARC / Operations informed?'],[38,'Aware of outstanding issues?'],[39,'Details and instructions received'],[40,'Discrepancies identified?'],[41,'Discrepancy details / action taken'],[42,'Initial site patrol completed?'],[43,'Initial patrol notes']
 ],
 client:[
  [44,'Client representative'],[45,'Client handover completed?'],[46,'Client aware of issues?'],[47,'Client comments'],[48,'Client confirmation submitted']
 ],
 management:[
  [28,'Management acknowledged?'],[58,'Acknowledged by'],[59,'Acknowledged at']
 ],
 audit:[
  [1,'Handover reference'],[8,'Outgoing submission ID'],[32,'Incoming submission ID'],[49,'Client submission ID'],[60,'Management acknowledgement ID'],[61,'Exception flag'],[62,'Exception reason'],[63,'Last updated']
 ]
};
function value(r,n){return dateFields.has(n)?stamp(f(r,n)):text(f(r,n));}
function fieldRows(r,fields){return fields.filter(([n])=>text(f(r,n))).map(([n,label])=>`<div class="report-field"><div class="report-field-label">${esc(label)}</div><div class="report-field-value">${esc(value(r,n))}</div></div>`).join('');}
function reportSection(r,title,fields,number){const rows=fieldRows(r,fields);if(!rows)return '';return `<section class="report-section"><h3><span class="section-number">${esc(number)}</span>${esc(title)}</h3><div class="report-fields">${rows}</div></section>`;}
function distance(r,n){const raw=text(f(r,n));if(!raw)return '';const x=Number(raw);return Number.isFinite(x)?(x<1000?`${Math.round(x)} m from postcode reference`:`${(x/1000).toFixed(2)} km from postcode reference`):raw;}
function gpsMapLink(r,a,b){const lat=Number(f(r,a)),lon=Number(f(r,b));if(!text(f(r,a))||!text(f(r,b))||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return '';const q=encodeURIComponent(`${lat},${lon}`);return `<a class="gps-map" href="https://www.google.com/maps?q=${q}" target="_blank" rel="noopener noreferrer">View location on Google Maps ↗</a>`;}
function gpsCard(r,heading,nameField,statusField,distanceField,latField,lonField){
 const st=gpsIndividual(f(r,statusField),f(r,latField),f(r,lonField));
 const hasAny=text(f(r,nameField))||text(f(r,statusField))||text(f(r,latField))||text(f(r,lonField));
 if(!hasAny)return '';
 return `<div class="report-gps-card"><div class="report-field-label">${esc(heading)}</div><div class="report-gps-name">${esc(f(r,nameField)||'Not recorded')}</div><div class="report-gps-status">${state(st)}</div><div class="report-gps-distance">${esc(distance(r,distanceField)||'Distance unavailable')}</div>${gpsMapLink(r,latField,lonField)}</div>`;
}
function gpsSection(r){
 const cards=[gpsCard(r,'OUTGOING OFFICER',5,23,24,21,22),gpsCard(r,'INCOMING OFFICER',29,52,53,50,51),gpsCard(r,'CLIENT REPRESENTATIVE',44,56,57,54,55)].filter(Boolean);
 if(!cards.length)return '';
 return `<section class="report-section"><h3>GPS Location Assessment</h3><div class="report-gps-grid">${cards.join('')}</div><div class="report-gps-note">Approximate straight-line distance from the registered site postcode reference, not a surveyed site boundary. Within range: 0–250 m; review: over 250–500 m; outside range: over 500 m. A GPS warning is not proof of absence.</div></section>`;
}
let previousFocus=null;
function openDetail(id){
 const r=records.find(x=>String(x.ID??(text(f(x,1))||x.Title))===id);if(!r)return;
 previousFocus=document.activeElement;
 const hs=handover(r),gs=gps(r);
 const heading=esc(f(r,2)||'Site not recorded');
 const exception=text(f(r,62));
 $('reportSummary').textContent='Combined outgoing and incoming officer declarations · '+(text(f(r,1))||'No reference');
 $('detailBody').innerHTML=`
  <div class="report-kicker">SITE DETAILS</div>
  <h2 class="report-site">${heading}</h2>
  <div class="report-site-meta"><span><b>Registered postcode:</b> ${esc(f(r,3)||'Not recorded')}</span><span><b>Shift end:</b> ${esc(stamp(f(r,6)||f(r,4)))}</span><span><b>Incoming shift start:</b> ${esc(stamp(f(r,30)))}</span></div>
  <div class="report-status-grid"><div><span>HANDOVER STATUS</span>${state(hs)}<small>${esc(f(r,25)||'No status recorded')}</small></div><div><span>OVERALL GPS ASSESSMENT</span>${state(gs)}<small>Based on the stored TALOS location results</small></div></div>
  ${exception?`<div class="report-alert"><b>Recorded exception</b><p>${esc(exception)}</p></div>`:''}
  ${gpsSection(r)}
  ${reportSection(r,'Outgoing Officer Declaration',details.outgoing,'01')}
  ${reportSection(r,'Outgoing Observations & Instructions',details.observations,'02')}
  ${reportSection(r,'Incoming Officer Declaration',details.incoming,'03')}
  ${reportSection(r,'Client Confirmation',details.client,'04')}
  ${reportSection(r,'Management Acknowledgement',details.management,'05')}
  ${reportSection(r,'Audit References',details.audit,'06')}`;
 const overlay=$('handoverOverlay');overlay.hidden=false;document.body.classList.add('modal-open');$('dialogScroll').scrollTop=0;
 $('closeDetail').focus();
}
function closeDetail(){
 $('handoverOverlay').hidden=true;document.body.classList.remove('modal-open');
 if(previousFocus?.isConnected)previousFocus.focus();previousFocus=null;
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
$('closeDetail').addEventListener('click',closeDetail);
$('handoverBackdrop').addEventListener('click',closeDetail);
document.addEventListener('keydown',e=>{if($('handoverOverlay').hidden)return;if(e.key==='Escape'){e.preventDefault();closeDetail()}else if(e.key==='Tab'){const dialog=document.querySelector('.handover-dialog');const items=[...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])')].filter(x=>x.getClientRects().length);if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
window.addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.data?.talosTheme)document.body.dataset.theme=e.data.talosTheme;if(e.source===window.parent&&e.data?.talosHandoversContext){context={...e.data.talosHandoversContext,apiRead:e.data.talosHandoversContext.apiRead||window.TALOS_CONFIG?.api?.handoverRead||''};load();}});
window.parent.postMessage({talosHandoversRequestContext:true},location.origin);
