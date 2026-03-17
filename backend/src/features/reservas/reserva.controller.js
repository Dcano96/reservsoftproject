// Controlador para manejar las reservas de apartamentos
const Reserva = require("./reserva.model")
const Apartamento = require("../apartamento/apartamento.model")
const mongoose = require("mongoose")
const mailer = require("../../../config/mailer")

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

const generateSecurePassword = () => {
  const prefix = "Temp" + Math.floor(Math.random() * 9 + 1)
  const lowercaseChars = "abcdefghijkmnopqrstuvwxyz"
  let lowercase = ""
  const lowercaseLength = Math.floor(Math.random() * 2) + 3
  for (let i = 0; i < lowercaseLength; i++) {
    lowercase += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length))
  }
  const numbers = Math.floor(Math.random() * 90 + 10).toString()
  const specialChars = "!@#$%^&*-_=+?"
  const specialChar = specialChars.charAt(Math.floor(Math.random() * specialChars.length))
  return prefix + lowercase + numbers + specialChar
}

/* ─────────────────────────────────────────────────────────────
   HELPER: normalizar acompañantes
   Las reservas creadas desde la landing pueden traer el documento
   en cualquiera de estos campos:
     - documento
     - documento_acompanante
     - numero_documento
   Se unifica siempre en `documento` para que Mongoose no falle.
───────────────────────────────────────────────────────────── */
const normalizarAcompanantes = (acompanantes = []) => {
  return acompanantes.map((a) => {
    const doc =
      (typeof a.documento === "string" && a.documento.trim() !== "" ? a.documento : null) ||
      (typeof a.documento_acompanante === "string" && a.documento_acompanante.trim() !== ""
        ? a.documento_acompanante
        : null) ||
      (typeof a.numero_documento === "string" && a.numero_documento.trim() !== "" ? a.numero_documento : null) ||
      ""

    return {
      // Preservar _id si existe (subdocumento existente en MongoDB)
      ...(a._id ? { _id: a._id } : {}),
      nombre: (a.nombre || "").trim(),
      apellido: (a.apellido || "").trim(),
      documento: doc,
    }
  })
}

// ─── CREAR RESERVA ────────────────────────────────────────────
exports.crearReserva = async (req, res) => {
  try {
    const { titular_reserva, fecha_inicio, fecha_fin, apartamentos, acompanantes } = req.body

    if (!titular_reserva || !fecha_inicio || !fecha_fin || !apartamentos || apartamentos.length === 0) {
      return res.status(400).json({ msg: "Datos incompletos. Todos los campos son obligatorios.", error: true })
    }

    const nombreRegex = /^[a-zA-ZÀ-ÿ\s]+$/
    if (!nombreRegex.test(titular_reserva)) {
      return res.status(400).json({
        msg: "El nombre del titular solo puede contener letras y espacios.",
        error: true,
      })
    }

    const inicio = new Date(fecha_inicio)
    const fin = new Date(fecha_fin)

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({ msg: "Formato de fecha inválido", error: true })
    }
    if (fin <= inicio) {
      return res.status(400).json({ msg: "La fecha de fin debe ser posterior a la fecha de inicio", error: true })
    }

    const diffTime = Math.abs(fin - inicio)
    const noches_estadia = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (noches_estadia < 1) {
      return res.status(400).json({ msg: "La estadía debe ser de al menos una noche", error: true })
    }

    if (!Array.isArray(apartamentos)) {
      return res.status(400).json({ msg: "El formato de apartamentos es inválido", error: true })
    }

    for (const aptId of apartamentos) {
      if (!isValidObjectId(aptId)) {
        return res.status(400).json({ msg: `ID de apartamento inválido: ${aptId}`, error: true })
      }
      const apartamentoExiste = await Apartamento.findById(aptId)
      if (!apartamentoExiste) {
        return res.status(400).json({ msg: `El apartamento con ID ${aptId} no existe`, error: true })
      }
    }

    // Normalizar y validar acompañantes
    const acompanantesNorm = normalizarAcompanantes(acompanantes || [])
    if (acompanantesNorm.length > 0) {
      for (const acomp of acompanantesNorm) {
        if (!acomp.nombre || !acomp.apellido || !acomp.documento) {
          return res.status(400).json({
            msg: "Todos los campos de acompañantes son obligatorios (nombre, apellido y documento)",
            error: true,
          })
        }
        if (!nombreRegex.test(acomp.nombre) || !nombreRegex.test(acomp.apellido)) {
          return res.status(400).json({
            msg: "Los nombres y apellidos de acompañantes solo pueden contener letras y espacios",
            error: true,
          })
        }
        const documentoRegex = /^\d{6,10}$/
        if (!documentoRegex.test(acomp.documento)) {
          return res.status(400).json({
            msg: "El documento debe contener entre 6 y 10 dígitos numéricos",
            error: true,
          })
        }
      }
    }

    let total = 0
    for (const aptId of apartamentos) {
      const apartamento = await Apartamento.findById(aptId)
      if (apartamento) total += apartamento.Tarifa * noches_estadia
    }

    const reservaData = {
      ...req.body,
      noches_estadia,
      total,
      pagos_parciales: req.body.pagos_parciales || 0,
      acompanantes: acompanantesNorm,
    }

    const reserva = new Reserva(reservaData)
    await reserva.save()

    res.status(201).json({ msg: "Reserva creada correctamente", reserva, error: false })
  } catch (error) {
    console.error("Error al crear reserva:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ msg: "Error de validación", details: messages, error: true })
    }
    res.status(500).json({ msg: "Error en el servidor al crear la reserva", error: true, details: error.message })
  }
}

