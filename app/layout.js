import './globals.css';
import { Outfit, Tajawal } from "next/font/google";
import {AuthProvider} from './providers/AuthProvider';

export const metadata = {
  title: 'Varnox | Premium E-commerce Platform',
  description: 'Elevate your lifestyle with our meticulously crafted premium selection. Varnox is your ultimate destination for true elegance and quality goods. / منصتك المتكاملة للتجارة الإلكترونية والفخامة.',
  openGraph: {
    title: 'Varnox | Premium E-commerce Platform',
    description: 'Elevate your lifestyle with our meticulously crafted premium selection. Varnox is your ultimate destination for true elegance and quality goods.',
    siteName: 'Varnox',
    images: [
      {
        url: '/opengraph-image.png',
        width: 800,
        height: 800,
        alt: 'Varnox Premium Store Logo',
      },
    ],
    locale: 'ar_DZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Varnox | Premium E-commerce Platform',
    description: 'Discover true elegance and premium quality products with Varnox.',
    images: ['/opengraph-image.png'],
  },
};

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  variable: "--font-tajawal",
  weight: ["300", "400", "500", "700", "800"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${tajawal.variable} font-sans antialiased text-slate-800`}>
      <AuthProvider>
          {children}
      </AuthProvider>
      </body>
    </html>
  )
}
