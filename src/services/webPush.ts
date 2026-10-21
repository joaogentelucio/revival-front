import {getToken} from './authService';
const base=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
const key='revival.web.push.endpoint';
function decodeBase64Url(input:string){const base64=input.replace(/-/g,'+').replace(/_/g,'/');const bytes=atob(base64+'='.repeat((4-base64.length%4)%4));return Uint8Array.from(bytes,c=>c.charCodeAt(0));}
async function authorized(path:string,options:RequestInit={}){
 const token=getToken();if(!token)throw new Error('Faça login para ativar notificações.');
 const response=await fetch(base+path,{...options,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...options.headers}});
 if(!response.ok)throw new Error('Não foi possível configurar notificações ('+response.status+').');
 return response;
}
export async function activateWebPush(){
 if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window))throw new Error('Este navegador não suporta notificações push.');
 if(!window.isSecureContext)throw new Error('Notificações Web exigem HTTPS.');
 const permission=await Notification.requestPermission();if(permission!=='granted')throw new Error('Permissão de notificações não concedida.');
 const {publicKey}=await fetch(base+'/api/v1/push/vapid-public-key').then(r=>r.json()) as {publicKey:string};
 if(!publicKey)throw new Error('Configure WebPush:PublicKey no Render.');
 const worker=await navigator.serviceWorker.register('/push-sw.js',{scope:'/'});
 const sub=await worker.pushManager.getSubscription()||await worker.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decodeBase64Url(publicKey) as BufferSource});
 const json=sub.toJSON();if(!json.keys?.p256dh||!json.keys.auth)throw new Error('Chaves da inscrição push indisponíveis.');
 await authorized('/api/v1/push/subscriptions',{method:'POST',body:JSON.stringify({platform:'web',endpoint:sub.endpoint,p256dh:json.keys.p256dh,auth:json.keys.auth})});
 localStorage.setItem(key,sub.endpoint);
}
export async function restoreWebPush(){
 if(!('serviceWorker' in navigator)||!('Notification' in window)||Notification.permission!=='granted')return;
 const reg=await navigator.serviceWorker.getRegistration('/');const sub=await reg?.pushManager.getSubscription();
 if(!sub)return;
 const json=sub.toJSON();if(!json.keys?.p256dh||!json.keys.auth)return;
 await authorized('/api/v1/push/subscriptions',{method:'POST',body:JSON.stringify({platform:'web',endpoint:sub.endpoint,p256dh:json.keys.p256dh,auth:json.keys.auth})});
}
export async function removeWebPush(){
 if(!('serviceWorker' in navigator))return;
 const reg=await navigator.serviceWorker.getRegistration('/');const sub=await reg?.pushManager.getSubscription();
 if(sub){await authorized('/api/v1/push/subscriptions',{method:'DELETE',body:JSON.stringify({platform:'web',endpoint:sub.endpoint})});await sub.unsubscribe();}
 localStorage.removeItem(key);
}
