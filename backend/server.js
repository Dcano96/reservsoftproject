// Cargar variables de entorno
require("dotenv").config()

// Verificar variables de entorno para el correo electrónico
console.log("Verificando variables de entorno para el correo electrónico:")
console.log("EMAIL_HOST:", process.env.EMAIL_HOST ? "Configurado" : "No configurado")
console.log("EMAIL_PORT:", process.env.EMAIL_PORT ? "Configurado" : "No configurado")
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Configurado" : "No configurado")
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? "Configurado (longitud: " + (process.env.EMAIL_PASS?.length || 0) + ")" : "No configurado",
)
console.log("EMAIL_SECURE:", process.env.EMAIL_SECURE ? "Configurado" : "No configurado")
console.log("FRONTEND_URL:", process.env.FRONTEND_URL ? "Configurado" : "No configurado")

// Importar la aplicación
const app = require("./app")

// Configurar puerto
const PORT = process.env.PORT || 5000

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
  console.log(`Fecha y hora de inicio: ${new Date().toLocaleString()}`)
})
