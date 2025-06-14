const mongoose = require("mongoose")

const landingSchema = new mongoose.Schema({
  heroTitle: {
    type: String,
    default: "Bienvenido a Nido Sky Hotel",
  },
  heroSubtitle: {
    type: String,
    default: "Descubre el lujo y la comodidad en el corazón de la naturaleza",
  },
  aboutText: {
    type: String,
    default:
      "Nido Sky Hotel es un refugio de lujo ubicado en un entorno natural privilegiado. Nuestro hotel combina la elegancia moderna con la belleza natural, ofreciendo a nuestros huéspedes una experiencia única de descanso y confort.",
  },
  featuredApartmentIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartamento",
    },
  ],
  testimonials: [
    {
      name: String,
      comment: String,
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
  ],
  contactInfo: {
    address: {
      type: String,
      default: "Carrera 15 #10-25, Zona Montañosa",
    },
    phone: {
      type: String,
      default: "+57 300 123 4567",
    },
    email: {
      type: String,
      default: "info@nidosky.com",
    },
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
  },

  // ===== CAMPOS AGREGADOS PARA COMPROBANTES Y FECHAS =====
  // Fechas de pagos
  fecha_primer_pago: {
    type: Date,
    required: false,
  },
  fecha_segundo_pago: {
    type: Date,
    required: false,
  },

  // Comprobantes de pago
  comprobante_pago: {
    type: String, // URL del comprobante
    required: false,
  },
  comprobante_segundo_pago: {
    type: String, // URL del segundo comprobante
    required: false,
  },

  // Fecha cuando se subió el comprobante
  fecha_comprobante: {
    type: Date,
    required: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Middleware para actualizar la fecha de actualización
landingSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

const Landing = mongoose.model("Landing", landingSchema)

module.exports = Landing
