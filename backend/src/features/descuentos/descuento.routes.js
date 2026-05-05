// src/features/descuentos/descuentos.routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const { createDescuento, getDescuentos, getDescuentosVigentes, updateDescuento, deleteDescuento } = require("./descuento.controller");

// Para cada ruta se verifica el permiso específico:
// - "descuentos", "crear" para crear
// - "descuentos", "leer" para listar
// - "descuentos", "actualizar" para actualizar
// - "descuentos", "eliminar" para eliminar
router.post("/", authMiddleware, roleMiddleware("descuentos", "crear"), createDescuento);
router.get("/", authMiddleware, roleMiddleware("descuentos", "leer"), getDescuentos);
// Vigentes: lo consume el form de reservas para aplicar descuentos por tipo de apartamento.
// Solo requiere autenticación (no permiso de descuentos) porque cualquier usuario que pueda crear reservas necesita verlos.
router.get("/vigentes", authMiddleware, getDescuentosVigentes);
router.put("/:id", authMiddleware, roleMiddleware("descuentos", "actualizar"), updateDescuento);
router.delete("/:id", authMiddleware, roleMiddleware("descuentos", "eliminar"), deleteDescuento);

module.exports = router;
