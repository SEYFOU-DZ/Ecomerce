
import { LocaleProvider } from "../providers/LocaleProvider";
import Footer from "../components/ui/Footer";

export default function AuthLayout({ children }) {
  return (
    <LocaleProvider>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="flex-grow flex items-center justify-center py-8 px-4">
          {children}
        </div>
        <Footer />
      </div>
    </LocaleProvider>
  );
}
