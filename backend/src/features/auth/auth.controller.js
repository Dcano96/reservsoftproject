const Usuario = require("../usuarios/usuario.model")
const Cliente = require("../clientes/cliente.model") // Añadido para buscar también en clientes
const Rol = require("../roles/rol.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const crypto = require("crypto")

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

// Validación exhaustiva de email
const validarEmail = (em) => {
  // Validaciones básicas
  if (!em) return "El correo electrónico es obligatorio"
  if (em.trim() === "") return "El correo electrónico no puede estar vacío"

  // Validación de formato básico
  if (!REGEX.EMAIL.test(em)) return "Formato de correo electrónico inválido"

  // Validación de patrones inválidos específicos
  if (REGEX.EMAIL_INVALIDO.test(em)) return "El correo contiene patrones inválidos (como @.com, @., etc.)"

  // Validación de longitud
  if (em.length < 6) return "El correo debe tener al menos 6 caracteres"
  if (em.length > 50) return "El correo no puede tener más de 50 caracteres"

  // Validación de partes del email
  const [localPart, domainPart] = em.split("@")

  // Validación de la parte local
  if (!localPart || localPart.length < 1) return "La parte local del correo no puede estar vacía"
  if (localPart.length > 64) return "La parte local del correo es demasiado larga"
  if (/^[.-]|[.-]$/.test(localPart)) return "La parte local no puede comenzar ni terminar con puntos o guiones"

  // Validación del dominio
  if (!domainPart || !domainPart.includes("."))
    return "El dominio del correo debe incluir una extensión (ej: .com, .net)"

  // Verificar que el dominio tenga un formato válido y que no haya caracteres después del TLD
  // Dividir el dominio en partes separadas por puntos
  const domainParts = domainPart.split(".")

  // Verificar que todas las partes del dominio sean válidas
  for (let i = 0; i < domainParts.length; i++) {
    const part = domainParts[i]
    // Cada parte debe contener al menos un carácter y solo caracteres alfanuméricos o guiones
    if (part.length === 0 || !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(part)) {
      return "El dominio del correo contiene partes inválidas"
    }
  }

  // Verificar que el TLD sea válido (2-6 caracteres, solo letras)
  const tld = domainParts[domainParts.length - 1]
  if (!tld || tld.length < 2 || tld.length > 6 || !/^[a-zA-Z]+$/.test(tld)) {
    return "La extensión del dominio no es válida o contiene caracteres no permitidos"
  }

  // Validación de dominios temporales o no recomendados
  const dominiosNoRecomendados = ["tempmail", "mailinator", "guerrillamail", "10minutemail", "yopmail"]
  for (const dominio of dominiosNoRecomendados) {
    if (domainPart.toLowerCase().includes(dominio)) return "No se permiten correos de servicios temporales"
  }

  return ""
}

// Validación exhaustiva de contraseña
const validarPassword = (pass) => {
  // Validaciones básicas
  if (!pass) return "La contraseña es obligatoria"
  if (pass.length < 8) return "La contraseña debe tener al menos 8 caracteres"
  if (pass.length > 15) return "La contraseña no puede tener más de 15 caracteres"

  // Validación de complejidad
  if (!/[a-z]/.test(pass)) return "La contraseña debe contener al menos una letra minúscula"
  if (!/[A-Z]/.test(pass)) return "La contraseña debe contener al menos una letra mayúscula"
  if (!/[0-9]/.test(pass)) return "La contraseña debe contener al menos un número"
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass))
    return "La contraseña debe contener al menos un carácter especial"

  // Validación de secuencias comunes
  if (REGEX.SECUENCIAS_COMUNES.test(pass))
    return "La contraseña no puede contener secuencias comunes o palabras fáciles de adivinar"

  // Validación de caracteres repetidos
  if (REGEX.CARACTERES_REPETIDOS.test(pass))
    return "La contraseña no puede contener más de 3 caracteres repetidos consecutivos"

  // Validación de secuencias de teclado
  if (/qwert|asdfg|zxcvb|12345|09876/.test(pass.toLowerCase()))
    return "La contraseña no puede contener secuencias de teclado"

  return ""
}

