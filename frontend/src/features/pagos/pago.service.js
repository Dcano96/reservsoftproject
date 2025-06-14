// pago.service.js
import axios from "axios"

// ✅ Usar la variable de entorno
const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : "http://localhost:5000/api"

console.log("API_URL pagos configurada:", API_URL) // Para debug

// Función auxiliar para obtener el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Función auxiliar para manejar errores de imagen
const manejarErrorImagen = (error) => {
  console.error("Error con imagen:", error)
  return "/placeholder.svg?height=200&width=300&text=Error+al+cargar+imagen"
}

// Servicio para gestionar los pagos
const pagoService = {
  // Obtener todos los pagos con filtros y paginación
  getPagos: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros)
      const response = await axios.get(`${API_URL}/pagos?${params}`, {
        headers: getAuthHeader(),
      })
      return response.data
    } catch (error) {
      console.error("Error al obtener pagos:", error)
      throw error.response?.data || { msg: "Error al conectar con el servidor" }
    }
  },

  // Obtener un pago por su ID
  getPagoById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/pagos/${id}`, {
        headers: getAuthHeader(),
      })
      return response.data
    } catch (error) {
      console.error(`Error al obtener pago con ID ${id}:`, error)
      throw error.response?.data || { msg: "Error al conectar con el servidor" }
    }
  },

  // Crear un nuevo pago
  createPago: async (pagoData) => {
    try {
      const response = await axios.post(`${API_URL}/pagos`, pagoData, {
        headers: getAuthHeader(),
      })
      return response.data.pago
    } catch (error) {
      console.error("Error al crear pago:", error)
      throw error.response?.data || { msg: "Error al conectar con el servidor" }
    }
  },

  // Actualizar un pago existente
  updatePago: async (id, pagoData) => {
    try {
      const response = await axios.put(`${API_URL}/pagos/${id}`, pagoData, {
        headers: getAuthHeader(),
      })
      return response.data.pago
    } catch (error) {
      console.error(`Error al actualizar pago con ID ${id}:`, error)
      throw error.response?.data || { msg: "Error al conectar con el servidor" }
    }
  },

  // Eliminar un pago
  deletePago: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/pagos/${id}`, {
        headers: getAuthHeader(),
      })
      return response.data
    } catch (error) {
      console.error(`Error al eliminar pago con ID ${id}:`, error)
      throw error.response?.data || { msg: "Error al conectar con el servidor" }
    }
  },

  // Obtener historial completo de una reserva
  getHistorialReserva: async (reservaId) => {
    try {
      const response = await axios.get(`${API_URL}/pagos/historial/${reservaId}`, {
        headers: getAuthHeader(),
      })
      return response.data
    } catch (error) {
      console.error(`Error al obtener historial de reserva ${reservaId}:`, error)
      throw error.response?.data || { msg: "Error al conectar con el servidor" }
    }
  },

  // Sincronizar todos los pagos
  sincronizarPagos: async () => {
    try {
      const response = await axios.post(
        `${API_URL}/pagos/sincronizar`,
        {},
        {
          headers: getAuthHeader(),
        },
      )
      return response.data
    } catch (error) {
      console.error("Error al sincronizar pagos:", error)
      throw error.response?.data || { msg: "Error al conectar con el servidor" }
    }
  },

  // Obtener estadísticas de pagos
  getEstadisticas: async (fechaInicio = null, fechaFin = null) => {
    try {
      const params = {}
      if (fechaInicio) params.fecha_inicio = fechaInicio
      if (fechaFin) params.fecha_fin = fechaFin

      const queryString = new URLSearchParams(params)
      const response = await axios.get(`${API_URL}/pagos/estadisticas?${queryString}`, {
        headers: getAuthHeader(),
      })
      return response.data
    } catch (error) {
      console.error("Error al obtener estadísticas:", error)
      throw error.response?.data || { msg: "Error al conectar con el servidor" }
    }
  },

  // Obtener pagos por reserva
  getPagosByReserva: async (reservaId) => {
    try {
      const response = await axios.get(`${API_URL}/pagos?reserva=${reservaId}`, {
        headers: getAuthHeader(),
      })
      return response.data.pagos || []
    } catch (error) {
      console.error(`Error al obtener pagos de la reserva ${reservaId}:`, error)
      throw error.response?.data || { msg: "Error al conectar con el servidor" }
    }
  },

  // Calcular el total de pagos de una reserva (solo pagos realizados)
  calcularTotalPagos: async (reservaId) => {
    try {
      const response = await pagoService.getPagosByReserva(reservaId)
      const pagos = response.pagos || response
      // Filtrar solo los pagos con estado "realizado"
      const pagosRealizados = pagos.filter((pago) => pago.estado === "realizado")
      // Sumar los montos
      return pagosRealizados.reduce((total, pago) => total + pago.monto, 0)
    } catch (error) {
      console.error(`Error al calcular total de pagos para reserva ${reservaId}:`, error)
      throw error
    }
  },

  // Verificar si un pago excede el total de una reserva
  verificarMontoPago: async (reservaId, monto, pagoIdActual = null) => {
    try {
      // Obtener la reserva
      const reservaResponse = await axios.get(`${API_URL}/reservas/${reservaId}`, {
        headers: getAuthHeader(),
      })
      const reserva = reservaResponse.data

      // Obtener todos los pagos realizados de la reserva
      const pagos = await pagoService.getPagosByReserva(reservaId)

      // Calcular el total de pagos realizados (excluyendo el pago actual si se está editando)
      const totalPagosRealizados = pagos
        .filter((pago) => pago.estado === "realizado" && (pagoIdActual ? pago._id !== pagoIdActual : true))
        .reduce((total, pago) => total + pago.monto, 0)

      // Calcular el nuevo total si se añade/actualiza el pago
      const nuevoTotal = totalPagosRealizados + monto

      // Verificar si excede el total de la reserva
      return {
        valido: nuevoTotal <= reserva.total,
        exceso: Math.max(0, nuevoTotal - reserva.total),
        totalReserva: reserva.total,
        totalPagado: totalPagosRealizados,
        pendiente: reserva.total - totalPagosRealizados,
      }
    } catch (error) {
      console.error(`Error al verificar monto de pago para reserva ${reservaId}:`, error)
      throw error
    }
  },

  // ✅ NUEVO: Subir archivo de comprobante
  subirComprobante: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/pagos/subir-comprobante`, formData, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`Subiendo comprobante: ${percentCompleted}%`)
        },
      })
      return response.data
    } catch (error) {
      console.error("Error al subir comprobante:", error)
      throw error.response?.data || { msg: "Error al subir el archivo" }
    }
  },

  // ✅ NUEVO: Validar archivo de imagen
  validarArchivoImagen: (file) => {
    const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    const tamañoMaximo = 5 * 1024 * 1024 // 5MB

    if (!file) {
      return { valido: false, error: "No se ha seleccionado ningún archivo" }
    }

    if (!tiposPermitidos.includes(file.type)) {
      return {
        valido: false,
        error: "Tipo de archivo no permitido. Use: JPG, PNG, GIF o WebP",
      }
    }

    if (file.size > tamañoMaximo) {
      return {
        valido: false,
        error: "El archivo es demasiado grande. Máximo 5MB permitido",
      }
    }

    return { valido: true, error: null }
  },

  // ✅ NUEVO: Crear preview de imagen
  crearPreviewImagen: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        resolve({
          preview: e.target.result,
          info: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          },
        })
      }

      reader.onerror = () => {
        reject(new Error("Error al leer el archivo"))
      }

      reader.readAsDataURL(file)
    })
  },

  // Obtener URL segura para mostrar imagen
  obtenerUrlSegura: (url) => {
    if (!url) return "/placeholder.svg?height=200&width=300&text=Sin+comprobante"
    return url
  },

  // Formatear moneda
  formatCurrency: (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  },

  // Manejar error de imagen (método público)
  manejarErrorImagen,
}

export default pagoService
