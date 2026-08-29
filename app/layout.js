import { Outfit, Urbanist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import BodyAdminSync from '@/components/BodyAdminSync';
import StaffBanner from '@/components/StaffBanner';
import Header from '@/components/Header';
import Tabbar from '@/components/Tabbar';
import AuthModal from '@/components/AuthModal';

const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-outfit', display: 'swap' });
const urbanist = Urbanist({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-urbanist', display: 'swap' });

export const metadata = {
  title: 'El Extraño José — Café de especialidad en Santiago',
  description: 'Café de especialidad y atmósfera bohemia en Santiago de los Caballeros, República Dominicana.',
};

export const viewport = {
  themeColor: '#FBF8F2',
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${outfit.variable} ${urbanist.variable}`}>
      <body>
        <AuthProvider>
          <ToastProvider>
            <BodyAdminSync />
            <StaffBanner />
            <Header />
            {children}
            <Tabbar />
            <AuthModal />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
