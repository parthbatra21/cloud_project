const { PrismaClient } = require("@prisma/client");
const axios = require("axios");

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const prisma = new PrismaClient();

const RESTAURANT_SERVICE_URL =
  process.env.RESTAURANT_SERVICE_URL || "http://localhost:5001";
const DELIVERY_SERVICE_URL =
  process.env.DELIVERY_SERVICE_URL || "http://localhost:5003";

// Fallback menu catalog in case Restaurant Service is running in isolated test mode
const fallbackCatalog = {
  "item-101": { name: "Hyderabadi Chicken Dum Biryani", price: 299 },
  "item-102": { name: "Paneer Tikka Biryani", price: 249 },
  "item-103": { name: "Murgh Malai Tikka (6 pcs)", price: 280 },
  "item-104": { name: "Mirchi Ka Salan & Raita Combo", price: 70 },
  "item-105": { name: "Shahi Gulab Jamun (2 pcs)", price: 90 },
  "item-201": { name: "Special Masala Dosa", price: 130 },
  "item-202": { name: "Steamed Idli Vada Platter", price: 110 },
  "item-203": { name: "South Indian Royal Thali", price: 220 },
  "item-204": { name: "Degree Filter Coffee", price: 50 },
  "item-301": { name: "Margherita Basilico Pizza", price: 349 },
  "item-302": { name: "Pepperoni & Smoked Chicken Pizza", price: 499 },
  "item-303": { name: "Creamy Alfredo Penne", price: 320 },
  "item-304": { name: "Garlic Bread with Melted Cheese", price: 160 },
  "item-401": { name: "Chili Garlic Hakka Noodles", price: 210 },
  "item-402": { name: "Crispy Kung Pao Chicken", price: 290 },
  "item-403": { name: "Steamed Vegetable Dim Sum (6 pcs)", price: 220 },
  "item-404": { name: "Manchow Soup with Crispy Noodles", price: 130 }
};

/**
 * Fetch authoritative menu items from Restaurant Service
 */
async function fetchMenuFromRestaurantService(restaurantId) {
  try {
    const response = await axios.get(
      `${RESTAURANT_SERVICE_URL}/restaurants/${restaurantId}/menu`,
      { timeout: 3000 }
    );
    if (response.data && response.data.success && response.data.data) {
      const itemMap = {};
      response.data.data.forEach((item) => {
        itemMap[item.id] = item;
      });
      return {
        restaurantName: response.data.restaurantName,
        itemMap
      };
    }
  } catch (error) {
    // Graceful fallback when restaurant-service is not running or during tests
  }
  return null;
}

/**
 * Create a new order with backend validation & price calculation
 */
async function createOrder(data) {
  const { customerName, customerAddress, customerPhone, restaurantId, items } = data;

  // 1. Validation
  if (!customerName || !customerAddress || !customerPhone) {
    throw { status: 400, message: "Customer name, address, and phone are required." };
  }

  if (!restaurantId) {
    throw { status: 400, message: "Restaurant ID is required." };
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: "Order must contain at least one item." };
  }

  // 2. Validate items & compute authoritative total
  let restaurantName = data.restaurantName || "Partner Restaurant";
  const remoteMenu = await fetchMenuFromRestaurantService(restaurantId);

  if (remoteMenu) {
    restaurantName = remoteMenu.restaurantName;
  }

  const orderItemsToSave = [];
  let calculatedTotal = 0;

  for (const item of items) {
    const quantity = parseInt(item.quantity, 10);
    if (!quantity || quantity <= 0) {
      throw { status: 400, message: `Invalid quantity for item ${item.menuItemId || item.name}` };
    }

    let authoritativePrice = null;
    let authoritativeName = item.name;

    // Check remote restaurant service catalog first
    if (remoteMenu && remoteMenu.itemMap[item.menuItemId]) {
      authoritativePrice = remoteMenu.itemMap[item.menuItemId].price;
      authoritativeName = remoteMenu.itemMap[item.menuItemId].name;
    } else if (fallbackCatalog[item.menuItemId]) {
      // Check fallback catalog
      authoritativePrice = fallbackCatalog[item.menuItemId].price;
      authoritativeName = fallbackCatalog[item.menuItemId].name;
    } else if (typeof item.price === "number" && item.price > 0) {
      // If neither matches, use provided price as last resort
      authoritativePrice = item.price;
    } else {
      throw { status: 400, message: `Unknown food item ID: ${item.menuItemId}` };
    }

    const itemTotal = authoritativePrice * quantity;
    calculatedTotal += itemTotal;

    orderItemsToSave.push({
      menuItemId: item.menuItemId || "custom-item",
      name: authoritativeName,
      price: authoritativePrice,
      quantity
    });
  }

  // 3. Generate human-readable unique order ID (e.g. ORD-98214)
  const uniqueSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderId = `ORD-${uniqueSuffix}`;

  // 4. Save in SQLite via Prisma
  const savedOrder = await prisma.order.create({
    data: {
      id: orderId,
      customerName: customerName.trim(),
      customerAddress: customerAddress.trim(),
      customerPhone: customerPhone.trim(),
      restaurantId,
      restaurantName,
      totalAmount: Math.round(calculatedTotal * 100) / 100,
      status: "PLACED",
      items: {
        create: orderItemsToSave
      }
    },
    include: {
      items: true
    }
  });

  // 5. Notify Delivery Service asynchronously via HTTP (microservice integration)
  try {
    const deliveryPayload = {
      orderId: savedOrder.id,
      restaurantId: savedOrder.restaurantId,
      restaurantName: savedOrder.restaurantName,
      customerName: savedOrder.customerName,
      customerAddress: savedOrder.customerAddress,
      customerPhone: savedOrder.customerPhone
    };

    const deliveryRes = await axios.post(
      `${DELIVERY_SERVICE_URL}/deliveries`,
      deliveryPayload,
      { timeout: 3000 }
    );

    if (deliveryRes.data && deliveryRes.data.data && deliveryRes.data.data.deliveryPartner) {
      // Update assigned partner in Order record
      await prisma.order.update({
        where: { id: savedOrder.id },
        data: { deliveryPartner: deliveryRes.data.data.deliveryPartner }
      });
      savedOrder.deliveryPartner = deliveryRes.data.data.deliveryPartner;
    }
  } catch (err) {
    // Order creation succeeded even if Delivery Service is offline or pending
    console.log(`[Order Service] Delivery service notification skipped: ${err.message}`);
  }

  return savedOrder;
}

/**
 * Get all orders, sorted newest first
 */
async function getAllOrders() {
  return await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true }
  });
}

/**
 * Get single order by ID
 */
async function getOrderById(id) {
  return await prisma.order.findUnique({
    where: { id },
    include: { items: true }
  });
}

/**
 * Update order status
 */
async function updateOrderStatus(id, newStatus) {
  const allowedStatuses = ["PLACED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
  if (!allowedStatuses.includes(newStatus)) {
    throw {
      status: 400,
      message: `Invalid status '${newStatus}'. Allowed: ${allowedStatuses.join(", ")}`
    };
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: `Order with ID '${id}' not found.` };
  }

  return await prisma.order.update({
    where: { id },
    data: { status: newStatus },
    include: { items: true }
  });
}

module.exports = {
  prisma,
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
