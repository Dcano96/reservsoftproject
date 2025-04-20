const express = require("express")
const router = express.Router()
const authMiddleware = require("../../middlewares/authMiddleware")
const roleMiddleware = require("../../middlewares/roleMiddleware")
const {
  createCliente,
  getClientes,
  getClienteById,
  updateCliente,
  deleteCliente,
  getProfile,
  publicRegister,
  cambiarPassword,
  obtenerReservasCliente,
  getMisReservas,
} = require("./cliente.controller")

// Ruta pública para registro de clientes desde la landing page
router.post("/public-register", publicRegister)

// Rutas protegidas: se requiere el permiso "clientes" para gestionarlas
router.post("/", authMiddleware, roleMiddleware("clientes"), createCliente)
router.get("/", authMiddleware, roleMiddleware("clientes"), getClientes)
router.get("/:id", authMiddleware, roleMiddleware("clientes"), getClienteById)
router.put("/:id", authMiddleware, roleMiddleware("clientes"), updateCliente)
router.delete("/:id", authMiddleware, roleMiddleware("clientes"), deleteCliente)

// Ruta para que el propio cliente consulte su perfil
router.get("/profile", authMiddleware, getProfile)

// Ruta para que el cliente cambie su contraseña
router.post("/cambiar-password", authMiddleware, cambiarPassword)

// Ruta existente para obtener las reservas del cliente autenticado
router.get("/mis-reservas", authMiddleware, obtenerReservasCliente)

// Nueva ruta para obtener las reservas del cliente (sin verificación de permisos)
// Esta ruta es accesible directamente con el token de autenticación
router.get("/mis-reservas/all", authMiddleware, getMisReservas)

module.exports = router
