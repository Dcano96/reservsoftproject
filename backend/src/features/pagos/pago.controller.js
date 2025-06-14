const mongoose = require("mongoose")
const Pago = require("./pago.model")
const Reserva = require("../reservas/reserva.model")

// Función auxiliar para validar ObjectId
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

// Función para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(amount)
}

// Función auxiliar para validar URL de imagen
const validarUrlImagen = (url) => {
  if (!url) return true // URL vacía es válida

  try {
    new URL(url)
    // Verificar que sea una URL de imagen válida
    const extensionesValidas = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"]
    const urlLower = url.toLowerCase()
    return (
      extensionesValidas.some((ext) => urlLower.includes(ext)) ||
      urlLower.includes("blob") ||
      urlLower.includes("data:image") ||
      urlLower.includes("cloudinary") ||
      urlLower.includes("imgur") ||
      urlLower.includes("amazonaws")
    )
  } catch {
    return false
  }
}

// Crear un nuevo pago
exports.createPago = async (req, res) => {
  try {
    const { reserva: reservaId, monto, metodo_pago, comprobante, notas, origen = "admin" } = req.body

    // Validar reserva
    if (!isValidObjectId(reservaId)) {
      return res.status(400).json({ msg: "El valor proporcionado para 'reserva' no es un ObjectId válido." })
    }

    const reserva = await Reserva.findById(reservaId)
    if (!reserva) {
      return res.status(404).json({ msg: "Reserva no encontrada" })
    }

    // Validar URL del comprobante si se proporciona
    if (comprobante && !validarUrlImagen(comprobante)) {
      return res.status(400).json({
        msg: "La URL del comprobante no es válida. Debe ser una URL de imagen válida.",
      })
    }

    // Verificar que el monto no exceda el pendiente
    const totalPendiente = reserva.total - reserva.pagos_parciales
    if (monto > totalPendiente) {
      return res.status(400).json({
        msg: `El monto (${monto.toLocaleString("es-CO")}) excede el total pendiente (${totalPendiente.toLocaleString("es-CO")})`,
      })
    }

    // Determinar tipo de pago
    let tipo_pago = "pago_parcial"
    if (reserva.pagos_parciales === 0) {
      tipo_pago = "primer_pago"
    } else if (monto === totalPendiente) {
      tipo_pago = "segundo_pago"
    }

    // Crear el pago
    const nuevoPago = new Pago({
      monto,
      reserva: reservaId,
      estado: comprobante ? "realizado" : "pendiente",
      metodo_pago: metodo_pago || "transferencia",
      comprobante: comprobante || "",
      comprobante_original: comprobante || "",
      fecha_comprobante: comprobante ? new Date() : null,
      notas: notas || "",
      origen,
      tipo_pago,
      procesado_por: req.user?.nombre || "admin",
    })

    await nuevoPago.save()

    // Actualizar la reserva
    reserva.pagos_parciales += monto

    // Si se completa el pago, actualizar estado
    if (reserva.pagos_parciales >= reserva.total) {
      reserva.estado = "confirmada"
      if (!reserva.fecha_segundo_pago) {
        reserva.fecha_segundo_pago = new Date()
      }
    }

    await reserva.save()

    // Verificar si con este pago se completa el total y actualizar estados
    const pagoCompletado = await actualizarEstadoPagos(reserva._id)

    // Si el pago se completó, actualizar el estado del pago actual también
    if (pagoCompletado && nuevoPago.estado === "pendiente") {
      nuevoPago.estado = "realizado"
      await nuevoPago.save()
    }

    // Poblar la información de la reserva
    await nuevoPago.populate("reserva")

    res.status(201).json({
      msg: pagoCompletado
        ? "Pago creado correctamente. La reserva ha sido pagada completamente."
        : "Pago creado correctamente",
      pago: {
        ...nuevoPago.toObject(),
        pagoParcial: formatCurrency(monto),
        faltante: formatCurrency(reserva.total - reserva.pagos_parciales),
        comprobante_disponible: !!nuevoPago.comprobante,
      },
      resumen: {
        total_reserva: formatCurrency(reserva.total),
        total_pagado: formatCurrency(reserva.pagos_parciales),
        pendiente: formatCurrency(reserva.total - reserva.pagos_parciales),
        estado_reserva: reserva.estado,
      },
    })
  } catch (error) {
    console.error("Error al crear pago:", error)
    res.status(500).json({
      msg: "Error interno del servidor",
      error: error.message,
    })
  }
}

