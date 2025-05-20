"use client"

import { useState, useEffect, useRef } from "react"
import { useHistory, useLocation } from "react-router-dom"
import axios from "axios"
import jwtDecode from "jwt-decode" // Versión 3.1.2
import Swal from "sweetalert2"
import Chart from "chart.js/auto"
import {
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  BarChart2,
  Users,
  User,
  Building,
  Sofa,
  Calendar,
  CreditCard,
  Percent,
  Hotel,
  Shield,
  ChevronDown,
} from "lucide-react"

import Sidebar from "./Sidebar"
import Content from "./Content"
import UsuariosList from "../usuarios/UsuariosList"
import RolesList from "../roles/RolesList"
import DescuentosList from "../descuentos/DescuentosList"
import ReservasList from "../reservas/ReservasList"
import ApartamentoList from "../apartamentos/ApartamentoList"
import TipoApartamentoList from "../tipoApartamentos/TipoApartamentoList"
import MobiliarioList from "../mobiliarios/MobiliarioList"
import HospedajeList from "../hospedaje/HospedajeList"
import ClienteList from "../clientes/ClienteList"
import PagosList from "../pagos/PagosList"
import UserProfile from "../usuarios/UserProfile"

import "./Dashboard.css"

// IMPORTANTE: Obtener el módulo guardado antes de que se monte el componente
const getSavedModule = () => {
  try {
    return localStorage.getItem("moduloDashboard") || null
  } catch (e) {
    console.error("Error al leer el módulo guardado:", e)
    return null
  }
}

