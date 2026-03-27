import "../styles/base.css";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tech Assistance",
  description: "Advanced technical assistance platform.",
  icons: {
    icon: "/spark.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            theme="dark"
            pauseOnHover
            draggable
            toastClassName="nx-toast"
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
