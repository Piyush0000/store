export default function OffersLoading() {
  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', opacity: 0.9 }}>
      <div style={{ height: '36px', width: '220px', background: '#f0ece4', borderRadius: '6px', marginBottom: '24px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        <div style={{ height: '180px', background: '#faf9f6', borderRadius: '8px' }} />
        <div style={{ height: '180px', background: '#faf9f6', borderRadius: '8px' }} />
        <div style={{ height: '180px', background: '#faf9f6', borderRadius: '8px' }} />
      </div>
    </div>
  );
}
