import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const socialImageUrl = `${siteUrl.replace(/\/$/, "")}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Kevin Shell｜杨泽存 · Agent 产品经理",
  description:
    "通过一台 3D 键盘运行杨泽存的交互简历，查看 Agent 产品、评测治理、Loop 与项目实践。",
  openGraph: {
    title: "Kevin Shell｜杨泽存 · Agent 产品经理",
    description: "Don't read my resume. Run it.",
    type: "website",
    locale: "zh_CN",
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: "Kevin Shell - 杨泽存 Agent 产品经理",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kevin Shell｜杨泽存 · Agent 产品经理",
    description: "Don't read my resume. Run it.",
    images: [socialImageUrl],
  },
  icons: {
    icon: `${basePath}/assets/avatar/avatar-pixel.png`,
    shortcut: `${basePath}/assets/avatar/avatar-pixel.png`,
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
