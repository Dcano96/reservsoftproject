// Cargar variables de entorno
require("dotenv").config()

// Importar la aplicación
const app = require("./app")

// Aumentar el límite de tamaño para las solicitudes
const express = require("express")
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Configurar puerto y host
const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || '0.0.0.0'

// Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
  console.log(`Fecha y hora de inicio: ${new Date().toLocaleString()}`)
  console.log(`Acceso local: http://localhost:${PORT}`)
  
  // Obtener la dirección IP de la máquina en la red local
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const inf in interfaces) {
    for (const details of interfaces[inf]) {
      // Filtrar las direcciones IPv4
      if (details.family === 'IPv4' && !details.internal) {
        console.log(`Acceso desde la red: http://${details.address}:${PORT}`);
      }
    }
  }
})