const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Se espera el token en el header: Authorization: Bearer <token>
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Acceso denegado, token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Se asume que el token contiene el objeto usuario con 'rol' y 'permisos'
    req.usuario = decoded.usuario;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token no válido" });
  }
};

module.exports = authMiddleware;
