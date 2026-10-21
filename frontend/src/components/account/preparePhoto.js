// Resize locally before upload, keeping the request within the existing 1 MB
// backend body limit. No third-party service receives the original photograph.
export async function preparePhoto(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('Choose a PNG, JPEG or WebP photo smaller than 10 MB.');
 const url=URL.createObjectURL(file);
 try{
  const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('This photo could not be read. Try another image.'));img.src=url;});
  const scale=Math.min(1,512/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
  const context=canvas.getContext('2d');if(!context)throw Error('Your browser could not prepare this photo. Try another browser.');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
  for(const quality of [.85,.7,.5]){const data=canvas.toDataURL('image/jpeg',quality);if(data.split(',')[1].length*3/4<=450*1024)return data;}
  throw Error('This photo is still too large. Try a smaller image.');
 }finally{URL.revokeObjectURL(url);}
}
