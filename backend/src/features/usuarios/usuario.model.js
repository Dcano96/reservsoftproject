const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  documento: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  password: { type: String, required: true },
  rol: {
    type: String,
    default: 'cliente'
  },
  estado: { type: Boolean, default: true },
  // Campos para recuperación de contraseña
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', UsuarioSchema);
