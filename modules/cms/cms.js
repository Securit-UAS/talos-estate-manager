'use strict';
const $=id=>document.getElementById(id);
const issues=['C247 Technical Issue','Unable to contact Officer','Will be late for shift','Unable to attend their shift','Leaving site','Unable to book on','Rota Error','Missed check call / Welfare Check','Triggered Duress Alarm','Failed to show SIA Badge when booking on','SIA Badge is Invalid','SIA Badge is Expiring','Forgot to Book on','Not Confirmed Shifts on C247','Other'];
const c247=['App will not open','Login details not working',"Can't Book on - Booking on Blocked (Time)","Can't Book on - Out of Range (GPS)",'App fails to respond to Checkpoint Scan','Welfare Check Problem','Other'];
const booking=['No data signal / credit on phone','Does not know the PIN for the C247 Account','Not got the app installed','Location error','Unable to book on due too early / late','Other'];
let context=null,live=[],recent=[],liveReady=false,working=false,staffRecords=[],staffLookupSerial=0,staffLookupTimer=null,loadedStaffSite="",providerDirectory=["SecurIT"],providerLookupSerial=0;
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function options(arr,label){return `<option value="">${label}</option>`+arr.map(v=>`<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('')}
function field(id,name,arr){return `<label>${name}<select id="${id}">${options(arr,'Choose…')}</select></label>`}
function conditional(){let s='';switch($('issue').value){case 'C247 Technical Issue':s=field('c247','C247 issue',c247)+field('device','Device type',['Apple','Android'])+field('knowledge','User knowledge',['Prior User, Understands the app','Prior User, Not confident with the app &/or device','First time user - Training given','User unable to understand instruction'])+field('escalation','Escalation',['C247 still to be informed','C247 informed by Phone','C247 informed via email','C247 Not Informed (Resolved Internally)','C247 Not Informed (none escalated issue)']);break;case 'Unable to book on':s=field('booking','Unable to book on reason',booking);break;case 'Unable to attend their shift':s=field('internalNotice','Internal notification already sent?',['No','Yes']);break} $('conditional').innerHTML=s;$('conditional').hidden=!s;}
function tab(id){$('dashboard').hidden=id!=='dashboard';$('new').hidden=id!=='new';$('wall').hidden=id!=='wall';document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));}
function norm(x){return {id:x.ID??x.id??x.reportId??'',site:String(x.SiteName??x.siteName??''),officer:String(x['Officer Name']??x.officerName??''),issue:String(x.Issue??x.issue??''),time:String(x.Created??x.created??x['Completion time']??x.completionTime??''),notes:String(x.operatorComments??x.comments??x['Reason for Issue / Operator Comments\n\nPlease note - These comments may be passed directly to the client or other 3rd parties']??''),confirmed:String(x.Confirmed??x.confirmed??'No').toLowerCase()==='yes',contractor:String(x.Contractor??x.contractor??'').trim()||'SecurIT',shift:String(x['Time due to start shift']??x.shiftStart??''),operator:String(x['Logged by']??x.loggedBy??'')}}
function officerKey(value){return String(value||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-GB')}
function historyFor(name){
 const key=officerKey(name);
 if(!key || !liveReady)return null;
 // Reports are limited to the Read API's rolling 60-day window; do not add the draft being prepared.
 const rows=[...live,...recent].filter(r=>officerKey(r.officer)===key);
 const kinds={};rows.forEach(r=>{kinds[r.issue]=(kinds[r.issue]||0)+1});
 return {total:rows.length,open:rows.filter(r=>!r.confirmed).length,kinds};
}
function updateHistory(){
 const el=$('officerHistory');if(!el)return;
 const name=$('officer').value.trim();
 if(!name){el.innerHTML='<span class="muted">Choose or type an officer to see their previous reports.</span>';return}
 const h=historyFor(name);
 if(!h){el.innerHTML='<span class="muted">Historical incident lookup unavailable until the live 60-day register loads. Reporting remains available.</span>';return}
 const summary=Object.entries(h.kinds).sort((a,b)=>b[1]-a[1]).map(([label,n])=>`<span class="history-chip">${escapeHtml(label)}: <strong>${n}</strong></span>`).join('');
 el.innerHTML=`<div class="history-stats"><div><strong>${h.total}</strong><small>Reports in last 60 days</small></div></div><div class="history-breakdown">${summary||'<span class="muted">No previous reports found for this name.</span>'}</div><small class="fieldhint">Matched by officer name (ignores extra spaces and case). Check similar names before relying on history.</small>`;
}
function render(){const arr=[...live,...recent].sort((a,b)=>Date.parse(b.time||0)-Date.parse(a.time||0));const q=$('search').value.toLowerCase(),issue=$('issueFilter').value,status=$('statusFilter').value;const filtered=arr.filter(r=>[r.site,r.officer,r.issue,r.notes].join(' ').toLowerCase().includes(q)&&(!issue||issue===r.issue)&&(!status||(status==='confirmed'===r.confirmed)));const known=liveReady||recent.length;[['nAll',arr.length],['nOpen',arr.filter(r=>!r.confirmed).length],['nToday',arr.filter(r=>new Date(r.time).toDateString()===new Date().toDateString()).length],['nContact',todayIssueMetricCount()]].forEach(([id,count])=>$(id).textContent=known?count:'—');$('register').innerHTML=filtered.length?filtered.map((r,i)=>`<div class="report-row"><div><strong>${escapeHtml(r.site)}</strong><small>${escapeHtml(r.time?new Date(r.time).toLocaleString('en-GB'):'Just submitted')}</small></div><div><strong>${escapeHtml(r.officer)}</strong><small>${escapeHtml(r.contractor)}</small></div><div><strong>${escapeHtml(r.issue)}</strong><small class="report-notes" title="${escapeHtml(r.notes)}" tabindex="0" aria-label="Full incident details: ${escapeHtml(r.notes)}">${escapeHtml(r.notes).slice(0,110)}</small></div><span class="pill ${r.confirmed?'':'open'}">${r.confirmed?'Acknowledged':'Awaiting acknowledgement'}</span><button class="quiet" data-index="${i}">View</button></div>`).join(''):`<div class="empty">${context?.api.read?'No matching CMS reports.':'Live dashboard requires a CMS Read API. Reports submitted here will appear temporarily in this browser session.'}</div>`;document.querySelectorAll('[data-index]').forEach(btn=>btn.onclick=()=>details(filtered[Number(btn.dataset.index)]));updateHistory();renderWall();renderDailyIssueMetric();}
function renderWall(){
 const root=$('wallRows');if(!root)return;
 const all=[...live,...recent].sort((a,b)=>Date.parse(b.time||0)-Date.parse(a.time||0));
 const cutoff=Date.now()-24*60*60*1000;
 const priority=all.filter(r=>!r.confirmed);
 const today=all.filter(r=>r.confirmed&&Date.parse(r.time)>=cutoff);
 const items=[...priority,...today].sort((a,b)=>Date.parse(b.time||0)-Date.parse(a.time||0));
 $('wallOpen').textContent=liveReady?priority.length:'—';
 $('wallRecent').textContent=liveReady?all.filter(r=>Date.parse(r.time)>=cutoff).length:'—';
 $('wallUpdated').textContent=$('dataStatus').textContent;
 root.innerHTML=items.length?items.slice(0,35).map(r=>`<div class="wall-item ${r.confirmed?'':'wall-unowned'}"><div><strong>${escapeHtml(r.site)}</strong><small>${escapeHtml(r.officer)} · ${escapeHtml(r.contractor)}</small></div><div><strong>${escapeHtml(r.issue)}</strong><small>${escapeHtml(r.notes).slice(0,180)}</small></div><div class="wall-right"><span class="pill ${r.confirmed?'':'open'}">${r.confirmed?'Acknowledged':'Awaiting acknowledgement'}</span><small>${escapeHtml(r.time?new Date(r.time).toLocaleString('en-GB'):'Just submitted')}</small></div></div>`).join(''):'<div class="empty">No recent events or outstanding acknowledgements.</div>';
}
function details(r){$('detailBody').innerHTML='<dl>'+[['Site',r.site],['Officer',r.officer],['Issue',r.issue],['Contractor',r.contractor],['Shift start',r.shift],['Logged by',r.operator],['Created',r.time],['Ownership acknowledged',r.confirmed?'Yes':'Awaiting acknowledgement'],['Comments',r.notes],['SharePoint ID',r.id]].map(([k,v])=>`<dt>${k}</dt><dd>${escapeHtml(v)}</dd>`).join('')+'</dl><p class="notice">Confirmation remains in TALOS Desktop until the CMS Confirmation API is built and verified.</p>';$('detailOverlay').hidden=false;}
function getRecords(data){if(Array.isArray(data))return data;for(const key of ['value','reports','body'])if(Array.isArray(data?.[key]))return data[key];throw Error('Unexpected reporting API format')}
async function refresh(){if(!context?.api.read){$('dataStatus').textContent='Live Read API not connected · recent submissions shown for this browser session only';render();return}if(working)return;working=true;$('dataStatus').textContent='Loading reports…';try{const result=await fetch(context.api.read,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({email:context.email,token:context.token})});if(!result.ok)throw Error(`HTTP ${result.status}`);live=getRecords(await result.json()).map(norm);liveReady=true;const ids=new Set(live.map(r=>String(r.id)));recent=recent.filter(r=>!ids.has(String(r.id)));$('dataStatus').textContent=`${live.length} reports from the rolling 60-day register · refreshed ${new Date().toLocaleTimeString('en-GB')}`;}catch(e){$('dataStatus').textContent='Read API failed: '+e.message}finally{working=false;render()}}
function setMessage(text,bad=false){$('submitStatus').textContent=text;$('submitStatus').className='status'+(bad?' error':' success')}
async function submit(e){e.preventDefault();if(!context?.api.submit){setMessage('Submit API not configured.',true);return}let site=$('site').value.trim(),officer=$('officer').value.trim(),issue=$('issue').value,notes=$('comments').value.trim();if(!site||!officer||!issue||!notes){setMessage('Complete the required fields.',true);return}if(!context.sites.some(s=>s.name.toLowerCase()===site.toLowerCase())&&!confirm('Site is not in active Estate records. Continue with manually entered site?'))return;const extras=[...$('conditional').querySelectorAll('select')].filter(el=>el.value).map(el=>`${el.closest('label').firstChild.textContent.trim()}: ${el.value}`);const payload={email:context.email,token:context.token,siteName:site,officerName:officer,shiftStart:$('shift').value,issue,operatorComments:[...extras,notes].join('\n'),notifyClient:'No',notificationSent:$('internalNotice')?.value||'No',contractor:$('contractor').value.trim()||'SecurIT',loggedBy:context.displayName,talosHistory:(()=>{const h=historyFor(officer);return h?`Past Incidents in the last 60 days,\n${Object.entries(h.kinds).map(([k,v])=>`${k} - ${v}`).join(', ')}, Unconfirmed - ${h.open}`:''})()};if(!confirm(`Submit ${issue} for ${officer} at ${site}? This writes a real Talos DB v2 record and may trigger internal alerts.`))return;$('submit').disabled=true;setMessage('Submitting…');try{const r=await fetch(context.api.submit,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify(payload)});const out=await r.json().catch(()=>({}));if(!r.ok||out.success!==true)throw Error(out.message||`HTTP ${r.status}`);recent.unshift(norm({...payload,reportId:out.reportId||out.id||'',created:new Date().toISOString(),confirmed:'No'}));setMessage(`CMS report created${out.reportId?' · #'+out.reportId:''}. Check any internal alerts.`);$('reportForm').reset();updateHistory();$('shift').value=new Date().toTimeString().slice(0,5);conditional();scheduleStaffLookup();render();}catch(error){setMessage('Submission failed: '+error.message,true)}finally{$('submit').disabled=false}}

function staffRows(data){
 const rows=Array.isArray(data)?data:(Array.isArray(data?.value)?data.value:Array.isArray(data?.staff)?data.staff:Array.isArray(data?.body?.value)?data.body.value:null);
 if(!rows)throw Error('Staff API must return an array or {value:[…]}');
 return rows.map(x=>({site:String(x.SiteName??x.siteName??x.site??'').trim(),name:String(x.FullName??x.fullName??x.officerName??x.Title??x.name??'').trim(),provider:String(x.Contractor??x.contractor??x.labourProvider??x.Company??x.company??'').trim()||'SecurIT',staffId:String(x.StaffID??x.staffId??'')})).filter(x=>x.name);
}
function unique(arr){return [...new Set(arr.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'en-GB'))}
function displayStaff(){
 const site=$('site').value.trim().toLowerCase();
 const known=context?.sites?.some(x=>x.name.toLowerCase()===site);
 const matches=known?staffRecords.filter(r=>r.site.toLowerCase()===site):[];
 $('officers').innerHTML=unique(matches.map(r=>r.name)).map(v=>`<option value="${escapeHtml(v)}"></option>`).join('');
 $('contractors').innerHTML=unique([...providerDirectory,...staffRecords.map(r=>r.provider)]).map(v=>`<option value="${escapeHtml(v)}"></option>`).join('');
 $('officerHint').textContent=!known?'Unlisted site — enter the officer name manually.':!context?.api?.staffLookup?'Officer directory API not connected — enter the name manually.':matches.length?`${unique(matches.map(r=>r.name)).length} scheduled officer(s) for this site; manual entry is available.`:'No current officer records matched this site; enter the name manually.';
 syncProvider();
}
function syncProvider(){updateHistory();
 const site=$('site').value.trim().toLowerCase(),name=$('officer').value.trim().replace(/\s+/g,' ').toLowerCase();
 const matches=staffRecords.filter(r=>r.site.toLowerCase()===site&&r.name.replace(/\s+/g,' ').toLowerCase()===name);
 const providers=unique(matches.map(r=>r.provider));
 if(providers.length===1){$('contractor').value=providers[0];$('contractorHint').textContent='Auto-filled from the selected officer in Rolling Staff DB. You can override it.'}
 else if(providers.length>1){$('contractorHint').textContent='Multiple providers found for this officer. Select or enter the correct one.'}
 else {$('contractorHint').textContent='Select any known Labour Provider or enter one manually. Blank contractor records default to SecurIT.'}
}
function providerRows(data){
 const rows=Array.isArray(data)?data:(Array.isArray(data?.value)?data.value:Array.isArray(data?.providers)?data.providers:Array.isArray(data?.body)?data.body:null);
 if(!rows)throw Error('Provider API must return an array');
 return unique(['SecurIT',...rows.map(x=>String(typeof x==='string'?x:(x?.contractor??x?.Contractor??'')).trim()||'SecurIT')]);
}
async function loadProviders(){
 const serial=++providerLookupSerial;
 if(!context?.api?.providerLookup){providerDirectory=['SecurIT'];displayStaff();return;}
 try{
  const r=await fetch(context.api.providerLookup,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({email:context.email,token:context.token,siteName:''})});
  if(!r.ok)throw Error('HTTP '+r.status);
  const providers=providerRows(await r.json());
  if(serial!==providerLookupSerial)return;
  providerDirectory=providers;
  displayStaff();
 }catch(e){
  if(serial!==providerLookupSerial)return;
  providerDirectory=['SecurIT'];displayStaff();
  $('contractorHint').textContent='Provider directory unavailable ('+e.message+'). Enter a provider manually; blank defaults to SecurIT.';
 }
}
function scheduleStaffLookup(){
 clearTimeout(staffLookupTimer);
 ++staffLookupSerial; // Invalidate any in-flight response immediately when the selected site changes.
 staffRecords=[];loadedStaffSite='';displayStaff();
 const site=$('site').value.trim();
 const known=context?.sites?.find(x=>x.name.toLowerCase()===site.toLowerCase());
 if(!known||!context?.api?.staffLookup)return;
 $('officerHint').textContent='Loading scheduled officers for this site…';
 staffLookupTimer=setTimeout(()=>loadStaff(known.name),250);
}
async function loadStaff(siteName){
 const serial=++staffLookupSerial;
 if(!context?.api?.staffLookup)return;
 $('officerHint').textContent='Loading scheduled officers for this site…';
 try{
  const r=await fetch(context.api.staffLookup,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({email:context.email,token:context.token,siteName})});
  if(!r.ok)throw Error('HTTP '+r.status);
  const rows=staffRows(await r.json());
  if(serial!==staffLookupSerial||$('site').value.trim().toLowerCase()!==siteName.toLowerCase())return;
  staffRecords=rows.filter(x=>x.site.toLowerCase()===siteName.toLowerCase());
  loadedStaffSite=siteName;
  displayStaff();
 }catch(e){
  if(serial!==staffLookupSerial)return;
  staffRecords=[];loadedStaffSite='';displayStaff();
  $('officerHint').textContent='Staff lookup unavailable ('+e.message+'). Enter the officer name manually.';
 }
}

function setContext(data){context=data;$('operator').textContent=data.displayName||data.email;const current=$('site').value;$('sites').innerHTML=(data.sites||[]).slice().sort((a,b)=>a.name.localeCompare(b.name)).map(s=>`<option value="${escapeHtml(s.name)}"></option>`).join('');$('site').value=current;$('sync').textContent=`${data.sites.length} active sites loaded`;$('submit').disabled=!data.api.submit;scheduleStaffLookup();loadProviders();refresh()}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==window.parent)return;if(e.data?.talosTheme)document.body.dataset.theme=e.data.talosTheme;if(e.data?.talosCmsContext)setContext(e.data.talosCmsContext)});
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>tab(b.dataset.tab));$('newFromDashboard').onclick=()=>tab('new');$('wallRefresh').onclick=refresh;$('wallFullscreen').onclick=()=>{const el=$('wall');if(!document.fullscreenElement){el.requestFullscreen?.().catch(()=>{window.parent.postMessage({talosCmsWallFullscreen:true},location.origin)})}else document.exitFullscreen?.()};$('refresh').onclick=refresh;$('issue').innerHTML=options(issues,'Choose issue…');$('issueFilter').innerHTML=options(issues,'All issues');$('issue').onchange=conditional;$('site').addEventListener('input',()=>{ $('officer').value='';$('contractor').value='';scheduleStaffLookup() });$('officer').addEventListener('input',syncProvider);$('reportForm').onsubmit=submit;['search','issueFilter','statusFilter'].forEach(id=>$(id).addEventListener('input',render));$('closeDetail').onclick=()=>$('detailOverlay').hidden=true;$('clear').onclick=()=>{if(confirm('Reset the report form?')){$('reportForm').reset();conditional();scheduleStaffLookup();setMessage('')}};$('clientDisabled').onclick=()=>alert('Not available for this client. External client/SOC notifications are disabled. Internal TALOS alerts continue normally.');$('shift').value=new Date().toTimeString().slice(0,5);setInterval(()=>{if(context?.api?.read)refresh()},90000);window.parent.postMessage({talosCmsRequestContext:true},location.origin);

// V2.0.9 rotating incident-category count, scoped to local calendar day.
let dailyIssueIndex=0;
function todaysIssueCounts(){const now=new Date().toDateString(),counts=new Map();for(const r of [...live,...recent]){const date=new Date(r.time);if(!Number.isNaN(date.getTime())&&date.toDateString()===now){const issue=String(r.issue||'Uncategorised').trim()||'Uncategorised';counts.set(issue,(counts.get(issue)||0)+1)}}return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))}
function todayIssueMetricCount(){const items=todaysIssueCounts();return items.length?items[dailyIssueIndex%items.length][1]:0}
function renderDailyIssueMetric(){const items=todaysIssueCounts(),label=$('dailyIssueLabel'),value=$('nContact');if(!label||!value)return;if(!liveReady&&!recent.length){label.textContent='Today · incidents by type';value.textContent='—';return}if(!items.length){label.textContent='Today · no incidents reported';value.textContent='0';return}const [issue,count]=items[dailyIssueIndex%items.length];label.textContent=issue+' · today';value.textContent=String(count)}
setInterval(()=>{if(!$('dashboard').hidden){dailyIssueIndex++;renderDailyIssueMetric()}},5000);
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==window.parent)return;if(event.data?.talosCmsOpenNew===true)tab('new')});
