'use client';

import Link from 'next/link';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from './CartProvider';
import { fetchStorefront } from '@/lib/api';
import './Header.css';

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const DEFAULT_NAV_LINKS = [
  { label: 'HOME', path: '/' },
  { label: 'JEWELLERY SETS', path: '/catalogue?category=jewellery-sets' },
  { label: 'NECKLACE', path: '/catalogue?category=necklace' },
  { label: 'EARRINGS', path: '/catalogue?category=earrings' },
  { label: 'BEST SELLER', path: '/catalogue?category=best-seller' },
];

const DEFAULT_LOGO = 'https://d1311wbk6unapo.cloudfront.net/NushopWebsiteAsset/tr:w-300,,f-webp,fo-auto/686907a872a04e21d2c32db3_brand_logo_HC7VFLYTI4_2026-03-02.jpg';

export default function Header() {
  const { cartCount, isHydrated, setIsCartOpen } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);
  const [storeName, setStoreName] = useState('Swarajya Imperial');
  const [navLinks, setNavLinks] = useState(DEFAULT_NAV_LINKS);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchStorefront()
      .then((data) => {
        const customization = data.customization;
        if (customization?.headerConfig?.logoUrl) {
          setLogoUrl(customization.headerConfig.logoUrl);
        }
        if (customization?.headerConfig?.storeName) {
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
            <img
              src={logoUrl}
              alt={storeName}
              className="header__logo-img"
            />
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

      {/* Mobile Bottom Tab Bar */}
      <div className="header__mobile-tabs">
        <div className="header__mobile-tabs-inner">
          <Link href="/" className="header__mobile-tab header__mobile-tab--active">
            <HomeIcon />
            <span>Home</span>
          </Link>
          <Link href="/orders" className="header__mobile-tab">
            <User size={22} strokeWidth={1.5} />
            <span>Orders</span>
          </Link>
          <button
            className="header__mobile-tab"
            onClick={() => setMobileMenuOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Menu size={22} strokeWidth={1.5} />
            <span>Browse</span>
          </button>
          <button
            className="header__mobile-tab"
            onClick={() => setSearchOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Search size={22} strokeWidth={1.5} />
            <span>Search</span>
          </button>
        </div>
      </div>
    </>
  );
}
