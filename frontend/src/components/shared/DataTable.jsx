import React, { useMemo, useState } from "react";
import "./store-upgrade.css";
export default function DataTable({ data = {}, className = "" }) {
 const [search,setSearch]=useState(""),[page,setPage]=useState(1),[sort,setSort]=useState({field:"",direction:1});
 const rows=useMemo(()=>{
  const selected=(data.rows||[]).filter(row=>Object.values(row).some(value=>["string","number"].includes(typeof value)&&String(value).toLowerCase().includes(search.toLowerCase())));
  if(sort.field) selected.sort((a,b)=>String(a[sort.field]??"").localeCompare(String(b[sort.field]??""),undefined,{numeric:true})*sort.direction);
  return selected;
 },[data.rows,search,sort]);
 const pages=Math.max(1,Math.ceil(rows.length/10)),current=Math.min(page,pages);
 return <div className={className}><label className="d-block mb-3">Search records<input type="search" className="form-control mt-2" value={search} onChange={event=>{setSearch(event.target.value);setPage(1);}}/></label><div className="table-responsive"><table className="tt-table"><thead><tr>{data.columns?.map(column=><th key={column.field} aria-sort={sort.field===column.field?(sort.direction===1?"ascending":"descending"):"none"}><button type="button" className="tt-table-sort" onClick={()=>setSort({field:column.field,direction:sort.field===column.field?-sort.direction:1})}>{column.label}</button></th>)}</tr></thead><tbody>{rows.slice((current-1)*10,current*10).map((row,i)=><tr key={typeof row.id==="string"?row.id:i}>{data.columns?.map(column=><td key={column.field}>{row[column.field]}</td>)}</tr>)}</tbody></table></div>{!rows.length&&<p className="tt-empty">No records found.</p>}<div className="tt-actions my-3"><button className="btn btn-outline-secondary" disabled={current===1} onClick={()=>setPage(current-1)}>Previous</button><span className="align-self-center">Page {current} of {pages}</span><button className="btn btn-outline-secondary" disabled={current===pages} onClick={()=>setPage(current+1)}>Next</button></div></div>;
}
