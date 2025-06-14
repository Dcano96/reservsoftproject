const mongoose = require("mongoose")

const AcompananteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    match: [/^[a-zA-ZÀ-ÿ\s]+$/, "El nombre solo puede contener letras y espacios"],
  },
  apellido: {
    type: String,
    required: true,
    match: [/^[a-zA-ZÀ-ÿ\s]+$/, "El apellido solo puede contener letras y espacios"],
  },
  documento: {
    type: String,
    required: true,
  },
})

const ReservaSchema = new mongoose.Schema(
  {
    numero_reserva: { type: Number, unique: true },
    titular_reserva: {
      type: String,
      required: true,
      match: [/^[a-zA-ZÀ-ÿ\s]+$/, "El nombre solo puede contener letras y espacios"],
    },
    titular_documento: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, "Por favor ingrese un correo electrónico válido"],
    },
    telefono: {
      type: String,
      match: [/^\+?[0-9\s\-$$]+$/, "Por favor ingrese un número de teléfono válido"],
    },
    fecha_inicio: {
      type: Date,
      required: true,
    },
    fecha_fin: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return this.fecha_inicio && value > this.fecha_inicio
        },
        message: "La fecha fin debe ser mayor que la fecha de inicio",
      },
    },
    apartamentos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Apartamento",
      },
    ],
    noches_estadia: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
    pagos_parciales: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          return value <= this.total
        },
        message: "Los pagos parciales no pueden superar el total de la reserva",
      },
    },
    estado: {
      type: String,
      enum: ["pendiente", "cancelada", "confirmada"],
      required: true,
    },
    acompanantes: { type: [AcompananteSchema], default: [] },
    numero_acompanantes: { type: Number, default: 0 },

    // ===== CAMPOS AGREGADOS PARA COMPROBANTES Y FECHAS =====
    // Fechas de pagos
    fecha_primer_pago: {
      type: Date,
      required: false,
    },
    fecha_segundo_pago: {
      type: Date,
      required: false,
    },

    // Comprobantes de pago
    comprobante_pago: {
      type: String, // URL del comprobante
      required: false,
    },
    comprobante_segundo_pago: {
      type: String, // URL del segundo comprobante
      required: false,
    },

    // Fecha cuando se subió el comprobante
    fecha_comprobante: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Reserva", ReservaSchema)
module.exports.AcompananteSchema = AcompananteSchema
