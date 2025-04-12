const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const dashboardController = require("./dashboard.controller");

// Para el Dashboard solo se permite la lectura; por ello, se utiliza roleMiddleware() sin parámetro,
// lo que permite que el middleware (en formato granular) no restrinja la lectura.
router.get(
  "/",
  authMiddleware,
  roleMiddleware(),
  dashboardController.getDashboard
);

module.exports = router;
