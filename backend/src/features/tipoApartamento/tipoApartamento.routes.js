const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const { 
  createTipoApartamento, 
  getTipoApartamentos, 
  updateTipoApartamento, 
  deleteTipoApartamento 
} = require("./tipoApartamento.controller");

// Crear tipoApartamento (solo administrador, usando permisos granulados)
router.post("/", authMiddleware, roleMiddleware("tipoApartamento"), createTipoApartamento);
// Obtener todos los tipoApartamentos
router.get("/", authMiddleware, getTipoApartamentos);
// Actualizar tipoApartamento (solo administrador, usando permisos granulados)
router.put("/:id", authMiddleware, roleMiddleware("tipoApartamento"), updateTipoApartamento);
// Eliminar tipoApartamento (solo administrador, usando permisos granulados)
router.delete("/:id", authMiddleware, roleMiddleware("tipoApartamento"), deleteTipoApartamento);

module.exports = router;