// Registro de usuario: se fuerza el rol "cliente"
exports.register = async (req, res) => {
  const { nombre, documento, email, telefono, password } = req.body

  // Validar email y contraseña
  const emailError = validarEmail(email)
  if (emailError) {
    return res.status(400).json({ msg: emailError })
  }

  const passwordError = validarPassword(password)
  if (passwordError) {
    return res.status(400).json({ msg: passwordError })
  }

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

// Login mejorado (incluye permisos en el token y mejor manejo de errores)
exports.login = async (req, res) => {
  console.log("[LOGIN] Solicitud recibida:", {
    body: req.body,
    headers: req.headers["content-type"],
  })

  // Extraer email y password, asegurándose de limpiar cualquier espacio o carácter especial
  let { email, password } = req.body

  // Limpiar el email (quitar espacios)
  email = email ? email.trim() : email

  // Limpiar la contraseña (quitar caracteres de control como tabulaciones)
  if (password) {
    // Eliminar caracteres de control como \t (tab), \n (nueva línea), etc.
    password = password.replace(/[\x00-\x1F\x7F-\x9F]/g, "")
    console.log("[LOGIN] Contraseña limpiada:", password)
  }

  // Validaciones básicas para evitar errores
  if (!email || !password) {
    console.log("[LOGIN] Faltan credenciales:", { email: !!email, password: !!password })
    return res.status(400).json({
      msg: "Por favor, proporcione email y contraseña",
      received: { email: !!email, password: !!password },
    })
  }

  try {
    // Primero buscamos en la tabla de usuarios
    let usuario = await Usuario.findOne({ email })
    let isCliente = false
    let fromClienteCollection = false

    // Si no se encuentra en usuarios, buscamos en clientes
    if (!usuario) {
      console.log(`[LOGIN] Usuario no encontrado, buscando en clientes: ${email}`)
      const cliente = await Cliente.findOne({ email })

      if (cliente) {
        console.log(`[LOGIN] Cliente encontrado: ${cliente._id}`)
        usuario = cliente
        isCliente = true
        fromClienteCollection = true
      } else {
        console.log(`[LOGIN] No se encontró ni usuario ni cliente con email: ${email}`)
        return res.status(400).json({ msg: "Credenciales inválidas" })
      }
    }

    // Verificar si el usuario está activo
    if (usuario.estado === false) {
      console.log(`[LOGIN] Usuario/cliente inactivo: ${email}`)
      return res.status(403).json({ msg: "Usuario inactivo. Contacte al administrador." })
    }

    // Verificar si el rol existe y está activo
    let rolEliminado = false
    let rolInactivo = false

    if (usuario.rol && typeof usuario.rol === "string") {
      // Buscar el rol en la base de datos
      const rol = await Rol.findOne({ nombre: usuario.rol })

      if (!rol) {
        console.log(`[LOGIN] Rol no encontrado para usuario: ${email}`)
        rolEliminado = true
      } else if (rol.estado === false) {
        console.log(`[LOGIN] Rol inactivo para usuario: ${email}`)
        rolInactivo = true
      }
    }

    // Si el rol está eliminado o inactivo, denegar el acceso
    if (rolEliminado || rolInactivo) {
      console.log(`[LOGIN] Acceso denegado por rol eliminado o inactivo: ${email}`)
      return res.status(403).json({
        msg: "Tu rol ha sido desactivado o eliminado. Por favor, contacta al administrador.",
        rolEliminado,
        rolInactivo,
      })
    }

    // Comparar contraseña
    console.log(`[LOGIN] Verificando contraseña para: ${email}`)

    // Intentar comparar con bcrypt
    let isMatch = false

    try {
      // Verificar si la contraseña está hasheada correctamente
      if (usuario.password && usuario.password.startsWith("$2")) {
        // Es un hash de bcrypt válido, podemos usar bcrypt.compare
        isMatch = await bcrypt.compare(password, usuario.password)
        console.log(`[LOGIN] Resultado de comparación bcrypt: ${isMatch}`)
      } else {
        console.log(`[LOGIN] La contraseña no parece ser un hash bcrypt válido`)
        // Si no es un hash válido, no podemos comparar
        isMatch = false
      }
    } catch (bcryptError) {
      console.error(`[LOGIN] Error en bcrypt.compare:`, bcryptError)
      isMatch = false
    }

    // Si la autenticación falla y el usuario viene de la colección de clientes,
    // intentar buscar en la colección de usuarios para ver si hay credenciales válidas allí
    if (!isMatch && fromClienteCollection) {
      console.log(`[LOGIN] Autenticación fallida para cliente, buscando en usuarios`)
      const usuarioAlternativo = await Usuario.findOne({ email })

      if (usuarioAlternativo) {
        console.log(`[LOGIN] Usuario alternativo encontrado: ${usuarioAlternativo._id}`)

        try {
          isMatch = await bcrypt.compare(password, usuarioAlternativo.password)
          console.log(`[LOGIN] Resultado de comparación con usuario alternativo: ${isMatch}`)

          if (isMatch) {
            // Si la autenticación es exitosa con el usuario alternativo, usamos ese
            usuario = usuarioAlternativo
            fromClienteCollection = false
            isCliente = usuarioAlternativo.rol === "cliente"
          }
        } catch (altError) {
          console.error(`[LOGIN] Error en comparación con usuario alternativo:`, altError)
        }
      }
    }

    // Si la autenticación falla y el usuario viene de la colección de usuarios,
    // intentar buscar en la colección de clientes para ver si hay credenciales válidas allí
    if (!isMatch && !fromClienteCollection) {
      console.log(`[LOGIN] Autenticación fallida para usuario, buscando en clientes`)
      const clienteAlternativo = await Cliente.findOne({ email })

      if (clienteAlternativo) {
        console.log(`[LOGIN] Cliente alternativo encontrado: ${clienteAlternativo._id}`)

        try {
          isMatch = await bcrypt.compare(password, clienteAlternativo.password)
          console.log(`[LOGIN] Resultado de comparación con cliente alternativo: ${isMatch}`)

          if (isMatch) {
            // Si la autenticación es exitosa con el cliente alternativo, usamos ese
            usuario = clienteAlternativo
            fromClienteCollection = true
            isCliente = true
          }
        } catch (altError) {
          console.error(`[LOGIN] Error en comparación con cliente alternativo:`, altError)
        }
      }
    }

    // Si después de todos los intentos la autenticación sigue fallando
    if (!isMatch) {
      console.log(`[LOGIN] Contraseña incorrecta para: ${email} después de todos los intentos`)
      return res.status(400).json({
        msg: "Credenciales inválidas. Por favor, verifica tu correo y contraseña.",
      })
    }

    // Determinar rol y permisos
    const rolNombre = usuario.rol || "cliente"
    let permisos = []

    try {
      // Consultar el rol completo para obtener los permisos
      const rol = await Rol.findOne({ nombre: rolNombre })
      if (rol) {
        permisos = rol.permisos || []
      }
    } catch (rolError) {
      console.error(`[LOGIN] Error al obtener rol: ${rolError.message}`)
      // Si hay error al obtener el rol, continuamos con permisos vacíos
    }

    // Crear payload para el token
    const payload = {
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        documento: usuario.documento,
        rol: rolNombre,
        permisos: permisos,
        isCliente: isCliente,
        fromClienteCollection: fromClienteCollection,
        // Añadir información sobre el estado del rol
        rolEliminado: rolEliminado,
        rolInactivo: rolInactivo,
      },
    }

    // Generar token
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" }, (err, token) => {
      if (err) {
        console.error(`[LOGIN] Error al generar token: ${err.message}`)
        throw err
      }
      console.log(`[LOGIN] Login exitoso para: ${email}`)
      res.json({ token, usuario: payload.usuario })
    })
  } catch (error) {
    console.error(`[LOGIN] Error general: ${error.message}`)
    res.status(500).json({ msg: "Error en el servidor", error: error.message })
  }
}

