// Controlador para manejar las reservas de apartamentos
const Reserva = require("./reserva.model")
const Apartamento = require("../apartamento/apartamento.model")
const mongoose = require("mongoose")
// Importar el mailer
const mailer = require("../../../config/mailer")

// Función para validar ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

// Función para generar contraseñas temporales seguras que cumplan con los requisitos
const generateSecurePassword = () => {
  // Prefijo "Temp" seguido de un número aleatorio entre 1-9
  const prefix = "Temp" + Math.floor(Math.random() * 9 + 1)

  // Generar letras minúsculas aleatorias (3-4 caracteres)
  const lowercaseChars = "abcdefghijkmnopqrstuvwxyz"
  let lowercase = ""
  const lowercaseLength = Math.floor(Math.random() * 2) + 3 // 3-4 caracteres
  for (let i = 0; i < lowercaseLength; i++) {
    lowercase += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length))
  }

  // Añadir 1-2 números aleatorios
  const numbers = Math.floor(Math.random() * 90 + 10).toString()

  // Añadir un carácter especial
  const specialChars = "!@#$%^&*-_=+?"
  const specialChar = specialChars.charAt(Math.floor(Math.random() * specialChars.length))

  // Combinar todo para formar la contraseña
  // Formato: Temp + número + letras minúsculas + números + carácter especial
  return prefix + lowercase + numbers + specialChar
}

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

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
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

    console.log("Datos recibidos para actualizar reserva:", JSON.stringify(req.body, null, 2))

    if (req.body.acompanantes && Array.isArray(req.body.acompanantes)) {
      req.body.acompanantes = req.body.acompanantes.map((acomp) => {
        // Asegúrate de que el documento nunca sea undefined o vacío
        if (!acomp.documento && !acomp.documento_acompanante) {
          console.log("Acompañante sin documento:", acomp)
          // Proporciona un valor predeterminado para evitar el error de validación
          return {
            ...acomp,
            documento: "0000000000", // Valor temporal para pasar la validación
          }
        }

        return {
          _id: acomp._id, // Mantener el ID si existe
          nombre: acomp.nombre || "",
          apellido: acomp.apellido || "",
          documento: acomp.documento || acomp.documento_acompanante || "0000000000",
        }
      })
    }

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
    const reservaActualizada = await Reserva.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: false,
    }).populate("apartamentos")

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

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
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

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
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
      console.log("Faltan campos obligatorios")
      return res.status(400).json({
        msg: "Todos los campos son obligatorios",
        error: true,
      })
    }

    // Validaciones de formato
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

    // Verificar si el cliente ya existe
    const Cliente = require("../clientes/cliente.model")
    let cliente = await Cliente.findOne({
      $or: [{ documento }, { email }],
    })

    let clienteExistente = false
    let randomPassword = ""

    if (cliente) {
      clienteExistente = true
      console.log("Cliente ya registrado:", cliente._id)
    } else {
      // Si no existe, crear un nuevo cliente
      try {
        // Generar una contraseña segura con el formato requerido
        randomPassword = generateSecurePassword()
        console.log("Contraseña temporal generada:", randomPassword)

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
        console.log("Nuevo cliente creado:", cliente._id)
      } catch (clienteError) {
        console.error("Error al crear cliente:", clienteError)
        // Continuamos con la reserva aunque falle la creación del cliente
      }
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

    // Validar el monto del pago parcial
    let pagos_parciales = 0
    if (monto_pago) {
      const montoNumerico = Number.parseFloat(monto_pago)
      if (!isNaN(montoNumerico) && montoNumerico > 0) {
        // Verificar que el pago parcial no exceda el total
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

    // Generar un número de reserva único
    // Buscar el último número de reserva y aumentarlo en 1
    const ultimaReserva = await Reserva.findOne().sort({ numero_reserva: -1 })
    const nuevoNumeroReserva = ultimaReserva && ultimaReserva.numero_reserva ? ultimaReserva.numero_reserva + 1 : 1000

    console.log("Creando nueva reserva con datos:", {
      titular_reserva,
      fecha_inicio,
      fecha_fin,
      apartamentos: [apartamento_id],
      noches_estadia,
      total,
      pagos_parciales,
      email,
      telefono,
      numero_reserva: nuevoNumeroReserva,
      documento,
    })

    // Procesar acompañantes si existen
    let acompanantesArray = []
    if (acompanantes && Array.isArray(acompanantes) && acompanantes.length > 0) {
      acompanantesArray = acompanantes
    }

    // Determinar el número de acompañantes
    let numAcompanantes = 0
    if (numero_acompanantes !== undefined) {
      // Si se envía explícitamente
      numAcompanantes = Number.parseInt(numero_acompanantes)
    } else if (acompanantesArray.length > 0) {
      // Si no, usar la longitud del array
      numAcompanantes = acompanantesArray.length
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
      acompanantes: acompanantesArray,
      numero_acompanantes: numAcompanantes, // Recibir explícitamente el número de acompañantes
      numero_reserva: nuevoNumeroReserva,
      titular_documento: documento,
      fecha_primer_pago: new Date(), // Registrar la fecha del primer pago
    })

    await nuevaReserva.save()
    console.log("Reserva creada exitosamente:", nuevaReserva._id)

    // Enviar correo de confirmación
    try {
      console.log("Preparando envío de correo de confirmación...")

      const clienteData = {
        nombre: titular_reserva,
        email: email,
        documento: documento,
        telefono: telefono,
      }

      const reservationData = {
        apartamento: apartamento.Tipo || `Apartamento ${apartamento.NumeroApto}`,
        fechaEntrada: fecha_inicio,
        fechaSalida: fecha_fin,
        huespedes: numAcompanantes + 1, // Titular + acompañantes
        precioPorNoche: apartamento.Tarifa,
        total: total,
      }

      // Si es un nuevo cliente, enviar la contraseña temporal
      const password = clienteExistente ? null : randomPassword

      // Enviar el correo de forma asíncrona para no bloquear la respuesta
      mailer
        .sendReservationConfirmation(clienteData, reservationData, password)
        .then((result) => {
          if (result && result.success) {
            console.log("Correo de confirmación enviado exitosamente a:", email)
          } else {
            console.error("Error al enviar correo de confirmación:", result ? result.error : "Sin detalles")
          }
        })
        .catch((emailError) => {
          console.error("Excepción al enviar correo de confirmación:", emailError)
        })

      console.log("Proceso de envío de correo iniciado")
    } catch (emailError) {
      console.error("Error al enviar correo de confirmación:", emailError)
      // No fallamos si el correo no se envía
    }

    res.status(201).json({
      msg: "Reserva creada correctamente. Pronto nos pondremos en contacto contigo.",
      reserva: nuevaReserva,
      clienteExistente,
      clienteInfo: clienteExistente
        ? {
            nombre: cliente.nombre,
            documento: cliente.documento,
            email: cliente.email,
            telefono: cliente.telefono,
          }
        : null,
      error: false,
    })
  } catch (error) {
    console.error("Error al crear reserva desde landing:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
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

// Obtiene las fechas reservadas para un apartamento específico
exports.obtenerFechasReservadas = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        msg: "ID de apartamento no proporcionado",
        error: true,
      })
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        msg: "ID de apartamento inválido",
        error: true,
      })
    }

    // Buscar todas las reservas para este apartamento que no estén canceladas
    const reservas = await Reserva.find({
      apartamentos: id,
      estado: { $ne: "cancelada" },
      // Solo reservas activas y futuras
      fecha_fin: { $gte: new Date() },
    })

    // Extraer las fechas reservadas
    const fechasReservadas = reservas.map((reserva) => ({
      fecha_inicio: reserva.fecha_inicio,
      fecha_fin: reserva.fecha_fin,
    }))

    return res.status(200).json({
      fechasReservadas,
      error: false,
    })
  } catch (error) {
    console.error("Error al obtener fechas reservadas:", error)
    return res.status(500).json({
      msg: "Error al obtener fechas reservadas",
      error: true,
      details: error.message,
    })
  }
}

