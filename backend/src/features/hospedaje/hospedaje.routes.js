const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");

const {
  createHospedaje,
  getHospedajes,
  updateHospedaje,
  deleteHospedaje,
  checkInCheckOut,
  getHabitacionesDisponibles,
  saveHabitaciones,
  getFacturas,
} = require("./hospedaje.controller");

// Rutas públicas
// IMPORTANTE: Colocar la ruta pública antes de las rutas protegidas
router.get("/publico", getHospedajes); // Ejemplo de ruta pública similar a "/landing" en reservas

// Rutas protegidas - todas usan roleMiddleware() sin parámetros como en el archivo de reservas
router.post("/", authMiddleware, roleMiddleware(), createHospedaje);
router.get("/", authMiddleware, roleMiddleware(), getHospedajes);
router.put("/:id", authMiddleware, roleMiddleware(), updateHospedaje);
router.delete("/:id", authMiddleware, roleMiddleware(), deleteHospedaje);
router.post("/:id/checkin-checkout", authMiddleware, roleMiddleware(), checkInCheckOut);
router.get("/habitaciones-disponibles", authMiddleware, roleMiddleware(), getHabitacionesDisponibles);
router.post("/habitaciones-disponibles/guardar", authMiddleware, roleMiddleware(), saveHabitaciones);
router.get("/facturas", authMiddleware, roleMiddleware(), getFacturas);

module.exports = router;