import './Policy.css';

export default function ShippingPolicy() {
  return (
    <div className="policy-page">
      <h1>Shipping Policy</h1>
      <p className="policy-date">Last updated: January 2024</p>

      <div className="policy-content">
        <h2>1. Shipping Regions</h2>
        <p>We currently ship to all major cities and towns across India. International shipping is available to select countries. Shipping availability to your location can be confirmed at checkout.</p>

        <h2>2. Delivery Times</h2>
        <ul>
          <li><strong>Standard Shipping:</strong> 5-7 business days (free on orders above ₹499)</li>
          <li><strong>Express Shipping:</strong> 2-3 business days (₹99 flat rate)</li>
          <li><strong>Same-Day Delivery:</strong> Available in select Mumbai pin codes (₹149)</li>
        </ul>

        <h2>3. Order Processing</h2>
        <p>Orders are processed within 24 hours of payment confirmation. Orders placed before 2 PM IST on business days are shipped the same day. Orders placed on weekends or holidays are shipped the next business day.</p>

        <h2>4. Shipping Costs</h2>
        <p>Shipping costs are calculated at checkout based on your location and selected shipping method. Orders above ₹499 qualify for free standard shipping within India.</p>

        <h2>5. Order Tracking</h2>
        <p>Once your order is shipped, you will receive a tracking number via email and SMS. You can track your order status in real-time through our website or the courier's tracking page.</p>

        <h2>6. Lost or Damaged Packages</h2>
        <p>In the rare event that your package is lost or arrives damaged, please contact us immediately with photos and your order details. We will work with the courier to resolve the issue and ensure you receive your order or a replacement.</p>

        <h2>7. Contact Us</h2>
        <p>For any questions about shipping, please contact us at mauryaglobal08@gmail.com or call +91-9930569627. Customer support is available 24/7.</p>
      </div>
    </div>
  );
}