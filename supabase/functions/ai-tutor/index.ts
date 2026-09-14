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
  const messages=(body.messages||[]).slice(-12).filter((x:any)=>x&&(x.role==="user"||x.role==="assistant")&&typeof x.content==="string").map((x:any)=>({...x,content:x.content.slice(0,12000)}));
  let system="You are a friendly expert English tutor. Answer the learner's exact question first. Use clear headings for longer answers, short paragraphs, numbered steps when teaching a process, and bullet points for examples. Bold key terms with markdown. Give natural example sentences and explain corrections kindly. End with one short practice question when useful. Avoid filler, repetition, and very long paragraphs. Keep the answer accurate and easy to read on a phone.";
  if(body.task==="create-assignment")system="Create a classroom English multiple-choice quiz with exactly 10 questions. Every question must use this plain-text format: 1. Question text, then four separate lines A. option, B. option, C. option, D. option. Include only one correct option per question. After all questions add a section named MARKING GUIDE with each question number and correct letter. Match the topic, level and total marks. Do not use markdown tables.";
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
  const otherApinex=available.map(x=>x.id).filter(id=>id!==model&&id!=="openrouter/free").slice(0,8);
  const candidates=[...new Set([model,...otherApinex,...(openRouterKey?["openrouter/free"]:[])])],failures:string[]=[];
  for(const candidate of candidates){
   try{
    const useOpenRouter=candidate==="openrouter/free";
    const upstream=await fetch(useOpenRouter?"https://openrouter.ai/api/v1/chat/completions":"https://api.apinex.bond/v1/chat/completions",{method:"POST",signal:AbortSignal.timeout(25000),headers:{Authorization:`Bearer ${useOpenRouter?openRouterKey:key}`,"Content-Type":"application/json",...(useOpenRouter?{"HTTP-Referer":"https://english.tivalsdeveloper.site","X-Title":"English Study Co.Master"}:{})},body:JSON.stringify({model:candidate,messages:[{role:"system",content:system},...messages],temperature:.4,max_tokens:1200,...(body.task==="dictionary"?{response_format:{type:"json_object"}}:{})})});
    const raw=await upstream.text();let payload:any={};try{payload=JSON.parse(raw)}catch{throw new Error("invalid service response")}
    if(!upstream.ok)throw new Error(payload.error?.message||`HTTP ${upstream.status}`);
    const reply=payload.choices?.[0]?.message?.content?.trim();if(!reply)throw new Error("empty response");
    if(body.task==="dictionary"){
     const cleaned=reply.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim(),jsonStart=cleaned.indexOf("{"),jsonEnd=cleaned.lastIndexOf("}"),entry=JSON.parse(jsonStart>=0&&jsonEnd>jsonStart?cleaned.slice(jsonStart,jsonEnd+1):cleaned);
     if(!entry?.word||!Array.isArray(entry.meanings)||!entry.meanings.length)throw new Error("invalid dictionary response");
     return new Response(JSON.stringify({entry,model:candidate,fallbackUsed:candidate!==model}),{headers:cors});
    }
    return new Response(JSON.stringify({reply,model:candidate,fallbackUsed:candidate!==model}),{headers:cors});
   }catch(error){failures.push(`${candidate}: ${error instanceof Error?error.message:"failed"}`)}
  }
  return new Response(JSON.stringify({error:"All AI models are temporarily unavailable. Please try again shortly.",attemptedModels:candidates.length,details:failures.slice(0,3)}),{headers:cors});
 }catch(error){return new Response(JSON.stringify({error:error instanceof Error?error.message:"The AI could not process that request."}),{headers:cors})}
});
