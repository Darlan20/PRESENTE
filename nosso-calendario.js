(()=>{"use strict";
const $=(s,r=document)=>r.querySelector(s);
const key=()=>"nosso-cantinho-extras-v1:"+((($("#profileAccountEmail")?.textContent||"").trim().toLowerCase().includes("@"))?$("#profileAccountEmail").textContent.trim().toLowerCase():"local");
const read=()=>{try{return JSON.parse(localStorage.getItem(key())||"{}")}catch{return{}}};
const write=d=>{try{localStorage.setItem(key(),JSON.stringify(d));return true}catch{alert("Não foi possível salvar neste navegador.");return false}};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=s=>s?new Intl.DateTimeFormat("pt-BR",{day:"numeric",month:"long",year:"numeric"}).format(new Date(s+"T12:00:00")):"";
let shown=new Date(),selectedDate="";
function iso(y,m,d){return y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0")}
function eventMarkup(x){return '<article class="cc-event '+(x.completed?"completed":"")+'"><div><b>'+esc(x.title)+'</b><time>'+fmt(x.date)+'</time>'+(x.text?'<p>'+esc(x.text)+'</p>':"")+'<small>Data importante</small></div></article>'}
function draw(){
 const card=$('[data-extra-form="date"]')?.closest(".ex-card");if(!card)return;
 let root=$("#coupleCalendar",card);
 if(!root){root=document.createElement("div");root.id="coupleCalendar";root.className="couple-calendar";card.insertBefore(root,card.querySelector("form"))}
 const dates=Array.isArray(read().dates)?read().dates:[],y=shown.getFullYear(),m=shown.getMonth(),first=new Date(y,m,1).getDay(),count=new Date(y,m+1,0).getDate(),title=new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric"}).format(shown),days=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
 let h='<div class="cc-head"><button type="button" data-cal="prev" aria-label="Mês anterior">‹</button><h4>'+title+'</h4><button type="button" data-cal="next" aria-label="Próximo mês">›</button></div><div class="cc-grid cc-week">'+days.map(x=>"<span>"+x+"</span>").join("")+'</div><div class="cc-grid">';
 for(let i=0;i<first;i++)h+='<span class="cc-day cc-blank"></span>';
 for(let d=1;d<=count;d++){const date=iso(y,m,d),items=dates.filter(x=>x.date===date);h+='<button type="button" class="cc-day'+(items.length?" has-event":"")+(date===selectedDate?" is-selected":"")+'" data-cal-day="'+date+'" aria-label="'+date+(items.length?", "+items.map(x=>x.title).join(", "):"")+'"><span>'+d+'</span>'+(items.length?'<i></i><small class="cc-day-label">'+esc(items.length===1?items[0].title:items.length+" eventos")+'</small>':"")+"</button>"}
 h+="</div>";
 if(selectedDate){const selected=dates.filter(x=>x.date===selectedDate);h+='<div class="cc-selected"><div class="cc-selected-head"><b>'+fmt(selectedDate)+'</b><button type="button" data-cal-close aria-label="Fechar detalhes">×</button></div>';h+=selected.length?selected.map(eventMarkup).join(""):'<p class="ex-empty">Nenhum compromisso nesta data.</p>';h+="</div>"}
 else{const monthItems=dates.filter(x=>(x.date||"").startsWith(y+"-"+String(m+1).padStart(2,"0"))).sort((a,b)=>a.date.localeCompare(b.date));h+='<div class="cc-events"><div class="cc-events-title">Momentos deste mês</div>';h+=monthItems.length?monthItems.map(x=>'<button type="button" class="cc-month-event" data-cal-day="'+esc(x.date)+'"><b>'+esc(x.title)+'</b><time>'+fmt(x.date)+'</time></button>').join(""):'<p class="ex-empty">Nenhuma data neste mês. Adicione um momento abaixo.</p>';h+="</div>"}
 root.innerHTML=h;
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-cal],[data-cal-day],[data-cal-close]");if(!b)return;
 if(b.dataset.cal){shown.setMonth(shown.getMonth()+(b.dataset.cal==="next"?1:-1));selectedDate="";draw();return}
 if(b.hasAttribute("data-cal-close")){selectedDate="";draw();return}
 if(b.dataset.calDay){selectedDate=b.dataset.calDay;const dt=new Date(selectedDate+"T12:00:00");shown=new Date(dt.getFullYear(),dt.getMonth(),1);draw()}
});
document.addEventListener("submit",e=>{if(e.target.matches('[data-extra-form="date"]'))setTimeout(()=>{selectedDate=e.target.elements.date.value||"";if(selectedDate){const dt=new Date(selectedDate+"T12:00:00");shown=new Date(dt.getFullYear(),dt.getMonth(),1)}draw()},80)});
function boot(){draw();const app=$("#app");if(app)new MutationObserver(()=>{if(!$("#coupleCalendar"))draw()}).observe(app,{childList:true,subtree:true});addEventListener("storage",draw)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();