const Dashboard = () => {
  const history = useHistory()
  const location = useLocation()
  const [userRole, setUserRole] = useState("")
  const [userName, setUserName] = useState("")
  const [userPermissions, setUserPermissions] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)

  // Referencias para gráficos
  const reservasChartRef = useRef(null)
  const apartamentosChartRef = useRef(null)
  const pagosChartRef = useRef(null)
  const chartInstances = useRef({})

  // IMPORTANTE: Inicializar el módulo seleccionado con el valor guardado
  // ELIMINAR estas líneas:
  // const savedModule = getSavedModule()
  // console.log("Módulo guardado al iniciar:", savedModule)
  // const [selectedModule, setSelectedModule] = useState(savedModule)

  // REEMPLAZAR con esta implementación simple:
  const [selectedModule, setSelectedModule] = useState(() => {
    // Obtener el módulo guardado de localStorage al inicializar
    return localStorage.getItem("moduloDashboard") || "dashboard"
  })

  // Añadir un nuevo estado para el filtro de tiempo justo después de los otros estados
  const [timeFilter, setTimeFilter] = useState("month") // Opciones: "day", "month", "year"

  // Estado para módulo seleccionado, datos, y controles UI
  const [data, setData] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [open, setOpen] = useState(true)

  // Referencia para controlar si es la primera carga
  const isFirstLoad = useRef(true)
  const moduleInitialized = useRef(false)

  // Prevenir navegación con botones de adelante/atrás
  useEffect(() => {
    // Guardar la ubicación actual en el historial
    const currentPath = history.location.pathname

    // Función para manejar eventos de navegación
    const handlePopState = (event) => {
      // Si hay un token (sesión activa) y estamos intentando navegar fuera del dashboard
      if (localStorage.getItem("token")) {
        // Prevenir la navegación y volver al dashboard
        history.push(currentPath)
      }
    }

    // Función para manejar intentos de salir de la página
    const handleBeforeUnload = (event) => {
      // Solo intervenir si es navegación interna (no recargas o cierres de pestaña)
      if (event.currentTarget.performance.navigation.type === 1) {
        return
      }
    }

    // Agregar listeners para eventos de navegación
    window.addEventListener("popstate", handlePopState)
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Reemplazar la entrada actual en el historial para evitar volver atrás
    history.replace(currentPath)

    // Limpiar listeners al desmontar
    return () => {
      window.removeEventListener("popstate", handlePopState)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [history])

  // Obtener rol y permisos desde el token JWT
  useEffect(() => {
    let isMounted = true
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (isMounted) {
          const role = decoded?.usuario?.rol || ""
          const permisos = decoded?.usuario?.permisos || [] // Puede venir en formato granular o como strings
          const name = decoded?.usuario?.nombre || "Usuario"

          localStorage.setItem("role", role)
          setUserRole(role.toLowerCase())
          setUserName(name)
          setUserPermissions(permisos)
          setIsAdmin(role.toLowerCase() === "administrador" || role.toLowerCase() === "admin")
          console.log("Rol obtenido:", role.toLowerCase())
          console.log("Permisos obtenidos:", permisos)
        }
      } catch (e) {
        console.error("Error al decodificar el token:", e)
        if (isMounted) {
          setUserRole("")
          setIsAdmin(false)
          Swal.fire({
            title: "Error de autenticación",
            text: "No se pudo verificar tu identidad. Por favor, inicia sesión nuevamente.",
            icon: "error",
            confirmButtonColor: "#2563eb",
            confirmButtonText: "Entendido",
          }).then(() => {
            history.push("/login")
          })
        }
      }
    } else {
      Swal.fire({
        title: "Sesión no iniciada",
        text: "Debes iniciar sesión para acceder al sistema",
        icon: "warning",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Ir a login",
      }).then(() => {
        history.push("/login")
      })
    }
    return () => {
      isMounted = false
    }
  }, [history])

  // Lista de módulos disponibles
  const allModules = [
    "dashboard",
    "usuarios",
    "roles",
    "clientes",
    "apartamentos",
    "tipoApartamento",
    "mobiliarios",
    "reservas",
    "pagos",
    "descuentos",
    "hospedaje",
    "profile", // Añadido módulo de perfil
  ]

  // Función para verificar permisos que soporta ambos formatos
  const hasModulePermission = (moduleName, action = "leer") => {
    // El perfil siempre es accesible para todos los usuarios, sin importar su rol
    if (moduleName === "profile") return true

    if (isAdmin) return true

    // Si los permisos vienen en formato antiguo (array de strings)
    if (userPermissions.length > 0 && typeof userPermissions[0] === "string") {
      return userPermissions.includes(moduleName)
    }

    // Si vienen en formato granular
    const modulePermission = userPermissions.find((p) => p.modulo === moduleName)
    if (!modulePermission) return false
    return modulePermission.acciones && modulePermission.acciones[action]
  }

  const visibleModules = allModules.filter(
    (module) => module !== "profile" && (isAdmin || hasModulePermission(module, "leer")),
  )

  // IMPORTANTE: Efecto para guardar el módulo seleccionado cuando cambie
  // ELIMINAR estos efectos que están causando problemas:
  // - Eliminar el efecto que usa moduleInitialized.current
  // - Eliminar cualquier efecto que modifique selectedModule basado en permisos

  // AÑADIR este efecto simple para guardar el módulo cuando cambie:
  useEffect(() => {
    if (selectedModule) {
      localStorage.setItem("moduloDashboard", selectedModule)
    }
  }, [selectedModule])

  // IMPORTANTE: Inicializar el módulo seleccionado si no hay uno guardado o no tiene permiso
  // ELIMINAR este useEffect
  // useEffect(() => {
  //   if (userRole && !moduleInitialized.current) {
  //     moduleInitialized.current = true

  //     // Si no hay un módulo seleccionado o no tiene permiso para acceder a él
  //     if (!selectedModule || (selectedModule !== "profile" && !hasModulePermission(selectedModule, "leer"))) {
  //       console.log("No hay módulo seleccionado o no tiene permiso, seleccionando uno predeterminado")

  //       // Buscar un módulo accesible
  //       const accessibleModules = allModules.filter(
  //         (module) => module !== "profile" && hasModulePermission(module, "leer"),
  //       )

  //       if (accessibleModules.length > 0) {
  //         console.log("Módulo predeterminado seleccionado:", accessibleModules[0])
  //         setSelectedModule(accessibleModules[0])
  //       } else {
  //         console.log("No hay módulos accesibles")
  //         setSelectedModule("no-access")
  //         setData({ error: "No tienes acceso a ningún módulo del sistema" })
  //       }
  //     } else {
  //       console.log("Usando módulo ya seleccionado:", selectedModule)
  //     }
  //   }
  // }, [userRole, selectedModule, allModules])

  // Inicializar y actualizar gráficos cuando cambian los datos
  // Añadir la función para cambiar el filtro de tiempo after the function toggleMobileMenu
  const changeTimeFilter = (event) => {
    const filter = event.target.value
    setTimeFilter(filter)

    // Actualizar los gráficos con los nuevos datos filtrados
    Object.values(chartInstances.current).forEach((chart) => {
      if (chart) chart.destroy()
    })

    // Volver a cargar los gráficos con el nuevo filtro
    if (selectedModule === "dashboard" && hasModulePermission("dashboard", "leer")) {
      renderCharts(filter)
    }
  }

  // Modificar la función renderDashboard para incluir los botones de filtro
  // Reemplazar la función renderDashboard completa con esta versión:
  const renderDashboard = () => {
    return (
      <div className="dashboard-charts-container">
        <div className="dashboard-welcome">
          <h2>Panel de Control</h2>
          <p>Visualiza los datos más importantes de tu negocio</p>
        </div>

        <div className="time-filter-controls">
          <div className="filter-select-container">
            <label htmlFor="time-filter">Ver por:</label>
            <select id="time-filter" className="filter-select" value={timeFilter} onChange={changeTimeFilter}>
              <option value="day">Día</option>
              <option value="month">Mes</option>
              <option value="year">Año</option>
            </select>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card reservas">
            <div className="chart-header">
              <h3>Reservas y Descuentos</h3>
              <span className="chart-badge">
                {timeFilter === "day" ? "Hoy" : timeFilter === "month" ? "Últimos 12 meses" : "Últimos 5 años"}
              </span>
            </div>
            <div className="chart-body">
              <canvas ref={reservasChartRef}></canvas>
            </div>
          </div>
          <div className="chart-card apartamentos">
            <div className="chart-header">
              <h3>Estado de Apartamentos</h3>
              <span className="chart-badge">Actual</span>
            </div>
            <div className="chart-body">
              <canvas ref={apartamentosChartRef}></canvas>
            </div>
          </div>
          <div className="chart-card pagos">
            <div className="chart-header">
              <h3>Ingresos</h3>
              <span className="chart-badge">
                {timeFilter === "day" ? "Hoy" : timeFilter === "month" ? "Últimos 6 meses" : "Últimos 5 años"}
              </span>
            </div>
            <div className="chart-body">
              <canvas ref={pagosChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Añadir una nueva función renderCharts para manejar los diferentes filtros de tiempo
  // Añadir esta función después de la función renderDashboard:
  const renderCharts = (filter) => {
    if (reservasChartRef.current) {
      const reservasCtx = reservasChartRef.current.getContext("2d")

      // Datos según el filtro seleccionado
      let labels, reservasData, descuentosData

      if (filter === "day") {
        labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"]
        reservasData = [2, 1, 5, 8, 6, 9, 3]
        descuentosData = [5, 5, 10, 15, 10, 20, 5]
      } else if (filter === "month") {
        labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        reservasData = [12, 19, 15, 25, 22, 30, 35, 38, 28, 25, 30, 35]
        descuentosData = [5, 10, 15, 5, 10, 20, 15, 10, 5, 15, 10, 5]
      } else {
        // year
        labels = ["2020", "2021", "2022", "2023", "2024"]
        reservasData = [150, 220, 280, 310, 350]
        descuentosData = [8, 12, 10, 15, 18]
      }

      const reservasChartData = {
        labels: labels,
        datasets: [
          {
            label: "Reservas",
            data: reservasData,
            backgroundColor: "rgba(56, 189, 248, 0.3)",
            borderColor: "rgba(56, 189, 248, 1)",
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "rgba(56, 189, 248, 1)",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            yAxisID: "y",
          },
          {
            label: "Descuentos (%)",
            data: descuentosData,
            backgroundColor: "rgba(251, 146, 60, 0.3)",
            borderColor: "rgba(251, 146, 60, 1)",
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "rgba(251, 146, 60, 1)",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            yAxisID: "y1",
          },
        ],
      }

      chartInstances.current.reservas = new Chart(reservasCtx, {
        type: "line",
        data: reservasChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                font: { size: 14, weight: "bold", family: "'Poppins', sans-serif" },
                padding: 20,
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
            tooltip: {
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              titleColor: "#0284c7",
              bodyColor: "#0c4a6e",
              borderColor: "rgba(56, 189, 248, 0.3)",
              borderWidth: 1,
              cornerRadius: 8,
              boxPadding: 8,
              usePointStyle: true,
              callbacks: {
                label: (context) => {
                  let label = context.dataset.label || ""
                  if (label) label += ": "
                  return context.dataset.label === "Descuentos (%)"
                    ? `${label}${context.parsed.y}%`
                    : `${label}${context.parsed.y}`
                },
              },
            },
          },
          scales: {
            y: {
              type: "linear",
              display: true,
              position: "left",
              beginAtZero: true,
              title: {
                display: true,
                text: "Número de Reservas",
                color: "rgba(56, 189, 248, 1)",
                font: { weight: "bold", size: 13, family: "'Poppins', sans-serif" },
                padding: { top: 10, bottom: 10 },
              },
              grid: { color: "rgba(0, 0, 0, 0.04)", drawBorder: false },
              ticks: { font: { size: 12, family: "'Poppins', sans-serif" }, padding: 8 },
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              beginAtZero: true,
              max: filter === "year" ? 30 : 30,
              title: {
                display: true,
                text: "Porcentaje de Descuento",
                color: "rgba(251, 146, 60, 1)",
                font: { weight: "bold", size: 13, family: "'Poppins', sans-serif" },
                padding: { top: 10, bottom: 10 },
              },
              grid: { drawOnChartArea: false },
              ticks: {
                callback: (value) => value + "%",
                font: { size: 12, family: "'Poppins', sans-serif" },
                padding: 8,
              },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 12, family: "'Poppins', sans-serif" }, padding: 8 },
            },
          },
          animation: { duration: 2000, easing: "easeOutQuart" },
        },
      })
    }

    if (apartamentosChartRef.current) {
      const apartamentosCtx = apartamentosChartRef.current.getContext("2d")
      const apartamentosData = {
        labels: ["Disponibles", "Ocupados", "En Mantenimiento"],
        datasets: [
          {
            data: [15, 8, 3],
            backgroundColor: ["rgba(34, 197, 94, 0.85)", "rgba(56, 189, 248, 0.85)", "rgba(251, 146, 60, 0.85)"],
            borderColor: ["rgba(34, 197, 94, 1)", "rgba(56, 189, 248, 1)", "rgba(251, 146, 60, 1)"],
            borderWidth: 2,
            hoverOffset: 15,
          },
        ],
      }
      chartInstances.current.apartamentos = new Chart(apartamentosCtx, {
        type: "doughnut",
        data: apartamentosData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 20,
                font: { size: 14, family: "'Poppins', sans-serif" },
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
            tooltip: {
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              titleColor: "#0284c7",
              bodyColor: "#0c4a6e",
              borderColor: "rgba(56, 189, 248, 0.3)",
              borderWidth: 1,
              cornerRadius: 8,
              boxPadding: 8,
              usePointStyle: true,
              callbacks: {
                label: (context) => {
                  const label = context.label || ""
                  const value = context.parsed || 0
                  const total = context.dataset.data.reduce((acc, data) => acc + data, 0)
                  const percentage = Math.round((value / total) * 100)
                  return `${label}: ${value} (${percentage}%)`
                },
              },
            },
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 2000,
            easing: "easeOutQuart",
          },
        },
      })
    }

    if (pagosChartRef.current) {
      const pagosCtx = pagosChartRef.current.getContext("2d")

      // Datos según el filtro seleccionado
      let labels, pagosData

      if (filter === "day") {
        labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"]
        pagosData = [500, 800, 2500, 3800, 2200, 4500, 1800]
      } else if (filter === "month") {
        labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
        pagosData = [12500, 15000, 18000, 16500, 21000, 22500]
      } else {
        // year
        labels = ["2020", "2021", "2022", "2023", "2024"]
        pagosData = [120000, 150000, 180000, 210000, 250000]
      }

      const pagosChartData = {
        labels: labels,
        datasets: [
          {
            label: "Ingresos",
            data: pagosData,
            backgroundColor: [
              "rgba(56, 189, 248, 0.8)",
              "rgba(34, 211, 238, 0.8)",
              "rgba(125, 211, 252, 0.8)",
              "rgba(186, 230, 253, 0.8)",
              "rgba(14, 165, 233, 0.8)",
              "rgba(2, 132, 199, 0.8)",
              "rgba(3, 105, 161, 0.8)",
            ].slice(0, labels.length),
            borderRadius: 10,
            borderSkipped: false,
            barThickness: 25,
            maxBarThickness: 35,
          },
        ],
      }

      chartInstances.current.pagos = new Chart(pagosCtx, {
        type: "bar",
        data: pagosChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                font: { size: 14, weight: "bold", family: "'Poppins', sans-serif" },
                padding: 20,
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
            tooltip: {
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              titleColor: "#0284c7",
              bodyColor: "#0c4a6e",
              borderColor: "rgba(56, 189, 248, 0.3)",
              borderWidth: 1,
              cornerRadius: 8,
              boxPadding: 8,
              usePointStyle: true,
              callbacks: {
                label: (context) => `${context.parsed.y.toLocaleString()}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0, 0, 0, 0.04)", drawBorder: false },
              ticks: {
                callback: (value) => "$" + value.toLocaleString(),
                font: { size: 12, family: "'Poppins', sans-serif" },
                padding: 8,
              },
              title: {
                display: true,
                text: "Monto en Pesos",
                color: "rgba(56, 189, 248, 1)",
                font: { weight: "bold", size: 13, family: "'Poppins', sans-serif" },
                padding: { top: 10, bottom: 10 },
              },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 12, family: "'Poppins', sans-serif" }, padding: 8 },
            },
          },
          animation: { duration: 2000, easing: "easeOutQuart" },
        },
      })
    }
  }

  // Modificar el useEffect que inicializa los gráficos para usar la nueva función renderCharts
  // Reemplazar el useEffect que contiene la inicialización de gráficos con esta versión:
  useEffect(() => {
    Object.values(chartInstances.current).forEach((chart) => {
      if (chart) chart.destroy()
    })

    if (selectedModule === "dashboard" && hasModulePermission("dashboard", "leer")) {
      renderCharts(timeFilter)
    }

    return () => {
      Object.values(chartInstances.current).forEach((chart) => {
        if (chart) chart.destroy()
      })
    }
  }, [selectedModule, isAdmin, data, timeFilter])

  const fetchModuleData = async (moduleName) => {
    if (!hasModulePermission(moduleName, "leer")) {
      return { error: "No tienes permiso para acceder a este módulo" }
    }
    const token = localStorage.getItem("token")
    try {
      const response = await axios.get(`http://localhost:5000/api/${moduleName}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      console.error(`Error al cargar datos de ${moduleName}:`, error.response?.data || error.message)
      Swal.fire({
        title: "Error de carga",
        text: `No se pudieron cargar los datos de ${moduleName}`,
        icon: "error",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Entendido",
      })
      return { error: error.response?.data || "Error al cargar datos" }
    }
  }

  const fetchAllModulesData = async () => {
    if (!isAdmin) {
      return { error: "No tienes permiso para acceder a este módulo" }
    }
    const token = localStorage.getItem("token")
    const dashboardData = {}
    try {
      const modulesToLoad = ["reservas", "apartamentos", "pagos"]
      const promises = modulesToLoad.map(async (mod) => {
        try {
          const resp = await axios.get(`http://localhost:5000/api/${mod}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          dashboardData[mod] = resp.data
        } catch (error) {
          console.error(`Error fetching module ${mod}:`, error.response?.data || error.message)
          dashboardData[mod] = { error: error.response?.data || "Error al cargar datos" }
        }
      })
      await Promise.all(promises)
      setData(dashboardData)
    } catch (error) {
      console.error("Error al cargar datos de los módulos:", error)
      Swal.fire({
        title: "Error de carga",
        text: "No se pudieron cargar los datos del dashboard",
        icon: "error",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Entendido",
      })
      setData({ error: "Error al cargar datos de los módulos" })
    }
  }

  const fetchData = async (moduleName) => {
    if (!hasModulePermission(moduleName, "leer")) {
      console.log(`Usuario sin permiso de lectura para el módulo ${moduleName}, omitiendo carga de datos.`)
      setData({ error: "No tienes permiso para acceder a este módulo" })
      return
    }
    if (moduleName === "dashboard") {
      await fetchAllModulesData()
    } else {
      const moduleData = await fetchModuleData(moduleName)
      setData(moduleData)
    }
  }

  const handleModuleClick = (moduleName) => {
    if (!hasModulePermission(moduleName, "leer")) {
      // ELIMINAR cualquier código que muestre alertas relacionadas con permisos de módulos
      // Swal.fire({
      //   title: "Acceso denegado",
      //   text: "No tienes permisos para acceder a este módulo",
      //   icon: "warning",
      //   confirmButtonColor: "#2563eb",
      //   confirmButtonText: "Entendido",
      // })
      return
    }
    console.log("Cambiando a módulo:", moduleName)
    setSelectedModule(moduleName)
    fetchData(moduleName)
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (userRole && selectedModule && selectedModule !== "no-access" && selectedModule !== "profile") {
        if (hasModulePermission(selectedModule, "leer")) {
          console.log("Cargando datos para el módulo:", selectedModule)
          if (selectedModule === "dashboard") {
            await fetchAllModulesData()
          } else {
            try {
              const moduleData = await fetchModuleData(selectedModule)
              if (isMounted) {
                setData(moduleData)
              }
            } catch (error) {
              console.error(`Error al cargar datos de ${selectedModule}:`, error)
              if (isMounted) {
                setData({ error: "Error al cargar datos" })
              }
            }
          }
        } else {
          if (isMounted) {
            setData({ error: "No tienes permiso para acceder a este módulo" })
          }
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [userRole, selectedModule])

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro que deseas salir del sistema?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        // Redirección a la landing page en lugar de login
        history.push("/")
        Swal.fire({
          title: "¡Hasta pronto!",
          text: "Has cerrado sesión correctamente",
          icon: "success",
          confirmButtonColor: "#2563eb",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        })
      }
    })
  }

  // Modificar la parte del dropdown para mostrar el header
  const toggleProfileModal = () => setShowProfileModal(!showProfileModal)

  // Función para ir a la página de perfil
  const goToProfile = () => {
    setSelectedModule("profile")
    setShowProfileModal(false)
  }

  if (!userRole) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <div className="logo-animation">
          <div className="logo-icon-large">
            <span>N</span>
          </div>
          <div className="logo-text-large">NidoSky</div>
        </div>
      </div>
    )
  }

  const moduleNames = {
    dashboard: "Dashboard",
    usuarios: "Usuarios",
    roles: "Roles",
    clientes: "Clientes",
    apartamentos: "Apartamentos",
    tipoApartamento: "Tipo Apartamento",
    mobiliarios: "Mobiliarios",
    reservas: "Reservas",
    pagos: "Pagos",
    descuentos: "Descuentos",
    hospedaje: "Hospedaje",
    profile: "Mi Perfil",
  }

  // Modificar la función renderDashboard para incluir los botones de filtro
  // Reemplazar la función renderDashboard completa con esta versión:

  const toggleDrawer = () => {
    setOpen(!open)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${open ? "expanded" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <div className="logo-bird">
                <div className="bird-body"></div>
                <div className="bird-wing"></div>
                <div className="bird-head"></div>
                <div className="bird-tail"></div>
              </div>
            </div>
            {open && <h1 className="logo-text">NidoSky</h1>}
          </div>
          <button className="toggle-button" onClick={toggleDrawer}>
            {open ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>
        <Sidebar
          modules={visibleModules}
          selectedModule={selectedModule}
          onModuleClick={handleModuleClick}
          isCollapsed={!open}
          userRole={userRole}
        />
        {open && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-details">
                <p className="user-role">{userRole}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <div className={`mobile-sidebar ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <div className="logo-bird">
                <div className="bird-body"></div>
                <div className="bird-wing"></div>
                <div className="bird-head"></div>
                <div className="bird-tail"></div>
              </div>
            </div>
            <h1 className="logo-text">NidoSky</h1>
          </div>
          <button className="close-button" onClick={() => setIsMobileMenuOpen(false)}>
            <X />
          </button>
        </div>
        <div className="mobile-sidebar-content">
          {visibleModules.map((module) => (
            <button
              key={module}
              className={`mobile-menu-item ${selectedModule === module ? "active" : ""}`}
              onClick={() => handleModuleClick(module)}
            >
              {module === "dashboard" && <BarChart2 className="menu-icon" />}
              {module === "usuarios" && <Users className="menu-icon" />}
              {module === "roles" && <Shield className="menu-icon" />}
              {module === "clientes" && <User className="menu-icon" />}
              {module === "apartamentos" && <Building className="menu-icon" />}
              {module === "tipoApartamento" && <Building className="menu-icon" />}
              {module === "mobiliarios" && <Sofa className="menu-icon" />}
              {module === "reservas" && <Calendar className="menu-icon" />}
              {module === "pagos" && <CreditCard className="menu-icon" />}
              {module === "descuentos" && <Percent className="menu-icon" />}
              {module === "hospedaje" && <Hotel className="menu-icon" />}
              <span className="menu-text">{moduleNames[module]}</span>
            </button>
          ))}
        </div>
        <div className="mobile-sidebar-footer">
          <div className="user-info">
            <div className="user-details">
              <p className="user-role">{userRole}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="main-content">
        <header className="main-header">
          <div className="header-left">
            <button className="menu-button" onClick={toggleMobileMenu}>
              <Menu />
            </button>
            <h1 className="page-title">{moduleNames[selectedModule]}</h1>
          </div>
          <div className="header-right">
            <div className="profile-container">
              <button className="profile-button" onClick={toggleProfileModal}>
                <User size={18} className="profile-icon" />
                <span className="profile-name">{userRole}</span>
                <ChevronDown size={16} className="profile-dropdown-icon" />
              </button>
              {showProfileModal && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-title">Hola, {userName || userRole}</div>
                    <div className="dropdown-subtitle"></div>
                  </div>
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={goToProfile}>
                      <User size={18} className="item-icon" />
                      <span>Mi Perfil</span>
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={18} className="item-icon" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="content">
          <div className="content-body">
            {selectedModule === "profile" ? (
              <UserProfile />
            ) : selectedModule === "dashboard" ? (
              hasModulePermission("dashboard", "leer") ? (
                renderDashboard()
              ) : (
                <div className="alert warning">
                  <p>No tienes permitido acceder a este módulo.</p>
                </div>
              )
            ) : selectedModule === "usuarios" ? (
              hasModulePermission("usuarios", "leer") ? (
                <UsuariosList
                  canCreate={hasModulePermission("usuarios", "crear")}
                  canUpdate={hasModulePermission("usuarios", "actualizar")}
                  canDelete={hasModulePermission("usuarios", "eliminar")}
                />
              ) : (
                <div className="alert warning">
                  <p>No tienes permitido acceder a este módulo.</p>
                </div>
              )
            ) : selectedModule === "roles" ? (
              hasModulePermission("roles", "leer") ? (
                <RolesList
                  canCreate={hasModulePermission("roles", "crear")}
                  canUpdate={hasModulePermission("roles", "actualizar")}
                  canDelete={hasModulePermission("roles", "eliminar")}
                />
              ) : (
                <div className="alert warning">
                  <p>No tienes permitido acceder a este módulo.</p>
                </div>
              )
            ) : selectedModule === "descuentos" ? (
              hasModulePermission("descuentos", "leer") ? (
                <DescuentosList
                  canCreate={hasModulePermission("descuentos", "crear")}
                  canUpdate={hasModulePermission("descuentos", "actualizar")}
                  canDelete={hasModulePermission("descuentos", "eliminar")}
                />
              ) : (
                <div className="alert warning">
                  <p>No tienes permitido acceder a este módulo.</p>
                </div>
              )
            ) : selectedModule === "reservas" ? (
              hasModulePermission("reservas", "leer") ? (
                <ReservasList
                  canCreate={hasModulePermission("reservas", "crear")}
                  canUpdate={hasModulePermission("reservas", "actualizar")}
                  canDelete={hasModulePermission("reservas", "eliminar")}
                />
              ) : (
                <div className="alert warning">
                  <p>No tienes permitido acceder a este módulo.</p>
                </div>
              )
            ) : selectedModule === "apartamentos" ? (
              hasModulePermission("apartamentos", "leer") ? (
                <ApartamentoList
                  canCreate={hasModulePermission("apartamentos", "crear")}
                  canUpdate={hasModulePermission("apartamentos", "actualizar")}
                  canDelete={hasModulePermission("apartamentos", "eliminar")}
                />
              ) : (
                <div className="alert warning">
                  <p>No tienes permitido acceder a este módulo.</p>
                </div>
              )
            ) : selectedModule === "tipoApartamento" ? (
              hasModulePermission("tipoApartamento", "leer") ? (
                <TipoApartamentoList
                  canCreate={hasModulePermission("tipoApartamento", "crear")}
                  canUpdate={hasModulePermission("tipoApartamento", "actualizar")}
                  canDelete={hasModulePermission("tipoApartamento", "eliminar")}
                  onModuleChange={setSelectedModule}
                />
              ) : (
                <div className="alert warning">
                  <p>No tienes permitido acceder a este módulo.</p>
                </div>
              )
            ) : selectedModule === "mobiliarios" ? (
              hasModulePermission("mobiliarios", "leer") ? (
                <MobiliarioList
                  canCreate={hasModulePermission("mobiliarios", "crear")}
                  canUpdate={hasModulePermission("mobiliarios", "actualizar")}
                  canDelete={hasModulePermission("mobiliarios", "eliminar")}
                />
              ) : (
                <div className="alert warning">
                  <p>No tienes permitido acceder a este módulo.</p>
                </div>
              )
            ) : selectedModule === "hospedaje" ? (
              hasModulePermission("hospedaje", "leer") ? (
                <HospedajeList
                  canCreate={hasModulePermission("hospedaje", "crear")}
                  canUpdate={hasModulePermission("hospedaje", "actualizar")}
                  canDelete={hasModulePermission("hospedaje", "eliminar")}
                />
              ) : (
                <div className="alert warning">
                  <p>No tienes permitido acceder a este módulo.</p>
                </div>
              )
            ) : selectedModule === "clientes" ? (
              hasModulePermission("clientes", "leer") ? (
                <ClienteList
                  canCreate={hasModulePermission("clientes", "crear")}
                  canUpdate={hasModulePermission("clientes", "actualizar")}
                  canDelete={hasModulePermission("clientes", "eliminar")}
                />
              ) : (
                <div className="alert warning">
                  <p>No tienes permitido acceder a este módulo.</p>
                </div>
              )
            ) : selectedModule === "pagos" ? (
              hasModulePermission("pagos", "leer") ? (
                <PagosList
                  canCreate={hasModulePermission("pagos", "crear")}
                  canUpdate={hasModulePermission("pagos", "actualizar")}
                  canDelete={hasModulePermission("pagos", "eliminar")}
                />
              ) : (
                <div className="alert warning">
                  <p>No tienes permitido acceder a este módulo.</p>
                </div>
              )
            ) : (
              <Content
                selectedModule={selectedModule}
                data={data}
                modules={allModules.filter((m) => m !== "dashboard" && m !== "profile")}
                onCreate={(moduleName, newItem) => {
                  if (!hasModulePermission(moduleName, "crear")) {
                    Swal.fire({
                      title: "Acceso denegado",
                      text: "No tienes permisos para crear en este módulo",
                      icon: "warning",
                      confirmButtonColor: "#2563eb",
                      confirmButtonText: "Entendido",
                    })
                    return
                  }
                  console.log("Crear en", moduleName, newItem)
                }}
                onUpdate={(moduleName, id, updatedItem) => {
                  if (!hasModulePermission(moduleName, "actualizar")) {
                    Swal.fire({
                      title: "Acceso denegado",
                      text: "No tienes permisos para actualizar en este módulo",
                      icon: "warning",
                      confirmButtonColor: "#2563eb",
                      confirmButtonText: "Entendido",
                    })
                    return
                  }
                  console.log("Actualizar en", moduleName, id, updatedItem)
                }}
                onDelete={(moduleName, id) => {
                  if (!hasModulePermission(moduleName, "eliminar")) {
                    Swal.fire({
                      title: "Acceso denegado",
                      text: "No tienes permisos para eliminar en este módulo",
                      icon: "warning",
                      confirmButtonColor: "#2563eb",
                      confirmButtonText: "Entendido",
                    })
                    return
                  }
                  console.log("Eliminar en", moduleName, id)
                }}
                userPermissions={userPermissions}
                hasModulePermission={hasModulePermission}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )

  // Añadir estilos CSS para los botones de filtro al final del archivo
  // Añadir estos estilos CSS justo antes del return final:
  // Estilos CSS para los botones de filtro
  const timeFilterStyles = `
.time-filter-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.filter-select-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-select-container label {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
  font-weight: 500;
  color: #0284c7;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 100px;
}

.filter-select:hover {
  border-color: #cbd5e1;
}

.filter-select:focus {
  outline: none;
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
}

@media (max-width: 768px) {
  .time-filter-controls {
    justify-content: center;
  }
  
  .filter-select-container label {
    font-size: 13px;
  }
  
  .filter-select {
    padding: 6px 10px;
    font-size: 13px;
  }
}
`

  // Agregar los estilos al documento
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = timeFilterStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])
}

export default Dashboard
