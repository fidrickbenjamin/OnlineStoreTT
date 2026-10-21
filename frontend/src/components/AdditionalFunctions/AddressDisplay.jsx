import React from 'react';
import {useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
export default function AddressDisplay(){const {user}=useSelector(state=>state.auth),navigate=useNavigate(),recipient=user?.savedRecipients?.find(row=>String(row._id)===user.defaultRecipientId),address=recipient||user?.shippingInfo;const text=recipient?`Default: ${recipient.label}`:address?.city?`Deliver to ${address.city}`:'Set delivery details';return <button type="button" className="form-control" style={{maxWidth:200,fontSize:12,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} title={address?.address?`${address.address}, ${address.city}, Dominica`:text} onClick={()=>navigate(user?'/me/address':'/login')}>{user?text:'Delivery details'}</button>;}
