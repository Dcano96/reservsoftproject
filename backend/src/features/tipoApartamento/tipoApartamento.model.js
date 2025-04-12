const mongoose = require("mongoose");

const TipoApartamentoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    tamaño: { type: Number, required: true },
    estado: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TipoApartamento", TipoApartamentoSchema);
