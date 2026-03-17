const mongoose = require("mongoose");

const PagoSchema = new mongoose.Schema({
  monto: {
    type: Number,
    required: true,
    min: [0, "El monto del pago no puede ser negativo"]
  },
  fecha: {
    type: Date,
    default: Date.now,
    required: true
  },
  reserva: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reserva",
    required: true,
    index: true
  },
  estado: {
    type: String,
    enum: ["pendiente", "realizado", "fallido", "anulado", "rechazado"],
    default: "pendiente",
    required: true
  },
  metodo_pago: {
    type: String,
    enum: ["efectivo", "tarjeta", "transferencia", "nequi", "daviplata", "otro"],
    default: "efectivo"
  },
  comprobante: {
    type: String,
    default: ""
  },
  notas: {
    type: String,
    default: ""
  },
  clienteNombre: {
    type: String,
    default: ""
  },
  verificado_por: {
    type: String,
    default: ""
  },
  fecha_verificacion: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Campo virtual para calcular el faltante basado en la reserva asociada
PagoSchema.virtual('faltante').get(function () {
  if (this.reserva && typeof this.reserva === 'object' && this.reserva.total) {
    return this.reserva.total - (this.reserva.pagos_parciales || 0);
  }
  return 0;
});

// Middleware pre-save para validar que el monto no exceda el saldo pendiente
PagoSchema.pre('save', async function (next) {
  try {
    if (this.isNew || this.isModified('monto')) {
      const Reserva = mongoose.model('Reserva');
      const reserva = await Reserva.findById(this.reserva);

      if (!reserva) {
        return next(new Error('La reserva asociada no fue encontrada'));
      }

      // Calcular el total de pagos activos existentes (excluyendo este si es update)
      const Pago = mongoose.model('Pago');
      const filtro = {
        reserva: this.reserva,
        estado: { $in: ['pendiente', 'realizado'] }
      };

      // Si es una actualización, excluir este pago del cálculo
      if (!this.isNew) {
        filtro._id = { $ne: this._id };
      }

      const pagosExistentes = await Pago.find(filtro);
      const totalPagado = pagosExistentes.reduce((sum, p) => sum + p.monto, 0);
      const saldoPendiente = reserva.total - totalPagado;

      if (this.monto > saldoPendiente + 0.01) { // Tolerancia de redondeo
        return next(new Error(
          `El monto ($${this.monto.toLocaleString("es-CO")}) excede el saldo pendiente ($${saldoPendiente.toLocaleString("es-CO")})`
        ));
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Método estático: calcular el total de pagos activos de una reserva
PagoSchema.statics.calcularTotalPagos = async function (reservaId) {
  const pagos = await this.find({
    reserva: reservaId,
    estado: { $in: ['realizado', 'pendiente'] }
  });
  return pagos.reduce((total, pago) => total + pago.monto, 0);
};

// Método estático: obtener resumen financiero de una reserva
PagoSchema.statics.obtenerResumenFinanciero = async function (reservaId) {
  const Reserva = mongoose.model('Reserva');
  const reserva = await Reserva.findById(reservaId);

  if (!reserva) return null;

  const pagos = await this.find({
    reserva: reservaId,
    estado: { $in: ['realizado', 'pendiente'] }
  });

  const totalAbonado = pagos.reduce((sum, p) => sum + p.monto, 0);

  return {
    totalReserva: reserva.total,
    totalAbonado,
    saldoPendiente: reserva.total - totalAbonado,
    porcentajePagado: reserva.total > 0 ? Math.round((totalAbonado / reserva.total) * 100) : 0,
    cantidadPagos: pagos.length,
    estadoReserva: reserva.estado
  };
};

// Método de instancia para anular un pago
PagoSchema.methods.anular = async function () {
  const estadoAnterior = this.estado;
  this.estado = 'anulado';

  // Solo actualizar la reserva si el pago estaba activo
  if (estadoAnterior !== 'anulado' && estadoAnterior !== 'rechazado') {
    const Reserva = mongoose.model('Reserva');
    const reserva = await Reserva.findById(this.reserva);

    if (reserva) {
      reserva.pagos_parciales = Math.max(0, reserva.pagos_parciales - this.monto);
      await reserva.save();
    }
  }

  return this.save();
};

module.exports = mongoose.model("Pago", PagoSchema);