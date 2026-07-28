import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const categories = [
  { key: "Smart Phones", label: "Smart Phones", icon: "📱", accent: "#2f6fed" },
  { key: "Agro Sales", label: "Agro Sales", icon: "🌾", accent: "#2f8f4f" },
  { key: "Hardware", label: "Hardware", icon: "🛠️", accent: "#8a4b12" },
  { key: "Grocery", label: "Groceries", icon: "🛒", accent: "#d97706" },
  { key: "School Supplies", label: "School Supplies", icon: "📚", accent: "#b45309" },
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
    <>
      <style>{`
        .splash-overlay {
          position: fixed;
          inset: 0;
          min-height: 100dvh;
          background: radial-gradient(circle at top left, #3f3f3f 0%, #2a2a2a 35%, #1f1f1f 100%);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
        }

        .splash-card {
          width: 100%;
          max-width: 980px;
          max-height: calc(100dvh - 24px);
          overflow-y: auto;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-radius: 28px;
          padding: 32px 24px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.28);
          border: 1px solid rgba(255,255,255,0.4);
          box-sizing: border-box;
        }

        .splash-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .splash-brand {
          width: 112px;
          height: 84px;
          object-fit: contain;
          margin-bottom: 12px;
        }

        .splash-title {
          margin: 0 0 10px;
          color: #1f1f1f;
          font-weight: 800;
          letter-spacing: -0.02em;
          font-size: clamp(1.35rem, 2.4vw, 1.9rem);
        }

        .splash-copy {
          margin: 0 auto;
          color: #4b4b4b;
          max-width: 720px;
          font-size: 1rem;
          line-height: 1.6;
        }

        .splash-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }

        .splash-btn {
          border: none;
          border-radius: 18px;
          padding: 16px 14px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          cursor: pointer;
          box-shadow: 0 12px 24px rgba(0,0,0,0.14);
          font-size: 16px;
          font-weight: 700;
          color: #2d2d2d;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 112px;
          touch-action: manipulation;
        }

        .splash-btn:hover,
        .splash-btn:focus-visible {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(0,0,0,0.18);
          outline: none;
        }

        .splash-btn-icon {
          font-size: 28px;
          line-height: 1;
        }

        .splash-actions {
          text-align: center;
          margin-top: 24px;
        }

        .splash-skip-btn {
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.7);
          color: #333333;
          cursor: pointer;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 999px;
          min-width: 150px;
        }

        @media (max-width: 640px) {
          .splash-overlay {
            padding: 12px;
            align-items: flex-start;
          }

          .splash-card {
            padding: 20px 14px;
            border-radius: 20px;
            margin-top: 8px;
            max-height: calc(100dvh - 16px);
          }

          .splash-brand {
            width: 84px;
            height: 64px;
          }

          .splash-title {
            font-size: 1.3rem;
            line-height: 1.2;
          }

          .splash-copy {
            font-size: 0.95rem;
            line-height: 1.5;
          }

          .splash-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .splash-btn {
            padding: 14px 10px;
            min-height: 96px;
            font-size: 15px;
          }

          .splash-btn-icon {
            font-size: 24px;
          }

          .splash-actions {
            margin-top: 20px;
          }
        }

        @media (max-width: 420px) {
          .splash-grid {
            grid-template-columns: 1fr;
          }

          .splash-btn {
            min-height: 84px;
          }

          .splash-skip-btn {
            width: 100%;
            max-width: 220px;
          }
        }
      `}</style>

      <div className="splash-overlay">
        <div className="splash-card">
          <div className="splash-header">
            <img
              src="/images/Tactical-Trends-Marketplace-Branding-Logol-Black.png"
              alt="Tactical Trends"
              className="splash-brand"
            />
            <h2 className="splash-title">Welcome to Tactical Trends Marketplace</h2>
            <p className="splash-copy">
              Browse by category and jump straight into the products that matter most to you.
            </p>
          </div>

          <div className="splash-grid">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => handleSelect(category.key)}
                className="splash-btn"
                style={{ border: `1px solid ${category.accent}33` }}
              >
                <div className="splash-btn-icon">{category.icon}</div>
                <div>{category.label}</div>
              </button>
            ))}
          </div>

          <div className="splash-actions">
            <button onClick={handleSkip} className="splash-skip-btn">
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategorySplash;
