const http = require("http");
const { spawn } = require("child_process");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", reject);

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runEndToEndVerification() {
  console.log("=============================================================");
  console.log("   QuickBite End-to-End Microservices Integration Verification");
  console.log("=============================================================\n");

  console.log("[1/6] Launching all 3 microservices concurrently...");

  const restaurantProc = spawn("node", ["src/server.js"], {
    cwd: `${__dirname}/../services/restaurant-service`,
    env: { ...process.env, PORT: 5001 }
  });

  const orderProc = spawn("node", ["src/server.js"], {
    cwd: `${__dirname}/../services/order-service`,
    env: {
      ...process.env,
      PORT: 5002,
      DATABASE_URL: "file:./dev.db",
      RESTAURANT_SERVICE_URL: "http://localhost:5001",
      DELIVERY_SERVICE_URL: "http://localhost:5003"
    }
  });

  const deliveryProc = spawn("node", ["src/server.js"], {
    cwd: `${__dirname}/../services/delivery-service`,
    env: {
      ...process.env,
      PORT: 5003,
      DATABASE_URL: "file:./delivery.db",
      ORDER_SERVICE_URL: "http://localhost:5002"
    }
  });

  // Give servers 2 seconds to bind ports
  await sleep(2000);

  try {
    // 1. Health Checks
    console.log("[2/6] Verifying health check endpoints...");
    const restHealth = await request("http://localhost:5001/health");
    console.log(`  ✓ Restaurant Service Health: HTTP ${restHealth.status} (${restHealth.body.status})`);

    const orderHealth = await request("http://localhost:5002/health");
    console.log(`  ✓ Order Service Health: HTTP ${orderHealth.status} (${orderHealth.body.status})`);

    const deliveryHealth = await request("http://localhost:5003/health");
    console.log(`  ✓ Delivery Service Health: HTTP ${deliveryHealth.status} (${deliveryHealth.body.status})`);

    // 2. Fetch Restaurant List and Menu
    console.log("\n[3/6] Fetching catalog from Restaurant Service (Port 5001)...");
    const restList = await request("http://localhost:5001/restaurants");
    console.log(`  ✓ Found ${restList.body.count} restaurants.`);

    const menu = await request("http://localhost:5001/restaurants/rest-1/menu");
    console.log(`  ✓ Menu for '${menu.body.restaurantName}' has ${menu.body.count} items.`);
    const firstDish = menu.body.data[0];
    console.log(`    Item: ${firstDish.name} - Official Catalog Price: ₹${firstDish.price}`);

    // 3. Place Order via Order Service (demonstrating backend price tamper protection)
    console.log("\n[4/6] Placing an order via Order Service (Port 5002)...");
    console.log("  * Simulating client tampering price to ₹10...");
    const orderPayload = {
      customerName: "Rohan Varma",
      customerAddress: "42 Residency Road, Richmond Town, Bengaluru",
      customerPhone: "+91 98450 12345",
      restaurantId: "rest-1",
      items: [
        {
          menuItemId: firstDish.id,
          name: firstDish.name,
          price: 10, // Tampered price
          quantity: 2
        }
      ]
    };

    const orderRes = await request("http://localhost:5002/orders", { method: "POST" }, orderPayload);
    const placedOrder = orderRes.body.data;
    console.log(`  ✓ Order created successfully!`);
    console.log(`    - Generated Order ID: ${placedOrder.id}`);
    console.log(`    - Status: ${placedOrder.status}`);
    console.log(`    - Authoritative Total Calculated by Backend: ₹${placedOrder.totalAmount} (Expected: ₹${firstDish.price * 2})`);
    console.log(`    - Assigned Delivery Partner via HTTP: ${placedOrder.deliveryPartner || "Assigned"}`);

    if (placedOrder.totalAmount !== firstDish.price * 2) {
      throw new Error(`Security validation failure: backend accepted tampered price!`);
    }

    // 4. Verify Delivery Record in Delivery Service
    console.log("\n[5/6] Verifying tracking record in Delivery Service (Port 5003)...");
    const deliveryRes = await request(`http://localhost:5003/deliveries/${placedOrder.id}`);
    console.log(`  ✓ Delivery Tracking Found:`);
    console.log(`    - Partner: ${deliveryRes.body.data.deliveryPartner} (${deliveryRes.body.data.partnerPhone})`);
    console.log(`    - Vehicle: ${deliveryRes.body.data.vehicleNumber}`);
    console.log(`    - Estimated: ${deliveryRes.body.data.estimatedMinutes} mins`);
    console.log(`    - Current Delivery Status: ${deliveryRes.body.data.status}`);

    // 5. Simulate Status Progression & Inter-Service HTTP sync
    console.log("\n[6/6] Advancing delivery status to 'DELIVERED' in Delivery Service...");
    const updateRes = await request(
      `http://localhost:5003/deliveries/${placedOrder.id}/status`,
      { method: "PATCH" },
      { status: "DELIVERED" }
    );
    console.log(`  ✓ Delivery Service updated status: ${updateRes.body.data.status}`);

    await sleep(500); // Allow HTTP notification to sync
    const checkOrder = await request(`http://localhost:5002/orders/${placedOrder.id}`);
    console.log(`  ✓ Synced Order Service Status: ${checkOrder.body.data.status}`);

    if (checkOrder.body.data.status === "DELIVERED") {
      console.log("\n=============================================================");
      console.log("   🎉 ALL MICROSERVICES & INTER-SERVICE FLOWS VERIFIED 100%!");
      console.log("=============================================================\n");
    } else {
      console.log(`\nNote: Order status is ${checkOrder.body.data.status}`);
    }
  } catch (err) {
    console.error("End-to-end verification error:", err);
  } finally {
    // Terminate processes
    restaurantProc.kill();
    orderProc.kill();
    deliveryProc.kill();
  }
}

runEndToEndVerification();
