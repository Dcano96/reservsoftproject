const Mobiliario = require("./mobiliario.model");

exports.createMobiliario = async (req, res) => {
  try {
    console.log("Datos recibidos en createMobiliario:", JSON.stringify(req.body));
    const { nombre, identMobiliario, estado, observacion, apartamento } = req.body;
    if (!nombre || !identMobiliario || !estado || !observacion || !apartamento) {
      return res.status(400).json({ 
        msg: "Todos los campos son obligatorios: nombre, identMobiliario, estado, observacion y apartamento." 
      });
    }
    const estadosValidos = ["Activo", "Inactivo", "Mantenimiento"];
    const estadoValido = estadosValidos.includes(estado) ? estado : "Activo";
    const existingMobiliario = await Mobiliario.findOne({ identMobiliario });
    if (existingMobiliario) {
      return res.status(400).json({ msg: "La identificación del mobiliario ya existe." });
    }
    const mobiliarioData = {
      nombre,
      identMobiliario,
      estado: estadoValido,
      observacion,
      descripcion: req.body.descripcion || "",
      tipo: req.body.tipo || "",
      precio: req.body.precio || 0,
      cantidad: req.body.cantidad || 1,
      apartamento, // Se asigna la referencia del apartamento
    };

    const mobiliario = new Mobiliario(mobiliarioData);
    await mobiliario.save();
    res.status(201).json({ msg: "Mobiliario creado correctamente", mobiliario });
  } catch (error) {
    console.error("Error al crear mobiliario:", error);
    res.status(500).json({ msg: "Error en el servidor", error: error.message });
  }
};

exports.getMobiliarios = async (req, res) => {
  try {
    const mobiliarios = await Mobiliario.find();
    res.status(200).json(mobiliarios);
  } catch (error) {
    console.error("Error al obtener mobiliarios:", error);
    res.status(500).json({ msg: "Error al obtener mobiliarios", error: error.message });
  }
};

exports.getMobiliariosPorApartamento = async (req, res) => {
  try {
    const { apartamentoId } = req.params;
    const mobiliarios = await Mobiliario.find({ apartamento: apartamentoId });
    res.status(200).json(mobiliarios);
  } catch (error) {
    console.error("Error al obtener mobiliarios por apartamento:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

exports.updateMobiliario = async (req, res) => {
  try {
    console.log("Datos recibidos en updateMobiliario:", JSON.stringify(req.body));
    console.log("ID a actualizar:", req.params.id);
    
    // Si solo se envía el campo "estado", permitimos actualización parcial
    if (Object.keys(req.body).length === 1 && req.body.estado) {
      const updated = await Mobiliario.findByIdAndUpdate(
        req.params.id,
        { $set: { estado: req.body.estado } },
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ msg: "Mobiliario no encontrado" });
      }
      return res.status(200).json({ msg: "Mobiliario actualizado correctamente", mobiliario: updated });
    }
    
    // Para actualización completa se requieren todos los campos, incluyendo "apartamento"
    const { nombre, identMobiliario, estado, observacion, apartamento } = req.body;
    if (!nombre || !identMobiliario || !estado || !observacion || !apartamento) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios." });
    }
    const estadosValidos = ["Activo", "Inactivo", "Mantenimiento"];
    const estadoValido = estadosValidos.includes(estado) ? estado : "Activo";
    const duplicate = await Mobiliario.findOne({ 
      identMobiliario, 
      _id: { $ne: req.params.id }
    });
    if (duplicate) {
      return res.status(400).json({ msg: "La identificación del mobiliario ya existe." });
    }
    const mobiliarioData = {
      nombre,
      identMobiliario,
      estado: estadoValido,
      observacion,
      descripcion: req.body.descripcion || "",
      tipo: req.body.tipo || "",
      precio: req.body.precio || 0,
      cantidad: req.body.cantidad || 1,
      apartamento, // Se actualiza la referencia al apartamento
    };
    
    const mobiliario = await Mobiliario.findByIdAndUpdate(
      req.params.id,
      { $set: mobiliarioData },
      { new: true, runValidators: true }
    );
    if (!mobiliario) {
      return res.status(404).json({ msg: "Mobiliario no encontrado" });
    }
    res.status(200).json({ msg: "Mobiliario actualizado correctamente", mobiliario });
  } catch (error) {
    console.error("Error al actualizar mobiliario:", error);
    res.status(500).json({ msg: "Error en el servidor", error: error.message });
  }
};

exports.darDeBajaMobiliario = async (req, res) => {
  try {
    console.log("ID a dar de baja:", req.params.id);
    const mobiliario = await Mobiliario.findById(req.params.id);
    if (!mobiliario) return res.status(404).json({ msg: "Mobiliario no encontrado" });
    mobiliario.estado = "Inactivo";
    await mobiliario.save();
    res.status(200).json({ msg: "Mobiliario dado de baja correctamente", mobiliario });
  } catch (error) {
    console.error("Error al dar de baja mobiliario:", error);
    res.status(500).json({ msg: "Error en el servidor", error: error.message });
  }
};
