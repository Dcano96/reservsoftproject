const mongoose = require("mongoose");

const PagoSchema = new mongoose.Schema({
  monto: { 
    type: Number, 
    required: true, 
    min: 0,
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: props => `El monto del pago (${props.value}) no puede ser negativo`
    }
  },
  fecha: { 
    type: Date, 
    default: Date.now,
    required: true
  },
  // El campo reserva es una referencia a la colección "Reserva"
  reserva: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Reserva", 
    required: true,
    index: true // Añadimos un índice para mejorar el rendimiento en búsquedas
  },
  estado: { 
    type: String, 
    enum: ["pendiente", "realizado", "fallido", "anulado"], 
    default: "pendiente",
    required: true
  },
  metodo_pago: {
    type: String,
    enum: ["efectivo", "tarjeta", "transferencia", "otro"],
    default: "efectivo"
  },
  comprobante: {
    type: String, // URL o identificador del comprobante de pago
    default: ""
  },
  notas: {
    type: String,
    default: ""
  }
}, { 
  timestamps: true, // Añade createdAt y updatedAt
  toJSON: { 
    virtuals: true, // Incluir campos virtuales al convertir a JSON
    transform: function(doc, ret) {
      ret.id = ret._id; // Añadir id como alias de _id
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Campo virtual para calcular el faltante basado en la reserva asociada
PagoSchema.virtual('faltante').get(function() {
  if (this.reserva && typeof this.reserva === 'object' && this.reserva.total) {
    return this.reserva.total - (this.reserva.pagos_parciales || 0);
  }
  return 0;
});

// Middleware pre-save para validar que el monto no exceda el total de la reserva
PagoSchema.pre('save', async function(next) {
  try {
    if (this.isNew || this.isModified('monto')) {
      // Solo validar si es un nuevo documento o si se modificó el monto
      const Reserva = mongoose.model('Reserva');
      const reserva = await Reserva.findById(this.reserva);
      
      if (reserva) {
        const pagosActuales = reserva.pagos_parciales || 0;
        const nuevoTotal = pagosActuales + this.monto;
        
        // Si es una actualización, restar el monto anterior
        if (!this.isNew && this._previousMonto) {
          nuevoTotal -= this._previousMonto;
        }
        
        PagoSchema.methods.verificarExcedente = async function () {
  const reserva = await Reserva.findById(this.reserva)
  if (!reserva) return { excede: false, mensaje: "Reserva no encontrada" }

  const totalPendiente = reserva.total - reserva.pagos_parciales

  if (this.monto > totalPendiente) {
    const excedente = this.monto - totalPendiente
    return {
      excede: true,
      excedente,
      mensaje: `El pago excede en ${excedente.toLocaleString("es-CO")} el total pendiente de la reserva`,
      totalPendiente,
    }
  }

  return { excede: false, totalPendiente }
}
        
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Método estático para calcular el total de pagos de una reserva
PagoSchema.statics.calcularTotalPagos = async function(reservaId) {
  const pagos = await this.find({ 
    reserva: reservaId,
    estado: { $in: ['realizado', 'pendiente'] }
  });
  
  return pagos.reduce((total, pago) => total + pago.monto, 0);
};

// Método de instancia para anular un pago
PagoSchema.methods.anular = async function() {
  this.estado = 'anulado';
  
  // Actualizar la reserva asociada
  const Reserva = mongoose.model('Reserva');
  const reserva = await Reserva.findById(this.reserva);
  
  if (reserva && this.estado !== 'anulado') {
    reserva.pagos_parciales -= this.monto;
    if (reserva.pagos_parciales < 0) reserva.pagos_parciales = 0;
    await reserva.save();
  }
  
  return this.save();
};

module.exports = mongoose.model("Pago", PagoSchema);