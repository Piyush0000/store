import Link from "next/link";
import { Home, Search, Diamond } from "lucide-react";
import "./store-error.css";

export default function StoreErrorView() {
  return (
    <section className="store-error">
      <div className="store-error__main">
        <Diamond className="store-error__diamond" size={48} strokeWidth={1} />
        <p className="store-error__number">404</p>
        <div className="store-error__content">
          <p className="store-error__overline">Page Not Found</p>
          <h1 className="store-error__title">This Store Doesn&apos;t Exist</h1>
          <div className="store-error__divider" />
          <p className="store-error__description">
            The store you&apos;re looking for may have moved, or the URL might be incorrect.
            Please check the address or explore our collections below.
          </p>
          <div className="store-error__actions">
            <Link href="/" className="store-error__btn store-error__btn--primary">
              <Home size={16} />
              Return Home
            </Link>
            <Link href="/catalogue" className="store-error__btn store-error__btn--secondary">
              <Search size={16} />
              Browse Collection
            </Link>
          </div>
        </div>
      </div>
      <div className="store-error__footer">
        <p className="store-error__powered">
          Website powered by{" "}
          <a href="https://evoclabs.com" target="_blank" rel="noopener noreferrer">
            Evoclabs.com
          </a>
        </p>
      </div>
    </section>
  );
}
