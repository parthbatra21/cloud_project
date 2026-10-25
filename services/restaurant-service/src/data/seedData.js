// Sample realistic seed data for restaurants and menus
const restaurants = [
  {
    id: "rest-1",
    name: "Biryani Blues & Royal Kitchen",
    cuisine: "Hyderabadi, North Indian, Mughlai",
    rating: 4.5,
    deliveryTimeMinutes: 30,
    priceForTwo: 500,
    address: "Banjara Hills, Road No. 12, Hyderabad",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    isVegetarian: false,
    tagline: "Authentic Dum Biryanis & Kebabs"
  },
  {
    id: "rest-2",
    name: "Spice Garden Pure Veg",
    cuisine: "South Indian, Thali, Snacks",
    rating: 4.3,
    deliveryTimeMinutes: 25,
    priceForTwo: 350,
    address: "Indiranagar 100 Feet Rd, Bengaluru",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80",
    isVegetarian: true,
    tagline: "Pure Vegetarian Delights & Filter Coffee"
  },
  {
    id: "rest-3",
    name: "Crust & Craft Pizzeria",
    cuisine: "Italian, Wood-fired Pizza, Pasta",
    rating: 4.6,
    deliveryTimeMinutes: 35,
    priceForTwo: 650,
    address: "Bandra West, Hill Road, Mumbai",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
    isVegetarian: false,
    tagline: "Artisan Sourdough Pizzas & Gelato"
  },
  {
    id: "rest-4",
    name: "Dragon Wok Pan-Asian",
    cuisine: "Chinese, Thai, Dim Sum",
    rating: 4.4,
    deliveryTimeMinutes: 28,
    priceForTwo: 550,
    address: "Connaught Place, Block C, New Delhi",
    image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80",
    isVegetarian: false,
    tagline: "Sizzling Woks, Noodles & Dumplings"
  }
];

const menus = {
  "rest-1": [
    {
      id: "item-101",
      name: "Hyderabadi Chicken Dum Biryani",
      description: "Slow-cooked fragrant basmati rice with succulent chicken marinated in special spices.",
      price: 299,
      category: "Biryani",
      isVeg: false,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "item-102",
      name: "Paneer Tikka Biryani",
      description: "Char-grilled spiced paneer cubes layered with saffron basmati rice and caramelized onions.",
      price: 249,
      category: "Biryani",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "item-103",
      name: "Murgh Malai Tikka (6 pcs)",
      description: "Boneless chicken marinated in cream, cheese, and mild spices roasted in a clay tandoor.",
      price: 280,
      category: "Starters",
      isVeg: false,
      image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "item-104",
      name: "Mirchi Ka Salan & Raita Combo",
      description: "Traditional spicy pepper and peanut gravy paired with creamy vegetable raita.",
      price: 70,
      category: "Sides",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "item-105",
      name: "Shahi Gulab Jamun (2 pcs)",
      description: "Warm golden dumplings soaked in rose-flavored cardamom sugar syrup.",
      price: 90,
      category: "Dessert",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80"
    }
  ],
  "rest-2": [
    {
      id: "item-201",
      name: "Special Masala Dosa",
      description: "Crispy golden crepe filled with spiced potato mash, served with coconut chutney & sambar.",
      price: 130,
      category: "Breakfast & Mains",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "item-202",
      name: "Steamed Idli Vada Platter",
      description: "Two fluffy rice cakes and one crispy medu vada with fresh gun powder and ghee.",
      price: 110,
      category: "Breakfast & Mains",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "item-203",
      name: "South Indian Royal Thali",
      description: "Rice, sambar, rasam, 2 vegetable curries, kootu, curd, appalam, and payasam.",
      price: 220,
      category: "Meals",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "item-204",
      name: "Degree Filter Coffee",
      description: "Traditional freshly brewed chicory blended hot South Indian filter kaapi.",
      price: 50,
      category: "Beverages",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80"
    }
  ],
  "rest-3": [
    {
      id: "item-301",
      name: "Margherita Basilico Pizza",
      description: "San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil, extra virgin olive oil.",
      price: 349,
      category: "Pizza",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "item-302",
      name: "Pepperoni & Smoked Chicken Pizza",
      description: "Spicy pork pepperoni, barbecue chicken strips, mozzarella cheese, and bell peppers.",
      price: 499,
      category: "Pizza",
      isVeg: false,
      image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "item-303",
      name: "Creamy Alfredo Penne",
      description: "Penne pasta tossed in rich parmesan garlic cream sauce with mushrooms and olives.",
      price: 320,
      category: "Pasta",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "item-304",
      name: "Garlic Bread with Melted Cheese",
      description: "Toasted artisan sourdough loaf topped with garlic butter and stretchy mozzarella.",
      price: 160,
      category: "Starters",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=600&auto=format&fit=crop&q=80"
    }
  ],
  "rest-4": [
    {
      id: "item-401",
      name: "Chili Garlic Hakka Noodles",
      description: "Wok-tossed noodles with crunchy bell peppers, cabbage, spring onion, and garlic chili oil.",
      price: 210,
      category: "Noodles & Rice",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "item-402",
      name: "Crispy Kung Pao Chicken",
      description: "Diced chicken tossed with dried red chilies, roasted peanuts, and spicy savory sauce.",
      price: 290,
      category: "Mains",
      isVeg: false,
      image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "item-403",
      name: "Steamed Vegetable Dim Sum (6 pcs)",
      description: "Delicate wrappers filled with minced vegetables and served with fiery red dip.",
      price: 220,
      category: "Starters",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "item-404",
      name: "Manchow Soup with Crispy Noodles",
      description: "Classic spicy and tangy broth packed with minced vegetables and topped with fried noodles.",
      price: 130,
      category: "Soups",
      isVeg: true,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80"
    }
  ]
};

module.exports = {
  restaurants,
  menus
};
