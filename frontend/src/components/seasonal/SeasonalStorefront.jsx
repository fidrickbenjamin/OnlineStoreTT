import React,{useEffect,useState} from 'react';
import {SeasonalContext} from './SeasonalContext';
import {useLocation} from 'react-router-dom';
import {useActiveSeasonQuery} from '../../redux/api/seasonalApi';
import {SeasonBanner,SeasonTrim,SeasonEdges} from './SeasonScene';
export default function SeasonalStorefront({header,children,footer}){
 const {pathname}=useLocation(),admin=pathname.startsWith('/admin');
 const {data,error,refetch}=useActiveSeasonQuery(undefined,{skip:admin,pollingInterval:60000,refetchOnMountOrArgChange:true});
 const [clock,setClock]=useState(Date.now());
 // Server-derived boundary with elapsed local time: a wrong device date cannot pick a holiday.
 useEffect(()=>{if(admin||!data)return;const remaining=data.nextChangeAt?+new Date(data.nextChangeAt)-+new Date(data.serverTime):60000;const timer=setTimeout(()=>{setClock(Date.now());refetch();},Math.max(100,Math.min(60000,remaining)));return()=>clearTimeout(timer);},[admin,data,clock,refetch]);
 const [receipt,setReceipt]=useState({data:null,at:Date.now()});
 useEffect(()=>{setReceipt({data,at:Date.now()});},[data]);
 const expired=receipt.data===data&&data?.nextChangeAt&&+new Date(data.serverTime)+(Date.now()-receipt.at)>=+new Date(data.nextChangeAt);
 const season=!admin&&!error&&!expired?data?.active:null;
 const quiet=!(pathname==='/'||pathname==='/deals'||pathname.startsWith('/product/'));
 return <SeasonalContext.Provider value={season}><div className="tt-season-root" data-theme={season?.theme||''} data-intensity={season?.intensity||'subtle'} data-animate={season?.animations?'true':'false'} data-quiet={quiet?'true':'false'}><div className="tt-season-header">{header}</div>{season&&<SeasonTrim/>}{season&&!quiet&&<><SeasonEdges season={season}/>{pathname!=='/'&&<div className="container tt-season-welcome"><SeasonBanner season={season}/></div>}</>}<div className="tt-season-content">{children}</div>{season&&!quiet&&<div className="tt-season-signoff"><span>{season.theme==='madras'?'Woven with island spirit.':season.theme==='christmas'?'A little joy, from our home to yours.':season.theme==='carnival'?'Celebrate the colour of our island.':'Made for moments worth celebrating.'}</span></div>}{season&&<SeasonTrim/>}{footer}</div></SeasonalContext.Provider>;
}
