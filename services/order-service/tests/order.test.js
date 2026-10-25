const request = require("supertest");
const app = require("../src/app");
const { prisma } = require("../src/services/orderService");

describe("Order Service API Endpoints", () => {
  beforeAll(async () => {
    // Clean test database tables
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("GET /health should return 200 and UP status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("UP");
    expect(res.body.service).toBe("order-service");
  });

  it("POST /orders should create a valid order and recalculate total on backend", async () => {
    const payload = {
      customerName: "Aarav Sharma",
      customerAddress: "Flat 402, Green Glen Layout, Bellandur, Bengaluru",
      customerPhone: "+91 9876543210",
      restaurantId: "rest-1",
      restaurantName: "Biryani Blues & Royal Kitchen",
      items: [
        {
          menuItemId: "item-101", // Hyderabadi Chicken Dum Biryani (Authoritative price: 299)
          name: "Hyderabadi Chicken Dum Biryani",
          price: 5, // Client attempts to send fake price of 5 INR!
          quantity: 2
        },
        {
          menuItemId: "item-104", // Mirchi Ka Salan (Authoritative price: 70)
          name: "Mirchi Ka Salan & Raita Combo",
          price: 1, // Client attempts to send fake price of 1 INR!
          quantity: 1
        }
      ]
    };

    const res = await request(app).post("/orders").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.id).toMatch(/^ORD-/);
    expect(res.body.data.status).toBe("PLACED");

    // Check backend price recalculation: (299 * 2) + (70 * 1) = 598 + 70 = 668
    expect(res.body.data.totalAmount).toBe(668);
    expect(res.body.data.items.length).toBe(2);
    expect(res.body.data.items[0].price).toBe(299);
  });

  it("POST /orders should reject invalid order with missing customer details", async () => {
    const payload = {
      restaurantId: "rest-1",
      items: [{ menuItemId: "item-101", quantity: 1 }]
    };

    const res = await request(app).post("/orders").send(payload);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /orders should reject empty items list", async () => {
    const payload = {
      customerName: "Priya Patel",
      customerAddress: "Marine Drive, Mumbai",
      customerPhone: "+91 9123456789",
      restaurantId: "rest-1",
      items: []
    };

    const res = await request(app).post("/orders").send(payload);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("GET /orders should retrieve all stored orders", async () => {
    const res = await request(app).get("/orders");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("GET /orders/:id should retrieve a specific order by ID", async () => {
    // Get existing order from list
    const listRes = await request(app).get("/orders");
    const existingId = listRes.body.data[0].id;

    const res = await request(app).get(`/orders/${existingId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(existingId);
    expect(res.body.data.items).toBeDefined();
  });

  it("PATCH /orders/:id/status should successfully update status", async () => {
    const listRes = await request(app).get("/orders");
    const existingId = listRes.body.data[0].id;

    const res = await request(app)
      .patch(`/orders/${existingId}/status`)
      .send({ status: "PREPARING" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("PREPARING");
  });

  it("PATCH /orders/:id/status should reject invalid status", async () => {
    const listRes = await request(app).get("/orders");
    const existingId = listRes.body.data[0].id;

    const res = await request(app)
      .patch(`/orders/${existingId}/status`)
      .send({ status: "INVALID_STATUS_XYZ" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
