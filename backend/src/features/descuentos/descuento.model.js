// src/features/descuentos/descuento.model.js
const mongoose = require("mongoose");

const DescuentoSchema = new mongoose.Schema(
  {
    tipoApartamento: { type: String, required: true },
    descripcion: { type: String },
    porcentaje: { type: Number, required: true },
    precio: { type: Number, required: true }, // Precio original
    precio_con_descuento: { type: Number },   // Se calculará automáticamente
    fecha_inicio: { type: Date },
    fecha_fin: { type: Date },
    estado: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Descuento", DescuentoSchema);
