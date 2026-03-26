import Header from "../components/ui/Header";
import CartDrawer from "../components/store/CartDrawer";
import { CartProvider } from "../providers/CartProvider";
import { LocaleProvider } from "../providers/LocaleProvider";
import { FavoritesProvider } from "../providers/FavoritesProvider";
import Footer from "../components/ui/Footer";

export default function Layout({ children }) {
  return (
    <CartProvider>
      <LocaleProvider>
        <FavoritesProvider>
          <Header />
          <main className="pt-14">{children}</main>
          <Footer />
          <CartDrawer />
        </FavoritesProvider>
      </LocaleProvider>
    </CartProvider>
  );
}
