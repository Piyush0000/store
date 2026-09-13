'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';

export interface NavigationLink { label: string; path: string }
export interface NavigationMenuItem { label: string; href: string; image?: string }
export interface NavigationMenu { parentHref: string; items: NavigationMenuItem[] }

export default function NavigationLinks({ links, menus, mobile = false, onNavigate }: {
  links: NavigationLink[]; menus: NavigationMenu[]; mobile?: boolean; onNavigate?: () => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname + (params.size ? `?${params.toString()}` : '');
  return links.map((link, index) => {
    const items = menus.find(menu => menu.parentHref === link.path)?.items?.filter(item => item.label && item.href) || [];
    const expanded = open === index;
    return <div key={`${link.path}-${index}`} className={mobile ? 'header__mobile-nav-item' : 'header__nav-item'}
      onMouseEnter={() => { if (!mobile && items.length) setOpen(index); }}
      onMouseLeave={() => { if (!mobile) setOpen(null); }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(null); }}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          setOpen(null);
          event.currentTarget.querySelector<HTMLButtonElement>('button')?.focus();
        }
      }}>
      <div className="header__nav-item-heading">
        <Link href={link.path} className={mobile ? 'header__mobile-link' : `header__nav-link${current === link.path ? ' header__nav-link--active' : ''}`}
          aria-current={current === link.path ? 'page' : undefined}
          onClick={() => { setOpen(null); onNavigate?.(); }}>{link.label}</Link>
        {items.length > 0 && <button type="button" className="header__submenu-toggle" aria-label={`Show ${link.label} submenu`}
          aria-expanded={expanded} aria-controls={`${id}-${index}`} onClick={() => setOpen(expanded ? null : index)}>
          <ChevronDown size={14} />
        </button>}
      </div>
      {items.length > 0 && <div id={`${id}-${index}`} className={mobile ? 'header__mobile-submenu' : 'header__mega-menu'} hidden={!expanded}>
        {items.map((item, childIndex) => <Link key={`${item.href}-${childIndex}`} href={item.href} className="header__submenu-link"
          onClick={() => { setOpen(null); onNavigate?.(); }}>
          {item.image && <img src={item.image} alt="" loading="lazy" />}
          <span>{item.label}</span>
        </Link>)}
      </div>}
    </div>;
  });
}
