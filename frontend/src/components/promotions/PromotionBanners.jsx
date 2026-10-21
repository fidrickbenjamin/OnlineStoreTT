import React from "react";
import {Link} from "react-router-dom";
import {useActivePromotionsQuery} from "../../redux/api/promotionsApi";
import {Countdown} from "./SalePrice";
export default function PromotionBanners(){
 const {data}=useActivePromotionsQuery(undefined,{pollingInterval:60000,refetchOnMountOrArgChange:true});
 return <>{data?.campaigns?.slice(0,3).map(campaign=><section className="tt-promo-banner" key={campaign._id}><div><h2>{campaign.name}</h2>{campaign.bannerText&&<p className="mb-2">{campaign.bannerText}</p>}<Countdown endsAt={campaign.endsAt}/></div><Link to={`/deals?campaign=${campaign._id}`}>Shop these deals</Link></section>)}</>;
}
