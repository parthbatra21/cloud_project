import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import RestaurantCard from "./components/RestaurantCard";
import MenuModal from "./components/MenuModal";
import CartDrawer from "./components/CartDrawer";
import OrderStatusModal from "./components/OrderStatusModal";
import OrderHistory from "./components/OrderHistory";
import { fetchRestaurants } from "./services/api";
import { Search, Sparkles, Layers, ShieldCheck, ArrowRight } from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState("home"); // 'home' | 'orders'
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRestaurants();
        setRestaurants(data);
      } catch (err) {
        setError(err.message || "Failed to load restaurant catalog.");
      } finally {
        setLoading(false);
      }
    }
    loadRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="container" style={{ flexGrow: 1 }}>
        {activeView === "home" && (
          <>
            {/* Hero Banner */}
            <section className="hero-banner">
              <div className="hero-content">
                <span className="hero-tag">
                  <Sparkles size={14} /> Microservices Architecture & DevOps
                </span>
                <h1 className="hero-title">
                  Fresh Food Delivered Fast. Built with Real Microservices.
                </h1>
                <p className="hero-subtitle">
                  An academic DevOps showcase featuring 3 independent Node.js REST services, Docker containerization, SQLite/PostgreSQL persistence, and GitHub Actions CI/CD.
                </p>

                <div className="microservices-pills">
                  <div className="service-pill">
                    <span className="pill-dot"></span>
                    <span>Restaurant Service :5001</span>
                  </div>
                  <div className="service-pill">
                    <span className="pill-dot"></span>
                    <span>Order Service :5002</span>
                  </div>
                  <div className="service-pill">
                    <span className="pill-dot"></span>
                    <span>Delivery Service :5003</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Search & Header */}
            <div className="section-header" style={{ flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h2 className="section-title">Explore Restaurants</h2>
                <p className="section-subtitle">
                  Browse top-rated dining partners and authentic cuisines
                </p>
              </div>

              {/* Search bar */}
              <div style={{ position: "relative", minWidth: "280px" }}>
                <Search
                  size={16}
                  style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-light)" }}
                />
                <input
                  type="text"
                  placeholder="Search by restaurant or cuisine..."
                  className="form-input"
                  style={{ paddingLeft: "38px", borderRadius: "var(--radius-full)" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="state-box">
                <div className="state-icon">⏳</div>
                <h3>Connecting to Restaurant Microservice...</h3>
                <p>Loading seed restaurant records on port 5001...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="state-box" style={{ borderColor: "var(--danger)" }}>
                <div className="state-icon">⚠️</div>
                <h3 style={{ color: "var(--danger)" }}>Could Not Connect to Restaurant Service</h3>
                <p>{error}</p>
                <p style={{ fontSize: "12px", color: "var(--text-light)" }}>
                  Make sure Restaurant Service is running on http://localhost:5001.
                </p>
              </div>
            )}

            {/* Empty Search State */}
            {!loading && !error && filteredRestaurants.length === 0 && (
              <div className="state-box">
                <div className="state-icon">🔍</div>
                <h3>No Matching Restaurants</h3>
                <p>Try searching for "Biryani", "Pizza", "South Indian", or "Noodles".</p>
              </div>
            )}

            {/* Restaurant Cards Grid */}
            {!loading && !error && filteredRestaurants.length > 0 && (
              <div className="restaurant-grid">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onClick={(r) => setSelectedRestaurant(r)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeView === "orders" && <OrderHistory />}
      </main>

      {/* Menu Modal */}
      {selectedRestaurant && (
        <MenuModal
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={(order) => {
          setConfirmedOrder(order);
        }}
      />

      {/* Order Confirmation Modal */}
      {confirmedOrder && (
        <OrderStatusModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onViewOrders={() => {
            setActiveView("orders");
          }}
        />
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div>
            <h4 style={{ color: "white", fontSize: "16px", marginBottom: "4px" }}>
              QuickBite • Microservices Food Delivery Platform
            </h4>
            <p style={{ fontSize: "13px" }}>
              Demonstrating DevOps, Docker containerization, REST API communication, and CI/CD pipelines.
            </p>
          </div>
          <div style={{ display: "flex", gap: "20px", fontSize: "13px" }}>
            <span>Architecture: 3 Microservices</span>
            <span>Database: SQLite + Prisma ORM</span>
            <span>CI/CD: GitHub Actions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
