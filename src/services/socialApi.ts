import {getToken,refreshAccessToken} from './authService'
const BASE=(import.meta.env.VITE_API_URL || '').replace(/\/$/,'')
export type Person={id:string;name:string;handle:string;biography?:string|null;avatarUrl?:string|null;backgroundUrl?:string|null;isOnline?:boolean;followsYou?:boolean;following?:number;followers?:number}
export type Post={id:string;authorId:string;authorName:string;authorHandle:string;text:string|null;createdAt:string;visibility:string;likes:number;liked:boolean;comments:number;media?:{url:string;category:string}[]}
export type PostLiker={id:string;name:string;handle:string;following:boolean}
export type Comment={id:string;authorId:string;authorName:string;text:string;parentId:string|null;createdAt:string}
export type Community={id:string;name:string;handle:string;description:string|null;isPrivate:boolean;createdAt:string;members:number;joined:boolean;requested:boolean}
export type Conversation={id:string;lastActivity:string;lastMessage:string|null;participants:string|{id:string;name:string;handle:string}[]|null}
export type ChatMessage={id:string;senderId?:string;authorId?:string;authorName?:string;text:string|null;createdAt:string}
export type Alert={id:string;actorId:string|null;kind:string;dataJson:string;createdAt:string;readAt:string|null}
export class ApiError extends Error{constructor(public status:number,message:string){super(message)}}
export async function request<T=unknown>(path:string,options:RequestInit={}):Promise<T>{
 if(!BASE)throw new Error('Configure VITE_API_URL para conectar o Revival ao backend.')
 let token=getToken()
 if(!token)token=await refreshAccessToken()
 const send=(value:string)=>fetch(BASE+path,{...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),Authorization:'Bearer '+value,...options.headers}})
 let response:Response
 try{response=await send(token);if(response.status===401)response=await send(await refreshAccessToken())}
 catch(e){if(e instanceof Error&&e.message.includes('sessão'))throw e;throw new Error('Não foi possível conectar ao servidor. Tente novamente.')}
 if(!response.ok){const data=await response.json().catch(()=>null) as {error?:string;title?:string}|null;throw new ApiError(response.status,data?.error||(response.status===401?'Sua sessão expirou. Entre novamente.':data?.title||'Erro na API ('+response.status+').'))}
 if(response.status===204)return undefined as T
 return response.json() as Promise<T>
}
const json=(data:unknown)=>JSON.stringify(data)
const normalizePosts=(items:Post[]):Post[]=>items.map(post=>{const raw=(post as Post&{media?:unknown}).media;let media:unknown=raw;if(typeof media==='string'){try{media=JSON.parse(media)}catch{media=[]}}return {...post,media:Array.isArray(media)?media.filter((item):item is {url:string;category:string}=>!!item&&typeof item.url==='string'&&typeof item.category==='string'):[]}})
export const uploadFile=async(category:'image-pub'|'video-pub'|'avatar'|'background-photo',file:File)=>{let token=getToken()||await refreshAccessToken();const form=new FormData();form.append('file',file);const send=(value:string)=>fetch(BASE+'/api/v1/uploads/'+category,{method:'POST',headers:{Authorization:'Bearer '+value},body:form});let response=await send(token);if(response.status===401){token=await refreshAccessToken();response=await send(token)}if(!response.ok){const body=await response.json().catch(()=>null) as {error?:string}|null;throw new Error(body?.error||'Erro no envio do arquivo ('+response.status+').')}return response.json() as Promise<{id:string;url:string;category:string}>}
export const mediaUrl=(url:string)=>BASE+url
export const social={
 feed:async(authorId?:string)=>normalizePosts(await request<Post[]>('/api/v1/posts?take=100'+(authorId?'&authorId='+encodeURIComponent(authorId):''))),
 post:(text:string,uploadIds:string[]=[])=>request<{id:string}>('/api/v1/posts',{method:'POST',body:json({text,uploadIds,visibility:'publico'})}),
 deletePost:(id:string)=>request<void>('/api/v1/posts/'+id,{method:'DELETE'}),
 like:(id:string,liked:boolean)=>request<void>('/api/v1/posts/'+id+'/likes',{method:liked?'DELETE':'POST'}),
 likers:(id:string)=>request<PostLiker[]>('/api/v1/posts/'+id+'/likes'),
 comments:(id:string)=>request<Comment[]>('/api/v1/posts/'+id+'/comments'),
 comment:(id:string,text:string)=>request('/api/v1/posts/'+id+'/comments',{method:'POST',body:json({text})}),
 discover:(q='')=>request<Person[]>('/api/v1/users/discover?q='+encodeURIComponent(q)+'&take=100'),
 search:(q:string)=>request<Person[]>('/api/v1/profiles?q='+encodeURIComponent(q)+'&limit=50'),
 profile:(handle:string)=>request<Person>('/api/v1/profiles/'+encodeURIComponent(handle)),
 editProfile:(name:string,biography:string,uploads?:{avatarUploadId?:string; backgroundUploadId?:string})=>request<void>('/api/v1/profiles/me',{method:'PUT',body:json({name,biography,...uploads})}),
 follow:(id:string)=>request<void>('/api/v1/profiles/'+id+'/follow',{method:'POST'}),
 publicConnections:(userId:string,kind:'following'|'followers')=>request<Person[]>('/api/v1/users/'+encodeURIComponent(userId)+'/'+kind),
 following:()=>request<Person[]>('/api/v1/users/me/following'),
 followers:()=>request<Person[]>('/api/v1/users/me/followers'),
 communities:()=>request<Community[]>('/api/v1/communities?take=100'),
 createCommunity:(name:string,handle:string,isPrivate:boolean)=>request<{id:string;handle:string}>('/api/v1/communities',{method:'POST',body:json({name,handle:handle||null,isPrivate})}),
 joinCommunity:(id:string)=>request<{status:string}>('/api/v1/communities/'+id+'/join',{method:'POST'}),
 communityMessages:(id:string)=>request<ChatMessage[]>('/api/v1/communities/'+id+'/messages'),
 sendCommunity:(id:string,text:string)=>request('/api/v1/communities/'+id+'/messages',{method:'POST',body:json({text})}),
 conversations:()=>request<Conversation[]>('/api/v1/conversations?take=100'),
 startConversation:(userId:string)=>request<{id:string}>('/api/v1/conversations',{method:'POST',body:json({userId})}),
 messages:(id:string)=>request<ChatMessage[]>('/api/v1/conversations/'+id+'/messages'),
 sendMessage:(id:string,text:string)=>request('/api/v1/conversations/'+id+'/messages',{method:'POST',body:json({text})}),
 alerts:()=>request<Alert[]>('/api/v1/notifications?take=100'),
 readAlerts:()=>request<void>('/api/v1/notifications/read-all',{method:'PATCH'})
}
