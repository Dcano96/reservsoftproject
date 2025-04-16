const Apartamento = require("./apartamento.model")

exports.createApartamento = async (req, res) => {
  try {
    const { Tipo, NumeroApto, Piso, Capacidad, Tarifa, Estado } = req.body
    if (
      !Tipo ||
      NumeroApto === undefined ||
      Piso === undefined ||
      Capacidad === undefined || // Añadido Capacidad a la validación
      Tarifa === undefined ||
      Estado === undefined
    ) {
      return res.status(400).json({
        msg: "Todos los campos son requeridos: Tipo, NumeroApto, Piso, Capacidad, Tarifa, Estado",
      })
    }
    const apartamento = new Apartamento({ Tipo, NumeroApto, Piso, Capacidad, Tarifa, Estado })
    await apartamento.save()
    res.status(201).json({ msg: "Apartamento creado correctamente", apartamento })
  } catch (error) {
    console.error("Error al crear apartamento:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

exports.getApartamentos = async (req, res) => {
  try {
    const apartamentos = await Apartamento.find()
    res.status(200).json(apartamentos)
  } catch (error) {
    console.error("Error al obtener apartamentos:", error)
    res.status(500).json({ msg: "Error al obtener apartamentos" })
  }
}

exports.updateApartamento = async (req, res) => {
  try {
    const { Tipo, NumeroApto, Piso, Capacidad, Tarifa, Estado } = req.body
    if (
      !Tipo ||
      NumeroApto === undefined ||
      Piso === undefined ||
      Capacidad === undefined || // Añadido Capacidad a la validación
      Tarifa === undefined ||
      Estado === undefined
    ) {
      return res.status(400).json({
        msg: "Todos los campos son requeridos: Tipo, NumeroApto, Piso, Capacidad, Tarifa, Estado",
      })
    }
    const apartamento = await Apartamento.findByIdAndUpdate(
      req.params.id,
      { Tipo, NumeroApto, Piso, Capacidad, Tarifa, Estado },
      { new: true },
    )
    res.status(200).json({ msg: "Apartamento actualizado correctamente", apartamento })
  } catch (error) {
    console.error("Error al actualizar apartamento:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

exports.deleteApartamento = async (req, res) => {
  try {
    const apartamento = await Apartamento.findById(req.params.id)
    if (!apartamento) {
      return res.status(404).json({ msg: "Apartamento no encontrado" })
    }
    // No se permite eliminar un apartamento si está activo (Estado true)
    if (apartamento.Estado === true) {
      return res.status(400).json({ msg: "No se puede eliminar un apartamento activo" })
    }
    await Apartamento.findByIdAndDelete(req.params.id)
    res.status(200).json({ msg: "Apartamento eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar apartamento:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}
