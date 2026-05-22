import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Header.css';

const navLinks = [
  { label: 'HOME', path: '/' },
  { label: 'JEWELLERY SETS', path: '/catalogue?category=jewellery-sets' },
  { label: 'NECKLACE', path: '/catalogue?category=necklace' },
  { label: 'EARRINGS', path: '/catalogue?category=earrings' },
  { label: 'BEST SELLER', path: '/catalogue?category=best-seller' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner container mx-auto px-4">
        <button
          className="header__mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`header__search ${searchOpen ? 'header__search--open' : ''}`}>
          <button
            className="header__icon-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
          {searchOpen && (
            <div className="header__search-dropdown">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="header__search-input"
              />
            </div>
          )}
        </div>

        <Link to="/" className="header__logo">
          <span className="header__logo-text">SWARAJYA</span>
          <span className="header__logo-sub">IMPERIAL</span>
        </Link>

        <div className="header__actions">
          <Link to="/orders" className="header__icon-btn" aria-label="Orders">
            <User size={20} strokeWidth={1.5} />
          </Link>
          <Link to="/wishlist" className="header__icon-btn" aria-label="Wishlist">
            <Heart size={20} strokeWidth={1.5} />
          </Link>
          <button
            className="header__icon-btn header__cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="Cart"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && <span className="header__cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>

      <nav className="header__nav">
        <div className="container mx-auto px-4">
          <div className="header__nav-inner">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`header__nav-link ${location.pathname === link.path ? 'header__nav-link--active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="header__mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
          <nav className="header__mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="header__mobile-header">
              <span className="header__logo-text" style={{ fontSize: '16px' }}>SWARAJYA IMPERIAL</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="header__mobile-link">
                {link.label}
              </Link>
            ))}
            <div className="header__mobile-divider" />
            <Link to="/orders" className="header__mobile-link">MY ORDERS</Link>
            <Link to="/wishlist" className="header__mobile-link">WISHLIST</Link>
          </nav>
        </div>
      )}
    </header>
  );
}