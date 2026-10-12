(()=>{"use strict";
const $=(s,r=document)=>r.querySelector(s);
const key=()=>"nosso-cantinho-extras-v1:"+((($("#profileAccountEmail")?.textContent||"").trim().toLowerCase().includes("@"))?$("#profileAccountEmail").textContent.trim().toLowerCase():"local");
const read=()=>{try{return JSON.parse(localStorage.getItem(key())||"{}")}catch{return{}}};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=s=>s?new Intl.DateTimeFormat("pt-BR",{day:"numeric",month:"2-digit",year:"numeric"}).format(new Date(s+"T12:00:00")):"";
let shown=new Date(),selectedDate="";
function iso(y,m,d){return y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0")}
function showCreateDialog(date){
 let dialog=$("#ccDateDialog");if(!dialog){dialog=document.createElement("dialog");dialog.id="ccDateDialog";dialog.className="cc-date-dialog";document.body.appendChild(dialog)}
 dialog.innerHTML='<form id="ccCreateEvent" class="cc-create-form"><div class="cc-dialog-head"><div><small>NOVA DATA IMPORTANTE</small><h3>'+fmt(date)+'</h3></div><button type="button" data-cc-dialog-close aria-label="Fechar">×</button></div><div class="cc-dialog-body"><p>Que momento você quer guardar?</p><label for="ccEventName">Nome do evento</label><input id="ccEventName" name="title" maxlength="90" required placeholder="Ex.: Nosso aniversário"><input type="hidden" name="date" value="'+date+'"><button class="ex-btn" type="submit">Salvar data</button></div></form>';
 if(!dialog.open)dialog.showModal();
 setTimeout(()=>$("#ccEventName",dialog)?.focus(),50);
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-cc-dialog-close]");if(b)b.closest("dialog")?.close()});
document.addEventListener("submit",e=>{if(e.target.id!=="ccCreateEvent")return;e.preventDefault();const f=$('[data-extra-form="date"]');if(!f)return;f.elements.title.value=e.target.elements.title.value.trim();f.elements.date.value=e.target.elements.date.value;$("#ccDateDialog")?.close();f.requestSubmit()});
function draw(){
 const card=$('[data-extra-form="date"]')?.closest(".ex-card");if(!card)return;
 let root=$("#coupleCalendar",card);
 if(!root){root=document.createElement("div");root.id="coupleCalendar";root.className="couple-calendar";card.insertBefore(root,card.querySelector("form"))}
 const dates=Array.isArray(read().dates)?read().dates:[],y=shown.getFullYear(),m=shown.getMonth(),first=new Date(y,m,1).getDay(),count=new Date(y,m+1,0).getDate(),title=String(m+1).padStart(2,"0")+"/"+y,days=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
 let h='<div class="cc-head"><button type="button" data-cal="prev" aria-label="Mês anterior">‹</button><h4>'+title+'</h4><button type="button" data-cal="next" aria-label="Próximo mês">›</button></div><div class="cc-grid cc-week">'+days.map(x=>"<span>"+x+"</span>").join("")+'</div><div class="cc-grid">';
 for(let i=0;i<first;i++)h+='<span class="cc-day cc-blank"></span>';
 for(let d=1;d<=count;d++){const date=iso(y,m,d),items=dates.filter(x=>x.date===date);h+='<button type="button" class="cc-day'+(items.length?" has-event":"")+'" data-cal-day="'+date+'" aria-label="Criar evento em '+date+'"><span>'+d+'</span>'+(items.length?'<i></i><small class="cc-day-label">'+esc(items.length===1?items[0].title:items.length+" eventos")+'</small>':"")+"</button>"}
 h+="</div>";
 const monthItems=dates.filter(x=>(x.date||"").startsWith(y+"-"+String(m+1).padStart(2,"0"))).sort((a,b)=>a.date.localeCompare(b.date));
 h+='<div class="cc-events"><div class="cc-events-title">Momentos deste mês</div>';
 h+=monthItems.length?monthItems.map(x=>'<div class="cc-month-event"><div class="cc-month-event-info"><b>'+esc(x.title)+'</b><time>'+fmt(x.date)+'</time></div><button type="button" class="cc-delete-event" data-delete-event="'+esc(x.id||x.date+"|"+x.title)+'" aria-label="Apagar evento '+esc(x.title)+'" title="Apagar evento">×</button></div>').join(""):'<p class="ex-empty">Nenhuma data neste mês. Clique em um dia para adicionar um evento.</p>';
 h+="</div>";root.innerHTML=h;
}
document.addEventListener("click",e=>{
 const del=e.target.closest("[data-delete-event]");
 if(del){const id=del.dataset.deleteEvent;const data=read();const list=Array.isArray(data.dates)?data.dates:[];let removed=false;data.dates=list.filter(x=>{const xid=x.id||x.date+"|"+x.title;if(!removed&&xid===id){removed=true;return false}return true});try{localStorage.setItem(key(),JSON.stringify(data))}catch{}draw();return}
 const b=e.target.closest("[data-cal],[data-cal-day]");if(!b)return;if(b.dataset.cal){shown.setMonth(shown.getMonth()+(b.dataset.cal==="next"?1:-1));draw();return}if(b.dataset.calDay){selectedDate=b.dataset.calDay;const dt=new Date(selectedDate+"T12:00:00");shown=new Date(dt.getFullYear(),dt.getMonth(),1);showCreateDialog(selectedDate)}});
function boot(){draw();const app=$("#app");if(app)new MutationObserver(()=>{if(!$("#coupleCalendar"))draw()}).observe(app,{childList:true,subtree:true});addEventListener("storage",draw)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();