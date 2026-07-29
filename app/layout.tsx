import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "请点燃我｜杨泽存 · Agent 产品经理",
  description:
    "一份以火柴点燃为核心交互的个人简历。认识杨泽存如何构建、评测与治理 Agent。",
  openGraph: {
    title: "请点燃我｜杨泽存 · Agent 产品经理",
    description: "Strike a Match, Know My Story.",
    type: "website",
    locale: "zh_CN",
    images: [
      {
        url: `${basePath}/og.png`,
        width: 1200,
        height: 630,
        alt: "请点燃我 - 杨泽存 Agent 产品经理",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "请点燃我｜杨泽存 · Agent 产品经理",
    description: "Strike a Match, Know My Story.",
    images: [`${basePath}/og.png`],
  },
  icons: {
    icon: `${basePath}/character-intro3d.png`,
    shortcut: `${basePath}/character-intro3d.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
