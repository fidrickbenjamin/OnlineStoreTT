// Per-instance burst protection. Configure provider-side API quotas as well.
const windows=new Map();
export const limit=(bucket,max,ms)=>(req,res,next)=>{const now=Date.now(),key=`${bucket}:${req.user?._id||req.ip}`;if(windows.size>5000)for(const [key,row]of windows)if(row.until<now)windows.delete(key);let row=windows.get(key);if(!row||row.until<now){row={count:0,until:now+ms};windows.set(key,row);}row.count++;if(row.count>max)return res.status(429).json({message:'Too many attempts. Please wait a moment before retrying.'});next();};
