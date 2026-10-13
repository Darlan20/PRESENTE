(()=>{"use strict";
const config=window.APO_SUPABASE_CONFIG||{};
if(!window.supabase||!config.url||!config.anonKey)return;
let client=window.__APO_CLOUD_CLIENT||null;
if(!client){try{client=window.supabase.createClient(config.url,config.anonKey)}catch(e){console.warn("Sincronização dos recursos indisponível.",e);return}}
const prefix="nosso-cantinho-extras-v1:";
const blank=()=>({since:"",names:["",""],memories:[],letters:[],dates:[]});
const localKey=email=>prefix+(email?String(email).trim().toLowerCase():"local");
const readLocal=k=>{try{const v=JSON.parse(localStorage.getItem(k)||"{}");return {...blank(),...v,names:Array.isArray(v.names)?v.names:["",""],memories:Array.isArray(v.memories)?v.memories:[],letters:Array.isArray(v.letters)?v.letters:[],dates:Array.isArray(v.dates)?v.dates:[]}}catch{return blank()}};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const itemKey=x=>String(x?.id||((x?.date||"")+"|"+(x?.title||"")));
function mergeData(remote,local){
 const a={...blank(),...(remote||{})},b={...blank(),...(local||{})};
 const mergeList=(name)=>{const out=[],seen=new Set();for(const x of [...(Array.isArray(a[name])?a[name]:[]),...(Array.isArray(b[name])?b[name]:[])]){const k=itemKey(x);if(!seen.has(k)){seen.add(k);out.push(x)}}return out};
 return {since:a.since||b.since||"",names:(Array.isArray(a.names)&&a.names.some(Boolean))?a.names:(Array.isArray(b.names)?b.names:["",""]),memories:mergeList("memories"),letters:mergeList("letters"),dates:mergeList("dates")};
}
let user=null,scope=null,channel=null,ready=false,pendingData=null,activeKey=localKey(""),switching=false;
function localWrite(data,notify=true){try{localStorage.setItem(activeKey,JSON.stringify(data));if(notify)window.dispatchEvent(new CustomEvent("nosso-cantinho:extras-updated",{detail:data}));return true}catch(e){console.warn("Não foi possível salvar os recursos localmente.",e);return false}}
async function resolveScope(){
 if(!user)return null;
 const {data,error}=await client.rpc("apo_meu_casal");
 if(error)throw error;
 return data?.id?{kind:"shared",id:data.id,table:"apo_recursos_compartilhados",column:"couple_id"}:{kind:"personal",id:user.id,table:"apo_recursos_pessoais",column:"user_id"};
}
async function fetchRemote(target){
 const {data,error}=await client.from(target.table).select("data").eq(target.column,target.id).maybeSingle();
 if(error)throw error;
 return data?.data||null;
}
async function writeRemote(data){
 if(!user||!scope||!ready)return;
 if(!navigator.onLine){pendingData=data;return}
 const target=scope,row={...data};
 const payload=target.kind==="shared"?{couple_id:target.id,data:row,updated_at:new Date().toISOString()}:{user_id:target.id,data:row,updated_at:new Date().toISOString()};
 const {error}=await client.from(target.table).upsert(payload,{onConflict:target.column});
 if(error){pendingData=data;console.warn("Recursos salvos neste aparelho; sincronização pendente.",error);return}
 pendingData=null;
}
function subscribe(){
 if(channel){client.removeChannel(channel);channel=null}
 if(!scope)return;
 channel=client.channel("extras-"+scope.kind+"-"+scope.id).on("postgres_changes",{event:"*",schema:"public",table:scope.table,filter:scope.column+"=eq."+scope.id},payload=>{
  const remote=payload.new?.data;if(!remote||!activeKey)return;
  if(pendingData)return;
  localWrite({...blank(),...remote},true);
 }).subscribe();
}
async function activate(session){
 const nextUser=session?.user||null;
 if(switching)return;
 switching=true;ready=false;
 try{
  if(channel){client.removeChannel(channel);channel=null}
  user=nextUser;
  activeKey=localKey(user?.email||"");
  scope=null;
  if(!user){ready=true;return}
  try{scope=await resolveScope()}catch(e){console.warn("Não foi possível verificar o espaço compartilhado; os recursos continuam disponíveis localmente.",e);ready=true;return}
  let remote=null;
  try{remote=await fetchRemote(scope)}catch(e){console.warn("Execute a atualização do schema Supabase para habilitar a sincronização dos recursos.",e);ready=true;return}
  const local=readLocal(activeKey),merged=remote?mergeData(remote,local):local;
  localWrite(merged,false);
  ready=true;
  if(!remote||!same(remote,merged))await writeRemote(merged);
  subscribe();
  if(pendingData)await writeRemote(pendingData);
 }finally{switching=false}
}
window.NossoExtrasCloud={save(data){pendingData=data;if(ready)writeRemote(data).catch(e=>console.warn("Sincronização pendente.",e))},async refresh(){if(!user)return;const old=scope;try{const next=await resolveScope();if(!old||!next||old.kind!==next.kind||old.id!==next.id)await activate({user})}catch(e){console.warn("Não foi possível atualizar o espaço de recursos.",e)}}};
client.auth.onAuthStateChange((event,session)=>{if(["INITIAL_SESSION","SIGNED_IN","SIGNED_OUT","USER_UPDATED"].includes(event))setTimeout(()=>activate(session),0)});
client.auth.getSession().then(({data,error})=>{if(error)throw error;return activate(data.session)}).catch(e=>console.warn("Os recursos permanecerão disponíveis localmente.",e));
window.addEventListener("online",()=>{if(pendingData&&ready)writeRemote(pendingData).catch(()=>{})});
window.addEventListener("focus",()=>{if(user)window.NossoExtrasCloud.refresh()});
setInterval(()=>{if(user)window.NossoExtrasCloud.refresh()},30000);
})();