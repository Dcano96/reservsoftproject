const mongoose = require("mongoose")
const fs = require("fs")
const Pago = require("./pago.model")
const Reserva = require("../reservas/reserva.model")

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)
const formatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })

// ─────────────────────────────────────────────────────────────
// Sincroniza pagos_parciales y estado de la reserva a partir
// del Pago de esa reserva (sumando abonos activos).
// ─────────────────────────────────────────────────────────────
const sincronizarReserva = async (reservaId) => {
  try {
    const reserva = await Reserva.findById(reservaId)
    if (!reserva) return null

    const totalPagado = await Pago.calcularTotalPagos(reservaId)
    reserva.pagos_parciales = totalPagado

    if (Math.abs(totalPagado - reserva.total) < 0.01 && reserva.total > 0) {
      if (reserva.estado === "pendiente") reserva.estado = "confirmada"
    }

    await reserva.save()
    return reserva
  } catch (error) {
    console.error("Error al sincronizar reserva:", error)
    return null
  }
}

// ─────────────────────────────────────────────────────────────
// Helper: crear abono y persistir, validando saldo y reglas.
// reglas:
//   - monto > 0
//   - monto <= saldo pendiente
//   - si es el primer abono activo, monto >= 50% del total reserva
// ─────────────────────────────────────────────────────────────
const construirAbono = ({ monto, metodo_pago, comprobante, origen, estado, notas, verificado_por, fecha_verificacion }) => {
  const abono = {
    monto: Number(monto),
    fecha: new Date(),
    metodo_pago: metodo_pago || "efectivo",
    comprobante: comprobante || "",
    origen: origen || "admin",
    estado: estado || "pendiente",
    notas: notas || "",
  }
  if (verificado_por) abono.verificado_por = verificado_por
  if (fecha_verificacion) abono.fecha_verificacion = fecha_verificacion
  return abono
}

// ============================================================
// CREAR PAGO DESDE LANDING (público, con comprobante)
// ============================================================
exports.crearPagoDesdeLanding = async (req, res) => {
  const limpiarArchivo = () => {
    if (req.file && req.file.path) fs.unlink(req.file.path, () => {})
  }

  try {
    const { reserva, monto, clienteNombre, metodo_pago, notas } = req.body

    if (!reserva || !isValidObjectId(reserva)) {
      limpiarArchivo()
      return res.status(400).json({ msg: "ID de reserva inválido", error: true })
    }

    const montoNum = parseFloat(monto)
    if (!montoNum || montoNum <= 0) {
      limpiarArchivo()
      return res.status(400).json({ msg: "El monto del pago debe ser mayor a 0", error: true })
    }

    if (!req.file) {
      return res.status(400).json({ msg: "El comprobante de pago es obligatorio", error: true })
    }

    const reservaDoc = await Reserva.findById(reserva)
    if (!reservaDoc) {
      limpiarArchivo()
      return res.status(404).json({ msg: "Reserva no encontrada", error: true })
    }

    // Si ya existe un Pago para esta reserva, NO se crea uno nuevo:
    // se agrega un abono al existente. Esto ocurre, por ejemplo, si
    // el cliente reintenta desde la landing.
    const existente = await Pago.findOne({ reserva })
    const totalPagado = existente
      ? (existente.abonos || []).filter((a) => a.estado !== "rechazado").reduce((s, a) => s + a.monto, 0)
      : 0
    const saldoPendiente = reservaDoc.total - totalPagado

    if (montoNum > saldoPendiente + 0.01) {
      limpiarArchivo()
      return res.status(400).json({
        msg: `El monto (${formatter.format(montoNum)}) excede el saldo pendiente (${formatter.format(saldoPendiente)})`,
        error: true,
      })
    }

    const esPrimerAbono = totalPagado === 0
    if (esPrimerAbono) {
      const minimo50 = reservaDoc.total * 0.5
      if (montoNum < minimo50 - 0.01) {
        limpiarArchivo()
        return res.status(400).json({
          msg: `El primer pago debe ser mínimo el 50% del total de la reserva (${formatter.format(minimo50)})`,
          error: true,
        })
      }
    }

    const comprobanteUrl = `/uploads/comprobantes/${req.file.filename}`
    const metodosValidos = ["efectivo", "tarjeta", "transferencia", "nequi", "daviplata", "otro"]
    const metodo = metodosValidos.includes(metodo_pago) ? metodo_pago : "transferencia"

    const nuevoAbono = construirAbono({
      monto: montoNum,
      metodo_pago: metodo,
      comprobante: comprobanteUrl,
      origen: "landing",
      estado: "pendiente",
      notas: notas || "Abono registrado desde la landing - pendiente de verificación",
    })

    let pago
    if (existente) {
      existente.abonos.push(nuevoAbono)
      existente.recalcularDesdeAbonos()
      await existente.save()
      pago = existente
    } else {
      pago = new Pago({
        reserva,
        clienteNombre: clienteNombre || reservaDoc.titular_reserva || "",
        metodo_pago: metodo,
        comprobante: comprobanteUrl,
        notas: notas || "",
        abonos: [nuevoAbono],
      })
      pago.recalcularDesdeAbonos()
      await pago.save()
    }

    await sincronizarReserva(reserva)
    await pago.populate({ path: "reserva", model: "Reserva" })
    const resumen = await Pago.obtenerResumenFinanciero(reserva)

    return res.status(201).json({
      msg: "Pago registrado correctamente. Será verificado por un administrador.",
      pago,
      resumen,
      error: false,
    })
  } catch (error) {
    console.error("Error al crear pago desde landing:", error)
    limpiarArchivo()
    return res.status(500).json({ msg: "Error en el servidor al registrar el pago", error: true })
  }
}

