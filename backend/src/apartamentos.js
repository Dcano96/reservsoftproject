/**
 * Valida los datos del apartamento
 * @param {Object} data - Datos del apartamento
 * @returns {Object} - Datos validados
 * @throws {Error} - Si faltan campos
 */
function validarDatosApartamento(data) {
  const { Tipo, NumeroApto, Piso, Capacidad, Tarifa, Estado } = data

  if (
    !Tipo ||
    NumeroApto === undefined ||
    Piso === undefined ||
    Capacidad === undefined ||
    Tarifa === undefined ||
    Estado === undefined
  ) {
    throw new Error("Todos los campos son requeridos: Tipo, NumeroApto, Piso, Capacidad, Tarifa, Estado")
  }

  return { Tipo, NumeroApto, Piso, Capacidad, Tarifa, Estado }
}

/**
 * Crea un nuevo apartamento (solo lógica de negocio)
 * @param {Object} data - Datos del apartamento
 * @returns {Object} - Datos procesados del apartamento
 */
function procesarApartamento(data) {
  // Validar datos
  const datosValidados = validarDatosApartamento(data)

  // Aquí puedes agregar más lógica de negocio
  // Por ejemplo: calcular descuentos, formatear datos, etc.

  return {
    ...datosValidados,
    fechaCreacion: new Date().toISOString(),
    activo: true,
  }
}

module.exports = { validarDatosApartamento, procesarApartamento }
