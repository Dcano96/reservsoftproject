//Landing Controller

const Landing = require("./landing.model")
const Apartamento = require("../apartamento/apartamento.model")
const Reserva = require("../reservas/reserva.model")
const Cliente = require("../clientes/cliente.model")
const usuarioController = require("../usuarios/usuario.controller") // Importar el controlador de usuarios
const bcrypt = require("bcryptjs")
const path = require("path")
console.log("Ruta actual:", __dirname)
console.log("Intentando resolver ruta del mailer...")

// Intentar diferentes rutas posibles para encontrar el módulo mailer
let emailService
try {
  // Intento 1: Ruta relativa desde la ubicación actual
  emailService = require("../../../config/mailer")
  console.log("Mailer encontrado en ../../../config/mailer")
} catch (e) {
  console.log("Error al cargar mailer desde ../../../config/mailer:", e.message)
  try {
    // Intento 2: Ruta relativa alternativa
    emailService = require("../../config/mailer")
    console.log("Mailer encontrado en ../../config/mailer")
  } catch (e) {
    console.log("Error al cargar mailer desde ../../config/mailer:", e.message)
    try {
      // Intento 3: Ruta desde la raíz del proyecto
      emailService = require(path.join(process.cwd(), "config/mailer"))
      console.log("Mailer encontrado en path.join(process.cwd(), 'config/mailer')")
    } catch (e) {
      console.log("Error al cargar mailer desde la raíz:", e.message)
      // Si no se puede cargar el módulo, implementamos una versión básica
      console.log("Implementando versión básica del mailer...")

      const nodemailer = require("nodemailer")

      // Crear un servicio de correo básico
      emailService = {
        sendReservationConfirmation: async (cliente, reservationData, password = null) => {
          try {
            console.log("Usando mailer interno de emergencia")
            console.log("Cliente:", cliente)
            console.log("Datos de reserva:", reservationData)
            console.log("¿Contraseña temporal?", password ? "Sí" : "No")

            // Configuración del transporter con valores hardcodeados para garantizar funcionamiento
            const transporter = nodemailer.createTransport({
              host: process.env.EMAIL_HOST || "smtp.gmail.com",
              port: Number.parseInt(process.env.EMAIL_PORT || "587"),
              secure: process.env.EMAIL_SECURE === "true" ? true : false,
              auth: {
                user: process.env.EMAIL_USER || "dgoez2020@gmail.com",
                pass: process.env.EMAIL_PASS || "qrlj smsh jsdb tjbv",
              },
              debug: true, // Habilitar debugging
              logger: true, // Habilitar logging
            })

            console.log("Configuración SMTP:", {
              host: process.env.EMAIL_HOST || "smtp.gmail.com",
              port: Number.parseInt(process.env.EMAIL_PORT || "587"),
              secure: process.env.EMAIL_SECURE === "true" ? true : false,
              auth: {
                user: process.env.EMAIL_USER || "dgoez2020@gmail.com",
                pass: "********", // Ocultamos la contraseña en los logs
              },
            })

            // Función para formatear fechas
            const formatDate = (dateString) => {
              const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
              return new Date(dateString).toLocaleDateString("es-ES", options)
            }

            // Calcular noches y precio total
            const fechaEntrada = new Date(reservationData.fechaEntrada)
            const fechaSalida = new Date(reservationData.fechaSalida)
            const diffTime = Math.abs(fechaSalida - fechaEntrada)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            const precioTotal = reservationData.total || reservationData.precioPorNoche * diffDays

            // Crear contenido HTML del correo
            const htmlContent = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Confirmación de Reserva - Nido Sky</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                  }
                  .header {
                    background: linear-gradient(135deg, #0A2463 0%, #3E92CC 100%);
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                  }
                  .content {
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-top: none;
                    border-radius: 0 0 5px 5px;
                  }
                  .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #666;
                  }
                  .logo {
                    max-width: 150px;
                    margin-bottom: 10px;
                  }
                  .reservation-details {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 15px 0;
                  }
                  .credentials {
                    background-color: #f5f5f5;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 15px 0;
                    border-left: 4px solid #D8B08C;
                  }
                  .button {
                    display: inline-block;
                    background-color: #D8B08C;
                    color: #0A2463;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 15px 0;
                  }
                  table {
                    width: 100%;
                    border-collapse: collapse;
                  }
                  table td {
                    padding: 8px;
                    border-bottom: 1px solid #eee;
                  }
                  table td:first-child {
                    font-weight: bold;
                    width: 40%;
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nidosky-V3qv6QnKvcP2qqA4Vxok6rQ8wpnZi9.png" alt="Nido Sky Logo" class="logo">
                  <h1>¡Reserva Confirmada!</h1>
                </div>
                <div class="content">
                  <p>Hola <strong>${cliente.nombre}</strong>,</p>
                  <p>¡Gracias por elegir Nido Sky para tu estancia en Medellín! Tu reserva ha sido confirmada exitosamente.</p>
                  
                  <div class="reservation-details">
                    <h2>Detalles de tu Reserva:</h2>
                    <table>
                      <tr>
                        <td>Apartamento:</td>
                        <td>${reservationData.apartamento}</td>
                      </tr>
                      <tr>
                        <td>Fecha de entrada:</td>
                        <td>${formatDate(reservationData.fechaEntrada)}</td>
                      </tr>
                      <tr>
                        <td>Fecha de salida:</td>
                        <td>${formatDate(reservationData.fechaSalida)}</td>
                      </tr>
                      <tr>
                        <td>Número de noches:</td>
                        <td>${diffDays}</td>
                      </tr>
                      <tr>
                        <td>Huéspedes:</td>
                        <td>${reservationData.huespedes}</td>
                      </tr>
                      <tr>
                        <td>Precio por noche:</td>
                        <td>${reservationData.precioPorNoche}</td>
                      </tr>
                      <tr>
                        <td>Precio total:</td>
                        <td><strong>${precioTotal}</strong></td>
                      </tr>
                    </table>
                  </div>
                  
                  ${
                    password
                      ? `
                  <div class="credentials">
                    <h2>Tus Credenciales de Acceso:</h2>
                    <p>Hemos creado una cuenta para ti en nuestro sistema. Puedes acceder con las siguientes credenciales:</p>
                    <table>
                      <tr>
                        <td>Email:</td>
                        <td>${cliente.email}</td>
                      </tr>
                      <tr>
                        <td>Contraseña:</td>
                        <td>${password}</td>
                      </tr>
                    </table>
                    <p><em>Te recomendamos cambiar tu contraseña después del primer inicio de sesión.</em></p>
                  </div>
                  `
                      : ""
                  }
                  
                  <p>Si tienes alguna pregunta o necesitas hacer cambios en tu reserva, no dudes en contactarnos.</p>
                  
                  <a href="https://nidosky.com/mi-reserva" class="button">Ver mi Reserva</a>
                  
                  <h3>Información de Contacto:</h3>
                  <p>
                    📞 +57 300 123 4567<br>
                    ✉️ info@nidosky.com<br>
                    📍 Calle 10 #43E-25, El Poblado, Medellín, Colombia
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Nido Sky. Todos los derechos reservados.</p>
                  <p>Este correo fue enviado a ${cliente.email} porque realizaste una reserva en Nido Sky.</p>
                </div>
              </body>
              </html>
            `

            // Versión de texto plano para clientes que no soportan HTML
            const textContent = `
              ¡Reserva Confirmada!
              
              Hola ${cliente.nombre},
              
              ¡Gracias por elegir Nido Sky para tu estancia en Medellín! Tu reserva ha sido confirmada exitosamente.
              
              Detalles de tu Reserva:
              - Apartamento: ${reservationData.apartamento}
              - Fecha de entrada: ${formatDate(reservationData.fechaEntrada)}
              - Fecha de salida: ${formatDate(reservationData.fechaSalida)}
              - Número de noches: ${diffDays}
              - Huéspedes: ${reservationData.huespedes}
              - Precio por noche: ${reservationData.precioPorNoche}
              - Precio total: ${precioTotal}
              
              ${
                password
                  ? `
              Tus Credenciales de Acceso:
              Hemos creado una cuenta para ti en nuestro sistema. Puedes acceder con las siguientes credenciales:
              - Email: ${cliente.email}
              - Contraseña: ${password}
              
              Te recomendamos cambiar tu contraseña después del primer inicio de sesión.
              `
                  : ""
              }
              
              Si tienes alguna pregunta o necesitas hacer cambios en tu reserva, no dudes en contactarnos.
              
              Información de Contacto:
              Teléfono: +57 300 123 4567
              Email: info@nidosky.com
              Dirección: Calle 10 #43E-25, El Poblado, Medellín, Colombia
              
              © ${new Date().getFullYear()} Nido Sky. Todos los derechos reservados.
              Este correo fue enviado a ${cliente.email} porque realizaste una reserva en Nido Sky.
            `

            // Configurar opciones del correo
            const mailOptions = {
              from: `"Nido Sky" <${process.env.EMAIL_USER || "dgoez2020@gmail.com"}>`,
              to: cliente.email,
              subject: "Confirmación de tu Reserva en Nido Sky",
              html: htmlContent,
              text: textContent, // Versión de texto plano
            }

            console.log("Enviando correo a:", cliente.email)

            // Enviar el correo
            const info = await transporter.sendMail(mailOptions)
            console.log("Correo enviado exitosamente:", info.messageId)
            console.log("Vista previa URL:", nodemailer.getTestMessageUrl(info))

            return { success: true, messageId: info.messageId }
          } catch (error) {
            console.error("Error detallado al enviar correo:", error)
            console.error("Mensaje de error:", error.message)
            if (error.code) console.error("Código de error:", error.code)
            if (error.command) console.error("Comando que falló:", error.command)
            if (error.response) console.error("Respuesta del servidor:", error.response)

            return { success: false, error: error.message }
          }
        },
      }
    }
  }
}

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

    // ── IMÁGENES POR TIPO (URLs online para producción) ──────────────────────
    // Tipo 1: apartamento estándar moderno
    const IMAGEN_TIPO_1 =
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
    // Tipo 2: apartamento familiar/amplio
    const IMAGEN_TIPO_2 =
      "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
    // Penthouse: suite de lujo
    const IMAGEN_PENTHOUSE =
      "https://images.pexels.com/photos/2029694/pexels-photo-2029694.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"

    // Transformar los datos para que coincidan con lo que espera el componente Landing
    const apartamentosFormateados = apartamentos.map((apt) => {
      // Añadir logging para depuración
      console.log(`Procesando apartamento: ID=${apt._id}, Tipo=${apt.Tipo}, NumeroApto=${apt.NumeroApto}`)

      // Normalizar el tipo para comparación (eliminar espacios y convertir a minúsculas)
      const tipoNormalizado = apt.Tipo ? apt.Tipo.trim().toLowerCase() : ""
      console.log(`Tipo normalizado: "${tipoNormalizado}"`)

      let imagen = IMAGEN_TIPO_1 // Por defecto

      if (tipoNormalizado === "tipo 1" || tipoNormalizado === "tipo1") {
        console.log(`Asignando imagen Tipo 1 para apartamento: ${apt._id}`)
        imagen = IMAGEN_TIPO_1
      } else if (tipoNormalizado === "tipo 2" || tipoNormalizado === "tipo2") {
        console.log(`Asignando imagen Tipo 2 para apartamento: ${apt._id}`)
        imagen = IMAGEN_TIPO_2
      } else if (tipoNormalizado === "penthouse") {
        console.log(`Asignando imagen Penthouse para apartamento: ${apt._id}`)
        imagen = IMAGEN_PENTHOUSE
      } else {
        console.log(`Tipo no reconocido: "${apt.Tipo}", usando imagen por defecto`)
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
        imagen: imagen, // URL online según tipo
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

// ----------------------------------------------------------
// Función actualizada para crear reserva desde la landing
// ----------------------------------------------------------
exports.crearReservaDesdeLanding = async (req, res) => {
  try {
    console.log("Iniciando proceso de reserva desde landing...")
    const {
      documento,
      nombre,
      email,
      telefono,
      fecha_inicio,
      fecha_fin,
      pagos_parciales,
      estado,
      acompanantes,
      apartamentos,
      noches_estadia,
      total,
    } = req.body

    console.log("Datos recibidos:", {
      documento,
      nombre,
      email,
      telefono,
      fecha_inicio,
      fecha_fin,
      apartamentos: apartamentos?.length || 0,
      noches_estadia,
      total,
    })

    // Validar campos obligatorios
    if (!documento || !nombre || !fecha_inicio || !fecha_fin || !apartamentos?.length || total == null) {
      console.log("Faltan datos obligatorios para la reserva")
      return res.status(400).json({ msg: "Faltan datos obligatorios." })
    }

    // Crear cliente si no existe
    let cliente = await Cliente.findOne({ documento })
    let esClienteNuevo = false
    let passwordTemporal = null

    if (!cliente) {
      console.log("Cliente no encontrado, creando nuevo cliente:", { documento, nombre, email })
      esClienteNuevo = true

      // Generar contraseña temporal
      passwordTemporal = Math.random().toString(36).slice(-8)
      console.log("Contraseña temporal generada:", passwordTemporal)

      // Encriptar la contraseña para el cliente
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(passwordTemporal, salt)

      // Crear el cliente
      cliente = new Cliente({
        documento,
        nombre,
        email,
        telefono,
        password: hashedPassword,
        rol: "cliente",
      })
      await cliente.save()
      console.log("Nuevo cliente creado con ID:", cliente._id)

      // Crear usuario correspondiente
      try {
        console.log("Intentando crear usuario con email:", email)

        // Verificar si ya existe un usuario con el mismo email
        const Usuario = require("../usuarios/usuario.model")
        let usuario = await Usuario.findOne({ email })

        if (!usuario) {
          console.log("No existe usuario con este email, creando nuevo usuario")
          // Crear el usuario con los mismos datos del cliente
          usuario = new Usuario({
            nombre,
            documento,
            email,
            telefono,
            password: hashedPassword, // Usar la misma contraseña encriptada que se usó para el cliente
            rol: "cliente",
          })

          await usuario.save()
          console.log("Nuevo usuario creado con ID:", usuario._id)
        } else {
          console.log("Ya existe un usuario con el email:", email, "ID:", usuario._id)
        }
      } catch (errorUsuario) {
        console.error("Error detallado al crear usuario:", errorUsuario)
        console.error("Mensaje de error:", errorUsuario.message)
        // No interrumpimos el flujo si falla la creación del usuario
      }
    } else {
      console.log("Cliente existente encontrado:", cliente._id)
    }

    // Crear la reserva
    const nuevaReserva = new Reserva({
      titular_reserva: nombre,
      email,
      telefono,
      fecha_inicio,
      fecha_fin,
      apartamentos,
      noches_estadia,
      total,
      pagos_parciales,
      estado,
      acompanantes,
    })
    await nuevaReserva.save()
    console.log("Nueva reserva creada con ID:", nuevaReserva._id)

    // Obtener información del apartamento para el correo
    const apartamentoId = apartamentos[0] // Tomamos el primer apartamento
    console.log("Buscando información del apartamento:", apartamentoId)
    const apartamento = await Apartamento.findById(apartamentoId)
    console.log(
      "Información del apartamento:",
      apartamento ? `${apartamento.NumeroApto} - ${apartamento.Tipo}` : "No encontrado",
    )

    // Enviar correo de confirmación
    try {
      console.log("Iniciando proceso de envío de correo...")

      // Preparar datos del cliente en el formato que espera el mailer
      const clienteData = {
        nombre: nombre,
        email: email,
      }

      // Preparar datos de la reserva en el formato exacto que espera el mailer
      const reservationData = {
        apartamento: apartamento ? `${apartamento.NumeroApto} - ${apartamento.Tipo}` : "Apartamento reservado",
        fechaEntrada: fecha_inicio,
        fechaSalida: fecha_fin,
        huespedes: acompanantes ? acompanantes.length + 1 : 1, // +1 por el titular
        precioPorNoche: apartamento ? apartamento.Tarifa : total / noches_estadia,
        total: total,
      }

      // Enviar el correo usando el servicio existente con la misma estructura de datos
      const resultado = await emailService.sendReservationConfirmation(
        clienteData, // Datos del cliente
        reservationData, // Datos de la reserva
        passwordTemporal, // Contraseña temporal si es cliente nuevo
      )

      console.log("Resultado del envío de correo:", resultado)
    } catch (emailError) {
      console.error("Error detallado al enviar correo de confirmación:", emailError)
      console.error("Mensaje de error:", emailError.message)
      // No interrumpimos el flujo si falla el envío del correo
    }

    return res.status(201).json({
      msg: "Reserva y cliente registrados correctamente",
      reserva: nuevaReserva,
    })
  } catch (error) {
    console.error("Error al crear la reserva desde la landing:", error)
    return res.status(500).json({
      msg: "Error interno al procesar la reserva.",
      error: error.message,
    })
  }
}