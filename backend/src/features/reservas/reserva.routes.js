//Routes de reservas

const express = require("express")
const router = express.Router()
const authMiddleware = require("../../middlewares/authMiddleware")
const roleMiddleware = require("../../middlewares/roleMiddleware")
const reservaController = require("./reserva.controller")

// Rutas públicas
// IMPORTANTE: Colocar la ruta pública antes de las rutas protegidas
router.post("/publica", reservaController.crearReservaPublica)
router.get("/fechas-reservadas/:id", reservaController.obtenerFechasReservadas)

// Rutas protegidas
router.post("/", authMiddleware, roleMiddleware(), reservaController.crearReserva)
router.get("/", authMiddleware, roleMiddleware(), reservaController.obtenerReservas)
router.get("/:id", authMiddleware, roleMiddleware(), reservaController.obtenerReserva)
router.put("/:id", authMiddleware, roleMiddleware(), reservaController.actualizarReserva)
router.delete("/:id", authMiddleware, roleMiddleware(), reservaController.eliminarReserva)

// Rutas para acompañantes
router.post("/:id/acompanantes", authMiddleware, roleMiddleware(), reservaController.agregarAcompanante)
router.put(
  "/:id/acompanantes/:acompananteId",
  authMiddleware,
  roleMiddleware(),
  reservaController.actualizarAcompanante,
)
router.delete(
  "/:id/acompanantes/:acompananteId",
  authMiddleware,
  roleMiddleware(),
  reservaController.eliminarAcompanante,
)

module.exports = router

