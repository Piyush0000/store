import "./checkout.css";

export default function CheckoutLoading() {
  return (
    <div className="checkout" style={{ opacity: 0.9 }}>
      <h1 className="checkout__title">Checkout</h1>
      <div
        className="checkout__layout"
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <div
          style={{ height: "70px", background: "#faf9f6", borderRadius: "8px" }}
        />
        <div
          style={{
            height: "240px",
            background: "#faf9f6",
            borderRadius: "8px",
          }}
        />
      </div>
    </div>
  );
}