// ─── OBTENER TODAS LAS RESERVAS ───────────────────────────────
exports.obtenerReservas = async (req, res) => {
  try {
    const reservas = await Reserva.find().populate("apartamentos")
    res.status(200).json(reservas)
  } catch (error) {
    console.error("Error al obtener reservas:", error)
    res.status(500).json({ msg: "Error al obtener reservas", error: true, details: error.message })
  }
}

// ─── OBTENER UNA RESERVA ──────────────────────────────────────
exports.obtenerReserva = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ msg: "ID de reserva no proporcionado", error: true })
    if (!isValidObjectId(id)) return res.status(400).json({ msg: "ID de reserva inválido", error: true })

    const reserva = await Reserva.findById(id).populate("apartamentos")
    if (!reserva) return res.status(404).json({ msg: "Reserva no encontrada", error: true })

    res.status(200).json(reserva)
  } catch (error) {
    console.error("Error al obtener reserva:", error)
    res.status(500).json({ msg: "Error en el servidor al obtener la reserva", error: true, details: error.message })
  }
}

/* ─────────────────────────────────────────────────────────────
   ACTUALIZAR RESERVA
   FIX PRINCIPAL: normalizar acompañantes SIEMPRE antes de
   guardar, sin importar si la reserva vino de la landing o
   del dashboard. Se usa runValidators: false para evitar que
   Mongoose rechace el documento por campos legacy de la landing
   (email, telefono, titular_documento, etc.) que no siempre
   están presentes en reservas del dashboard.
───────────────────────────────────────────────────────────── */
exports.actualizarReserva = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) return res.status(400).json({ msg: "ID de reserva no proporcionado", error: true })
    if (!isValidObjectId(id)) return res.status(400).json({ msg: "ID de reserva inválido", error: true })

    console.log("Datos recibidos para actualizar reserva:", JSON.stringify(req.body, null, 2))

    // FIX: normalizar acompañantes con el helper centralizado
    const bodyNormalizado = { ...req.body }
    if (Array.isArray(bodyNormalizado.acompanantes)) {
      bodyNormalizado.acompanantes = normalizarAcompanantes(bodyNormalizado.acompanantes)

      // Validar que ningún acompañante quede sin documento después de normalizar
      const sinDocumento = bodyNormalizado.acompanantes.filter((a) => !a.documento || a.documento.trim() === "")
      if (sinDocumento.length > 0) {
        return res.status(400).json({
          msg: `${sinDocumento.length} acompañante(s) no tienen documento válido. Por favor complete los datos.`,
          error: true,
          acompanantesSinDocumento: sinDocumento.map((a, i) => ({ indice: i, nombre: a.nombre, apellido: a.apellido })),
        })
      }
    }

    const reservaActualizada = await Reserva.findByIdAndUpdate(id, bodyNormalizado, {
      new: true,
      runValidators: false, // Evita ValidationError por campos legacy de landing
    }).populate("apartamentos")

    if (!reservaActualizada) return res.status(404).json({ msg: "Reserva no encontrada", error: true })

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

