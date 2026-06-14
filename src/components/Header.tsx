'use client';

import Link from 'next/link';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from './CartProvider';
import { fetchStorefront } from '@/lib/api';
import './Header.css';

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const DEFAULT_NAV_LINKS = [
  { label: 'HOME', path: '/' },
  { label: 'JEWELLERY SETS', path: '/catalogue?category=jewellery-sets' },
  { label: 'NECKLACE', path: '/catalogue?category=necklace' },
  { label: 'EARRINGS', path: '/catalogue?category=earrings' },
  { label: 'ALL PRODUCTS', path: '/catalogue' },
];

const DEFAULT_LOGO = '';

interface HeaderProps {
  initialCustomization?: any;
}

export default function Header({ initialCustomization }: HeaderProps) {
  const { cartCount, isHydrated, setIsCartOpen } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getInitialLogo = () => {
    let headerStyle = initialCustomization?.headerStyle;
    if (headerStyle && typeof headerStyle === 'string') {
      try { headerStyle = JSON.parse(headerStyle); } catch (err) { }
    }
    return initialCustomization?.logo || headerStyle?.logoUrl || initialCustomization?.headerConfig?.logoUrl || '';
  };

  const getInitialStoreName = () => {
    let headerStyle = initialCustomization?.headerStyle;
    if (headerStyle && typeof headerStyle === 'string') {
      try { headerStyle = JSON.parse(headerStyle); } catch (err) { }
    }
    return headerStyle?.storeName || headerStyle?.logoText || initialCustomization?.headerConfig?.storeName || 'Demo Store';
  };

  const getInitialNavLinks = () => {
    if (initialCustomization?.navLinks && initialCustomization.navLinks.length > 0) {
      return initialCustomization.navLinks.map((link: { label: string; href: string }) => ({
        label: link.label,
        path: link.href,
      }));
    }
    return DEFAULT_NAV_LINKS;
  };

  const [logoUrl, setLogoUrl] = useState(getInitialLogo);
  const [logoError, setLogoError] = useState(false);
  const [storeName, setStoreName] = useState(getInitialStoreName);
  const [navLinks, setNavLinks] = useState<{ label: string; path: string }[]>(getInitialNavLinks);
  const hasFetched = useRef(false);

  useEffect(() => {
    setLogoError(false);
  }, [logoUrl]);

  useEffect(() => {
    if (initialCustomization) {
      return; // Skip fetch since we have initialCustomization!
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchStorefront()
      .then((data) => {
        const customization = data.customization;
        let headerStyle = customization?.headerStyle;
        if (headerStyle && typeof headerStyle === 'string') {
          try { headerStyle = JSON.parse(headerStyle); } catch (err) { }
        }

        const resolvedLogo = customization?.logo || headerStyle?.logoUrl || customization?.headerConfig?.logoUrl || '';
        setLogoUrl(resolvedLogo);

        if (headerStyle?.storeName || headerStyle?.logoText) {
          setStoreName(headerStyle.storeName || headerStyle.logoText);
        } else if (customization?.headerConfig?.storeName) {
          setStoreName(customization.headerConfig.storeName);
        }

        if (customization?.navLinks && customization.navLinks.length > 0) {
          setNavLinks(customization.navLinks.map((link: { label: string; href: string }) => ({
            label: link.label,
            path: link.href,
          })));
        }
      })
      .catch((err) => console.error('[Header] Failed to fetch config:', err));
  }, [initialCustomization]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ORBIT_CUSTOMIZATION_UPDATE') {
        const cust = e.data.data;
        let headerStyle = cust?.headerStyle;
        if (headerStyle && typeof headerStyle === 'string') {
          try { headerStyle = JSON.parse(headerStyle); } catch (err) { }
        }

        const resolvedLogo = cust?.logo || headerStyle?.logoUrl || cust?.headerConfig?.logoUrl || '';
        setLogoUrl(resolvedLogo);

        if (headerStyle?.storeName || headerStyle?.logoText) {
          setStoreName(headerStyle.storeName || headerStyle.logoText);
        } else if (cust?.headerConfig?.storeName) {
          setStoreName(cust.headerConfig.storeName);
        }

        if (cust?.navLinks && cust.navLinks.length > 0) {
          setNavLinks(cust.navLinks.map((link: { label: string; href: string }) => ({
            label: link.label,
            path: link.href,
          })));
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="header__main">
          <div className="header__left">
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

            <button
              className="header__mobile-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
          </div>

          <Link href="/" className="header__logo">
            {logoError || !logoUrl ? (
              <span className="header__logo-text">{storeName.toUpperCase()}</span>
            ) : (
              <img
                src={logoUrl}
                alt={storeName}
                className="header__logo-img"
                onError={() => setLogoError(true)}
              />
            )}
          </Link>

          <div className="header__right">
            <Link href="/orders" className="header__icon-btn" aria-label="Orders">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <Link href="/wishlist" className="header__icon-btn" aria-label="Wishlist">
              <Heart size={20} strokeWidth={1.5} />
            </Link>
            <button
              className="header__icon-btn header__cart-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="Cart"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {isHydrated && cartCount > 0 && <span className="header__cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
        <div className="header__main__mobile">
          <div className="header__left">

            <button
              className="header__mobile-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="header__logo">
              {logoError || !logoUrl ? (
                <span className="header__logo-text">{storeName.toUpperCase()}</span>
              ) : (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="header__logo-img"
                  onError={() => setLogoError(true)}
                />
              )}
            </Link>
          </div>



          <div className="header__right">
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
            <button
              className="header__icon-btn header__cart-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="Cart"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {isHydrated && cartCount > 0 && <span className="header__cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
        <nav className="header__nav">
          <div className="header__nav-inner">
            {navLinks.map((link) => (
              <Link
                key={link.path || link.label}
                href={link.path}
                className="header__nav-link"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Mobile Overlay Menu */}
      {mobileMenuOpen && (
        <div className="header__mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="header__mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="header__mobile-header">
              <span className="header__mobile-logo">{storeName.toUpperCase()}</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close">
                <X size={24} />
              </button>
            </div>
            {navLinks.map((link) => (
              <Link key={`mobile-${link.path || link.label}`} href={link.path} className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/orders" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>MY ORDERS</Link>
            <Link href="/wishlist" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>WISHLIST</Link>
          </div>
        </div>
      )}

    </>
  );
}
