import {productApi} from './productsApi';
const api=productApi.enhanceEndpoints({addTagTypes:['Appearance']}).injectEndpoints({endpoints:builder=>({
 activeSeason:builder.query({query:()=>'/appearance/active',providesTags:['Appearance']}),
 adminSeasons:builder.query({query:year=>({url:'/admin/appearance',params:{year}}),providesTags:['Appearance']}),
 saveSeasons:builder.mutation({query:body=>({url:'/admin/appearance',method:'PUT',body}),invalidatesTags:['Appearance']}),
 previewSeasons:builder.mutation({query:body=>({url:'/admin/appearance/preview',method:'POST',body})}),
})});
export const {useActiveSeasonQuery,useAdminSeasonsQuery,useSaveSeasonsMutation,usePreviewSeasonsMutation}=api;
