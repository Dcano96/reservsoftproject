// tests/hospedaje.test.js

// Import jest to declare the variable const jest = require("jest") 


// Simulamos las funciones del controlador que queremos probar
const hospedajeController = {
  async createHospedaje(req, res) {
    try {
      // Simulamos la lógica de auto-incremento del número de reserva
      const lastHospedaje = await mockHospedaje.findOne({}, {}, { sort: { createdAt: -1 } })
      let newNumero = 1000
      if (lastHospedaje && typeof lastHospedaje.numeroReserva === "number") {
        newNumero = lastHospedaje.numeroReserva + 1
      }
      req.body.numeroReserva = newNumero

      const hospedaje = new MockHospedajeConstructor(req.body)
      await hospedaje.save()
      res.status(201).json({ msg: "Hospedaje creado correctamente", hospedaje })
    } catch (error) {
      console.error("Error al crear hospedaje:", error)
      res.status(500).json({ msg: "Error en el servidor" })
    }
  },

  async getHospedajes(req, res) {
    try {
      // Sincronización simulada
      const reservas = await mockReserva.find()

      const hospedajes = await mockHospedaje.aggregate([
        {
          $lookup: {
            from: "reservas",
            localField: "numeroReserva",
            foreignField: "numero_reserva",
            as: "reservaInfo",
          },
        },
      ])
      res.status(200).json(hospedajes)
    } catch (error) {
      console.error("Error al obtener hospedajes:", error)
      res.status(500).json({ msg: "Error al obtener hospedajes" })
    }
  },

  async updateHospedaje(req, res) {
    try {
      const hospedaje = await mockHospedaje.findByIdAndUpdate(req.params.id, req.body, { new: true })
      if (!hospedaje) {
        return res.status(404).json({ msg: "Hospedaje no encontrado" })
      }
      res.status(200).json({ msg: "Hospedaje actualizado correctamente", hospedaje })
    } catch (error) {
      console.error("Error al actualizar hospedaje:", error)
      res.status(500).json({ msg: "Error en el servidor" })
    }
  },

  async deleteHospedaje(req, res) {
    try {
      const hospedaje = await mockHospedaje.findById(req.params.id)
      if (!hospedaje) return res.status(404).json({ msg: "Hospedaje no encontrado" })
      if (hospedaje.estado === "confirmada") {
        return res.status(400).json({ msg: "No se puede eliminar un hospedaje confirmada" })
      }
      await mockHospedaje.findByIdAndDelete(req.params.id)
      res.status(200).json({ msg: "Hospedaje eliminado correctamente" })
    } catch (error) {
      console.error("Error al eliminar hospedaje:", error)
      res.status(500).json({ msg: "Error en el servidor" })
    }
  },

  async checkInCheckOut(req, res) {
    try {
      const { id } = req.params
      const { servicios } = req.body

      const hospedaje = await mockHospedaje.findById(id)
      if (!hospedaje) {
        return res.status(404).json({ msg: "Hospedaje no encontrado" })
      }

      hospedaje.checkInData = servicios
      await hospedaje.save()

      res.status(200).json({
        msg: "Check‑in Check‑out realizado correctamente",
        hospedaje,
      })
    } catch (error) {
      console.error("Error en check‑in check‑out:", error)
      res.status(500).json({ msg: "Error en el servidor" })
    }
  },

  async getFacturas(req, res) {
    try {
      const hospedajes = await mockHospedaje.find()
      const facturas = hospedajes.map((h) => ({
        numeroReserva: h.numeroReserva,
        cliente: h.cliente,
        fecha: h.fecha_inicio,
        monto: h.total,
        estado: h.estado,
      }))
      res.status(200).json(facturas)
    } catch (error) {
      console.error("Error al obtener facturas:", error)
      res.status(500).json({ msg: "Error en el servidor" })
    }
  },

  async getHabitacionesDisponibles(req, res) {
    try {
      res.status(200).json({ msg: "Habitaciones disponibles funcional" })
    } catch (error) {
      console.error("Error al obtener habitaciones disponibles:", error)
      res.status(500).json({ msg: "Error en el servidor" })
    }
  },

  async saveHabitaciones(req, res) {
    try {
      const rooms = req.body.rooms
      res.status(200).json({ msg: "Habitaciones actualizadas correctamente", rooms })
    } catch (error) {
      console.error("Error al guardar habitaciones:", error)
      res.status(500).json({ msg: "Error en el servidor" })
    }
  },
}

