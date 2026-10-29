import crypto from 'node:crypto';
import {text,cents,fail} from './rules.js';
export function variantFields(input,existing=[]){
 if(input===undefined){if(existing.length)fail('Reload this editor before saving a product with variants.',409);return [];}
 if(!Array.isArray(input)||input.length>40)fail('Use at most 40 variants per product.');const names=new Set(),ids=new Set();
 return input.map(v=>{if(!v||typeof v!=='object'||Array.isArray(v))fail('Enter a valid variant.');const name=text(v.name,80).replace(/\s+/g,' '),key=name.normalize('NFKC').toLowerCase();if(!name||names.has(key))fail('Give each variant a unique name.');names.add(key);if(v.price==null||String(v.price).trim()==='')fail('Enter the full price for each variant.');if(typeof v.available!=='boolean')fail('Choose availability for each variant.');if(v.id&&!existing.some(x=>x.id===v.id))fail('A variant changed. Reload this product before saving.',409);const id=v.id||crypto.randomUUID();if(ids.has(id))fail('Each variant must appear once.');ids.add(id);return {id,name,priceCents:cents(v.price),available:v.available};});
}
export function chooseVariant(item,id){const variants=item.variants||[];if(!variants.length){if(id)fail('This item no longer has that variant. Review your basket.',409);return null;}const v=variants.find(x=>x.id===id);if(!v||!v.available)fail('Choose an available size or flavour for this item.',409);return v;}
