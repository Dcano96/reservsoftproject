// src/features/clientes/cliente.controller.js
const Cliente = require('./cliente.model');
const bcrypt = require('bcryptjs');

// Crear un nuevo cliente (usado por el administrador)
exports.createCliente = async (req, res) => {
  try {
    const { nombre, documento, email, telefono, password, rol } = req.body;
    let cliente = await Cliente.findOne({ email });
    if (cliente) return res.status(400).json({ msg: "El cliente ya existe" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    cliente = new Cliente({
      nombre,
      documento,
      email,
      telefono,
      password: hashedPassword,
      rol: rol || "cliente"
    });
    await cliente.save();
    res.status(201).json({ msg: "Cliente creado correctamente", cliente });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};

// Listar todos los clientes
exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};

// Obtener un cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado" });
    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};

// Actualizar un cliente
exports.updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    if (updatedData.password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(updatedData.password, salt);
    }
    const cliente = await Cliente.findByIdAndUpdate(id, updatedData, { new: true });
    if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado" });
    res.json({ msg: "Cliente actualizado", cliente });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};

// Eliminar un cliente
exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado" });
    res.json({ msg: "Cliente eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};

// Obtener el perfil del cliente (para que el propio cliente consulte su información)
exports.getProfile = async (req, res) => {
  try {
    // Se asume que el token contiene el id del cliente en req.usuario.id
    const cliente = await Cliente.findById(req.usuario.id);
    if (!cliente) return res.status(404).json({ msg: "Cliente no encontrado" });
    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};
