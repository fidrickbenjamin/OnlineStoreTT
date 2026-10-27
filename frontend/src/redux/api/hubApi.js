import {productApi} from './productsApi';
const api=productApi.enhanceEndpoints({addTagTypes:['Hubs']}).injectEndpoints({endpoints:builder=>({
 hub:builder.query({query:path=>`/hubs${path}`,providesTags:['Hubs']}),
 hubAction:builder.mutation({query:({path,body,method='POST'})=>({url:`/hubs${path}`,method,body}),invalidatesTags:(result,error,arg)=>error||arg.path.endsWith('/location')||arg.path==='/estimate'?[]:['Hubs']})
})});
export const {useHubQuery,useHubActionMutation}=api;
