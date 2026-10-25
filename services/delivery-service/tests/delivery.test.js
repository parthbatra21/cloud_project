const request = require("supertest");
const app = require("../src/app");
const { prisma } = require("../src/services/deliveryService");

describe("Delivery Service API Endpoints", () => {
  const testOrderId = `TEST-ORD-${Date.now()}`;

  beforeAll(async () => {
    await prisma.delivery.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("GET /health should return 200 and UP status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("UP");
    expect(res.body.service).toBe("delivery-service");
  });

  it("POST /deliveries should assign a delivery partner", async () => {
    const payload = {
      orderId: testOrderId,
      restaurantId: "rest-1",
      restaurantName: "Biryani Blues",
      customerName: "Vikram Malhotra",
      customerAddress: "Koramangala 4th Block, Bengaluru",
      customerPhone: "+91 9988776655"
    };

    const res = await request(app).post("/deliveries").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe(testOrderId);
    expect(res.body.data).toHaveProperty("deliveryPartner");
    expect(res.body.data).toHaveProperty("partnerPhone");
    expect(res.body.data).toHaveProperty("vehicleNumber");
    expect(res.body.data.status).toBe("ASSIGNED");
  });

  it("GET /deliveries/:orderId should retrieve tracking info", async () => {
    const res = await request(app).get(`/deliveries/${testOrderId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe(testOrderId);
    expect(res.body.data.deliveryPartner).toBeDefined();
  });

  it("PATCH /deliveries/:orderId/status should update delivery status", async () => {
    const res = await request(app)
      .patch(`/deliveries/${testOrderId}/status`)
      .send({ status: "ON_THE_WAY" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ON_THE_WAY");
  });

  it("PATCH /deliveries/:orderId/status should reject invalid status", async () => {
    const res = await request(app)
      .patch(`/deliveries/${testOrderId}/status`)
      .send({ status: "FLYING_DRONE" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
