const { PrismaClient } = require("@prisma/client");
const axios = require("axios");

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./delivery.db";
}

const prisma = new PrismaClient();

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:5002";

const partnerPool = [
  {
    name: "Vikram Rao",
    phone: "+91 98450 11223",
    vehicleNumber: "KA-01-EA-3412"
  },
  {
    name: "Suresh Kumar",
    phone: "+91 97312 44556",
    vehicleNumber: "MH-02-CB-8891"
  },
  {
    name: "Amit Verma",
    phone: "+91 99887 76655",
    vehicleNumber: "DL-3C-AZ-4109"
  },
  {
    name: "Deepak Joshi",
    phone: "+91 91122 33445",
    vehicleNumber: "TS-09-UB-1024"
  }
];

/**
 * Assign a simulated delivery partner and create delivery record
 */
async function createDelivery(data) {
  const {
    orderId,
    restaurantId,
    restaurantName,
    customerName,
    customerAddress,
    customerPhone
  } = data;

  if (!orderId) {
    throw { status: 400, message: "orderId is required to schedule delivery." };
  }

  // Check if delivery already exists for this order
  const existing = await prisma.delivery.findUnique({ where: { orderId } });
  if (existing) {
    return existing;
  }

  // Pick partner
  const randomIndex = Math.floor(Math.random() * partnerPool.length);
  const partner = partnerPool[randomIndex];
  const estimatedMinutes = Math.floor(20 + Math.random() * 20); // 20 - 40 mins

  const delivery = await prisma.delivery.create({
    data: {
      orderId,
      restaurantId: restaurantId || "unknown-restaurant",
      restaurantName: restaurantName || "Partner Restaurant",
      customerName: customerName || "Customer",
      customerAddress: customerAddress || "Delivery Address",
      customerPhone: customerPhone || "Not Provided",
      deliveryPartner: partner.name,
      partnerPhone: partner.phone,
      vehicleNumber: partner.vehicleNumber,
      status: "ASSIGNED",
      estimatedMinutes
    }
  });

  return delivery;
}

/**
 * Get delivery details by orderId
 */
async function getDeliveryByOrderId(orderId) {
  return await prisma.delivery.findUnique({
    where: { orderId }
  });
}

/**
 * Update delivery status and notify Order Service via HTTP
 */
async function updateDeliveryStatus(orderId, newStatus) {
  const allowedStatuses = ["ASSIGNED", "PICKED_UP", "ON_THE_WAY", "DELIVERED"];
  if (!allowedStatuses.includes(newStatus)) {
    throw {
      status: 400,
      message: `Invalid delivery status '${newStatus}'. Allowed: ${allowedStatuses.join(", ")}`
    };
  }

  const existing = await prisma.delivery.findUnique({ where: { orderId } });
  if (!existing) {
    throw {
      status: 404,
      message: `Delivery record for order '${orderId}' not found.`
    };
  }

  const updatedDelivery = await prisma.delivery.update({
    where: { orderId },
    data: { status: newStatus }
  });

  // Map Delivery status to Order Service status
  let orderStatusToSet = null;
  if (newStatus === "PICKED_UP") {
    orderStatusToSet = "PREPARING";
  } else if (newStatus === "ON_THE_WAY") {
    orderStatusToSet = "OUT_FOR_DELIVERY";
  } else if (newStatus === "DELIVERED") {
    orderStatusToSet = "DELIVERED";
  }

  if (orderStatusToSet) {
    try {
      await axios.patch(
        `${ORDER_SERVICE_URL}/orders/${orderId}/status`,
        { status: orderStatusToSet },
        { timeout: 3000 }
      );
    } catch (err) {
      console.log(`[Delivery Service] Sync status to Order Service skipped: ${err.message}`);
    }
  }

  return updatedDelivery;
}

module.exports = {
  prisma,
  createDelivery,
  getDeliveryByOrderId,
  updateDeliveryStatus
};
