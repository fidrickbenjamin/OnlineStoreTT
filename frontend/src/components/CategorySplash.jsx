import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const categories = [
  { key: "Electronics", label: "Electronics", icon: "📱", accent: "#2f6fed" },
  { key: "Agro Sales", label: "Agro Sales", icon: "🌾", accent: "#2f8f4f" },
  { key: "Hardware", label: "Hardware", icon: "🛠️", accent: "#8a4b12" },
  { key: "Grocery", label: "Groceries", icon: "🛒", accent: "#d97706" },
  { key: "Tactical", label: "Tactical Gear", icon: "🪖", accent: "#1f6f42" },
  { key: "Home & Living", label: "Home & Living", icon: "🏠", accent: "#7b5cf0" },
  { key: "Fashion", label: "Fashion", icon: "👕", accent: "#c64077" },
  { key: "Property or Real Estate", label: "Property / Real Estate", icon: "🏡", accent: "#0f766e" },
];

const CategorySplash = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (searchParams.get("skipSplash") === "true") {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [searchParams]);

  const handleSelect = (categoryKey) => {
    localStorage.setItem("tactical-trends-selected-category", categoryKey);
    setVisible(false);
    navigate(`/?category=${encodeURIComponent(categoryKey)}&skipSplash=true`);
  };

  const handleSkip = () => {
    setVisible(false);
    navigate("/?skipSplash=true");
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(circle at top left, #3f3f3f 0%, #2a2a2a 35%, #1f1f1f 100%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "980px",
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderRadius: "28px",
          padding: "36px 32px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
          border: "1px solid rgba(255,255,255,0.4)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <img
            src="/images/Tactical-Trends-Marketplace-Branding-Logol-Black.png"
            alt="Tactical Trends"
            style={{ width: "112px", height: "84px", objectFit: "contain", marginBottom: "12px" }}
          />
          <h2 style={{ marginBottom: "10px", color: "#1f1f1f", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Welcome to Tactical Trends Marketplace
          </h2>
          <p style={{ marginBottom: "0", color: "#4b4b4b", maxWidth: "720px", margin: "0 auto", fontSize: "1rem", lineHeight: 1.6 }}>
            Browse by category and jump straight into the products that matter most to you.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => handleSelect(category.key)}
              style={{
                border: "none",
                borderRadius: "18px",
                padding: "18px 14px",
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                cursor: "pointer",
                boxShadow: "0 12px 24px rgba(0,0,0,0.14)",
                fontSize: "16px",
                fontWeight: 700,
                color: "#2d2d2d",
                border: `1px solid ${category.accent}33`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{category.icon}</div>
              <div>{category.label}</div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "26px" }}>
          <button
            onClick={handleSkip}
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              background: "rgba(255,255,255,0.7)",
              color: "#333333",
              cursor: "pointer",
              fontWeight: 700,
              padding: "10px 18px",
              borderRadius: "999px",
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySplash;
