"use client"

import { useState, useEffect } from "react"
import {
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import {
  Save,
  Edit,
  Close,
  Person,
  Email,
  Phone,
  Security,
  AssignmentInd,
  CalendarToday,
  VerifiedUser,
  Lock,
  Visibility,
  CheckCircle,
  AccessTime,
  Work,
  VpnKey,
} from "@material-ui/icons"
import axios from "axios"
import jwtDecode from "jwt-decode"
import Swal from "sweetalert2"
import "./usuarios.styles.css"
// Añadir esta importación al inicio del archivo
import MisReservas from "../clientes/mis-reservas"

const UserProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    documento: "",
  })
  const [passwordData, setPasswordData] = useState({
    passwordActual: "",
    nuevoPassword: "",
    confirmarPassword: "",
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [roleDetails, setRoleDetails] = useState(null)
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  })
  const [activeTab, setActiveTab] = useState("personal")

  useEffect(() => {
    // Bandera para controlar si el componente está montado
    let isMounted = true
    // Para cancelar solicitudes pendientes
    const controller = new AbortController()
    const signal = controller.signal

    const fetchUserProfile = async () => {
      try {
        if (!isMounted) return
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No hay token de autenticación")
        }

        // Decodificar el token para obtener información básica
        const decoded = jwtDecode(token)
        const userId = decoded?.usuario?._id || decoded?.usuario?.id || decoded?.uid
        const userData = decoded?.usuario || {}

        if (!userId) {
          throw new Error("No se pudo obtener el ID del usuario")
        }

        // Intentar obtener datos completos del usuario desde la API
        try {
          const response = await axios.get(`http://localhost:5000/api/usuarios/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: signal,
          })

          if (!isMounted) return

          const apiUserData = response.data
          setProfile(apiUserData)
          setFormData({
            nombre: apiUserData.nombre || "",
            email: apiUserData.email || "",
            telefono: apiUserData.telefono || "",
            documento: apiUserData.documento || "",
          })

          // Obtener detalles del rol
          if (apiUserData.rol) {
            try {
              const roleName = typeof apiUserData.rol === "object" ? apiUserData.rol.nombre : apiUserData.rol

              // Intentar obtener detalles del rol, pero manejar el caso en que no exista
              const roleResponse = await axios.get(`http://localhost:5000/api/roles/byName/${roleName}`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: signal,
              })

              if (!isMounted) return
              setRoleDetails(roleResponse.data)
            } catch (roleError) {
              console.warn("No se pudieron obtener detalles del rol:", roleError)
              // No establecemos error general, solo continuamos sin los detalles del rol
            }
          }
        } catch (apiError) {
          console.warn("No se pudieron obtener datos completos del usuario desde la API:", apiError)
          console.log("Usando datos del token JWT como alternativa")

          // Si la API falla, usar los datos del token JWT
          setProfile({
            _id: userId,
            nombre: userData.nombre || "Usuario",
            email: userData.email || "",
            telefono: userData.telefono || "",
            documento: userData.documento || "",
            rol: userData.rol || "Usuario",
            fechaCreacion: userData.fechaCreacion || new Date().toISOString(),
            ultimoAcceso: userData.ultimoAcceso || new Date().toISOString(),
            permisos: userData.permisos || [],
          })

          setFormData({
            nombre: userData.nombre || "",
            email: userData.email || "",
            telefono: userData.telefono || "",
            documento: userData.documento || "",
          })
        }

        if (!isMounted) return
        setLoading(false)
      } catch (error) {
        if (!isMounted) return
        console.error("Error al obtener el perfil del usuario:", error)
        setError("No se pudo cargar la información del perfil")
        setLoading(false)

        // Solo mostrar alerta si el componente sigue montado
        if (isMounted) {
          Swal.fire({
            title: "Error",
            text: "No se pudo cargar la información del perfil",
            icon: "error",
            confirmButtonColor: "#2563eb",
          })
        }
      }
    }

    fetchUserProfile()

    // Función de limpieza para evitar memory leaks
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Modificar la función handleSubmit para manejar el caso en que la API falla
  const handleSubmit = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!profile || !profile._id) {
        throw new Error("No se pudo identificar al usuario")
      }

      // Actualizar solo los campos permitidos
      const updateData = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        documento: formData.documento,
      }

      try {
        const response = await axios.put(`http://localhost:5000/api/usuarios/${profile._id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Actualizar el perfil local con los datos actualizados
        setProfile((prev) => ({
          ...prev,
          ...updateData,
        }))

        setEditing(false)
        setLoading(false)

        setNotification({
          open: true,
          message: "Perfil actualizado correctamente",
          severity: "success",
        })
      } catch (apiError) {
        console.warn("No se pudo actualizar el perfil en la API:", apiError)

        // Si la API falla, actualizar solo la interfaz local
        setProfile((prev) => ({
          ...prev,
          ...updateData,
        }))

        setEditing(false)
        setLoading(false)

        setNotification({
          open: true,
          message: "Perfil actualizado localmente (los cambios no se guardaron en el servidor)",
          severity: "warning",
        })

        // Mostrar alerta informativa
        Swal.fire({
          title: "Actualización local",
          text: "Tu perfil se ha actualizado solo en esta sesión. Los cambios no se han guardado en el servidor debido a restricciones de permisos.",
          icon: "info",
          confirmButtonColor: "#2563eb",
        })
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error)
      setLoading(false)

      setNotification({
        open: true,
        message: "Error al actualizar el perfil: " + (error.response?.data?.message || error.message),
        severity: "error",
      })
    }
  }

  // Función para manejar el cambio de contraseña - Intenta múltiples rutas
  const handlePasswordSubmit = async () => {
    // Validar que las contraseñas coincidan
    if (passwordData.nuevoPassword !== passwordData.confirmarPassword) {
      setNotification({
        open: true,
        message: "Las contraseñas no coinciden",
        severity: "error",
      })
      return
    }

    // Validar que la contraseña tenga al menos 6 caracteres
    if (passwordData.nuevoPassword.length < 6) {
      setNotification({
        open: true,
        message: "La nueva contraseña debe tener al menos 6 caracteres",
        severity: "error",
      })
      return
    }

    try {
      setPasswordLoading(true)
      const token = localStorage.getItem("token")
      const decoded = jwtDecode(token)
      const userId = profile?._id || decoded?.uid || decoded?.usuario?._id || decoded?.usuario?.id

      // Datos para enviar en la solicitud
      const passwordPayload = {
        passwordActual: passwordData.passwordActual,
        nuevoPassword: passwordData.nuevoPassword,
      }

      // Opciones de configuración para axios
      const axiosConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      // Intentar con la primera ruta: /api/usuarios/cambiar-password
      console.log("Intentando cambiar contraseña con ruta 1: /api/usuarios/cambiar-password")
      try {
        const response = await axios.post(
          "http://localhost:5000/api/usuarios/cambiar-password",
          passwordPayload,
          axiosConfig,
        )

        handlePasswordSuccess()
        return
      } catch (error1) {
        console.log("Error en ruta 1:", error1.response?.status)

        // Si la primera ruta falla, intentar con la segunda: /api/usuarios/:id/cambiar-password
        if (userId) {
          console.log(`Intentando cambiar contraseña con ruta 2: /api/usuarios/${userId}/cambiar-password`)
          try {
            const response2 = await axios.post(
              `http://localhost:5000/api/usuarios/${userId}/cambiar-password`,
              passwordPayload,
              axiosConfig,
            )

            handlePasswordSuccess()
            return
          } catch (error2) {
            console.log("Error en ruta 2:", error2.response?.status)

            // Si la segunda ruta falla, intentar con la tercera: /api/clientes/cambiar-password
            console.log("Intentando cambiar contraseña con ruta 3: /api/clientes/cambiar-password")
            try {
              const response3 = await axios.post(
                "http://localhost:5000/api/clientes/cambiar-password",
                passwordPayload,
                axiosConfig,
              )

              handlePasswordSuccess()
              return
            } catch (error3) {
              console.log("Error en ruta 3:", error3.response?.status)
              throw error3
            }
          }
        } else {
          throw error1
        }
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error)
      setPasswordLoading(false)

      const errorMessage = error.response?.data?.msg || "Error al cambiar la contraseña"

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      })

      // Mostrar alerta de error
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#2563eb",
      })
    }
  }

  // Función auxiliar para manejar el éxito al cambiar la contraseña
  const handlePasswordSuccess = () => {
    setPasswordLoading(false)

    // Limpiar el formulario
    setPasswordData({
      passwordActual: "",
      nuevoPassword: "",
      confirmarPassword: "",
    })

    setNotification({
      open: true,
      message: "Contraseña actualizada correctamente",
      severity: "success",
    })

    // Mostrar alerta de éxito
    Swal.fire({
      title: "¡Éxito!",
      text: "Tu contraseña ha sido actualizada correctamente",
      icon: "success",
      confirmButtonColor: "#2563eb",
    })
  }

  const handleCloseNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "Fecha inválida"
    }
  }

  const formatPermissions = (permisos) => {
    if (!permisos || permisos.length === 0) return "Sin permisos asignados"

    if (typeof permisos[0] === "string") {
      return permisos.join(", ")
    }

    return permisos
      .map((p) => {
        const acciones = p.acciones
          ? Object.entries(p.acciones)
              .filter(([_, value]) => value)
              .map(([key, _]) => key)
              .join(", ")
          : ""

        return `${p.modulo} (${acciones})`
      })
      .join("; ")
  }

  // Función para obtener las iniciales del nombre
  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Función para obtener color basado en el rol
  const getRoleColor = (role) => {
    if (!role) return "#2563eb"
    const roleLower = typeof role === "object" ? role.nombre.toLowerCase() : role.toLowerCase()

    if (roleLower.includes("admin")) return "#2563eb" // Cambiado de rojo a azul
    if (roleLower.includes("gerente")) return "#3b82f6"
    if (roleLower.includes("supervisor")) return "#60a5fa"
    return "#2563eb"
  }

  if (loading && !profile) {
    return (
      <div className="profile-loading-container">
        <div className="profile-loading-content">
          <CircularProgress style={{ color: "#2563eb" }} />
          <Typography variant="h6" className="profile-loading-text">
            Cargando información del perfil...
          </Typography>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="profile-error-container">
        <div className="profile-error-content">
          <Typography variant="h6" color="error" className="profile-error-text">
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            className="profile-retry-button"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  const roleName = typeof profile?.rol === "object" ? profile?.rol?.nombre : profile?.rol || "Usuario"
  const roleColor = getRoleColor(profile?.rol)

  return (
    <div className="profile-page-container">
      {/* Cabecera del perfil */}
      <div className="profile-header" style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)` }}>
        <div className="profile-header-content">
          <div className="profile-avatar-container">
            <Avatar className="profile-avatar" style={{ backgroundColor: roleColor }}>
              {getInitials(profile?.nombre)}
            </Avatar>
            <Chip
              label={roleName}
              className="profile-role-chip"
              style={{ backgroundColor: `${roleColor}22`, color: roleColor, borderColor: roleColor }}
            />
          </div>
          <div className="profile-header-text">
            <Typography variant="h4" className="profile-name">
              {profile?.nombre || "Usuario"}
            </Typography>
            <Typography variant="body1" className="profile-email">
              {profile?.email || "correo@ejemplo.com"}
            </Typography>
            <div className="profile-status">
              <Chip
                icon={<CheckCircle style={{ color: "#10b981" }} />}
                label="Cuenta Activa"
                className="profile-status-chip"
              />
              <Typography variant="body2" className="profile-last-login">
                <AccessTime fontSize="small" /> Último acceso: {formatDate(profile?.ultimoAcceso)}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de pestañas */}
      <div className="profile-tabs">
        <Button
          className={`profile-tab ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          <Person /> Información Personal
        </Button>
        <Button
          className={`profile-tab ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Security /> Seguridad y Permisos
        </Button>
        {/* Añadir esta nueva pestaña */}
        <Button
          className={`profile-tab ${activeTab === "reservas" ? "active" : ""}`}
          onClick={() => setActiveTab("reservas")}
        >
          <CalendarToday /> Mis Reservas
        </Button>
      </div>

      {/* Contenido principal */}
      <div className="profile-content">
        {activeTab === "personal" && (
          <Card className="profile-card">
            <CardContent>
              <div className="profile-card-header">
                <Typography variant="h5" className="profile-card-title">
                  Información Personal
                </Typography>
                <Button
                  variant={editing ? "outlined" : "contained"}
                  color={editing ? "default" : "primary"}
                  startIcon={editing ? <Close /> : <Edit />}
                  onClick={() => setEditing(!editing)}
                  className={editing ? "usuarios-cancelButton" : "profile-edit-highlight-button"}
                >
                  {editing ? "Cancelar" : "Editar Información"}
                </Button>
              </div>

              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Person className="profile-info-icon" style={{ color: roleColor }} />
                    <Typography variant="subtitle1">Nombre Completo</Typography>
                  </div>
                  <div className="profile-info-value">
                    {editing ? (
                      <TextField
                        fullWidth
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="Ingrese su nombre completo"
                        className="profile-text-field"
                      />
                    ) : (
                      <Typography variant="body1">{profile?.nombre || "No disponible"}</Typography>
                    )}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <AssignmentInd className="profile-info-icon" style={{ color: roleColor }} />
                    <Typography variant="subtitle1">Documento</Typography>
                  </div>
                  <div className="profile-info-value">
                    {editing ? (
                      <TextField
                        fullWidth
                        name="documento"
                        value={formData.documento}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="Ingrese su número de documento"
                        className="profile-text-field"
                      />
                    ) : (
                      <Typography variant="body1">{profile?.documento || "No disponible"}</Typography>
                    )}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Email className="profile-info-icon" style={{ color: roleColor }} />
                    <Typography variant="subtitle1">Correo Electrónico</Typography>
                  </div>
                  <div className="profile-info-value">
                    {editing ? (
                      <TextField
                        fullWidth
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        variant="outlined"
                        type="email"
                        placeholder="Ingrese su correo electrónico"
                        className="profile-text-field"
                      />
                    ) : (
                      <Typography variant="body1">{profile?.email || "No disponible"}</Typography>
                    )}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Phone className="profile-info-icon" style={{ color: roleColor }} />
                    <Typography variant="subtitle1">Teléfono</Typography>
                  </div>
                  <div className="profile-info-value">
                    {editing ? (
                      <TextField
                        fullWidth
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="Ingrese su número de teléfono"
                        className="profile-text-field"
                      />
                    ) : (
                      <Typography variant="body1">{profile?.telefono || "No disponible"}</Typography>
                    )}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <CalendarToday className="profile-info-icon" style={{ color: roleColor }} />
                    <Typography variant="subtitle1">Fecha de Registro</Typography>
                  </div>
                  <div className="profile-info-value">
                    <Typography variant="body1">{formatDate(profile?.fechaCreacion)}</Typography>
                  </div>
                </div>
              </div>

              {editing && (
                <div className="profile-actions">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    onClick={handleSubmit}
                    className="profile-save-highlight-button"
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "security" && (
          <Card className="profile-card">
            <CardContent>
              <div className="profile-card-header">
                <Typography variant="h5" className="profile-card-title">
                  Seguridad y Permisos
                </Typography>
                <Chip
                  icon={<VerifiedUser />}
                  label={roleName}
                  className="profile-role-chip-large"
                  style={{ backgroundColor: `${roleColor}22`, color: roleColor, borderColor: roleColor }}
                />
              </div>

              {/* Sección de cambio de contraseña */}
              <div className="profile-password-section" style={{ marginBottom: "30px" }}>
                <Typography
                  variant="h6"
                  className="profile-section-title"
                  style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}
                >
                  <VpnKey style={{ marginRight: "10px", color: roleColor }} /> Cambiar Contraseña
                </Typography>

                <div
                  className="profile-password-form"
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "20px",
                    borderRadius: "8px",
                    borderLeft: `4px solid ${roleColor}`,
                  }}
                >
                  <div style={{ marginBottom: "15px" }}>
                    <TextField
                      fullWidth
                      name="passwordActual"
                      label="Contraseña Actual"
                      type="password"
                      value={passwordData.passwordActual}
                      onChange={handlePasswordChange}
                      variant="outlined"
                      required
                      className="profile-text-field"
                    />
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <TextField
                      fullWidth
                      name="nuevoPassword"
                      label="Nueva Contraseña"
                      type="password"
                      value={passwordData.nuevoPassword}
                      onChange={handlePasswordChange}
                      variant="outlined"
                      required
                      helperText="Mínimo 6 caracteres"
                      className="profile-text-field"
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <TextField
                      fullWidth
                      name="confirmarPassword"
                      label="Confirmar Nueva Contraseña"
                      type="password"
                      value={passwordData.confirmarPassword}
                      onChange={handlePasswordChange}
                      variant="outlined"
                      required
                      className="profile-text-field"
                    />
                  </div>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePasswordSubmit}
                    disabled={passwordLoading}
                    style={{
                      backgroundColor: roleColor,
                      padding: "10px 20px",
                      fontWeight: "bold",
                    }}
                  >
                    {passwordLoading ? (
                      <CircularProgress size={24} style={{ color: "white" }} />
                    ) : (
                      "Actualizar Contraseña"
                    )}
                  </Button>
                </div>
              </div>

              <Divider style={{ margin: "30px 0" }} />

              {roleDetails && (
                <div className="profile-role-description">
                  <Typography variant="body1">
                    <strong>Descripción del Rol:</strong> {roleDetails.descripcion || "Sin descripción"}
                  </Typography>
                </div>
              )}

              <div className="profile-permissions-container">
                <Typography variant="h6" className="profile-permissions-title">
                  <Lock className="profile-permissions-icon" /> Permisos Asignados
                </Typography>

                <div className="profile-permissions-list">
                  {(roleDetails?.permisos || profile?.permisos || []).length > 0 ? (
                    <div className="profile-permissions-grid">
                      {typeof (roleDetails?.permisos || profile?.permisos || [])[0] === "string"
                        ? // Mostrar permisos simples (strings)
                          (roleDetails?.permisos || profile?.permisos || []).map((permiso, index) => (
                            <Chip
                              key={index}
                              icon={<Visibility />}
                              label={permiso}
                              className="profile-permission-chip"
                            />
                          ))
                        : // Mostrar permisos complejos (objetos)
                          (roleDetails?.permisos || profile?.permisos || []).map((permiso, index) => (
                            <div key={index} className="profile-permission-module">
                              <Typography variant="subtitle2" className="profile-permission-module-name">
                                <Work className="profile-permission-module-icon" /> {permiso.modulo}
                              </Typography>
                              <div className="profile-permission-actions">
                                {permiso.acciones &&
                                  Object.entries(permiso.acciones)
                                    .filter(([_, value]) => value)
                                    .map(([key, _], idx) => (
                                      <Chip
                                        key={idx}
                                        label={key}
                                        size="small"
                                        className="profile-permission-action-chip"
                                      />
                                    ))}
                              </div>
                            </div>
                          ))}
                    </div>
                  ) : (
                    <Typography variant="body2" className="profile-no-permissions">
                      No hay permisos asignados para este usuario.
                    </Typography>
                  )}
                </div>
              </div>

              <div className="profile-security-info">
                <div className="profile-security-item">
                  <AccessTime className="profile-security-icon" />
                  <div>
                    <Typography variant="subtitle2">Último Acceso</Typography>
                    <Typography variant="body2">{formatDate(profile?.ultimoAcceso)}</Typography>
                  </div>
                </div>
                <div className="profile-security-item">
                  <CalendarToday className="profile-security-icon" />
                  <div>
                    <Typography variant="subtitle2">Cuenta Creada</Typography>
                    <Typography variant="body2">{formatDate(profile?.fechaCreacion)}</Typography>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Añadir esta nueva sección */}
        {activeTab === "reservas" && <MisReservas />}
      </div>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        className="profile-notification"
      >
        <Alert
          severity={notification.severity}
          action={
            <IconButton size="small" color="inherit" onClick={handleCloseNotification}>
              <Close fontSize="small" />
            </IconButton>
          }
          className="profile-alert"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default UserProfile
