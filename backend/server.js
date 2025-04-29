// Cargar variables de entorno
require("dotenv").config()

// Importar la aplicación
const app = require("./app")

// Configurar puerto
const PORT = process.env.PORT || 5000

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
  console.log(`Fecha y hora de inicio: ${new Date().toLocaleString()}`)
})
