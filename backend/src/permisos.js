// src/permisos.js

/**
 * Función que verifica si un usuario tiene permisos para realizar una acción en un módulo específico.
 * @param {Object} usuario - Objeto usuario con rol y permisos.
 * @param {string} modulo - Módulo a verificar (ej: "reservas", "usuarios", "roles").
 * @param {string} accion - Acción a verificar ("crear", "leer", "actualizar", "eliminar").
 * @returns {boolean} - true si tiene permiso, false si no lo tiene.
 */
function tienePermiso(usuario, modulo, accion) {
  // Verificamos que los argumentos sean válidos
  if (!usuario || typeof usuario !== "object") {
    throw new Error("El usuario debe ser un objeto válido")
  }

  if (!modulo || typeof modulo !== "string") {
    throw new Error("El módulo debe ser una cadena de texto")
  }

  if (!accion || typeof accion !== "string") {
    throw new Error("La acción debe ser una cadena de texto")
  }

  // El administrador tiene acceso total
  if (usuario.rol && usuario.rol.toLowerCase() === "administrador") {
    return true
  }

  // Verificar si el usuario tiene permisos
  if (!usuario.permisos || !Array.isArray(usuario.permisos)) {
    return false
  }

  // Buscar el módulo en los permisos del usuario
  const moduloPermiso = usuario.permisos.find((permiso) => permiso.modulo === modulo)

  if (!moduloPermiso) {
    return false
  }

  // Verificar si tiene la acción específica
  return moduloPermiso.acciones && moduloPermiso.acciones[accion] === true
}

/**
 * Función que verifica si un rol puede ser eliminado.
 * @param {string} nombreRol - Nombre del rol a verificar.
 * @returns {boolean} - true si puede ser eliminado, false si no.
 */
function puedeEliminarRol(nombreRol) {
  // Verificamos que el argumento sea válido
  if (!nombreRol || typeof nombreRol !== "string") {
    throw new Error("El nombre del rol debe ser una cadena de texto")
  }

  // El rol de administrador no puede ser eliminado
  return nombreRol.toLowerCase() !== "administrador"
}

// Exportamos las funciones para poder usarlas en las pruebas
module.exports = { tienePermiso, puedeEliminarRol }