const API_URL=(import.meta.env.VITE_API_URL || '').replace(/\/$/,'')
export type AuthUser={id:string;email:string;handle:string;name:string;biography:string|null}
export type AuthResult={accessToken:string;expiresAt:string;userId:string;handle:string;refreshToken:string;refreshExpiresAt:string}
export const tokenKey='revival-access-token'
const refreshKey='revival-refresh-token'
export const saveSession=(result:AuthResult)=>{sessionStorage.setItem(tokenKey,result.accessToken);sessionStorage.setItem(refreshKey,result.refreshToken)}
let refreshing:Promise<string>|null=null
export async function refreshAccessToken():Promise<string>{
 if(refreshing)return refreshing
 refreshing=(async()=>{
  const value=sessionStorage.getItem(refreshKey)
  if(!value)throw new Error('Sua sessão expirou. Entre novamente.')
  const res=await fetch(API_URL+'/api/v1/auth/refresh',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:value})})
  if(!res.ok){if(res.status===401)clearSession();throw new Error('Sua sessão expirou. Entre novamente.')}
  const data=await res.json() as AuthResult
  saveSession(data);return data.accessToken
 })()
 try{return await refreshing}finally{refreshing=null}
}
export async function logoutSession(){const value=sessionStorage.getItem(refreshKey);if(value)await fetch(API_URL+'/api/v1/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:value})}).catch(()=>{});clearSession()}

export const getToken=()=>sessionStorage.getItem(tokenKey)
export function clearSession(){sessionStorage.removeItem(tokenKey);sessionStorage.removeItem(refreshKey)}
async function api<T>(route:string,options:RequestInit={}):Promise<T>{
  if(!API_URL)throw new Error('Conexão não configurada: defina VITE_API_URL apontando para o backend.')
  let response:Response
  const send=(token:string|null)=>fetch(API_URL+route,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...options.headers}})
  try{
    response=await send(getToken())
    if(response.status===401&&route==='/api/v1/auth/me')response=await send(await refreshAccessToken())
  }catch{throw new Error('Não foi possível conectar à API do Revival. Confira o endereço do backend e o CORS.')}
  if(!response.ok){
    const body=await response.json().catch(()=>null) as {error?:string;title?:string}|null
    throw new Error(body?.error || (response.status===401?'E-mail, senha ou sessão inválidos.':body?.title || 'Falha na requisição ('+response.status+').'))
  }
  return response.json() as Promise<T>
}
export const authApi={
  login:(identifier:string,password:string)=>api<AuthResult>('/api/v1/auth/login',{method:'POST',body:JSON.stringify({email:identifier,password})}),
  register:(name:string,handle:string,email:string,password:string)=>api<AuthResult>('/api/v1/auth/register',{method:'POST',body:JSON.stringify({name,handle,email,password})}),
  me:()=>api<AuthUser>('/api/v1/auth/me')
}
