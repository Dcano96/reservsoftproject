const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const { createRol, getRoles, getRolById, updateRol, deleteRol } = require("./rol.controller");

// Rutas protegidas: se requiere el permiso "roles" para gestionarlas
router.post("/", authMiddleware, roleMiddleware("roles"), createRol);
router.get("/", authMiddleware, roleMiddleware("roles"), getRoles);
router.get("/:id", authMiddleware, roleMiddleware("roles"), getRolById);
router.put("/:id", authMiddleware, roleMiddleware("roles"), updateRol);
router.delete("/:id", authMiddleware, roleMiddleware("roles"), deleteRol);

module.exports = router;
