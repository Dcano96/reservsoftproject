const mongoose = require("mongoose")

const PagoSchema = new mongoose.Schema(
  {
    monto: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (v) => v >= 0,
        message: (props) => `El monto del pago (${props.value}) no puede ser negativo`,
      },
    },
    fecha: {
      type: Date,
      default: Date.now,
      required: true,
    },
    reserva: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reserva",
      required: true,
      index: true,
    },
    estado: {
      type: String,
      enum: ["realizado", "fallido", "anulado"],
      default: "realizado",
      required: true,
    },
    metodo_pago: {
      type: String,
      enum: ["efectivo", "tarjeta", "transferencia", "otro"],
      default: "transferencia",
    },
    comprobante: {
      type: String,
      default: "",
    },
    notas: {
      type: String,
      default: "",
    },
    // Campos para integración completa
    origen: {
      type: String,
      enum: ["landing", "reservas"],
      default: "reservas",
      required: true,
    },
    tipo_pago: {
      type: String,
      enum: ["primer_pago", "segundo_pago", "pago_completo"],
      default: "pago_completo",
    },
    fecha_comprobante: {
      type: Date,
      required: false,
    },
    fecha_anulacion: {
      type: Date,
      required: false,
    },
    procesado_por: {
      type: String,
      default: "sistema",
    },
    // Campos para preservar historial
    comprobante_original: {
      type: String,
      default: "",
    },
    datos_originales: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

// Campo virtual para calcular el faltante
PagoSchema.virtual("faltante").get(function () {
  if (this.reserva && typeof this.reserva === "object" && this.reserva.total) {
    return this.reserva.total - (this.reserva.pagos_parciales || 0)
  }
  return 0
})

// Método estático para obtener historial completo de pagos (SIN DUPLICADOS)
PagoSchema.statics.obtenerHistorialCompleto = async function (reservaId) {
  const Reserva = mongoose.model("Reserva")
  const reserva = await Reserva.findById(reservaId)

  if (!reserva) {
    throw new Error("Reserva no encontrada")
  }

  // Obtener todos los pagos registrados en el sistema para esta reserva (incluyendo anulados)
  const pagosRegistrados = await this.find({
    reserva: reservaId,
  }).sort({ fecha: 1 })

  // Crear historial integrado sin duplicados
  const historial = []
  const pagosYaAgregados = new Set()

  // Agregar pagos registrados en el sistema
  pagosRegistrados.forEach((pago) => {
    const pagoKey = `${pago.tipo_pago}_${pago.origen}_${pago.monto}_${pago.fecha.getTime()}`
    if (!pagosYaAgregados.has(pagoKey)) {
      // Determinar el comprobante correcto
      let comprobanteUrl = pago.comprobante || pago.comprobante_original

      // Si no tiene comprobante en el pago, buscar en la reserva
      if (!comprobanteUrl) {
        if (pago.origen === "landing" && reserva.comprobante_pago) {
          comprobanteUrl = reserva.comprobante_pago
        } else if (pago.origen === "reservas" && reserva.comprobante_segundo_pago) {
          comprobanteUrl = reserva.comprobante_segundo_pago
        }
      }

      historial.push({
        _id: pago._id,
        tipo: pago.tipo_pago,
        fecha: pago.fecha,
        monto: pago.monto,
        comprobante: comprobanteUrl,
        fecha_comprobante: pago.fecha_comprobante || reserva.fecha_comprobante,
        origen: pago.origen,
        estado: pago.estado,
        metodo_pago: pago.metodo_pago,
        notas: pago.notas,
        procesado_por: pago.procesado_por,
        fecha_anulacion: pago.fecha_anulacion,
      })
      pagosYaAgregados.add(pagoKey)
    }
  })

  // Solo agregar información de la reserva si NO existe ya un pago registrado
  const tieneComprobanteLanding = pagosRegistrados.some((p) => p.origen === "landing" && p.tipo_pago === "primer_pago")
  const tieneComprobanteReservas = pagosRegistrados.some(
    (p) => p.origen === "reservas" && p.tipo_pago === "segundo_pago",
  )

  // Agregar primer pago desde landing si no está registrado
  if (reserva.comprobante_pago && !tieneComprobanteLanding) {
    const montoEstimado = Math.min(reserva.pagos_parciales, reserva.total * 0.5)
    if (montoEstimado > 0) {
      historial.push({
        tipo: "primer_pago",
        fecha: reserva.fecha_primer_pago || reserva.createdAt,
        monto: montoEstimado,
        comprobante: reserva.comprobante_pago,
        fecha_comprobante: reserva.fecha_comprobante,
        origen: "landing",
        estado: "realizado",
        metodo_pago: "transferencia",
        notas: "Pago inicial desde landing page",
        procesado_por: "sistema_landing",
      })
    }
  }

  // Agregar segundo pago desde reservas si no está registrado
  if (reserva.comprobante_segundo_pago && !tieneComprobanteReservas) {
    const montoSegundo = reserva.total - Math.min(reserva.pagos_parciales, reserva.total * 0.5)
    if (montoSegundo > 0) {
      historial.push({
        tipo: "segundo_pago",
        fecha: reserva.fecha_segundo_pago,
        monto: montoSegundo,
        comprobante: reserva.comprobante_segundo_pago,
        origen: "reservas",
        estado: "realizado",
        metodo_pago: "transferencia",
        notas: "Pago final desde módulo de reservas",
        procesado_por: "sistema_reservas",
      })
    }
  }

  // Ordenar por fecha
  historial.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  return {
    reserva: {
      numero_reserva: reserva.numero_reserva,
      titular_reserva: reserva.titular_reserva,
      total: reserva.total,
      pagos_parciales: reserva.pagos_parciales,
      estado: reserva.estado,
    },
    historial,
    resumen: {
      total_pagado: reserva.pagos_parciales,
      total_pendiente: reserva.total - reserva.pagos_parciales,
      porcentaje_pagado: ((reserva.pagos_parciales / reserva.total) * 100).toFixed(2),
      pagos_realizados: historial.filter((p) => p.estado === "realizado").length,
      comprobantes_subidos: historial.filter((p) => p.comprobante).length,
    },
  }
}

