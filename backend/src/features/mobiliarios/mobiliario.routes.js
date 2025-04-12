// routes/mobiliario.routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const { 
  createMobiliario, 
  getMobiliarios, 
  getMobiliariosPorApartamento,
  updateMobiliario, 
  darDeBajaMobiliario 
} = require("./mobiliario.controller");

// Crear mobiliario (solo administrador, usando permisos granulados para "mobiliarios")
router.post("/", authMiddleware, roleMiddleware("mobiliarios"), createMobiliario);

// Obtener todos los mobiliarios
router.get("/", authMiddleware, getMobiliarios);

// Obtener mobiliarios por apartamento
router.get("/apartamento/:apartamentoId", authMiddleware, getMobiliariosPorApartamento);

// Actualizar mobiliario (solo administrador, usando permisos granulados para "mobiliarios")
router.put("/:id", authMiddleware, roleMiddleware("mobiliarios"), updateMobiliario);

// Dar de baja mobiliario (solo administrador, usando permisos granulados para "mobiliarios")
router.put("/baja/:id", authMiddleware, roleMiddleware("mobiliarios"), darDeBajaMobiliario);

module.exports = router;
