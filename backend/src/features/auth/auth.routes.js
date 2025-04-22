const express = require("express")
const router = express.Router()
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  adminResetPassword,
  verificarEstadoRol, // Añadida la nueva función
} = require("./auth.controller")
const authMiddleware = require("../../middlewares/authMiddleware")

// Rutas existentes - sin cambios
router.post("/register", register)
router.post("/login", login)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

// Nueva ruta para administradores
router.post("/admin-reset-password", adminResetPassword)

// Nueva ruta para verificar el estado del rol
router.get("/verificar-rol", authMiddleware, verificarEstadoRol)

module.exports = router
