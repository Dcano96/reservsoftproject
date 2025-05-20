const Usuario = require("./usuario.model")
const bcrypt = require("bcryptjs")
const Cliente = require("../clientes/cliente.model") // Importar el modelo de Cliente

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
  try {
    const { nombre, documento, email, telefono, password, rol } = req.body
    let usuario = await Usuario.findOne({ email })
    if (usuario) return res.status(400).json({ msg: "El usuario ya existe" })
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    usuario = new Usuario({
      nombre,
      documento,
      email,
      telefono,
      password: hashedPassword,
      rol: rol || "cliente",
    })
    await usuario.save()

    // Si el rol es "cliente", crear también en la colección de clientes
    if (rol === "cliente") {
      // Verificar si ya existe un cliente con ese email o documento
      const clienteExistente = await Cliente.findOne({
        $or: [{ email }, { documento }],
      })

      if (!clienteExistente) {
        const nuevoCliente = new Cliente({
          nombre,
          documento,
          email,
          telefono,
          password: hashedPassword, // Usar la misma contraseña hasheada
          rol: "cliente",
        })
        await nuevoCliente.save()
        console.log(`Cliente creado automáticamente con ID: ${nuevoCliente._id}`)
      }
    }

    res.status(201).json({ msg: "Usuario creado correctamente", usuario })
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

// Método para crear usuario desde otros controladores (sin respuesta HTTP)
exports.createUsuarioInterno = async (userData) => {
  try {
    console.log("[createUsuarioInterno] Iniciando creación de usuario interno con datos:", {
      nombre: userData.nombre,
      documento: userData.documento,
      email: userData.email,
      rol: userData.rol || "cliente",
    })

    // Verificar si ya existe un usuario con el mismo email
    let usuario = await Usuario.findOne({ email: userData.email })

    if (usuario) {
      console.log("[createUsuarioInterno] El usuario ya existe con ID:", usuario._id)
      return { success: false, msg: "El usuario ya existe", usuario }
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(userData.password, salt)

    // Crear el nuevo usuario
    usuario = new Usuario({
      nombre: userData.nombre,
      documento: userData.documento,
      email: userData.email,
      telefono: userData.telefono,
      password: hashedPassword,
      rol: userData.rol || "cliente",
    })

    // Guardar el usuario
    const usuarioGuardado = await usuario.save()
    console.log("[createUsuarioInterno] Usuario creado correctamente con ID:", usuarioGuardado._id)

    return { success: true, msg: "Usuario creado correctamente", usuario: usuarioGuardado }
  } catch (error) {
    console.error("[createUsuarioInterno] Error al crear usuario:", error)
    return { success: false, msg: "Error al crear usuario", error: error.message }
  }
}

// Listar todos los usuarios
exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find()
    res.json(usuarios)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

// Obtener un usuario por ID
exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id)
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" })
    res.json(usuario)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

// Actualizar un usuario
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const updatedData = req.body

    // Verificar si es el usuario administrador (David Andres Goez Cano)
    const usuario = await Usuario.findById(id)
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" })

    // Proteger al usuario administrador de ser desactivado
    if (usuario.documento === "1152458310" && usuario.nombre === "David Andres Goez Cano") {
      if (updatedData.estado === false) {
        return res.status(403).json({ msg: "No se puede desactivar al usuario administrador" })
      }

      // Proteger al administrador de que se le quite el rol
      if (updatedData.rol === "") {
        return res.status(403).json({ msg: "No se puede quitar el rol al usuario administrador" })
      }
    }

    if (updatedData.password) {
      const salt = await bcrypt.genSalt(10)
      updatedData.password = await bcrypt.hash(updatedData.password, salt)
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(id, updatedData, { new: true })

    // Si el usuario tiene rol "cliente", actualizar también en la colección de clientes
    if (usuarioActualizado.rol === "cliente") {
      // Buscar cliente por email
      const cliente = await Cliente.findOne({ email: usuarioActualizado.email })
      if (cliente) {
        // Actualizar los datos del cliente
        cliente.nombre = usuarioActualizado.nombre
        cliente.documento = usuarioActualizado.documento
        cliente.telefono = usuarioActualizado.telefono
        // Actualizar contraseña solo si se cambió
        if (updatedData.password) {
          cliente.password = usuarioActualizado.password
        }
        await cliente.save()
        console.log(`Cliente actualizado automáticamente con ID: ${cliente._id}`)
      }
    }

    res.json({ msg: "Usuario actualizado", usuario: usuarioActualizado })
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

// Eliminar un usuario
exports.deleteUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id)
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" })

    // Verificar si es el usuario administrador (David Andres Goez Cano)
    if (usuario.documento === "1152458310" && usuario.nombre === "David Andres Goez Cano") {
      return res.status(403).json({ msg: "No se puede eliminar al usuario administrador" })
    }

    // Verificar si el usuario tiene un rol asignado
    if (usuario.rol && usuario.rol !== "") {
      return res.status(400).json({ msg: "Debe quitar el rol del usuario antes de eliminarlo" })
    }

    await Usuario.findByIdAndDelete(req.params.id)

    // Si el usuario tenía rol "cliente", intentar eliminar también de la colección de clientes
    if (usuario.rol === "cliente") {
      try {
        const clienteEliminado = await Cliente.findOneAndDelete({ email: usuario.email })
        if (clienteEliminado) {
          console.log(`Cliente eliminado automáticamente con ID: ${clienteEliminado._id}`)
        }
      } catch (error) {
        console.error("Error al eliminar cliente asociado:", error)
        // No fallamos si no se puede eliminar el cliente
      }
    }

    res.json({ msg: "Usuario eliminado" })
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

// Quitar rol a un usuario
exports.removeRol = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id)
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" })

    // Verificar si es el usuario administrador
    if (usuario.documento === "1152458310" && usuario.nombre === "David Andres Goez Cano") {
      return res.status(403).json({ msg: "No se puede quitar el rol al usuario administrador" })
    }

    // Guardar el rol anterior para verificar si era cliente
    const rolAnterior = usuario.rol

    // Quitar el rol
    usuario.rol = ""
    await usuario.save()

    // Si el rol anterior era "cliente", actualizar el cliente correspondiente
    if (rolAnterior === "cliente") {
      try {
        // No eliminamos el cliente, solo actualizamos su estado
        const cliente = await Cliente.findOne({ email: usuario.email })
        if (cliente) {
          cliente.estado = false // Desactivar el cliente
          await cliente.save()
          console.log(`Cliente desactivado automáticamente con ID: ${cliente._id}`)
        }
      } catch (error) {
        console.error("Error al desactivar cliente asociado:", error)
        // No fallamos si no se puede actualizar el cliente
      }
    }

    res.json({ msg: "Rol eliminado correctamente", usuario })
  } catch (error) {
    console.error(error)
    res.status(500).send("Error en el servidor")
  }
}

