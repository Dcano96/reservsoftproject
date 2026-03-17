const mongoose = require("mongoose")
const Pago = require("./pago.model")
const Reserva = require("../reservas/reserva.model")

// Función auxiliar para validar ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

// Función para sincronizar pagos_parciales y estado de la reserva
const sincronizarReserva = async (reservaId) => {
  try {
    const reserva = await Reserva.findById(reservaId)
    if (!reserva) return null

    // Calcular total pagado desde la colección de pagos
    const totalPagado = await Pago.calcularTotalPagos(reservaId)

    // Actualizar pagos_parciales en la reserva
    reserva.pagos_parciales = totalPagado

    // Auto-actualizar estado de la reserva
    if (Math.abs(totalPagado - reserva.total) < 0.01 && reserva.total > 0) {
      // Pago completo: marcar como confirmada
      if (reserva.estado === "pendiente") {
        reserva.estado = "confirmada"
      }
    }

    await reserva.save()
    return reserva
  } catch (error) {
    console.error("Error al sincronizar reserva:", error)
    return null
  }
}

// ========================
// CRUD existente (mejorado)
// ========================

exports.createPago = async (req, res) => {
  try {
    // Validar que reserva sea un ObjectId válido
    if (!isValidObjectId(req.body.reserva)) {
      return res.status(400).json({ msg: "El valor proporcionado para 'reserva' no es un ObjectId válido." })
    }

    // Buscar la reserva asociada
    const reserva = await Reserva.findById(req.body.reserva)
    if (!reserva) {
      return res.status(404).json({ msg: "Reserva no encontrada" })
    }

    // Validar que se proporcione monto
    const monto = parseFloat(req.body.monto)
    if (!monto || monto <= 0) {
      return res.status(400).json({ msg: "El monto del pago es obligatorio y debe ser mayor a 0" })
    }

    // Calcular saldo pendiente actual
    const totalPagado = await Pago.calcularTotalPagos(reserva._id)
    const saldoPendiente = reserva.total - totalPagado

    // Verificar que no exceda el saldo
    if (monto > saldoPendiente + 0.01) {
      const formatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })
      return res.status(400).json({
        msg: `El monto (${formatter.format(monto)}) excede el saldo pendiente (${formatter.format(saldoPendiente)})`,
        saldoPendiente
      })
    }

    // Validar primer pago mínimo del 50%
    const esPrimerPago = totalPagado === 0
    if (esPrimerPago) {
      const minimo50 = reserva.total * 0.50
      if (monto < minimo50 - 0.01) {
        const formatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })
        return res.status(400).json({
          msg: `El primer pago debe ser mínimo el 50% del total de la reserva (${formatter.format(minimo50)})`,
          minimoRequerido: minimo50,
          totalReserva: reserva.total
        })
      }
    }

    // Crear el pago
    const pago = new Pago({
      monto,
      fecha: req.body.fecha || Date.now(),
      reserva: req.body.reserva,
      estado: req.body.estado || "pendiente",
      metodo_pago: req.body.metodo_pago || "efectivo",
      comprobante: req.body.comprobante || "",
      notas: req.body.notas || "",
      clienteNombre: req.body.clienteNombre || reserva.titular_reserva || "",
    })

    await pago.save()

    // Sincronizar pagos_parciales y estado de la reserva
    const reservaActualizada = await sincronizarReserva(reserva._id)

    // Obtener resumen financiero actualizado
    const resumen = await Pago.obtenerResumenFinanciero(reserva._id)

    // Populate la reserva en el pago para la respuesta
    await pago.populate({ path: "reserva", model: "Reserva" })

    const formatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })

    res.status(201).json({
      msg: resumen && resumen.saldoPendiente <= 0.01
        ? "Pago creado correctamente. La reserva ha sido pagada completamente."
        : "Pago creado correctamente",
      pago: {
        ...pago.toObject(),
        pagoParcial: formatter.format(monto),
        faltante: formatter.format(resumen ? resumen.saldoPendiente : 0),
      },
      resumen
    })
  } catch (error) {
    console.error("Error al crear pago:", error)
    if (error.message && error.message.includes("excede")) {
      return res.status(400).json({ msg: error.message })
    }
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

exports.getPagos = async (req, res) => {
  try {
    // Soportar filtro por reserva: GET /api/pagos?reserva=ID
    const filtro = {}
    if (req.query.reserva) {
      if (!isValidObjectId(req.query.reserva)) {
        return res.status(400).json({ msg: "ID de reserva inválido" })
      }
      filtro.reserva = req.query.reserva
    }

    const pagos = await Pago.find(filtro)
      .populate({ path: "reserva", model: "Reserva" })
      .sort({ createdAt: -1 })

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

    const reservaId = pagoAnterior.reserva

    // Actualizar el pago
    const pago = await Pago.findByIdAndUpdate(req.params.id, req.body, { new: true })

    // Sincronizar la reserva si cambió el monto o el estado
    if (pagoAnterior.monto !== pago.monto || pagoAnterior.estado !== pago.estado) {
      await sincronizarReserva(reservaId)
    }

    await pago.populate({ path: "reserva", model: "Reserva" })

    // Obtener resumen financiero
    const resumen = await Pago.obtenerResumenFinanciero(reservaId)

    res.status(200).json({
      msg: resumen && resumen.saldoPendiente <= 0.01
        ? "Pago actualizado correctamente. La reserva ha sido pagada completamente."
        : "Pago actualizado correctamente",
      pago,
      resumen
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

    await Pago.findByIdAndDelete(req.params.id)

    // Sincronizar la reserva después de eliminar
    await sincronizarReserva(reservaId)

    res.status(200).json({ msg: "Pago eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar pago:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// ========================
// Nuevos endpoints
// ========================

// Obtener pagos de una reserva con resumen financiero
exports.getPagosByReserva = async (req, res) => {
  try {
    const { reservaId } = req.params

    if (!isValidObjectId(reservaId)) {
      return res.status(400).json({ msg: "ID de reserva inválido" })
    }

    const reserva = await Reserva.findById(reservaId).populate("apartamentos")
    if (!reserva) {
      return res.status(404).json({ msg: "Reserva no encontrada" })
    }

    const pagos = await Pago.find({ reserva: reservaId })
      .sort({ createdAt: -1 })

    const resumen = await Pago.obtenerResumenFinanciero(reservaId)

    res.status(200).json({
      reserva,
      pagos,
      resumen
    })
  } catch (error) {
    console.error("Error al obtener pagos de la reserva:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// Verificar (aprobar/rechazar) un pago — acción de admin
exports.verificarPago = async (req, res) => {
  try {
    const { id } = req.params
    const { estado, notas } = req.body

    if (!["realizado", "rechazado"].includes(estado)) {
      return res.status(400).json({
        msg: "El estado de verificación debe ser 'realizado' o 'rechazado'"
      })
    }

    const pago = await Pago.findById(id)
    if (!pago) return res.status(404).json({ msg: "Pago no encontrado" })

    if (pago.estado !== "pendiente") {
      return res.status(400).json({
        msg: `Solo se pueden verificar pagos en estado 'pendiente'. El pago está en estado '${pago.estado}'`
      })
    }

    // Actualizar estado del pago
    pago.estado = estado
    pago.fecha_verificacion = new Date()
    pago.verificado_por = req.body.verificado_por || "admin"
    if (notas) pago.notas = notas

    await pago.save()

    // Si se rechazó, sincronizar la reserva (restar del total pagado)
    await sincronizarReserva(pago.reserva)

    await pago.populate({ path: "reserva", model: "Reserva" })

    const resumen = await Pago.obtenerResumenFinanciero(pago.reserva._id || pago.reserva)

    res.status(200).json({
      msg: estado === "realizado"
        ? "Pago verificado y aprobado correctamente"
        : "Pago rechazado",
      pago,
      resumen
    })
  } catch (error) {
    console.error("Error al verificar pago:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// Registrar pago manual (admin registra un pago en efectivo u otro medio)
exports.registrarPagoManual = async (req, res) => {
  try {
    const { reserva, monto, metodo_pago, notas, clienteNombre } = req.body

    if (!reserva || !isValidObjectId(reserva)) {
      return res.status(400).json({ msg: "ID de reserva válido es obligatorio" })
    }

    const montoNum = parseFloat(monto)
    if (!montoNum || montoNum <= 0) {
      return res.status(400).json({ msg: "El monto es obligatorio y debe ser mayor a 0" })
    }

    const reservaDoc = await Reserva.findById(reserva)
    if (!reservaDoc) {
      return res.status(404).json({ msg: "Reserva no encontrada" })
    }

    // Calcular saldo pendiente
    const totalPagado = await Pago.calcularTotalPagos(reserva)
    const saldoPendiente = reservaDoc.total - totalPagado

    if (montoNum > saldoPendiente + 0.01) {
      const formatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })
      return res.status(400).json({
        msg: `El monto (${formatter.format(montoNum)}) excede el saldo pendiente (${formatter.format(saldoPendiente)})`,
        saldoPendiente
      })
    }

    // Crear pago con estado "realizado" directamente (es manual verificado por admin)
    const pago = new Pago({
      monto: montoNum,
      fecha: new Date(),
      reserva,
      estado: "realizado",
      metodo_pago: metodo_pago || "efectivo",
      notas: notas || "Pago registrado manualmente por administrador",
      clienteNombre: clienteNombre || reservaDoc.titular_reserva || "",
      verificado_por: req.body.verificado_por || "admin",
      fecha_verificacion: new Date()
    })

    await pago.save()

    // Sincronizar reserva
    await sincronizarReserva(reserva)

    await pago.populate({ path: "reserva", model: "Reserva" })

    const resumen = await Pago.obtenerResumenFinanciero(reserva)

    res.status(201).json({
      msg: "Pago manual registrado correctamente",
      pago,
      resumen
    })
  } catch (error) {
    console.error("Error al registrar pago manual:", error)
    if (error.message && error.message.includes("excede")) {
      return res.status(400).json({ msg: error.message })
    }
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// Endpoint para actualizar manualmente el estado de los pagos de una reserva
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

    const reservaActualizada = await sincronizarReserva(reservaId)
    const resumen = await Pago.obtenerResumenFinanciero(reservaId)

    res.status(200).json({
      msg: resumen && resumen.saldoPendiente <= 0.01
        ? "Estado de pagos actualizado correctamente. La reserva ha sido pagada completamente."
        : "Estado de pagos verificado. La reserva aún no está completamente pagada.",
      pagoCompleto: resumen ? resumen.saldoPendiente <= 0.01 : false,
      resumen
    })
  } catch (error) {
    console.error("Error al actualizar estado de pagos:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}
