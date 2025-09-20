import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PymeReports - Business Intelligence for SMEs",
  description: "Upload CSV files, clean data, create interactive dashboards, and export professional reports",
  keywords: "business intelligence, SME, CSV, reports, dashboard, data visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
