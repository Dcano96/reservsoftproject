const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────
// Sub-esquema: cada abono individual del Pago
// Un Pago = una reserva. Dentro tiene N abonos (uno desde la
// landing, otro desde el admin cuando llega el cliente al hotel,
// etc). Cada abono guarda su propio comprobante y verificación.
// ─────────────────────────────────────────────────────────────
const AbonoSchema = new mongoose.Schema({
  monto: {
    type: Number,
    required: true,
    min: [0, "El monto del abono no puede ser negativo"]
  },
  fecha: {
    type: Date,
    default: Date.now,
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
  origen: {
    type: String,
    enum: ["landing", "admin"],
    default: "admin"
  },
  estado: {
    type: String,
    enum: ["pendiente", "realizado", "rechazado"],
    default: "pendiente",
    required: true
  },
  notas: { type: String, default: "" },
  verificado_por: { type: String, default: "" },
  fecha_verificacion: { type: Date }
}, { _id: true, timestamps: true });

const PagoSchema = new mongoose.Schema({
  // monto = suma de los abonos en estado pendiente o realizado
  monto: {
    type: Number,
    required: true,
    default: 0,
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
    unique: true, // un Pago por reserva
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
  // Compatibilidad: comprobante del primer abono. El listado completo
  // de comprobantes vive dentro de `abonos[].comprobante`.
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
  },
  abonos: {
    type: [AbonoSchema],
    default: []
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

// Recalcula `monto` y `estado` global a partir del array de abonos.
// Se invoca antes de guardar para mantener consistencia.
PagoSchema.methods.recalcularDesdeAbonos = function () {
  const activos = (this.abonos || []).filter((a) => a.estado === "pendiente" || a.estado === "realizado");
  this.monto = activos.reduce((sum, a) => sum + (Number(a.monto) || 0), 0);

  if (activos.length === 0) {
    this.estado = "anulado";
  } else {
    const todosRealizados = activos.every((a) => a.estado === "realizado");
    this.estado = todosRealizados ? "realizado" : "pendiente";
  }

  // Mantener `comprobante` legacy = comprobante del primer abono activo
  if (activos.length > 0 && activos[0].comprobante) {
    this.comprobante = activos[0].comprobante;
  }
};

// Calcular el total pagado (pendiente + realizado) de una reserva.
// Mira los abonos activos del único Pago que tenga esa reserva.
PagoSchema.statics.calcularTotalPagos = async function (reservaId) {
  const pago = await this.findOne({ reserva: reservaId });
  if (!pago) return 0;
  const activos = (pago.abonos || []).filter((a) => a.estado === "pendiente" || a.estado === "realizado");
  return activos.reduce((total, a) => total + (Number(a.monto) || 0), 0);
};

// Resumen financiero de una reserva.
PagoSchema.statics.obtenerResumenFinanciero = async function (reservaId) {
  const Reserva = mongoose.model("Reserva");
  const reserva = await Reserva.findById(reservaId);
  if (!reserva) return null;

  const totalAbonado = await this.calcularTotalPagos(reservaId);
  const pago = await this.findOne({ reserva: reservaId });
  const cantidadAbonos = pago ? (pago.abonos || []).filter((a) => a.estado === "pendiente" || a.estado === "realizado").length : 0;

  return {
    totalReserva: reserva.total,
    totalAbonado,
    saldoPendiente: reserva.total - totalAbonado,
    porcentajePagado: reserva.total > 0 ? Math.round((totalAbonado / reserva.total) * 100) : 0,
    cantidadPagos: cantidadAbonos,
    estadoReserva: reserva.estado
  };
};

// Anular el pago completo (y todos sus abonos).
PagoSchema.methods.anular = async function () {
  this.estado = "anulado";
  (this.abonos || []).forEach((a) => {
    if (a.estado !== "rechazado") a.estado = "rechazado";
  });
  this.monto = 0;
  return this.save();
};

module.exports = mongoose.model("Pago", PagoSchema);
