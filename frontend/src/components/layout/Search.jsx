import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Search() {
  const [params] = useSearchParams();
  const currentKeyword = params.get("keyword") || "";
  const [keyword, setKeyword] = useState(currentKeyword);
  const navigate = useNavigate();
  useEffect(() => { setKeyword(currentKeyword); }, [currentKeyword]);
  const submit = event => {
    event.preventDefault();
    const next = new URLSearchParams({ skipSplash: "true" });
    if (keyword.trim()) next.set("keyword", keyword.trim());
    navigate(`/?${next.toString()}`);
  };
  return <form onSubmit={submit} className="search-form" role="search" aria-label="Search the marketplace">
    <label className="visually-hidden" htmlFor="search_field">Search products</label>
    <div className="input-group">
      <input type="search" id="search_field" className="form-control search-input" placeholder="Search products" name="keyword" value={keyword} onChange={event => setKeyword(event.target.value)}/>
      <button id="search_btn" className="btn" type="submit" aria-label="Submit product search"><i className="bi bi-search" aria-hidden="true"/></button>
    </div>
  </form>;
}
