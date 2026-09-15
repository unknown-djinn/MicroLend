import "./globals.css";

export const metadata = {
  title: "MicroLend Nexus",
  description: "Connected borrower risk, repayment and cash-flow planning prototype"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
