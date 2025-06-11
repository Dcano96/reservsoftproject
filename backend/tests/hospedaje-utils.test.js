// tests/hospedaje-utils.test.js

// Pruebas para funciones utilitarias del módulo de hospedaje
describe("Utilidades del módulo Hospedaje", () => {
  describe("Validación de datos de hospedaje", () => {
    test("Debe validar datos completos de hospedaje", () => {
      const datosValidos = {
        cliente: "Juan Pérez",
        numeroIdentificacion: "12345678",
        email: "juan@test.com",
        telefono: "555-1234",
        fecha_inicio: "2024-01-15",
        fecha_fin: "2024-01-20",
      }

      const esValido = validarDatosHospedaje(datosValidos)
      expect(esValido).toBe(true)
    })

    test("Debe rechazar datos incompletos", () => {
      const datosIncompletos = {
        cliente: "Juan Pérez",
        // Faltan otros campos requeridos
      }

      const esValido = validarDatosHospedaje(datosIncompletos)
      expect(esValido).toBe(false)
    })

    test("Debe validar formato de email", () => {
      const emailInvalido = {
        cliente: "Juan Pérez",
        email: "email-invalido",
      }

      const esValido = validarEmail(emailInvalido.email)
      expect(esValido).toBe(false)

      const emailValido = {
        cliente: "Juan Pérez",
        email: "juan@test.com",
      }

      const esValidoCorrect = validarEmail(emailValido.email)
      expect(esValidoCorrect).toBe(true)
    })
  })

  describe("Cálculo de estadía", () => {
    test("Debe calcular correctamente los días de estadía", () => {
      const fechaInicio = new Date("2024-01-15")
      const fechaFin = new Date("2024-01-20")

      const diasEstadia = calcularDiasEstadia(fechaInicio, fechaFin)
      expect(diasEstadia).toBe(5)
    })

    test("Debe manejar fechas iguales", () => {
      const fecha = new Date("2024-01-15")

      const diasEstadia = calcularDiasEstadia(fecha, fecha)
      expect(diasEstadia).toBe(0)
    })

    test("Debe lanzar error para fechas inválidas", () => {
      const fechaInicio = new Date("2024-01-20")
      const fechaFin = new Date("2024-01-15")

      expect(() => {
        calcularDiasEstadia(fechaInicio, fechaFin)
      }).toThrow("La fecha de fin debe ser posterior a la fecha de inicio")
    })
  })

  describe("Generación de número de reserva", () => {
    test("Debe generar número de reserva incremental", () => {
      const ultimoNumero = 1005
      const nuevoNumero = generarNumeroReserva(ultimoNumero)

      expect(nuevoNumero).toBe(1006)
    })

    test("Debe iniciar en 1000 si no hay número previo", () => {
      const nuevoNumero = generarNumeroReserva(null)

      expect(nuevoNumero).toBe(1000)
    })
  })

  describe("Validación de estados", () => {
    test("Debe validar estados de hospedaje correctos", () => {
      expect(validarEstadoHospedaje("pendiente")).toBe(true)
      expect(validarEstadoHospedaje("confirmada")).toBe(true)
      expect(validarEstadoHospedaje("cancelada")).toBe(true)
      expect(validarEstadoHospedaje("completada")).toBe(true)
    })

    test("Debe rechazar estados inválidos", () => {
      expect(validarEstadoHospedaje("estado-invalido")).toBe(false)
      expect(validarEstadoHospedaje("")).toBe(false)
      expect(validarEstadoHospedaje(null)).toBe(false)
      expect(validarEstadoHospedaje(undefined)).toBe(false)
    })
  })

  describe("Cálculo de totales", () => {
    test("Debe calcular el total de un hospedaje", () => {
      const hospedaje = {
        precioBase: 100,
        noches: 5,
        descuento: 10,
        impuestos: 15,
      }

      const total = calcularTotalHospedaje(hospedaje)
      expect(total).toBe(505) // (100 * 5) - 10 + 15 = 505
    })

    test("Debe manejar valores faltantes en el cálculo", () => {
      const hospedajeIncompleto = {
        precioBase: 100,
        noches: 3,
      }

      const total = calcularTotalHospedaje(hospedajeIncompleto)
      expect(total).toBe(300) // 100 * 3 = 300
    })
  })
})

// Funciones utilitarias para las pruebas
function validarDatosHospedaje(datos) {
  const camposRequeridos = ["cliente", "numeroIdentificacion", "email", "telefono"]
  return camposRequeridos.every((campo) => datos[campo] && datos[campo].trim() !== "")
}

function validarEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function calcularDiasEstadia(fechaInicio, fechaFin) {
  if (fechaFin < fechaInicio) {
    throw new Error("La fecha de fin debe ser posterior a la fecha de inicio")
  }

  const diferencia = fechaFin.getTime() - fechaInicio.getTime()
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
}

function generarNumeroReserva(ultimoNumero) {
  return ultimoNumero ? ultimoNumero + 1 : 1000
}

function validarEstadoHospedaje(estado) {
  if (!estado || typeof estado !== "string") return false
  const estadosValidos = ["pendiente", "confirmada", "cancelada", "completada"]
  return estadosValidos.includes(estado.toLowerCase())
}

function calcularTotalHospedaje(hospedaje) {
  const { precioBase = 0, noches = 0, descuento = 0, impuestos = 0 } = hospedaje
  return precioBase * noches - descuento + impuestos
}
