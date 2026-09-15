(()=>{
  if(window.__aiMediaSessionFix)return;window.__aiMediaSessionFix=true;
  const CHAT_HISTORY='english-ai-chat-history',ACTIVE='english-ai-active-chat';
  const uid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const style=document.createElement('style');
  style.textContent=`
    .ai-messages{display:flex!important;flex-direction:column!important;align-items:stretch!important;overflow-x:hidden!important}
    .ai-messages>article{position:relative!important;inset:auto!important;float:none!important;transform:none!important;flex:0 0 auto!important;clear:both!important}
    .ai-messages>article.ai-media-response{display:block!important;isolation:isolate!important;z-index:0!important;width:100%!important;max-width:620px!important;margin:8px 0 18px!important;overflow:visible!important}
    .ai-messages>article.ai-media-response>.ai-message-content{position:relative!important;inset:auto!important;display:block!important;width:100%!important;height:auto!important;overflow:visible!important;transform:none!important}
    .ai-messages>article.ai-media-response .ai-media-card{position:relative!important;inset:auto!important;display:block!important;width:100%!important;height:auto!important;overflow:visible!important;transform:none!important}
    .ai-messages>article.ai-media-response img,.ai-messages>article.ai-media-response video{position:relative!important;inset:auto!important;display:block!important;width:100%!important;height:auto!important;max-height:58vh!important;object-fit:contain!important;transform:none!important}
    .ai-messages>article.ai-media-response~article{position:relative!important;z-index:1!important;clear:both!important;margin-top:8px!important}
    .ai-messages>article.ai-thinking{position:relative!important;inset:auto!important;z-index:2!important}
  `;
  document.head.appendChild(style);

  function clearMediaFromView(){document.querySelectorAll('.ai-messages [data-media-id],.ai-messages .ai-media-response,.ai-messages .ai-thinking').forEach(x=>x.remove())}
  function startNewChat(){
    const id=uid();
    sessionStorage.setItem(ACTIVE,id);
    localStorage.removeItem(CHAT_HISTORY);
    clearMediaFromView();
    location.reload();
  }
  window.addEventListener('english-ai-new-chat',e=>{e.preventDefault?.();startNewChat()});

  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('.ai-new-chat');
    if(!b||b.dataset.sessionFixBound==='1')return;
    e.preventDefault();e.stopImmediatePropagation();startNewChat();
  },true);

  function repairNesting(){
    document.querySelectorAll('.ai-messages article[data-media-id]').forEach(media=>{
      [...media.querySelectorAll(':scope > article.assistant,:scope > article.user')].forEach(reply=>media.after(reply));
    });
  }
  let timer;
  new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(repairNesting,30)}).observe(document.documentElement,{childList:true,subtree:true});
  repairNesting();
})();