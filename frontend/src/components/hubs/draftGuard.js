import {useEffect} from 'react';
let dirty=false;
export const confirmCatalogueDiscard=()=>!dirty||window.confirm('Discard the unsaved product changes?');
export function useCatalogueDraftGuard(value){useEffect(()=>{dirty=value;const unload=e=>{if(value){e.preventDefault();e.returnValue='';}},click=e=>{const a=e.target.closest?.('a[href]');if(!value||!a||a.target==='_blank'||a.hasAttribute('download')||a.getAttribute('href')?.startsWith('#'))return;if(!window.confirm('Discard the unsaved product changes?')){e.preventDefault();e.stopPropagation();}};window.addEventListener('beforeunload',unload);document.addEventListener('click',click,true);return()=>{dirty=false;window.removeEventListener('beforeunload',unload);document.removeEventListener('click',click,true);};},[value]);}
