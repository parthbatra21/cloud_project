import React, { useState } from "react";
import { Star, Clock, IndianRupee } from "lucide-react";

const fallbackImages = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80"
];

export default function RestaurantCard({ restaurant, onClick }) {
  const [imgSrc, setImgSrc] = useState(restaurant.image);

  const handleImageError = () => {
    setImgSrc(fallbackImages[0]);
  };

  return (
    <div className="restaurant-card" onClick={() => onClick(restaurant)}>
      <div className="card-image-wrap">
        <img
          src={imgSrc}
          alt={restaurant.name}
          className="card-image"
          onError={handleImageError}
          loading="lazy"
        />
        {restaurant.isVegetarian && (
          <span className="card-badge-veg">Pure Veg</span>
        )}
        <div className="card-rating-badge">
          <Star size={13} fill="#facc15" color="#facc15" />
          <span>{restaurant.rating}</span>
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-name">{restaurant.name}</h3>
        <p className="card-cuisine">{restaurant.cuisine}</p>
        <p style={{ fontSize: "12px", color: "var(--text-light)", marginBottom: "12px" }}>
          {restaurant.tagline}
        </p>

        <div className="card-meta">
          <div className="meta-item">
            <Clock size={14} color="var(--primary)" />
            <span>{restaurant.deliveryTimeMinutes} mins</span>
          </div>
          <div className="meta-item">
            <span>₹{restaurant.priceForTwo} for two</span>
          </div>
        </div>
      </div>
    </div>
  );
}
