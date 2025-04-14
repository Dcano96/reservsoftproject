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
    }

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

      // Calcular noches y precio total
      const fechaIni = new Date(fechaEntrada)
      const fechaFin = new Date(fechaSalida)
      const diffTime = Math.abs(fechaFin - fechaIni)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const precioTotal = diffDays * precioPorNoche

      // Preparar contenido del correo
      let contenidoHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #0A2463;">Confirmación de Reserva</h2>
          </div>
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Gracias por tu reserva en Hotel Nido Sky. A continuación, te enviamos los detalles:</p>
          
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #0A2463; margin-top: 0;">Detalles de la Reserva</h3>
            <p><strong>Apartamento:</strong> ${apartamento}</p>
            <p><strong>Fecha de entrada:</strong> ${new Date(fechaEntrada).toLocaleDateString()}</p>
            <p><strong>Fecha de salida:</strong> ${new Date(fechaSalida).toLocaleDateString()}</p>
            <p><strong>Noches:</strong> ${diffDays}</p>
            <p><strong>Huéspedes:</strong> ${huespedes}</p>
            <p><strong>Precio por noche:</strong> $${precioPorNoche}</p>
            <p><strong>Precio total:</strong> $${precioTotal}</p>
          </div>
      `

      // Agregar información de acceso si es un nuevo usuario
      if (esNuevoUsuario) {
        contenidoHTML += `
          <div style="background-color: #e6f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0A2463;">
            <h3 style="color: #0A2463; margin-top: 0;">Información de Acceso</h3>
            <p>Hemos creado una cuenta para ti en nuestro sistema. Puedes acceder con las siguientes credenciales:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Contraseña temporal:</strong> <span style="font-family: monospace; font-size: 18px; background-color: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${nuevaContrasena}</span></p>
            <p>Te recomendamos cambiar esta contraseña después de iniciar sesión por primera vez.</p>
          </div>
        `
      }

      contenidoHTML += `
          <p>Si tienes alguna pregunta o necesitas hacer cambios en tu reserva, no dudes en contactarnos.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #718096; font-size: 0.9em;">
            <p>Saludos,<br>Equipo de Hotel Nido Sky</p>
          </div>
        </div>
      `

      const mailOptions = {
        to: email,
        from: `"Hotel Nido Sky" <${process.env.EMAIL_USER}>`,
        subject: "Confirmación de Reserva - Hotel Nido Sky",
        html: contenidoHTML,
      }

      await transporter.sendMail(mailOptions)
      console.log("[PUBLIC REGISTER] Correo de confirmación enviado a:", email)

      // Enviar copia al administrador
      const adminMailOptions = {
        to: process.env.EMAIL_USER,
        from: `"Hotel Nido Sky" <${process.env.EMAIL_USER}>`,
        subject: `[ADMIN] Nueva reserva de ${nombre}`,
        html: contenidoHTML,
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
