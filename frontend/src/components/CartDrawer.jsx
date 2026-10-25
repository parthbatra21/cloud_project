import React, { useState } from "react";
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, MapPin, User, Phone, CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/api";

export default function CartDrawer({ isOpen, onClose, onOrderSuccess }) {
  const {
    cartItems,
    restaurant,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    taxes,
    grandTotal
  } = useCart();

  const [customerName, setCustomerName] = useState("Parth Sharma");
  const [customerAddress, setCustomerAddress] = useState("Flat 304, Palm Grove Heights, HSR Layout, Bengaluru");
  const [customerPhone, setCustomerPhone] = useState("+91 98765 43210");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!customerName.trim() || !customerAddress.trim() || !customerPhone.trim()) {
      setError("Please complete all delivery details.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const orderPayload = {
        customerName: customerName.trim(),
        customerAddress: customerAddress.trim(),
        customerPhone: customerPhone.trim(),
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        items: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const placedOrder = await createOrder(orderPayload);
      clearCart();
      onClose();
      onOrderSuccess(placedOrder);
    } catch (err) {
      setError(err.message || "Failed to place order. Ensure Order Service is running.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h3 style={{ fontSize: "18px" }}>Your Food Cart</h3>
            {restaurant && (
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                From: <strong>{restaurant.name}</strong>
              </p>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-content">
          {cartItems.length === 0 ? (
            <div className="state-box" style={{ margin: "40px 0" }}>
              <div className="state-icon">🛒</div>
              <h3>Your Cart is Empty</h3>
              <p>Add some delicious meals from your favorite restaurants!</p>
              <button
                className="nav-btn"
                style={{ margin: "0 auto", background: "var(--primary)", color: "white", borderColor: "var(--primary)" }}
                onClick={onClose}
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <div>
              {/* Item List */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-light)" }}>
                    Selected Items ({cartItems.length})
                  </span>
                  <button
                    onClick={clearCart}
                    style={{ fontSize: "12px", color: "var(--danger)", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Trash2 size={12} /> Clear Cart
                  </button>
                </div>

                {cartItems.map((item) => (
                  <div key={item.menuItemId} className="cart-item-card">
                    <div style={{ flexGrow: 1, paddingRight: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {item.isVeg ? (
                          <div className="veg-icon" style={{ width: "12px", height: "12px" }}>
                            <span className="dot" style={{ width: "6px", height: "6px" }}></span>
                          </div>
                        ) : (
                          <div className="non-veg-icon" style={{ width: "12px", height: "12px" }}>
                            <span className="triangle" style={{ borderLeftWidth: "3px", borderRightWidth: "3px", borderBottomWidth: "5px" }}></span>
                          </div>
                        )}
                        <h5 style={{ fontSize: "14px", fontWeight: "600" }}>{item.name}</h5>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                        ₹{item.price} × {item.quantity} = <strong>₹{item.price * item.quantity}</strong>
                      </p>
                    </div>

                    <div className="qty-control" style={{ marginTop: 0 }}>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-number">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Details Form */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "20px", border: "1px solid var(--border)" }}>
                <h4 style={{ fontSize: "14px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={16} color="var(--primary)" /> Delivery Details
                </h4>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Complete Delivery Address</label>
                  <textarea
                    rows="2"
                    className="form-input"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Bill Details */}
              <div className="cart-summary">
                <h4 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-light)", marginBottom: "10px" }}>
                  Bill Details
                </h4>
                <div className="summary-row">
                  <span>Item Total</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Partner Fee</span>
                  <span>{deliveryFee === 0 ? <strong style={{ color: "var(--success)" }}>FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="summary-row">
                  <span>Government Taxes (5% GST)</span>
                  <span>₹{taxes}</span>
                </div>
                <div className="summary-row total">
                  <span>To Pay (Simulated)</span>
                  <span style={{ color: "var(--primary)" }}>₹{grandTotal}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", marginTop: "12px" }}>
                <ShieldCheck size={16} color="var(--success)" />
                <span>Backend securely validates prices against restaurant catalog.</span>
              </div>

              {error && (
                <div style={{ background: "var(--danger-bg)", color: "var(--danger)", padding: "10px", borderRadius: "var(--radius-sm)", fontSize: "13px", marginTop: "12px" }}>
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={submitting}
            >
              {submitting ? (
                <span>Validating & Placing Order...</span>
              ) : (
                <>
                  <span>Place Order • ₹{grandTotal}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
