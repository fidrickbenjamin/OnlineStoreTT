import {useHubNavigation} from './hubs/HubNavigation';
import React,{useContext,useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {useGetFeaturedProductsQuery} from '../redux/api/productsApi';
import {SeasonalContext} from './seasonal/SeasonalContext';
import SeasonArt from './seasonal/SeasonArt';
import SalePrice from './promotions/SalePrice';
import './Hero.css';

function ProductPhoto({product}){
 const [failed,setFailed]=useState(false);
 return failed?<div className="market-hero-photo-fallback"><i className="bi bi-bag" aria-hidden="true"/><span>{product.name}</span></div>:<img src={product.images[0].url} alt={product.name} onError={()=>setFailed(true)} draggable="false" width="360" height="260" fetchPriority="high"/>;
}
export default function Hero(){
 const {hubs}=useHubNavigation(),visible=key=>hubs.some(h=>h.key===key&&h.enabled);
 const season=useContext(SeasonalContext),{data,isLoading,isError}=useGetFeaturedProductsQuery(undefined,{pollingInterval:60000,refetchOnFocus:true});
 const products=data?.products||[],[index,setIndex]=useState(0),[paused,setPaused]=useState(false),[hover,setHover]=useState(false),[focus,setFocus]=useState(false),[hidden,setHidden]=useState(document.hidden),[reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches),gesture=useRef(null);
 const current=index%Math.max(1,products.length),product=products[current];
 useEffect(()=>{const update=()=>setHidden(document.hidden),media=window.matchMedia('(prefers-reduced-motion: reduce)'),motion=e=>setReduced(e.matches);document.addEventListener('visibilitychange',update);media.addEventListener('change',motion);return()=>{document.removeEventListener('visibilitychange',update);media.removeEventListener('change',motion);};},[]);
 useEffect(()=>{if(products.length<2||paused||hover||focus||hidden||reduced)return;const timer=setInterval(()=>{if(!document.querySelector('.modal.show'))setIndex(i=>(i+1)%products.length);},6500);return()=>clearInterval(timer);},[products.length,paused,hover,focus,hidden,reduced]);
 const move=amount=>{setPaused(true);setIndex((current+amount+products.length)%products.length);};
 return <section className="market-welcome" aria-label="Marketplace welcome">
  <div className="market-hero" data-hero-theme={season?.theme||''}>
   {season?.decorations&&<div className="market-hero-decoration" aria-hidden="true"><SeasonArt theme={season.theme}/></div>}
   <div className="market-hero-copy">
    <span className="market-hero-eyebrow">{season?.holidayName||'Rooted in Dominica'} <span aria-hidden="true">·</span> Tactical Trends Marketplace</span>
    <h2>{season?.title||<>Shop local.<br/><span>Discover more.</span></>}</h2>
    <p>{season?.message||'Everyday essentials, fresh finds and local connections. Shop for yourself or someone back home.'}</p>
    <div className="market-hero-actions"><a className="market-hero-button" href="#products_heading">Shop products <i className="bi bi-arrow-right" aria-hidden="true"/></a>{visible('delivery')&&<Link className="market-hero-button secondary" to="/delivery-hub">Request delivery</Link>}</div>
    {season?.link&&season?.linkLabel&&<Link className="market-season-link" to={season.link}>{season.linkLabel} <span aria-hidden="true">↗</span></Link>}
    <div className="market-hero-note"><i className="bi bi-geo-alt" aria-hidden="true"/> Local finds. Island connections.</div>
   </div>
   <div className="market-hero-showcase" role="region" aria-roledescription="carousel" aria-label="Featured products" onPointerEnter={e=>{if(e.pointerType==='mouse')setHover(true);}} onPointerLeave={()=>setHover(false)} onFocusCapture={()=>setFocus(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocus(false);}}>
    <div className="market-product-stage" aria-live={paused?'polite':'off'} aria-atomic="true" onTouchStart={e=>{if(e.touches.length!==1||e.target.closest('button,a')){gesture.current=null;return;}const t=e.touches[0];gesture.current={x:t.clientX,y:t.clientY,vertical:false};}} onTouchMove={e=>{const g=gesture.current;if(!g)return;if(e.touches.length!==1){gesture.current=null;return;}const t=e.touches[0];if(Math.abs(t.clientY-g.y)>12&&Math.abs(t.clientY-g.y)>Math.abs(t.clientX-g.x))g.vertical=true;}} onTouchCancel={()=>{gesture.current=null;}} onTouchEnd={e=>{const g=gesture.current;gesture.current=null;if(!g||g.vertical||products.length<2||e.changedTouches.length!==1)return;const t=e.changedTouches[0],dx=t.clientX-g.x,dy=t.clientY-g.y;if(g.x>24&&g.x<window.innerWidth-24&&Math.abs(dx)>=60&&Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);}}>
     {product?<article className="market-featured-product" aria-roledescription="slide" aria-label={`${current+1} of ${products.length}`}><div className="market-product-label"><span>{data.curated?'Handpicked for you':'Fresh from the marketplace'}</span><i className="bi bi-stars" aria-hidden="true"/></div><Link className="market-product-photo" to={`/product/${product._id}`} tabIndex={-1} aria-hidden="true"><ProductPhoto key={`${product._id}:${product.images[0].url}`} product={product}/></Link><div className="market-product-details"><small>{product.category?.main||'Marketplace find'}</small><h3>{product.name}</h3><SalePrice product={product} size="medium"/><Link className="market-product-link" to={`/product/${product._id}`}>View product <i className="bi bi-arrow-up-right" aria-hidden="true"/></Link></div></article>:<div className="market-hero-placeholder" role="status"><i className="bi bi-shop" aria-hidden="true"/><h3>{isLoading?'Finding your next favourite…':'A little local. A lot to discover.'}</h3><p>{isError?'Featured picks are taking a little longer. You can still browse the marketplace below.':'Explore the marketplace, discover local food or arrange your next delivery.'}</p>{visible('food')&&<Link to="/food-hub">Explore Food Hub <span aria-hidden="true">↗</span></Link>}</div>}
    </div>
    {products.length>1&&<div className="market-carousel-controls"><button type="button" aria-label="Previous featured product" onClick={()=>move(-1)}><i className="bi bi-arrow-left" aria-hidden="true"/></button><div className="market-carousel-dots">{products.map((p,i)=><button type="button" key={p._id} aria-label={`Show featured product ${i+1}: ${p.name}`} aria-current={current===i?'true':undefined} onClick={()=>{setPaused(true);setIndex(i);}}><span/></button>)}</div><button type="button" aria-label="Next featured product" onClick={()=>move(1)}><i className="bi bi-arrow-right" aria-hidden="true"/></button>{!reduced&&<button type="button" aria-label={paused?'Resume product rotation':'Pause product rotation'} onClick={()=>setPaused(v=>!v)}><i className={`bi bi-${paused?'play':'pause'}-fill`} aria-hidden="true"/></button>}</div>}
   </div>
  </div>
  <nav className="market-hub-shortcuts" aria-label="Explore marketplace services">{hubs.filter(h=>h.enabled).map(h=>[h.label,({food:'Local dishes & drinks',ride:'Request a taxi ride',delivery:'Send something locally',property:'Find your next space',convenience:'Everyday essentials',hardware:'Tools & building supplies'})[h.key],h.path,h.icon]).map(([title,note,to,icon])=><Link key={to} to={to}><span className="market-hub-icon"><i className={`bi bi-${icon}`} aria-hidden="true"/></span><span><strong>{title}</strong><small>{note}</small></span><i className="bi bi-arrow-up-right" aria-hidden="true"/></Link>)}</nav>
  {visible('delivery')&&<div className="market-business-strip"><i className="bi bi-truck" aria-hidden="true"/><span><strong>Already selling through WhatsApp or in store?</strong><small>Request a pickup and let Tactical Trends help with the delivery.</small></span><Link to="/delivery-hub">Request a pickup <span aria-hidden="true">→</span></Link></div>}
 </section>;
}
