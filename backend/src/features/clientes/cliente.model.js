// src/features/clientes/cliente.model.js
const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  documento: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  password: { type: String, required: true },
  rol: {
    type: String,
    enum: ['administrador', 'recepcion', 'cliente'],
    default: 'cliente'
  },
  estado: { type: Boolean, default: true },
  // Campos para recuperación de contraseña
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Cliente', ClienteSchema);
