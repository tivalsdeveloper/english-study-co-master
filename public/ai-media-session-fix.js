(()=>{
  if(window.__aiMediaSessionFix)return;window.__aiMediaSessionFix=true;
  const CHAT_HISTORY='english-ai-chat-history',ACTIVE='english-ai-active-chat';
  const uid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const style=document.createElement('style');
  style.textContent=`
    .ai-tutor{--chat-max:820px!important}
    .ai-messages{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:4px!important;overflow-x:hidden!important;scroll-behavior:smooth!important;padding-inline:clamp(12px,3vw,28px)!important}
    .ai-messages>article{position:relative!important;inset:auto!important;float:none!important;transform:none!important;flex:0 0 auto!important;clear:both!important;box-sizing:border-box!important}
    .ai-messages>article.user{align-self:flex-end!important;max-width:min(82%,620px)!important;border-radius:20px 20px 5px 20px!important;overflow-wrap:anywhere!important}
    .ai-messages>article.assistant:not(.ai-media-response){align-self:flex-start!important;max-width:min(100%,var(--chat-max))!important;line-height:1.58!important}
    .ai-messages>article.ai-media-response{display:block!important;align-self:flex-start!important;isolation:isolate!important;z-index:0!important;width:min(100%,620px)!important;max-width:620px!important;margin:10px 0 20px!important;overflow:visible!important}
    .ai-messages>article.ai-media-response>.ai-message-content{position:relative!important;inset:auto!important;display:block!important;width:100%!important;height:auto!important;overflow:visible!important;transform:none!important}
    .ai-media-intro{margin:0 0 10px!important;font-weight:600!important}
    .ai-messages>article.ai-media-response .ai-media-card{position:relative!important;inset:auto!important;display:block!important;width:100%!important;height:auto!important;overflow:visible!important;transform:none!important}
    .ai-messages>article.ai-media-response img,.ai-messages>article.ai-media-response video{position:relative!important;inset:auto!important;display:block!important;width:100%!important;height:auto!important;max-height:58vh!important;object-fit:contain!important;transform:none!important;border-radius:18px!important}
    .ai-media-caption{font-size:14px!important;opacity:.78!important;margin-top:10px!important}
    .ai-messages>article.ai-media-response~article{position:relative!important;z-index:1!important;clear:both!important;margin-top:10px!important}
    .ai-messages>article.ai-thinking{position:relative!important;inset:auto!important;z-index:2!important;min-height:38px!important}
    .ai-compose{max-width:var(--chat-max)!important;margin-inline:auto!important;border-radius:24px!important;box-shadow:0 8px 30px rgba(0,0,0,.16)!important}
    .ai-compose textarea{min-height:44px!important;max-height:150px!important;line-height:1.45!important}
    .reference-nav,.ai-history-panel{overscroll-behavior:contain!important}
    .reference-tools button,.ai-compose button,.reference-nav button{touch-action:manipulation!important}
    @media(max-width:760px){
      .ai-messages{padding-inline:12px!important}
      .ai-messages>article.user{max-width:86%!important}
      .ai-messages>article.ai-media-response{width:100%!important;max-width:100%!important}
      .ai-messages>article.ai-media-response img,.ai-messages>article.ai-media-response video{max-height:52vh!important}
      .ai-compose{width:calc(100% - 20px)!important;margin-inline:10px!important}
    }
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
    if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();startNewChat();
  },true);

  function repairNesting(){
    const messages=document.querySelector('.ai-messages');
    if(!messages)return;
    document.querySelectorAll('.ai-messages article[data-media-id]').forEach(media=>{
      [...media.querySelectorAll(':scope > article.assistant,:scope > article.user')].forEach(reply=>media.after(reply));
      [...media.querySelectorAll('.ai-media-card article.assistant,.ai-media-card article.user')].forEach(reply=>media.after(reply));
    });
    [...messages.querySelectorAll(':scope > article')].forEach(node=>{
      node.style.removeProperty('top');node.style.removeProperty('left');node.style.removeProperty('bottom');node.style.removeProperty('right');
    });
  }
  let timer;
  new MutationObserver(ms=>{
    if(!ms.some(m=>m.addedNodes.length))return;
    clearTimeout(timer);timer=setTimeout(repairNesting,20);
  }).observe(document.documentElement,{childList:true,subtree:true});
  repairNesting();
})();