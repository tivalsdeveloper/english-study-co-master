import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json"};
const fallback=[{id:"free/gemini-3.1-pro",name:"Gemini 3.1 Pro"}];
async function freeModels(key:string){try{const r=await fetch("https://api.apinex.bond/v1/models",{headers:{Authorization:`Bearer ${key}`}});if(!r.ok)return fallback;const p=await r.json();const list=(p.data||[]).filter((x:any)=>x.id?.startsWith("free/")).map((x:any)=>({id:x.id,name:x.name||x.id.replace("free/","")}));return list.length?list:fallback}catch{return fallback}}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 const key=Deno.env.get("APINEX_API_KEY");
 if(!key)return new Response(JSON.stringify({error:"AI Tutor is not configured in Supabase yet."}),{status:503,headers:cors});
 try{
  const body=await req.json(),available=await freeModels(key);
  if(body.action==="models")return new Response(JSON.stringify({models:available}),{headers:cors});
  const allowed=new Set(available.map(x=>x.id)),model=body.model&&allowed.has(body.model)?body.model:available[0].id;
  const messages=(body.messages||[]).slice(-12).filter((x:any)=>x&&(x.role==="user"||x.role==="assistant")&&typeof x.content==="string").map((x:any)=>({...x,content:x.content.slice(0,12000)}));
  let system="You are a friendly AI English tutor. Teach clearly, correct mistakes kindly, explain why, and keep answers mobile-friendly.";
  if(body.task==="create-assignment")system="Create a classroom English assignment. Return a clear title, numbered instructions and questions, then a concise marking guide. Match the requested topic, level and total marks. Plain text only.";
  if(body.task==="grade-assignment")system="Assist a teacher with marking. Return exactly: SUGGESTED SCORE: [number]; FEEDBACK: [constructive feedback]. Never exceed the maximum mark. The teacher makes the final decision.";
  if(body.context)messages.unshift({role:"user",content:String(body.context).slice(0,16000)});
  if(!messages.length)return new Response(JSON.stringify({error:"Please enter a request."}),{status:400,headers:cors});
  const upstream=await fetch("https://api.apinex.bond/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model,messages:[{role:"system",content:system},...messages],temperature:.4,max_tokens:1200})});
  const payload=await upstream.json();if(!upstream.ok)throw new Error(payload.error?.message||"The selected model is unavailable.");
  const reply=payload.choices?.[0]?.message?.content?.trim();if(!reply)throw new Error("The AI returned an empty response.");
  return new Response(JSON.stringify({reply,model}),{headers:cors});
 }catch(error){return new Response(JSON.stringify({error:error instanceof Error?error.message:"The AI could not process that request."}),{status:500,headers:cors})}
});