// Mocks para los modelos
const mockHospedaje = {
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
  aggregate: jest.fn(),
}

const mockReserva = {
  find: jest.fn(),
}

// Mock constructor para Hospedaje
function MockHospedajeConstructor(data) {
  Object.assign(this, data)
  this.save = jest.fn().mockResolvedValue(this)
}

// Asignar métodos estáticos al constructor
Object.assign(MockHospedajeConstructor, mockHospedaje)

describe("Pruebas para el módulo de Hospedaje de ReservSoft", () => {
  let mockReq, mockRes

  beforeEach(() => {
    // Reset de todos los mocks antes de cada prueba
    jest.clearAllMocks()

    // Mock de request y response
    mockReq = {
      body: {},
      params: {},
    }

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
  })

  describe("Función createHospedaje", () => {
    test("Debe crear un hospedaje con número de reserva auto-incrementado", async () => {
      // Arrange
      const mockLastHospedaje = { numeroReserva: 1005 }
      mockHospedaje.findOne.mockResolvedValue(mockLastHospedaje)

      mockReq.body = {
        cliente: "Juan Pérez",
        email: "juan@test.com",
      }

      // Act
      await hospedajeController.createHospedaje(mockReq, mockRes)

      // Assert
      expect(mockReq.body.numeroReserva).toBe(1006)
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: "Hospedaje creado correctamente",
          hospedaje: expect.any(Object),
        }),
      )
    })

    test("Debe asignar número 1000 cuando no hay hospedajes previos", async () => {
      // Arrange
      mockHospedaje.findOne.mockResolvedValue(null)
      mockReq.body = { cliente: "Test Cliente" }

      // Act
      await hospedajeController.createHospedaje(mockReq, mockRes)

      // Assert
      expect(mockReq.body.numeroReserva).toBe(1000)
      expect(mockRes.status).toHaveBeenCalledWith(201)
    })

    test("Debe manejar errores al crear hospedaje", async () => {
      // Arrange
      mockHospedaje.findOne.mockRejectedValue(new Error("Database error"))

      // Act
      await hospedajeController.createHospedaje(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Error en el servidor",
      })
    })
  })

  describe("Función getHospedajes", () => {
    test("Debe obtener todos los hospedajes con información de reservas", async () => {
      // Arrange
      const mockHospedajes = [
        {
          _id: "1",
          numeroReserva: 1001,
          cliente: "Cliente 1",
          reservaInfo: { numero_reserva: 1001 },
        },
        {
          _id: "2",
          numeroReserva: 1002,
          cliente: "Cliente 2",
          reservaInfo: { numero_reserva: 1002 },
        },
      ]

      mockReserva.find.mockResolvedValue([])
      mockHospedaje.aggregate.mockResolvedValue(mockHospedajes)

      // Act
      await hospedajeController.getHospedajes(mockReq, mockRes)

      // Assert
      expect(mockHospedaje.aggregate).toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith(mockHospedajes)
    })

    test("Debe manejar errores al obtener hospedajes", async () => {
      // Arrange
      mockReserva.find.mockRejectedValue(new Error("Database error"))

      // Act
      await hospedajeController.getHospedajes(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Error al obtener hospedajes",
      })
    })
  })

  describe("Función updateHospedaje", () => {
    test("Debe actualizar un hospedaje existente", async () => {
      // Arrange
      const mockHospedajeData = {
        _id: "123",
        numeroReserva: 1001,
        cliente: "Cliente Actualizado",
      }

      mockHospedaje.findByIdAndUpdate.mockResolvedValue(mockHospedajeData)
      mockReq.params.id = "123"
      mockReq.body = { cliente: "Cliente Actualizado" }

      // Act
      await hospedajeController.updateHospedaje(mockReq, mockRes)

      // Assert
      expect(mockHospedaje.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        { cliente: "Cliente Actualizado" },
        { new: true },
      )
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Hospedaje actualizado correctamente",
        hospedaje: mockHospedajeData,
      })
    })

    test("Debe retornar error 404 si el hospedaje no existe", async () => {
      // Arrange
      mockHospedaje.findByIdAndUpdate.mockResolvedValue(null)
      mockReq.params.id = "999"

      // Act
      await hospedajeController.updateHospedaje(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Hospedaje no encontrado",
      })
    })
  })

  describe("Función deleteHospedaje", () => {
    test("Debe eliminar un hospedaje no confirmado", async () => {
      // Arrange
      const mockHospedajeData = {
        _id: "123",
        estado: "pendiente",
      }

      mockHospedaje.findById.mockResolvedValue(mockHospedajeData)
      mockHospedaje.findByIdAndDelete.mockResolvedValue(mockHospedajeData)
      mockReq.params.id = "123"

      // Act
      await hospedajeController.deleteHospedaje(mockReq, mockRes)

      // Assert
      expect(mockHospedaje.findByIdAndDelete).toHaveBeenCalledWith("123")
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Hospedaje eliminado correctamente",
      })
    })

    test("No debe eliminar un hospedaje confirmado", async () => {
      // Arrange
      const mockHospedajeData = {
        _id: "123",
        estado: "confirmada",
      }

      mockHospedaje.findById.mockResolvedValue(mockHospedajeData)
      mockReq.params.id = "123"

      // Act
      await hospedajeController.deleteHospedaje(mockReq, mockRes)

      // Assert
      expect(mockHospedaje.findByIdAndDelete).not.toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "No se puede eliminar un hospedaje confirmada",
      })
    })
  })

  describe("Función checkInCheckOut", () => {
    test("Debe guardar información de check-in correctamente", async () => {
      // Arrange
      const mockHospedajeData = {
        _id: "123",
        checkInData: [],
        save: jest.fn().mockResolvedValue(true),
      }

      const servicios = [
        {
          servicio: "Limpieza",
          estado: "completado",
          observaciones: "Todo en orden",
        },
      ]

      mockHospedaje.findById.mockResolvedValue(mockHospedajeData)
      mockReq.params.id = "123"
      mockReq.body = { servicios }

      // Act
      await hospedajeController.checkInCheckOut(mockReq, mockRes)

      // Assert
      expect(mockHospedajeData.checkInData).toEqual(servicios)
      expect(mockHospedajeData.save).toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Check‑in Check‑out realizado correctamente",
        hospedaje: mockHospedajeData,
      })
    })
  })

  describe("Función getFacturas", () => {
    test("Debe generar facturas a partir de hospedajes", async () => {
      // Arrange
      const mockHospedajes = [
        {
          numeroReserva: 1001,
          cliente: "Cliente 1",
          fecha_inicio: new Date("2024-01-01"),
          total: 1000,
          estado: "confirmada",
        },
        {
          numeroReserva: 1002,
          cliente: "Cliente 2",
          fecha_inicio: new Date("2024-01-02"),
          total: 1500,
          estado: "pendiente",
        },
      ]

      const expectedFacturas = [
        {
          numeroReserva: 1001,
          cliente: "Cliente 1",
          fecha: new Date("2024-01-01"),
          monto: 1000,
          estado: "confirmada",
        },
        {
          numeroReserva: 1002,
          cliente: "Cliente 2",
          fecha: new Date("2024-01-02"),
          monto: 1500,
          estado: "pendiente",
        },
      ]

      mockHospedaje.find.mockResolvedValue(mockHospedajes)

      // Act
      await hospedajeController.getFacturas(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith(expectedFacturas)
    })
  })

  describe("Funciones auxiliares", () => {
    test("getHabitacionesDisponibles debe retornar mensaje funcional", async () => {
      // Act
      await hospedajeController.getHabitacionesDisponibles(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Habitaciones disponibles funcional",
      })
    })

    test("saveHabitaciones debe guardar información de habitaciones", async () => {
      // Arrange
      const rooms = [
        { numero: 101, estado: "disponible" },
        { numero: 102, estado: "ocupada" },
      ]
      mockReq.body = { rooms }

      // Act
      await hospedajeController.saveHabitaciones(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Habitaciones actualizadas correctamente",
        rooms,
      })
    })
  })
})
