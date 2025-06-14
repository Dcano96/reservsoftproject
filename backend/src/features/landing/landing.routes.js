const express = require("express")
const router = express.Router()
const landingController = require("./landing.controller")

// Middleware de autenticación simplificado
// Si ya tienes un middleware de autenticación, ajusta la ruta de importación
// según la estructura de tu proyecto
const verifyToken = (req, res, next) => {
  // Implementación básica - en producción deberías verificar el token JWT
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ message: "No autorizado" })
  }
  // En un caso real, verificarías el token
  // Por ahora, simplemente pasamos al siguiente middleware
  next()
}

const isAdmin = (req, res, next) => {
  // Implementación básica - en producción verificarías el rol del usuario
  // Por ahora, simplemente pasamos al siguiente middleware
  next()
}

// Make sure the featured apartments route is correctly defined
// Check if the route is properly registered

// Rutas públicas
router.get("/", landingController.getLandingInfo)
router.get("/apartamentos-destacados", landingController.getFeaturedApartments)
router.post("/testimonios", landingController.addTestimonial)

// ✅ AGREGADO: Ruta para crear reserva desde landing (con comprobante)
router.post("/crear-reserva", landingController.crearReservaDesdeLanding)

// Rutas protegidas (solo administradores)
router.put("/", verifyToken, isAdmin, landingController.updateLandingInfo)

module.exports = router
