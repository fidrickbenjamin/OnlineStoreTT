import React from "react";
import { useSearchParams } from "react-router-dom";
export default function CustomPagination({resPerPage,filteredProductsCount}) {
 const [params,setParams]=useSearchParams(); const pages=Math.ceil((filteredProductsCount||0)/(resPerPage||20));const current=Math.max(1,Number(params.get("page"))||1);
 if(pages<=1)return null;
 const go=page=>{const next=new URLSearchParams(params);next.set("page",String(page));setParams(next);document.getElementById("products_heading")?.scrollIntoView({block:"start"});};
 return <nav className="d-flex justify-content-center flex-wrap gap-2 my-4" aria-label="Product pages"><button className="btn btn-outline-success" disabled={current<=1} onClick={()=>go(1)}>First</button><button className="btn btn-outline-success" disabled={current<=1} onClick={()=>go(current-1)}>Previous</button><span className="align-self-center">{current} / {pages}</span><button className="btn btn-outline-success" disabled={current>=pages} onClick={()=>go(current+1)}>Next</button><button className="btn btn-outline-success" disabled={current>=pages} onClick={()=>go(pages)}>Last</button></nav>;
}
