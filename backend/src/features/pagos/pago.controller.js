const mongoose = require("mongoose");
const Pago = require("./pago.model");
// Ajusta la ruta de acuerdo a donde se encuentre reserva.model.js
const Reserva = require("../reservas/reserva.model");

// Función auxiliar para validar que un id sea un ObjectId válido
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createPago = async (req, res) => {
  try {
    // Validamos que el campo reserva tenga un ObjectId válido
    if (!isValidObjectId(req.body.reserva)) {
      return res.status(400).json({ msg: "El valor proporcionado para 'reserva' no es un ObjectId válido." });
    }
    
    // Buscamos la reserva asociada
    const reserva = await Reserva.findById(req.body.reserva);
    if (!reserva) {
      return res.status(404).json({ msg: "Reserva no encontrada" });
    }

    // Calculamos el pago parcial y el faltante según la reserva
    const pagoParcial = reserva.pagos_parciales;
    const faltante = reserva.total - reserva.pagos_parciales;
    
    // Formateamos los valores en pesos colombianos
    const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });
    const pagoParcialFormatted = formatter.format(pagoParcial);
    const faltanteFormatted = formatter.format(faltante);

    // Creamos el pago utilizando el valor de pago parcial
    const pago = new Pago({
      ...req.body,
      monto: pagoParcial, // se asigna el pago parcial de la reserva
    });

    await pago.save();

    // Populamos la información completa de la reserva
    await pago.populate({ path: "reserva", model: "Reserva" });

    res.status(201).json({
      msg: "Pago creado correctamente",
      pago: {
        ...pago.toObject(),
        pagoParcial: pagoParcialFormatted,
        faltante: faltanteFormatted,
      },
    });
  } catch (error) {
    console.error("Error al crear pago:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

exports.getPagos = async (req, res) => {
  try {
    const pagos = await Pago.find().populate({ path: "reserva", model: "Reserva" });
    res.status(200).json(pagos);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    res.status(500).json({ msg: "Error al obtener pagos" });
  }
};

exports.getPagoById = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id).populate({ path: "reserva", model: "Reserva" });
    if (!pago) return res.status(404).json({ msg: "Pago no encontrado" });
    res.status(200).json(pago);
  } catch (error) {
    console.error("Error al obtener pago:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

exports.updatePago = async (req, res) => {
  try {
    if (req.body.reserva && !isValidObjectId(req.body.reserva)) {
      return res.status(400).json({ msg: "El valor proporcionado para 'reserva' no es un ObjectId válido." });
    }
    const pago = await Pago.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate({ path: "reserva", model: "Reserva" });
    if (!pago) return res.status(404).json({ msg: "Pago no encontrado" });
    res.status(200).json({ msg: "Pago actualizado correctamente", pago });
  } catch (error) {
    console.error("Error al actualizar pago:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

exports.deletePago = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id);
    if (!pago) return res.status(404).json({ msg: "Pago no encontrado" });
    await Pago.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Pago eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};
