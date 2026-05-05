const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const pagoController = require("./pago.controller");
const { uploadComprobante } = require("./pago.upload");

// helper: envuelve multer y devuelve JSON en caso de error.
const withUpload = (handler) => (req, res, next) => {
  uploadComprobante(req, res, (err) => {
    if (err) return res.status(400).json({ msg: err.message || "Error al subir el comprobante", error: true });
    handler(req, res, next);
  });
};

// ── Rutas públicas (landing) ──────────────────────────────────
// Crea o reutiliza el Pago de la reserva y agrega el primer abono.
router.post("/landing", withUpload(pagoController.crearPagoDesdeLanding));

// ── Rutas protegidas ──────────────────────────────────────────
// Agregar un nuevo abono al Pago de una reserva (admin) — multipart, comprobante opcional.
router.put("/:id/abono", authMiddleware, roleMiddleware(), withUpload(pagoController.agregarAbono));

// Verificar (aprobar/rechazar) un abono específico.
router.put("/:id/abono/:abonoId/verificar", authMiddleware, roleMiddleware(), pagoController.verificarAbono);

// CRUD existente
router.post("/", authMiddleware, roleMiddleware(), pagoController.createPago);
router.get("/", authMiddleware, roleMiddleware(), pagoController.getPagos);
router.get("/:id", authMiddleware, roleMiddleware(), pagoController.getPagoById);
router.put("/:id", authMiddleware, roleMiddleware(), pagoController.updatePago);
router.delete("/:id", authMiddleware, roleMiddleware(), pagoController.deletePago);

// Funcionalidad extendida (legacy / utilidades)
router.get("/reserva/:reservaId", authMiddleware, roleMiddleware(), pagoController.getPagosByReserva);
router.put("/:id/verificar", authMiddleware, roleMiddleware(), pagoController.verificarPago);
router.post("/manual", authMiddleware, roleMiddleware(), pagoController.registrarPagoManual);
router.put("/reserva/:reservaId/sincronizar", authMiddleware, roleMiddleware(), pagoController.actualizarEstadoPagosReserva);

module.exports = router;
