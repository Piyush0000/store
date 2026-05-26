import './policy.css';

export default function ShippingPolicyPage() {
  return (
    <div className="policy">
      <div className="policy__header">
        <h1>Shipping Policy</h1>
      </div>
      <div className="policy__content">
        <h2>Delivery Time</h2>
        <p>Orders are typically processed within 2-3 business days. Delivery times vary by location:</p>
        <ul>
          <li>Metro cities: 3-5 business days</li>
          <li>Other cities: 5-7 business days</li>
          <li>Remote areas: 7-10 business days</li>
        </ul>

        <h2>Shipping Charges</h2>
        <p>Shipping charges are calculated at checkout based on your location and order value.</p>
        <p>Free shipping is available on orders above ₹999.</p>

        <h2>Track Your Order</h2>
        <p>Once your order is shipped, you will receive a tracking number via SMS and email.</p>

        <h2>Contact Us</h2>
        <p>For any shipping-related queries, please contact us at support@swarajyajewels.com</p>
      </div>
    </div>
  );
}