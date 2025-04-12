const Rol = require("./rol.model");

// Crear un nuevo rol
exports.createRol = async (req, res) => {
  try {
    const { nombre, estado, permisos } = req.body;
    let rol = await Rol.findOne({ nombre });
    if (rol) return res.status(400).json({ msg: "El rol ya existe" });
    rol = new Rol({
      nombre,
      estado: estado !== undefined ? estado : true,
      permisos: permisos || [], // Permisos en formato granular: array de objetos { modulo, acciones }
    });
    await rol.save();
    res.status(201).json({ msg: "Rol creado correctamente", rol });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};

// Listar todos los roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Rol.find();
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};

// Obtener un rol por ID
exports.getRolById = async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id);
    if (!rol) return res.status(404).json({ msg: "Rol no encontrado" });
    res.json(rol);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};

// Actualizar un rol
exports.updateRol = async (req, res) => {
  try {
    const { id } = req.params;
    // Se espera que en el body se actualicen también los permisos
    const updatedData = req.body;
    const rol = await Rol.findByIdAndUpdate(id, updatedData, { new: true });
    if (!rol) return res.status(404).json({ msg: "Rol no encontrado" });
    res.json({ msg: "Rol actualizado", rol });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};

// Eliminar un rol
exports.deleteRol = async (req, res) => {
  try {
    const rol = await Rol.findByIdAndDelete(req.params.id);
    if (!rol) return res.status(404).json({ msg: "Rol no encontrado" });
    res.json({ msg: "Rol eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};
