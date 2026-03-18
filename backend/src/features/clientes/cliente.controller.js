const Cliente = require("./cliente.model")
const Usuario = require("../usuarios/usuario.model")
const bcrypt = require("bcryptjs")
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

// Expresiones regulares para validaciones
const REGEX = {
  SOLO_NUMEROS: /^\d+$/,
  SOLO_LETRAS_ESPACIOS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_INVALIDO: /@\.com|@com\.|@\.|\.@|@-|-@|@.*@|\.\.|,,|@@/,
  CONTRASENA_FUERTE: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,15}$/,
  SECUENCIAS_COMUNES: /123456|654321|password|qwerty|abc123|admin123|123abc|contraseña|usuario|admin/i,
  CARACTERES_REPETIDOS: /(.)\1{3,}/,
  SECUENCIAS_NUMERICAS: /123456|654321|111111|222222|333333|444444|555555|666666|777777|888888|999999|000000/,
}

// Constantes para validaciones
const VALIDACION = {
  DOCUMENTO: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 15,
  },
  NOMBRE: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 30,
  },
  TELEFONO: {
    MIN_LENGTH: 7,
    MAX_LENGTH: 10,
  },
  CONTRASENA: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 15,
  },
}

// Funciones de validación
const validarDocumento = (documento) => {
  if (!documento) return "El documento es obligatorio"
  if (documento.trim() === "") return "El documento no puede estar vacío"
  if (!REGEX.SOLO_NUMEROS.test(documento)) return "El documento debe contener solo números"
  if (documento.length < VALIDACION.DOCUMENTO.MIN_LENGTH) return "El documento debe tener al menos 6 dígitos"
  if (documento.length > VALIDACION.DOCUMENTO.MAX_LENGTH) return "El documento no puede tener más de 15 dígitos"
  if (REGEX.CARACTERES_REPETIDOS.test(documento))
    return "El documento no puede contener más de 3 dígitos repetidos consecutivos"
  if (REGEX.SECUENCIAS_NUMERICAS.test(documento)) return "El documento no puede contener secuencias numéricas obvias"
  if (/^0+$/.test(documento)) return "El documento no puede contener solo ceros"
  if (Number.parseInt(documento) < 1000) return "El documento no parece válido (valor muy bajo)"
  return null
}

const validarNombre = (nombre) => {
  if (!nombre) return "El nombre es obligatorio"
  if (nombre.trim() === "") return "El nombre no puede estar vacío"
  if (nombre.length < VALIDACION.NOMBRE.MIN_LENGTH) return "El nombre debe tener al menos 6 caracteres"
  if (nombre.length > VALIDACION.NOMBRE.MAX_LENGTH) return "El nombre no puede tener más de 30 caracteres"
  if (!REGEX.SOLO_LETRAS_ESPACIOS.test(nombre)) return "El nombre solo debe contener letras y espacios"
  if (/\s{2,}/.test(nombre)) return "El nombre no puede contener espacios múltiples consecutivos"
  const palabras = nombre.trim().split(/\s+/)
  if (palabras.length < 2) return "Debe ingresar al menos nombre y apellido"
  for (const palabra of palabras) {
    if (palabra.length < 2) return "Cada palabra del nombre debe tener al menos 2 caracteres"
  }
  const palabrasProhibidas = ["admin", "usuario", "test", "prueba", "administrador"]
  for (const prohibida of palabrasProhibidas) {
    if (nombre.toLowerCase().includes(prohibida)) return "El nombre contiene palabras no permitidas"
  }
  return null
}

const validarTelefono = (telefono) => {
  if (!telefono) return "El teléfono es obligatorio"
  if (telefono.trim() === "") return "El teléfono no puede estar vacío"
  if (!REGEX.SOLO_NUMEROS.test(telefono)) return "El teléfono debe contener solo números"
  if (telefono.length < VALIDACION.TELEFONO.MIN_LENGTH) return "El teléfono debe tener al menos 7 dígitos"
  if (telefono.length > VALIDACION.TELEFONO.MAX_LENGTH) return "El teléfono no puede tener más de 10 dígitos"
  if (REGEX.CARACTERES_REPETIDOS.test(telefono))
    return "El teléfono no puede contener más de 3 dígitos repetidos consecutivos"
  if (REGEX.SECUENCIAS_NUMERICAS.test(telefono)) return "El teléfono no puede contener secuencias numéricas obvias"
  if (/^0+$/.test(telefono)) return "El teléfono no puede contener solo ceros"
  const numerosEspeciales = ["123", "911", "112", "119"]
  if (numerosEspeciales.includes(telefono)) return "No se permite el uso de números de emergencia"
  return null
}

