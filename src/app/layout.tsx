import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/app/component/Common/Footer/Footer";
import Provider from "./component/Provider/Provider";
import { headers } from "next/headers";

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.className} flex flex-col min-h-screen w-full main-bg max-w-full`}
      >
        <Provider>
          <div className="main-container">
            {children}
            <Footer />
          </div>
        </Provider>
      </body>
    </html>
  );
}
