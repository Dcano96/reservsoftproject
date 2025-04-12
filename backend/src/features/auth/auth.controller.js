const Usuario = require('../usuarios/usuario.model');
const Rol = require('../roles/rol.model'); // Importamos el modelo de roles
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Registro de usuario: se fuerza el rol "cliente"
exports.register = async (req, res) => {
  const { nombre, documento, email, telefono, password } = req.body;
  try {
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }
    // Se asigna siempre el rol "cliente"
    usuario = new Usuario({ nombre, documento, email, telefono, password, rol: 'cliente' });
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    await usuario.save();
    res.status(201).json({ msg: 'Usuario registrado correctamente como cliente' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
};

// Login (incluye permisos en el token)
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ msg: 'Credenciales inválidas' });
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenciales inválidas' });
    
    // Consultar el rol completo para obtener los permisos
    const rol = await Rol.findOne({ nombre: usuario.rol });
    
    const payload = {
      usuario: {
        id: usuario._id,
        rol: usuario.rol,
        permisos: rol ? rol.permisos : [] // Se incluye el array de permisos
      }
    };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
};

// Solicitud de recuperación de contraseña
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario)
      return res.status(400).json({ msg: 'No existe un usuario con ese email' });
    // Genera token aleatorio y establece expiración (30 minutos)
    const token = crypto.randomBytes(20).toString('hex');
    usuario.resetPasswordToken = token;
    usuario.resetPasswordExpires = Date.now() + 1800000; // 30 minutos
    await usuario.save();
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    const mailOptions = {
      to: usuario.email,
      from: process.env.EMAIL_USER,
      subject: 'Recuperación de contraseña',
      text: `Hola ${usuario.nombre},\n\nPara restablecer tu contraseña, haz clic en el siguiente enlace:\n\n${resetUrl}\n\nSi no solicitaste este cambio, ignora este mensaje.\n`
    };
    await transporter.sendMail(mailOptions);
    res.json({ msg: 'Se ha enviado un enlace de recuperación a su correo' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
};

// Reseteo de contraseña
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const usuario = await Usuario.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!usuario)
      return res.status(400).json({ msg: 'Token inválido o expirado' });
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(newPassword, salt);
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpires = undefined;
    await usuario.save();
    res.json({ msg: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
};
