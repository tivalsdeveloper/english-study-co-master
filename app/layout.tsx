import type { Metadata } from "next";
import Script from "next/script";
import AccountTools from "./account-tools";

export const metadata: Metadata = {
  title: "English Study Co.Master",
  description: "Learn English, teach with confidence, and grow together.",
  other: { "codex-preview": "development", monetag: "2390b319b0306a2fdad9f23cfc567ecc" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="stylesheet" href="/app.css"/><link rel="stylesheet" href="/reference-site.css"/><link rel="stylesheet" href="/sent-message-color.css"/></head><body className="antialiased"><a className="skip-link" href="#main-content">Skip to main content</a>{children}<AccountTools/><Script src="/restore-missing-features.js" strategy="afterInteractive"/><Script src="/login-forgot-password.js" strategy="afterInteractive"/><Script src="/ai-media-chat.js" strategy="afterInteractive"/><Script src="/ai-study-upload.js" strategy="afterInteractive"/><Script src="/reference-ai-ui.js" strategy="afterInteractive"/><Script src="/reference-whole-site.js" strategy="afterInteractive"/></body></html>;
}
