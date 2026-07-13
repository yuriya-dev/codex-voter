const express = require("express");
const cors = require("cors");

const groupsRouter = require("./routes/groups");
const authRouter = require("./routes/auth");
const votesRouter = require("./routes/votes");
const dashboardRouter = require("./routes/dashboard");
const adminRouter = require("./routes/admin");
const settingsRouter = require("./routes/settings");

const app = express();

// Middleware to strip Vercel rewrite prefix if present
app.use((req, res, next) => {
  if (req.url.startsWith("/api/backend")) {
    req.url = req.url.replace("/api/backend", "");
  }
  next();
});

// Configure CORS dynamically to reflect request origin
app.use(cors({ origin: true }));
app.use(express.json());

// Routes Registration
app.use("/api/groups", groupsRouter);
app.use("/api/auth", authRouter);
app.use("/api/votes", votesRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/admin", adminRouter);
app.use("/api/settings", settingsRouter);

module.exports = app;
