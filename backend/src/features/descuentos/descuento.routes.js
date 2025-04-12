// src/features/descuentos/descuentos.routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const { createDescuento, getDescuentos, updateDescuento, deleteDescuento } = require("./descuento.controller");

// Para cada ruta se verifica el permiso específico:
// - "descuentos", "crear" para crear
// - "descuentos", "leer" para listar
// - "descuentos", "actualizar" para actualizar
// - "descuentos", "eliminar" para eliminar
router.post("/", authMiddleware, roleMiddleware("descuentos", "crear"), createDescuento);
router.get("/", authMiddleware, roleMiddleware("descuentos", "leer"), getDescuentos);
router.put("/:id", authMiddleware, roleMiddleware("descuentos", "actualizar"), updateDescuento);
router.delete("/:id", authMiddleware, roleMiddleware("descuentos", "eliminar"), deleteDescuento);

module.exports = router;