// ============================================================
// AGREGAR ABONO (admin, opcionalmente con comprobante)
// PUT /api/pagos/:id/abono   (multipart/form-data)
// ============================================================
exports.agregarAbono = async (req, res) => {
  const limpiarArchivo = () => {
    if (req.file && req.file.path) fs.unlink(req.file.path, () => {})
  }
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      limpiarArchivo()
      return res.status(400).json({ msg: "ID de pago inválido", error: true })
    }

    const pago = await Pago.findById(id)
    if (!pago) {
      limpiarArchivo()
      return res.status(404).json({ msg: "Pago no encontrado", error: true })
    }

    const reserva = await Reserva.findById(pago.reserva)
    if (!reserva) {
      limpiarArchivo()
      return res.status(404).json({ msg: "Reserva asociada no encontrada", error: true })
    }

    const monto = parseFloat(req.body.monto)
    if (!monto || monto <= 0) {
      limpiarArchivo()
      return res.status(400).json({ msg: "El monto del abono debe ser mayor a 0", error: true })
    }

    const totalPagado = (pago.abonos || []).filter((a) => a.estado !== "rechazado").reduce((s, a) => s + a.monto, 0)
    const saldoPendiente = reserva.total - totalPagado

    if (monto > saldoPendiente + 0.01) {
      limpiarArchivo()
      return res.status(400).json({
        msg: `El monto (${formatter.format(monto)}) excede el saldo pendiente (${formatter.format(saldoPendiente)})`,
        error: true,
      })
    }

    const comprobanteUrl = req.file ? `/uploads/comprobantes/${req.file.filename}` : ""
    const metodosValidos = ["efectivo", "tarjeta", "transferencia", "nequi", "daviplata", "otro"]
    const metodo = metodosValidos.includes(req.body.metodo_pago) ? req.body.metodo_pago : "efectivo"

    const nuevoAbono = construirAbono({
      monto,
      metodo_pago: metodo,
      comprobante: comprobanteUrl,
      origen: "admin",
      // Si el admin lo registra y aporta comprobante, lo dejamos como
      // realizado (es un abono presencial verificado por él mismo).
      estado: "realizado",
      notas: req.body.notas || "Abono registrado por administrador",
      verificado_por: req.body.verificado_por || "admin",
      fecha_verificacion: new Date(),
    })

    pago.abonos.push(nuevoAbono)
    pago.recalcularDesdeAbonos()
    await pago.save()

    await sincronizarReserva(pago.reserva)
    await pago.populate({ path: "reserva", model: "Reserva" })
    const resumen = await Pago.obtenerResumenFinanciero(pago.reserva._id || pago.reserva)

    return res.status(200).json({
      msg: resumen && resumen.saldoPendiente <= 0.01
        ? "Abono registrado. La reserva ha sido pagada completamente."
        : "Abono registrado correctamente.",
      pago,
      resumen,
      error: false,
    })
  } catch (error) {
    console.error("Error al agregar abono:", error)
    limpiarArchivo()
    return res.status(500).json({ msg: "Error en el servidor al registrar el abono", error: true })
  }
}

