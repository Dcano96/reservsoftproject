// src/features/clientes/cliente.routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const {
  createCliente,
  getClientes,
  getClienteById,
  updateCliente,
  deleteCliente,
  getProfile
} = require("./cliente.controller");

// Rutas protegidas: se requiere el permiso "clientes" para gestionarlas
router.post("/", authMiddleware, roleMiddleware("clientes"), createCliente);
router.get("/", authMiddleware, roleMiddleware("clientes"), getClientes);
router.get("/:id", authMiddleware, roleMiddleware("clientes"), getClienteById);
router.put("/:id", authMiddleware, roleMiddleware("clientes"), updateCliente);
router.delete("/:id", authMiddleware, roleMiddleware("clientes"), deleteCliente);

// Ruta para que el propio cliente consulte su perfil
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
