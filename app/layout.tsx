import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./otp.css";
import "./group-room.css";

export const metadata: Metadata = {
  title: "English Study Co.Master",
  description: "Learn English, teach with confidence, and grow together.",
  other: {
    "codex-preview": "development",
    monetag: "2390b319b0306a2fdad9f23cfc567ecc",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://libtl.com/sdk.js"
          data-zone="11786767"
          data-sdk="show_11786767"
          async
        />
      </head>
      <body className="antialiased">
        {children}
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="279691"
          data-cfasync="false"
          strategy="afterInteractive"
        />
        <Script id="monetag-zone-11786694" strategy="afterInteractive">
          {`(function(s){s.dataset.zone='11786694';s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
        </Script>
        <Script id="ai-reward-gate" strategy="afterInteractive">
          {`
(function () {
  var REQUIRED = 3;
  function today() { return new Date().toISOString().slice(0, 10); }
  function key() { return 'ai-reward-' + today(); }
  function count() { return Math.min(REQUIRED, Number(localStorage.getItem(key()) || 0)); }
  function save(n) { localStorage.setItem(key(), String(Math.min(REQUIRED, n))); }
  function removeGate() { var x = document.getElementById('ai-reward-gate-modal'); if (x) x.remove(); }
  function gate() {
    removeGate();
    var n = count();
    if (n >= REQUIRED) return true;
    var box = document.createElement('div');
    box.id = 'ai-reward-gate-modal';
    box.style.cssText = 'position:fixed;inset:0;z-index:2147483646;background:rgba(10,15,25,.72);display:grid;place-items:center;padding:20px;font-family:system-ui,sans-serif';
    box.innerHTML = '<div style="width:min(420px,100%);background:white;border-radius:24px;padding:26px;color:#172033;box-shadow:0 24px 80px rgba(0,0,0,.3)"><button id="ai-reward-close" style="float:right;border:0;background:#eef1f6;border-radius:50%;width:36px;height:36px;font-size:20px">×</button><div style="font-size:36px">🔒</div><h2 style="margin:8px 0">Unlock AI Tutor</h2><p style="line-height:1.5">Watch 3 rewarded ads each day to use the AI English Tutor.</p><div id="ai-reward-progress" style="font-weight:800;font-size:22px;margin:18px 0">'+n+' / '+REQUIRED+' ads watched today</div><button id="ai-reward-watch" style="width:100%;border:0;border-radius:14px;padding:14px;background:#5b45d6;color:white;font-weight:800;font-size:16px">Watch rewarded ad</button><p id="ai-reward-status" style="font-size:13px;margin:12px 0 0;color:#667085">Only completed ads count toward your unlock.</p></div>';
    document.body.appendChild(box);
    document.getElementById('ai-reward-close').onclick = removeGate;
    document.getElementById('ai-reward-watch').onclick = function () {
      var btn = this, status = document.getElementById('ai-reward-status');
      if (typeof window.show_11786767 !== 'function') { status.textContent = 'The rewarded ad is still loading. Please try again in a moment.'; return; }
      btn.disabled = true; btn.textContent = 'Opening ad…'; status.textContent = 'Complete the ad to receive credit.';
      window.show_11786767().then(function () {
        var next = count() + 1; save(next);
        if (next >= REQUIRED) {
          status.textContent = 'AI Tutor unlocked for today!';
          document.getElementById('ai-reward-progress').textContent = REQUIRED+' / '+REQUIRED+' ads watched today';
          btn.textContent = 'Open AI Tutor'; btn.disabled = false;
          btn.onclick = function () { removeGate(); var launch = document.querySelector('.ai-launch'); if (launch) launch.click(); };
        } else {
          document.getElementById('ai-reward-progress').textContent = next+' / '+REQUIRED+' ads watched today';
          status.textContent = 'Ad completed. Watch '+(REQUIRED-next)+' more to unlock AI.';
          btn.textContent = 'Watch next ad'; btn.disabled = false;
        }
      }).catch(function () {
        status.textContent = 'Ad was not completed or is unavailable. No credit was added.';
        btn.textContent = 'Try again'; btn.disabled = false;
      });
    };
    return false;
  }
  document.addEventListener('click', function (e) {
    var target = e.target && e.target.closest ? e.target.closest('.ai-launch') : null;
    if (!target || count() >= REQUIRED) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); gate();
  }, true);
})();
          `}
        </Script>
      </body>
    </html>
  );
}