// Obtener todos los pagos con información completa
exports.getPagos = async (req, res) => {
  try {
    const { reserva, estado, origen, page = 1, limit = 5 } = req.query

    // Construir filtros
    const filtros = {}
    if (reserva && isValidObjectId(reserva)) {
      filtros.reserva = reserva
    }
    if (estado) {
      filtros.estado = estado
    }
    if (origen) {
      filtros.origen = origen
    }

    // Paginación
    const skip = (page - 1) * limit

    // Obtener pagos con información de reserva
    const pagos = await Pago.find(filtros)
      .populate({
        path: "reserva",
        select:
          "numero_reserva titular_reserva total pagos_parciales estado fecha_inicio fecha_fin comprobante_pago comprobante_segundo_pago fecha_comprobante",
      })
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Pago.countDocuments(filtros)

    // Agregar información calculada y comprobantes correctos
    const pagosConInfo = pagos.map((pago) => {
      let comprobanteUrl = pago.comprobante || pago.comprobante_original

      // Si no tiene comprobante en el pago, buscar en la reserva según el origen
      if (!comprobanteUrl && pago.reserva) {
        if (pago.origen === "landing" && pago.reserva.comprobante_pago) {
          comprobanteUrl = pago.reserva.comprobante_pago
        } else if (pago.origen === "reservas" && pago.reserva.comprobante_segundo_pago) {
          comprobanteUrl = pago.reserva.comprobante_segundo_pago
        }
      }

      return {
        ...pago.toObject(),
        comprobante: comprobanteUrl,
        comprobante_disponible: !!comprobanteUrl,
        comprobante_valido: comprobanteUrl ? validarUrlImagen(comprobanteUrl) : false,
        faltante: pago.reserva ? pago.reserva.total - pago.reserva.pagos_parciales : 0,
        porcentaje_pagado: pago.reserva ? ((pago.reserva.pagos_parciales / pago.reserva.total) * 100).toFixed(2) : 0,
      }
    })

    res.status(200).json({
      pagos: pagosConInfo,
      pagination: {
        current_page: Number.parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener pagos:", error)
    res.status(500).json({
      msg: "Error al obtener pagos",
      error: error.message,
    })
  }
}

// Obtener historial completo de una reserva
exports.getHistorialReserva = async (req, res) => {
  try {
    const { reservaId } = req.params

    if (!isValidObjectId(reservaId)) {
      return res.status(400).json({
        msg: "ID de reserva inválido",
      })
    }

    // Sincronizar pagos antes de obtener historial
    await Pago.sincronizarConReserva(reservaId)

    // Obtener historial completo
    const historial = await Pago.obtenerHistorialCompleto(reservaId)

    // Validar comprobantes en el historial
    if (historial.historial) {
      historial.historial = historial.historial.map((item) => ({
        ...item,
        comprobante_valido: item.comprobante ? validarUrlImagen(item.comprobante) : false,
      }))
    }

    res.status(200).json({
      msg: "Historial obtenido correctamente",
      ...historial,
    })
  } catch (error) {
    console.error("Error al obtener historial:", error)
    res.status(500).json({
      msg: "Error al obtener historial de pagos",
      error: error.message,
    })
  }
}

// Obtener un pago específico
exports.getPagoById = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id).populate({
      path: "reserva",
      model: "Reserva",
      select:
        "numero_reserva titular_reserva total pagos_parciales estado fecha_inicio fecha_fin comprobante_pago comprobante_segundo_pago fecha_comprobante",
    })

    if (!pago) return res.status(404).json({ msg: "Pago no encontrado" })

    // Agregar comprobante correcto según origen
    let comprobanteUrl = pago.comprobante || pago.comprobante_original
    if (!comprobanteUrl && pago.reserva) {
      if (pago.origen === "landing" && pago.reserva.comprobante_pago) {
        comprobanteUrl = pago.reserva.comprobante_pago
      } else if (pago.origen === "reservas" && pago.reserva.comprobante_segundo_pago) {
        comprobanteUrl = pago.reserva.comprobante_segundo_pago
      }
    }

    const pagoConInfo = {
      ...pago.toObject(),
      comprobante: comprobanteUrl,
      comprobante_disponible: !!comprobanteUrl,
      comprobante_valido: comprobanteUrl ? validarUrlImagen(comprobanteUrl) : false,
      faltante: pago.reserva ? pago.reserva.total - pago.reserva.pagos_parciales : 0,
      porcentaje_pagado: pago.reserva ? ((pago.reserva.pagos_parciales / pago.reserva.total) * 100).toFixed(2) : 0,
    }

    res.status(200).json(pagoConInfo)
  } catch (error) {
    console.error("Error al obtener pago:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// Actualizar un pago
exports.updatePago = async (req, res) => {
  try {
    if (req.body.reserva && !isValidObjectId(req.body.reserva)) {
      return res.status(400).json({ msg: "El valor proporcionado para 'reserva' no es un ObjectId válido." })
    }

    // Validar URL del comprobante si se proporciona
    if (req.body.comprobante && !validarUrlImagen(req.body.comprobante)) {
      return res.status(400).json({
        msg: "La URL del comprobante no es válida. Debe ser una URL de imagen válida.",
      })
    }

    // Obtener el pago antes de actualizarlo
    const pagoAnterior = await Pago.findById(req.params.id)
    if (!pagoAnterior) return res.status(404).json({ msg: "Pago no encontrado" })

    // Preparar datos de actualización
    const datosActualizacion = { ...req.body }

    // Si se está actualizando el comprobante, preservar el original
    if (req.body.comprobante && req.body.comprobante !== pagoAnterior.comprobante) {
      if (!pagoAnterior.comprobante_original) {
        datosActualizacion.comprobante_original = pagoAnterior.comprobante || req.body.comprobante
      }
      datosActualizacion.fecha_comprobante = new Date()
    }

    // Actualizar el pago
    const pago = await Pago.findByIdAndUpdate(req.params.id, datosActualizacion, { new: true })

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
      pago: {
        ...pago.toObject(),
        comprobante_disponible: !!(pago.comprobante || pago.comprobante_original),
        comprobante_valido: pago.comprobante ? validarUrlImagen(pago.comprobante) : false,
      },
    })
  } catch (error) {
    console.error("Error al actualizar pago:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// Anular un pago (MARCAR COMO ANULADO, NO ELIMINAR)
exports.anularPago = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de pago inválido",
      })
    }

    const pago = await Pago.findById(id)
    if (!pago) {
      return res.status(404).json({
        msg: "Pago no encontrado",
      })
    }

    if (pago.estado === "anulado") {
      return res.status(400).json({
        msg: "El pago ya está anulado",
      })
    }

    // Marcar como anulado en lugar de eliminar
    pago.estado = "anulado"
    pago.fecha_anulacion = new Date()
    await pago.save()

    // Actualizar reserva
    const reserva = await Reserva.findById(pago.reserva)
    if (reserva) {
      reserva.pagos_parciales -= pago.monto
      if (reserva.pagos_parciales < 0) reserva.pagos_parciales = 0
      await reserva.save()
    }

    res.status(200).json({ msg: "Pago anulado correctamente" })
  } catch (error) {
    console.error("Error al anular pago:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// Sincronizar todos los pagos
exports.sincronizarPagos = async (req, res) => {
  try {
    const reservas = await Reserva.find({})
    let sincronizados = 0

    for (const reserva of reservas) {
      const resultado = await Pago.sincronizarConReserva(reserva._id)
      if (resultado) sincronizados++
    }

    res.status(200).json({
      msg: `Sincronización completada. ${sincronizados} reservas procesadas.`,
      total_reservas: reservas.length,
      sincronizados,
    })
  } catch (error) {
    console.error("Error en sincronización:", error)
    res.status(500).json({
      msg: "Error en la sincronización",
      error: error.message,
    })
  }
}

// Obtener estadísticas de pagos
exports.getEstadisticas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query

    const filtroFecha = {}
    if (fecha_inicio && fecha_fin) {
      filtroFecha.fecha = {
        $gte: new Date(fecha_inicio),
        $lte: new Date(fecha_fin),
      }
    }

    const estadisticas = await Pago.aggregate([
      { $match: filtroFecha },
      {
        $group: {
          _id: "$estado",
          total_pagos: { $sum: 1 },
          monto_total: { $sum: "$monto" },
          promedio: { $avg: "$monto" },
        },
      },
    ])

    const estadisticasPorOrigen = await Pago.aggregate([
      { $match: filtroFecha },
      {
        $group: {
          _id: "$origen",
          total_pagos: { $sum: 1 },
          monto_total: { $sum: "$monto" },
        },
      },
    ])

    // Estadísticas de comprobantes
    const estadisticasComprobantes = await Pago.aggregate([
      { $match: filtroFecha },
      {
        $group: {
          _id: null,
          total_con_comprobante: {
            $sum: {
              $cond: [{ $or: [{ $ne: ["$comprobante", ""] }, { $ne: ["$comprobante_original", ""] }] }, 1, 0],
            },
          },
          total_sin_comprobante: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$comprobante", ""] }, { $eq: ["$comprobante_original", ""] }] }, 1, 0],
            },
          },
        },
      },
    ])

    res.status(200).json({
      por_estado: estadisticas,
      por_origen: estadisticasPorOrigen,
      comprobantes: estadisticasComprobantes[0] || { total_con_comprobante: 0, total_sin_comprobante: 0 },
    })
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    res.status(500).json({
      msg: "Error al obtener estadísticas",
      error: error.message,
    })
  }
}

// Nuevo endpoint para validar comprobante
exports.validarComprobante = async (req, res) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ msg: "URL es requerida" })
    }

    const esValida = validarUrlImagen(url)

    if (!esValida) {
      return res.status(400).json({
        msg: "URL de imagen no válida",
        valida: false,
      })
    }

    res.status(200).json({
      msg: "URL válida",
      valida: true,
      url: url,
    })
  } catch (error) {
    console.error("Error al validar comprobante:", error)
    res.status(500).json({
      msg: "Error al validar comprobante",
      error: error.message,
    })
  }
}
