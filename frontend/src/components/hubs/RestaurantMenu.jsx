import {ProductChoice} from './ProductVariants';
import React,{useId,useLayoutEffect,useRef,useState} from 'react';



function sectionName(category){
 const name=(category||'Menu').trim()||'Menu';
 const aliases={dish:'Dishes',dishes:'Dishes',side:'Sides',sides:'Sides',drink:'Drinks',drinks:'Drinks'};
 return Object.prototype.hasOwnProperty.call(aliases,name.toLowerCase())?aliases[name.toLowerCase()]:name;
}

export default function RestaurantMenu({menu,open,onAdd,store=false}){
 const standard=store?[...new Set(menu.map(i=>sectionName(i.category)))]:['Dishes','Sides','Drinks'];if(!standard.length)standard.push('Products');
 const [selected,setSelected]=useState(()=>standard.find(name=>menu.some(item=>sectionName(item.category)===name))||(menu.length?sectionName(menu[0].category):'Dishes')),[hint,setHint]=useState(true);
 const root=useRef(null),tabs=useRef(null),buttons=useRef(Object.create(null)),gesture=useRef(null),positions=useRef(Object.create(null)),pending=useRef(null),id=useId();
 const groups=new Map(standard.map(name=>[name,[]]));
 menu.forEach(item=>{const name=sectionName(item.category);if(!groups.has(name))groups.set(name,[]);groups.get(name).push(item);});
 const sections=[...groups.keys()],active=groups.has(selected)?selected:standard[0],index=sections.indexOf(active);
 const choose=(name,focus=false)=>{
  if(name===active)return;
  const top=root.current.getBoundingClientRect().top+window.scrollY;
  positions.current[active]=Math.max(0,window.scrollY-top);
  pending.current={name,scroll:window.scrollY>=top-4||Boolean(positions.current[name]),top,focus};
  setSelected(name);
 };
 useLayoutEffect(()=>{
  const change=pending.current;
  if(!change||change.name!==active)return;
  pending.current=null;
  const button=buttons.current[active];
  // Scroll only the horizontal tab strip, never the document through scrollIntoView.
  if(button&&tabs.current)tabs.current.scrollLeft=button.offsetLeft-(tabs.current.clientWidth-button.offsetWidth)/2;
  if(change.scroll)window.scrollTo({top:change.top+(positions.current[active]||0),behavior:'instant'});
  if(change.focus)button?.focus({preventScroll:true});
 },[active]);
 const touchStart=e=>{
  if(e.touches.length!==1||e.target.closest('button,a,input,select,textarea')){gesture.current=null;return;}
  const t=e.touches[0];gesture.current={x:t.clientX,y:t.clientY,vertical:false};
 };
 const touchMove=e=>{
  const start=gesture.current;if(!start)return;
  if(e.touches.length!==1){gesture.current=null;return;}
  const t=e.touches[0];if(Math.abs(t.clientY-start.y)>12&&Math.abs(t.clientY-start.y)>Math.abs(t.clientX-start.x))start.vertical=true;
 };
 const touchEnd=e=>{
  const start=gesture.current;gesture.current=null;if(!start||start.vertical||e.changedTouches.length!==1)return;
  const t=e.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;
  // Leave screen-edge gestures to the browser's back/forward navigation.
  if(start.x<24||start.x>window.innerWidth-24||Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.5)return;
  const next=index+(dx<0?1:-1);if(next<0||next>=sections.length)return;
  setHint(false);choose(sections[next]);
 };
 return <section className="hub-restaurant-menu" ref={root} aria-label={store?'Store products':'Restaurant menu'}>
  <div className="hub-menu-navigation">
   <div className="hub-menu-tablist" ref={tabs} role="tablist" aria-label="Menu sections" onKeyDown={e=>{
    const keys={ArrowRight:(index+1)%sections.length,ArrowLeft:(index-1+sections.length)%sections.length,Home:0,End:sections.length-1};
    if(keys[e.key]!==undefined){e.preventDefault();choose(sections[keys[e.key]],true);}
   }}>{sections.map((name,i)=><button key={name} ref={node=>{buttons.current[name]=node;}} id={`${id}-tab-${i}`} type="button" role="tab" aria-selected={active===name} aria-controls={`${id}-panel`} tabIndex={active===name?0:-1} onClick={()=>choose(name)}><span>{name}</span><small>{groups.get(name).length}</small></button>)}</div>
   {hint&&<p className="hub-menu-swipe-hint"><i className="bi bi-arrow-left-right" aria-hidden="true"/> Swipe across the menu or tap a section</p>}
  </div>
  <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} tabIndex={0} className="hub-menu-panel" onTouchStart={touchStart} onTouchMove={touchMove} onTouchEnd={touchEnd} onTouchCancel={()=>{gesture.current=null;}}>
   <h2>{active}</h2><p className="hub-menu-section-count">{groups.get(active).length} {groups.get(active).length===1?'item':'items'} available</p>
   <div className="hub-menu-grid">{groups.get(active).map(item=><article className="hub-dish" key={item._id}>{item.image&&<img src={item.image} alt="" loading="lazy" draggable="false"/>}<div><h3>{item.name}</h3><p>{item.description}</p><ProductChoice item={item} open={open} onAdd={onAdd} store={store}/></div></article>)}</div>
   {!groups.get(active).length&&<p className="hub-empty">{menu.length?`No ${active.toLowerCase()} are listed yet. Choose another section to continue browsing.`:store?'Products are being added. Check back soon.':'The menu is being prepared. Check back soon.'}</p>}
  </div>
 </section>;
}
