const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const { createUsuario, getUsuarios, getUsuarioById, updateUsuario, deleteUsuario } = require("./usuario.controller");

/**
 * Middleware de autorización que soporta ambos formatos:
 * - Formato antiguo: array de strings.
 * - Formato granular: array de objetos con { modulo, acciones }.
 * Se determina la acción requerida según el método HTTP.
 */
const roleMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.usuario || !req.usuario.rol) {
      return res.status(401).json({ msg: "Acceso denegado, usuario no autenticado" });
    }

    // El administrador tiene acceso total sin restricciones.
    const role = req.usuario.rol.toLowerCase();
    if (role === "administrador" || role === "admin") return next();

    if (!requiredPermission) return next();

    const userPermissions = req.usuario.permisos || [];

    // Si los permisos vienen en formato antiguo (array de strings).
    if (userPermissions.length > 0 && typeof userPermissions[0] === "string") {
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({
          msg: `Acceso no autorizado. Se requiere permiso: ${requiredPermission}`
        });
      }
      return next();
    }

    // Si los permisos vienen en formato granular.
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

    const modulePermission = userPermissions.find((p) => p.modulo === requiredPermission);
    if (!modulePermission || !modulePermission.acciones || !modulePermission.acciones[requiredAction]) {
      return res.status(403).json({
        msg: `Acceso no autorizado. No tienes permiso para ${requiredAction} en: ${requiredPermission}`
      });
    }

    next();
  };
};

// Rutas protegidas: se requiere el permiso "usuarios" (usando el middleware que soporta ambos formatos)
router.post("/", authMiddleware, roleMiddleware("usuarios"), createUsuario);
router.get("/", authMiddleware, roleMiddleware("usuarios"), getUsuarios);
router.get("/:id", authMiddleware, roleMiddleware("usuarios"), getUsuarioById);
router.put("/:id", authMiddleware, roleMiddleware("usuarios"), updateUsuario);
router.delete("/:id", authMiddleware, roleMiddleware("usuarios"), deleteUsuario);

module.exports = router;
