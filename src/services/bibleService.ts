export type BibleVerse = {text:string;book:string;chapter:number;verse:number;reference:string}
type BookData={book:string;chapters:{chapter:number;verses:{number:number;text:string}[]}[]}
const references:[string,string,number,number][]=[
['Gen','Gênesis',1,1],['Ps','Salmos',23,1],['Prov','Provérbios',3,5],['Isa','Isaías',41,10],
['Jer','Jeremias',29,11],['Matt','Mateus',5,14],['Matt','Mateus',6,33],['Matt','Mateus',11,28],
['John','João',3,16],['John','João',8,12],['John','João',14,6],['John','João',14,27],
['Rom','Romanos',8,28],['Rom','Romanos',12,12],['1Cor','1 Coríntios',13,4],['2Cor','2 Coríntios',5,7],
['Gal','Gálatas',5,22],['Eph','Efésios',2,8],['Phil','Filipenses',4,6],['Phil','Filipenses',4,13],
['Col','Colossenses',3,23],['1Thess','1 Tessalonicenses',5,17],['Heb','Hebreus',11,1],
['Jas','Tiago',1,5],['1Pet','1 Pedro',5,7],['1John','1 João',4,19],['Rev','Apocalipse',21,4]
]
function localDateKey(now:Date){return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-')}
export function todayKey(){return localDateKey(new Date())}
export async function dailyVerse(date=new Date()):Promise<BibleVerse>{
const day=Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000)
const [id,book,chapter,verse]=references[((day%references.length)+references.length)%references.length]
const response=await fetch('/bible/'+id+'.json')
if(!response.ok)throw new Error('Não foi possível carregar o texto bíblico local.')
const data:BookData=await response.json()
const found=data.chapters.find(c=>c.chapter===chapter)?.verses.find(v=>v.number===verse)
if(!found?.text)throw new Error('Versículo não encontrado nos arquivos da Bíblia.')
return {book,chapter,verse,text:found.text,reference:book+' '+chapter+':'+verse}
}
export const bibleSource='Almeida 1819 (Bíblia Livre) — domínio público. Fonte: midvash/bible-data.'