// Cambiar contraseña de usuario
exports.cambiarPassword = async (req, res) => {
  try {
    console.log("[CAMBIAR PASSWORD] Iniciando cambio de contraseña para usuario")

    // Obtener el ID del usuario desde los parámetros o desde el token
    const usuarioId = req.params.id || req.usuario._id || req.usuario.id
    console.log("[CAMBIAR PASSWORD] ID del usuario:", usuarioId)

    const { passwordActual, nuevoPassword } = req.body

    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findById(usuarioId)
    if (!usuario) {
      console.log("[CAMBIAR PASSWORD] Usuario no encontrado")
      return res.status(404).json({ msg: "Usuario no encontrado" })
    }

    // Verificar la contraseña actual
    const validPassword = await bcrypt.compare(passwordActual, usuario.password)
    if (!validPassword) {
      console.log("[CAMBIAR PASSWORD] Contraseña actual incorrecta")
      return res.status(400).json({ msg: "La contraseña actual es incorrecta" })
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10)
    const nuevoPasswordEncriptado = await bcrypt.hash(nuevoPassword, salt)

    // Actualizar la contraseña del usuario
    usuario.password = nuevoPasswordEncriptado
    await usuario.save()
    console.log("[CAMBIAR PASSWORD] Contraseña de usuario actualizada correctamente")

    // Si el usuario tiene rol "cliente", actualizar también la contraseña en la colección de clientes
    if (usuario.rol === "cliente") {
      try {
        const cliente = await Cliente.findOne({ email: usuario.email })
        if (cliente) {
          cliente.password = nuevoPasswordEncriptado
          await cliente.save()
          console.log("[CAMBIAR PASSWORD] Contraseña de cliente actualizada automáticamente")
        }
      } catch (error) {
        console.error("[CAMBIAR PASSWORD] Error al actualizar contraseña del cliente:", error)
        // No fallamos si no se puede actualizar la contraseña del cliente
      }
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
