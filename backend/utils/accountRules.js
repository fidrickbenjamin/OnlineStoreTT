export const cleanText=(value,label,max=120,required=false)=>{if(value===undefined||value===null)value='';if(typeof value!=='string')throw Error(`${label} must be text.`);const text=value.trim();if((required&&!text)||text.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text))throw Error(`Check ${label.toLowerCase()} (maximum ${max} characters).`);return text;};
export function contactPhone(value,required=false){const phone=cleanText(value,'Phone number',40,required);if(!phone)return '';const digits=phone.replace(/[\s()+.-]/g,'');if(!/^\+?[\d\s().-]+$/.test(phone)||!/^\d{7,15}$/.test(digits))throw Error('Enter a valid phone number with its country code.');return phone.startsWith('+')?`+${digits}`:digits;}
export function dominicaPhone(value){let phone=contactPhone(value,true).replace(/^\+/,'');if(phone.length===7)phone=`1767${phone}`;else if(phone.length===10&&phone.startsWith('767'))phone=`1${phone}`;if(!/^1767\d{7}$/.test(phone))throw Error('Enter a Dominica recipient number, for example +1 767 555 0123.');return `+${phone}`;}
export function deliveryAddress(body,{recipient=false}={}){
 const country=cleanText(body?.country||'Dominica','Delivery country',80,true);if(country.toLowerCase()!=='dominica'&&country.toUpperCase()!=='DM')throw Error('Delivery and collection are available in Dominica only. Your country of residence can be different.');
 const result={address:cleanText(body?.address,'Address',120,true),city:cleanText(body?.city,'Community / village',120,true),zipCode:cleanText(body?.zipCode||'N/A','Postal code',30),phoneNo:dominicaPhone(body?.phoneNo),country:'Dominica',landmark:cleanText(body?.landmark,'Landmark',200),deliveryNotes:cleanText(body?.deliveryNotes,'Delivery instructions',500)};
 if(recipient)Object.assign(result,{recipientName:cleanText(body?.recipientName,'Recipient name',80,true),label:cleanText(body?.label,'Recipient label',40,true)});
 return result;
}
export function checkoutContacts(user,body){
 const raw=body.shippingInfo||{},address=deliveryAddress(raw),deliveryFor=raw.deliveryFor||'self';if(!['self','other'].includes(deliveryFor))throw Error('Choose who will receive the order.');
 const recipientName=cleanText(raw.recipientName||(deliveryFor==='self'?user.name:''),'Recipient name',80,deliveryFor==='other');
 const contactPreference=raw.contactPreference||'recipient';if(!['buyer','recipient'].includes(contactPreference))throw Error('Choose a delivery contact.');
 if(raw.deliveryFor&&body.shippingOption!=='pickup'&&raw.deliveryArea!==body.shippingOption)throw Error('Confirm the recipient address is inside the selected delivery service area.');
 const buyer=body.buyerInfo||{};
 const buyerInfo={name:cleanText(user.name||'Customer','Buyer name',80,true),email:cleanText(user.email||'','Buyer email',254),country:cleanText(buyer.country||user.countryOfResidence||'Dominica','Country of residence',80,true),phoneNo:contactPhone(buyer.phoneNo||user.contactPhone||address.phoneNo,true)};
 const isGift=raw.isGift===true,giftMessage=isGift?cleanText(raw.giftMessage,'Gift message',300):'';
 return {buyerInfo,shippingInfo:{...address,recipientName,deliveryFor,contactPreference,isGift,giftMessage,deliveryArea:body.shippingOption}};
}
export function safeUser(user){const data=user.toObject?user.toObject():{...user};delete data.password;delete data.resetPasswordToken;delete data.resetPasswordExpire;return data;}
