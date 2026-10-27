import React from 'react';
import {useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
export default function AddressDisplay(){
 const {user}=useSelector(state=>state.auth),navigate=useNavigate();
 const recipient=user?.savedRecipients?.find(row=>String(row._id)===String(user.defaultRecipientId));
 const address=recipient||user?.shippingInfo;
 const location=user?(address?.city||'Set location'):'Dominica';
 const title=address?.city?`${recipient?.recipientName||recipient?.label||'Your delivery location'}: ${address.city}, Dominica. Change delivery details.`:'Choose your delivery details for Dominica.';
 return <button type="button" className="tt-header-delivery" title={title} aria-label={`Delivery location: ${location}. Change delivery details.`} onClick={()=>navigate(user?'/me/address':'/login')}><i className="bi bi-geo-alt-fill" aria-hidden="true"/><span><small>Deliver to</small><strong>{location}</strong></span><i className="bi bi-chevron-down" aria-hidden="true"/></button>;
}
