const mongoose = require("mongoose");

const PagoSchema = new mongoose.Schema({
  monto: { type: Number, required: true, min: 0 },
  fecha: { type: Date, default: Date.now },
  // El campo reserva es una referencia a la colección "Reserva"
  reserva: { type: mongoose.Schema.Types.ObjectId, ref: "Reserva", required: true },
  estado: { type: String, enum: ["pendiente", "realizado", "fallido"], default: "pendiente" }
}, { timestamps: true });

module.exports = mongoose.model("Pago", PagoSchema);
