"use client"

import { useEffect, useState } from "react"
import { Route, Redirect, useHistory, useLocation } from "react-router-dom"
import Swal from "sweetalert2"

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const [isAllowed, setIsAllowed] = useState(null)
  const location = useLocation()
  const history = useHistory()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userInfo = localStorage.getItem("usuario")

    // Verificar si es navegación con botones del navegador
    const isBackOrForward = performance.getEntriesByType("navigation")[0]?.type === "back_forward"

    if (!token || isBackOrForward) {
      setIsAllowed(false)
    } else {
      // Verificar si el rol está activo
      const usuario = userInfo ? JSON.parse(userInfo) : null
      if (usuario && (usuario.rolEliminado || usuario.rolInactivo)) {
        // El rol ha sido eliminado o está inactivo
        localStorage.removeItem("token")
        localStorage.removeItem("usuario")
        setIsAllowed(false)

        // Mostrar alerta informativa
        Swal.fire({
          title: "Acceso denegado",
          text: "Tu rol ha sido desactivado o eliminado. Por favor, contacta al administrador.",
          icon: "warning",
          confirmButtonColor: "#2563eb",
          confirmButtonText: "Entendido",
        }).then(() => {
          history.push("/")
        })
        return
      }

      // Guardar la ruta actual completa incluyendo la parte después de /dashboard
      localStorage.setItem("ultimaRuta", location.pathname)

      // Si estamos en una subruta del dashboard, guardarla específicamente
      if (location.pathname.startsWith("/dashboard")) {
        // Extraer el módulo actual del dashboard de la URL
        const moduloActual = location.pathname.split("/").filter(Boolean)[1] || ""
        if (moduloActual) {
          localStorage.setItem("moduloDashboard", moduloActual)
        }
      }

      setIsAllowed(true)
    }
  }, [location.pathname, history])

  // Verificar periódicamente el estado del rol
  useEffect(() => {
    // Función para verificar el estado del rol
    const verificarEstadoRol = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        // Hacer una petición al servidor para verificar el estado del rol
        const response = await fetch("http://localhost:5000/api/auth/verificar-rol", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Error al verificar el estado del rol")
        }

        const data = await response.json()

        // Si el rol está inactivo o eliminado, cerrar sesión
        if (data.rolEliminado || data.rolInactivo) {
          localStorage.removeItem("token")
          localStorage.removeItem("usuario")
          setIsAllowed(false)

          // Mostrar alerta informativa
          Swal.fire({
            title: "Acceso denegado",
            text: "Tu rol ha sido desactivado o eliminado. Por favor, contacta al administrador.",
            icon: "warning",
            confirmButtonColor: "#2563eb",
            confirmButtonText: "Entendido",
          }).then(() => {
            history.push("/")
          })
        }
      } catch (error) {
        console.error("Error al verificar estado del rol:", error)
      }
    }

    // Verificar el estado del rol cada 5 minutos
    const intervalo = setInterval(verificarEstadoRol, 5 * 60 * 1000)

    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalo)
  }, [history])

  const getUserInfo = () => {
    try {
      const userInfo = localStorage.getItem("usuario")
      return userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
      console.error("Error al obtener información del usuario:", error)
      return null
    }
  }

  if (isAllowed === null) return null

  return (
    <Route
      {...rest}
      render={(props) => (isAllowed ? <Component {...props} userInfo={getUserInfo()} /> : <Redirect to="/" />)}
    />
  )
}

export default ProtectedRoute
