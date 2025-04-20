const Usuario = require("./usuario.model")
const bcrypt = require("bcryptjs")

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

    // Quitar el rol
    usuario.rol = ""
    await usuario.save()

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

    res.json({
      ok: true,
      msg: "Contraseña actualizada correctamente",
    })
  } catch (error) {
    console.error("[CAMBIAR PASSWORD] Error:", error)
    res.status(500).json({ msg: "Error en el servidor al cambiar la contraseña" })
  }
}
