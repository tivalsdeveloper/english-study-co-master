import {NextRequest,NextResponse} from "next/server";

export async function GET(request:NextRequest){
 const word=(request.nextUrl.searchParams.get("word")||"").trim().toLowerCase();
 if(!/^[a-z][a-z '-]{0,78}[a-z]$|^[a-z]$/.test(word))return NextResponse.json({error:"Enter a valid English word."},{status:400});
 try{
  const response=await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/"+encodeURIComponent(word),{signal:AbortSignal.timeout(8000),headers:{accept:"application/json"},next:{revalidate:86400}});
  if(response.status===404)return NextResponse.json({error:"We could not find that word. Check the spelling and try again."},{status:404});
  if(!response.ok)throw new Error("Dictionary provider error");
  return NextResponse.json(await response.json(),{headers:{"Cache-Control":"public, max-age=3600, s-maxage=86400"}});
 }catch{return NextResponse.json({error:"The dictionary is temporarily unavailable. Please try again."},{status:503})}
}
