const mongoose = require("mongoose")
const Pago = require("./pago.model")
const Reserva = require("../reservas/reserva.model")

// Función auxiliar para validar que un id sea un ObjectId válido
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

// Función auxiliar para verificar si la reserva está completamente pagada
const verificarPagoCompleto = async (reservaId) => {
  try {
    const reserva = await Reserva.findById(reservaId)
    if (!reserva) return false

    // Verificar si los pagos parciales igualan al total de la reserva
    return Math.abs(reserva.pagos_parciales - reserva.total) < 0.01 // Tolerancia para errores de redondeo
  } catch (error) {
    console.error("Error al verificar pago completo:", error)
    return false
  }
}

// Función para actualizar el estado de los pagos de una reserva
const actualizarEstadoPagos = async (reservaId) => {
  try {
    const esPagoCompleto = await verificarPagoCompleto(reservaId)

    if (esPagoCompleto) {
      // Actualizar todos los pagos pendientes a realizados
      await Pago.updateMany(
        {
          reserva: reservaId,
          estado: "pendiente",
        },
        {
          estado: "realizado",
        },
      )

      return true
    }
    return false
  } catch (error) {
    console.error("Error al actualizar estado de pagos:", error)
    return false
  }
}

exports.createPago = async (req, res) => {
  try {
    // Validamos que el campo reserva tenga un ObjectId válido
    if (!isValidObjectId(req.body.reserva)) {
      return res.status(400).json({ msg: "El valor proporcionado para 'reserva' no es un ObjectId válido." })
    }

    // Buscamos la reserva asociada
    const reserva = await Reserva.findById(req.body.reserva)
    if (!reserva) {
      return res.status(404).json({ msg: "Reserva no encontrada" })
    }

    // Calculamos el pago parcial y el faltante según la reserva
    const pagoParcial = req.body.monto || reserva.pagos_parciales
    const faltante = reserva.total - (reserva.pagos_parciales + pagoParcial)

    // Formateamos los valores en pesos colombianos
    const formatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })
    const pagoParcialFormatted = formatter.format(pagoParcial)
    const faltanteFormatted = formatter.format(faltante)

    // Creamos el pago utilizando el valor de pago parcial
    const pago = new Pago({
      ...req.body,
      monto: pagoParcial, // se asigna el monto especificado o el pago parcial de la reserva
    })

    await pago.save()

    // Actualizar el campo pagos_parciales de la reserva
    reserva.pagos_parciales += pagoParcial
    await reserva.save()

    // Verificar si con este pago se completa el total y actualizar estados
    const pagoCompletado = await actualizarEstadoPagos(reserva._id)

    // Si el pago se completó, actualizar el estado del pago actual también
    if (pagoCompletado && pago.estado === "pendiente") {
      pago.estado = "realizado"
      await pago.save()
    }

    // Populamos la información completa de la reserva
    await pago.populate({ path: "reserva", model: "Reserva" })

    res.status(201).json({
      msg: pagoCompletado
        ? "Pago creado correctamente. La reserva ha sido pagada completamente."
        : "Pago creado correctamente",
      pago: {
        ...pago.toObject(),
        pagoParcial: pagoParcialFormatted,
        faltante: faltanteFormatted,
      },
    })
  } catch (error) {
    console.error("Error al crear pago:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

exports.getPagos = async (req, res) => {
  try {
    const pagos = await Pago.find().populate({ path: "reserva", model: "Reserva" })
    res.status(200).json(pagos)
  } catch (error) {
    console.error("Error al obtener pagos:", error)
    res.status(500).json({ msg: "Error al obtener pagos" })
  }
}

exports.getPagoById = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id).populate({ path: "reserva", model: "Reserva" })
    if (!pago) return res.status(404).json({ msg: "Pago no encontrado" })
    res.status(200).json(pago)
  } catch (error) {
    console.error("Error al obtener pago:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

exports.updatePago = async (req, res) => {
  try {
    if (req.body.reserva && !isValidObjectId(req.body.reserva)) {
      return res.status(400).json({ msg: "El valor proporcionado para 'reserva' no es un ObjectId válido." })
    }

    // Obtener el pago antes de actualizarlo
    const pagoAnterior = await Pago.findById(req.params.id)
    if (!pagoAnterior) return res.status(404).json({ msg: "Pago no encontrado" })

    // Actualizar el pago
    const pago = await Pago.findByIdAndUpdate(req.params.id, req.body, { new: true })

    // Si cambió el monto, actualizar los pagos parciales de la reserva
    if (pagoAnterior.monto !== pago.monto) {
      const reserva = await Reserva.findById(pago.reserva)
      if (reserva) {
        // Restar el monto anterior y sumar el nuevo
        reserva.pagos_parciales = reserva.pagos_parciales - pagoAnterior.monto + pago.monto
        await reserva.save()

        // Verificar si con este cambio se completa el total y actualizar estados
        await actualizarEstadoPagos(reserva._id)
      }
    }

    await pago.populate({ path: "reserva", model: "Reserva" })

    // Verificar nuevamente el estado después de la actualización
    const esPagoCompleto = await verificarPagoCompleto(pago.reserva._id)

    res.status(200).json({
      msg: esPagoCompleto
        ? "Pago actualizado correctamente. La reserva ha sido pagada completamente."
        : "Pago actualizado correctamente",
      pago,
    })
  } catch (error) {
    console.error("Error al actualizar pago:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

exports.deletePago = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id)
    if (!pago) return res.status(404).json({ msg: "Pago no encontrado" })

    const reservaId = pago.reserva

    // Actualizar los pagos parciales de la reserva
    const reserva = await Reserva.findById(reservaId)
    if (reserva) {
      reserva.pagos_parciales -= pago.monto
      // Asegurarse de que no sea negativo
      if (reserva.pagos_parciales < 0) reserva.pagos_parciales = 0
      await reserva.save()
    }

    await Pago.findByIdAndDelete(req.params.id)

    // Verificar el estado de los pagos después de la eliminación
    await actualizarEstadoPagos(reservaId)

    res.status(200).json({ msg: "Pago eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar pago:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// Nuevo endpoint para actualizar manualmente el estado de los pagos de una reserva
exports.actualizarEstadoPagosReserva = async (req, res) => {
  try {
    const { reservaId } = req.params

    if (!isValidObjectId(reservaId)) {
      return res.status(400).json({ msg: "ID de reserva inválido" })
    }

    const reserva = await Reserva.findById(reservaId)
    if (!reserva) {
      return res.status(404).json({ msg: "Reserva no encontrada" })
    }

    const actualizado = await actualizarEstadoPagos(reservaId)

    res.status(200).json({
      msg: actualizado
        ? "Estado de pagos actualizado correctamente. La reserva ha sido pagada completamente."
        : "Estado de pagos verificado. La reserva aún no está completamente pagada.",
      pagoCompleto: actualizado,
    })
  } catch (error) {
    console.error("Error al actualizar estado de pagos:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}
