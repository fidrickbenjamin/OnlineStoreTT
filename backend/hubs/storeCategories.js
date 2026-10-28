import {Business,Menu,StoreCategory} from './models.js';
import {businessKind} from './storeRules.js';
import {fail,text,integer,image} from './rules.js';
const sid=v=>String(v?._id||v);
export const categoryKey=v=>text(v,60).normalize('NFKC').toLowerCase().replace(/\s+/g,' ');
const validId=v=>typeof v==='string'&&/^[a-f\d]{24}$/i.test(v);
const hubValue=v=>{if(!['convenience','hardware'].includes(v))fail('Choose Convenience Hub or Hardware Hub.');return v;};
const icons=['grid','basket2','cup-straw','house-heart','heart-pulse','flower1','tools','wrench-adjustable','plug','bricks','paint-bucket','lightbulb','box-seam'];
async function storeFor(req){
 const b=req.user.role==='admin'&&req.params.id?await Business.findById(req.params.id):await Business.findOne({owner:req.user._id});
 if(!b||businessKind(b)==='food')fail('Choose a convenience or hardware store.',404);
 if(b.archived)fail('Restore this business before changing its catalogue.',409);
 if(req.user.role!=='admin'&&b.status!=='Approved')fail('Business approval is required.',403);return b;
}
function distinctIds(value,max,label){if(!Array.isArray(value)||value.length>max||value.some(x=>!validId(x))||new Set(value).size!==value.length)fail(`Choose up to ${max} distinct ${label}.`);return value;}
export async function categoryFields(v,b){
 if(businessKind(b)==='food')return {};
 if(!validId(v.categoryId))fail('Choose a managed product category. Import existing categories or select categories for this store first.');
 const c=await StoreCategory.findOne({_id:v.categoryId,hub:businessKind(b),archived:{$ne:true}});
 if(!c||!b.categoryIds?.some(x=>sid(x)===v.categoryId))fail('Choose an active category assigned to this store.',409);
 return {categoryId:c._id,category:c.name};
}
export async function publicCategoryIds(b){
 return new Set((await StoreCategory.find({hub:businessKind(b),archived:{$ne:true},_id:{$in:b.categoryIds||[]}}).select('_id').lean()).map(c=>sid(c)));
}
export function productHasCategory(m,b,valid){
 if(m.categoryId)return valid.has(sid(m.categoryId));
 // Existing named listings remain browseable until the explicit admin import.
 return b.catalogueVersion!==1&&Boolean(categoryKey(m.category));
}
export async function storeCatalogue(b,publicOnly=false){
 const rows=await Menu.find({business:b._id,archived:{$ne:true},...(publicOnly?{available:true}:{})}).sort({category:1,name:1}).lean();
 if(businessKind(b)==='food')return {menu:rows};
 const all=await StoreCategory.find({hub:businessKind(b),archived:{$ne:true}}).sort({order:1,name:1}).lean();
 const assigned=new Set((b.categoryIds||[]).map(sid)),byId=new Map(all.filter(c=>assigned.has(sid(c))).map(c=>[sid(c),c])),valid=new Set(byId.keys());
 const menu=rows.map(m=>({...m,category:byId.get(sid(m.categoryId))?.name||m.category,needsCategory:!productHasCategory(m,b,valid)||!m.categoryId}));
 const visible=menu.filter(m=>productHasCategory(m,b,valid));
 const legacy=new Map();if(b.catalogueVersion!==1)for(const m of visible)if(!m.categoryId&&!legacy.has(categoryKey(m.category)))legacy.set(categoryKey(m.category),{_id:`legacy:${categoryKey(m.category)}`,name:text(m.category,60),icon:'grid',legacy:true});
 const categories=[...byId.values(),...legacy.values()];
 const published=new Map(visible.filter(m=>m.available).map(m=>[sid(m),m]));
 return {menu:publicOnly?visible:menu,categories,spotlight:(b.spotlightIds||[]).map(id=>published.get(sid(id))).filter(Boolean).slice(0,5),catalogueNeedsSetup:b.catalogueVersion!==1};
}
export async function listCategories(req,res){
 const hub=hubValue(req.query.hub),admin=req.user?.role==='admin'&&req.path.startsWith('/admin');
 const categories=await StoreCategory.find({hub,...(admin?{}:{archived:{$ne:true}})}).sort({order:1,name:1}).lean();
 res.set('Cache-Control','no-store').json({categories});
}
function fields(v){
 const name=text(v.name,60).replace(/\s+/g,' ');if(!name)fail('Enter a category name.');if(!icons.includes(v.icon||'grid'))fail('Choose a supported category icon.');
 return {name,key:categoryKey(name),icon:v.icon||'grid',image:image(v.image),order:integer(v.order??0,0,999)};
}
export async function createCategory(req,res){
 const hub=hubValue(req.body.hub);await StoreCategory.init();if(await StoreCategory.countDocuments({hub})>=300)fail('Use at most 300 categories per hub.');
 try{const category=await StoreCategory.create({hub,...fields(req.body)});res.status(201).json({category});}catch(e){if(e.code===11000)fail('This category already exists in the hub. Edit or restore the existing category.',409);throw e;}
}
export async function editCategory(req,res){
 const old=await StoreCategory.findById(req.params.id);if(!old)fail('Category not found.',404);
 const next=fields(req.body),archived=req.body.archived===true;
 if(archived&&await Menu.exists({categoryId:old._id,archived:{$ne:true}}))fail('Reassign or archive products in this category before archiving it.',409);
 try{const category=await StoreCategory.findOneAndUpdate({_id:old._id,revision:integer(req.body.revision,0,1e9)},{$set:{...next,archived},$inc:{revision:1}},{new:true,runValidators:true});if(!category)fail('Category changed. Refresh and retry.',409);res.json({category});}catch(e){if(e.code===11000)fail('A category with this name already exists in this hub.',409);throw e;}
}
const defaults={convenience:[['Groceries','basket2'],['Drinks','cup-straw'],['Household','house-heart'],['Personal Care','heart-pulse']],hardware:[['Tools','tools'],['Plumbing','wrench-adjustable'],['Electrical','plug'],['Building Materials','bricks'],['Paint','paint-bucket']]};
export async function seedCategories(req,res){
 const hub=hubValue(req.body.hub);await StoreCategory.init();for(const [index,[name,icon]] of defaults[hub].entries()){try{await StoreCategory.updateOne({hub,key:categoryKey(name)},{$setOnInsert:{name,icon,order:index,archived:false,revision:0}},{upsert:true});}catch(e){if(e.code!==11000)throw e;}}
 res.json({success:true});
}
export async function assignCategories(req,res){
 const b=await storeFor(req),ids=distinctIds(req.body.categories,100,'categories');
 if(await StoreCategory.countDocuments({_id:{$in:ids},hub:businessKind(b),archived:{$ne:true}})!==ids.length)fail('Choose active categories from this store’s hub.');
 if(await Menu.exists({business:b._id,archived:{$ne:true},categoryId:{$ne:null,$nin:ids}}))fail('Reassign or archive products before removing their store category.',409);
 const business=await Business.findOneAndUpdate({_id:b._id,revision:integer(req.body.revision,0,1e9)},{$set:{categoryIds:ids},$inc:{revision:1}},{new:true});
 if(!business)fail('Store changed. Refresh before saving categories.',409);res.json({business});
}
export async function saveSpotlight(req,res){
 const b=await storeFor(req),ids=distinctIds(req.body.products,5,'spotlight products');
 const valid=await publicCategoryIds(b),products=await Menu.find({_id:{$in:ids},business:b._id,available:true,archived:{$ne:true}}).lean();
 if(products.length!==ids.length||products.some(m=>!m.categoryId||!valid.has(sid(m.categoryId))))fail('Spotlight picks must be available products with active categories in this store.',409);
 const business=await Business.findOneAndUpdate({_id:b._id,revision:integer(req.body.revision,0,1e9)},{$set:{spotlightIds:ids},$inc:{revision:1}},{new:true});if(!business)fail('Store changed. Refresh before saving spotlight picks.',409);res.json({business});
}
export async function importCategories(req,res){
 const b=await storeFor(req),hub=businessKind(b),rows=await Menu.find({business:b._id,categoryId:null}).lean(),groups=new Map();
 let needsCategory=0;for(const m of rows){const key=categoryKey(m.category);if(!key){if(!m.archived)needsCategory++;continue;}if(!groups.has(key))groups.set(key,{name:text(m.category,60).replace(/\s+/g,' '),key,products:[]});groups.get(key).products.push(m);}
 const preview={categories:[...groups.values()].map(g=>({name:g.name,count:g.products.length})),needsCategory,legacyProducts:rows.length};
 if(req.body.apply!==true)return res.json({preview});
 if(b.revision!==integer(req.body.revision,0,1e9))fail('Store changed. Preview again and retry the import.',409);
 await StoreCategory.init();const assigned=new Set((b.categoryIds||[]).map(sid)),mapping=new Map(),conflicts=[];
 for(const g of groups.values()){
  let c;try{c=await StoreCategory.findOneAndUpdate({hub,key:g.key},{$setOnInsert:{name:g.name,icon:'grid',order:100,archived:false,revision:0}},{new:true,upsert:true});}catch(e){if(e.code!==11000)throw e;c=await StoreCategory.findOne({hub,key:g.key});}
  if(c.archived){conflicts.push(g.name);continue;}mapping.set(g.key,c);assigned.add(sid(c));
 }
 // Claim the store revision before touching products; repeat imports can resume safely.
 const updated=await Business.findOneAndUpdate({_id:b._id,revision:integer(req.body.revision,0,1e9)},{$set:{categoryIds:[...assigned],catalogueVersion:1},$inc:{revision:1}},{new:true});
 if(!updated)fail('Store changed. Preview again and retry the import.',409);
 let imported=0;for(const row of rows){const c=mapping.get(categoryKey(row.category));if(!c)continue;const result=await Menu.updateOne({_id:row._id,business:b._id,categoryId:null,...(row.revision==null?{$or:[{revision:0},{revision:{$exists:false}}]}:{revision:row.revision})},{$set:{categoryId:c._id,category:c.name},$inc:{revision:1}});imported+=result.modifiedCount;}
 res.json({business:updated,preview,imported,conflicts});
}
