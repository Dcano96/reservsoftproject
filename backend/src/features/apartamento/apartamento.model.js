const mongoose = require("mongoose");

const ApartamentoSchema = new mongoose.Schema(
  {
    Tipo: { type: String, required: true },
    NumeroApto: { type: Number, required: true },
    Piso: { type: Number, required: true },
    Tarifa: { type: Number, required: true },
    Estado: { type: Boolean, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Apartamento", ApartamentoSchema);
