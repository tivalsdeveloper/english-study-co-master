(()=>{
  const PROJECT='kxuszpixwfecawdeqkrx';
  const AUTH_KEY=`sb-${PROJECT}-auth-token`;
  const getSession=()=>{
    try{
      const raw=localStorage.getItem(AUTH_KEY);
      if(!raw)return null;
      const data=JSON.parse(raw);
      const s=data?.access_token?data:data?.currentSession||data?.session;
      if(!s?.access_token)return null;
      if(s.expires_at && s.expires_at*1000<=Date.now())return null;
      return s;
    }catch{return null}
  };
  const openSignIn=()=>{
    const candidates=[...document.querySelectorAll('button,a')];
    const btn=candidates.find(el=>/^\s*sign\s*in\s*$/i.test(el.textContent||'')||/sign in/i.test(el.getAttribute('aria-label')||''));
    if(btn){btn.click();return}
    window.dispatchEvent(new CustomEvent('english-open-sign-in'));
    const login=document.querySelector('.auth-card,.login-card,.signin-card,[data-auth="signin"]');
    login?.scrollIntoView({behavior:'smooth',block:'center'});
  };
  const openProfile=()=>window.dispatchEvent(new CustomEvent('english-open-profile'));
  function sync(){
    const top=document.querySelector('.ref-top');
    if(!top)return;
    const old=top.querySelector('.ref-avatar,.ref-signin');
    if(!old)return;
    const s=getSession();
    if(s){
      old.className='ref-avatar';
      old.setAttribute('aria-label','View profile');
      const name=s.user?.user_metadata?.username||s.user?.user_metadata?.full_name||s.user?.email||'User';
      old.textContent=(name.trim()[0]||'U').toUpperCase();
      old.onclick=openProfile;
    }else{
      old.className='ref-signin';
      old.setAttribute('aria-label','Sign in');
      old.textContent='Sign in';
      old.onclick=openSignIn;
    }
  }
  const style=document.createElement('style');
  style.textContent=`.ref-top{min-height:86px!important;padding:12px clamp(14px,3vw,28px)!important;gap:14px!important}.ref-top .ref-title{min-width:0!important;flex:1!important}.ref-top .ref-title b{font-size:clamp(20px,3.6vw,30px)!important;line-height:1.08!important;letter-spacing:-.02em!important}.ref-top .ref-title small{font-size:clamp(12px,2.3vw,16px)!important;opacity:.72!important;margin-top:5px!important}.ref-top .ref-title span{font-size:14px!important;white-space:nowrap!important}.ref-signin{flex:0 0 auto!important;min-width:86px!important;height:44px!important;padding:0 18px!important;border:1px solid color-mix(in srgb,var(--theme-accent,#268cff) 70%,white)!important;border-radius:999px!important;background:var(--theme-accent,#268cff)!important;color:white!important;font:700 15px/1 system-ui,sans-serif!important;cursor:pointer!important}.ref-signin:active{transform:scale(.97)}@media(max-width:620px){.ref-top{grid-template-columns:auto minmax(0,1fr) auto auto!important}.ref-top .ref-cap{display:none!important}.ref-top .ref-title span{display:none!important}.ref-top .ref-title small{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.ref-signin{min-width:72px!important;height:40px!important;padding:0 12px!important;font-size:14px!important}.ref-top .ref-search{width:42px!important;height:42px!important}}`;
  document.head.appendChild(style);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();
  window.addEventListener('storage',sync);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
  new MutationObserver(ms=>{if(ms.some(m=>m.addedNodes.length))sync()}).observe(document.documentElement,{childList:true,subtree:true});
})();