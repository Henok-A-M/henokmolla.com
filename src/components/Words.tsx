
export default function Words({text,className=""}:{text:string;className?:string}){
 const tokens=text.split(/\s+/).filter(Boolean);
 return <>{tokens.map((word,i)=><span key={i} className={className} data-word="true">{word}{i<tokens.length-1?" ":""}</span>)}</>;
}
