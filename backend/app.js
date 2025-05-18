require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const connectDB = require("./config/db")
// Otras importaciones...

// Importaciones de rutas
const authRoutes = require("./src/features/auth/auth.routes")
const userRoutes = require("./src/features/usuarios/usuario.routes") // CORREGIDO: usuarios.routes -> usuario.routes
const clienteRoutes = require("./src/features/clientes/cliente.routes")
const apartamentoRoutes = require("./src/features/apartamento/apartamento.routes")
const tipoApartamentoRoutes = require("./src/features/tipoApartamento/tipoApartamento.routes")
const reservaRoutes = require("./src/features/reservas/reserva.routes")
const pagoRoutes = require("./src/features/pagos/pago.routes")
const descuentoRoutes = require("./src/features/descuentos/descuento.routes")
const hospedajeRoutes = require("./src/features/hospedaje/hospedaje.routes")
const dashboardRoutes = require("./src/features/dashboard/dashboard.routes")
const mobiliarioRoutes = require("./src/features/mobiliarios/mobiliario.routes")
const rolRoutes = require("./src/features/roles/rol.routes")
const landingRoutes = require("./src/features/landing/landing.routes") // Importamos las nuevas rutas
// Otras rutas...

// Configuración de la app
const app = express()

// Conectar a la base de datos
connectDB()

// Middlewares
// Reemplazar la configuración simple de CORS con una más específica
app.use(cors({
  origin: '*', // Permite solicitudes desde cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true, // Permite cookies en solicitudes cross-origin
  preflightContinue: false,
  optionsSuccessStatus: 204
}))

// Middleware adicional para asegurar que las respuestas OPTIONS funcionen correctamente
app.options('*', cors()) // Habilita preflight para todas las rutas

app.use(express.json())
app.use(morgan("dev"))
// Otros middlewares...

// Rutas API
app.use("/api/auth", authRoutes)
app.use("/api/usuarios", userRoutes)
app.use("/api/clientes", clienteRoutes)
app.use("/api/apartamentos", apartamentoRoutes)
app.use("/api/tipoApartamento", tipoApartamentoRoutes)
app.use("/api/reservas", reservaRoutes)
app.use("/api/pagos", pagoRoutes)
app.use("/api/descuentos", descuentoRoutes)
app.use("/api/hospedaje", hospedajeRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/mobiliarios", mobiliarioRoutes)
app.use("/api/roles", rolRoutes)
app.use("/api/landing", landingRoutes) // Agregamos las rutas de landing
// Otras rutas...

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  })
})

module.exports = app