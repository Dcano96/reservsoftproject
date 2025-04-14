// Lista de rutas públicas que no requieren verificación de roles
const PUBLIC_ROUTES = [
  '/api/clientes/public-register'  // Ruta para registro público de clientes
];

const roleMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    // Verificar si la ruta actual está en la lista de rutas públicas
    const currentPath = req.path;
    
    // Si la ruta actual está en la lista de rutas públicas, permitir acceso sin verificar roles
    if (PUBLIC_ROUTES.some(route => currentPath.includes(route))) {
      return next();
    }
    
    // Verificar que exista el usuario autenticado y su rol
    if (!req.usuario || !req.usuario.rol) {
      return res.status(401).json({ msg: "Acceso denegado, usuario no autenticado" });
    }

    // Convertir el rol a minúsculas para evitar problemas
    const role = req.usuario.rol.toLowerCase();

    // El administrador tiene acceso total sin restricciones
    if (role === "administrador" || role === "admin") {
      return next();
    }

    // Si no se especifica un permiso requerido, continuar
    if (!requiredPermission) {
      return next();
    }

    // Determinar la acción requerida según el método HTTP
    let requiredAction;
    switch (req.method) {
      case "GET":
        requiredAction = "leer";
        break;
      case "POST":
        requiredAction = "crear";
        break;
      case "PUT":
      case "PATCH":
        requiredAction = "actualizar";
        break;
      case "DELETE":
        requiredAction = "eliminar";
        break;
      default:
        requiredAction = "leer";
    }

    const userPermissions = req.usuario.permisos || [];

    // Compatibilidad con formato antiguo (array de strings)
    if (userPermissions.length > 0 && typeof userPermissions[0] === "string") {
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({
          msg: `Acceso no autorizado. Se requiere permiso: ${requiredPermission}`,
        });
      }
      return next();
    }

    // Formato nuevo: permisos granulares
    const modulePermission = userPermissions.find((p) => p.modulo === requiredPermission);

    if (!modulePermission) {
      return res.status(403).json({
        msg: `Acceso no autorizado. Se requiere permiso para el módulo: ${requiredPermission}`,
      });
    }

    // Verificar la acción requerida
    if (!modulePermission.acciones || !modulePermission.acciones[requiredAction]) {
      return res.status(403).json({
        msg: `Acceso no autorizado. No tienes permiso para ${requiredAction} en: ${requiredPermission}`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;