// ─── ELIMINAR RESERVA ─────────────────────────────────────────
exports.eliminarReserva = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ msg: "ID de reserva no proporcionado", error: true })
    if (!isValidObjectId(id)) return res.status(400).json({ msg: "ID de reserva inválido", error: true })

    const reserva = await Reserva.findById(id)
    if (!reserva) return res.status(404).json({ msg: "Reserva no encontrada", error: true })
    if (reserva.estado === "confirmada") {
      return res.status(400).json({ msg: "No se puede eliminar una reserva confirmada", error: true })
    }

    await Reserva.findByIdAndDelete(id)
    res.status(200).json({ msg: "Reserva eliminada correctamente", error: false })
  } catch (error) {
    console.error("Error al eliminar la reserva:", error)
    res.status(500).json({ msg: "Error en el servidor al eliminar la reserva", error: true, details: error.message })
  }
}

// ─── ACOMPAÑANTES ─────────────────────────────────────────────

exports.agregarAcompanante = async (req, res) => {
  try {
    const { id } = req.params
    const { acompanante } = req.body

    if (!id) return res.status(400).json({ msg: "ID de reserva no proporcionado", error: true })
    if (!isValidObjectId(id)) return res.status(400).json({ msg: "ID de reserva inválido", error: true })

    const reserva = await Reserva.findById(id)
    if (!reserva) return res.status(404).json({ msg: "Reserva no encontrada", error: true })
    if (!acompanante) return res.status(400).json({ msg: "Se requiere información del acompañante", error: true })

    // Normalizar el acompañante individual
    const [acompNorm] = normalizarAcompanantes([acompanante])

    if (!acompNorm.nombre || !acompNorm.apellido || !acompNorm.documento) {
      return res.status(400).json({
        msg: "Nombre, apellido y documento del acompañante son obligatorios",
        error: true,
      })
    }

    const nombreRegex = /^[a-zA-ZÀ-ÿ\s]+$/
    if (!nombreRegex.test(acompNorm.nombre) || !nombreRegex.test(acompNorm.apellido)) {
      return res.status(400).json({ msg: "Los nombres y apellidos solo pueden contener letras y espacios", error: true })
    }

    const documentoRegex = /^\d{6,10}$/
    if (!documentoRegex.test(acompNorm.documento)) {
      return res.status(400).json({ msg: "El documento debe contener entre 6 y 10 dígitos numéricos", error: true })
    }

    reserva.acompanantes.push(acompNorm)
    await reserva.save()

    res.status(200).json({ msg: "Acompañante agregado correctamente", reserva, error: false })
  } catch (error) {
    console.error("Error al agregar acompañante:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ msg: "Error de validación", details: messages, error: true })
    }
    res.status(500).json({ msg: "Error en el servidor al agregar acompañante", error: true, details: error.message })
  }
}

exports.actualizarAcompanante = async (req, res) => {
  try {
    const { id, acompananteId } = req.params
    const { acompanante } = req.body

    if (!id || !acompananteId) {
      return res.status(400).json({ msg: "ID de reserva y acompañante son obligatorios", error: true })
    }
    if (!isValidObjectId(id)) return res.status(400).json({ msg: "ID de reserva inválido", error: true })

    const reserva = await Reserva.findById(id)
    if (!reserva) return res.status(404).json({ msg: "Reserva no encontrada", error: true })
    if (!acompanante) return res.status(400).json({ msg: "Se requiere información del acompañante", error: true })

    // Normalizar el acompañante
    const [acompNorm] = normalizarAcompanantes([acompanante])

    if (acompNorm.nombre || acompNorm.apellido) {
      const nombreRegex = /^[a-zA-ZÀ-ÿ\s]+$/
      if (acompNorm.nombre && !nombreRegex.test(acompNorm.nombre)) {
        return res.status(400).json({ msg: "El nombre solo puede contener letras y espacios", error: true })
      }
      if (acompNorm.apellido && !nombreRegex.test(acompNorm.apellido)) {
        return res.status(400).json({ msg: "El apellido solo puede contener letras y espacios", error: true })
      }
    }

    if (acompNorm.documento) {
      const documentoRegex = /^\d{6,10}$/
      if (!documentoRegex.test(acompNorm.documento)) {
        return res.status(400).json({ msg: "El documento debe contener entre 6 y 10 dígitos numéricos", error: true })
      }
    }

    const index = reserva.acompanantes.findIndex((item) => item._id.toString() === acompananteId)
    if (index === -1) return res.status(404).json({ msg: "Acompañante no encontrado", error: true })

    reserva.acompanantes[index] = { ...reserva.acompanantes[index]._doc, ...acompNorm }
    await reserva.save()

    res.status(200).json({ msg: "Acompañante actualizado correctamente", reserva, error: false })
  } catch (error) {
    console.error("Error al actualizar acompañante:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ msg: "Error de validación", details: messages, error: true })
    }
    res.status(500).json({ msg: "Error en el servidor al actualizar acompañante", error: true, details: error.message })
  }
}

