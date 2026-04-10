import React, { Suspense, lazy } from "react"
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom"
import Landing from "./features/landing/Landing.jsx"
import ProtectedRoute from "./features/auth/ProtectedRoute"

const Login = lazy(() => import("./features/auth/Login"))
const Register = lazy(() => import("./features/auth/Register"))
const ForgotPassword = lazy(() => import("./features/auth/ForgotPassword"))
const ResetPassword = lazy(() => import("./features/auth/ResetPassword"))
const Dashboard = lazy(() => import("./features/dashboard/Dashboard"))
const UserProfile = lazy(() => import("./features/usuarios/UserProfile"))

const PageLoader = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#F4F1FF" }}>
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 40, height: 40, border: "4px solid #EDE9FF", borderTop: "4px solid #6C3FFF", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <span style={{ fontFamily: "'Outfit', sans-serif", color: "#6C3FFF", fontWeight: 600 }}>Cargando...</span>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </Router>
  )
}

export default App