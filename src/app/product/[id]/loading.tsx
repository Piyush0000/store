import "./product.css";

export default function ProductLoading() {
  return (
    <div className="product-page" style={{ opacity: 0.9 }}>
      <div className="product-page__container">
        <div className="product-page__grid">
          <div
            className="product-page__gallery"
            style={{
              aspectRatio: "1/1",
              background: "#faf9f6",
              borderRadius: "8px",
              minHeight: "380px",
            }}
          />
          <div
            className="product-page__info"
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                height: "32px",
                width: "70%",
                background: "#f0ece4",
                borderRadius: "4px",
              }}
            />
            <div
              style={{
                height: "24px",
                width: "35%",
                background: "#f0ece4",
                borderRadius: "4px",
              }}
            />
            <div
              style={{
                height: "48px",
                width: "100%",
                background: "#f0ece4",
                borderRadius: "6px",
                marginTop: "24px",
              }}
            />
            <div
              style={{
                height: "48px",
                width: "100%",
                background: "#f0ece4",
                borderRadius: "6px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
