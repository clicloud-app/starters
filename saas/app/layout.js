const name = process.env.APP_NAME || "My app";
export const metadata = { title: name };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "40px auto", padding: "0 16px", lineHeight: 1.5 }}>
        <header style={{ marginBottom: 32 }}>
          <a href="/" style={{ fontWeight: 700, fontSize: 20, color: "inherit", textDecoration: "none" }}>{name}</a>
        </header>
        {children}
      </body>
    </html>
  );
}
