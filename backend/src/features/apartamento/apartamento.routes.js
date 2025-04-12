const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const { 
  createApartamento, 
  getApartamentos, 
  updateApartamento, 
  deleteApartamento 
} = require("./apartamento.controller");

// Crear apartamento (solo administrador, usando permisos granulados con el módulo "apartamentos")
router.post("/", authMiddleware, roleMiddleware("apartamentos"), createApartamento);
// Obtener todos los apartamentos
router.get("/", authMiddleware, getApartamentos);
// Actualizar apartamento (solo administrador, usando permisos granulados)
router.put("/:id", authMiddleware, roleMiddleware("apartamentos"), updateApartamento);
// Eliminar apartamento (solo administrador, usando permisos granulados)
router.delete("/:id", authMiddleware, roleMiddleware("apartamentos"), deleteApartamento);

module.exports = router;
