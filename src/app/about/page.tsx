import Link from 'next/link';
import './about.css';

export default function AboutPage() {
  return (
    <div className="about">
      <section className="about__hero">
        <h1>About Us</h1>
        <p className="about__tagline">Celebrating the timeless elegance of Indian craftsmanship</p>
      </section>

      <section className="about__content">
        <div className="about__section">
          <h2>Our Story</h2>
          <p>
            At Swarajya Imperial, we believe jewellery is more than just an accessory.
            Founded on a passion for craftsmanship, we bring you exquisite pieces that
            celebrate the rich heritage of Indian artistry.
          </p>
        </div>

        <div className="about__section">
          <h2>Our Promise</h2>
          <ul className="about__features">
            <li>
              <span className="about__feature-icon">✦</span>
              <div>
                <h3>Premium Quality</h3>
                <p>Every piece is crafted with the finest materials and attention to detail.</p>
              </div>
            </li>
            <li>
              <span className="about__feature-icon">✦</span>
              <div>
                <h3>Authentic Designs</h3>
                <p>Inspired by traditional Indian motifs with a modern contemporary twist.</p>
              </div>
            </li>
            <li>
              <span className="about__feature-icon">✦</span>
              <div>
                <h3>Secure Shopping</h3>
                <p>Multiple payment options with safe and secure checkout.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="about__section">
          <h2>Contact Us</h2>
          <p>Have questions? We're here to help!</p>
          <div className="about__contact">
            <div className="about__contact-item">
              <span>Email</span>
              <a href="mailto:support@swarajyajewels.com">support@swarajyajewels.com</a>
            </div>
            <div className="about__contact-item">
              <span>Phone</span>
              <a href="tel:+919930569627">+91 9930569627</a>
            </div>
            <div className="about__contact-item">
              <span>Address</span>
              <p>Mumbai, Maharashtra, India</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about__cta">
        <h2>Start Shopping</h2>
        <p>Explore our collection of handcrafted jewellery pieces.</p>
        <Link href="/catalogue" className="about__btn">
          Browse Collection
        </Link>
      </section>
    </div>
  );
}