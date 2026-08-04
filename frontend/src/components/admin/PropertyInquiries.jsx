import React from "react";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import { useGetPropertyInquiriesQuery, useUpdatePropertyInquiryStatusMutation } from "../../redux/api/productsApi";

const PropertyInquiries = () => {
  const { data, isLoading, isError, error } = useGetPropertyInquiriesQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdatePropertyInquiryStatusMutation();

  const handleStatusChange = async (inquiryId, status) => {
    try {
      await updateStatus({ id: inquiryId, body: { status } }).unwrap();
      toast.success("Inquiry status updated");
    } catch (err) {
      toast.error(err?.data?.message || "Unable to update inquiry status");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title="Property Inquiries" />
      <div className="mb-4">
        <h3 className="fw-bold">Property Inquiries</h3>
        <p className="text-muted mb-0">Track viewing requests and contact details for property listings.</p>
      </div>

      {isError ? (
        <div className="alert alert-danger">{error?.data?.message || "Unable to load property inquiries."}</div>
      ) : !data?.inquiries?.length ? (
        <div className="alert alert-secondary">No property inquiries have been submitted yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Property</th>
                <th>Contact</th>
                <th>Viewing Date</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.inquiries.map((inquiry) => (
                <tr key={inquiry._id}>
                  <td>
                    <div className="fw-semibold">{inquiry?.product?.name || "Property"}</div>
                    <div className="small text-muted">{new Date(inquiry.createdAt).toLocaleString()}</div>
                  </td>
                  <td>
                    <div>{inquiry.name}</div>
                    <div className="small text-muted">{inquiry.phone}</div>
                    <div className="small text-muted">{inquiry.email}</div>
                  </td>
                  <td>{inquiry.preferredViewingDate}</td>
                  <td>{inquiry.message}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={inquiry.status}
                      onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                      disabled={isUpdating}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default PropertyInquiries;
