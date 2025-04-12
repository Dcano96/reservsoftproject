const Reserva = require("./reserva.model")
const Apartamento = require("../apartamento/apartamento.model")
const mongoose = require("mongoose")

// Función para validar ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

// Crea una nueva reserva
exports.crearReserva = async (req, res) => {
  try {
    // Validaciones básicas
    const { titular_reserva, fecha_inicio, fecha_fin, apartamentos, acompanantes } = req.body

    if (!titular_reserva || !fecha_inicio || !fecha_fin || !apartamentos || apartamentos.length === 0) {
      return res.status(400).json({
        msg: "Datos incompletos. Todos los campos son obligatorios.",
        error: true,
      })
    }

    // Validar formato del nombre (solo letras y espacios)
    const nombreRegex = /^[a-zA-ZÀ-ÿ\s]+$/
    if (!nombreRegex.test(titular_reserva)) {
      return res.status(400).json({
        msg: "El nombre del titular solo puede contener letras y espacios.",
        error: true,
      })
    }

    // Validar formato de fechas
    const inicio = new Date(fecha_inicio)
    const fin = new Date(fecha_fin)

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({
        msg: "Formato de fecha inválido",
        error: true,
      })
    }

    if (fin <= inicio) {
      return res.status(400).json({
        msg: "La fecha de fin debe ser posterior a la fecha de inicio",
        error: true,
      })
    }

    // Calcular noches de estadía
    const diffTime = Math.abs(fin - inicio)
    const noches_estadia = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (noches_estadia < 1) {
      return res.status(400).json({
        msg: "La estadía debe ser de al menos una noche",
        error: true,
      })
    }

    // Validar que los apartamentos existan y sean ObjectId válidos
    if (!Array.isArray(apartamentos)) {
      return res.status(400).json({
        msg: "El formato de apartamentos es inválido",
        error: true,
      })
    }

    // Verificar que todos los IDs de apartamentos sean válidos y existan
    for (const aptId of apartamentos) {
      if (!isValidObjectId(aptId)) {
        return res.status(400).json({
          msg: `ID de apartamento inválido: ${aptId}`,
          error: true,
        })
      }

      const apartamentoExiste = await Apartamento.findById(aptId)
      if (!apartamentoExiste) {
        return res.status(400).json({
          msg: `El apartamento con ID ${aptId} no existe`,
          error: true,
        })
      }
    }

    // Validar acompañantes si existen
    if (acompanantes && acompanantes.length > 0) {
      for (const acompanante of acompanantes) {
        if (!acompanante.nombre || !acompanante.apellido || !acompanante.documento) {
          return res.status(400).json({
            msg: "Todos los campos de acompañantes son obligatorios (nombre, apellido y documento)",
            error: true,
          })
        }
        if (!nombreRegex.test(acompanante.nombre) || !nombreRegex.test(acompanante.apellido)) {
          return res.status(400).json({
            msg: "Los nombres y apellidos de acompañantes solo pueden contener letras y espacios",
            error: true,
          })
        }
        const documentoRegex = /^\d{6,10}$/
        if (!documentoRegex.test(acompanante.documento)) {
          return res.status(400).json({
            msg: "El documento debe contener entre 6 y 10 dígitos numéricos",
            error: true,
          })
        }
      }
    }

    // Calcular total basado en tarifas de apartamentos
    let total = 0
    for (const aptId of apartamentos) {
      const apartamento = await Apartamento.findById(aptId)
      if (apartamento) {
        total += apartamento.Tarifa * noches_estadia
      }
    }

    // Crear objeto de reserva con todos los datos validados
    const reservaData = {
      ...req.body,
      noches_estadia,
      total,
      pagos_parciales: req.body.pagos_parciales || 0,
    }

    const reserva = new Reserva(reservaData)
    await reserva.save()
    
    res.status(201).json({
      msg: "Reserva creada correctamente",
      reserva,
      error: false,
    })
  } catch (error) {
    console.error("Error al crear reserva:", error)
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        msg: "Error de validación",
        details: messages,
        error: true,
      })
    }
    
    res.status(500).json({
      msg: "Error en el servidor al crear la reserva",
      error: true,
      details: error.message,
    })
  }
}

