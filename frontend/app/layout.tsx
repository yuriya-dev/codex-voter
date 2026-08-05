import type { Metadata } from "next";
import "./globals.css";
import { VoterProvider } from "@/components/VoterContext";
import ShortlistDrawer from "@/components/ShortlistDrawer";
import QRScannerModal from "@/components/QRScannerModal";
import MobileNavBar from "@/components/MobileNavBar";
import { Suspense } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CODEX Voter — Capstone Voting",
  description: "Platform voting proyek capstone pameran CODEX-2.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <VoterProvider>
          {children}
          <ShortlistDrawer />
          <QRScannerModal />
          <Suspense fallback={null}>
            <MobileNavBar />
          </Suspense>
          
          {/* Floating Tutorial Badge for Mobile Devices */}
          <Link href="/tutorial" className="mobile-tutorial-floating-badge" title="Panduan Voting">
            <img 
              src="/sticker7.webp" 
              alt="Panduan" 
              style={{ width: "38px", height: "38px", objectFit: "contain" }} 
            />
          </Link>
        </VoterProvider>
      </body>
    </html>
  );
}



