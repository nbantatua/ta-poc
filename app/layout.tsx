import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TA-POC | Ticket Broker Broker POS 2024",
  description: "Ticketing Broker Management System Proof of Concept inspired by 2024 Ticket Broker workflow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0b0f17] text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
