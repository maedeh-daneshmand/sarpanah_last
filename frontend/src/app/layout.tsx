import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'سرپناه - رزرو اقامتگاه',
  description: 'بهترین اقامتگاه‌های ایران را با سرپناه پیدا و رزرو کنید',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Vazir', Tahoma, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
