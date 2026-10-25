import React from "react";
import { CheckCircle2, Truck, Package, Clock, X, Phone, User } from "lucide-react";

export default function OrderStatusModal({ order, onClose, onViewOrders }) {
  if (!order) return null;

  const steps = [
    { key: "PLACED", label: "Order Placed" },
    { key: "PREPARING", label: "Preparing Food" },
    { key: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
    { key: "DELIVERED", label: "Delivered" }
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="menu-modal" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: "#ecfdf5", borderBottomColor: "#a7f3d0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle2 size={28} color="#059669" />
            <div>
              <h2 style={{ fontSize: "18px", color: "#065f46" }}>Order Confirmed!</h2>
              <p style={{ fontSize: "12px", color: "#047857" }}>Sent to Order & Delivery Services</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-content-scroll" style={{ padding: "24px" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: "700", color: "var(--text-light)" }}>
              Order Reference ID
            </span>
            <h3 style={{ fontSize: "28px", color: "var(--primary)", margin: "4px 0" }}>
              {order.id}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Restaurant: <strong>{order.restaurantName}</strong>
            </p>
          </div>

          {/* Stepper */}
          <div style={{ margin: "24px 0", background: "#f8fafc", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-light)", marginBottom: "14px" }}>
              Live Order Status
            </h4>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              {steps.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div
                    key={step.key}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      flex: 1
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: isPassed ? "var(--primary)" : "#e2e8f0",
                        color: isPassed ? "white" : "var(--text-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "700",
                        marginBottom: "6px",
                        boxShadow: isCurrent ? "0 0 0 4px var(--primary-light)" : "none"
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: isCurrent ? "700" : "500",
                        color: isPassed ? "var(--secondary)" : "var(--text-light)"
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Partner Details */}
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Truck size={18} color="#16a34a" />
              <h5 style={{ fontSize: "14px", color: "#166534", fontWeight: "700" }}>
                Delivery Partner Assigned
              </h5>
            </div>
            <p style={{ fontSize: "13px", color: "#15803d" }}>
              Partner: <strong>{order.deliveryPartner || "Vikram Rao (Assigned via Delivery Microservice)"}</strong>
            </p>
            <p style={{ fontSize: "12px", color: "#166534", marginTop: "2px" }}>
              Estimated Arrival: ~25-30 mins
            </p>
          </div>

          {/* Items Summary */}
          <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
              <span>Items Total:</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "700" }}>
              <span>Amount Paid:</span>
              <span style={{ color: "var(--primary)" }}>₹{order.totalAmount} (Simulated)</span>
            </div>
          </div>

          <div style={{ marginTop: "24px", display: "flex", gap: "10px" }}>
            <button
              className="nav-btn"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="nav-btn"
              style={{ flex: 1, justifyContent: "center", background: "var(--primary)", color: "white", borderColor: "var(--primary)" }}
              onClick={() => {
                onClose();
                onViewOrders();
              }}
            >
              Track in Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
