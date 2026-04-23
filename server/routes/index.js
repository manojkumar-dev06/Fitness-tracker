const router = require("express").Router();
const path = require("path");
const apiRoutes = require("./api");

// API Routes
router.use("/api", apiRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Handle React routing, return all requests to React app
  router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

module.exports = router;
