import React,{useEffect,useRef} from 'react';
import {Link,NavLink,useLocation} from 'react-router-dom';
import {useSelector} from 'react-redux';
import '../account/account.css';
export default function UserLayout({children}){
 const {user}=useSelector(state=>state.auth),nav=useRef(null),location=useLocation();
 useEffect(()=>{const node=nav.current,active=node?.querySelector('a.active');if(node&&active&&node.scrollWidth>node.clientWidth)node.scrollLeft+=active.getBoundingClientRect().left-node.getBoundingClientRect().left-8;},[location.pathname]);
 const links=[['Overview','/me/profile','person-circle'],['My Orders','/me/orders','box-seam'],['Hub Activity','/me/activity','activity'],['Business Centre','/business-centre','shop'],['Driver Centre','/driver-centre','truck'],['Personal Details','/me/update_profile','person'],['Delivery Details','/me/address','geo-alt'],['Security','/me/update_password','shield-lock']];
 return <main className="tt-account"><div className="tt-account-heading"><div><span className="tt-account-kicker">Tactical Trends · Your space</span><h1>My account</h1></div><Link to="/">Continue shopping ↗</Link></div><div className="tt-account-shell"><aside className="tt-account-sidebar"><div className="tt-account-person"><img src={user?.avatar?.url||'/images/default_avatar.jpg'} alt="" onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src='/images/default_avatar.jpg';}}/><div><strong>{user?.name}</strong><small>Welcome back</small></div></div><nav ref={nav} className="tt-account-nav" aria-label="Account navigation">{links.map(([name,to,icon])=><NavLink end key={to} to={to}><i className={`bi bi-${icon}`} aria-hidden="true"/>{name}</NavLink>)}</nav></aside><div className="tt-account-main">{children}</div></div></main>;
}
