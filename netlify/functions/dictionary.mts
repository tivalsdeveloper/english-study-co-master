import type {Context,Config} from "@netlify/functions";

export default async function dictionary(request:Request,_context:Context){
 const word=(new URL(request.url).searchParams.get("word")||"").trim().toLowerCase();
 if(!/^[a-z][a-z '-]{0,78}[a-z]$|^[a-z]$/.test(word))return Response.json({error:"Enter a valid English word."},{status:400});
 try{
  const response=await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/"+encodeURIComponent(word),{signal:AbortSignal.timeout(8000),headers:{accept:"application/json"}});
  if(response.status===404)return Response.json({error:"We could not find that word. Check the spelling and try again."},{status:404});
  if(!response.ok)throw new Error("Dictionary provider error");
  return new Response(await response.text(),{headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=3600, s-maxage=86400"}});
 }catch{return Response.json({error:"The dictionary is temporarily unavailable. Please try again."},{status:503})}
}

export const config:Config={path:"/api/dictionary"};
