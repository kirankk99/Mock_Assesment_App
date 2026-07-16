import "./globals.css";

export const metadata = {
  title: "Accenture India Technical Aptitude Simulator",
  description:
    "A 30-question, 60-minute mock test modeled on Accenture's cognitive & technical assessment sections.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
