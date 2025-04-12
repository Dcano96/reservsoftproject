import { Route, Redirect } from "react-router-dom"

const ProtectedRoute = ({ component: Component, ...rest }) => {
  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    const token = localStorage.getItem("token")
    return !!token // Devuelve true si hay un token, false si no
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        // Si el usuario está autenticado, renderizar el componente
        if (isAuthenticated()) {
          return <Component {...props} />
        } else {
          // Si no está autenticado, redirigir al login
          return <Redirect to="/login" />
        }
      }}
    />
  )
}

export default ProtectedRoute

