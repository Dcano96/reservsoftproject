const Usuario = require("../usuarios/usuario.model")
const Rol = require("../roles/rol.model") // Importamos el modelo de roles
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const crypto = require("crypto")

// Registro de usuario: se fuerza el rol "cliente"
exports.register = async (req, res) => {
  const { nombre, documento, email, telefono, password } = req.body
  try {
    let usuario = await Usuario.findOne({ email })
    if (usuario) {
      return res.status(400).json({ msg: "El usuario ya existe" })
    }
    // Se asigna siempre el rol "cliente"
    usuario = new Usuario({ nombre, documento, email, telefono, password, rol: "cliente" })
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
    await usuario.save()
    res.status(201).json({ msg: "Usuario registrado correctamente como cliente" })
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

// Login (incluye permisos en el token)
exports.login = async (req, res) => {
  const { email, password } = req.body
  try {
    const usuario = await Usuario.findOne({ email })
    if (!usuario) return res.status(400).json({ msg: "Credenciales inválidas" })

    // Verificar si el usuario está activo
    if (!usuario.estado) {
      return res.status(403).json({ msg: "Usuario inactivo. Contacte al administrador." })
    }

    const isMatch = await bcrypt.compare(password, usuario.password)
    if (!isMatch) return res.status(400).json({ msg: "Credenciales inválidas" })

    // Consultar el rol completo para obtener los permisos
    const rol = await Rol.findOne({ nombre: usuario.rol })

    const payload = {
      usuario: {
        id: usuario._id,
        rol: usuario.rol,
        permisos: rol ? rol.permisos : [], // Se incluye el array de permisos
      },
    }
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" }, (err, token) => {
      if (err) throw err
      res.json({ token })
    })
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

// Solicitud de recuperación de contraseña - SOLUCIÓN CORREGIDA
exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ msg: "El correo electrónico es obligatorio" })
  }

  console.log(`[FORGOT PASSWORD] Solicitud recibida para email: ${email}`)

  try {
    const usuario = await Usuario.findOne({ email })

    // Si no existe el usuario, enviamos una respuesta genérica por seguridad
    if (!usuario) {
      console.log(`[FORGOT PASSWORD] Usuario con email ${email} no encontrado`)
      return res.json({
        msg: "Si el correo existe en nuestra base de datos, recibirás un enlace de recuperación",
      })
    }

    // Verificar si el usuario está activo
    if (!usuario.estado) {
      console.log(`[FORGOT PASSWORD] Usuario con email ${email} está inactivo`)
      return res.json({
        msg: "Si el correo existe en nuestra base de datos, recibirás un enlace de recuperación",
      })
    }

    // Generar una contraseña temporal simple (solo letras y números)
    const tempPassword = crypto.randomBytes(4).toString("hex") // 8 caracteres alfanuméricos

    // Hashear la contraseña temporal antes de guardarla
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(tempPassword, salt)

    // Guardar la contraseña hasheada en la base de datos
    usuario.password = hashedPassword

    // Limpiar tokens anteriores si existen
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined

    await usuario.save()

    console.log(`[FORGOT PASSWORD] Contraseña temporal generada para ${email}: ${tempPassword}`)

    // Intentar enviar correo
    try {
      // Configuración del transporte de correo
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

      const mailOptions = {
        to: usuario.email,
        from: `"Hotel Nido Sky" <${process.env.EMAIL_USER}>`,
        subject: "Contraseña temporal - Hotel Nido Sky",
        text: `Hola ${usuario.nombre},\n\nSe ha generado una contraseña temporal para tu cuenta: ${tempPassword}\n\nPor favor, cambia esta contraseña después de iniciar sesión.\n\nSaludos,\nEquipo de Hotel Nido Sky`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #4a5568;">Contraseña Temporal</h2>
            </div>
            <p>Hola <strong>${usuario.nombre}</strong>,</p>
            <p>Se ha generado una contraseña temporal para tu cuenta:</p>
            <div style="text-align: center; margin: 20px 0; padding: 15px; background-color: #f7fafc; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
              ${tempPassword}
            </div>
            <p>Por favor, cambia esta contraseña después de iniciar sesión.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #718096; font-size: 0.9em;">
              <p>Saludos,<br>Equipo de Hotel Nido Sky</p>
            </div>
          </div>
        `,
      }

      await transporter.sendMail(mailOptions)
      console.log(`[FORGOT PASSWORD] Correo con contraseña temporal enviado a ${usuario.email}`)
    } catch (emailError) {
      console.error("[FORGOT PASSWORD] Error al enviar correo con contraseña temporal:", emailError)
      // No fallamos si el correo no se envía, ya que tenemos la contraseña en los logs
    }

    // Enviar siempre una copia al administrador
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })

      const adminMailOptions = {
        to: process.env.EMAIL_USER,
        from: `"Hotel Nido Sky" <${process.env.EMAIL_USER}>`,
        subject: `[ADMIN] Contraseña temporal para ${usuario.email}`,
        text: `Se ha generado una contraseña temporal para el usuario ${usuario.email}: ${tempPassword}`,
      }

      await transporter.sendMail(adminMailOptions)
      console.log(`[FORGOT PASSWORD] Correo de administrador enviado a ${process.env.EMAIL_USER}`)
    } catch (adminEmailError) {
      console.error("[FORGOT PASSWORD] Error al enviar correo al administrador:", adminEmailError)
    }

    // Respuesta genérica por seguridad
    return res.json({
      msg: "Si el correo existe en nuestra base de datos, recibirás instrucciones para acceder a tu cuenta",
    })
  } catch (error) {
    console.error("[FORGOT PASSWORD] Error general:", error)
    res.status(500).json({ msg: "Error en el servidor al procesar la solicitud" })
  }
}

// Reseteo de contraseña
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body
  try {
    const usuario = await Usuario.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })
    if (!usuario) return res.status(400).json({ msg: "Token inválido o expirado" })

    // Verificar si el usuario está activo
    if (!usuario.estado) {
      return res.status(403).json({ msg: "Usuario inactivo. Contacte al administrador." })
    }

    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(newPassword, salt)
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined
    await usuario.save()
    res.json({ msg: "Contraseña actualizada correctamente" })
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

// Obtener usuario autenticado
exports.getUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select("-password")

    // Verificar si el usuario está activo
    if (!usuario.estado) {
      return res.status(403).json({ msg: "Usuario inactivo. Contacte al administrador." })
    }

    res.json(usuario)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

// Endpoint para cambiar contraseña directamente (para administradores)
exports.adminResetPassword = async (req, res) => {
  const { email, newPassword } = req.body

  if (!email || !newPassword) {
    return res.status(400).json({ msg: "Se requieren email y nueva contraseña" })
  }

  try {
    const usuario = await Usuario.findOne({ email })

    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" })
    }

    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(newPassword, salt)
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined

    await usuario.save()

    console.log(`Contraseña cambiada para ${email} por un administrador`)

    res.json({ msg: "Contraseña actualizada correctamente" })
  } catch (error) {
    console.error("Error en adminResetPassword:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}
