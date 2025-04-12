const TipoApartamento = require("./tipoApartamento.model");

exports.createTipoApartamento = async (req, res) => {
  try {
    const { nombre, descripcion, tamaño, estado } = req.body;
    if (!nombre || !descripcion || !tamaño || estado === undefined) {
      return res.status(400).json({
        msg: "Todos los campos son requeridos: nombre, descripcion, tamaño, estado"
      });
    }
    const tipoApartamento = new TipoApartamento({ nombre, descripcion, tamaño, estado });
    await tipoApartamento.save();
    res.status(201).json({ msg: "Tipo de apartamento creado correctamente", tipoApartamento });
  } catch (error) {
    console.error("Error al crear tipoApartamento:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

exports.getTipoApartamentos = async (req, res) => {
  try {
    const tipoApartamentos = await TipoApartamento.find();
    res.status(200).json(tipoApartamentos);
  } catch (error) {
    console.error("Error al obtener tipoApartamentos:", error);
    res.status(500).json({ msg: "Error al obtener tipoApartamentos" });
  }
};

exports.updateTipoApartamento = async (req, res) => {
  try {
    const { nombre, descripcion, tamaño, estado } = req.body;
    if (!nombre || !descripcion || !tamaño || estado === undefined) {
      return res.status(400).json({
        msg: "Todos los campos son requeridos: nombre, descripcion, tamaño, estado"
      });
    }
    const tipoApartamento = await TipoApartamento.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, tamaño, estado },
      { new: true }
    );
    res.status(200).json({ msg: "Tipo de apartamento actualizado correctamente", tipoApartamento });
  } catch (error) {
    console.error("Error al actualizar tipoApartamento:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

exports.deleteTipoApartamento = async (req, res) => {
  try {
    const tipoApartamento = await TipoApartamento.findById(req.params.id);
    if (!tipoApartamento) {
      return res.status(404).json({ msg: "Tipo de apartamento no encontrado" });
    }
    // Si el tipo de apartamento está activo, no se permite eliminarlo
    if (tipoApartamento.estado === true) {
      return res.status(400).json({ msg: "No se puede eliminar un tipo de apartamento activo" });
    }
    await TipoApartamento.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Tipo de apartamento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar tipoApartamento:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};
