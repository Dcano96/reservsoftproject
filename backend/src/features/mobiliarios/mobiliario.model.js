// models/mobiliario.model.js
const mongoose = require("mongoose");

const MobiliarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del mobiliario es requerido"],
    },
    identMobiliario: {
      type: String,
      required: [true, "La identificación del mobiliario es requerida"],
      unique: true,
    },
    estado: {
      type: String,
      enum: {
        values: ["Activo", "Inactivo", "Mantenimiento"],
        message: "Estado debe ser 'Activo', 'Inactivo' o 'Mantenimiento'",
      },
      required: [true, "El estado es requerido"],
      default: "Activo",
    },
    observacion: {
      type: String,
      required: [true, "La observación es requerida"],
    },
    // Campos opcionales
    descripcion: { type: String, required: false },
    tipo: { type: String, required: false },
    precio: { type: Number, required: false },
    cantidad: { type: Number, required: false },
    // Relación con Apartamento
    apartamento: { type: mongoose.Schema.Types.ObjectId, ref: "Apartamento", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mobiliario", MobiliarioSchema);
