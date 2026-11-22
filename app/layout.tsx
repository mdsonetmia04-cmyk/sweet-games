import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeEffect from "@/components/layout/ThemeEffect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = "https://sweetgames.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sweet Games — Play More. Enjoy More.",
    template: "%s | Sweet Games",
  },
  description:
    "Play free online games instantly. No login, no downloads. Just play and enjoy.",
  keywords: [
    "free games",
    "online games",
    "browser games",
    "ludo",
    "chess",
    "snake",
    "2048",
    "sudoku",
    "minesweeper",
    "tetris",
  ],
  authors: [{ name: "Sweet Games" }],
  openGraph: {
    type: "website",
    siteName: "Sweet Games",
    title: "Sweet Games — Play More. Enjoy More.",
    description:
      "Play free online games instantly. No login, no downloads. Just play and enjoy.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Sweet Games — Play More. Enjoy More.",
    description:
      "Play free online games instantly. No login, no downloads. Just play and enjoy.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#121417" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=JSON.parse(localStorage.getItem('sg-theme')||'"dark"');document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-paper text-zinc-800 antialiased dark:bg-ink dark:text-zinc-100">
        <ThemeEffect />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
