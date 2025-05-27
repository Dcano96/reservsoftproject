const nodemailer = require("nodemailer")
const crypto = require("crypto")

// Configuración del transporter
const createTransporter = () => {
  console.log("Creando transporter con configuración:")
  console.log("- HOST:", process.env.EMAIL_HOST || "smtp.gmail.com")
  console.log("- PORT:", process.env.EMAIL_PORT || "587")
  console.log("- SECURE:", process.env.EMAIL_SECURE === "true" ? true : false)
  console.log("- USER:", process.env.EMAIL_USER)

  // Detectar si estamos usando Gmail
  const isGmail = process.env.EMAIL_USER?.includes("@gmail.com")
  
  if (isGmail) {
    console.log("Detectado Gmail como proveedor, usando configuración específica para Gmail")
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: process.env.NODE_ENV === "development",
      logger: process.env.NODE_ENV === "development",
    })
  }

  // Configuración estándar para otros proveedores
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true" ? true : false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Añadir configuración TLS para mayor compatibilidad
    tls: {
      // No fallar en certificados inválidos
      rejectUnauthorized: false,
    },
    // Aumentar el timeout para servidores lentos
    connectionTimeout: 10000,
    debug: process.env.NODE_ENV === "development",
    logger: process.env.NODE_ENV === "development",
  })
}

// Función para formatear la fecha
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Función para generar contraseñas temporales seguras que cumplan con los requisitos
const generateSecurePassword = () => {
  // Prefijo "Temp" seguido de un número aleatorio entre 1-9
  const prefix = "Temp" + Math.floor(Math.random() * 9 + 1)
  
  // Generar letras minúsculas aleatorias (3-4 caracteres)
  const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz'
  let lowercase = ''
  const lowercaseLength = Math.floor(Math.random() * 2) + 3 // 3-4 caracteres
  for (let i = 0; i < lowercaseLength; i++) {
    lowercase += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length))
  }
  
  // Añadir 1-2 números aleatorios
  const numbers = Math.floor(Math.random() * 90 + 10).toString()
  
  // Añadir un carácter especial
  const specialChars = '!@#$%^&*-_=+?'
  const specialChar = specialChars.charAt(Math.floor(Math.random() * specialChars.length))
  
  // Combinar todo para formar la contraseña
  // Formato: Temp + número + letras minúsculas + números + carácter especial
  return prefix + lowercase + numbers + specialChar
}

