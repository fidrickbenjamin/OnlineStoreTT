import React from "react";
export default function StarRatings({ rating=0,numberOfStars=5,changeRating,name="rating",starRatedColor,StarRatedColor,starDimension="20px",starSpacing="1px" }) {
 const label=`${Number(rating).toFixed(1)} out of ${numberOfStars} stars`;
 return <span role={changeRating?"group":"img"} aria-label={label} style={{display:"inline-flex",gap:starSpacing,color:starRatedColor||StarRatedColor||"#ffb829",fontSize:starDimension,lineHeight:1.3}}>{Array.from({length:numberOfStars},(_,i)=>changeRating?<button type="button" key={i} onClick={()=>changeRating(i+1,name)} aria-label={`Rate ${i+1} stars`} aria-pressed={i+1===rating} style={{border:0,background:"none",color:"inherit",padding:"3px",fontSize:"inherit",cursor:"pointer"}}>{rating>=i+1?"★":"☆"}</button>:<span aria-hidden="true" key={i}>{rating>=i+.5?"★":"☆"}</span>)}</span>;
}
