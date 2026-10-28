export const businessKind=b=>b?.type==='Convenience Store'?'convenience':b?.type==='Hardware Store'?'hardware':'food';
export const isPurchase=kind=>['food','convenience','hardware'].includes(kind);
export const storeHubPath=kind=>kind==='hardware'?'/hardware-hub':kind==='convenience'?'/convenience-hub':'/food-hub';
export const hubTitle=kind=>kind==='hardware'?'Hardware Hub':kind==='convenience'?'Convenience Hub':'Food Hub';
export const BUSINESS_TYPES=['Restaurant','Bar','Restaurant & Bar','Convenience Store','Hardware Store'];
