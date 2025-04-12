const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token)
    return res.status(401).json({ msg: 'Acceso denegado, token requerido' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded.usuario;
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Token no válido' });
  }
};

module.exports = authMiddleware;
