import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AI献立プランナー - 栄養バランス抜群の献立をAIが提案",
    template: "%s | AI献立プランナー"
  },
  description: "冷蔵庫の食材や画像から、AIが栄養バランスを考慮した献立を瞬時に生成。料理時間、カロリー、栄養素も計算して表示。健康的な食生活をサポートします。",
  keywords: ["AI", "献立", "料理", "栄養", "カロリー", "健康", "食事計画", "レシピ", "栄養バランス", "食材"],
  authors: [{ name: "AI献立プランナー" }],
  creator: "AI献立プランナー",
  publisher: "AI献立プランナー",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    title: "AI献立プランナー - 栄養バランス抜群の献立をAIが提案",
    description: "冷蔵庫の食材や画像から、AIが栄養バランスを考慮した献立を瞬時に生成。料理時間、カロリー、栄養素も計算して表示。",
    siteName: "AI献立プランナー",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI献立プランナー - 栄養バランス抜群の献立をAIが提案",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI献立プランナー - 栄養バランス抜群の献立をAIが提案",
    description: "冷蔵庫の食材や画像から、AIが栄養バランスを考慮した献立を瞬時に生成。",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI献立プランナー" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ff6b35" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <div id="root">{children}</div>
        <div id="modal-root" />
      </body>
    </html>
  );
}