// Método estático para sincronizar pagos con reserva (EVITAR DUPLICADOS)
PagoSchema.statics.sincronizarConReserva = async function (reservaId) {
  const Reserva = mongoose.model("Reserva")
  const reserva = await Reserva.findById(reservaId)

  if (!reserva) return false

  // Verificar si ya existen pagos registrados para esta reserva
  const pagosExistentes = await this.find({ reserva: reservaId })

  // Si hay comprobante de primer pago pero no hay registro en pagos
  if (
    reserva.comprobante_pago &&
    !pagosExistentes.some((p) => p.tipo_pago === "primer_pago" && p.origen === "landing")
  ) {
    const montoEstimado = Math.min(reserva.pagos_parciales, reserva.total * 0.5)
    if (montoEstimado > 0) {
      const primerPago = new this({
        monto: montoEstimado,
        fecha: reserva.fecha_primer_pago || reserva.createdAt,
        reserva: reservaId,
        estado: "realizado",
        metodo_pago: "transferencia",
        comprobante: reserva.comprobante_pago,
        comprobante_original: reserva.comprobante_pago,
        fecha_comprobante: reserva.fecha_comprobante,
        origen: "landing",
        tipo_pago: "primer_pago",
        procesado_por: "sistema_sincronizacion",
        notas: "Sincronizado desde landing page",
        datos_originales: {
          reserva_comprobante: reserva.comprobante_pago,
          fecha_original: reserva.fecha_primer_pago,
        },
      })
      await primerPago.save()
    }
  }

  // Si hay segundo pago pero no hay registro
  if (
    reserva.comprobante_segundo_pago &&
    !pagosExistentes.some((p) => p.tipo_pago === "segundo_pago" && p.origen === "reservas")
  ) {
    const montoSegundo = reserva.total - Math.min(reserva.pagos_parciales, reserva.total * 0.5)
    if (montoSegundo > 0) {
      const segundoPago = new this({
        monto: montoSegundo,
        fecha: reserva.fecha_segundo_pago,
        reserva: reservaId,
        estado: "realizado",
        metodo_pago: "transferencia",
        comprobante: reserva.comprobante_segundo_pago,
        comprobante_original: reserva.comprobante_segundo_pago,
        origen: "reservas",
        tipo_pago: "segundo_pago",
        procesado_por: "sistema_sincronizacion",
        notas: "Sincronizado desde módulo de reservas",
        datos_originales: {
          reserva_comprobante: reserva.comprobante_segundo_pago,
          fecha_original: reserva.fecha_segundo_pago,
        },
      })
      await segundoPago.save()
    }
  }

  return true
}

module.exports = mongoose.model("Pago", PagoSchema)
