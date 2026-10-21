import {productApi} from "./productsApi";
const api=productApi.injectEndpoints({endpoints:builder=>({
 activePromotions:builder.query({query:()=>"/promotions/active",providesTags:["Promotions"]}),
 adminPromotions:builder.query({query:()=>"/admin/promotions",providesTags:["Promotions"]}),
 savePromotion:builder.mutation({query:({id,...body})=>({url:id?`/admin/promotions/${id}`:"/admin/promotions",method:id?"PUT":"POST",body}),invalidatesTags:["Promotions","Product","AdminProducts"]}),
 promotionAction:builder.mutation({query:({id,...body})=>({url:`/admin/promotions/${id}/action`,method:"POST",body}),invalidatesTags:["Promotions","Product","AdminProducts"]}),
 previewPromotion:builder.mutation({query:body=>({url:"/admin/promotions/preview",method:"POST",body})}),
 productSale:builder.query({query:id=>`/admin/products/${id}/sale`,providesTags:["Promotions"]}),
 saveProductSale:builder.mutation({query:({id,...body})=>({url:`/admin/products/${id}/sale`,method:"PUT",body}),invalidatesTags:["Promotions","Product","AdminProducts"]}),
})});
export const {useActivePromotionsQuery,useAdminPromotionsQuery,useSavePromotionMutation,usePromotionActionMutation,usePreviewPromotionMutation,useProductSaleQuery,useSaveProductSaleMutation}=api;
