import { useEffect, useMemo, useState } from 'react'
import { Bell, Heart, Home, Mail, MessageCircle, Plus, Search, Send, Smile, Users } from 'lucide-react'
type Page = 'inicio'|'perfil'|'recados'|'amigos'
type Post = {id:number;author:string;avatar:string;time:string;text:string;likes:number;liked?:boolean}
type Scrap = {id:number;author:string;text:string;time:string}
type Community = {id:number;name:string;icon:string;members:string;joined:boolean}
const starterPosts:Post[]=[
{id:1,author:'Mariana Costa',avatar:'🌷',time:'há 12 minutos',text:'a internet era tão boa quando a maior preocupação era escolher as 5 estrelinhas dos amigos 💗 quem viveu, viveu!',likes:124},
{id:2,author:'Rafael Almeida',avatar:'🎧',time:'há 1 hora',text:'Acabei de entrar na comunidade “Eu odeio acordar cedo” e me senti em casa. Algumas coisas nunca mudam. 😂',likes:87},
{id:3,author:'Bia Oliveira',avatar:'🌸',time:'há 3 horas',text:'Passando pra deixar um depoimento: que saudade de uma rede social onde a gente podia simplesmente ser brega e feliz. ✨',likes:203}]
const friendNames=['Mariana Costa','Rafael Almeida','Bia Oliveira','Lucas Ferreira','Juliana Mendes','Pedro Santos','Ana Clara','Thiago Lima','Carolina Dias']
const starterCommunities:Community[]=[
{id:1,name:'Eu odeio acordar cedo',icon:'😴',members:'128 mil',joined:true},
{id:2,name:'Eu amo o cheiro de chuva',icon:'🌧️',members:'84 mil',joined:true},
{id:3,name:'Saudades dos anos 2000',icon:'💿',members:'216 mil',joined:false},
{id:4,name:'Não vivo sem música',icon:'🎧',members:'97 mil',joined:false},
{id:5,name:'Só mais 5 minutinhos',icon:'☕',members:'65 mil',joined:false},
{id:6,name:'Amo sexta-feira',icon:'🎉',members:'112 mil',joined:false}]
const starterScraps:Scrap[]=[{id:1,author:'Mariana Costa',text:'Oii!! Passando pra deixar um recadinho e desejar uma semana incrível! 💖',time:'hoje, 10:42'},{id:2,author:'Rafael Almeida',text:'A gente precisa marcar aquele café! ☕',time:'ontem, 18:20'}]
function saved<T,>(key:string,fallback:T):T {try {const x=localStorage.getItem(key);return x?JSON.parse(x) as T:fallback}catch{return fallback}}
const menu:{id:Page;label:string;Icon:typeof Home}[]=[{id:'inicio',label:'Início',Icon:Home},{id:'recados',label:'Recados',Icon:Mail},{id:'amigos',label:'Amigos',Icon:Users},{id:'perfil',label:'Meu perfil',Icon:Smile}]
function Avatar({text,size=''}:{text:string;size?:string}){return <span className={'avatar '+size}>{text}</span>}
export default function App(){
const [page,setPage]=useState<Page>('inicio')
const [posts,setPosts]=useState(()=>saved('revival-posts',starterPosts))
const [scraps,setScraps]=useState(()=>saved('revival-scraps',starterScraps))
const [communities,setCommunities]=useState(()=>saved('revival-communities',starterCommunities))
const [name,setName]=useState(()=>saved('revival-name','João Vitor'))
const [bio,setBio]=useState(()=>saved('revival-bio','vivendo, aprendendo e colecionando boas histórias ✨'))
const [followed,setFollowed]=useState<string[]>(()=>saved('revival-followed',[]))
const [draft,setDraft]=useState('')
const [scrapDraft,setScrapDraft]=useState('')
const [search,setSearch]=useState('')
const [editing,setEditing]=useState(false)
const [notifications,setNotifications]=useState(false)
const [friendTab,setFriendTab]=useState<'amigos'|'conversas'|'comunidades'>('amigos')
const [chatFriend,setChatFriend]=useState(friendNames[0])
const [chatText,setChatText]=useState('')
const [messages,setMessages]=useState<Record<string,string[]>>(()=>saved('revival-chats',{}))

useEffect(()=>{localStorage.setItem('revival-posts',JSON.stringify(posts))},[posts])
useEffect(()=>{localStorage.setItem('revival-scraps',JSON.stringify(scraps))},[scraps])
useEffect(()=>{localStorage.setItem('revival-communities',JSON.stringify(communities))},[communities])
useEffect(()=>{localStorage.setItem('revival-name',JSON.stringify(name))},[name])
useEffect(()=>{localStorage.setItem('revival-bio',JSON.stringify(bio))},[bio])
useEffect(()=>{localStorage.setItem('revival-followed',JSON.stringify(followed))},[followed])
useEffect(()=>{localStorage.setItem('revival-chats',JSON.stringify(messages))},[messages])
const filtered=useMemo(()=>posts.filter(p=>(p.author+p.text).toLowerCase().includes(search.toLowerCase())),[posts,search])
const post=()=>{if(!draft.trim())return;setPosts(p=>[{id:Date.now(),author:name,avatar:'✨',time:'agora',text:draft.trim(),likes:0},...p]);setDraft('')}
const addScrap=()=>{if(!scrapDraft.trim())return;setScraps(s=>[{id:Date.now(),author:name,text:scrapDraft.trim(),time:'agora'},...s]);setScrapDraft('')}
const changePage=(p:Page)=>{setPage(p);setSearch('')}
const sendMessage=()=>{if(!chatText.trim())return;setMessages(old=>({...old,[chatFriend]:[...(old[chatFriend]||[]),chatText.trim()]}));setChatText('')}
return <div className="app">
<header className="topbar"><div className="top-inner"><button className="brand" onClick={()=>changePage('inicio')}><span className="brand-flower">✿</span> revival<span className="brand-dot">.</span></button><span className="slogan">conectando pessoas, fortalecendo a fé</span><div className="top-actions"><label className="search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar no revival..."/></label><button className="icon-button" aria-label="Notificações" onClick={()=>setNotifications(!notifications)}><Bell size={19}/></button><button className="account" onClick={()=>changePage('perfil')}><Avatar text="✨"/><span>{name.split(' ')[0]}</span></button></div>{notifications&&<div className="notification">✨ Você está por dentro de tudo! Sem notificações novas.</div>}</div></header>
<div className="welcome"><div className="welcome-content">✦ Bem-vindo ao Revival! <strong>Compartilhe sua fé e viva conexões verdadeiras.</strong></div></div>
<div className="layout"><main className="main">
{page==='inicio'&&<><div className="section-heading"><div><span className="eyebrow">comunidade cristã</span><h1>Bom te ver por aqui, {name.split(' ')[0]}! <span>💜</span></h1><p>Compartilhe fé, esperança e comunhão.</p></div></div><section className="card composer"><div className="compose-line"><Avatar text="✨"/><textarea aria-label="Nova publicação" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="O que Deus colocou em seu coração?" rows={2}/></div><div className="compose-footer"><span>✦ Compartilhe uma reflexão ou testemunho</span><button className="primary" onClick={post}><Plus size={16}/> Publicar</button></div></section><div className="feed-heading"><h2>Novidades dos amigos</h2><span>☀️ tudo fresquinho</span></div>{filtered.map(p=><article className="card post" key={p.id}><div className="post-head"><Avatar text={p.avatar}/><div><strong>{p.author}</strong><small>{p.time} · 🌎 Público</small></div><span className="more">···</span></div><p>{p.text}</p><div className="post-stats">💗 {p.likes} curtidas</div><div className="post-actions"><button className={p.liked?'liked':''} onClick={()=>setPosts(a=>a.map(x=>x.id===p.id?{...x,liked:!x.liked,likes:x.likes+(x.liked?-1:1)}:x))}><Heart size={18} fill={p.liked?'currentColor':'none'}/> {p.liked?'Curtido':'Curtir'}</button><button onClick={()=>changePage('recados')}><MessageCircle size={18}/> Recados</button></div></article>)}{filtered.length===0&&<div className="card empty">Nenhuma publicação encontrada.</div>}</>}
{page==='perfil'&&<section className="card page-card"><div className="profile-banner">✿ revival ✿</div><div className="profile-header"><Avatar text="✨" size="giant"/><div><h1>{name}</h1><p>@{name.toLowerCase().replace(/\s+/g,'.')}</p></div><button className="outline" onClick={()=>setEditing(!editing)}>{editing?'Concluir':'Editar perfil'}</button></div>{editing?<div className="edit-form"><label>Seu nome<input value={name} maxLength={50} onChange={e=>setName(e.target.value)}/></label><label>Sobre você<textarea value={bio} maxLength={180} onChange={e=>setBio(e.target.value)}/></label><button className="primary" onClick={()=>setEditing(false)}>Salvar perfil</button></div>:<><h3>Quem sou eu</h3><p>{bio}</p><div className="stats"><span>👥 {friendNames.length} amigos</span><span>💌 {scraps.length} recados</span><span>💜 {communities.filter(c=>c.joined).length} comunidades</span></div><h3>Meu jeito de ser</h3><div className="chips"><span>☺️ de bem com a vida</span><span>🎵 música</span><span>✨ nostalgia</span></div></>}</section>}
{page==='recados'&&<section className="card page-card"><div className="page-title"><Mail size={25}/><div><h1>Meu mural de recados</h1><p>Uma mensagem simples pode alegrar o dia inteiro 💌</p></div></div><div className="scrap-compose"><textarea rows={3} value={scrapDraft} onChange={e=>setScrapDraft(e.target.value)} placeholder="Deixe um recadinho especial..."/><button className="primary" onClick={addScrap}><Send size={16}/> Enviar recado</button></div>{scraps.map(s=><div className="scrap" key={s.id}><Avatar text="💌"/><div><strong>{s.author}</strong><small>{s.time}</small><p>{s.text}</p></div></div>)}</section>}
{page==='amigos'&&<section className="card page-card friends-hub">
<div className="page-title"><Users size={25}/><div><h1>Conexões</h1><p>Um lugar para conversar, fazer amigos e participar de comunidades.</p></div></div>
<nav className="friends-tabs" aria-label="Navegação de amigos">
<button className={friendTab==='amigos'?'active':''} onClick={()=>setFriendTab('amigos')}><Users size={17}/> Amigos</button>
<button className={friendTab==='conversas'?'active':''} onClick={()=>setFriendTab('conversas')}><MessageCircle size={17}/> Conversas</button>
<button className={friendTab==='comunidades'?'active':''} onClick={()=>setFriendTab('comunidades')}><Heart size={17}/> Comunidades</button>
</nav>
{friendTab==='amigos'&&<><h2 className="inner-heading">Meus amigos</h2><div className="friend-grid">{friendNames.filter(n=>n.toLowerCase().includes(search.toLowerCase())).map((n,i)=><div className="friend" key={n}><Avatar text={['🌷','🎧','🌸','🌞','🦋','🎮','✨','🎸','💐'][i%9]}/><strong>{n}</strong><small>{i%3===0?'🟢 online':'amigo do revival'}</small><button className="outline" onClick={()=>{setChatFriend(n);setFriendTab('conversas')}}><MessageCircle size={14}/> Conversar</button><button className="friend-follow" onClick={()=>setFollowed(f=>f.includes(n)?f.filter(x=>x!==n):[...f,n])}>{followed.includes(n)?'✓ Seguindo':'+ Seguir'}</button></div>)}</div></>}
{friendTab==='conversas'&&<div className="conversations"><div className="conversation-list">{friendNames.filter(n=>n.toLowerCase().includes(search.toLowerCase())).map((n,i)=><button key={n} className={chatFriend===n?'selected':''} onClick={()=>setChatFriend(n)}><Avatar text={['🌷','🎧','🌸','🌞','🦋','🎮','✨','🎸','💐'][i%9]}/><span><strong>{n}</strong><small>{(messages[n]||[]).length?messages[n][messages[n].length-1]:'Iniciar conversa'}</small></span></button>)}</div><div className="conversation-panel"><div className="conversation-header"><MessageCircle size={19}/><strong>{chatFriend}</strong></div><div className="conversation-messages">{(messages[chatFriend]||[]).length===0?<div className="chat-empty"><MessageCircle size={30}/><p>Comece uma conversa com {chatFriend.split(' ')[0]}.</p><small>Esta é uma demonstração local. As mensagens ainda não são entregues a outros usuários.</small></div>:(messages[chatFriend]||[]).map((msg,i)=><div className="chat-bubble" key={i}>{msg}</div>)}</div><form className="chat-form" onSubmit={e=>{e.preventDefault();sendMessage()}}><input aria-label="Mensagem" value={chatText} onChange={e=>setChatText(e.target.value)} placeholder="Escreva uma mensagem..."/><button className="primary" type="submit" disabled={!chatText.trim()}><Send size={17}/></button></form></div></div>}
{friendTab==='comunidades'&&<><h2 className="inner-heading">Comunidades</h2><div className="community-list">{communities.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())).map(c=><div className="community" key={c.id}><Avatar text={c.icon} size="large"/><div><strong>{c.name}</strong><small>👥 {c.members} membros</small></div><button className={c.joined?'outline':'primary'} onClick={()=>setCommunities(cs=>cs.map(x=>x.id===c.id?{...x,joined:!x.joined}:x))}>{c.joined?'✓ Participando':'+ Participar'}</button></div>)}</div></>}
</section>}
</main></div><nav className="bottom-navigation" aria-label="Navegação principal"><div className="bottom-navigation-inner">{menu.map(({id,label,Icon})=><button type="button" key={id} className={page===id?"active":""} aria-current={page===id?"page":undefined} onClick={()=>changePage(id)}><Icon size={20}/><span>{label}</span>{id==="recados"&&<span className="nav-count">{scraps.length}</span>}</button>)}</div></nav><footer>revival ✿ — conectando pessoas, fortalecendo a fé.</footer></div>
}
