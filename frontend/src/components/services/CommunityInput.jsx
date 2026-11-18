import React,{useId} from 'react';
import {useHubQuery} from '../../redux/api/hubApi';
export default function CommunityInput({value,onChange,id,invalid=false}){
 const {data,error}=useHubQuery('/delivery-directory'),list=useId();
 return <><input id={id} className={`form-control ${invalid?'is-invalid':''}`} list={list} value={value||''} maxLength={120} autoComplete="shipping address-level2" onChange={e=>onChange(e.target.value)} aria-invalid={invalid} placeholder="Search village, town or neighbourhood"/><datalist id={list}>{(data?.communities||[]).flatMap(c=>[<option key={c.id} value={c.name}/>,...(c.aliases||[]).map(a=><option key={`${c.id}:${a}`} value={a}>{c.name}</option>)])}</datalist><small>{error?'Community suggestions unavailable. Enter your community; delivery pricing will still be checked.':'Type to search. Community not listed? Enter its name to request a quote.'}</small></>;
}
