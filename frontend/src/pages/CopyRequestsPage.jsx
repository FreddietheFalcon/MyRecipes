import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../lib/axios";
import toast from "react-hot-toast";

const CopyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/share-requests/incoming");
      setRequests(res.data);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id, recipeName, requesterEmail) => {
    setProcessingId(id);
    try {
      await api.put(`/share-requests/${id}/approve`);
      toast.success(`"${recipeName}" shared with ${requesterEmail}!`);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error("Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (id) => {
    setProcessingId(id);
    try {
      await api.put(`/share-requests/${id}/deny`);
      toast.success("Request declined");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error("Failed to deny request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="shell">
      <Sidebar />
      <main className="main-card">

        <h1 className="page-title" style={{ marginBottom: 8 }}>📋 Copy Requests</h1>
        <p style={{ fontSize: 13, color: "var(--gray)", fontWeight: 600, marginBottom: 28 }}>
          Friends who want a copy of your recipes. Approve to share or decline to keep it private.
        </p>

        {loading ? (
          <div style={{ textAlign: "center", color: "var(--gray)", padding: "48px 0" }}>Loading...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--gray)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontWeight: 700, fontSize: 16 }}>No pending requests</p>
            <p style={{ fontSize: 13 }}>When friends request a copy of your recipe, it will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {requests.map((r) => {
              const isProcessing = processingId === r._id;
              return (
                <div key={r._id} style={{
                  border: "1.5px solid var(--gray-mid)",
                  borderLeft: "4px solid #7ed321",
                  borderRadius: 16, padding: "18px 22px",
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", gap: 16,
                  flexWrap: "wrap", background: "var(--white)",
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
                      {r.recipeName}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gray)", fontWeight: 600 }}>
                      📥 Requested by <strong>{r.requester?.email}</strong>
                      {" · "}{new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => handleApprove(r._id, r.recipeName, r.requester?.email)}
                      disabled={isProcessing}
                      style={{
                        background: "#7ed321", color: "#fff",
                        border: "none", borderRadius: 50,
                        padding: "9px 20px", fontSize: 13, fontWeight: 800,
                        fontFamily: "'Nunito', sans-serif",
                        cursor: isProcessing ? "not-allowed" : "pointer",
                        opacity: isProcessing ? 0.7 : 1,
                        boxShadow: "0 3px 10px rgba(126,211,33,.3)",
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleDeny(r._id)}
                      disabled={isProcessing}
                      style={{
                        background: "transparent", color: "var(--red)",
                        border: "1.5px solid #ffdcdd", borderRadius: 50,
                        padding: "7px 16px", fontSize: 13, fontWeight: 800,
                        fontFamily: "'Nunito', sans-serif",
                        cursor: isProcessing ? "not-allowed" : "pointer",
                        opacity: isProcessing ? 0.7 : 1,
                      }}
                    >
                      ✕ Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CopyRequestsPage;
