const jwt = require("jsonwebtoken");

// Lista de rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/api/clientes/public-register'  // Ruta para registro público de clientes
];

const authMiddleware = (req, res, next) => {
  // Verificar si la ruta actual está en la lista de rutas públicas
  const currentPath = req.path;
  
  // Si la ruta actual está en la lista de rutas públicas, permitir acceso sin token
  if (PUBLIC_ROUTES.some(route => currentPath.includes(route))) {
    return next();
  }
  
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