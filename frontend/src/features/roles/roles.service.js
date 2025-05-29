import api from "../../services/api.js"

// Configurar la URL base para roles
const API_URL = "/api/roles"

console.log("Servicio de roles inicializado con URL:", API_URL)

const getRoles = async () => {
  try {
    console.log("🔄 Obteniendo roles desde:", API_URL)
    const response = await api.get(API_URL)
    console.log("✅ Respuesta exitosa del servidor:", response)
    console.log("📋 Datos de roles recibidos:", response.data)

    // Verificar que la respuesta sea un array
    if (Array.isArray(response.data)) {
      console.log(`✅ Se encontraron ${response.data.length} roles`)
      return response.data
    } else {
      console.warn("⚠️ La respuesta no es un array:", response.data)
      return []
    }
  } catch (error) {
    console.error("❌ Error al obtener roles:", error)
    console.error("📄 Detalles del error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    })

    // Devolver array vacío en caso de error
    return []
  }
}

const getRolById = async (id) => {
  try {
    console.log("🔄 Obteniendo rol por ID:", id)
    const response = await api.get(`${API_URL}/${id}`)
    console.log("✅ Rol obtenido:", response.data)
    return response.data
  } catch (error) {
    console.error("❌ Error al obtener rol por ID:", error)
    throw error
  }
}

const createRol = async (rolData) => {
  try {
    console.log("🔄 Creando nuevo rol:", rolData)
    const response = await api.post(API_URL, rolData)
    console.log("✅ Rol creado:", response.data)
    return response.data
  } catch (error) {
    console.error("❌ Error al crear rol:", error)
    throw error
  }
}

const updateRol = async (id, rolData) => {
  try {
    console.log("🔄 Actualizando rol:", id, rolData)
    const response = await api.put(`${API_URL}/${id}`, rolData)
    console.log("✅ Rol actualizado:", response.data)
    return response.data
  } catch (error) {
    console.error("❌ Error al actualizar rol:", error)
    throw error
  }
}

const deleteRol = async (id) => {
  try {
    console.log("🔄 Eliminando rol:", id)
    const response = await api.delete(`${API_URL}/${id}`)
    console.log("✅ Rol eliminado:", response.data)
    return response.data
  } catch (error) {
    console.error("❌ Error al eliminar rol:", error)
    throw error
  }
}

export default {
  getRoles,
  getRolById,
  createRol,
  updateRol,
  deleteRol,
}
