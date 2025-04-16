const express = require("express")
const router = express.Router()
const { register, login, forgotPassword, resetPassword, adminResetPassword } = require("./auth.controller")

// Rutas existentes - sin cambios
router.post("/register", register)
router.post("/login", login)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

// Nueva ruta para administradores
router.post("/admin-reset-password", adminResetPassword)

module.exports = router
