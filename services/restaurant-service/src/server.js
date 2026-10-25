require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`[Restaurant Service] running on port ${PORT}`);
  console.log(`[Restaurant Service] Health Check: http://localhost:${PORT}/health`);
});