// Obtiene todas las reservas
exports.obtenerReservas = async (req, res) => {
  try {
    // Usar populate para traer la info de los apartamentos referenciados
    const reservas = await Reserva.find().populate("apartamentos")
    res.status(200).json(reservas)
  } catch (error) {
    console.error("Error al obtener reservas:", error)
    res.status(500).json({
      msg: "Error al obtener reservas",
      error: true,
      details: error.message,
    })
  }
}

// Obtiene una reserva por su id
exports.obtenerReserva = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        msg: "ID de reserva no proporcionado",
        error: true,
      })
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de reserva inválido",
        error: true,
      })
    }

    const reserva = await Reserva.findById(id).populate("apartamentos")

    if (!reserva) {
      return res.status(404).json({
        msg: "Reserva no encontrada",
        error: true,
      })
    }

    res.status(200).json(reserva)
  } catch (error) {
    console.error("Error al obtener reserva:", error)
    res.status(500).json({
      msg: "Error en el servidor al obtener la reserva",
      error: true,
      details: error.message,
    })
  }
}

// Actualiza una reserva por su id (modo permisivo: se actualiza sin validaciones adicionales)
exports.actualizarReserva = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        msg: "ID de reserva no proporcionado",
        error: true,
      })
    }
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de reserva inválido",
        error: true,
      })
    }

    // Actualizar la reserva sin realizar validaciones adicionales sobre los datos enviados
    const reservaActualizada = await Reserva.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: false }
    ).populate("apartamentos")

    if (!reservaActualizada) {
      return res.status(404).json({
        msg: "Reserva no encontrada",
        error: true,
      })
    }

    res.status(200).json({
      msg: "Reserva actualizada correctamente",
      reserva: reservaActualizada,
      error: false,
    })
  } catch (error) {
    console.error("Error al actualizar reserva:", error)
    
    res.status(500).json({
      msg: "Error en el servidor al actualizar la reserva",
      error: true,
      details: error.message,
    })
  }
}

// Elimina una reserva por su id
exports.eliminarReserva = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        msg: "ID de reserva no proporcionado",
        error: true,
      })
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de reserva inválido",
        error: true,
      })
    }

    const reserva = await Reserva.findById(id)

    if (!reserva) {
      return res.status(404).json({
        msg: "Reserva no encontrada",
        error: true,
      })
    }

    if (reserva.estado === "confirmada") {
      return res.status(400).json({
        msg: "No se puede eliminar una reserva confirmada",
        error: true,
      })
    }

    await Reserva.findByIdAndDelete(id)
    res.status(200).json({
      msg: "Reserva eliminada correctamente",
      error: false,
    })
  } catch (error) {
    console.error("Error al eliminar la reserva:", error)
    res.status(500).json({
      msg: "Error en el servidor al eliminar la reserva",
      error: true,
      details: error.message,
    })
  }
}

// ========================
// Funcionalidad para Acompañantes
// ========================

// Agrega un acompañante a una reserva
exports.agregarAcompanante = async (req, res) => {
  try {
    const { id } = req.params
    const { acompanante } = req.body

    if (!id) {
      return res.status(400).json({
        msg: "ID de reserva no proporcionado",
        error: true,
      })
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de reserva inválido",
        error: true,
      })
    }

    const reserva = await Reserva.findById(id)

    if (!reserva) {
      return res.status(404).json({
        msg: "Reserva no encontrada",
        error: true,
      })
    }

    if (!acompanante) {
      return res.status(400).json({
        msg: "Se requiere información del acompañante",
        error: true,
      })
    }

    if (!acompanante.nombre || !acompanante.apellido || !acompanante.documento) {
      return res.status(400).json({
        msg: "Nombre, apellido y documento del acompañante son obligatorios",
        error: true,
      })
    }

    const nombreRegex = /^[a-zA-ZÀ-ÿ\s]+$/
    if (!nombreRegex.test(acompanante.nombre) || !nombreRegex.test(acompanante.apellido)) {
      return res.status(400).json({
        msg: "Los nombres y apellidos solo pueden contener letras y espacios",
        error: true,
      })
    }

    const documentoRegex = /^\d{6,10}$/
    if (!documentoRegex.test(acompanante.documento)) {
      return res.status(400).json({
        msg: "El documento debe contener entre 6 y 10 dígitos numéricos",
        error: true,
      })
    }

    reserva.acompanantes.push(acompanante)
    await reserva.save()

    res.status(200).json({
      msg: "Acompañante agregado correctamente",
      reserva,
      error: false,
    })
  } catch (error) {
    console.error("Error al agregar acompañante:", error)
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        msg: "Error de validación",
        details: messages,
        error: true,
      })
    }
    
    res.status(500).json({
      msg: "Error en el servidor al agregar acompañante",
      error: true,
      details: error.message,
    })
  }
}

