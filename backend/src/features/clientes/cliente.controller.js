const Cliente = require("./cliente.model")
const Usuario = require("../usuarios/usuario.model")
const bcrypt = require("bcryptjs")
const nodemailer = require("nodemailer")
const crypto = require("crypto")

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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
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

// Eliminar un cliente
exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id)
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" })
    }

    await cliente.remove()
    res.json({ msg: "Cliente eliminado" })
  } catch (error) {
    console.error(error)
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Cliente no encontrado" })
    }
    res.status(500).send("Error en el servidor")
  }
}

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
