import {getToken} from './authService'
const BASE=(import.meta.env.VITE_API_URL || '').replace(/\/$/,'')
export type Person={id:string;name:string;handle:string;biography?:string|null;followsYou?:boolean;following?:boolean;followers?:number}
export type Post={id:string;authorId:string;authorName:string;authorHandle:string;text:string|null;createdAt:string;visibility:string;likes:number;liked:boolean;comments:number}
export type Comment={id:string;authorId:string;authorName:string;text:string;parentId:string|null;createdAt:string}
export type Community={id:string;name:string;handle:string;description:string|null;isPrivate:boolean;createdAt:string;members:number;joined:boolean;requested:boolean}
export type Conversation={id:string;lastActivity:string;lastMessage:string|null;participants:string|{id:string;name:string;handle:string}[]|null}
export type ChatMessage={id:string;senderId?:string;authorId?:string;authorName?:string;text:string|null;createdAt:string}
export type Alert={id:string;actorId:string|null;kind:string;dataJson:string;createdAt:string;readAt:string|null}
export class ApiError extends Error{constructor(public status:number,message:string){super(message)}}
export async function request<T=unknown>(path:string,options:RequestInit={}):Promise<T>{
 if(!BASE)throw new Error('Configure VITE_API_URL para conectar o Revival ao backend.')
 const token=getToken()
 if(!token)throw new ApiError(401,'Sua sessão expirou. Entre novamente.')
 let response:Response
 try{response=await fetch(BASE+path,{...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),Authorization:'Bearer '+token,...options.headers}})}
 catch{throw new Error('Não foi possível conectar ao servidor. Tente novamente.')}
 if(!response.ok){const data=await response.json().catch(()=>null) as {error?:string;title?:string}|null;throw new ApiError(response.status,data?.error||(response.status===401?'Sua sessão expirou. Entre novamente.':data?.title||'Erro na API ('+response.status+').'))}
 if(response.status===204)return undefined as T
 return response.json() as Promise<T>
}
const json=(data:unknown)=>JSON.stringify(data)
export const social={
 feed:(authorId?:string)=>request<Post[]>('/api/v1/posts?take=100'+(authorId?'&authorId='+encodeURIComponent(authorId):'')),
 post:(text:string)=>request<{id:string}>('/api/v1/posts',{method:'POST',body:json({text,visibility:'publico'})}),
 like:(id:string,liked:boolean)=>request<void>('/api/v1/posts/'+id+'/likes',{method:liked?'DELETE':'POST'}),
 comments:(id:string)=>request<Comment[]>('/api/v1/posts/'+id+'/comments'),
 comment:(id:string,text:string)=>request('/api/v1/posts/'+id+'/comments',{method:'POST',body:json({text})}),
 discover:(q='')=>request<Person[]>('/api/v1/users/discover?q='+encodeURIComponent(q)+'&take=100'),
 search:(q:string)=>request<Person[]>('/api/v1/profiles?q='+encodeURIComponent(q)+'&limit=50'),
 profile:(handle:string)=>request<Person>('/api/v1/profiles/'+encodeURIComponent(handle)),
 editProfile:(name:string,biography:string)=>request<void>('/api/v1/profiles/me',{method:'PUT',body:json({name,biography})}),
 follow:(id:string)=>request<void>('/api/v1/profiles/'+id+'/follow',{method:'POST'}),
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