// ============================================================
// VERIFICAR ABONO (aprobar/rechazar un abono específico del Pago)
// PUT /api/pagos/:id/abono/:abonoId/verificar
// ============================================================
exports.verificarAbono = async (req, res) => {
  try {
    const { id, abonoId } = req.params
    const { estado, notas } = req.body

    if (!["realizado", "rechazado"].includes(estado)) {
      return res.status(400).json({ msg: "Estado debe ser 'realizado' o 'rechazado'", error: true })
    }

    const pago = await Pago.findById(id)
    if (!pago) return res.status(404).json({ msg: "Pago no encontrado", error: true })

    const abono = pago.abonos.id(abonoId)
    if (!abono) return res.status(404).json({ msg: "Abono no encontrado", error: true })

    if (abono.estado !== "pendiente") {
      return res.status(400).json({
        msg: `Solo se pueden verificar abonos en estado 'pendiente'. Este está en '${abono.estado}'`,
        error: true,
      })
    }

    abono.estado = estado
    abono.fecha_verificacion = new Date()
    abono.verificado_por = req.body.verificado_por || "admin"
    if (notas) abono.notas = notas

    pago.recalcularDesdeAbonos()
    await pago.save()
    await sincronizarReserva(pago.reserva)
    await pago.populate({ path: "reserva", model: "Reserva" })
    const resumen = await Pago.obtenerResumenFinanciero(pago.reserva._id || pago.reserva)

    return res.status(200).json({
      msg: estado === "realizado" ? "Abono aprobado correctamente." : "Abono rechazado.",
      pago,
      resumen,
      error: false,
    })
  } catch (error) {
    console.error("Error al verificar abono:", error)
    return res.status(500).json({ msg: "Error en el servidor", error: true })
  }
}

// ============================================================
// CRUD básico
// ============================================================

// Crea un Pago manual (admin) — primer abono sin comprobante.
// Mantenido para compatibilidad; en la práctica el admin debería
// usar agregarAbono sobre el Pago existente.
exports.createPago = async (req, res) => {
  try {
    if (!isValidObjectId(req.body.reserva)) {
      return res.status(400).json({ msg: "ID de reserva inválido", error: true })
    }
    const reserva = await Reserva.findById(req.body.reserva)
    if (!reserva) return res.status(404).json({ msg: "Reserva no encontrada", error: true })

    const monto = parseFloat(req.body.monto)
    if (!monto || monto <= 0) {
      return res.status(400).json({ msg: "El monto del pago es obligatorio y debe ser mayor a 0", error: true })
    }

    let pago = await Pago.findOne({ reserva: reserva._id })
    const totalPagado = pago
      ? (pago.abonos || []).filter((a) => a.estado !== "rechazado").reduce((s, a) => s + a.monto, 0)
      : 0
    const saldoPendiente = reserva.total - totalPagado

    if (monto > saldoPendiente + 0.01) {
      return res.status(400).json({
        msg: `El monto (${formatter.format(monto)}) excede el saldo pendiente (${formatter.format(saldoPendiente)})`,
        error: true,
      })
    }

    const nuevoAbono = construirAbono({
      monto,
      metodo_pago: req.body.metodo_pago || "efectivo",
      origen: "admin",
      estado: req.body.estado || "realizado",
      notas: req.body.notas || "Abono manual",
      verificado_por: req.body.verificado_por || "admin",
      fecha_verificacion: req.body.estado === "pendiente" ? null : new Date(),
    })

    if (pago) {
      pago.abonos.push(nuevoAbono)
    } else {
      pago = new Pago({
        reserva: reserva._id,
        clienteNombre: req.body.clienteNombre || reserva.titular_reserva || "",
        metodo_pago: nuevoAbono.metodo_pago,
        notas: nuevoAbono.notas,
        abonos: [nuevoAbono],
      })
    }

    pago.recalcularDesdeAbonos()
    await pago.save()
    await sincronizarReserva(reserva._id)
    await pago.populate({ path: "reserva", model: "Reserva" })
    const resumen = await Pago.obtenerResumenFinanciero(reserva._id)

    return res.status(201).json({ msg: "Pago creado correctamente", pago, resumen, error: false })
  } catch (error) {
    console.error("Error al crear pago:", error)
    return res.status(500).json({ msg: "Error en el servidor", error: true })
  }
}

