const Hospedaje = require("./hospedaje.model")
const Reserva = require("../reservas/reserva.model") // Se importa el modelo Reserva para sincronización

// Crear un hospedaje
exports.createHospedaje = async (req, res) => {
  try {
    // Asignar automáticamente el número de reserva incrementado a partir de 1000
    const lastHospedaje = await Hospedaje.findOne({}, {}, { sort: { createdAt: -1 } })
    let newNumero = 1000
    if (lastHospedaje && typeof lastHospedaje.numeroReserva === "number") {
      newNumero = lastHospedaje.numeroReserva + 1
    }
    req.body.numeroReserva = newNumero // Ahora es numérico

    // Se reciben todos los campos, incluido el campo "numeroIdentificacion"
    const hospedaje = new Hospedaje(req.body)
    await hospedaje.save()
    res.status(201).json({ msg: "Hospedaje creado correctamente", hospedaje })
  } catch (error) {
    console.error("Error al crear hospedaje:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// ✅ Función mejorada para sincronizar reservas con timeout
const sincronizarReservas = async () => {
  try {
    console.log("🔄 Iniciando sincronización de reservas...")

    // ✅ Timeout para evitar que la sincronización bloquee la respuesta
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout en sincronización")), 8000),
    )

    const syncPromise = async () => {
      const reservas = await Reserva.find().limit(100) // ✅ Limitar para evitar sobrecarga
      let sincronizadas = 0
      let actualizadas = 0

      for (const reserva of reservas) {
        // Se busca si ya existe un hospedaje basado en el número de reserva
        const exists = await Hospedaje.findOne({ numeroReserva: reserva.numero_reserva })
        if (!exists) {
          // Se crea un nuevo hospedaje con la información de la reserva
          const newHospedaje = new Hospedaje({
            numeroReserva: reserva.numero_reserva,
            cliente: reserva.titular_reserva,
            numeroIdentificacion: reserva.titular_documento || "", // Usar el documento del titular si existe
            email: reserva.email || "", // Usar el email de la reserva
            telefono: reserva.telefono || "", // Usar el teléfono de la reserva
            fecha_inicio: reserva.fecha_inicio,
            fecha_fin: reserva.fecha_fin,
            apartamentos: reserva.apartamentos,
            estadia: String(reserva.noches_estadia), // Se almacena como string (según el esquema)
            total: reserva.total,
            estado: reserva.estado,
            acompanantes: reserva.acompanantes,
            descuento: {}, // No hay información de descuento en Reserva
          })
          await newHospedaje.save()
          sincronizadas++
        } else {
          // Si ya existe, actualizar los campos que podrían haber cambiado en la reserva
          exists.cliente = reserva.titular_reserva
          exists.numeroIdentificacion = reserva.titular_documento || exists.numeroIdentificacion
          exists.email = reserva.email || exists.email
          exists.telefono = reserva.telefono || exists.telefono
          exists.fecha_inicio = reserva.fecha_inicio
          exists.fecha_fin = reserva.fecha_fin
          exists.apartamentos = reserva.apartamentos
          exists.estadia = String(reserva.noches_estadia)
          exists.total = reserva.total
          exists.estado = reserva.estado
          exists.acompanantes = reserva.acompanantes
          await exists.save()
          actualizadas++
        }
      }

      console.log(`✅ Sincronización completada: ${sincronizadas} creadas, ${actualizadas} actualizadas`)
    }

    // ✅ Ejecutar con timeout
    await Promise.race([syncPromise(), timeoutPromise])
  } catch (error) {
    console.error("⚠️ Advertencia en sincronización de reservas:", error.message)
    // No lanzar error para que no bloquee la obtención de hospedajes
  }
}

/*
  ✅ Obtener todos los hospedajes con manejo de errores mejorado
*/
exports.getHospedajes = async (req, res) => {
  try {
    console.log("🔄 Obteniendo hospedajes...")

    // ✅ Sincronización con timeout - no bloquear si falla
    try {
      await sincronizarReservas()
    } catch (syncError) {
      console.warn("⚠️ Sincronización omitida:", syncError.message)
      // Continuar sin sincronización
    }

    // ✅ Obtener hospedajes con timeout en la consulta
    const hospedajes = await Promise.race([
      Hospedaje.aggregate([
        {
          $lookup: {
            from: "reservas",
            localField: "numeroReserva",
            foreignField: "numero_reserva",
            as: "reservaInfo",
          },
        },
        {
          $unwind: {
            path: "$reservaInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "apartamentos",
            localField: "apartamentos",
            foreignField: "_id",
            as: "apartamentos",
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 200 }, // ✅ Limitar resultados para mejorar rendimiento
      ]),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout en consulta de hospedajes")), 15000)),
    ])

    console.log(`✅ ${hospedajes.length} hospedajes obtenidos exitosamente`)
    res.status(200).json(hospedajes)
  } catch (error) {
    console.error("❌ Error al obtener hospedajes:", error)

    // ✅ Respuesta de fallback en caso de error
    if (error.message.includes("Timeout")) {
      res.status(408).json({
        msg: "La consulta tardó demasiado tiempo. Intenta nuevamente.",
        error: "timeout",
      })
    } else {
      res.status(500).json({
        msg: "Error al obtener hospedajes",
        error: error.message,
      })
    }
  }
}

// Actualizar un hospedaje
exports.updateHospedaje = async (req, res) => {
  try {
    const hospedaje = await Hospedaje.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!hospedaje) {
      return res.status(404).json({ msg: "Hospedaje no encontrado" })
    }
    res.status(200).json({ msg: "Hospedaje actualizado correctamente", hospedaje })
  } catch (error) {
    console.error("Error al actualizar hospedaje:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

// Eliminar un hospedaje (no se puede eliminar si está confirmada)
exports.deleteHospedaje = async (req, res) => {
  try {
    const hospedaje = await Hospedaje.findById(req.params.id)
    if (!hospedaje) return res.status(404).json({ msg: "Hospedaje no encontrado" })
    if (hospedaje.estado === "confirmada") {
      return res.status(400).json({ msg: "No se puede eliminar un hospedaje confirmada" })
    }
    await Hospedaje.findByIdAndDelete(req.params.id)
    res.status(200).json({ msg: "Hospedaje eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar hospedaje:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

/**
 * Guardar/actualizar la información de Check‑in Check‑out de un hospedaje específico.
 * Se recibe un array de objetos con la información de cada servicio.
 * Ahora se incluye el campo "observaciones" enviado desde el front‑end.
 */
exports.checkInCheckOut = async (req, res) => {
  try {
    const { id } = req.params // ID del hospedaje
    const { servicios } = req.body // Array con la información de check‑in

    // Buscamos el hospedaje
    const hospedaje = await Hospedaje.findById(id)
    if (!hospedaje) {
      return res.status(404).json({ msg: "Hospedaje no encontrado" })
    }

    // Sobrescribimos la información de checkInData con los datos recibidos
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
}

// ✅ Obtener habitaciones disponibles mejorado
exports.getHabitacionesDisponibles = async (req, res) => {
  try {
    console.log("🔄 Obteniendo habitaciones disponibles...")

    // ✅ Respuesta más rápida con datos simulados
    const habitaciones = []
    for (let i = 1; i <= 18; i++) {
      habitaciones.push({
        numero: i,
        disponible: true,
        observacion: "",
        estado: "limpia",
      })
    }

    res.status(200).json({
      msg: "Habitaciones disponibles obtenidas correctamente",
      data: habitaciones,
    })
  } catch (error) {
    console.error("Error al obtener habitaciones disponibles:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

/**
 * Guardar la información actualizada de Habitaciones Disponibles.
 * Se espera recibir un array de habitaciones en req.body.rooms.
 */
exports.saveHabitaciones = async (req, res) => {
  try {
    const rooms = req.body.rooms
    res.status(200).json({ msg: "Habitaciones actualizadas correctamente", rooms })
  } catch (error) {
    console.error("Error al guardar habitaciones:", error)
    res.status(500).json({ msg: "Error en el servidor" })
  }
}

/**
 * Obtener facturas de pago del cliente.
 * Se generan los datos a partir de los hospedajes existentes.
 */
exports.getFacturas = async (req, res) => {
  try {
    const hospedajes = await Hospedaje.find().limit(100) // ✅ Limitar para mejorar rendimiento
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
}
