const Usuario = require('./usuario.model'); 
const bcrypt = require('bcryptjs');

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
  try {
    const { nombre, documento, email, telefono, password, rol } = req.body;
    let usuario = await Usuario.findOne({ email });
    if (usuario) return res.status(400).json({ msg: "El usuario ya existe" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    usuario = new Usuario({
      nombre,
      documento,
      email,
      telefono,
      password: hashedPassword,
      rol: rol || "cliente"
    });
    await usuario.save();
    res.status(201).json({ msg: "Usuario creado correctamente", usuario });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};

// Listar todos los usuarios
exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};

// Obtener un usuario por ID
exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};

// Actualizar un usuario
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    if (updatedData.password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(updatedData.password, salt);
    }
    const usuario = await Usuario.findByIdAndUpdate(id, updatedData, { new: true });
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });
    res.json({ msg: "Usuario actualizado", usuario });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};

// Eliminar un usuario
exports.deleteUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });
    res.json({ msg: "Usuario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};
