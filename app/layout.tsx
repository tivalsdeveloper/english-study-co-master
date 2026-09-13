import type { Metadata } from "next";
import Script from "next/script";
import AccountTools from "./account-tools";
import "./globals.css";
import "./otp.css";
import "./group-room.css";
import "./account-tools.css";

export const metadata: Metadata = {
  title: "English Study Co.Master",
  description: "Learn English, teach with confidence, and grow together.",
  other: {
    "codex-preview": "development",
    monetag: "2390b319b0306a2fdad9f23cfc567ecc",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script id="ai-tutor-supabase-route" strategy="beforeInteractive">{`
          (() => {
            const originalFetch = window.fetch.bind(window);
            const oldEndpoint = "https://english-study-co-master.netlify.app/.netlify/functions/ai-tutor";
            const newEndpoint = "https://kxuszpixwfecawdeqkrx.supabase.co/functions/v1/ai-tutor";
            window.fetch = (input, init) => {
              if (typeof input === "string" && input === oldEndpoint) return originalFetch(newEndpoint, init);
              if (input instanceof Request && input.url === oldEndpoint) return originalFetch(new Request(newEndpoint, input), init);
              return originalFetch(input, init);
            };
          })();
        `}</Script>
        {children}
        <AccountTools />
        <Script src="/teacher-ai-lessons.js" strategy="afterInteractive" />
        <Script src="/chat-enhancements.js" strategy="afterInteractive" />
        <Script src="/restore-missing-features.js" strategy="afterInteractive" />
        <Script src="/login-forgot-password.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