const validarEmail = (email) => {
  if (!email) return "El correo electrónico es obligatorio"
  if (email.trim() === "") return "El correo electrónico no puede estar vacío"
  if (!REGEX.EMAIL.test(email)) return "Formato de correo electrónico inválido"
  if (REGEX.EMAIL_INVALIDO.test(email)) return "El correo contiene patrones inválidos (como @.com, @., etc.)"
  if (email.length < 6) return "El correo debe tener al menos 6 caracteres"
  if (email.length > 50) return "El correo no puede tener más de 50 caracteres"
  const [localPart, domainPart] = email.split("@")
  if (!localPart || localPart.length < 1) return "La parte local del correo no puede estar vacía"
  if (localPart.length > 64) return "La parte local del correo es demasiado larga"
  if (/^[.-]|[.-]$/.test(localPart)) return "La parte local no puede comenzar ni terminar con puntos o guiones"
  if (!domainPart || !domainPart.includes("."))
    return "El dominio del correo debe incluir una extensión (ej: .com, .net)"
  const domainParts = domainPart.split(".")
  for (let i = 0; i < domainParts.length; i++) {
    const part = domainParts[i]
    if (part.length === 0 || !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(part)) {
      return "El dominio del correo contiene partes inválidas"
    }
  }
  const tld = domainParts[domainParts.length - 1]
  if (!tld || tld.length < 2 || tld.length > 6 || !/^[a-zA-Z]+$/.test(tld)) {
    return "La extensión del dominio no es válida o contiene caracteres no permitidos"
  }
  const dominiosNoRecomendados = ["tempmail", "mailinator", "guerrillamail", "10minutemail", "yopmail"]
  for (const dominio of dominiosNoRecomendados) {
    if (domainPart.toLowerCase().includes(dominio)) return "No se permiten correos de servicios temporales"
  }
  return null
}

const validarPassword = (password) => {
  if (!password) return "La contraseña es obligatoria"
  if (password.length < VALIDACION.CONTRASENA.MIN_LENGTH) return "La contraseña debe tener al menos 8 caracteres"
  if (password.length > VALIDACION.CONTRASENA.MAX_LENGTH) return "La contraseña no puede tener más de 15 caracteres"
  if (!/[a-z]/.test(password)) return "La contraseña debe contener al menos una letra minúscula"
  if (!/[A-Z]/.test(password)) return "La contraseña debe contener al menos una letra mayúscula"
  if (!/[0-9]/.test(password)) return "La contraseña debe contener al menos un número"
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    return "La contraseña debe contener al menos un carácter especial"
  if (REGEX.SECUENCIAS_COMUNES.test(password))
    return "La contraseña no puede contener secuencias comunes o palabras fáciles de adivinar"
  if (REGEX.CARACTERES_REPETIDOS.test(password))
    return "La contraseña no puede contener más de 3 caracteres repetidos consecutivos"
  if (/qwert|asdfg|zxcvb|12345|09876/.test(password.toLowerCase()))
    return "La contraseña no puede contener secuencias de teclado"
  return null
}

const generateRandomPassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

