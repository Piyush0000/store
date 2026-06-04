export const dynamic = "force-dynamic";

import Link from 'next/link';
import { fetchStorefront } from '@/lib/api';
import { getServerSubdomain } from '@/lib/server-utils';
import './about.css';

export default async function AboutPage() {
  const subdomain = await getServerSubdomain();
  const storefront = await fetchStorefront(subdomain);
  
  const customization = storefront.customization || {};
  const settings = storefront.settings || {};
  const store = storefront.store || { name: 'Our Store' };

  const aboutSection = customization.aboutSection || {
    title: 'Our Story',
    content: `At ${store.name}, we believe in delivering quality and value. Founded on a passion for excellence, we bring you products that celebrate true craftsmanship.`,
  };

  const features = customization.features || [
    { title: 'Premium Quality', description: 'Every item is crafted with attention to detail.', icon: '✦' },
    { title: 'Secure Shopping', description: 'Multiple payment options with safe checkout.', icon: '✦' },
  ];

  return (
    <div className="about">
      <section className="about__hero">
        <h1>About Us</h1>
        <p className="about__tagline">Discover the story behind our brand</p>
      </section>

      <section className="about__content">
        <div className="about__section">
          <h2>{aboutSection.title || 'Our Story'}</h2>
          <p>{aboutSection.content}</p>
        </div>

        <div className="about__section">
          <h2>Our Promise</h2>
          <ul className="about__features">
            {features.map((feature: any, idx: number) => (
              <li key={idx}>
                <span className="about__feature-icon">{feature.icon || '✦'}</span>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="about__section">
          <h2>Contact Us</h2>
          <p>Have questions? We're here to help!</p>
          <div className="about__contact">
            <div className="about__contact-item">
              <span>Email</span>
              <a href={`mailto:${settings.contactEmail || 'support@example.com'}`}>
                {settings.contactEmail || 'support@example.com'}
              </a>
            </div>
            {settings.contactPhone && (
              <div className="about__contact-item">
                <span>Phone</span>
                <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="about__cta">
        <h2>Start Shopping</h2>
        <p>Explore our collection of handpicked items.</p>
        <Link href="/catalogue" className="about__btn">
          Browse Collection
        </Link>
      </section>
    </div>
  );
}