// Actualiza un acompañante de una reserva
exports.actualizarAcompanante = async (req, res) => {
  try {
    const { id, acompananteId } = req.params
    const { acompanante } = req.body

    if (!id || !acompananteId) {
      return res.status(400).json({
        msg: "ID de reserva y acompañante son obligatorios",
        error: true,
      })
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de reserva inválido",
        error: true,
      })
    }

    const reserva = await Reserva.findById(id)

    if (!reserva) {
      return res.status(404).json({
        msg: "Reserva no encontrada",
        error: true,
      })
    }

    if (!acompanante) {
      return res.status(400).json({
        msg: "Se requiere información del acompañante",
        error: true,
      })
    }

    if (acompanante.nombre || acompanante.apellido) {
      const nombreRegex = /^[a-zA-ZÀ-ÿ\s]+$/
      if (acompanante.nombre && !nombreRegex.test(acompanante.nombre)) {
        return res.status(400).json({
          msg: "El nombre solo puede contener letras y espacios",
          error: true,
        })
      }
      if (acompanante.apellido && !nombreRegex.test(acompanante.apellido)) {
        return res.status(400).json({
          msg: "El apellido solo puede contener letras y espacios",
          error: true,
        })
      }
    }

    if (acompanante.documento) {
      const documentoRegex = /^\d{6,10}$/
      if (!documentoRegex.test(acompanante.documento)) {
        return res.status(400).json({
          msg: "El documento debe contener entre 6 y 10 dígitos numéricos",
          error: true,
        })
      }
    }

    const index = reserva.acompanantes.findIndex((item) => item._id.toString() === acompananteId)

    if (index === -1) {
      return res.status(404).json({
        msg: "Acompañante no encontrado",
        error: true,
      })
    }

    reserva.acompanantes[index] = { ...reserva.acompanantes[index]._doc, ...acompanante }
    await reserva.save()

    res.status(200).json({
      msg: "Acompañante actualizado correctamente",
      reserva,
      error: false,
    })
  } catch (error) {
    console.error("Error al actualizar acompañante:", error)
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        msg: "Error de validación",
        details: messages,
        error: true,
      })
    }
    
    res.status(500).json({
      msg: "Error en el servidor al actualizar acompañante",
      error: true,
      details: error.message,
    })
  }
}

// Elimina un acompañante de una reserva
exports.eliminarAcompanante = async (req, res) => {
  try {
    const { id, acompananteId } = req.params

    if (!id || !acompananteId) {
      return res.status(400).json({
        msg: "ID de reserva y acompañante son obligatorios",
        error: true,
      })
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de reserva inválido",
        error: true,
      })
    }

    const reserva = await Reserva.findById(id)

    if (!reserva) {
      return res.status(404).json({
        msg: "Reserva no encontrada",
        error: true,
      })
    }

    const index = reserva.acompanantes.findIndex((item) => item._id.toString() === acompananteId)

    if (index === -1) {
      return res.status(404).json({
        msg: "Acompañante no encontrado",
        error: true,
      })
    }

    reserva.acompanantes.splice(index, 1)
    await reserva.save()

    res.status(200).json({
      msg: "Acompañante eliminado correctamente",
      reserva,
      error: false,
    })
  } catch (error) {
    console.error("Error al eliminar acompañante:", error)
    res.status(500).json({
      msg: "Error en el servidor al eliminar acompañante",
      error: true,
      details: error.message,
    })
  }
}

