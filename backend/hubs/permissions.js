import ErrorHandler from '../utils/errorHandler.js';
export const SCOPES=['operations','catalogue','finance','settings'];
export const fullAdmin=user=>user?.role==='admin'&&!Array.isArray(user.adminAccess);
export const can=(user,scope)=>fullAdmin(user)||(user?.role==='admin'&&user.adminAccess?.includes(scope));
export const requireScope=(...scopes)=>(req,res,next)=>scopes.some(scope=>can(req.user,scope))?next():next(new ErrorHandler('Your staff account does not have permission for this action.',403));
export const requireFullAdmin=(req,res,next)=>fullAdmin(req.user)?next():next(new ErrorHandler('A full administrator account is required.',403));
export function routeScope(req,res,next){
 if(fullAdmin(req.user))return next();const p=req.path,m=req.method;
 if(/^\/(mail|staff|audit)/.test(p))return requireFullAdmin(req,res,next);
 if(/^\/(commercial|subscriptions|business-accounts|restaurant-accounts|reconciliation|payouts)/.test(p))return requireScope('finance')(req,res,next);
 if(p==='/summary'||p==='/jobs')return requireScope('operations','finance')(req,res,next);
 if(p==='/services'&&m==='GET')return requireScope('catalogue','operations')(req,res,next);
 if((p.startsWith('/marketplace-delivery')||p.startsWith('/customer-info')))return requireScope('settings')(req,res,next);
 if(p.startsWith('/services')||p.startsWith('/service-categories'))return requireScope('catalogue')(req,res,next);
 if(p.startsWith('/service-inquiries'))return requireScope('operations')(req,res,next);
 if(p.startsWith('/catalogue-issues')||p.startsWith('/store-categories')||p.startsWith('/businesses')||p.startsWith('/catalogue-image'))return requireScope('catalogue')(req,res,next);
 if(/^\/(settings|community-rates|hub-settings)/.test(p))return requireScope('settings')(req,res,next);
 if(p.startsWith('/applications'))return requireScope('operations')(req,res,next);
 if(p.startsWith('/jobs/'))return requireScope(['payment','rejectReceipt','cashReconciled','refunded'].includes(req.body?.action)?'finance':'operations')(req,res,next);
 if(p==='/')return SCOPES.some(scope=>can(req.user,scope))?next():requireFullAdmin(req,res,next);
 return requireFullAdmin(req,res,next);
}
