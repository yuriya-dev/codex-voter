import type { Metadata } from "next";
import "./globals.css";
import { VoterProvider } from "@/components/VoterContext";
import ShortlistDrawer from "@/components/ShortlistDrawer";
import QRScannerModal from "@/components/QRScannerModal";
import MobileNavBar from "@/components/MobileNavBar";

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
          <MobileNavBar />
        </VoterProvider>
      </body>
    </html>
  );
}



