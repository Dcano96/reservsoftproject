const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const pagoController = require("./pago.controller");

// Rutas protegidas — CRUD existente
router.post("/", authMiddleware, roleMiddleware(), pagoController.createPago);
router.get("/", authMiddleware, roleMiddleware(), pagoController.getPagos);
router.get("/:id", authMiddleware, roleMiddleware(), pagoController.getPagoById);
router.put("/:id", authMiddleware, roleMiddleware(), pagoController.updatePago);
router.delete("/:id", authMiddleware, roleMiddleware(), pagoController.deletePago);

// Nuevas rutas — funcionalidad extendida
router.get("/reserva/:reservaId", authMiddleware, roleMiddleware(), pagoController.getPagosByReserva);
router.put("/:id/verificar", authMiddleware, roleMiddleware(), pagoController.verificarPago);
router.post("/manual", authMiddleware, roleMiddleware(), pagoController.registrarPagoManual);
router.put("/reserva/:reservaId/sincronizar", authMiddleware, roleMiddleware(), pagoController.actualizarEstadoPagosReserva);

module.exports = router;
