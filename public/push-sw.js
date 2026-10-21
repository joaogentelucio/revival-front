self.addEventListener('push',event=>{
 let data={title:'Revival',body:'Você tem uma nova notificação',url:'/'};
 try{data={...data,...event.data.json()}}catch{}
 event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'/favicon.ico',badge:'/favicon.ico',tag:data.notificationId||undefined,data:{url:data.url||'/'}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const path=event.notification.data?.url||'/';
 event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(windows=>{const found=windows.find(w=>w.url.startsWith(self.location.origin));if(found)return found.focus();return clients.openWindow(path)}));
});
