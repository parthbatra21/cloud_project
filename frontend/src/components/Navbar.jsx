import React from "react";
import { ShoppingBag, Utensils, Clock, CheckCircle } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Navbar({ activeView, setActiveView, onOpenCart }) {
  const { itemCount } = useCart();

  return (
    <header className="navbar">
      <div className="container nav-container">
        <div className="brand" onClick={() => setActiveView("home")}>
          <div className="brand-icon">
            <Utensils size={24} />
          </div>
          <div className="brand-text">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1>QuickBite</h1>
              <span className="brand-badge">Microservices</span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              DevOps Food Delivery System
            </p>
          </div>
        </div>

        <div className="nav-actions">
          <button
            className={`nav-btn ${activeView === "home" ? "active" : ""}`}
            onClick={() => setActiveView("home")}
          >
            <Utensils size={16} />
            <span>Restaurants</span>
          </button>

          <button
            className={`nav-btn ${activeView === "orders" ? "active" : ""}`}
            onClick={() => setActiveView("orders")}
          >
            <Clock size={16} />
            <span>My Orders</span>
          </button>

          <button className="nav-btn cart-btn" onClick={onOpenCart}>
            <ShoppingBag size={18} />
            <span>Cart</span>
            {itemCount > 0 && <span className="cart-counter">{itemCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
