import React from "react";
import {Link,useSearchParams} from "react-router-dom";
import {useGetProductsQuery} from "../../redux/api/productsApi";
import ProductItem from "../product/ProductItem";
import CustomPagination from "../layout/CustomPagination";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import PromotionBanners from "./PromotionBanners";
export default function Deals(){
 const [params,setParams]=useSearchParams();const campaign=params.get("campaign")||"";
 const {data,isLoading,error}=useGetProductsQuery({page:params.get("page")||1,listingType:"retail",dealsOnly:"true",campaign,sort:params.get("sort")||"newest"},{pollingInterval:60000,refetchOnMountOrArgChange:true});
 return <main className="tt-page"><MetaData title="Deals | Tactical Trends"/><h1 id="products_heading">{campaign?"Campaign deals":"Today's deals"}</h1><p>Live offers on available retail products. The best eligible discount is applied once per item.</p><PromotionBanners/><div className="tt-toolbar"><Link to="/">Continue shopping</Link>{campaign&&<Link to="/deals">View all deals</Link>}<label>Sort<select value={params.get("sort")||"newest"} onChange={event=>{const next=new URLSearchParams(params);next.set("sort",event.target.value);next.set("page","1");setParams(next);}}><option value="newest">Newest</option><option value="priceAsc">Sale price: low to high</option><option value="priceDesc">Sale price: high to low</option><option value="rating">Highest rated</option></select></label></div>{isLoading?<Loader/>:error?<p role="alert">Offers could not be loaded. Please refresh.</p>:<><div className="row">{data?.products?.map(product=><ProductItem key={product._id} product={product} columnSize={4}/>)}</div>{!data?.products?.length&&<p className="tt-empty">No active offers in this selection right now.</p>}<CustomPagination resPerPage={data?.resPerPage} filteredProductsCount={data?.filteredProductsCount}/></>}</main>;
}
