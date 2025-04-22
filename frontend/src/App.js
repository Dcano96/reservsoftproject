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
        <Route exact path="/">
          <Landing />
        </Route>

        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/recuperar-password" component={ForgotPassword} />
        <Route path="/reset-password/:token" component={ResetPassword} />

        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/perfil" component={UserProfile} />
        <ProtectedRoute path="/perfil-cliente" component={UserProfile} />

        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