// Completa el pago de una reserva y cambia su estado a confirmada
exports.completarPagoReserva = async (req, res) => {
  try {
    const { id } = req.params
    const { monto_pago } = req.body

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

    // Verificar si la reserva ya está confirmada
    if (reserva.estado === "confirmada") {
      return res.status(400).json({
        msg: "La reserva ya está confirmada",
        error: true,
      })
    }

    // Verificar si la reserva está cancelada
    if (reserva.estado === "cancelada") {
      return res.status(400).json({
        msg: "No se puede completar el pago de una reserva cancelada",
        error: true,
      })
    }

    // Calcular el monto restante por pagar
    const montoRestante = reserva.total - reserva.pagos_parciales

    // Si se proporciona un monto específico, validarlo
    if (monto_pago) {
      const montoNumerico = Number.parseFloat(monto_pago)

      if (isNaN(montoNumerico) || montoNumerico <= 0) {
        return res.status(400).json({
          msg: "El monto de pago debe ser un número positivo",
          error: true,
        })
      }

      if (montoNumerico > montoRestante) {
        return res.status(400).json({
          msg: "El monto de pago no puede ser mayor que el saldo pendiente",
          error: true,
        })
      }

      // Actualizar pagos parciales con el monto proporcionado
      reserva.pagos_parciales += montoNumerico
    } else {
      // Si no se proporciona monto, se asume que se paga el total restante
      reserva.pagos_parciales = reserva.total
    }

    // Si se ha pagado el total completo, cambiar estado a confirmada
    if (reserva.pagos_parciales >= reserva.total) {
      reserva.estado = "confirmada"
      // Registrar la fecha del segundo pago
      reserva.fecha_segundo_pago = new Date()
    }

    await reserva.save()

    res.status(200).json({
      msg: "Pago completado correctamente",
      reserva,
      error: false,
    })
  } catch (error) {
    console.error("Error al completar el pago:", error)
    res.status(500).json({
      msg: "Error en el servidor al procesar el pago",
      error: true,
      details: error.message,
    })
  }
}

