import "jsr:@supabase/functions-js/edge-runtime.d.ts";
declare const Deno: any;
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json"};
const fallback=[{id:"free/gemini-3.1-pro",name:"Gemini 3.1 Pro"}];
async function freeModels(key:string){try{const r=await fetch("https://api.apinex.bond/v1/models",{headers:{Authorization:`Bearer ${key}`}});if(!r.ok)return fallback;const p:any=await r.json();const list=(p.data||[]).filter((x:any)=>x.id?.startsWith("free/")).map((x:any)=>({id:x.id,name:x.name||x.id.replace("free/","")}));return list.length?list:fallback}catch{return fallback}}
Deno.serve(async(req: Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 const key=Deno.env.get("APINEX_API_KEY"),openRouterKey=Deno.env.get("OPENROUTER_API_KEY");
 if(!key&&!openRouterKey)return new Response(JSON.stringify({error:"AI Tutor is not configured in Supabase yet."}),{status:503,headers:cors});
 try{
  const body:any=await req.json(),available=[...(key?await freeModels(key):[]),...(openRouterKey?[{id:"openrouter/free",name:"OpenRouter Free Models"}]:[])];
  if(body.action==="models")return new Response(JSON.stringify({models:available}),{headers:cors});
  const allowed=new Set(available.map(x=>x.id));
  let model=body.model&&allowed.has(body.model)?body.model:available[0].id;
  if(body.task==="dictionary"&&allowed.has("free/gemini-3.1-pro"))model="free/gemini-3.1-pro";
  const messages=(body.messages||[]).slice(-12).filter((x:any)=>x&&(x.role==="user"||x.role==="assistant")&&typeof x.content==="string").map((x:any)=>({...x,content:x.content.slice(0,12000)}));
  let system="You are a friendly AI English tutor. Teach clearly, correct mistakes kindly, explain why, and keep answers mobile-friendly.";
  if(body.task==="create-assignment")system="Create a classroom English assignment. Return a clear title, numbered instructions and questions, then a concise marking guide. Match the requested topic, level and total marks. Plain text only.";
  if(body.task==="create-lesson")system="Create a complete classroom English lesson for the requested topic and level. Include learning objectives, a clear explanation, useful examples, vocabulary where relevant, guided practice, an independent student activity, a quick knowledge check, homework, and short teacher notes. Format it clearly for reading on a phone. Plain text only.";
  if(body.task==="grade-assignment")system="Assist a teacher with marking. Return exactly: SUGGESTED SCORE: [number]; FEEDBACK: [constructive feedback]. Never exceed the maximum mark. The teacher makes the final decision.";
  if(body.task==="dictionary"){
   const word=String(body.word||"").trim().slice(0,80);
   if(!word)return new Response(JSON.stringify({error:"Please enter an English word."}),{status:400,headers:cors});
   system='You are an accurate learner dictionary. Return ONLY valid JSON with this exact shape: {"word":"correct spelling","phonetic":"simple IPA or pronunciation guide","meanings":[{"partOfSpeech":"noun, verb, adjective, etc.","definitions":[{"definition":"clear beginner-friendly meaning","example":"natural example sentence"}],"synonyms":["word"],"antonyms":["word"]}]}. Give up to 3 common meanings and up to 3 definitions per meaning. Use empty arrays when no reliable synonyms or antonyms exist. Do not use markdown or add commentary.';
   messages.push({role:"user",content:`Explain the English word: ${word}`});
  }
  if(body.context)messages.unshift({role:"user",content:String(body.context).slice(0,16000)});
  if(!messages.length)return new Response(JSON.stringify({error:"Please enter a request."}),{status:400,headers:cors});
  const useOpenRouter=model==="openrouter/free";
  const upstream=await fetch(useOpenRouter?"https://openrouter.ai/api/v1/chat/completions":"https://api.apinex.bond/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${useOpenRouter?openRouterKey:key}`,"Content-Type":"application/json",...(useOpenRouter?{"HTTP-Referer":"https://english.tivalsdeveloper.site","X-Title":"English Study Co.Master"}:{})},body:JSON.stringify({model,messages:[{role:"system",content:system},...messages],temperature:.4,max_tokens:1200})});
  const payload:any=await upstream.json();if(!upstream.ok)throw new Error(payload.error?.message||"The selected model is unavailable.");
  const reply=payload.choices?.[0]?.message?.content?.trim();if(!reply)throw new Error("The AI returned an empty response.");
  if(body.task==="dictionary"){
   try{
    const cleaned=reply.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim(),entry=JSON.parse(cleaned);
    if(!entry?.word||!Array.isArray(entry.meanings)||!entry.meanings.length)throw new Error("invalid dictionary response");
    return new Response(JSON.stringify({entry,model}),{headers:cors});
   }catch{throw new Error("The AI could not create a reliable dictionary entry. Please try again.")}
  }
  return new Response(JSON.stringify({reply,model}),{headers:cors});
 }catch(error){return new Response(JSON.stringify({error:error instanceof Error?error.message:"The AI could not process that request."}),{status:500,headers:cors})}
});
