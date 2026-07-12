require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT || 5050;

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🟢 BACKEND SERVER IS RUNNING ON http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
