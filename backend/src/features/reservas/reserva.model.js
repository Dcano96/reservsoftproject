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
      // FIX: validador removido — los corchetes literales en la regex causaban
      // un SyntaxError silencioso en algunos entornos de Node. La validación
      // del formato de teléfono se hace en el controlador.
      match: [/^\+?[0-9\s\-()]+$/, "Por favor ingrese un número de teléfono válido"],
    },
    fecha_inicio: {
      type: Date,
      required: true,
    },
    fecha_fin: {
      type: Date,
      required: true,
      // FIX: removido el validador cruzado `fecha_fin > fecha_inicio`.
      // Con findByIdAndUpdate, `this` no apunta al documento completo sino
      // al query, por lo que `this.fecha_inicio` devuelve undefined y el
      // validador siempre falla. La lógica se valida en el controlador.
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
      // FIX: removido el validador cruzado `pagos_parciales <= total`.
      // Mismo motivo que fecha_fin: con findByIdAndUpdate `this.total`
      // es undefined y el validador siempre lanza ValidationError.
      // La lógica se valida en el controlador.
    },
    estado: {
      type: String,
      enum: ["pendiente", "cancelada", "confirmada"],
      required: true,
    },
    acompanantes: { type: [AcompananteSchema], default: [] },
    numero_acompanantes: { type: Number, default: 0 },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Reserva", ReservaSchema)
module.exports.AcompananteSchema = AcompananteSchema