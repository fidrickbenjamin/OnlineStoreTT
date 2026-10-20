import React from "react";
import { useSearchParams } from "react-router-dom";

export default function CustomPagination({ resPerPage, filteredProductsCount }) {
  const [params, setParams] = useSearchParams();
  const pages = Math.ceil((filteredProductsCount || 0) / (resPerPage || 20));
  const current = Math.min(pages || 1, Math.max(1, Math.floor(Number(params.get("page")) || 1)));
  if (pages <= 1) return null;

  const go = (page) => {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    setParams(next);
    document.getElementById("products_heading")?.scrollIntoView({ block: "start" });
  };
  const start = Math.max(1, Math.min(current - 2, pages - 4));
  const numbers = Array.from({ length: Math.min(5, pages) }, (_, index) => start + index);

  return (
    <>
      <style>{`
        nav.tt-product-pagination {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
          gap: 8px; margin: 28px auto; padding: 18px 12px;
          background: #174d34; border: 1px solid #286849; border-radius: 14px;
          box-shadow: 0 4px 14px rgba(12, 63, 36, .12);
        }
        .tt-product-pagination .tt-page-button {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 42px; min-height: 44px; padding: 10px 14px;
          background: #236c49; color: #fff !important;
          border: 1px solid #4a8a67; border-radius: 9px;
          font: inherit; font-size: 14px; font-weight: 600; line-height: 1.2;
          cursor: pointer; transition: background .15s ease, border-color .15s ease;
        }
        .tt-product-pagination .tt-page-button:hover:not(:disabled) {
          background: #2d8258; border-color: #85bea0;
        }
        .tt-product-pagination .tt-page-button[aria-current="page"] {
          background: #08783f; border-color: #a2e3bb; color: #fff !important;
          box-shadow: inset 0 0 0 1px #a2e3bb;
        }
        .tt-product-pagination .tt-page-button:focus-visible {
          outline: 3px solid #fff; outline-offset: 3px;
        }
        .tt-product-pagination .tt-page-button:disabled {
          background: #274f3b; border-color: #456d57; color: #cbd8cf !important;
          cursor: not-allowed;
        }
        .tt-product-pagination .tt-page-position {
          width: 100%; text-align: center; color: #fff; font-size: 13px;
          margin-top: 5px;
        }
        @media (max-width: 575px) {
          nav.tt-product-pagination { gap: 6px; padding: 14px 8px; }
          .tt-product-pagination .tt-page-button { padding: 9px 10px; font-size: 13px; }
          .tt-product-pagination .tt-page-edge { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tt-product-pagination .tt-page-button { transition: none; }
        }
      `}</style>
      <nav className="tt-product-pagination" aria-label="Product pages">
        <button type="button" className="tt-page-button tt-page-edge" disabled={current === 1} onClick={() => go(1)}>First</button>
        <button type="button" className="tt-page-button" disabled={current === 1} onClick={() => go(current - 1)}>Previous</button>
        {numbers.map((page) => (
          <button type="button" key={page} className="tt-page-button" aria-label={`Page ${page}`} aria-current={current === page ? "page" : undefined} onClick={() => go(page)}>{page}</button>
        ))}
        <button type="button" className="tt-page-button" disabled={current === pages} onClick={() => go(current + 1)}>Next</button>
        <button type="button" className="tt-page-button tt-page-edge" disabled={current === pages} onClick={() => go(pages)}>Last</button>
        <span className="tt-page-position">Page {current} of {pages}</span>
      </nav>
    </>
  );
}
