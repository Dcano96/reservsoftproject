// src/features/descuentos/descuento.controller.js
const Descuento = require("./descuento.model");

exports.createDescuento = async (req, res) => {
  try {
    // Se asume que el cálculo de precio_con_descuento lo puede hacer el frontend
    const descuento = new Descuento(req.body);
    await descuento.save();
    res.status(201).json({ msg: "Descuento creado correctamente", descuento });
  } catch (error) {
    console.error("Error al crear descuento:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

exports.getDescuentos = async (req, res) => {
  try {
    const descuentos = await Descuento.find();
    res.status(200).json(descuentos);
  } catch (error) {
    console.error("Error al obtener descuentos:", error);
    res.status(500).json({ msg: "Error al obtener descuentos" });
  }
};

exports.updateDescuento = async (req, res) => {
  try {
    const descuento = await Descuento.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ msg: "Descuento actualizado correctamente", descuento });
  } catch (error) {
    console.error("Error al actualizar descuento:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

exports.deleteDescuento = async (req, res) => {
  try {
    // Si el descuento está activo, no permitir eliminarlo
    const descuento = await Descuento.findById(req.params.id);
    if (!descuento) return res.status(404).json({ msg: "Descuento no encontrado" });
    if (descuento.estado === true) {
      return res.status(400).json({ msg: "No se puede eliminar un descuento activo" });
    }
    await Descuento.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Descuento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar descuento:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};
