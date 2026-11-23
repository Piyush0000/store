import './cart.css';

export default function CartLoading() {
  return (
    <div className="cart-page" style={{ opacity: 0.9, maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ height: '36px', width: '180px', background: '#f0ece4', borderRadius: '6px', marginBottom: '24px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ height: '90px', background: '#faf9f6', borderRadius: '8px' }} />
        <div style={{ height: '90px', background: '#faf9f6', borderRadius: '8px' }} />
        <div style={{ height: '140px', background: '#faf9f6', borderRadius: '8px', marginTop: '16px' }} />
      </div>
    </div>
  );
}
