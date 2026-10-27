import React,{useId} from 'react';
import {Field} from './HubUI';

export default function MenuSectionField({value,onChange}){
 const id=useId();
 return <><Field label="Menu section" required maxLength={60} list={id} value={value} onChange={onChange} placeholder="Dishes, Sides or Drinks"/><datalist id={id}>{['Dishes','Sides','Drinks'].map(section=><option key={section} value={section}/>)}</datalist><p className="hub-note">Choose Dishes, Sides or Drinks, or enter a custom section. To sell a side on its own, add it as a separate item in Sides with its own price. Dish extras remain attached to their dish.</p></>;
}
