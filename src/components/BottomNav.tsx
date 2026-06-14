'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid2X2, ShoppingBag, User, Heart } from 'lucide-react';
import { useCart } from './CartProvider';
import { useWishlist } from './WishlistProvider';
import './BottomNav.css';

const NAV_ITEMS = [
    {
        label: 'Home',
        href: '/',
        icon: Home,
        exact: true,
    }, {
        label: 'Account',
        href: '/orders',
        icon: User,
        exact: false,
    },
    {
        label: 'Shop',
        href: '/catalogue',
        icon: Grid2X2,
        exact: false,
    },
    {
        label: 'Wishlist',
        href: '/wishlist',
        icon: Heart,
        exact: false,
    },
    {
        label: 'Cart',
        href: '/cart',
        icon: ShoppingBag,
        exact: false,
    },

] as const;

export default function BottomNav() {
    const pathname = usePathname();
    const { cartCount, isHydrated: cartHydrated } = useCart();
    const { wishlistCount, isHydrated: wishlistHydrated } = useWishlist();

    const isActive = (href: string, exact: boolean) => {
        if (!pathname) return false;
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <nav className="bottom-nav" aria-label="Bottom navigation">
            {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                const isCart = href === '/cart';
                const isWishlist = href === '/wishlist';

                return (
                    <Link
                        key={href}
                        href={href}
                        className={`bottom-nav__item${active ? ' bottom-nav__item--active' : ''}`}
                        aria-label={label}
                        aria-current={active ? 'page' : undefined}
                    >
                        <span className="bottom-nav__icon-wrap">
                            <Icon
                                size={22}
                                strokeWidth={active ? 2 : 1.5}
                                className="bottom-nav__icon"
                            />
                            {isCart && cartHydrated && cartCount > 0 && (
                                <span className="bottom-nav__badge">{cartCount > 9 ? '9+' : cartCount}</span>
                            )}
                            {isWishlist && wishlistHydrated && wishlistCount > 0 && (
                                <span className="bottom-nav__badge">{wishlistCount > 9 ? '9+' : wishlistCount}</span>
                            )}
                        </span>
                        <span className="bottom-nav__label">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
