import React, { useState, useEffect } from "react";
import { Clock, RefreshCw, Truck, CheckCircle2, ChevronRight, Package, AlertCircle } from "lucide-react";
import { fetchOrders, updateOrderStatus, updateDeliveryStatus, fetchDeliveryStatus } from "../services/api";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || "Failed to load orders from Order Service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSimulateStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(orderId);
      // If setting to OUT_FOR_DELIVERY or DELIVERED, route through Delivery Service to demonstrate microservice RPC
      if (newStatus === "OUT_FOR_DELIVERY") {
        await updateDeliveryStatus(orderId, "ON_THE_WAY");
      } else if (newStatus === "DELIVERED") {
        await updateDeliveryStatus(orderId, "DELIVERED");
      } else {
        await updateOrderStatus(orderId, newStatus);
      }
      // Reload orders to show updated state from database
      await loadOrders();
    } catch (err) {
      alert(`Simulation action failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ paddingBottom: "60px" }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">My Orders & Microservice Tracking</h2>
          <p className="section-subtitle">
            Records stored in Order Service database with Delivery Service integration
          </p>
        </div>
        <button
          className="nav-btn"
          onClick={loadOrders}
          disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Demo helper banner */}
      <div className="demo-banner">
        <div>
          <p className="demo-title">🎓 Faculty Presentation Tip</p>
          <p className="demo-subtitle">
            Use the simulation buttons below each order to show how Order Service and Delivery Service communicate through REST APIs in real time.
          </p>
        </div>
      </div>

      {loading && (
        <div className="state-box">
          <div className="state-icon">⏳</div>
          <h3>Loading Order History...</h3>
          <p>Querying Order Service database (SQLite / PostgreSQL)...</p>
        </div>
      )}

      {error && (
        <div className="state-box" style={{ borderColor: "var(--danger)" }}>
          <div className="state-icon">⚠️</div>
          <h3 style={{ color: "var(--danger)" }}>Error Fetching Orders</h3>
          <p>{error}</p>
          <button
            className="nav-btn"
            onClick={loadOrders}
            style={{ margin: "0 auto", background: "var(--primary)", color: "white" }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="state-box">
          <div className="state-icon">📦</div>
          <h3>No Orders Placed Yet</h3>
          <p>Browse our restaurant menu and place your first food delivery order!</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div>
          {orders.map((order) => {
            const isDelivered = order.status === "DELIVERED";
            const isCancelled = order.status === "CANCELLED";

            return (
              <div key={order.id} className="orders-card">
                <div className="order-top">
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-light)", textTransform: "uppercase", fontWeight: "700" }}>
                      Order ID:
                    </span>
                    <h3 style={{ fontSize: "18px", color: "var(--primary)" }}>{order.id}</h3>
                    <p style={{ fontSize: "14px", fontWeight: "600", marginTop: "2px" }}>
                      {order.restaurantName}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span className={`status-badge status-${order.status}`}>
                      <span className="dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }}></span>
                      {order.status.replace(/_/g, " ")}
                    </span>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })},{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Ordered Items summary */}
                <div style={{ margin: "14px 0", background: "#f8fafc", padding: "12px 16px", borderRadius: "var(--radius-sm)" }}>
                  <p style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-light)", marginBottom: "8px" }}>
                    Order Items
                  </p>
                  {order.items && order.items.map((it) => (
                    <div
                      key={it.id || it.menuItemId}
                      style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "3px 0" }}
                    >
                      <span>
                        <strong>{it.quantity}x</strong> {it.name}
                      </span>
                      <span>₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Paid:</span>
                    <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--secondary)", marginLeft: "6px" }}>
                      ₹{order.totalAmount}
                    </span>
                    {order.deliveryPartner && (
                      <span style={{ fontSize: "12px", color: "var(--success)", marginLeft: "16px" }}>
                        🚚 Partner: <strong>{order.deliveryPartner}</strong>
                      </span>
                    )}
                  </div>

                  {/* Microservice Demo Controls */}
                  {!isDelivered && !isCancelled && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-light)", textTransform: "uppercase" }}>
                        Simulate Stage:
                      </span>
                      {order.status === "PLACED" && (
                        <button
                          className="demo-btn"
                          disabled={actionLoading === order.id}
                          onClick={() => handleSimulateStatus(order.id, "PREPARING")}
                        >
                          → Preparing
                        </button>
                      )}
                      {(order.status === "PLACED" || order.status === "PREPARING") && (
                        <button
                          className="demo-btn"
                          style={{ background: "#ea580c" }}
                          disabled={actionLoading === order.id}
                          onClick={() => handleSimulateStatus(order.id, "OUT_FOR_DELIVERY")}
                        >
                          → Out For Delivery
                        </button>
                      )}
                      {order.status === "OUT_FOR_DELIVERY" && (
                        <button
                          className="demo-btn"
                          style={{ background: "#16a34a" }}
                          disabled={actionLoading === order.id}
                          onClick={() => handleSimulateStatus(order.id, "DELIVERED")}
                        >
                          ✓ Mark Delivered
                        </button>
                      )}
                    </div>
                  )}

                  {isDelivered && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: "700", color: "var(--success)" }}>
                      <CheckCircle2 size={16} /> Order Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
