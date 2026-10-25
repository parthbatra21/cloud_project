require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`[Delivery Service] running on port ${PORT}`);
  console.log(`[Delivery Service] Health Check: http://localhost:${PORT}/health`);
});
