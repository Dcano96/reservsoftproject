"use client"

import { useEffect } from "react"
import { Route, Redirect, useHistory } from "react-router-dom"

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const history = useHistory()

  // Al montar el componente, establecemos una bandera en sessionStorage
  useEffect(() => {
    // Establecer una bandera para indicar navegación directa
    sessionStorage.setItem("navegacionDirecta", "true")

    // Función para manejar eventos de navegación del navegador
    const handleBeforeUnload = () => {
      // Eliminar la bandera cuando el usuario intenta salir
      sessionStorage.removeItem("navegacionDirecta")
    }

    // Escuchar eventos de navegación
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  // Se asume que el token se almacena en localStorage tras el login
  const token = localStorage.getItem("token")
  // Verificar si la navegación es directa o mediante botones del navegador
  const navegacionDirecta = sessionStorage.getItem("navegacionDirecta") === "true"

  // Solo permitir acceso si hay token Y la navegación es directa
  const accesoPermitido = token && navegacionDirecta

  // Obtener información del usuario para pasarla como prop
  const getUserInfo = () => {
    try {
      const userInfo = localStorage.getItem("usuario")
      return userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
      console.error("Error al obtener información del usuario:", error)
      return null
    }
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        accesoPermitido ? (
          // Pasar la información del usuario como prop
          <Component {...props} userInfo={getUserInfo()} />
        ) : (
          <Redirect to="/" />
        )
      }
    />
  )
}

export default ProtectedRoute
