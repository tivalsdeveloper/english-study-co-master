import type {Context} from "@netlify/functions";

type Message={role:"user"|"assistant";content:string};
const allowedOrigins=new Set(["https://english.tivalsdeveloper.site","https://english-study-co-master.netlify.app"]);

function headers(origin:string|null){return {"Content-Type":"application/json","Access-Control-Allow-Origin":origin&&allowedOrigins.has(origin)?origin:"https://english.tivalsdeveloper.site","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}}

export default async(req:Request,_context:Context)=>{
 const origin=req.headers.get("origin"),cors=headers(origin);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 if(req.method!=="POST")return new Response(JSON.stringify({error:"Method not allowed."}),{status:405,headers:cors});
 try{
  const key=Netlify.env.get("APINEX_API_KEY");
  if(!key)return new Response(JSON.stringify({error:"AI Tutor is not configured yet."}),{status:503,headers:cors});
  const body=await req.json() as {messages?:Message[]};
  const messages=(body.messages||[]).filter(m=>(m.role==="user"||m.role==="assistant")&&typeof m.content==="string").slice(-10).map(m=>({role:m.role,content:m.content.trim().slice(0,2000)})).filter(m=>m.content);
  if(!messages.length)return new Response(JSON.stringify({error:"Please enter a question."}),{status:400,headers:cors});
  const upstream=await fetch("https://api.apinex.bond/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"free/gemini-3.1-pro",messages:[{role:"system",content:"You are the friendly AI English Tutor for English Study Co.Master. Teach English clearly using simple language appropriate to the learner. Correct mistakes kindly, explain why, provide short examples, and ask a useful practice question when appropriate. Help with grammar, vocabulary, writing, reading, speaking practice, and assignments. Keep most answers concise and mobile-friendly."},...messages],temperature:.5,max_tokens:900})});
  const data=await upstream.json() as {choices?:{message?:{content?:string}}[];error?:{message?:string}|string};
  if(!upstream.ok){const detail=typeof data.error==="string"?data.error:data.error?.message;return new Response(JSON.stringify({error:detail||"The AI service is temporarily unavailable."}),{status:upstream.status===429?429:502,headers:cors})}
  const reply=data.choices?.[0]?.message?.content?.trim();
  if(!reply)return new Response(JSON.stringify({error:"The AI returned an empty response. Please try again."}),{status:502,headers:cors});
  return new Response(JSON.stringify({reply}),{headers:cors});
 }catch{return new Response(JSON.stringify({error:"The AI Tutor could not process that message."}),{status:500,headers:cors})}
};
