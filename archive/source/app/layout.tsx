import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { FirebaseAnalytics } from "@/app/components/firebase-analytics";

const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://huong-dong-tarot.hongkhang21998.chatgpt.site"),
  title: {
    default: "Hường Đông Tarot - Học Tarot qua huyền sử Việt",
    template: "%s | Hường Đông Tarot",
  },
  description:
    "Bộ Tarot Việt 78 lá kết nối hệ nghĩa Rider-Waite-Smith với thần thoại, lịch sử và biểu tượng Việt Nam.",
  authors: [{ name: "NguyenHongKhang" }],
  creator: "NguyenHongKhang",
  publisher: "NguyenHongKhang",
  robots: { index: true, follow: true },
  other: {
    "codex-preview": "development",
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
    <html lang="vi">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <FirebaseAnalytics />
        <a className="skip-link" href="#noi-dung-chinh">
          Đi đến nội dung chính
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