// Solicitud de recuperación de contraseña - SOLUCIÓN CORREGIDA
exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  // Validar email
  const emailError = validarEmail(email)
  if (emailError) {
    return res.status(400).json({ msg: emailError })
  }

  if (!email) {
    return res.status(400).json({ msg: "El correo electrónico es obligatorio" })
  }

  console.log(`[FORGOT PASSWORD] Solicitud recibida para email: ${email}`)

  try {
    // Buscar primero en usuarios
    let usuario = await Usuario.findOne({ email })
    let isCliente = false

    // Si no está en usuarios, buscar en clientes
    if (!usuario) {
      console.log(`[FORGOT PASSWORD] Usuario no encontrado, buscando en clientes: ${email}`)
      const cliente = await Cliente.findOne({ email })

      if (cliente) {
        console.log(`[FORGOT PASSWORD] Cliente encontrado: ${cliente._id}`)
        usuario = cliente
        isCliente = true
      } else {
        console.log(`[FORGOT PASSWORD] No se encontró ni usuario ni cliente con email: ${email}`)
        // Respuesta genérica por seguridad
        return res.json({
          msg: "Si el correo existe en nuestra base de datos, recibirás un enlace de recuperación",
        })
      }
    }

    // Verificar si el usuario está activo
    if (!usuario.estado) {
      console.log(`[FORGOT PASSWORD] Usuario/cliente inactivo: ${email}`)
      return res.json({
        msg: "Si el correo existe en nuestra base de datos, recibirás un enlace de recuperación",
      })
    }

    // Verificar si el rol existe y está activo
    let rolEliminado = false
    let rolInactivo = false

    if (usuario.rol && typeof usuario.rol === "string") {
      // Buscar el rol en la base de datos
      const rol = await Rol.findOne({ nombre: usuario.rol })

      if (!rol) {
        console.log(`[FORGOT PASSWORD] Rol no encontrado para usuario: ${email}`)
        rolEliminado = true
      } else if (rol.estado === false) {
        console.log(`[FORGOT PASSWORD] Rol inactivo para usuario: ${email}`)
        rolInactivo = true
      }
    }

    // Si el rol está eliminado o inactivo, denegar la recuperación de contraseña
    if (rolEliminado || rolInactivo) {
      console.log(`[FORGOT PASSWORD] Recuperación denegada por rol eliminado o inactivo: ${email}`)
      // Respuesta genérica por seguridad
      return res.json({
        msg: "Si el correo existe en nuestra base de datos, recibirás un enlace de recuperación",
      })
    }

    // Generar una contraseña temporal simple pero que cumpla con los requisitos
    // Formato: Temp + 6 caracteres alfanuméricos + 1! (para cumplir requisitos)
    const tempPassword = `Temp${Math.random().toString(36).substring(2, 8)}1!`

    // Hashear la contraseña temporal antes de guardarla
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(tempPassword, salt)

    // Guardar la contraseña hasheada en la base de datos
    usuario.password = hashedPassword

    // Limpiar tokens anteriores si existen
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined

    await usuario.save()

    // Si el usuario es un cliente, actualizar también la contraseña en la otra colección
    if (isCliente) {
      const usuarioCorrespondiente = await Usuario.findOne({ email: usuario.email })
      if (usuarioCorrespondiente) {
        usuarioCorrespondiente.password = hashedPassword
        await usuarioCorrespondiente.save()
        console.log(`[FORGOT PASSWORD] Contraseña actualizada también en la colección de usuarios`)
      }
    } else {
      // Si es un usuario, actualizar también en clientes si existe
      const clienteCorrespondiente = await Cliente.findOne({ email: usuario.email })
      if (clienteCorrespondiente) {
        clienteCorrespondiente.password = hashedPassword
        await clienteCorrespondiente.save()
        console.log(`[FORGOT PASSWORD] Contraseña actualizada también en la colección de clientes`)
      }
    }

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

  // Validar contraseña
  const passwordError = validarPassword(newPassword)
  if (passwordError) {
    return res.status(400).json({ msg: passwordError })
  }

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

    // Verificar si el rol existe y está activo
    if (usuario.rol && typeof usuario.rol === "string") {
      // Buscar el rol en la base de datos
      const rol = await Rol.findOne({ nombre: usuario.rol })

      if (!rol) {
        return res.status(403).json({ msg: "Tu rol ha sido eliminado. Contacta al administrador." })
      } else if (rol.estado === false) {
        return res.status(403).json({ msg: "Tu rol ha sido desactivado. Contacta al administrador." })
      }
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    usuario.password = hashedPassword
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined
    await usuario.save()

    // Actualizar también la contraseña en la otra colección si existe
    if (usuario.rol === "cliente") {
      const cliente = await Cliente.findOne({ email: usuario.email })
      if (cliente) {
        cliente.password = hashedPassword
        await cliente.save()
        console.log(`[RESET PASSWORD] Contraseña actualizada también en la colección de clientes`)
      }
    } else {
      const usuarioCorrespondiente = await Usuario.findOne({ email: usuario.email })
      if (usuarioCorrespondiente) {
        usuarioCorrespondiente.password = hashedPassword
        await usuarioCorrespondiente.save()
        console.log(`[RESET PASSWORD] Contraseña actualizada también en la colección de usuarios`)
      }
    }

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

    // Verificar si el rol existe y está activo
    if (usuario.rol && typeof usuario.rol === "string") {
      // Buscar el rol en la base de datos
      const rol = await Rol.findOne({ nombre: usuario.rol })

      if (!rol) {
        return res.status(403).json({ msg: "Tu rol ha sido eliminado. Contacta al administrador." })
      } else if (rol.estado === false) {
        return res.status(403).json({ msg: "Tu rol ha sido desactivado. Contacta al administrador." })
      }
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

  // Validar email y contraseña
  const emailError = validarEmail(email)
  if (emailError) {
    return res.status(400).json({ msg: emailError })
  }

  const passwordError = validarPassword(newPassword)
  if (passwordError) {
    return res.status(400).json({ msg: passwordError })
  }

  if (!email || !newPassword) {
    return res.status(400).json({ msg: "Se requieren email y nueva contraseña" })
  }

  try {
    // Buscar primero en usuarios
    let usuario = await Usuario.findOne({ email })
    let isCliente = false

    // Si no está en usuarios, buscar en clientes
    if (!usuario) {
      console.log(`[ADMIN RESET] Usuario no encontrado, buscando en clientes: ${email}`)
      const cliente = await Cliente.findOne({ email })

      if (cliente) {
        console.log(`[ADMIN RESET] Cliente encontrado: ${cliente._id}`)
        usuario = cliente
        isCliente = true
      } else {
        console.log(`[ADMIN RESET] No se encontró ni usuario ni cliente con email: ${email}`)
        return res.status(404).json({ msg: "Usuario no encontrado" })
      }
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    usuario.password = hashedPassword
    usuario.resetPasswordToken = undefined
    usuario.resetPasswordExpires = undefined

    await usuario.save()

    // Actualizar también la contraseña en la otra colección si existe
    if (isCliente) {
      const usuarioCorrespondiente = await Usuario.findOne({ email })
      if (usuarioCorrespondiente) {
        usuarioCorrespondiente.password = hashedPassword
        await usuarioCorrespondiente.save()
        console.log(`[ADMIN RESET] Contraseña actualizada también en la colección de usuarios`)
      }
    } else {
      const clienteCorrespondiente = await Cliente.findOne({ email })
      if (clienteCorrespondiente) {
        clienteCorrespondiente.password = hashedPassword
        await clienteCorrespondiente.save()
        console.log(`[ADMIN RESET] Contraseña actualizada también en la colección de clientes`)
      }
    }

    console.log(`Contraseña cambiada para ${email} por un administrador`)

    res.json({ msg: "Contraseña actualizada correctamente" })
  } catch (error) {
    console.error("Error en adminResetPassword:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// Nuevo endpoint para verificar el estado del rol
exports.verificarEstadoRol = async (req, res) => {
  try {
    // El middleware de autenticación ya debería haber verificado el token
    // y añadido el usuario a req.usuario
    const usuarioId = req.usuario.id

    // Buscar el usuario en la base de datos para obtener información actualizada
    const usuario = await Usuario.findById(usuarioId)

    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" })
    }

    // Verificar si el rol existe y está activo
    let rolEliminado = false
    let rolInactivo = false

    if (usuario.rol && typeof usuario.rol === "string") {
      // Buscar el rol en la base de datos
      const rol = await Rol.findOne({ nombre: usuario.rol })

      if (!rol) {
        console.log(`[VERIFICAR ROL] Rol no encontrado para usuario: ${usuario.email}`)
        rolEliminado = true
      } else if (rol.estado === false) {
        console.log(`[VERIFICAR ROL] Rol inactivo para usuario: ${usuario.email}`)
        rolInactivo = true
      }
    }

    // Devolver el estado del rol
    return res.json({
      rolActivo: !rolEliminado && !rolInactivo,
      rolEliminado,
      rolInactivo,
    })
  } catch (error) {
    console.error("Error al verificar estado del rol:", error)
    return res.status(500).json({ msg: "Error del servidor al verificar el rol" })
  }
}