exports.createCliente = async (req, res) => {
  const { nombre, documento, email, telefono, password } = req.body
  try {
    const errorDocumento = validarDocumento(documento)
    if (errorDocumento) return res.status(400).json({ msg: errorDocumento })

    const errorNombre = validarNombre(nombre)
    if (errorNombre) return res.status(400).json({ msg: errorNombre })

    const errorTelefono = validarTelefono(telefono)
    if (errorTelefono) return res.status(400).json({ msg: errorTelefono })

    const errorEmail = validarEmail(email)
    if (errorEmail) return res.status(400).json({ msg: errorEmail })

    let cliente = await Cliente.findOne({ $or: [{ documento }, { email }] })
    if (cliente) {
      return res.status(400).json({ msg: "El cliente ya existe" })
    }

    let hashedPassword
    let randomPassword = null

    if (password) {
      const errorPassword = validarPassword(password)
      if (errorPassword) return res.status(400).json({ msg: errorPassword })
      const salt = await bcrypt.genSalt(10)
      hashedPassword = await bcrypt.hash(password, salt)
    } else {
      randomPassword = generateRandomPassword()
      const salt = await bcrypt.genSalt(10)
      hashedPassword = await bcrypt.hash(randomPassword, salt)
    }

    cliente = new Cliente({
      nombre,
      documento,
      email,
      telefono,
      password: hashedPassword,
      rol: "cliente",
      estado: true,
    })

    await cliente.save()

    let usuario = await Usuario.findOne({ email })

    if (!usuario) {
      usuario = new Usuario({
        nombre,
        documento,
        email,
        telefono,
        password: hashedPassword,
        rol: "cliente",
        estado: true,
      })
      await usuario.save()
      console.log(`Usuario creado automáticamente con ID: ${usuario._id}`)
    } else {
      usuario.nombre = nombre
      usuario.documento = documento
      usuario.telefono = telefono
      usuario.password = hashedPassword
      usuario.rol = "cliente"
      usuario.estado = true
      await usuario.save()
      console.log(`Usuario existente actualizado con rol "cliente", ID: ${usuario._id}`)
    }

    const respuesta = {
      cliente,
      msg: "Cliente creado correctamente.",
    }

    if (randomPassword) {
      respuesta.passwordTemporal = randomPassword
      respuesta.msg = "Cliente creado correctamente. Guarde la contraseña temporal para compartirla con el cliente."
    }

    res.status(201).json(respuesta)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

exports.publicRegister = async (req, res) => {
  console.log("[PUBLIC REGISTER] Iniciando registro público de cliente:", req.body)

  const { nombre, documento, email, telefono, fechaEntrada, fechaSalida, huespedes, apartamento, precioPorNoche } =
    req.body

  try {
    const errorDocumento = validarDocumento(documento)
    if (errorDocumento) return res.status(400).json({ msg: errorDocumento })

    const errorNombre = validarNombre(nombre)
    if (errorNombre) return res.status(400).json({ msg: errorNombre })

    const errorTelefono = validarTelefono(telefono)
    if (errorTelefono) return res.status(400).json({ msg: errorTelefono })

    const errorEmail = validarEmail(email)
    if (errorEmail) return res.status(400).json({ msg: errorEmail })

    let cliente = await Cliente.findOne({ $or: [{ documento }, { email }] })
    const clienteExistente = !!cliente

    if (!cliente) {
      const randomPassword = crypto.randomBytes(4).toString("hex")
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(randomPassword, salt)

      cliente = new Cliente({
        nombre,
        documento,
        email,
        telefono,
        password: hashedPassword,
        rol: "cliente",
      })

      await cliente.save()
      console.log("[PUBLIC REGISTER] Nuevo cliente creado:", cliente._id)
    } else {
      console.log("[PUBLIC REGISTER] Cliente existente encontrado:", cliente._id)
    }

    let usuario = await Usuario.findOne({ email })
    let nuevaContrasena = ""
    let esNuevoUsuario = false

    if (!usuario) {
      nuevaContrasena = crypto.randomBytes(4).toString("hex")
      console.log("[PUBLIC REGISTER] Contraseña generada para nuevo usuario:", nuevaContrasena)

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

      if (!clienteExistente) {
        nuevaContrasena = crypto.randomBytes(4).toString("hex")
        console.log("[PUBLIC REGISTER] Contraseña temporal generada para usuario existente:", nuevaContrasena)

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(nuevaContrasena, salt)
        usuario.password = hashedPassword
        await usuario.save()

        esNuevoUsuario = true
      }
    }

    const fechaIni = new Date(fechaEntrada)
    const fechaFin = new Date(fechaSalida)
    const diffTime = Math.abs(fechaFin - fechaIni)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const precioTotal = diffDays * precioPorNoche

    const opcionesFecha = { day: "2-digit", month: "2-digit", year: "numeric" }
    const fechaEntradaFormateada = new Date(fechaEntrada).toLocaleDateString("es-ES", opcionesFecha)
    const fechaSalidaFormateada = new Date(fechaSalida).toLocaleDateString("es-ES", opcionesFecha)

    const formatearPrecio = (precio) => {
      return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(
        precio,
      )
    }

    const precioPorNocheFormateado = formatearPrecio(precioPorNoche)
    const precioTotalFormateado = formatearPrecio(precioTotal)

    try {
      const transporter = nodemailer.createTransporter({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })

      const contenidoHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Reserva - Hotel Nido Sky</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
            .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .email-header { background: linear-gradient(135deg, #0A2463 0%, #3E92CC 100%); color: white; padding: 30px 20px; text-align: center; }
            .logo { max-width: 150px; margin-bottom: 15px; }
            .email-title { margin: 0; font-size: 28px; font-weight: 600; }
            .email-subtitle { margin: 10px 0 0; font-size: 16px; font-weight: 300; opacity: 0.9; }
            .email-body { padding: 30px; color: #444; }
            .greeting { font-size: 20px; margin-bottom: 20px; color: #0A2463; }
            .section { margin-bottom: 30px; background-color: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid #3E92CC; }
            .section-title { margin-top: 0; margin-bottom: 15px; color: #0A2463; font-size: 18px; font-weight: 600; display: flex; align-items: center; }
            .section-title-icon { margin-right: 10px; width: 24px; height: 24px; vertical-align: middle; }
            .credentials-section { background-color: #fff8f8; border-left: 4px solid #D8315B; }
            .credentials-title { color: #D8315B; }
            .credentials-box { background-color: white; border: 1px solid #ffe0e0; border-radius: 6px; padding: 15px; margin-top: 15px; }
            .password-display { font-family: monospace; font-size: 24px; background-color: #f0f0f0; padding: 8px 12px; border-radius: 4px; color: #D8315B; font-weight: bold; letter-spacing: 1px; display: inline-block; margin: 10px 0; border: 1px dashed #D8315B; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .detail-label { font-weight: 500; color: #666; }
            .detail-value { font-weight: 600; color: #333; text-align: right; }
            .total-row { font-size: 18px; color: #0A2463; margin-top: 15px; padding-top: 15px; border-top: 2px solid #eee; }
            .button { display: inline-block; background: linear-gradient(135deg, #0A2463 0%, #3E92CC 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }
            .login-button { background: linear-gradient(135deg, #D8315B 0%, #FF7F51 100%); display: block; width: 80%; margin: 20px auto; font-size: 18px; padding: 16px 30px; }
            .note { background-color: #f0f7ff; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; border-left: 4px solid #3E92CC; }
            .email-footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eee; }
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
              <div class="section">
                <h3 class="section-title">Detalles de la Reserva</h3>
                <div class="detail-row"><span class="detail-label">Apartamento:</span><span class="detail-value">${apartamento}</span></div>
                <div class="detail-row"><span class="detail-label">Fecha de entrada:</span><span class="detail-value">${fechaEntradaFormateada}</span></div>
                <div class="detail-row"><span class="detail-label">Fecha de salida:</span><span class="detail-value">${fechaSalidaFormateada}</span></div>
                <div class="detail-row"><span class="detail-label">Noches:</span><span class="detail-value">${diffDays}</span></div>
                <div class="detail-row"><span class="detail-label">Huéspedes:</span><span class="detail-value">${huespedes}</span></div>
                <div class="detail-row"><span class="detail-label">Precio por noche:</span><span class="detail-value">${precioPorNocheFormateado}</span></div>
                <div class="detail-row total-row"><span class="detail-label">Precio total:</span><span class="detail-value">${precioTotalFormateado}</span></div>
              </div>
              <div class="note"><strong>Nota importante:</strong> El check-in es a partir de las 15:00 y el check-out hasta las 12:00.</div>
              ${
                esNuevoUsuario && nuevaContrasena
                  ? `
              <div class="section credentials-section">
                <h3 class="section-title credentials-title">Acceso a tu Cuenta</h3>
                <p>Hemos creado una cuenta para ti en nuestro sistema.</p>
                <div class="credentials-box">
                  <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${email}</span></div>
                  <div class="detail-row"><span class="detail-label">Contraseña temporal:</span><span class="password-display">${nuevaContrasena}</span></div>
                </div>
                <a href="http://localhost:3000/login" class="button login-button">INGRESAR AL SISTEMA</a>
              </div>`
                  : ""
              }
              <p>Si tienes alguna pregunta contáctanos al <strong>+57 300 123 4567</strong>.</p>
              <p>Saludos cordiales,<br><strong>Equipo de Hotel Nido Sky</strong></p>
            </div>
            <div class="email-footer">
              <p>Calle 10 #43E-25, El Poblado, Medellín, Colombia<br>+57 300 123 4567 | info@nidosky.com<br>© ${new Date().getFullYear()} Hotel Nido Sky.</p>
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

      const adminMailOptions = {
        to: process.env.EMAIL_USER,
        from: `"Hotel Nido Sky" <${process.env.EMAIL_USER}>`,
        subject: `[ADMIN] Nueva reserva de ${nombre}`,
        html: `<p>Nueva reserva de <strong>${nombre}</strong> (${email}). Apartamento: ${apartamento}. Entrada: ${fechaEntradaFormateada}. Salida: ${fechaSalidaFormateada}. Total: ${precioTotalFormateado}.</p>${esNuevoUsuario && nuevaContrasena ? `<p>Contraseña temporal del nuevo usuario: <strong>${nuevaContrasena}</strong></p>` : ""}`,
      }

      await transporter.sendMail(adminMailOptions)
      console.log("[PUBLIC REGISTER] Copia del correo enviada al administrador")
    } catch (emailError) {
      console.error("[PUBLIC REGISTER] Error al enviar correo:", emailError)
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

exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find()
    res.json(clientes)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

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

// ─────────────────────────────────────────────────────────────
// FIX: updateCliente ahora persiste el campo "estado"
// ─────────────────────────────────────────────────────────────
exports.updateCliente = async (req, res) => {
  const { nombre, documento, email, telefono, estado, password } = req.body
  try {
    const errorDocumento = validarDocumento(documento)
    if (errorDocumento) return res.status(400).json({ msg: errorDocumento })

    const errorNombre = validarNombre(nombre)
    if (errorNombre) return res.status(400).json({ msg: errorNombre })

    const errorTelefono = validarTelefono(telefono)
    if (errorTelefono) return res.status(400).json({ msg: errorTelefono })

    const errorEmail = validarEmail(email)
    if (errorEmail) return res.status(400).json({ msg: errorEmail })

    const cliente = await Cliente.findById(req.params.id)
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" })
    }

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

    // Actualizar campos básicos
    cliente.nombre    = nombre
    cliente.documento = documento
    cliente.email     = email
    cliente.telefono  = telefono

    // FIX: persistir el estado enviado desde el frontend
    if (estado !== undefined) {
      cliente.estado = estado
    }

    // FIX: actualizar contraseña si se envió una nueva
    if (password) {
      const errorPassword = validarPassword(password)
      if (errorPassword) return res.status(400).json({ msg: errorPassword })
      const salt = await bcrypt.genSalt(10)
      cliente.password = await bcrypt.hash(password, salt)
    }

    await cliente.save()

    // Sincronizar el usuario asociado (nombre, documento, teléfono y estado)
    const usuario = await Usuario.findOne({ email: cliente.email })
    if (usuario) {
      usuario.nombre    = nombre
      usuario.documento = documento
      usuario.telefono  = telefono
      // FIX: sincronizar estado también en el usuario
      if (estado !== undefined) {
        usuario.estado = estado
      }
      if (password) {
        usuario.password = cliente.password
      }
      await usuario.save()
      console.log(`[UPDATE CLIENTE] Usuario con email ${cliente.email} también actualizado`)
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

exports.deleteCliente = async (req, res) => {
  console.log(`[DELETE CLIENTE] Iniciando eliminación del cliente con ID: ${req.params.id}`)

  try {
    const cliente = await Cliente.findById(req.params.id)
    if (!cliente) {
      console.log(`[DELETE CLIENTE] Cliente con ID ${req.params.id} no encontrado`)
      return res.status(404).json({ msg: "Cliente no encontrado" })
    }

    console.log(`[DELETE CLIENTE] Cliente encontrado: ${cliente.nombre} (${cliente.email})`)

    const Reserva = require("../reservas/reserva.model")

    const todasLasReservas = await Reserva.find({
      $or: [{ email: cliente.email }, { titular_documento: cliente.documento }, { documento: cliente.documento }],
    })

    const reservasDelCliente = todasLasReservas.filter((reserva) => {
      return (
        reserva.email === cliente.email ||
        reserva.titular_documento === cliente.documento ||
        reserva.documento === cliente.documento
      )
    })

    const reservasConfirmadas = reservasDelCliente.filter((reserva) => reserva.estado === "confirmada")

    if (reservasConfirmadas.length > 0) {
      return res.status(400).json({
        msg: `No se puede eliminar el cliente porque tiene ${reservasConfirmadas.length} reserva(s) confirmada(s)`,
        error: true,
        reservasConfirmadas: reservasConfirmadas.length,
        detallesReservas: reservasConfirmadas.map((r) => ({
          id: r._id,
          numero_reserva: r.numero_reserva,
          fecha_inicio: r.fecha_inicio,
          fecha_fin: r.fecha_fin,
          estado: r.estado,
          titular: r.titular_reserva,
        })),
      })
    }

    const resultado = await Cliente.deleteOne({ _id: req.params.id })

    if (resultado.deletedCount === 0) {
      return res.status(500).json({ msg: "No se pudo eliminar el cliente", error: true })
    }

    try {
      const usuario = await Usuario.findOne({ email: cliente.email })
      if (usuario && usuario.rol === "cliente") {
        await Usuario.deleteOne({ _id: usuario._id })
        console.log(`[DELETE CLIENTE] Usuario asociado eliminado: ${usuario._id}`)
      }
    } catch (userError) {
      console.error("[DELETE CLIENTE] Error al eliminar usuario asociado:", userError)
    }

    res.json({
      msg: "Cliente eliminado correctamente",
      resultado,
    })
  } catch (error) {
    console.error("[DELETE CLIENTE] Error al eliminar cliente:", error)
    if (error.name === "CastError" || error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Cliente no encontrado - ID inválido" })
    }
    res.status(500).json({
      msg: "Error en el servidor al eliminar el cliente",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
}

exports.getProfile = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.usuario.id)
    if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado" })
    res.json(cliente)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

exports.cambiarPassword = async (req, res) => {
  const { passwordActual, nuevoPassword } = req.body

  try {
    const errorPassword = validarPassword(nuevoPassword)
    if (errorPassword) return res.status(400).json({ msg: errorPassword })

    const clienteId = req.usuario.id
    const cliente = await Cliente.findById(clienteId)
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" })
    }

    const validPassword = bcrypt.compareSync(passwordActual, cliente.password)
    if (!validPassword) {
      return res.status(400).json({ msg: "La contraseña actual es incorrecta" })
    }

    const salt = bcrypt.genSaltSync()
    const nuevoPasswordEncriptado = bcrypt.hashSync(nuevoPassword, salt)

    cliente.password = nuevoPasswordEncriptado
    await cliente.save()

    const usuario = await Usuario.findOne({ email: cliente.email })
    if (usuario) {
      usuario.password = nuevoPasswordEncriptado
      await usuario.save()
    }

    res.json({ ok: true, msg: "Contraseña actualizada correctamente" })
  } catch (error) {
    console.error("[CAMBIAR PASSWORD] Error:", error)
    res.status(500).json({ msg: "Error en el servidor al cambiar la contraseña" })
  }
}

exports.obtenerReservasCliente = async (req, res) => {
  try {
    const documentoCliente = req.usuario.documento

    if (!documentoCliente) {
      return res.status(400).json({ msg: "No se pudo identificar el documento del cliente", error: true })
    }

    const Reserva = require("../reservas/reserva.model")

    const reservas = await Reserva.find({
      $or: [{ titular_documento: documentoCliente }, { documento: documentoCliente }],
    })
      .populate("apartamentos")
      .sort({ fecha_inicio: -1 })

    res.status(200).json({ reservas, error: false })
  } catch (error) {
    console.error("[CLIENTE RESERVAS] Error:", error)
    res.status(500).json({ msg: "Error en el servidor al obtener las reservas del cliente", error: true })
  }
}

exports.getMisReservas = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return res.status(401).json({ msg: "No hay token, autorización denegada" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "palabrasecreta")

    const usuarioEmail    = decoded.usuario?.email
    const usuarioDocumento = decoded.usuario?.documento

    if (!usuarioEmail && !usuarioDocumento) {
      return res.status(401).json({ msg: "Token no contiene información suficiente del usuario" })
    }

    let cliente = null
    if (usuarioEmail) cliente = await Cliente.findOne({ email: usuarioEmail })
    if (!cliente && usuarioDocumento) cliente = await Cliente.findOne({ documento: usuarioDocumento })

    if (!cliente) {
      return res.status(404).json({ msg: "No se encontró el cliente asociado a este usuario" })
    }

    const Reserva      = require("../reservas/reserva.model")
    const Apartamento  = require("../apartamento/apartamento.model")

    const reservas = await Reserva.find({ email: cliente.email })
      .populate({ path: "apartamentos", model: Apartamento })
      .sort({ fecha_inicio: -1 })

    const reservasFormateadas = reservas.map((reserva) => {
      const reservaObj = reserva.toObject()

      let apartamentoInfo = "Apartamento"
      let precioPorNoche  = 0

      if (reservaObj.apartamentos && reservaObj.apartamentos.length > 0) {
        const apartamento = reservaObj.apartamentos[0]
        if (apartamento.NumeroApto !== undefined && apartamento.Tipo) {
          apartamentoInfo = `${apartamento.NumeroApto} - ${apartamento.Tipo}`
        } else if (apartamento.NumeroApto !== undefined) {
          apartamentoInfo = `${apartamento.NumeroApto}`
        } else if (apartamento.Tipo) {
          apartamentoInfo = apartamento.Tipo
        }
        precioPorNoche = apartamento.Tarifa || 0
      }

      let nochesEstadia = reservaObj.noches_estadia
      if (!nochesEstadia && reservaObj.fecha_inicio && reservaObj.fecha_fin) {
        const fechaInicio = new Date(reservaObj.fecha_inicio)
        const fechaFin    = new Date(reservaObj.fecha_fin)
        const diffTime    = Math.abs(fechaFin - fechaInicio)
        nochesEstadia     = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }

      let precioTotal = reservaObj.total
      if (!precioTotal && nochesEstadia && precioPorNoche) {
        precioTotal = nochesEstadia * precioPorNoche
      }

      const formatearFecha = (fecha) => {
        if (!fecha) return "Fecha no disponible"
        return new Date(fecha).toLocaleDateString("es-ES", { weekday:"long", year:"numeric", month:"long", day:"numeric" })
      }

      return {
        ...reservaObj,
        detallesReserva: {
          apartamento:   apartamentoInfo,
          fechaEntrada:  formatearFecha(reservaObj.fecha_inicio),
          fechaSalida:   formatearFecha(reservaObj.fecha_fin),
          numeroNoches:  nochesEstadia || 0,
          huespedes:     reservaObj.acompanantes?.length + 1 || 1,
          precioPorNoche,
          precioTotal:   precioTotal || 0,
        },
        apartamentoInfo,
        precioPorNoche,
        nochesEstadia,
        precioTotal,
      }
    })

    return res.json(reservasFormateadas)
  } catch (error) {
    console.error("Error al obtener las reservas del cliente:", error)
    return res.status(500).json({ msg: "Error al obtener las reservas", error: error.message })
  }
}

exports.diagnosticoReservasCliente = async (req, res) => {
  try {
    const { clienteId } = req.params
    const cliente = await Cliente.findById(clienteId)
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado", error: true })
    }

    const Reserva = require("../reservas/reserva.model")

    const todasLasReservas = await Reserva.find({
      $or: [{ email: cliente.email }, { titular_documento: cliente.documento }, { documento: cliente.documento }],
    })

    const reservasPorEstado = { pendientes: [], confirmadas: [], canceladas: [] }

    todasLasReservas.forEach((reserva) => {
      const estado = reserva.estado || "pendiente"
      const obj = {
        id:             reserva._id,
        numero_reserva: reserva.numero_reserva,
        titular:        reserva.titular_reserva,
        email:          reserva.email,
        documento:      reserva.titular_documento || reserva.documento,
        fecha_inicio:   reserva.fecha_inicio,
        fecha_fin:      reserva.fecha_fin,
        estado,
        total:          reserva.total,
      }
      if (estado === "confirmada") reservasPorEstado.confirmadas.push(obj)
      else if (estado === "cancelada") reservasPorEstado.canceladas.push(obj)
      else reservasPorEstado.pendientes.push(obj)
    })

    return res.status(200).json({
      cliente: { id: cliente._id, nombre: cliente.nombre, email: cliente.email, documento: cliente.documento, telefono: cliente.telefono },
      resumen: {
        total_reservas: todasLasReservas.length,
        confirmadas:    reservasPorEstado.confirmadas.length,
        pendientes:     reservasPorEstado.pendientes.length,
        canceladas:     reservasPorEstado.canceladas.length,
      },
      puede_eliminar: reservasPorEstado.confirmadas.length === 0,
      reservas: reservasPorEstado,
    })
  } catch (error) {
    console.error("[DIAGNOSTICO] Error:", error)
    return res.status(500).json({ msg: "Error al realizar el diagnóstico", error: error.message })
  }
}

exports.updateClienteAndUsuario = async (req, res) => {
  const { nombre, documento, email, telefono } = req.body
  const { id } = req.params

  try {
    const errorDocumento = validarDocumento(documento)
    if (errorDocumento) return res.status(400).json({ msg: errorDocumento })

    const errorNombre = validarNombre(nombre)
    if (errorNombre) return res.status(400).json({ msg: errorNombre })

    const errorTelefono = validarTelefono(telefono)
    if (errorTelefono) return res.status(400).json({ msg: errorTelefono })

    const errorEmail = validarEmail(email)
    if (errorEmail) return res.status(400).json({ msg: errorEmail })

    const cliente = await Cliente.findById(id)
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" })
    }

    if (email !== cliente.email || documento !== cliente.documento) {
      const existingCliente = await Cliente.findOne({
        $or: [{ email, _id: { $ne: id } }, { documento, _id: { $ne: id } }],
      })
      if (existingCliente) {
        return res.status(400).json({ msg: "El email o documento ya está en uso por otro cliente" })
      }
    }

    cliente.nombre    = nombre
    cliente.documento = documento
    cliente.email     = email
    cliente.telefono  = telefono
    await cliente.save()

    const usuario = await Usuario.findOne({ email: cliente.email })
    if (usuario) {
      usuario.nombre    = nombre
      usuario.documento = documento
      usuario.telefono  = telefono
      await usuario.save()
    }

    res.json({ msg: "Cliente actualizado correctamente", cliente })
  } catch (error) {
    console.error("[UPDATE CLIENTE] Error:", error)
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Cliente no encontrado - ID inválido" })
    }
    res.status(500).json({ msg: "Error en el servidor al actualizar el cliente", error: error.message })
  }
}

exports.verificarEliminacion = async (req, res) => {
  try {
    const { id } = req.params
    const cliente = await Cliente.findById(id)
    if (!cliente) {
      return res.status(404).json({ msg: "Cliente no encontrado" })
    }

    const Reserva = require("../reservas/reserva.model")

    const reservasConfirmadas = await Reserva.find({
      $or: [{ email: cliente.email }, { titular_documento: cliente.documento }, { documento: cliente.documento }],
      estado: "confirmada",
    })

    const puedeEliminar = reservasConfirmadas.length === 0

    res.json({
      puedeEliminar,
      reservasConfirmadas: reservasConfirmadas.length,
      msg: puedeEliminar
        ? "El cliente puede ser eliminado"
        : `El cliente tiene ${reservasConfirmadas.length} reservas confirmadas y no puede ser eliminado`,
    })
  } catch (error) {
    console.error("[VERIFICAR ELIMINACION] Error:", error)
    res.status(500).json({ msg: "Error al verificar si el cliente puede ser eliminado", error: error.message })
  }
}

exports.buscarClientes = async (req, res) => {
  try {
    const { termino } = req.params
    if (!termino || termino.trim() === "") {
      return res.status(400).json({ msg: "El término de búsqueda es requerido" })
    }
    const regex = new RegExp(termino, "i")
    const clientes = await Cliente.find({
      $or: [{ nombre: regex }, { email: regex }, { documento: regex }],
    }).limit(10)
    res.json(clientes)
  } catch (error) {
    console.error("[BUSCAR CLIENTES] Error:", error)
    res.status(500).json({ msg: "Error al buscar clientes", error: error.message })
  }
}

exports.getEstadisticasClientes = async (req, res) => {
  try {
    const totalClientes = await Cliente.countDocuments()
    const fechaUnMesAtras = new Date()
    fechaUnMesAtras.setMonth(fechaUnMesAtras.getMonth() - 1)
    const clientesNuevos = await Cliente.countDocuments({ createdAt: { $gte: fechaUnMesAtras } })
    const Reserva = require("../reservas/reserva.model")
    const clientesConReservas = await Reserva.distinct("email").length
    const clientesSinReservas = totalClientes - clientesConReservas
    res.json({
      totalClientes,
      clientesNuevos,
      clientesConReservas,
      clientesSinReservas,
      porcentajeNuevos: totalClientes > 0 ? (clientesNuevos / totalClientes) * 100 : 0,
      porcentajeConReservas: totalClientes > 0 ? (clientesConReservas / totalClientes) * 100 : 0,
    })
  } catch (error) {
    console.error("[ESTADISTICAS CLIENTES] Error:", error)
    res.status(500).json({ msg: "Error al obtener estadísticas de clientes", error: error.message })
  }
}

exports.exportarClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find({}, { nombre: 1, documento: 1, email: 1, telefono: 1, createdAt: 1 })
    let csvData = "Nombre,Documento,Email,Teléfono,Fecha de Registro\n"
    clientes.forEach((cliente) => {
      const fechaRegistro = cliente.createdAt ? new Date(cliente.createdAt).toLocaleDateString() : "No disponible"
      csvData += `"${cliente.nombre}","${cliente.documento}","${cliente.email}","${cliente.telefono}","${fechaRegistro}"\n`
    })
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=clientes.csv")
    res.send(csvData)
  } catch (error) {
    console.error("[EXPORTAR CLIENTES] Error:", error)
    res.status(500).json({ msg: "Error al exportar clientes", error: error.message })
  }
}