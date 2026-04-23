export const metadata = {
  title: 'Satya AI - Fact Checker',
  description: 'Sach kya hai? Let AI find out.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        backgroundColor: 'black', 
        color: 'white',
        fontFamily: 'sans-serif' 
      }}>
        {children}
      </body>
    </html>
  )
}
