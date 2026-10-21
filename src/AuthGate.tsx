import {useEffect,useState,type FormEvent} from 'react'
import {authApi,clearSession,getToken,tokenKey,type AuthUser} from './services/authService'
import App from './App'
import { Eye, EyeOff } from 'lucide-react'

export default function AuthGate(){
  const [user,setUser]=useState<AuthUser|null>(null)
  const [checking,setChecking]=useState(true)
  const [registering,setRegistering]=useState(false)
  const [name,setName]=useState('')
  const [handle,setHandle]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [showPassword,setShowPassword]=useState(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  useEffect(()=>{
    let active=true
    if(!getToken()){setChecking(false);return}
    authApi.me().then(profile=>{if(active)setUser(profile)}).catch(()=>{if(active)clearSession()}).finally(()=>{if(active)setChecking(false)})
    return()=>{active=false}
  },[])
  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();setError('')
    if(registering && (password.length<6 || password.length>128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password))){setError('A senha deve ter pelo menos 6 caracteres, com letras minúsculas, maiúsculas, números e símbolos.');return}
    setBusy(true)
    try{
      const response=registering?await authApi.register(name.trim(),handle.trim().replace(/^@/,''),email.trim(),password):await authApi.login(email.trim(),password)
      sessionStorage.setItem(tokenKey,response.accessToken)
      try{
        const profile=await authApi.me()
        setUser(profile)
      }catch(e){
        clearSession()
        throw e
      }
      setPassword('')
    }catch(err){setError(err instanceof Error?err.message:'Não foi possível autenticar.')}
    finally{setBusy(false)}
  }
  if(checking)return <div className="auth-shell"><div className="auth-card"><div className="auth-logo">revival<span>.</span></div><p>Validando sessão...</p></div></div>
  if(user)return <><div className="auth-session"><span>@{user.handle}</span><button type="button" onClick={()=>{clearSession();setUser(null)}}>Sair</button></div><App key={user.id} authenticatedName={user.name} /></>
  return <main className="auth-shell"><section className="auth-card" aria-label={registering?'Cadastro':'Entrar no Revival'}>
    <div className="auth-logo">revival<span>.</span></div>
    <p className="auth-subtitle">Compartilhe sua fé e viva conexões verdadeiras.</p>
    <h1>{registering?'Crie sua conta':'Bem-vindo de volta'}</h1>
    <p className="auth-intro">{registering?'Faça parte da comunidade Revival.':'Entre com suas credenciais para continuar.'}</p>
    <form onSubmit={submit}>
      {registering&&<><label htmlFor="auth-name">Nome completo</label><input id="auth-name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" />
      <label htmlFor="auth-handle">Identificador</label><input id="auth-handle" autoComplete="username" required minLength={3} maxLength={40} pattern="[A-Za-z0-9_.]{3,40}" title="Use de 3 a 40 letras, números, ponto ou underline" value={handle} onChange={e=>setHandle(e.target.value.replace(/^@/,''))} placeholder="seu.usuario" /></>}
      <label htmlFor="auth-email">E-mail</label><input id="auth-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@exemplo.com" />
      <label htmlFor="auth-password">Senha</label><div className="auth-password-field"><input id="auth-password" type={showPassword?'text':'password'} autoComplete={registering?'new-password':'current-password'} required minLength={registering?6:1} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} placeholder={registering?'Mín. 6 caracteres, Aa1!':'Sua senha'} /><button type="button" className="auth-password-toggle" title={showPassword?'Ocultar senha':'Mostrar senha'} aria-label={showPassword?'Ocultar senha':'Mostrar senha'} aria-pressed={showPassword} onClick={()=>setShowPassword(value=>!value)}>{showPassword?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>
            {error&&<div role="alert" className="auth-error">{error}</div>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy?'Aguarde...':registering?'Criar conta':'Entrar'}</button>
    </form>
    <p className="auth-switch">{registering?'Já tem conta?':'Ainda não tem conta?'} <button type="button" onClick={()=>{setRegistering(v=>!v);setError('');setPassword('')}}>{registering?'Entrar':'Cadastre-se'}</button></p>
    <small>Seus dados de conta são registrados na API do Revival. A autenticação ainda está em fase de testes.</small>
  </section></main>
}
