const Landing = require("./landing.model")
const Apartamento = require("../apartamento/apartamento.model")

// Obtener la información de la landing page
exports.getLandingInfo = async (req, res) => {
  try {
    console.log("Obteniendo información de landing page")
    let landingInfo = await Landing.findOne()

    // Si no existe, crear un documento por defecto
    if (!landingInfo) {
      console.log("No se encontró información de landing, creando por defecto")
      landingInfo = await Landing.create({})
    }

    return res.status(200).json(landingInfo)
  } catch (error) {
    console.error("Error al obtener información de landing:", error)
    return res.status(500).json({
      success: false,
      message: "Error al obtener información de landing",
      error: error.message,
    })
  }
}

// Obtener apartamentos destacados para la landing page
exports.getFeaturedApartments = async (req, res) => {
  try {
    console.log("Obteniendo apartamentos destacados")

    // Buscar apartamentos destacados o los más recientes si no hay destacados
    const landing = await Landing.findOne()
    console.log("Información de landing:", landing ? landing._id : "No encontrado")

    let apartamentos = []

    if (landing && landing.featuredApartmentIds && landing.featuredApartmentIds.length > 0) {
      console.log("Buscando apartamentos destacados configurados:", landing.featuredApartmentIds)
      // Obtener apartamentos destacados configurados - eliminar el límite para mostrar todos
      apartamentos = await Apartamento.find({
        _id: { $in: landing.featuredApartmentIds },
      })
    } else {
      console.log("No hay apartamentos destacados configurados, mostrando apartamentos activos")
      // Si no hay destacados configurados, mostrar los apartamentos activos - eliminar el límite para mostrar todos
      apartamentos = await Apartamento.find({
        Estado: true, // Usar Estado (con E mayúscula) según el modelo existente
      }).sort({ Tarifa: -1 }) // Ordenar por tarifa de mayor a menor
    }

    console.log(`Se encontraron ${apartamentos.length} apartamentos`)

    // Transformar los datos para que coincidan con lo que espera el componente Landing
    const apartamentosFormateados = apartamentos.map((apt) => {
      // Asignar imagen según el tipo de apartamento
      let imagen =
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-1.png-7iFT37KEISyEFDtZqRfYvbz1dXw12D.jpeg" // Por defecto
      if (apt.Tipo === "Tipo 1") {
        imagen =
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-1.png-7iFT37KEISyEFDtZqRfYvbz1dXw12D.jpeg"
      } else if (apt.Tipo === "Tipo 2") {
        imagen =
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-2.png-Qb6dNq1YCCbp1obXcopeyIldnr9niD.jpeg"
      } else if (apt.Tipo === "Penthouse") {
        imagen =
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-3.png-txItO3avORrYlGt8r75JHZPPdAEP76.jpeg"
      }

      return {
        _id: apt._id,
        id: apt._id, // Añadir id para compatibilidad con el frontend
        nombre: `Apartamento ${apt.NumeroApto} - ${apt.Tipo}`,
        tipo: apt.Tipo,
        descripcion: `Lujoso apartamento tipo ${apt.Tipo} ubicado en el piso ${apt.Piso} con todas las comodidades.`,
        ubicacion: "El Poblado, Medellín",
        precio: apt.Tarifa,
        capacidad: 4, // Valores por defecto si no existen en el modelo
        camas: 2,
        banos: 1,
        tamano: 75,
        caracteristicas: ["Balcón", "Vista a la ciudad", "Cocina equipada", "WiFi de alta velocidad"],
        imagenes: ["/images/apartment-1.jpg", "/images/apartment-2.jpg", "/images/apartment-3.jpg"],
        imagen: imagen, // Usar la imagen asignada según el tipo
        estado: apt.Estado ? "disponible" : "no disponible",
        disponible: apt.Estado,
        tag: apt.Tipo === "Penthouse" ? "Lujo" : apt.Tipo === "Tipo 2" ? "Familiar" : "Popular",
      }
    })

    console.log("Apartamentos formateados:", apartamentosFormateados.length)
    return res.status(200).json(apartamentosFormateados)
  } catch (error) {
    console.error("Error al obtener apartamentos destacados:", error)
    return res.status(500).json({
      success: false,
      message: "Error al obtener apartamentos destacados",
      error: error.message,
    })
  }
}

// Actualizar información de la landing page (solo para administradores)
exports.updateLandingInfo = async (req, res) => {
  try {
    const { heroTitle, heroSubtitle, aboutText, featuredApartmentIds, testimonials, contactInfo, socialMedia } =
      req.body

    let landing = await Landing.findOne()

    if (!landing) {
      landing = new Landing()
    }

    // Actualizar campos si se proporcionan
    if (heroTitle) landing.heroTitle = heroTitle
    if (heroSubtitle) landing.heroSubtitle = heroSubtitle
    if (aboutText) landing.aboutText = aboutText
    if (featuredApartmentIds) landing.featuredApartmentIds = featuredApartmentIds
    if (testimonials) landing.testimonials = testimonials
    if (contactInfo) landing.contactInfo = contactInfo
    if (socialMedia) landing.socialMedia = socialMedia

    await landing.save()

    return res.status(200).json({
      success: true,
      message: "Información de landing actualizada correctamente",
      data: landing,
    })
  } catch (error) {
    console.error("Error al actualizar información de landing:", error)
    return res.status(500).json({
      success: false,
      message: "Error al actualizar información de landing",
      error: error.message,
    })
  }
}

// Agregar un nuevo testimonio
exports.addTestimonial = async (req, res) => {
  try {
    const { name, comment, rating } = req.body

    if (!name || !comment || !rating) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos (name, comment, rating)",
      })
    }

    let landing = await Landing.findOne()

    if (!landing) {
      landing = new Landing()
    }

    landing.testimonials.push({ name, comment, rating })
    await landing.save()

    return res.status(201).json({
      success: true,
      message: "Testimonio agregado correctamente",
      data: landing.testimonials,
    })
  } catch (error) {
    console.error("Error al agregar testimonio:", error)
    return res.status(500).json({
      success: false,
      message: "Error al agregar testimonio",
      error: error.message,
    })
  }
}

