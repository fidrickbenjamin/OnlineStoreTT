import React from 'react';
import {Link} from 'react-router-dom';
import SeasonArt from './SeasonArt';
import './seasonal.css';
export function SeasonTrim(){return <div className="tt-season-trim" aria-hidden="true"/>;}
export function SeasonBanner({season,preview=false}){
 if(!season)return null;
 return <section className="tt-season-banner" aria-label={`${season.themeName} seasonal welcome`}><div className="tt-season-copy"><span className="tt-season-eyebrow">{season.eyebrow}</span><h2>{season.title}</h2><p>{season.message}</p>{season.link&&(preview?<span className="tt-season-cta">{season.linkLabel}<span aria-hidden="true"> ↗</span></span>:<Link className="tt-season-cta" to={season.link}>{season.linkLabel}<span aria-hidden="true"> ↗</span></Link>)}</div>{season.decorations&&<SeasonArt theme={season.theme}/>}</section>;
}
export function SeasonEdges({season}){return season?.decorations&&season.intensity!=='subtle'?<div className="tt-season-edges" aria-hidden="true"><SeasonArt theme={season.theme}/><SeasonArt theme={season.theme}/>{['carnival','newyear'].includes(season.theme)&&Array.from({length:season.intensity==='full'?36:20},(_,i)=><span className="tt-season-confetti" key={i} style={{[i%2?'right':'left']:`${8+(i%4)*12}px`,top:`${24+i*37}px`,rotate:`${i*37}deg`,background:season.theme==='newyear'?['#b78b3b','#e3bd70','#b87a99'][i%3]:['#c52e73','#c39318','#269c8d','#7959a0'][i%4]}}/>)}</div>:null;}
export function SeasonPreview({season,mobile=false}){
 return <div className={`tt-season-preview ${mobile?'is-mobile':''}`}><div className="tt-season-root" data-theme={season?.theme||''} data-intensity={season?.intensity||'subtle'} data-animate="false" data-quiet="false"><div className="tt-preview-header"><strong>Tactical Trends</strong><span>Dominica’s Online Market Place</span></div>{season&&<SeasonTrim/>}<div className="tt-preview-nav">Home <span>Shop</span> <span>Property Hub</span></div><SeasonBanner season={season} preview/><div className="tt-preview-products"><h3>Find your next favourite</h3><div>{['Everyday essentials','Thoughtful gifts','Tech & accessories'].map((title,i)=><article className="product-card" key={title}><div className={`tt-preview-product tt-preview-product-${i}`}><i className={`bi bi-${['bag','gift','headphones'][i]}`} aria-hidden="true"/></div><strong>{title}</strong><small>Discover something special</small><span className="tt-preview-shop">Explore collection →</span></article>)}</div></div>{season&&<SeasonTrim/>}<div className="tt-preview-footer">Local finds. Island spirit.</div></div></div>;
}
