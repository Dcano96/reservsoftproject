// Script de migración de pagos legacy (sin array `abonos`) al nuevo modelo
// que unifica todos los abonos de una reserva en un solo Pago.
//
// USO: node backend/src/features/pagos/pago.migration.js
//
// Pasos:
//   1) Para cada reserva, agrupa todos los Pagos existentes.
//   2) Si la reserva tiene varios Pagos, los fusiona en uno solo (el más
//      antiguo) y los demás los borra. Cada Pago original se convierte en
//      un abono dentro del array `abonos`.
//   3) Si un Pago ya tiene `abonos`, no lo toca.
//
// Idempotente: se puede correr varias veces sin duplicar abonos.

require("dotenv").config({ path: require("path").join(__dirname, "../../../.env") })
const mongoose = require("mongoose")

const connectDB = require("../../../config/db")

const run = async () => {
  await connectDB()
  const Pago = require("./pago.model")

  console.log("🔍 Buscando pagos legacy...")
  const pagos = await Pago.find({}).sort({ createdAt: 1 }).lean()
  console.log(`Encontrados ${pagos.length} pagos en total.`)

  // Agrupar por reserva
  const porReserva = new Map()
  pagos.forEach((p) => {
    if (!p.reserva) return
    const key = p.reserva.toString()
    if (!porReserva.has(key)) porReserva.set(key, [])
    porReserva.get(key).push(p)
  })

  let fusionados = 0
  let convertidos = 0

  for (const [reservaId, lista] of porReserva.entries()) {
    // Caso 1: el primer Pago ya tiene abonos → asumir migrado.
    const principal = lista[0]
    const yaTieneAbonos = Array.isArray(principal.abonos) && principal.abonos.length > 0

    if (yaTieneAbonos && lista.length === 1) continue

    // Construir lista de abonos a partir de los Pagos legacy.
    const abonosNuevos = []
    lista.forEach((p, idx) => {
      // Si ya tiene abonos, los mantenemos
      if (Array.isArray(p.abonos) && p.abonos.length > 0) {
        p.abonos.forEach((a) => abonosNuevos.push(a))
      } else {
        // Convertir el pago plano en un abono
        abonosNuevos.push({
          monto: p.monto || 0,
          fecha: p.fecha || p.createdAt || new Date(),
          metodo_pago: p.metodo_pago || "efectivo",
          comprobante: p.comprobante || "",
          origen: p.comprobante ? "landing" : "admin",
          estado: p.estado === "anulado" || p.estado === "fallido" ? "rechazado" : (p.estado || "pendiente"),
          notas: p.notas || "",
          verificado_por: p.verificado_por || "",
          fecha_verificacion: p.fecha_verificacion || null,
        })
      }
    })

    // Borrar todos los pagos de la reserva, luego crear uno consolidado.
    // (más simple que actualizar y mantener el _id del principal — y
    //  evita problemas con el índice unique en `reserva`)
    await Pago.deleteMany({ reserva: reservaId })

    const consolidado = new Pago({
      reserva: reservaId,
      clienteNombre: principal.clienteNombre || "",
      metodo_pago: principal.metodo_pago || "efectivo",
      comprobante: principal.comprobante || "",
      notas: principal.notas || "",
      abonos: abonosNuevos,
    })
    consolidado.recalcularDesdeAbonos()
    await consolidado.save()

    if (lista.length > 1) {
      fusionados++
      console.log(`✓ Reserva ${reservaId}: fusionados ${lista.length} pagos en uno con ${abonosNuevos.length} abonos.`)
    } else {
      convertidos++
    }
  }

  console.log("")
  console.log(`✅ Migración completa.`)
  console.log(`   - Reservas con múltiples pagos fusionados: ${fusionados}`)
  console.log(`   - Pagos legacy convertidos a abonos: ${convertidos}`)

  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error("Error en la migración:", err)
  process.exit(1)
})
