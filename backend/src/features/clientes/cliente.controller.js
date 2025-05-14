const Cliente = require("./cliente.model")
const Usuario = require("../usuarios/usuario.model")
const bcrypt = require("bcryptjs")
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

// Función para generar una contraseña aleatoria segura
const generateRandomPassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Crear un nuevo cliente (usado por el administrador)
exports.createCliente = async (req, res) => {
  const { nombre, documento, email, telefono } = req.body
  try {
    // Verificar si ya existe un cliente con ese documento o email
    let cliente = await Cliente.findOne({ $or: [{ documento }, { email }] })
    if (cliente) {
      return res.status(400).json({ msg: "El cliente ya existe" })
    }

    // Generar una contraseña aleatoria para el cliente
    const randomPassword = generateRandomPassword()
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(randomPassword, salt)

    cliente = new Cliente({
      nombre,
      documento,
      email,
      telefono,
      password: hashedPassword, // Añadir la contraseña hasheada
      rol: "cliente",
    })

    await cliente.save()
    res.status(201).json(cliente)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

// Registro público de clientes desde la landing page
exports.publicRegister = async (req, res) => {
  console.log("[PUBLIC REGISTER] Iniciando registro público de cliente:", req.body)

  const { nombre, documento, email, telefono, fechaEntrada, fechaSalida, huespedes, apartamento, precioPorNoche } =
    req.body

  try {
    // Verificar si ya existe un cliente con ese documento o email
    let cliente = await Cliente.findOne({ $or: [{ documento }, { email }] })
    const clienteExistente = !!cliente

    if (!cliente) {
      // Si no existe, crear nuevo cliente con contraseña aleatoria
      const randomPassword = crypto.randomBytes(4).toString("hex") // 8 caracteres alfanuméricos
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(randomPassword, salt)

      // Crear el cliente con la contraseña hasheada
      cliente = new Cliente({
        nombre,
        documento,
        email,
        telefono,
        password: hashedPassword, // Añadir la contraseña hasheada
        rol: "cliente",
      })

      await cliente.save()
      console.log("[PUBLIC REGISTER] Nuevo cliente creado:", cliente._id)
    } else {
      console.log("[PUBLIC REGISTER] Cliente existente encontrado:", cliente._id)
    }

    // Verificar si ya existe un usuario con ese email
    let usuario = await Usuario.findOne({ email })
    let nuevaContrasena = ""
    let esNuevoUsuario = false

    if (!usuario) {
      // Generar contraseña aleatoria simple (solo letras y números)
      nuevaContrasena = crypto.randomBytes(4).toString("hex") // 8 caracteres alfanuméricos
      console.log("[PUBLIC REGISTER] Contraseña generada para nuevo usuario:", nuevaContrasena)

      // Crear usuario con rol "cliente"
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(nuevaContrasena, salt)

      usuario = new Usuario({
        nombre,
        documento,
        email,
        telefono,
        password: hashedPassword,
        rol: "cliente",
      })

      await usuario.save()
      console.log("[PUBLIC REGISTER] Nuevo usuario creado:", usuario._id)
      esNuevoUsuario = true
    } else {
      console.log("[PUBLIC REGISTER] Usuario existente encontrado:", usuario._id)

      // Si el usuario existe pero estamos creando una nueva reserva, generamos una nueva contraseña temporal
      // para asegurarnos de que el cliente siempre reciba credenciales de acceso
      if (!clienteExistente) {
        nuevaContrasena = crypto.randomBytes(4).toString("hex") // 8 caracteres alfanuméricos
        console.log("[PUBLIC REGISTER] Contraseña temporal generada para usuario existente:", nuevaContrasena)

        // Actualizar la contraseña del usuario existente
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(nuevaContrasena, salt)
        usuario.password = hashedPassword
        await usuario.save()

        // Marcamos como nuevo usuario para que se envíe la contraseña
        esNuevoUsuario = true
      }
    }

    // Calcular noches y precio total
    const fechaIni = new Date(fechaEntrada)
    const fechaFin = new Date(fechaSalida)
    const diffTime = Math.abs(fechaFin - fechaIni)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const precioTotal = diffDays * precioPorNoche

    // Formatear fechas en español
    const opcionesFecha = { day: "2-digit", month: "2-digit", year: "numeric" }
    const fechaEntradaFormateada = new Date(fechaEntrada).toLocaleDateString("es-ES", opcionesFecha)
    const fechaSalidaFormateada = new Date(fechaSalida).toLocaleDateString("es-ES", opcionesFecha)

    // Formatear precios con separadores de miles
    const formatearPrecio = (precio) => {
      return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(
        precio,
      )
    }

    const precioPorNocheFormateado = formatearPrecio(precioPorNoche)
    const precioTotalFormateado = formatearPrecio(precioTotal)

    // Enviar correo de confirmación
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })

      // Preparar contenido del correo con diseño mejorado
      const contenidoHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Reserva - Hotel Nido Sky</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            
            body {
              font-family: 'Poppins', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            
            .email-header {
              background: linear-gradient(135deg, #0A2463 0%, #3E92CC 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            
            .logo {
              max-width: 150px;
              margin-bottom: 15px;
            }
            
            .email-title {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            
            .email-subtitle {
              margin: 10px 0 0;
              font-size: 16px;
              font-weight: 300;
              opacity: 0.9;
            }
            
            .email-body {
              padding: 30px;
              color: #444;
            }
            
            .greeting {
              font-size: 20px;
              margin-bottom: 20px;
              color: #0A2463;
            }
            
            .section {
              margin-bottom: 30px;
              background-color: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              border-left: 4px solid #3E92CC;
            }
            
            .section-title {
              margin-top: 0;
              margin-bottom: 15px;
              color: #0A2463;
              font-size: 18px;
              font-weight: 600;
              display: flex;
              align-items: center;
            }
            
            .section-title-icon {
              margin-right: 10px;
              width: 24px;
              height: 24px;
              vertical-align: middle;
            }
            
            .credentials-section {
              background-color: #fff8f8;
              border-left: 4px solid #D8315B;
            }
            
            .credentials-title {
              color: #D8315B;
            }
            
            .credentials-box {
              background-color: white;
              border: 1px solid #ffe0e0;
              border-radius: 6px;
              padding: 15px;
              margin-top: 15px;
            }
            
            .password-display {
              font-family: monospace;
              font-size: 24px;
              background-color: #f0f0f0;
              padding: 8px 12px;
              border-radius: 4px;
              color: #D8315B;
              font-weight: bold;
              letter-spacing: 1px;
              display: inline-block;
              margin: 10px 0;
              border: 1px dashed #D8315B;
            }
            
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            
            .detail-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            
            .detail-label {
              font-weight: 500;
              color: #666;
            }
            
            .detail-value {
              font-weight: 600;
              color: #333;
              text-align: right;
            }
            
            .total-row {
              font-size: 18px;
              color: #0A2463;
              margin-top: 15px;
              padding-top: 15px;
              border-top: 2px solid #eee;
            }
            
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #0A2463 0%, #3E92CC 100%);
              color: white;
              text-decoration: none;
              padding: 14px 30px;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
              box-shadow: 0 4px 6px rgba(10, 36, 99, 0.2);
              transition: all 0.3s ease;
              font-size: 16px;
              letter-spacing: 0.5px;
            }

            .button:hover {
              background: linear-gradient(135deg, #0A2463 0%, #3E92CC 80%);
              box-shadow: 0 6px 8px rgba(10, 36, 99, 0.3);
              transform: translateY(-2px);
            }

            .login-button {
              background: linear-gradient(135deg, #D8315B 0%, #FF7F51 100%);
              box-shadow: 0 4px 6px rgba(216, 49, 91, 0.2);
              display: block;
              width: 80%;
              margin: 20px auto;
              font-size: 18px;
              padding: 16px 30px;
            }

            .login-button:hover {
              background: linear-gradient(135deg, #D8315B 0%, #FF7F51 80%);
              box-shadow: 0 6px 8px rgba(216, 49, 91, 0.3);
            }
            
            .note {
              background-color: #f0f7ff;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              font-size: 14px;
              border-left: 4px solid #3E92CC;
            }
            
            .email-footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: #666;
              border-top: 1px solid #eee;
            }
            
            .social-links {
              margin: 15px 0;
            }
            
            .social-icon {
              display: inline-block;
              margin: 0 10px;
              width: 32px;
              height: 32px;
            }
            
            .contact-info {
              margin-top: 15px;
              font-size: 13px;
              color: #888;
            }
            
            @media only screen and (max-width: 600px) {
              .email-container {
                width: 100%;
                border-radius: 0;
              }
              
              .email-body {
                padding: 20px;
              }
              
              .section {
                padding: 15px;
              }
              
              .email-title {
                font-size: 24px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nidosky-V3qv6QnKvcP2qqA4Vxok6rQ8wpnZi9.png" alt="Hotel Nido Sky" class="logo">
              <h1 class="email-title">Confirmación de Reserva</h1>
              <p class="email-subtitle">¡Gracias por elegir Hotel Nido Sky!</p>
            </div>
            
            <div class="email-body">
              <p class="greeting">Hola, <strong>${nombre}</strong></p>
              
              <p>Nos complace confirmar tu reserva en Hotel Nido Sky. A continuación encontrarás todos los detalles.</p>
              
              <!-- Primero mostramos los detalles de la reserva -->
              <div class="section">
                <h3 class="section-title">
                  <img src="https://img.icons8.com/ios-filled/50/0A2463/calendar-plus.png" alt="Reserva" class="section-title-icon">
                  Detalles de la Reserva
                </h3>
                
                <div class="detail-row">
                  <span class="detail-label">Apartamento:</span>
                  <span class="detail-value">${apartamento}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha de entrada:</span>
                  <span class="detail-value">${fechaEntradaFormateada}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha de salida:</span>
                  <span class="detail-value">${fechaSalidaFormateada}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Noches:</span>
                  <span class="detail-value">${diffDays}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Huéspedes:</span>
                  <span class="detail-value">${huespedes}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Precio por noche:</span>
                  <span class="detail-value">${precioPorNocheFormateado}</span>
                </div>
                <div class="detail-row total-row">
                  <span class="detail-label">Precio total:</span>
                  <span class="detail-value">${precioTotalFormateado}</span>
                </div>
              </div>
              
              <div class="note">
                <strong>Nota importante:</strong> El check-in es a partir de las 15:00 y el check-out hasta las 12:00. Si necesitas un horario especial, por favor contáctanos con anticipación.
              </div>
              
              <!-- Después mostramos la información de acceso al sistema (si aplica) -->
              ${
                esNuevoUsuario && nuevaContrasena
                  ? `
              <div class="section credentials-section">
                <h3 class="section-title credentials-title">
                  <img src="https://img.icons8.com/ios-filled/50/D8315B/password.png" alt="Credenciales" class="section-title-icon">
                  Acceso a tu Cuenta
                </h3>
                <p>Hemos creado una cuenta para ti en nuestro sistema. Puedes acceder con las siguientes credenciales:</p>
                
                <div class="credentials-box">
                  <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${email}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Contraseña temporal:</span>
                    <span class="password-display">${nuevaContrasena}</span>
                  </div>
                </div>
                
                <p>Con tu cuenta podrás:</p>
                <ul style="margin-bottom: 20px;">
                  <li>Ver el historial de tus reservas</li>
                  <li>Realizar nuevas reservas con descuentos especiales</li>
                  <li>Acceder a promociones exclusivas</li>
                </ul>
                
                <a href="http://localhost:3000/login" class="button login-button">INGRESAR AL SISTEMA</a>
                
                <p style="text-align: center; margin-top: 15px; font-weight: 500; color: #D8315B;">
                  ¡Importante! Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión.
                </p>
                <p style="text-align: center; font-size: 14px; color: #666;">
                  Para cambiar tu contraseña, ve a "Mi Perfil" > "Cambiar Contraseña"
                </p>
              </div>
                  `
                  : ""
              }
              
              <p>Si tienes alguna pregunta o necesitas hacer cambios en tu reserva, no dudes en contactarnos al <strong>+57 300 123 4567</strong> o respondiendo a este correo.</p>
              
              <p>¡Esperamos darte la bienvenida pronto!</p>
              
              <p>Saludos cordiales,<br>
              <strong>Equipo de Hotel Nido Sky</strong></p>
            </div>
            
            <div class="email-footer">
              <div class="social-links">
                <a href="#"><img src="https://img.icons8.com/ios-filled/50/666666/facebook-new.png" alt="Facebook" class="social-icon"></a>
                <a href="#"><img src="https://img.icons8.com/ios-filled/50/666666/instagram-new.png" alt="Instagram" class="social-icon"></a>
                <a href="#"><img src="https://img.icons8.com/ios-filled/50/666666/twitter.png" alt="Twitter" class="social-icon"></a>
              </div>
              
              <div class="contact-info">
                <p>Calle 10 #43E-25, El Poblado, Medellín, Colombia<br>
                +57 300 123 4567 | info@nidosky.com<br>
                © ${new Date().getFullYear()} Hotel Nido Sky. Todos los derechos reservados.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      const mailOptions = {
        to: email,
        from: `"Hotel Nido Sky" <${process.env.EMAIL_USER}>`,
        subject: "Confirmación de Reserva - Hotel Nido Sky",
        html: contenidoHTML,
      }

      await transporter.sendMail(mailOptions)
      console.log("[PUBLIC REGISTER] Correo de confirmación enviado a:", email)

      // Enviar copia al administrador con la contraseña temporal destacada
      // Diseño mejorado para el correo del administrador
      const adminMailHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width:device-width, initial-scale=1.0">
          <title>[ADMIN] Nueva Reserva - Hotel Nido Sky</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            
            body {
              font-family: 'Poppins', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            
            .email-header {
              background: linear-gradient(135deg, #0A2463 0%, #3E92CC 100%);
              color: white;
              padding: 20px;
              text-align: center;
            }
            
            .admin-badge {
              background-color: #D8315B;
              color: white;
              padding: 5px 10px;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 600;
              display: inline-block;
              margin-bottom: 10px;
            }
            
            .email-title {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            
            .email-body {
              padding: 25px;
              color: #444;
            }
            
            .section {
              margin-bottom: 25px;
              background-color: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              border-left: 4px solid #3E92CC;
            }
            
            .section-title {
              margin-top: 0;
              margin-bottom: 15px;
              color: #0A2463;
              font-size: 18px;
              font-weight: 600;
              display: flex;
              align-items: center;
            }
            
            .section-title-icon {
              margin-right: 10px;
              width: 20px;
              height: 20px;
              vertical-align: middle;
            }
            
            .credentials-section {
              background-color: #fff8f8;
              border-left: 4px solid #D8315B;
            }
            
            .credentials-title {
              color: #D8315B;
            }
            
            .credentials-box {
              background-color: white;
              border: 1px solid #ffe0e0;
              border-radius: 6px;
              padding: 15px;
              margin-top: 15px;
            }
            
            .password-display {
              font-family: monospace;
              font-size: 24px;
              background-color: #f0f0f0;
              padding: 8px 12px;
              border-radius: 4px;
              color: #D8315B;
              font-weight: bold;
              letter-spacing: 1px;
              display: inline-block;
              margin: 10px 0;
              border: 1px dashed #D8315B;
            }
            
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            
            .detail-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            
            .detail-label {
              font-weight: 500;
              color: #666;
            }
            
            .detail-value {
              font-weight: 600;
              color: #333;
              text-align: right;
            }
            
            .total-row {
              font-size: 18px;
              color: #0A2463;
              margin-top: 15px;
              padding-top: 15px;
              border-top: 2px solid #eee;
            }
            
            .email-footer {
              background-color: #f8f9fa;
              padding: 15px;
              text-align: center;
              font-size: 13px;
              color: #666;
              border-top: 1px solid #eee;
            }
            
            @media only screen and (max-width: 600px) {
              .email-container {
                width: 100%;
                border-radius: 0;
              }
              
              .email-body {
                padding: 20px;
              }
              
              .section {
                padding: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <div class="admin-badge">COPIA ADMINISTRADOR</div>
              <h1 class="email-title">Nueva Reserva Registrada</h1>
            </div>
            
            <div class="email-body">
              ${
                esNuevoUsuario && nuevaContrasena
                  ? `
                  <div class="section credentials-section">
                    <h3 class="section-title credentials-title">
                      <img src="https://img.icons8.com/ios-filled/50/D8315B/password.png" alt="Credenciales" class="section-title-icon">
                      Información de Acceso (NUEVO USUARIO)
                    </h3>
                    <p>Se ha creado una nueva cuenta para este cliente con las siguientes credenciales:</p>
                    
                    <div class="credentials-box">
                      <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${email}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Contraseña temporal:</span>
                        <span class="password-display">${nuevaContrasena}</span>
                      </div>
                    </div>
                  </div>
                `
                  : `
                  <div class="section">
                    <h3 class="section-title">
                      <img src="https://img.icons8.com/ios-filled/50/0A2463/info-circle.png" alt="Info" class="section-title-icon">
                      Información de Usuario
                    </h3>
                    <p>Este cliente ya tenía una cuenta en el sistema.</p>
                  </div>
                `
              }
              
              <div class="section">
                <h3 class="section-title">
                  <img src="https://img.icons8.com/ios-filled/50/0A2463/user-male-circle.png" alt="Cliente" class="section-title-icon">
                  Detalles del Cliente
                </h3>
                
                <div class="detail-row">
                  <span class="detail-label">Nombre:</span>
                  <span class="detail-value">${nombre}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Documento:</span>
                  <span class="detail-value">${documento}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${email}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Teléfono:</span>
                  <span class="detail-value">${telefono}</span>
                </div>
              </div>
              
              <div class="section">
                <h3 class="section-title">
                  <img src="https://img.icons8.com/ios-filled/50/0A2463/calendar-plus.png" alt="Reserva" class="section-title-icon">
                  Detalles de la Reserva
                </h3>
                
                <div class="detail-row">
                  <span class="detail-label">Apartamento:</span>
                  <span class="detail-value">${apartamento}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha de entrada:</span>
                  <span class="detail-value">${fechaEntradaFormateada}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha de salida:</span>
                  <span class="detail-value">${fechaSalidaFormateada}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Noches:</span>
                  <span class="detail-value">${diffDays}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Huéspedes:</span>
                  <span class="detail-value">${huespedes}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Precio por noche:</span>
                  <span class="detail-value">${precioPorNocheFormateado}</span>
                </div>
                <div class="detail-row total-row">
                  <span class="detail-label">Precio total:</span>
                  <span class="detail-value">${precioTotalFormateado}</span>
                </div>
              </div>
            </div>
            
            <div class="email-footer">
              <p>Este es un correo automático para el administrador.<br>
              © ${new Date().getFullYear()} Hotel Nido Sky. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `

      const adminMailOptions = {
        to: process.env.EMAIL_USER,
        from: `"Hotel Nido Sky" <${process.env.EMAIL_USER}>`,
        subject: `[ADMIN] Nueva reserva de ${nombre}`,
        html: adminMailHTML,
      }

      await transporter.sendMail(adminMailOptions)
      console.log("[PUBLIC REGISTER] Copia del correo enviada al administrador")
    } catch (emailError) {
      console.error("[PUBLIC REGISTER] Error al enviar correo:", emailError)
      // No fallamos si el correo no se envía
    }

    res.status(201).json({
      msg: "Reserva registrada correctamente. Se ha enviado un correo con los detalles.",
      clienteId: cliente._id,
      esNuevoUsuario,
    })
  } catch (error) {
    console.error("[PUBLIC REGISTER] Error:", error)
    res.status(500).json({ msg: "Error en el servidor al procesar la solicitud" })
  }
}

// Listar todos los clientes
exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find()
    res.json(clientes)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

// Obtener un cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id)
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" })
    }
    res.json(cliente)
  } catch (error) {
    console.error(error)
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Cliente no encontrado" })
    }
    res.status(500).send("Error en el servidor")
  }
}

// Actualizar un cliente
exports.updateCliente = async (req, res) => {
  const { nombre, documento, email, telefono } = req.body
  try {
    const cliente = await Cliente.findById(req.params.id)
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" })
    }

    // Verificar si el nuevo email o documento ya existe en otro cliente
    if (email !== cliente.email || documento !== cliente.documento) {
      const existingCliente = await Cliente.findOne({
        $or: [
          { email, _id: { $ne: req.params.id } },
          { documento, _id: { $ne: req.params.id } },
        ],
      })
      if (existingCliente) {
        return res.status(400).json({ msg: "El email o documento ya está en uso por otro cliente" })
      }
    }

    cliente.nombre = nombre
    cliente.documento = documento
    cliente.email = email
    cliente.telefono = telefono

    await cliente.save()
    res.json(cliente)
  } catch (error) {
    console.error(error)
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Cliente no encontrado" })
    }
    res.status(500).send("Error en el servidor")
  }
}

// Eliminar un cliente - VERSIÓN FORZADA
exports.deleteCliente = async (req, res) => {
  console.log(`[DELETE CLIENTE FORZADO] Iniciando eliminación del cliente con ID: ${req.params.id}`);
  
  try {
    // Verificar si el cliente existe
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      console.log(`[DELETE CLIENTE FORZADO] Cliente con ID ${req.params.id} no encontrado`);
      return res.status(404).json({ msg: "Cliente no encontrado" });
    }

    console.log(`[DELETE CLIENTE FORZADO] Cliente encontrado: ${cliente.nombre} (${cliente.email})`);
    console.log(`[DELETE CLIENTE FORZADO] Documento: ${cliente.documento || 'No disponible'}`);
    
    // Importar el modelo Reserva
    const Reserva = require("../reservas/reserva.model");
    
    // Buscar todas las reservas asociadas al cliente (solo para logging)
    const todasLasReservas = await Reserva.find({
      $or: [
        { email: cliente.email },
        { titular_documento: cliente.documento },
        { documento: cliente.documento }
      ]
    });
    
    console.log(`[DELETE CLIENTE FORZADO] Se encontraron ${todasLasReservas.length} reservas en total`);
    
    // Mostrar detalles de cada reserva para depuración
    if (todasLasReservas.length > 0) {
      console.log('[DELETE CLIENTE FORZADO] Detalles de las reservas encontradas:');
      todasLasReservas.forEach((reserva, index) => {
        console.log(`[DELETE CLIENTE FORZADO] Reserva #${index + 1}:`);
        console.log(`  - ID: ${reserva._id}`);
        console.log(`  - Email: ${reserva.email}`);
        console.log(`  - Titular: ${reserva.titular_reserva}`);
        console.log(`  - Documento: ${reserva.titular_documento || reserva.documento}`);
        console.log(`  - Estado: ${reserva.estado || 'No definido'}`);
      });
    }
    
    // Contar reservas confirmadas (solo para logging)
    const reservasConfirmadas = todasLasReservas.filter(r => r.estado === "confirmada");
    console.log(`[DELETE CLIENTE FORZADO] De las cuales ${reservasConfirmadas.length} están confirmadas`);
    
    // IMPORTANTE: Procedemos con la eliminación SIN IMPORTAR si tiene reservas confirmadas
    console.log(`[DELETE CLIENTE FORZADO] Procediendo a eliminar el cliente ${cliente._id} de forma forzada`);
    
    // Usar deleteOne para eliminar directamente
    const resultado = await Cliente.deleteOne({ _id: req.params.id });
    
    console.log(`[DELETE CLIENTE FORZADO] Resultado de la eliminación:`, resultado);
    
    if (resultado.deletedCount === 0) {
      console.log(`[DELETE CLIENTE FORZADO] No se pudo eliminar el cliente ${cliente._id}`);
      return res.status(500).json({ 
        msg: "No se pudo eliminar el cliente", 
        error: true 
      });
    }
    
    // Devolver respuesta exitosa con información adicional
    res.json({ 
      msg: "Cliente eliminado correctamente",
      eliminacionForzada: reservasConfirmadas.length > 0,
      reservasEncontradas: todasLasReservas.length,
      reservasConfirmadas: reservasConfirmadas.length,
      resultado
    });
    
  } catch (error) {
    console.error("[DELETE CLIENTE FORZADO] Error al eliminar cliente:", error);
    
    // Verificar si es un error de ID inválido
    if (error.name === "CastError" || error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Cliente no encontrado - ID inválido" });
    }
    
    // Devolver información detallada del error
    res.status(500).json({ 
      msg: "Error en el servidor al eliminar el cliente", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtener el perfil del cliente (para que el propio cliente consulte su información)
exports.getProfile = async (req, res) => {
  try {
    // Se asume que el token contiene el id del cliente en req.usuario.id
    const cliente = await Cliente.findById(req.usuario.id)
    if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado" })
    res.json(cliente)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

// Cambiar contraseña del cliente
exports.cambiarPassword = async (req, res) => {
  const { passwordActual, nuevoPassword } = req.body

  try {
    // Obtener el ID del cliente desde el token de autenticación
    const clienteId = req.usuario.id

    // Buscar el cliente en la base de datos
    const cliente = await Cliente.findById(clienteId)
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" })
    }

    // Verificar la contraseña actual
    const validPassword = bcrypt.compareSync(passwordActual, cliente.password)
    if (!validPassword) {
      return res.status(400).json({ msg: "La contraseña actual es incorrecta" })
    }

    // Encriptar la nueva contraseña
    const salt = bcrypt.genSaltSync()
    const nuevoPasswordEncriptado = bcrypt.hashSync(nuevoPassword, salt)

    // Actualizar la contraseña del cliente
    cliente.password = nuevoPasswordEncriptado
    await cliente.save()

    // También actualizar la contraseña en la tabla de usuarios si existe
    const usuario = await Usuario.findOne({ email: cliente.email })
    if (usuario) {
      usuario.password = nuevoPasswordEncriptado
      await usuario.save()
      console.log(`[CAMBIAR PASSWORD] Contraseña actualizada también para el usuario con email ${cliente.email}`)
    }

    res.json({
      ok: true,
      msg: "Contraseña actualizada correctamente",
    })
  } catch (error) {
    console.error("[CAMBIAR PASSWORD] Error:", error)
    res.status(500).json({ msg: "Error en el servidor al cambiar la contraseña" })
  }
}

// Obtiene las reservas de un cliente por su documento
exports.obtenerReservasCliente = async (req, res) => {
  try {
    // Obtener el documento del usuario autenticado
    const documentoCliente = req.usuario.documento

    if (!documentoCliente) {
      return res.status(400).json({
        msg: "No se pudo identificar el documento del cliente",
        error: true,
      })
    }

    console.log(`[CLIENTE RESERVAS] Buscando reservas para el cliente con documento: ${documentoCliente}`)

    // Importar el modelo Reserva
    const Reserva = require("../reservas/reserva.model")

    // Buscar todas las reservas donde el documento del titular coincida con el del cliente
    const reservas = await Reserva.find({
      $or: [
        // Buscar por documento en el campo titular_documento (si existe)
        { titular_documento: documentoCliente },
        // O buscar por documento en el campo documento (si existe)
        { documento: documentoCliente },
      ],
    })
      .populate("apartamentos")
      .sort({ fecha_inicio: -1 }) // Ordenar por fecha de inicio (más recientes primero)

    console.log(`[CLIENTE RESERVAS] Se encontraron ${reservas.length} reservas`)

    res.status(200).json({
      reservas,
      error: false,
    })
  } catch (error) {
    console.error("[CLIENTE RESERVAS] Error al obtener reservas del cliente:", error)
    res.status(500).json({
      msg: "Error en el servidor al obtener las reservas del cliente",
      error: true,
      details: error.message,
    })
  }
}

// Nueva función para obtener las reservas del cliente autenticado
exports.getMisReservas = async (req, res) => {
  try {
    console.log("Obteniendo reservas del cliente autenticado")

    // Obtener el token del encabezado de autorización
    const token = req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return res.status(401).json({ msg: "No hay token, autorización denegada" })
    }

    // Decodificar el token para obtener la información del usuario
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "palabrasecreta")
    const usuarioId = decoded.usuario?._id || decoded.usuario?.id || decoded.uid
    const usuarioEmail = decoded.usuario?.email
    const usuarioDocumento = decoded.usuario?.documento

    if (!usuarioId && !usuarioEmail && !usuarioDocumento) {
      return res.status(401).json({ msg: "Token inválido" })
    }

    console.log("Información del usuario del token:", {
      id: usuarioId,
      email: usuarioEmail,
      documento: usuarioDocumento,
    })

    // Buscar el cliente por el ID de usuario, email o documento
    let cliente

    if (usuarioEmail) {
      console.log("Buscando cliente por email:", usuarioEmail)
      cliente = await Cliente.findOne({ email: usuarioEmail })
    }

    // Si no se encontró por email, buscar por documento
    if (!cliente && usuarioDocumento) {
      console.log("Buscando cliente por documento:", usuarioDocumento)
      cliente = await Cliente.findOne({ documento: usuarioDocumento })
    }

    // Si aún no se encuentra, intentar buscar por ID
    if (!cliente && usuarioId) {
      console.log("Buscando cliente por ID de usuario:", usuarioId)
      cliente = await Cliente.findOne({ _id: usuarioId })
    }

    if (!cliente) {
      console.log("No se encontró el cliente asociado al usuario")
      return res.status(404).json({ msg: "No se encontró el cliente asociado a este usuario" })
    }

    console.log("Cliente encontrado:", cliente._id)

    // Importar el modelo Reserva
    const Reserva = require("../reservas/reserva.model")
    const Apartamento = require("../apartamento/apartamento.model")

    // Buscar las reservas del cliente por documento, email o nombre
    const query = {
      $or: [{ email: cliente.email }, { titular_reserva: cliente.nombre }],
    }

    // Si el cliente tiene documento, agregarlo a la consulta
    if (cliente.documento) {
      query.$or.push({ titular_documento: cliente.documento })
      query.$or.push({ documento: cliente.documento })
    }

    console.log("Consultando reservas con:", JSON.stringify(query))

    // Obtener las reservas y poblar los datos de apartamentos
    const reservas = await Reserva.find(query)
      .populate({
        path: "apartamentos",
        model: Apartamento,
      })
      .sort({ fecha_inicio: -1 })

    console.log(`Se encontraron ${reservas.length} reservas para el cliente`)

    // Procesar las reservas para mostrar exactamente los mismos datos que en el correo
    const reservasFormateadas = reservas.map((reserva) => {
      // Convertir el documento Mongoose a un objeto plano
      const reservaObj = reserva.toObject()

      // Información del apartamento
      let apartamentoInfo = "Apartamento"
      let precioPorNoche = 0

      // Verificar si hay apartamentos en la reserva
      if (reservaObj.apartamentos && reservaObj.apartamentos.length > 0) {
        const apartamento = reservaObj.apartamentos[0]
        console.log("Datos del apartamento:", JSON.stringify(apartamento, null, 2))

        // Obtener el número y tipo del apartamento (si existen)
        if (apartamento.NumeroApto !== undefined && apartamento.Tipo) {
          apartamentoInfo = `${apartamento.NumeroApto} - ${apartamento.Tipo}`
        } else if (apartamento.NumeroApto !== undefined) {
          apartamentoInfo = `${apartamento.NumeroApto}`
        } else if (apartamento.Tipo) {
          apartamentoInfo = apartamento.Tipo
        }

        // Obtener el precio por noche
        precioPorNoche = apartamento.Tarifa || 0
      }

      // Calcular noches de estancia
      let nochesEstadia = reservaObj.noches_estadia
      if (!nochesEstadia && reservaObj.fecha_inicio && reservaObj.fecha_fin) {
        const fechaInicio = new Date(reservaObj.fecha_inicio)
        const fechaFin = new Date(reservaObj.fecha_fin)
        const diffTime = Math.abs(fechaFin - fechaInicio)
        nochesEstadia = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }

      // Calcular precio total
      let precioTotal = reservaObj.total
      if (!precioTotal && nochesEstadia && precioPorNoche) {
        precioTotal = nochesEstadia * precioPorNoche
      }

      // Formatear fechas en español
      const formatearFecha = (fecha) => {
        if (!fecha) return "Fecha no disponible"

        const opciones = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
        return new Date(fecha).toLocaleDateString("es-ES", opciones)
      }

      // Crear objeto con los datos exactos que se muestran en el correo
      const detallesReserva = {
        apartamento: apartamentoInfo,
        fechaEntrada: formatearFecha(reservaObj.fecha_inicio),
        fechaSalida: formatearFecha(reservaObj.fecha_fin),
        numeroNoches: nochesEstadia || 0,
        huespedes: reservaObj.acompanantes?.length + 1 || 1, // +1 por el titular
        precioPorNoche: precioPorNoche,
        precioTotal: precioTotal || 0,
      }

      return {
        ...reservaObj,
        detallesReserva,
        // Mantener estos campos para compatibilidad con el frontend
        apartamentoInfo,
        precioPorNoche,
        nochesEstadia,
        precioTotal,
      }
    })

    console.log("Reservas formateadas con los datos reales del apartamento")
    return res.json(reservasFormateadas)
  } catch (error) {
    console.error("Error al obtener las reservas del cliente:", error)
    return res.status(500).json({
      msg: "Error al obtener las reservas",
      error: error.message,
    })
  }
}

// Endpoint de diagnóstico para verificar reservas de un cliente
exports.diagnosticoReservasCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    
    console.log(`[DIAGNOSTICO] Iniciando diagnóstico para cliente ID: ${clienteId}`);
    
    // Verificar si el cliente existe
    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      console.log(`[DIAGNOSTICO] Cliente con ID ${clienteId} no encontrado`);
      return res.status(404).json({ 
        msg: "Cliente no encontrado",
        error: true 
      });
    }
    
    console.log(`[DIAGNOSTICO] Cliente encontrado: ${cliente.nombre} (${cliente.email})`);
    console.log(`[DIAGNOSTICO] Documento: ${cliente.documento || 'No disponible'}`);
    
    // Importar el modelo Reserva
    const Reserva = require("../reservas/reserva.model");
    
    // Buscar todas las reservas asociadas al cliente
    const todasLasReservas = await Reserva.find({
      $or: [
        { email: cliente.email },
        { titular_documento: cliente.documento },
        { documento: cliente.documento }
      ]
    });
    
    console.log(`[DIAGNOSTICO] Se encontraron ${todasLasReservas.length} reservas en total`);
    
    // Agrupar reservas por estado
    const reservasPorEstado = {
      pendientes: [],
      confirmadas: [],
      canceladas: []
    };
    
    // Procesar cada reserva
    todasLasReservas.forEach(reserva => {
      const estado = reserva.estado || 'pendiente';
      
      // Crear un objeto simplificado de la reserva
      const reservaSimplificada = {
        id: reserva._id,
        numero_reserva: reserva.numero_reserva,
        titular: reserva.titular_reserva,
        email: reserva.email,
        documento: reserva.titular_documento || reserva.documento,
        fecha_inicio: reserva.fecha_inicio,
        fecha_fin: reserva.fecha_fin,
        estado: estado,
        total: reserva.total
      };
      
      // Agregar a la categoría correspondiente
      if (estado === 'confirmada') {
        reservasPorEstado.confirmadas.push(reservaSimplificada);
      } else if (estado === 'cancelada') {
        reservasPorEstado.canceladas.push(reservaSimplificada);
      } else {
        reservasPorEstado.pendientes.push(reservaSimplificada);
      }
    });
    
    // Preparar respuesta
    const respuesta = {
      cliente: {
        id: cliente._id,
        nombre: cliente.nombre,
        email: cliente.email,
        documento: cliente.documento,
        telefono: cliente.telefono
      },
      resumen: {
        total_reservas: todasLasReservas.length,
        confirmadas: reservasPorEstado.confirmadas.length,
        pendientes: reservasPorEstado.pendientes.length,
        canceladas: reservasPorEstado.canceladas.length
      },
      puede_eliminar: reservasPorEstado.confirmadas.length === 0,
      reservas: reservasPorEstado
    };
    
    console.log(`[DIAGNOSTICO] Diagnóstico completado. Cliente ${respuesta.puede_eliminar ? 'PUEDE' : 'NO PUEDE'} ser eliminado`);
    
    return res.status(200).json(respuesta);
    
  } catch (error) {
    console.error("[DIAGNOSTICO] Error:", error);
    return res.status(500).json({
      msg: "Error al realizar el diagnóstico",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Actualizar el cliente y el usuario correspondiente
exports.updateClienteAndUsuario = async (req, res) => {
  const { nombre, documento, email, telefono } = req.body;
  const { id } = req.params;

  try {
    // Verificar si el cliente existe
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" });
    }

    // Verificar si el nuevo email o documento ya existe en otro cliente
    if (email !== cliente.email || documento !== cliente.documento) {
      const existingCliente = await Cliente.findOne({
        $or: [
          { email, _id: { $ne: id } },
          { documento, _id: { $ne: id } },
        ],
      });
      if (existingCliente) {
        return res.status(400).json({ msg: "El email o documento ya está en uso por otro cliente" });
      }
    }

    // Actualizar el cliente
    cliente.nombre = nombre;
    cliente.documento = documento;
    cliente.email = email;
    cliente.telefono = telefono;

    await cliente.save();

    // Buscar y actualizar el usuario correspondiente si existe
    const usuario = await Usuario.findOne({ email: cliente.email });
    if (usuario) {
      usuario.nombre = nombre;
      usuario.documento = documento;
      usuario.telefono = telefono;
      // No actualizamos el email del usuario para mantener la coherencia con el login
      await usuario.save();
      console.log(`[UPDATE CLIENTE] Usuario con email ${cliente.email} también actualizado`);
    }

    res.json({
      msg: "Cliente actualizado correctamente",
      cliente
    });
  } catch (error) {
    console.error("[UPDATE CLIENTE] Error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Cliente no encontrado - ID inválido" });
    }
    res.status(500).json({ 
      msg: "Error en el servidor al actualizar el cliente",
      error: error.message
    });
  }
}

// Verificar si un cliente puede ser eliminado
exports.verificarEliminacion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el cliente existe
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" });
    }
    
    // Importar el modelo Reserva
    const Reserva = require("../reservas/reserva.model");
    
    // Buscar reservas confirmadas
    const reservasConfirmadas = await Reserva.find({
      $or: [
        { email: cliente.email },
        { titular_documento: cliente.documento },
        { documento: cliente.documento }
      ],
      estado: "confirmada"
    });
    
    const puedeEliminar = reservasConfirmadas.length === 0;
    
    res.json({
      puedeEliminar,
      reservasConfirmadas: reservasConfirmadas.length,
      msg: puedeEliminar 
        ? "El cliente puede ser eliminado" 
        : `El cliente tiene ${reservasConfirmadas.length} reservas confirmadas y no puede ser eliminado`
    });
    
  } catch (error) {
    console.error("[VERIFICAR ELIMINACION] Error:", error);
    res.status(500).json({ 
      msg: "Error al verificar si el cliente puede ser eliminado",
      error: error.message
    });
  }
}

// Buscar clientes por nombre, email o documento
exports.buscarClientes = async (req, res) => {
  try {
    const { termino } = req.params;
    
    if (!termino || termino.trim() === '') {
      return res.status(400).json({ msg: "El término de búsqueda es requerido" });
    }
    
    // Crear expresión regular para búsqueda insensible a mayúsculas/minúsculas
    const regex = new RegExp(termino, 'i');
    
    // Buscar clientes que coincidan con el término en nombre, email o documento
    const clientes = await Cliente.find({
      $or: [
        { nombre: regex },
        { email: regex },
        { documento: regex }
      ]
    }).limit(10); // Limitar a 10 resultados
    
    res.json(clientes);
    
  } catch (error) {
    console.error("[BUSCAR CLIENTES] Error:", error);
    res.status(500).json({ 
      msg: "Error al buscar clientes",
      error: error.message
    });
  }
}

// Obtener estadísticas de clientes
exports.getEstadisticasClientes = async (req, res) => {
  try {
    // Total de clientes
    const totalClientes = await Cliente.countDocuments();
    
    // Clientes nuevos en el último mes
    const fechaUnMesAtras = new Date();
    fechaUnMesAtras.setMonth(fechaUnMesAtras.getMonth() - 1);
    
    const clientesNuevos = await Cliente.countDocuments({
      createdAt: { $gte: fechaUnMesAtras }
    });
    
    // Importar el modelo Reserva
    const Reserva = require("../reservas/reserva.model");
    
    // Clientes con reservas
    const clientesConReservas = await Reserva.distinct('email').length;
    
    // Clientes sin reservas
    const clientesSinReservas = totalClientes - clientesConReservas;
    
    res.json({
      totalClientes,
      clientesNuevos,
      clientesConReservas,
      clientesSinReservas,
      porcentajeNuevos: totalClientes > 0 ? (clientesNuevos / totalClientes) * 100 : 0,
      porcentajeConReservas: totalClientes > 0 ? (clientesConReservas / totalClientes) * 100 : 0
    });
    
  } catch (error) {
    console.error("[ESTADISTICAS CLIENTES] Error:", error);
    res.status(500).json({ 
      msg: "Error al obtener estadísticas de clientes",
      error: error.message
    });
  }
}

// Exportar cliente a Excel/CSV
exports.exportarClientes = async (req, res) => {
  try {
    // Obtener todos los clientes
    const clientes = await Cliente.find({}, {
      nombre: 1,
      documento: 1,
      email: 1,
      telefono: 1,
      createdAt: 1
    });
    
    // Formatear los datos para CSV
    let csvData = "Nombre,Documento,Email,Teléfono,Fecha de Registro\n";
    
    clientes.forEach(cliente => {
      const fechaRegistro = cliente.createdAt 
        ? new Date(cliente.createdAt).toLocaleDateString() 
        : 'No disponible';
        
      csvData += `"${cliente.nombre}","${cliente.documento}","${cliente.email}","${cliente.telefono}","${fechaRegistro}"\n`;
    });
    
    // Configurar cabeceras para descarga
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=clientes.csv');
    
    // Enviar el CSV
    res.send(csvData);
    
  } catch (error) {
    console.error("[EXPORTAR CLIENTES] Error:", error);
    res.status(500).json({ 
      msg: "Error al exportar clientes",
      error: error.message
    });
  }
};