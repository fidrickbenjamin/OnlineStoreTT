import React from 'react';
import {Field} from './HubUI';
export default function StoreProductFields({value:v,onChange}){
 const edit=(key,value)=>onChange({...v,[key]:value});
 return <><Field label="Purchase unit" required maxLength={40} value={v.unit||'each'} onChange={e=>edit('unit',e.target.value)} placeholder="each, 1 kg bag, 20 ft length…"/><Field label="Delivery class"><select value={v.deliveryClass||'standard'} onChange={e=>edit('deliveryClass',e.target.value)}><option value="standard">Standard delivery</option><option value="large">Large / heavy · extra handling per unit</option><option value="quote">Vehicle and delivery quote required</option></select></Field>{v.deliveryClass==='large'&&<Field label="Extra delivery handling per unit (XCD)" required type="number" min="0" step="0.01" value={v.handlingFee??0} onChange={e=>edit('handlingFee',e.target.value)}/>}<p className="hub-note">Stock is confirmed before a final quote. Handling charges belong to delivery and are excluded from the amount owed to the store.</p></>;
}
