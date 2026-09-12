const cors={"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET,POST,OPTIONS"};
const endpoint="https://kxuszpixwfecawdeqkrx.supabase.co/functions/v1/ai-tutor";
export default async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 try{
  const init:RequestInit={method:req.method,headers:{"Content-Type":"application/json"},signal:AbortSignal.timeout(50000)};
  if(req.method!=="GET")init.body=await req.text();
  const upstream=await fetch(endpoint,init);
  const text=await upstream.text();
  return new Response(text,{status:upstream.status,headers:cors});
 }catch(error){return Response.json({error:error instanceof Error?error.message:"The AI service is temporarily unavailable."},{status:502,headers:cors})}
};
