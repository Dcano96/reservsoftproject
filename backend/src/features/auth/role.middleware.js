const roleMiddleware = (rolesPermitidos) => (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ msg: 'Acceso no autorizado' });
    }
    next();
  };
  
  module.exports = roleMiddleware;
  