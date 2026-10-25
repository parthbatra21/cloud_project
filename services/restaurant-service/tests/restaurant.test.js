const request = require("supertest");
const app = require("../src/app");

describe("Restaurant Service API Endpoints", () => {
  it("GET /health should return 200 and UP status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("UP");
    expect(res.body.service).toBe("restaurant-service");
  });

  it("GET /restaurants should return all restaurants with status 200", async () => {
    const res = await request(app).get("/restaurants");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("id");
    expect(res.body.data[0]).toHaveProperty("name");
    expect(res.body.data[0]).toHaveProperty("cuisine");
  });

  it("GET /restaurants/:id should return a specific restaurant", async () => {
    const res = await request(app).get("/restaurants/rest-1");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("rest-1");
    expect(res.body.data.name).toBe("Biryani Blues & Royal Kitchen");
  });

  it("GET /restaurants/:id should return 404 for an unknown restaurant", async () => {
    const res = await request(app).get("/restaurants/non-existent-id");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("GET /restaurants/:id/menu should return menu items with INR prices", async () => {
    const res = await request(app).get("/restaurants/rest-1/menu");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.restaurantId).toBe("rest-1");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("price");
    expect(typeof res.body.data[0].price).toBe("number");
  });
});
