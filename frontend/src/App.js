import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom"
import Login from "./features/auth/Login"
import Register from "./features/auth/Register"
import ForgotPassword from "./features/auth/ForgotPassword"
import ResetPassword from "./features/auth/ResetPassword"
import Dashboard from "./features/dashboard/Dashboard"
import UserProfile from "./features/usuarios/UserProfile"
import ProtectedRoute from "./features/auth/ProtectedRoute"
import Landing from "./features/landing/Landing"

function App() {
  return (
    <Router>
      <Switch>
        {/* Redirigir la ruta raíz a la landing page */}
        <Route exact path="/">
          <Landing />
        </Route>

        {/* Rutas de autenticación */}
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/recuperar-password" component={ForgotPassword} />
        <Route path="/reset-password/:token" component={ResetPassword} />

        {/* La ruta del dashboard se protege con ProtectedRoute */}
        <ProtectedRoute path="/dashboard" component={Dashboard} />

        {/* Nueva ruta protegida para el perfil de usuario */}
        <ProtectedRoute path="/perfil" component={UserProfile} />

        {/* Nueva ruta protegida para el perfil de cliente */}
        <ProtectedRoute path="/perfil-cliente" component={UserProfile} />

        {/* Otras rutas para clientes, usuarios, etc. */}

        {/* Ruta de fallback */}
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