// Subir comprobante de pago
exports.subirComprobantePago = async (req, res) => {
  try {
    const { id } = req.params
    const { comprobante_url, completar_pago } = req.body

    console.log("Recibida solicitud para subir comprobante:", {
      id,
      comprobante_url: comprobante_url ? "URL recibida" : "No recibida",
      completar_pago,
    })

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

    if (!comprobante_url) {
      return res.status(400).json({
        msg: "URL del comprobante no proporcionada",
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

    // Guardar la URL del comprobante
    reserva.comprobante_pago = comprobante_url

    // Registrar la fecha de subida del comprobante
    reserva.fecha_comprobante = new Date()

    // Si es el segundo pago, guardar en el campo correspondiente
    if (reserva.pagos_parciales < reserva.total) {
      reserva.comprobante_segundo_pago = comprobante_url
    }

    // Si se solicita completar el pago automáticamente
    if (completar_pago === true) {
      // Calcular el monto restante
      const montoRestante = reserva.total - reserva.pagos_parciales

      // Completar el pago
      reserva.pagos_parciales = reserva.total

      // Cambiar estado a confirmada
      reserva.estado = "confirmada"

      // Registrar la fecha del segundo pago
      reserva.fecha_segundo_pago = new Date()
    }

    await reserva.save()

    res.status(200).json({
      msg: "Comprobante de pago subido correctamente" + (completar_pago ? " y pago completado" : ""),
      reserva,
      error: false,
    })
  } catch (error) {
    console.error("Error al subir comprobante de pago:", error)
    res.status(500).json({
      msg: "Error en el servidor al subir el comprobante",
      error: true,
      details: error.message,
    })
  }
}

// Exportar la función de generación de contraseñas para uso en otros módulos
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
  completarPagoReserva: exports.completarPagoReserva,
  subirComprobantePago: exports.subirComprobantePago,
  generateSecurePassword,
}
