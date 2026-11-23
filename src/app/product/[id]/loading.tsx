import "./product.css";

export default function ProductLoading() {
  return (
    <div className="product-page">
      <div className="product-page__container">
        {/* Gallery Skeleton */}
        <div
          className="layer-shimmer"
          style={{
            aspectRatio: "1/1",
            borderRadius: "16px",
            minHeight: "450px",
            width: "100%",
          }}
        />

        {/* Info Skeleton */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            padding: "8px 0",
          }}
        >
          {/* Badge capsule */}
          <div
            className="layer-shimmer"
            style={{ height: "24px", width: "130px", borderRadius: "999px" }}
          />

          {/* Title */}
          <div
            className="layer-shimmer"
            style={{ height: "36px", width: "85%", borderRadius: "8px" }}
          />

          {/* Price */}
          <div
            className="layer-shimmer"
            style={{ height: "32px", width: "45%", borderRadius: "8px" }}
          />

          {/* Buy Buttons */}
          <div
            className="layer-shimmer"
            style={{
              height: "52px",
              width: "100%",
              borderRadius: "10px",
              marginTop: "20px",
            }}
          />
          <div
            className="layer-shimmer"
            style={{ height: "52px", width: "100%", borderRadius: "10px" }}
          />

          {/* Benefits */}
          <div
            className="layer-shimmer"
            style={{
              height: "64px",
              width: "100%",
              borderRadius: "12px",
              marginTop: "16px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
