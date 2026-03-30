import "./globals.css";

export const metadata = {
  title: "Calendrier des Examens – FSJ",
  description: "Planification des examens – Faculté des Sciences El Jadida",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
