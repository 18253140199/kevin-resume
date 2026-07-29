import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return {
    metadataBase: new URL(`${protocol}://${host}`),
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
          url: "/og.png",
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
      images: ["/og.png"],
    },
    icons: {
      icon: "/character-intro3d.png",
      shortcut: "/character-intro3d.png",
    },
  };
}

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
