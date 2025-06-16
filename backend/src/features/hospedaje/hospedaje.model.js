const mongoose = require("mongoose")
const Schema = mongoose.Schema

// Esquema para la información de Check‑in/Check‑out
const CheckInDataSchema = new Schema({
  servicio: { type: String, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  observaciones: { type: String },
  estado: { type: String, default: "Disponible" },
})

// Esquema para los Acompañantes
const AcompananteSchema = new Schema({
  nombre: { type: String, required: true },
  apellido: { type: String },
  tipoDocumento: { type: String, enum: ["T.I", "CC", "PP/Visa"], default: "CC" }, // Nuevo campo
  documento: { type: String },
})

// Esquema para la información de Descuento
const DescuentoSchema = new Schema({
  porcentaje: { type: Number },
  precioOriginal: { type: Number },
  precioConDescuento: { type: Number },
})

// Esquema para Hospedaje
const HospedajeSchema = new Schema(
  {
    numeroReserva: { type: Number, required: true },
    cliente: { type: String, required: true },
    tipoDocumento: { type: String, enum: ["T.I", "CC", "PP/Visa"], default: "CC" }, // Nuevo campo
    numeroIdentificacion: { type: String },
    email: { type: String }, // Nuevo campo para email
    telefono: { type: String }, // Nuevo campo para teléfono
    fecha_inicio: { type: Date, required: true },
    fecha_fin: { type: Date, required: true },
    // Apartamentos: array de ObjectId referenciando al modelo Apartamento.
    apartamentos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Apartamento",
        required: true,
      },
    ],
    estadia: { type: String, required: true },
    total: { type: Number, required: true },
    estado: {
      type: String,
      enum: ["pendiente", "confirmada", "cancelada"],
      default: "pendiente",
    },
    checkInData: [CheckInDataSchema],
    acompanantes: [AcompananteSchema],
    descuento: DescuentoSchema,
  },
  { timestamps: true },
)

module.exports = mongoose.model("Hospedaje", HospedajeSchema)
