const { validarDatosApartamento, procesarApartamento } = require("../src/apartamentos")

describe("Pruebas unitarias para apartamentos", () => {
  const validData = {
    Tipo: "Doble",
    NumeroApto: 203,
    Piso: 2,
    Capacidad: 3,
    Tarifa: 180000,
    Estado: true,
  }

  describe("validarDatosApartamento", () => {
    test("Debe validar datos correctos", () => {
      const result = validarDatosApartamento(validData)
      expect(result).toEqual(validData)
    })

    test("Debe lanzar error si falta Tipo", () => {
      const { Tipo, ...dataSinTipo } = validData
      expect(() => validarDatosApartamento(dataSinTipo)).toThrow("Todos los campos son requeridos")
    })

    test("Debe lanzar error si falta NumeroApto", () => {
      const { NumeroApto, ...dataSinNumero } = validData
      expect(() => validarDatosApartamento(dataSinNumero)).toThrow("Todos los campos son requeridos")
    })
  })

  describe("procesarApartamento", () => {
    test("Debe procesar apartamento correctamente", () => {
      const result = procesarApartamento(validData)

      expect(result).toMatchObject(validData)
      expect(result.fechaCreacion).toBeDefined()
      expect(result.activo).toBe(true)
    })

    test("Debe lanzar error con datos inválidos", () => {
      const dataIncompleta = { Tipo: "Sencillo" }
      expect(() => procesarApartamento(dataIncompleta)).toThrow("Todos los campos son requeridos")
    })
  })
})
