// tests/permisos.test.js

// Importamos las funciones que vamos a probar
const { tienePermiso, puedeEliminarRol } = require("../src/permisos")

describe("Pruebas para el sistema de permisos de ReservSoft", () => {
  describe("Función tienePermiso", () => {
    test("Debe retornar true para administrador con cualquier permiso", () => {
      const usuarioAdmin = {
        rol: "administrador",
        permisos: [],
      }

      expect(tienePermiso(usuarioAdmin, "reservas", "crear")).toBe(true)
      expect(tienePermiso(usuarioAdmin, "usuarios", "eliminar")).toBe(true)
      expect(tienePermiso(usuarioAdmin, "roles", "actualizar")).toBe(true)
    })

    test("Debe retornar true para usuario con permisos específicos", () => {
      const usuarioEmpleado = {
        rol: "empleado",
        permisos: [
          {
            modulo: "reservas",
            acciones: { crear: true, leer: true, actualizar: false, eliminar: false },
          },
          {
            modulo: "clientes",
            acciones: { crear: false, leer: true, actualizar: true, eliminar: false },
          },
        ],
      }

      expect(tienePermiso(usuarioEmpleado, "reservas", "crear")).toBe(true)
      expect(tienePermiso(usuarioEmpleado, "reservas", "leer")).toBe(true)
      expect(tienePermiso(usuarioEmpleado, "clientes", "leer")).toBe(true)
      expect(tienePermiso(usuarioEmpleado, "clientes", "actualizar")).toBe(true)
    })

    test("Debe retornar false para usuario sin permisos específicos", () => {
      const usuarioEmpleado = {
        rol: "empleado",
        permisos: [
          {
            modulo: "reservas",
            acciones: { crear: true, leer: true, actualizar: false, eliminar: false },
          },
        ],
      }

      expect(tienePermiso(usuarioEmpleado, "reservas", "eliminar")).toBe(false)
      expect(tienePermiso(usuarioEmpleado, "reservas", "actualizar")).toBe(false)
      expect(tienePermiso(usuarioEmpleado, "usuarios", "leer")).toBe(false)
    })

    test("Debe lanzar error si los argumentos no son válidos", () => {
      expect(() => tienePermiso(null, "reservas", "crear")).toThrow("El usuario debe ser un objeto válido")
      expect(() => tienePermiso("texto", "reservas", "crear")).toThrow("El usuario debe ser un objeto válido")
      expect(() => tienePermiso({}, null, "crear")).toThrow("El módulo debe ser una cadena de texto")
      expect(() => tienePermiso({}, "reservas", null)).toThrow("La acción debe ser una cadena de texto")
    })
  })

  describe("Función puedeEliminarRol", () => {
    test("Debe retornar false para el rol administrador", () => {
      expect(puedeEliminarRol("administrador")).toBe(false)
      expect(puedeEliminarRol("Administrador")).toBe(false)
      expect(puedeEliminarRol("ADMINISTRADOR")).toBe(false)
    })

    test("Debe retornar true para otros roles", () => {
      expect(puedeEliminarRol("empleado")).toBe(true)
      expect(puedeEliminarRol("cliente")).toBe(true)
      expect(puedeEliminarRol("recepcionista")).toBe(true)
    })

    test("Debe lanzar error si el argumento no es válido", () => {
      expect(() => puedeEliminarRol(null)).toThrow("El nombre del rol debe ser una cadena de texto")
      expect(() => puedeEliminarRol(123)).toThrow("El nombre del rol debe ser una cadena de texto")
      expect(() => puedeEliminarRol("")).toThrow("El nombre del rol debe ser una cadena de texto")
    })
  })
})