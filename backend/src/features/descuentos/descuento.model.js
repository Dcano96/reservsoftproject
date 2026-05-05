// src/features/descuentos/descuento.model.js
const mongoose = require("mongoose");

const DescuentoSchema = new mongoose.Schema(
  {
    // Debe coincidir con Apartamento.Tipo para que el descuento aplique
    tipoApartamento: { type: String, required: true, index: true },
    descripcion: { type: String },
    porcentaje: { type: Number, required: true, min: 0, max: 100 },
    precio: { type: Number, required: true },               // Precio referencial (no usado en cálculo de reserva)
    precio_con_descuento: { type: Number },                 // Calculado en frontend a modo informativo
    fecha_inicio: { type: Date },
    fecha_fin: { type: Date },
    estado: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

DescuentoSchema.statics.obtenerVigentePorTipo = async function (tipoApartamento, fecha = new Date()) {
  if (!tipoApartamento) return null;
  return this.findOne({
    tipoApartamento,
    estado: true,
    $and: [
      { $or: [{ fecha_inicio: { $lte: fecha } }, { fecha_inicio: null }, { fecha_inicio: { $exists: false } }] },
      { $or: [{ fecha_fin: { $gte: fecha } }, { fecha_fin: null }, { fecha_fin: { $exists: false } }] },
    ],
  })
    .sort({ porcentaje: -1 })
    .lean();
};

module.exports = mongoose.model("Descuento", DescuentoSchema);