exports.eliminarAcompanante = async (req, res) => {
  try {
    const { id, acompananteId } = req.params

    if (!id || !acompananteId) {
      return res.status(400).json({ msg: "ID de reserva y acompañante son obligatorios", error: true })
    }
    if (!isValidObjectId(id)) return res.status(400).json({ msg: "ID de reserva inválido", error: true })

    const reserva = await Reserva.findById(id)
    if (!reserva) return res.status(404).json({ msg: "Reserva no encontrada", error: true })

    const index = reserva.acompanantes.findIndex((item) => item._id.toString() === acompananteId)
    if (index === -1) return res.status(404).json({ msg: "Acompañante no encontrado", error: true })

    reserva.acompanantes.splice(index, 1)
    await reserva.save()

    res.status(200).json({ msg: "Acompañante eliminado correctamente", reserva, error: false })
  } catch (error) {
    console.error("Error al eliminar acompañante:", error)
    res.status(500).json({ msg: "Error en el servidor al eliminar acompañante", error: true, details: error.message })
  }
}

// ─── RESERVA PÚBLICA (landing) ────────────────────────────────
exports.crearReservaPublica = async (req, res) => {
  try {
    console.log("Recibida solicitud de reserva pública:", req.body)

    const {
      titular_reserva,
      email,
      telefono,
      fecha_inicio,
      fecha_fin,
      apartamento_id,
      huespedes,
      documento,
      monto_pago,
      acompanantes,
      numero_acompanantes,
    } = req.body

    if (!titular_reserva || !email || !telefono || !fecha_inicio || !fecha_fin || !apartamento_id || !documento) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios", error: true })
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
      return res.status(400).json({ msg: "Formato de email inválido", error: true })
    }

    const telefonoRegex = /^\+?[0-9]{8,15}$/
    if (!telefonoRegex.test(telefono.replace(/\D/g, ""))) {
      return res.status(400).json({ msg: "Formato de teléfono inválido", error: true })
    }

    const inicio = new Date(fecha_inicio)
    const fin = new Date(fecha_fin)

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({ msg: "Formato de fecha inválido", error: true })
    }
    if (fin <= inicio) {
      return res.status(400).json({ msg: "La fecha de fin debe ser posterior a la fecha de inicio", error: true })
    }

    const diffTime = Math.abs(fin - inicio)
    const noches_estadia = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (noches_estadia < 1) {
      return res.status(400).json({ msg: "La estadía debe ser de al menos una noche", error: true })
    }

    if (!isValidObjectId(apartamento_id)) {
      return res.status(400).json({ msg: "ID de apartamento inválido", error: true })
    }

    const Cliente = require("../clientes/cliente.model")
    let cliente = await Cliente.findOne({ $or: [{ documento }, { email }] })

    let clienteExistente = false
    let randomPassword = ""

    if (cliente) {
      clienteExistente = true
    } else {
      try {
        randomPassword = generateSecurePassword()
        const bcrypt = require("bcryptjs")
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(randomPassword, salt)

        cliente = new Cliente({
          nombre: titular_reserva,
          documento,
          email,
          telefono,
          password: hashedPassword,
          rol: "cliente",
        })
        await cliente.save()
      } catch (clienteError) {
        console.error("Error al crear cliente:", clienteError)
      }
    }

    const apartamento = await Apartamento.findById(apartamento_id)
    if (!apartamento) {
      return res.status(404).json({ msg: "Apartamento no encontrado", error: true })
    }

    const reservasExistentes = await Reserva.find({
      apartamentos: apartamento_id,
      estado: { $ne: "cancelada" },
      $or: [{ fecha_inicio: { $lte: fin }, fecha_fin: { $gte: inicio } }],
    })

    if (reservasExistentes.length > 0) {
      return res.status(400).json({
        msg: "El apartamento no está disponible para las fechas seleccionadas",
        error: true,
      })
    }

    const total = apartamento.Tarifa * noches_estadia

    let pagos_parciales = 0
    if (monto_pago) {
      const montoNumerico = Number.parseFloat(monto_pago)
      if (!isNaN(montoNumerico) && montoNumerico > 0) {
        if (montoNumerico <= total) {
          pagos_parciales = montoNumerico
        } else {
          return res.status(400).json({
            msg: "El pago parcial no puede ser mayor que el total de la reserva",
            error: true,
          })
        }
      }
    }

    const ultimaReserva = await Reserva.findOne().sort({ numero_reserva: -1 })
    const nuevoNumeroReserva =
      ultimaReserva && ultimaReserva.numero_reserva ? ultimaReserva.numero_reserva + 1 : 1000

    // FIX: normalizar acompañantes de la landing antes de guardar
    const acompanantesNorm = normalizarAcompanantes(
      acompanantes && Array.isArray(acompanantes) ? acompanantes : []
    )

    let numAcompanantes = 0
    if (numero_acompanantes !== undefined) {
      numAcompanantes = Number.parseInt(numero_acompanantes)
    } else if (acompanantesNorm.length > 0) {
      numAcompanantes = acompanantesNorm.length
    }

    const nuevaReserva = new Reserva({
      titular_reserva,
      fecha_inicio,
      fecha_fin,
      apartamentos: [apartamento_id],
      noches_estadia,
      total,
      pagos_parciales,
      estado: "pendiente",
      email,
      telefono,
      acompanantes: acompanantesNorm,
      numero_acompanantes: numAcompanantes,
      numero_reserva: nuevoNumeroReserva,
      titular_documento: documento,
    })

    await nuevaReserva.save()
    console.log("Reserva creada exitosamente:", nuevaReserva._id)

    try {
      const clienteData = { nombre: titular_reserva, email, documento, telefono }
      const reservationData = {
        apartamento: apartamento.Tipo || `Apartamento ${apartamento.NumeroApto}`,
        fechaEntrada: fecha_inicio,
        fechaSalida: fecha_fin,
        huespedes: numAcompanantes + 1,
        precioPorNoche: apartamento.Tarifa,
        total,
      }
      const password = clienteExistente ? null : randomPassword

      mailer
        .sendReservationConfirmation(clienteData, reservationData, password)
        .then((result) => {
          if (result && result.success) console.log("Correo enviado a:", email)
          else console.error("Error al enviar correo:", result ? result.error : "Sin detalles")
        })
        .catch((emailError) => console.error("Excepción al enviar correo:", emailError))
    } catch (emailError) {
      console.error("Error al enviar correo de confirmación:", emailError)
    }

    res.status(201).json({
      msg: "Reserva creada correctamente. Pronto nos pondremos en contacto contigo.",
      reserva: nuevaReserva,
      clienteExistente,
      clienteInfo: clienteExistente
        ? { nombre: cliente.nombre, documento: cliente.documento, email: cliente.email, telefono: cliente.telefono }
        : null,
      error: false,
    })
  } catch (error) {
    console.error("Error al crear reserva desde landing:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ msg: "Error de validación", details: messages, error: true })
    }
    res.status(500).json({ msg: "Error en el servidor al crear la reserva", error: true, details: error.message })
  }
}

