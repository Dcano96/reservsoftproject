const nodemailer = require("nodemailer")

// Configuración del transporter de nodemailer usando las variables de entorno existentes
// con valores por defecto para Gmail si no están configuradas
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com", // Valor por defecto para Gmail
  port: Number.parseInt(process.env.EMAIL_PORT || "587"), // Puerto estándar para TLS
  secure: process.env.EMAIL_SECURE === "true" ? true : false, // Por defecto, false para TLS
  auth: {
    user: process.env.EMAIL_USER || "dgoez2020@gmail.com", // Valor por defecto
    pass: process.env.EMAIL_PASS || "qrlj smsh jsdb tjbv", // Valor por defecto
  },
  debug: true, // Habilitar debugging
  logger: true, // Habilitar logging
})

// Verificar la conexión al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error("Error al verificar la configuración del servidor SMTP:", error)
    console.error("Detalles de la configuración SMTP:")
    console.error("- HOST:", process.env.EMAIL_HOST || "smtp.gmail.com")
    console.error("- PORT:", process.env.EMAIL_PORT || "587")
    console.error("- SECURE:", process.env.EMAIL_SECURE === "true" ? true : false)
    console.error("- USER:", process.env.EMAIL_USER || "dgoez2020@gmail.com")
    console.error("- PASS: [OCULTO]")
  } else {
    console.log("Servidor SMTP listo para enviar mensajes")
  }
})

// Función para formatear fechas en formato legible
const formatDate = (dateString) => {
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  return new Date(dateString).toLocaleDateString("es-ES", options)
}

// Función para enviar correo de confirmación de reserva
exports.sendReservationConfirmation = async (cliente, reservationData, password = null) => {
  try {
    console.log("Enviando correo de confirmación con los siguientes datos:")
    console.log("Cliente:", cliente)
    console.log("Datos de reserva:", reservationData)
    console.log("¿Contraseña temporal?", password ? "Sí" : "No")

    // Calcular noches y precio total
    const fechaEntrada = new Date(reservationData.fechaEntrada)
    const fechaSalida = new Date(reservationData.fechaSalida)
    const diffTime = Math.abs(fechaSalida - fechaEntrada)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const precioTotal = reservationData.total || reservationData.precioPorNoche * diffDays

    // Crear contenido HTML del correo
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
          
          <a href="https://nidosky.com/mi-reserva" class="button">Ver mi Reserva</a>
          
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
      
      Información de Contacto:
      Teléfono: +57 300 123 4567
      Email: info@nidosky.com
      Dirección: Calle 10 #43E-25, El Poblado, Medellín, Colombia
      
      © ${new Date().getFullYear()} Nido Sky. Todos los derechos reservados.
      Este correo fue enviado a ${cliente.email} porque realizaste una reserva en Nido Sky.
    `

    // Configurar opciones del correo
    const mailOptions = {
      from: `"Nido Sky" <${process.env.EMAIL_USER || "dgoez2020@gmail.com"}>`,
      to: cliente.email,
      subject: "Confirmación de tu Reserva en Nido Sky",
      html: htmlContent,
      text: textContent, // Versión de texto plano
    }

    // Enviar el correo
    console.log("Enviando correo a:", cliente.email)
    const info = await transporter.sendMail(mailOptions)
    console.log("Correo enviado:", info.messageId)

    // Si estamos en modo de prueba, mostrar la URL de vista previa
    if (process.env.NODE_ENV === "development") {
      console.log("Vista previa URL:", nodemailer.getTestMessageUrl(info))
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error al enviar correo:", error)
    console.error("Detalles del error:")
    if (error.code) console.error("- Código:", error.code)
    if (error.command) console.error("- Comando:", error.command)
    if (error.response) console.error("- Respuesta:", error.response)

    return { success: false, error: error.message }
  }
}

// Función para enviar correo de recuperación de contraseña
exports.sendPasswordRecovery = async (email, resetToken) => {
  try {
    // Usar la URL del frontend o localhost por defecto
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recuperación de Contraseña - Nido Sky</title>
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
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nidosky-V3qv6QnKvcP2qqA4Vxok6rQ8wpnZi9.png" alt="Nido Sky Logo" class="logo">
          <h1>Recuperación de Contraseña</h1>
        </div>
        <div class="content">
          <p>Has solicitado restablecer tu contraseña para tu cuenta en Nido Sky.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          
          <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
          
          <p>Este enlace expirará en 1 hora por razones de seguridad.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá sin cambios.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Nido Sky. Todos los derechos reservados.</p>
          <p>Este correo fue enviado a ${email} porque se solicitó un restablecimiento de contraseña.</p>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: `"Nido Sky" <${process.env.EMAIL_USER || "dgoez2020@gmail.com"}>`,
      to: email,
      subject: "Recuperación de Contraseña - Nido Sky",
      html: htmlContent,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Correo de recuperación enviado:", info.messageId)

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error al enviar correo de recuperación:", error)
    return { success: false, error: error.message }
  }
}

module.exports = exports
