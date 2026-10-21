import {userApi} from './userApi';
import {setUser} from '../features/userSlice';
const sync=async(args,{dispatch,queryFulfilled})=>{try{const {data}=await queryFulfilled;if(data.user)dispatch(setUser(data.user));}catch{}};
const api=userApi.injectEndpoints({endpoints:builder=>({
 saveRecipient:builder.mutation({query:({id,...body})=>({url:id?`/me/recipients/${id}`:'/me/recipients',method:id?'PUT':'POST',body}),onQueryStarted:sync,invalidatesTags:['User']}),
 deleteRecipient:builder.mutation({query:({id,revision})=>({url:`/me/recipients/${id}`,method:'DELETE',body:{revision}}),onQueryStarted:sync,invalidatesTags:['User']}),
 defaultRecipient:builder.mutation({query:body=>({url:'/me/delivery-default',method:'PUT',body}),onQueryStarted:sync,invalidatesTags:['User']}),
})});
export const {useSaveRecipientMutation,useDeleteRecipientMutation,useDefaultRecipientMutation}=api;