// ─── FECHAS RESERVADAS ────────────────────────────────────────
exports.obtenerFechasReservadas = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ msg: "ID de apartamento no proporcionado", error: true })
    if (!isValidObjectId(id)) return res.status(400).json({ msg: "ID de apartamento inválido", error: true })

    const reservas = await Reserva.find({
      apartamentos: id,
      estado: { $ne: "cancelada" },
      fecha_fin: { $gte: new Date() },
    })

    const fechasReservadas = reservas.map((r) => ({
      fecha_inicio: r.fecha_inicio,
      fecha_fin: r.fecha_fin,
    }))

    return res.status(200).json({ fechasReservadas, error: false })
  } catch (error) {
    console.error("Error al obtener fechas reservadas:", error)
    return res.status(500).json({ msg: "Error al obtener fechas reservadas", error: true, details: error.message })
  }
}

module.exports = {
  crearReserva: exports.crearReserva,
  obtenerReservas: exports.obtenerReservas,
  obtenerReserva: exports.obtenerReserva,
  actualizarReserva: exports.actualizarReserva,
  eliminarReserva: exports.eliminarReserva,
  agregarAcompanante: exports.agregarAcompanante,
  actualizarAcompanante: exports.actualizarAcompanante,
  eliminarAcompanante: exports.eliminarAcompanante,
  crearReservaPublica: exports.crearReservaPublica,
  obtenerFechasReservadas: exports.obtenerFechasReservadas,
  generateSecurePassword,
}