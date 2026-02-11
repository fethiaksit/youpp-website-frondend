import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Youpp Public Site",
  description: "Public site renderer",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