exports.getPagos = async (req, res) => {
  try {
    const filtro = {}
    if (req.query.reserva) {
      if (!isValidObjectId(req.query.reserva)) return res.status(400).json({ msg: "ID de reserva inválido" })
      filtro.reserva = req.query.reserva
    }
    const pagos = await Pago.find(filtro).populate({ path: "reserva", model: "Reserva" }).sort({ createdAt: -1 })
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
    const pago = await Pago.findById(req.params.id)
    if (!pago) return res.status(404).json({ msg: "Pago no encontrado" })

    // Solo permitimos actualizar metadatos a nivel de Pago (no abonos)
    const camposPermitidos = ["clienteNombre", "notas", "metodo_pago", "fecha"]
    camposPermitidos.forEach((c) => {
      if (req.body[c] !== undefined) pago[c] = req.body[c]
    })

    // Si llegan campos de abonos directamente, los rechazamos para evitar
    // bypass de la lógica (use agregarAbono / verificarAbono).
    pago.recalcularDesdeAbonos()
    await pago.save()
    await sincronizarReserva(pago.reserva)
    await pago.populate({ path: "reserva", model: "Reserva" })

    res.status(200).json({ msg: "Pago actualizado correctamente", pago })
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
    await sincronizarReserva(reservaId)
    res.status(200).json({ msg: "Pago eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar pago:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

exports.getPagosByReserva = async (req, res) => {
  try {
    const { reservaId } = req.params
    if (!isValidObjectId(reservaId)) return res.status(400).json({ msg: "ID de reserva inválido" })
    const reserva = await Reserva.findById(reservaId).populate("apartamentos")
    if (!reserva) return res.status(404).json({ msg: "Reserva no encontrada" })
    const pagos = await Pago.find({ reserva: reservaId }).sort({ createdAt: -1 })
    const resumen = await Pago.obtenerResumenFinanciero(reservaId)
    res.status(200).json({ reserva, pagos, resumen })
  } catch (error) {
    console.error("Error al obtener pagos de la reserva:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// LEGACY — mantenida para compatibilidad. Internamente delega en createPago.
exports.verificarPago = async (req, res) => {
  // Verifica TODOS los abonos pendientes del Pago.
  try {
    const { id } = req.params
    const { estado } = req.body
    if (!["realizado", "rechazado"].includes(estado)) {
      return res.status(400).json({ msg: "Estado inválido", error: true })
    }
    const pago = await Pago.findById(id)
    if (!pago) return res.status(404).json({ msg: "Pago no encontrado", error: true })

    let cambios = 0
    pago.abonos.forEach((a) => {
      if (a.estado === "pendiente") {
        a.estado = estado
        a.fecha_verificacion = new Date()
        a.verificado_por = req.body.verificado_por || "admin"
        cambios++
      }
    })
    if (cambios === 0) {
      return res.status(400).json({ msg: "No hay abonos pendientes para verificar", error: true })
    }

    pago.recalcularDesdeAbonos()
    await pago.save()
    await sincronizarReserva(pago.reserva)
    await pago.populate({ path: "reserva", model: "Reserva" })
    const resumen = await Pago.obtenerResumenFinanciero(pago.reserva._id || pago.reserva)
    res.status(200).json({ msg: estado === "realizado" ? "Abonos aprobados" : "Abonos rechazados", pago, resumen })
  } catch (error) {
    console.error("Error al verificar pago:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

exports.registrarPagoManual = exports.createPago

exports.actualizarEstadoPagosReserva = async (req, res) => {
  try {
    const { reservaId } = req.params
    if (!isValidObjectId(reservaId)) return res.status(400).json({ msg: "ID de reserva inválido" })
    const reserva = await Reserva.findById(reservaId)
    if (!reserva) return res.status(404).json({ msg: "Reserva no encontrada" })
    await sincronizarReserva(reservaId)
    const resumen = await Pago.obtenerResumenFinanciero(reservaId)
    res.status(200).json({
      msg: resumen && resumen.saldoPendiente <= 0.01
        ? "Estado de pagos actualizado. Reserva pagada completamente."
        : "Estado de pagos verificado.",
      pagoCompleto: resumen ? resumen.saldoPendiente <= 0.01 : false,
      resumen,
    })
  } catch (error) {
    console.error("Error al sincronizar:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}
