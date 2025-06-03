
import "./globals.css" // ✅ Important: add this line

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      
      <body>{children}</body>
    </html>
  )
}
