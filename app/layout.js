import './globals.css';
import { Poppins } from "next/font/google";
import {AuthProvider} from './providers/AuthProvider';

export const metadata = {
  title: 'Ecommerce',
  description: 'Ecommerce Application',
}
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function RootLayout({ children }) {
  
  return (
    <html lang="en">
      <body className={poppins.className}>
      <AuthProvider>
          {children}
      </AuthProvider>
      </body>
    </html>
  )
}
