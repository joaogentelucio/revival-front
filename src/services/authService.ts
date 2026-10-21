const API_URL=(import.meta.env.VITE_API_URL || '').replace(/\/$/,'')
export type AuthUser={id:string;email:string;handle:string;name:string;biography:string|null}
export type AuthResult={accessToken:string;expiresAt:string;userId:string;handle:string}
export const tokenKey='revival-access-token'
export const getToken=()=>sessionStorage.getItem(tokenKey)
export function clearSession(){sessionStorage.removeItem(tokenKey)}
async function api<T>(route:string,options:RequestInit={}):Promise<T>{
  if(!API_URL)throw new Error('Conexão não configurada: defina VITE_API_URL apontando para o backend.')
  let response:Response
  try{
    response=await fetch(API_URL+route,{...options,headers:{'Content-Type':'application/json',...(getToken()?{Authorization:'Bearer '+getToken()}:{}),...options.headers}})
  }catch{throw new Error('Não foi possível conectar à API do Revival. Confira o endereço do backend e o CORS.')}
  if(!response.ok){
    const body=await response.json().catch(()=>null) as {error?:string;title?:string}|null
    throw new Error(body?.error || (response.status===401?'E-mail, senha ou sessão inválidos.':body?.title || 'Falha na requisição ('+response.status+').'))
  }
  return response.json() as Promise<T>
}
export const authApi={
  login:(email:string,password:string)=>api<AuthResult>('/api/v1/auth/login',{method:'POST',body:JSON.stringify({email,password})}),
  register:(name:string,handle:string,email:string,password:string)=>api<AuthResult>('/api/v1/auth/register',{method:'POST',body:JSON.stringify({name,handle,email,password})}),
  me:()=>api<AuthUser>('/api/v1/auth/me')
}
