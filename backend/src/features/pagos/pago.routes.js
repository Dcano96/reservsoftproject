const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const pagoController = require("./pago.controller");

// Rutas protegidas (usuarios autenticados y con roles permitidos)
router.post("/", authMiddleware, roleMiddleware(), pagoController.createPago);
router.get("/", authMiddleware, roleMiddleware(), pagoController.getPagos);
router.get("/:id", authMiddleware, roleMiddleware(), pagoController.getPagoById);
router.put("/:id", authMiddleware, roleMiddleware(), pagoController.updatePago);
router.delete("/:id", authMiddleware, roleMiddleware(), pagoController.deletePago);

module.exports = router;
