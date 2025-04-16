const mongoose = require("mongoose")

const ApartamentoSchema = new mongoose.Schema(
  {
    Tipo: { type: String, required: true },
    NumeroApto: { type: Number, required: true },
    Piso: { type: Number, required: true },
    Capacidad: { type: Number, required: true, default: 0 }, // Añadido campo Capacidad
    Tarifa: { type: Number, required: true },
    Estado: { type: Boolean, required: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Apartamento", ApartamentoSchema)
