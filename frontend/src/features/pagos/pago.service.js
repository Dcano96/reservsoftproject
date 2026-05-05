// pago.service.js
import axios from 'axios';

// ✅ Usar la variable de entorno
const API_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:5000/api';

// Base del servidor (sin /api) — útil para construir URLs de archivos servidos
// estáticamente, p.ej. /uploads/comprobantes/...
const SERVER_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log("API_URL pagos configurada:", API_URL); // Para debug

// Construye una URL absoluta para un comprobante guardado en el servidor.
// Acepta tanto rutas relativas (/uploads/...) como URLs absolutas.
export const buildComprobanteUrl = (ruta) => {
  if (!ruta) return '';
  if (/^https?:\/\//i.test(ruta)) return ruta;
  const sep = ruta.startsWith('/') ? '' : '/';
  return `${SERVER_BASE}${sep}${ruta}`;
};

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

  // Registrar pago manual (admin registra un pago en efectivo u otro medio)
  // El pago entra directamente como "realizado". Útil para el segundo abono
  // cuando el cliente llega al hotel.
  registrarPagoManual: async (pagoData) => {
    try {
      const response = await axios.post(`${API_URL}/pagos/manual`, pagoData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al registrar pago manual:', error);
      throw error.response?.data || { msg: 'Error al conectar con el servidor' };
    }
  },

  // Crear un pago desde la landing (público, con comprobante adjunto)
  // payload: { reserva, monto, clienteNombre, metodo_pago?, notas?, comprobante: File }
  crearPagoDesdeLanding: async (payload) => {
    try {
      const formData = new FormData();
      formData.append('reserva', payload.reserva);
      formData.append('monto', payload.monto);
      if (payload.clienteNombre) formData.append('clienteNombre', payload.clienteNombre);
      if (payload.metodo_pago) formData.append('metodo_pago', payload.metodo_pago);
      if (payload.notas) formData.append('notas', payload.notas);
      if (payload.comprobante) formData.append('comprobante', payload.comprobante);

      const response = await axios.post(`${API_URL}/pagos/landing`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear pago desde landing:', error);
      throw error.response?.data || { msg: 'Error al conectar con el servidor' };
    }
  },

  // Agregar un nuevo abono a un Pago existente (admin), con comprobante opcional.
  // payload: { monto, metodo_pago?, notas?, comprobante?: File }
  agregarAbono: async (pagoId, payload) => {
    try {
      const formData = new FormData();
      formData.append('monto', payload.monto);
      if (payload.metodo_pago) formData.append('metodo_pago', payload.metodo_pago);
      if (payload.notas) formData.append('notas', payload.notas);
      if (payload.comprobante) formData.append('comprobante', payload.comprobante);

      const response = await axios.put(`${API_URL}/pagos/${pagoId}/abono`, formData, {
        headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al agregar abono al pago ${pagoId}:`, error);
      throw error.response?.data || { msg: 'Error al conectar con el servidor' };
    }
  },

  // Verificar (aprobar/rechazar) un abono individual.
  verificarAbono: async (pagoId, abonoId, estado, notas) => {
    try {
      const response = await axios.put(
        `${API_URL}/pagos/${pagoId}/abono/${abonoId}/verificar`,
        { estado, notas },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error al verificar abono ${abonoId}:`, error);
      throw error.response?.data || { msg: 'Error al conectar con el servidor' };
    }
  },

  // Verificar (aprobar/rechazar) un pago — acción de admin
  verificarPago: async (id, estado, notas) => {
    try {
      const response = await axios.put(
        `${API_URL}/pagos/${id}/verificar`,
        { estado, notas },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error al verificar pago ${id}:`, error);
      throw error.response?.data || { msg: 'Error al conectar con el servidor' };
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