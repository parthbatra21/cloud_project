import React, { useState, useEffect } from "react";
import { X, Star, Clock, MapPin, Plus, Minus, AlertCircle } from "lucide-react";
import { fetchRestaurantMenu } from "../services/api";
import { useCart } from "../context/CartContext";

export default function MenuModal({ restaurant, onClose }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);

  const { cartItems, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRestaurantMenu(restaurant.id);
        setMenuItems(data);
      } catch (err) {
        setError(err.message || "Failed to load restaurant menu.");
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, [restaurant.id]);

  const categories = ["All", ...new Set(menuItems.map((item) => item.category))];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesVeg = !vegOnly || item.isVeg;
    return matchesCategory && matchesVeg;
  });

  const getItemQuantity = (id) => {
    const found = cartItems.find((i) => i.menuItemId === id);
    return found ? found.quantity : 0;
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="menu-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <h2>{restaurant.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
                <MapPin size={12} color="var(--primary)" /> {restaurant.address}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "700" }}>
                <Star size={12} fill="#facc15" color="#facc15" /> {restaurant.rating}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
                <Clock size={12} /> {restaurant.deliveryTimeMinutes} mins
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-content-scroll">
          {/* Filters */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <div className="filter-tabs" style={{ marginBottom: 0, borderBottom: "none" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-tab ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                style={{ accentColor: "#16a34a" }}
              />
              <span>Veg Only 🌱</span>
            </label>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="state-box">
              <div className="state-icon">⏳</div>
              <h3>Fetching Fresh Menu...</h3>
              <p>Contacting Restaurant Service API...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="state-box" style={{ borderColor: "var(--danger)" }}>
              <div className="state-icon">⚠️</div>
              <h3 style={{ color: "var(--danger)" }}>Unable to Load Menu</h3>
              <p>{error}</p>
            </div>
          )}

          {/* Empty Menu State */}
          {!loading && !error && filteredItems.length === 0 && (
            <div className="state-box">
              <div className="state-icon">🍽️</div>
              <h3>No Items Match Your Filter</h3>
              <p>Try switching categories or clearing the Veg Only filter.</p>
            </div>
          )}

          {/* Menu Items List */}
          {!loading && !error && filteredItems.length > 0 && (
            <div>
              {filteredItems.map((item) => {
                const qty = getItemQuantity(item.id);
                return (
                  <div key={item.id} className="menu-item-row">
                    <div className="item-info">
                      <div className="item-badges">
                        {item.isVeg ? (
                          <div className="veg-icon" title="Vegetarian">
                            <span className="dot"></span>
                          </div>
                        ) : (
                          <div className="non-veg-icon" title="Non-Vegetarian">
                            <span className="triangle"></span>
                          </div>
                        )}
                        <span className="item-category-tag">{item.category}</span>
                      </div>

                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-price">₹{item.price}</p>
                      <p className="item-desc">{item.description}</p>
                    </div>

                    <div className="item-action-area">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="item-thumb"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80";
                        }}
                      />
                      <div>
                        {qty === 0 ? (
                          <button
                            className="add-btn"
                            onClick={() => addToCart(item, restaurant)}
                          >
                            ADD +
                          </button>
                        ) : (
                          <div className="qty-control">
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(item.id, qty - 1)}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="qty-number">{qty}</span>
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(item.id, qty + 1)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
