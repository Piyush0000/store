'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid2X2, ShoppingBag, User, Heart } from 'lucide-react';
import { useCart } from './CartProvider';
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
    const { cartCount, isHydrated } = useCart();

    const isActive = (href: string, exact: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <nav className="bottom-nav" aria-label="Bottom navigation">
            {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                const isCart = href === '/cart';

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
                            {isCart && isHydrated && cartCount > 0 && (
                                <span className="bottom-nav__badge">{cartCount > 9 ? '9+' : cartCount}</span>
                            )}
                        </span>
                        <span className="bottom-nav__label">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
