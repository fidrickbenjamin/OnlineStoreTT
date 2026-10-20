import React, { useEffect, useState } from "react";
import { useUploadPaymentProofMutation, useReviewPaymentProofMutation } from "../../redux/api/OrderApi";
import toast from "react-hot-toast";
import { StatusBadge } from "../shared/OrderUI";
async function compressReceipt(file) {
 if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>10*1024*1024)throw Error("Choose a JPEG, PNG or WebP image under 10 MB.");
 const objectUrl=URL.createObjectURL(file);
 try {
  const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error("Image could not be read."));img.src=objectUrl;});
  const scale=Math.min(1,1400/Math.max(image.width,image.height));const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const context=canvas.getContext("2d");context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
  let result;for(const quality of [.85,.7,.55,.4]){result=canvas.toDataURL("image/jpeg",quality);if((result.split(",")[1].length*3/4)<=450*1024)return result;}throw Error("Image remains too large. Crop the receipt and try again.");
 }finally{URL.revokeObjectURL(objectUrl);}
}
export default function PaymentProof({order,admin=false}) {
 const [image,setImage]=useState(""),[reference,setReference]=useState(""),[reason,setReason]=useState(""),[preview,setPreview]=useState(""),[busy,setBusy]=useState(false);
 const [upload,{isLoading}]=useUploadPaymentProofMutation(),[review,{isLoading:reviewing}]=useReviewPaymentProofMutation();
 useEffect(()=>{setPreview("");},[order.paymentProof?.proofId]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 if(order.paymentMethod!=="NBD")return null;
 const proof=order.paymentProof;
 const decide=async decision=>{try{await review({id:order._id,proofId:proof.proofId,decision,reason}).unwrap();toast.success(`Receipt ${decision.toLowerCase()}.`);setReason("");}catch(error){toast.error(error?.data?.message||"Could not review receipt.");}};
 return <section className="tt-box"><h2>Mobanking receipt</h2>{!proof?.uploadedAt&&<p className="text-muted">No receipt has been submitted yet.</p>}{proof?.uploadedAt&&<><p>Submitted {new Date(proof.uploadedAt).toLocaleString()} · <StatusBadge value={proof.reviewStatus}/></p><p>Reference: {proof.reference||"Not provided"}</p>{proof.reviewReason&&<p className="tt-notice">Review note: {proof.reviewReason}</p>}<button className="btn btn-outline-success mb-3" disabled={busy} onClick={async()=>{setBusy(true);try{const response=await fetch(`/api/v2/orders/${order._id}/payment-proof`,{credentials:"include"});if(!response.ok)throw Error("Receipt could not be loaded.");setPreview(URL.createObjectURL(await response.blob()));}catch(error){toast.error(error.message);}finally{setBusy(false);}}}>View uploaded receipt</button>{preview&&<div><img src={preview} className="tt-receipt" alt="Bank transfer receipt"/></div>}</>}
 {!admin&&!['Paid','Refunded'].includes(order.paymentInfo?.status)&&order.orderStatus!=="Cancelled"&&<form onSubmit={async event=>{event.preventDefault();try{await upload({id:order._id,image,reference}).unwrap();setImage("");toast.success("Receipt submitted for store review.");}catch(error){toast.error(error?.data?.message||"Could not submit receipt.");}}}><div className="tt-notice"><strong>National Bank of Dominica</strong><br/>Account name: Fidrick Benjamin<br/>Account number: 600400420<br/>Mobile ID: 7672858487</div><p>Use these existing checkout bank details, then upload your receipt. Uploading a receipt does not confirm payment.</p><label className="d-block mb-3">Receipt image<input type="file" accept="image/jpeg,image/png,image/webp" className="form-control mt-1" disabled={busy||isLoading} onChange={async event=>{const file=event.target.files?.[0];if(!file)return;setBusy(true);setImage("");try{setImage(await compressReceipt(file));}catch(error){toast.error(error.message);}finally{setBusy(false);}}}/></label>{image&&<img src={image} alt="Receipt selected for upload" className="tt-receipt mb-3"/>}<label className="d-block mb-3">Transfer reference (optional)<input value={reference} maxLength={120} onChange={event=>setReference(event.target.value)} className="form-control"/></label><button className="btn btn-success" disabled={!image||busy||isLoading}>{isLoading?"Submitting…":"Submit receipt"}</button></form>}
 {admin&&proof?.reviewStatus==="Pending"&&order.paymentInfo?.status!=="Paid"&&<><label className="d-block my-3">Review reason (required for rejection)<textarea className="form-control" maxLength={500} value={reason} onChange={event=>setReason(event.target.value)}/></label><div className="tt-actions"><button className="btn btn-success" disabled={reviewing} onClick={()=>decide("Approved")}>Approve payment</button><button className="btn btn-outline-danger" disabled={reviewing||!reason.trim()} onClick={()=>decide("Rejected")}>Reject receipt</button></div><p className="text-muted mt-2">Check the transfer in your bank account before approving.</p></>}
 </section>;
}
