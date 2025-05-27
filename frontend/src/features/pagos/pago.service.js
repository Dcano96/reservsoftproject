// pago.service.js
import axios from 'axios';

// ✅ Usar la variable de entorno
const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:5000/api';

console.log("API_URL pagos configurada:", API_URL); // Para debug

// Función auxiliar para obtener el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Servicio para gestionar los pagos
const pagoService = {
  // Obtener todos los pagos
  getPagos: async () => {
    try {
      const response = await axios.get(`${API_URL}/pagos`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      throw error.response?.data || { msg: 'Error al conectar con el servidor' };
    }
  },

  // Obtener un pago por su ID
  getPagoById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/pagos/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener pago con ID ${id}:`, error);
      throw error.response?.data || { msg: 'Error al conectar con el servidor' };
    }
  },

  // Crear un nuevo pago
  createPago: async (pagoData) => {
    try {
      const response = await axios.post(`${API_URL}/pagos`, pagoData, {
        headers: getAuthHeader()
      });
      return response.data.pago;
    } catch (error) {
      console.error('Error al crear pago:', error);
      throw error.response?.data || { msg: 'Error al conectar con el servidor' };
    }
  },

  // Actualizar un pago existente
  updatePago: async (id, pagoData) => {
    try {
      const response = await axios.put(`${API_URL}/pagos/${id}`, pagoData, {
        headers: getAuthHeader()
      });
      return response.data.pago;
    } catch (error) {
      console.error(`Error al actualizar pago con ID ${id}:`, error);
      throw error.response?.data || { msg: 'Error al conectar con el servidor' };
    }
  },

  // Eliminar un pago
  deletePago: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/pagos/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar pago con ID ${id}:`, error);
      throw error.response?.data || { msg: 'Error al conectar con el servidor' };
    }
  },

  // NUEVOS MÉTODOS

  // Anular un pago (cambiar estado a "anulado")
  anularPago: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/pagos/${id}`, { estado: 'anulado' }, {
        headers: getAuthHeader()
      });
      return response.data.pago;
    } catch (error) {
      console.error(`Error al anular pago con ID ${id}:`, error);
      throw error.response?.data || { msg: 'Error al conectar con el servidor' };
    }
  },

  // Obtener pagos por reserva
  getPagosByReserva: async (reservaId) => {
    try {
      const response = await axios.get(`${API_URL}/pagos?reserva=${reservaId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener pagos de la reserva ${reservaId}:`, error);
      throw error.response?.data || { msg: 'Error al conectar con el servidor' };
    }
  },

  // Calcular el total de pagos de una reserva
  calcularTotalPagos: async (reservaId) => {
    try {
      const pagos = await pagoService.getPagosByReserva(reservaId);
      // Filtrar solo los pagos con estado "realizado" o "pendiente"
      const pagosFiltrados = pagos.filter(pago => 
        pago.estado === 'realizado' || pago.estado === 'pendiente'
      );
      // Sumar los montos
      return pagosFiltrados.reduce((total, pago) => total + pago.monto, 0);
    } catch (error) {
      console.error(`Error al calcular total de pagos para reserva ${reservaId}:`, error);
      throw error;
    }
  },

  // Verificar si un pago excede el total pendiente de una reserva
  verificarMontoPago: async (reservaId, monto, pagoIdActual = null) => {
    try {
      // Obtener la reserva
      const reservaResponse = await axios.get(`${API_URL}/reservas/${reservaId}`, {
        headers: getAuthHeader()
      });
      const reserva = reservaResponse.data;
      
      // Obtener todos los pagos de la reserva
      const pagos = await pagoService.getPagosByReserva(reservaId);
      
      // Calcular el total de pagos existentes (excluyendo el pago actual si se está editando)
      const totalPagosExistentes = pagos
        .filter(pago => 
          (pago.estado === 'realizado' || pago.estado === 'pendiente') && 
          (pagoIdActual ? pago._id !== pagoIdActual : true)
        )
        .reduce((total, pago) => total + pago.monto, 0);
      
      // Calcular el nuevo total si se añade/actualiza el pago
      const nuevoTotal = totalPagosExistentes + monto;
      
      // Verificar si excede el total de la reserva
      return {
        valido: nuevoTotal <= reserva.total,
        exceso: Math.max(0, nuevoTotal - reserva.total),
        totalReserva: reserva.total,
        totalPagado: totalPagosExistentes,
        pendiente: reserva.total - totalPagosExistentes
      };
    } catch (error) {
      console.error(`Error al verificar monto de pago para reserva ${reservaId}:`, error);
      throw error;
    }
  }
};

export default pagoService;