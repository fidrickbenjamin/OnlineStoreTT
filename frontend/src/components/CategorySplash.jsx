import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PRODUCT_CATEGORIES } from "../constants/constants";
import { keepDialogFocus } from "./shared/dialogFocus";
import "./CategorySplash.css";

const visitKey = "tt-category-welcome-seen-v2";
let seenInMemory = false;
function hasSeenWelcome() {
  try { return seenInMemory || sessionStorage.getItem(visitKey) === "1"; }
  catch { return seenInMemory; }
}
function rememberWelcome() {
  seenInMemory = true;
  try { sessionStorage.setItem(visitKey, "1"); } catch { /* Shopping also works with storage disabled. */ }
}
const featured = ["Smart Phones", "Agro Sales", "Hardware", "Grocery", "School Supplies", "Tactical", "Home & Living", "Fashion", "Sports", "Electronics"];
const icons = { "Smart Phones": "phone", "Agro Sales": "flower1", Hardware: "tools", Grocery: "basket2", "School Supplies": "journal-bookmark", Tactical: "shield-check", "Home & Living": "house-heart", Fashion: "handbag", Sports: "trophy", Electronics: "speaker", Accessories: "plug", Laptops: "laptop", Tablets: "tablet", Headphones: "headphones", Desktops: "pc-display", "Gaming Accessories": "controller", Clothing: "bag", Utilities: "lamp", "Property or Real Estate": "houses" };
const labels = { Grocery: "Groceries", Tactical: "Tactical gear", "Property or Real Estate": "Property & rentals" };

export default function CategorySplash({ openRequest = 0, autoOpen = true }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [visible, setVisible] = useState(() => autoOpen && !params.toString() && !hasSeenWelcome());
  const [search, setSearch] = useState("");
  const [all, setAll] = useState(false);
  useEffect(() => { rememberWelcome(); }, []);
  useEffect(() => {
    if (openRequest > 0) { setSearch(""); setAll(false); setVisible(true); }
  }, [openRequest]);
  const close = () => { rememberWelcome(); setVisible(false); };
  const go = path => { close(); navigate(path); };
  const select = key => go(key === "Property or Real Estate" ? "/property-hub?skipSplash=true" : `/?category=${encodeURIComponent(key)}&skipSplash=true`);
  const query = search.trim().toLowerCase();
  const categories = (all || query ? Object.keys(PRODUCT_CATEGORIES) : featured).filter(key => `${key} ${labels[key] || ""} ${PRODUCT_CATEGORIES[key].join(" ")}`.toLowerCase().includes(query));
  return <Modal show={visible} onHide={close} onKeyDown={keepDialogFocus} centered scrollable size="xl" className="tt-welcome-modal" aria-labelledby="tt-welcome-title" animation={false}>
    <Modal.Header closeButton><span className="tt-welcome-eyebrow">TACTICAL TRENDS MARKETPLACE</span></Modal.Header>
    <Modal.Body>
      <aside className="tt-welcome-story" aria-label="Welcome to Tactical Trends">
        <img src="/images/Tactical-Trends-Marketplace-Branding-Logol-Black.png" alt="Tactical Trends" width="140" height="100"/>
        <span className="tt-welcome-island">ROOTED IN DOMINICA</span><h2>A little local.<br/>A lot to discover.</h2><p>Everyday essentials, fresh finds and something for everyone.</p>
        <div className="tt-welcome-art" aria-hidden="true"><i className="bi bi-shop"/><span><i className="bi bi-heart-fill"/></span><span><i className="bi bi-bag-check"/></span></div>
        <span className="tt-welcome-story-note"><i className="bi bi-geo-alt" aria-hidden="true"/> Shop for yourself or someone back home.</span>
      </aside>
      <section className="tt-welcome-shop"><h1 id="tt-welcome-title">What are you shopping for?</h1><p className="tt-welcome-subtitle">Pick a category and make yourself at home.</p>
        <label className="tt-welcome-search"><i className="bi bi-search" aria-hidden="true"/><span className="visually-hidden">Find a category</span><input type="search" placeholder="Find a category…" value={search} onChange={event => setSearch(event.target.value)} maxLength={100}/></label>
        <div className="tt-welcome-grid" aria-label="Shopping categories">{categories.map(key => <button type="button" key={key} onClick={() => select(key)}><span className="tt-welcome-icon"><i className={`bi bi-${icons[key] || "grid"}`} aria-hidden="true"/></span><span>{labels[key] || key}</span><i className="bi bi-arrow-up-right" aria-hidden="true"/></button>)}</div>
        {!categories.length && <p className="tt-welcome-empty" role="status">No matching categories. Try “phones”, “groceries” or “home”. <button type="button" onClick={() => setSearch("")}>Clear search</button></p>}
        {!query && <button type="button" className="tt-welcome-expand" onClick={() => setAll(value => !value)} aria-expanded={all}>{all ? "Show popular categories" : `View all ${Object.keys(PRODUCT_CATEGORIES).length} categories`} <i className={`bi bi-chevron-${all ? "up" : "down"}`} aria-hidden="true"/></button>}
        <div className="tt-welcome-shortcuts"><button type="button" onClick={() => go("/deals")}><i className="bi bi-tag" aria-hidden="true"/><span>Shop the deals<small>Discover current offers</small></span><span aria-hidden="true">→</span></button><button type="button" onClick={() => select("Property or Real Estate")}><i className="bi bi-houses" aria-hidden="true"/><span>Property hub<small>Find your next space</small></span><span aria-hidden="true">→</span></button></div>
      </section>
    </Modal.Body>
    <Modal.Footer><span>Once per visit. Reopen with “Browse categories”.</span><button type="button" className="btn btn-success" onClick={close}>Explore all products <span aria-hidden="true">→</span></button></Modal.Footer>
  </Modal>;
}
