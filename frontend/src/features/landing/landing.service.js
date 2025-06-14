import axios from "axios"

// ✅ Configuración de API con variables de entorno
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

// ✅ Configurar las rutas específicas
const API_ENDPOINTS = {
  apartamentos: `${API_BASE_URL}/api/apartamentos`,
  apartamentosDestacados: `${API_BASE_URL}/api/landing/apartamentos-destacados`,
  reservasPublica: `${API_BASE_URL}/api/reservas/publica`,
  fechasReservadas: (apartamentoId) => `${API_BASE_URL}/api/reservas/fechas-reservadas/${apartamentoId}`,
  landingInfo: `${API_BASE_URL}/api/landing`,
}

console.log("🔧 Landing Service API Configuration:", {
  baseUrl: API_BASE_URL,
  endpoints: API_ENDPOINTS,
})

// ✅ Función para hacer llamadas a la API con manejo de errores
const apiCall = async (url, options = {}) => {
  try {
    console.log(`📡 Landing Service API Call: ${url}`)
    const response = await axios.get(url, options)
    console.log(`✅ Landing Service API Success: ${url}`, response.data)
    return response
  } catch (error) {
    console.error(`❌ Landing Service API Error: ${url}`, error.response?.data || error.message)
    throw error
  }
}

// ✅ Servicio para operaciones de la landing
const landingService = {
  // Obtener apartamentos destacados
  getApartamentosDestacados: async () => {
    try {
      console.log("🏠 Obteniendo apartamentos destacados...")
      const response = await apiCall(API_ENDPOINTS.apartamentosDestacados)
      return response.data
    } catch (error) {
      console.error("Error al obtener apartamentos destacados:", error)
      throw error
    }
  },

  // Obtener todos los apartamentos
  getAllApartamentos: async () => {
    try {
      console.log("🏠 Obteniendo todos los apartamentos...")
      const response = await apiCall(API_ENDPOINTS.apartamentos)
      return response.data
    } catch (error) {
      console.error("Error al obtener apartamentos:", error)
      throw error
    }
  },

  // Obtener fechas reservadas de un apartamento
  getFechasReservadas: async (apartamentoId) => {
    try {
      console.log(`📅 Obteniendo fechas reservadas para apartamento: ${apartamentoId}`)
      const response = await apiCall(API_ENDPOINTS.fechasReservadas(apartamentoId))
      return response.data
    } catch (error) {
      console.error("Error al obtener fechas reservadas:", error)
      throw error
    }
  },

  // Crear reserva pública
  crearReservaPublica: async (reservaData) => {
    try {
      console.log("📝 Creando reserva pública...", reservaData)
      const response = await axios.post(API_ENDPOINTS.reservasPublica, reservaData)
      console.log("✅ Reserva creada exitosamente:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Error al crear reserva:", error.response?.data || error.message)
      throw error
    }
  },

  // Obtener información de la landing
  getLandingInfo: async () => {
    try {
      console.log("ℹ️ Obteniendo información de landing...")
      const response = await apiCall(API_ENDPOINTS.landingInfo)
      return response.data
    } catch (error) {
      console.error("Error al obtener información de landing:", error)
      throw error
    }
  },

  // Transformar datos de apartamentos para el formato esperado por el componente
  transformApartamentosData: (apartamentos) => {
    return apartamentos.map((apt) => {
      // Determinar la imagen basada en el tipo
      let imagenUrl = "/imagen-1.png"
      if (apt.Tipo === "Penthouse") {
        imagenUrl = "/imagen-3.png"
      } else if (apt.Tipo === "Tipo 2") {
        imagenUrl = "/imagen-2.png"
      }

      return {
        _id: apt._id,
        id: apt._id,
        nombre: `Apartamento ${apt.NumeroApto} - ${apt.Tipo}`,
        tipo: apt.Tipo,
        descripcion: `Lujoso apartamento tipo ${apt.Tipo} ubicado en el piso ${apt.Piso} con todas las comodidades.`,
        ubicacion: "El Poblado, Medellín",
        precio: apt.Tarifa,
        capacidad: 4,
        camas: 2,
        banos: 1,
        tamano: 75,
        caracteristicas: ["Balcón", "Vista a la ciudad", "Cocina equipada", "WiFi de alta velocidad"],
        imagenes: ["/images/apartment-1.jpg", "/images/apartment-2.jpg", "/images/apartment-3.jpg"],
        imagen: imagenUrl,
        estado: apt.Estado ? "disponible" : "no disponible",
        disponible: apt.Estado,
        tag: apt.Tipo === "Penthouse" ? "Lujo" : apt.Tipo === "Tipo 2" ? "Familiar" : "Popular",
      }
    })
  },
}

export default landingService