// Función para enviar el correo de confirmación de reserva
const sendReservationConfirmation = async (cliente, reservationData, password = null) => {
  try {
    console.log("Enviando correo de confirmación con los siguientes datos:")
    console.log("Cliente:", cliente)
    console.log("Datos de reserva:", reservationData)
    console.log("¿Contraseña temporal?", password ? "Sí" : "No")

    // Si no se proporcionó una contraseña, generar una segura
    if (!password) {
      password = generateSecurePassword()
      console.log("Contraseña temporal generada:", password)
    }

    // Verificar que el email del cliente sea válido
    if (!cliente.email || !cliente.email.includes("@")) {
      console.error("Email de cliente inválido:", cliente.email)
      return { success: false, error: "Email de cliente inválido" }
    }

    // Verificar que las variables de entorno estén configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("ERROR: Variables de entorno de correo no configuradas")
      console.error("EMAIL_USER:", process.env.EMAIL_USER ? "Configurado" : "No configurado")
      console.error("EMAIL_PASS:", process.env.EMAIL_PASS ? "Configurado" : "No configurado")
      return { success: false, error: "Configuración de correo incompleta" }
    }

    // Crear un nuevo transporter para cada envío
    const transporter = createTransporter()

    // Calcular noches y precio total
    const fechaEntrada = new Date(reservationData.fechaEntrada)
    const fechaSalida = new Date(reservationData.fechaSalida)
    const diffTime = Math.abs(fechaSalida - fechaEntrada)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const precioTotal = reservationData.total || reservationData.precioPorNoche * diffDays

    // Crear contenido HTML del correo (mantener el mismo contenido HTML)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Reserva - Nido Sky</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            background: linear-gradient(135deg, #0A2463 0%, #3E92CC 100%);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 5px 5px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 10px;
          }
          .reservation-details {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
          }
          .credentials {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #D8B08C;
          }
          .button {
            display: inline-block;
            background-color: #D8B08C;
            color: #0A2463;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 15px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
          }
          table td:first-child {
            font-weight: bold;
            width: 40%;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nidosky-V3qv6QnKvcP2qqA4Vxok6rQ8wpnZi9.png" alt="Nido Sky Logo" class="logo">
          <h1>¡Reserva Confirmada!</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${cliente.nombre}</strong>,</p>
          <p>¡Gracias por elegir Nido Sky para tu estancia en Medellín! Tu reserva ha sido confirmada exitosamente.</p>
          
          <div class="reservation-details">
            <h2>Detalles de tu Reserva:</h2>
            <table>
              <tr>
                <td>Apartamento:</td>
                <td>${reservationData.apartamento}</td>
              </tr>
              <tr>
                <td>Fecha de entrada:</td>
                <td>${formatDate(reservationData.fechaEntrada)}</td>
              </tr>
              <tr>
                <td>Fecha de salida:</td>
                <td>${formatDate(reservationData.fechaSalida)}</td>
              </tr>
              <tr>
                <td>Número de noches:</td>
                <td>${diffDays}</td>
              </tr>
              <tr>
                <td>Huéspedes:</td>
                <td>${reservationData.huespedes}</td>
              </tr>
              <tr>
                <td>Precio por noche:</td>
                <td>${reservationData.precioPorNoche}</td>
              </tr>
              <tr>
                <td>Precio total:</td>
                <td><strong>${precioTotal}</strong></td>
              </tr>
            </table>
          </div>
          
          ${
            password
              ? `
          <div class="credentials">
            <h2>Tus Credenciales de Acceso:</h2>
            <p>Hemos creado una cuenta para ti en nuestro sistema. Puedes acceder con las siguientes credenciales:</p>
            <table>
              <tr>
                <td>Email:</td>
                <td>${cliente.email}</td>
              </tr>
              <tr>
                <td>Contraseña:</td>
                <td>${password}</td>
              </tr>
            </table>
            <p><em>Te recomendamos cambiar tu contraseña después del primer inicio de sesión.</em></p>
          </div>
          `
              : ""
          }
          
          <p>Si tienes alguna pregunta o necesitas hacer cambios en tu reserva, no dudes en contactarnos.</p>
          
          <a href="http://localhost:3000/login" class="button">Ingresar al Sistema</a>
          
          <h3>Información de Contacto:</h3>
          <p>
            📞 +57 300 123 4567<br>
            ✉️ info@nidosky.com<br>
            📍 Calle 10 #43E-25, El Poblado, Medellín, Colombia
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Nido Sky. Todos los derechos reservados.</p>
          <p>Este correo fue enviado a ${cliente.email} porque realizaste una reserva en Nido Sky.</p>
        </div>
      </body>
      </html>
    `

    // Versión de texto plano para clientes que no soportan HTML
    const textContent = `
      ¡Reserva Confirmada!
      
      Hola ${cliente.nombre},
      
      ¡Gracias por elegir Nido Sky para tu estancia en Medellín! Tu reserva ha sido confirmada exitosamente.
      
      Detalles de tu Reserva:
      - Apartamento: ${reservationData.apartamento}
      - Fecha de entrada: ${formatDate(reservationData.fechaEntrada)}
      - Fecha de salida: ${formatDate(reservationData.fechaSalida)}
      - Número de noches: ${diffDays}
      - Huéspedes: ${reservationData.huespedes}
      - Precio por noche: ${reservationData.precioPorNoche}
      - Precio total: ${precioTotal}
      
      ${
        password
          ? `
      Tus Credenciales de Acceso:
      Hemos creado una cuenta para ti en nuestro sistema. Puedes acceder con las siguientes credenciales:
      - Email: ${cliente.email}
      - Contraseña: ${password}
      
      Te recomendamos cambiar tu contraseña después del primer inicio de sesión.
      `
          : ""
      }
      
      Si tienes alguna pregunta o necesitas hacer cambios en tu reserva, no dudes en contactarnos.
      
      Para ingresar al sistema, visita: http://localhost:3000/login
      
      Información de Contacto:
      Teléfono: +57 300 123 4567
      Email: info@nidosky.com
      Dirección: Calle 10 #43E-25, El Poblado, Medellín, Colombia
      
      © ${new Date().getFullYear()} Nido Sky. Todos los derechos reservados.
      Este correo fue enviado a ${cliente.email} porque realizaste una reserva en Nido Sky.
    `

    // Configurar opciones del correo con mejoras
    const mailOptions = {
      from: {
        name: "Nido Sky",
        address: process.env.EMAIL_USER,
      },
      to: cliente.email,
      subject: "Confirmación de tu Reserva en Nido Sky",
      html: htmlContent,
      text: textContent, // Versión de texto plano
      // Añadir cabeceras para mejorar la entrega
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "High",
      },
      // Añadir ID de mensaje único para evitar duplicados
      messageId: `<reservation-${Date.now()}@nidosky.com>`,
      // Añadir información de prioridad
      priority: "high",
    }

    // Intentar enviar el correo con reintentos
    let retries = 3
    let lastError = null

    while (retries > 0) {
      try {
        console.log(`Enviando correo a: ${cliente.email} (intento ${4 - retries}/3)`)
        const info = await transporter.sendMail(mailOptions)
        console.log("Correo enviado exitosamente:", info.messageId)

        // Si estamos en modo de prueba, mostrar la URL de vista previa
        if (process.env.NODE_ENV === "development" && info.messageUrl) {
          console.log("Vista previa URL:", info.messageUrl)
        }

        return { success: true, messageId: info.messageId, password }
      } catch (error) {
        lastError = error
        console.error(`Error en intento ${4 - retries}/3:`, error.message)
        retries--

        if (retries > 0) {
          // Si es el último intento, probar con una configuración alternativa
          if (retries === 1) {
            try {
              console.log("Intentando con configuración alternativa...")

              // Crear un transporter alternativo con configuración básica para Gmail
              const alternativeTransporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS,
                },
                tls: {
                  rejectUnauthorized: false,
                },
              })

              console.log("Enviando con configuración alternativa...")
              const alternativeInfo = await alternativeTransporter.sendMail(mailOptions)
              console.log("Correo enviado exitosamente con configuración alternativa:", alternativeInfo.messageId)
              return { success: true, messageId: alternativeInfo.messageId, password }
            } catch (alternativeError) {
              console.error("Error con configuración alternativa:", alternativeError.message)
            }
          }

          // Esperar antes de reintentar (1 segundo, 2 segundos, etc.)
          const delay = (4 - retries) * 1000
          console.log(`Reintentando en ${delay / 1000} segundos...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    console.error("Error al enviar correo después de 3 intentos:", lastError)
    console.error("Detalles del error:")
    if (lastError.code) console.error("- Código:", lastError.code)
    if (lastError.command) console.error("- Comando:", lastError.command)
    if (lastError.response) console.error("- Respuesta:", lastError.response)

    // Registrar información adicional para diagnóstico
    console.error("Información de diagnóstico:")
    console.error("- HOST:", process.env.EMAIL_HOST || "smtp.gmail.com")
    console.error("- PORT:", process.env.EMAIL_PORT || "587")
    console.error("- SECURE:", process.env.EMAIL_SECURE === "true" ? true : false)
    console.error("- USER:", process.env.EMAIL_USER)
    console.error("- Destinatario:", cliente.email)

    return {
      success: false,
      error: lastError.message,
      code: lastError.code || "UNKNOWN",
      details: "Fallo después de 3 intentos de envío",
    }
  } catch (error) {
    console.error("Error general al procesar envío de correo:", error)
    return { success: false, error: error.message }
  }
}

module.exports = { sendReservationConfirmation, generateSecurePassword }