// Crea una reserva desde la landing page (sin autenticación)
exports.crearReservaPublica = async (req, res) => {
  try {
    console.log("Recibida solicitud de reserva pública:", req.body)

    const { titular_reserva, email, telefono, fecha_inicio, fecha_fin, apartamento_id, huespedes } = req.body

    if (!titular_reserva || !email || !telefono || !fecha_inicio || !fecha_fin || !apartamento_id) {
      console.log("Faltan campos obligatorios")
      return res.status(400).json({
        msg: "Todos los campos son obligatorios",
        error: true,
      })
    }

    const nombreRegex = /^[a-zA-ZÀ-ÿ\s]+$/
    if (!nombreRegex.test(titular_reserva)) {
      return res.status(400).json({
        msg: "El nombre del titular solo puede contener letras y espacios.",
        error: true,
      })
    }

    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        msg: "Formato de email inválido",
        error: true,
      })
    }

    const telefonoRegex = /^\+?[0-9]{8,15}$/
    if (!telefonoRegex.test(telefono.replace(/\D/g, ""))) {
      return res.status(400).json({
        msg: "Formato de teléfono inválido",
        error: true,
      })
    }

    const inicio = new Date(fecha_inicio)
    const fin = new Date(fecha_fin)

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({
        msg: "Formato de fecha inválido",
        error: true,
      })
    }

    if (fin <= inicio) {
      return res.status(400).json({
        msg: "La fecha de fin debe ser posterior a la fecha de inicio",
        error: true,
      })
    }

    const diffTime = Math.abs(fin - inicio)
    const noches_estadia = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (noches_estadia < 1) {
      return res.status(400).json({
        msg: "La estadía debe ser de al menos una noche",
        error: true,
      })
    }

    if (!isValidObjectId(apartamento_id)) {
      return res.status(400).json({
        msg: "ID de apartamento inválido",
        error: true,
      })
    }

    const apartamento = await Apartamento.findById(apartamento_id)

    if (!apartamento) {
      console.log("Apartamento no encontrado:", apartamento_id)
      return res.status(404).json({
        msg: "Apartamento no encontrado",
        error: true,
      })
    }

    // Verificar disponibilidad del apartamento
    const reservasExistentes = await Reserva.find({
      apartamentos: apartamento_id,
      estado: { $ne: "cancelada" },
      $or: [{ fecha_inicio: { $lte: fin }, fecha_fin: { $gte: inicio } }],
    })

    if (reservasExistentes.length > 0) {
      console.log("Apartamento no disponible para las fechas seleccionadas")
      return res.status(400).json({
        msg: "El apartamento no está disponible para las fechas seleccionadas",
        error: true,
      })
    }

    const total = apartamento.Tarifa * noches_estadia

    console.log("Creando nueva reserva con datos:", {
      titular_reserva,
      fecha_inicio,
      fecha_fin,
      apartamentos: [apartamento_id],
      noches_estadia,
      total,
      email,
      telefono,
    })

    const nuevaReserva = new Reserva({
      titular_reserva,
      fecha_inicio,
      fecha_fin,
      apartamentos: [apartamento_id],
      noches_estadia,
      total,
      pagos_parciales: 0,
      estado: "pendiente",
      email,
      telefono,
      acompanantes: [],
    })

    await nuevaReserva.save()
    console.log("Reserva creada exitosamente:", nuevaReserva._id)

    res.status(201).json({
      msg: "Reserva creada correctamente. Pronto nos pondremos en contacto contigo.",
      reserva: nuevaReserva,
      error: false,
    })
  } catch (error) {
    console.error("Error al crear reserva desde landing:", error)
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        msg: "Error de validación",
        details: messages,
        error: true,
      })
    }
    
    res.status(500).json({
      msg: "Error en el servidor al crear la reserva",
      error: true,
      details: error.message,
    })
  }
}
