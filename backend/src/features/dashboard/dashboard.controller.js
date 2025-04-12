exports.getDashboard = (req, res) => {
  res.json({
    msg: 'Acceso al dashboard concedido para administrador',
    usuario: req.usuario
  });
};
