const router = require("express").Router();
const userRoutes = require("./user-routes");
const exerciseRoutes = require("./exercise-routes");
const nutritionRoutes = require("./nutrition-routes");

router.use("/user", userRoutes);
router.use("/exercise", exerciseRoutes);
router.use("/nutrition", nutritionRoutes);

module.exports = router;
