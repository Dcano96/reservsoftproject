"use client"

import { useState, useEffect, useRef } from "react"
import {
  BarChart2,
  Database,
  Home,
  CreditCard,
  Tag,
  Hotel,
  Calendar,
  Users,
  User,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react"
import "./Dashboard.css"

// Función para obtener el ícono del módulo
const getModuleIcon = (moduleName) => {
  const icons = {
    dashboard: <BarChart2 className="module-icon" />,
    usuarios: <User className="module-icon" />,
    clientes: <Users className="module-icon" />,
    apartamentos: <Home className="module-icon" />,
    reservas: <Calendar className="module-icon" />,
    pagos: <CreditCard className="module-icon" />,
    descuentos: <Tag className="module-icon" />,
    hospedajes: <Hotel className="module-icon" />,
  }
  return icons[moduleName] || <Database className="module-icon" />
}

// Colores para las gráficas
const chartColors = {
  usuarios: "#4a6cf7",
  clientes: "#2dd4bf",
  apartamentos: "#22c55e",
  reservas: "#f59e0b",
  pagos: "#8b5cf6",
  descuentos: "#ec4899",
  hospedajes: "#3b82f6",
  default: "#64748b",
}

const Content = ({
  selectedModule,
  data,
  darkMode,
  modules = [],
  onCreate,
  onUpdate,
  onDelete,
  userPermissions,
  hasModulePermission,
}) => {
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({})
  const [showNewForm, setShowNewForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const chartRefs = useRef({})

  // Efecto para renderizar gráficas en "dashboard"
  useEffect(() => {
    if (selectedModule === "dashboard" && data) {
      renderCharts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule, data, darkMode])

  const renderCharts = () => {
    if (!window.Chart) {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/chart.js"
      script.async = true
      script.onload = createCharts
      document.body.appendChild(script)
    } else {
      createCharts()
    }
  }

  const createCharts = () => {
    if (!window.Chart) return
    // Destruir gráficos existentes
    Object.values(chartRefs.current).forEach((chart) => {
      if (chart) chart.destroy()
    })
    modules.forEach((module) => {
      if (!data[module] || !Array.isArray(data[module])) return
      const canvas = document.getElementById(`chart-${module}`)
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      const items = data[module]

      const baseConfig = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: { color: darkMode ? "#e2e8f0" : "#334155" },
          },
          tooltip: { enabled: true },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" },
            ticks: { color: darkMode ? "#e2e8f0" : "#334155" },
          },
          x: {
            grid: { color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" },
            ticks: { color: darkMode ? "#e2e8f0" : "#334155" },
          },
        },
      }

      let chartConfig
      const color = chartColors[module] || chartColors.default

      switch (module) {
        case "usuarios": {
          const roles = items.reduce((acc, item) => {
            const role = item.rol || "No especificado"
            acc[role] = (acc[role] || 0) + 1
            return acc
          }, {})
          chartConfig = {
            type: "bar",
            data: {
              labels: Object.keys(roles),
              datasets: [
                {
                  label: "Usuarios por rol",
                  data: Object.values(roles),
                  backgroundColor: color,
                  borderColor: color,
                  borderWidth: 1,
                },
              ],
            },
            options: baseConfig,
          }
          break
        }
        case "clientes": {
          const tipos = items.reduce((acc, item) => {
            const tipo = item.tipo || "No especificado"
            acc[tipo] = (acc[tipo] || 0) + 1
            return acc
          }, {})
          chartConfig = {
            type: "bar",
            data: {
              labels: Object.keys(tipos),
              datasets: [
                {
                  label: "Clientes por tipo",
                  data: Object.values(tipos),
                  backgroundColor: color,
                  borderColor: color,
                  borderWidth: 1,
                },
              ],
            },
            options: baseConfig,
          }
          break
        }
        case "apartamentos": {
          const estados = items.reduce((acc, item) => {
            const estado = item.estado || "No especificado"
            acc[estado] = (acc[estado] || 0) + 1
            return acc
          }, {})
          chartConfig = {
            type: "doughnut",
            data: {
              labels: Object.keys(estados),
              datasets: [
                {
                  label: "Apartamentos por estado",
                  data: Object.values(estados),
                  backgroundColor: ["#22c55e", "#ef4444", "#f59e0b", "#64748b"],
                  borderWidth: 1,
                },
              ],
            },
            options: { ...baseConfig, cutout: "60%" },
          }
          break
        }
        case "reservas":
        case "pagos": {
          const porMes = items.reduce((acc, item) => {
            const fecha = item.fecha || item.fechaCreacion || new Date().toISOString()
            const mes = new Date(fecha).getMonth()
            const nombreMes = new Date(2023, mes, 1).toLocaleString("es", { month: "short" })
            acc[nombreMes] = (acc[nombreMes] || 0) + 1
            return acc
          }, {})
          chartConfig = {
            type: "line",
            data: {
              labels: Object.keys(porMes),
              datasets: [
                {
                  label: `${module.charAt(0).toUpperCase() + module.slice(1)} por mes`,
                  data: Object.values(porMes),
                  backgroundColor: color,
                  borderColor: color,
                  tension: 0.3,
                  fill: false,
                },
              ],
            },
            options: baseConfig,
          }
          break
        }
        case "descuentos": {
          const porcentajes = items.reduce((acc, item) => {
            const porcentaje = item.porcentaje || 0
            const rango = `${Math.floor(porcentaje / 10) * 10}% - ${Math.floor(porcentaje / 10) * 10 + 10}%`
            acc[rango] = (acc[rango] || 0) + 1
            return acc
          }, {})
          chartConfig = {
            type: "bar",
            data: {
              labels: Object.keys(porcentajes),
              datasets: [
                {
                  label: "Descuentos por rango",
                  data: Object.values(porcentajes),
                  backgroundColor: color,
                  borderColor: color,
                  borderWidth: 1,
                },
              ],
            },
            options: { ...baseConfig, indexAxis: "y" },
          }
          break
        }
        case "hospedajes": {
          const duraciones = items.reduce((acc, item) => {
            const checkIn = new Date(item.checkIn || new Date())
            const checkOut = new Date(item.checkOut || new Date())
            const duracion = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
            const rango = duracion <= 3 ? "Corta (1-3 días)" : duracion <= 7 ? "Media (4-7 días)" : "Larga (8+ días)"
            acc[rango] = (acc[rango] || 0) + 1
            return acc
          }, {})
          chartConfig = {
            type: "bar",
            data: {
              labels: Object.keys(duraciones),
              datasets: [
                {
                  label: "Hospedajes por duración",
                  data: Object.values(duraciones),
                  backgroundColor: color,
                  borderColor: color,
                  borderWidth: 1,
                },
              ],
            },
            options: baseConfig,
          }
          break
        }
        default: {
          chartConfig = {
            type: "bar",
            data: {
              labels: ["Total"],
              datasets: [
                {
                  label: `Total de ${module}`,
                  data: [items.length],
                  backgroundColor: color,
                  borderColor: color,
                  borderWidth: 1,
                },
              ],
            },
            options: baseConfig,
          }
        }
      }

      chartRefs.current[module] = new window.Chart(ctx, chartConfig)
    })
  }

  // Función para mostrar un resumen de cada módulo en el dashboard
  function renderModuleSummary(moduleName, moduleData) {
    if (!moduleData) {
      return <p className="module-loading">Cargando datos...</p>
    }
    if (moduleData.error) {
      // Si el error es un objeto, se extrae su propiedad "msg" (o se muestra un mensaje por defecto)
      const errorMsg =
        typeof moduleData.error === "object" ? moduleData.error.msg || "Error al cargar datos" : moduleData.error
      return <p className="module-error">{errorMsg}</p>
    }
    const items = Array.isArray(moduleData) ? moduleData : []
    return (
      <div className="module-stats">
        <div className="module-stat">
          <span className="stat-value">{items.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>
    )
  }

  // Función para renderizar la data en otros módulos (por ejemplo, en formato JSON)
  const renderDataTable = () => {
    if (!data) return <p>Cargando datos...</p>
    if (data.error) {
      const errorMsg = typeof data.error === "object" ? data.error.msg || "Error al cargar datos" : data.error
      return (
        <div className="error-container">
          <AlertCircle className="error-icon" />
          <p className="error-message">Error: {errorMsg}</p>
        </div>
      )
    }
    if (!Array.isArray(data) || data.length === 0) {
      return <p>No hay datos disponibles para mostrar.</p>
    }
    return <pre>{JSON.stringify(data, null, 2)}</pre>
  }

  // Si se selecciona "dashboard", mostrar el resumen con gráficas
  if (selectedModule === "dashboard") {
    return (
      <div className="content-container">
        <div className="content-header">
          <div>
            <h1 className="module-title">Dashboard Principal</h1>
            <p className="module-description">Resumen de todos los módulos del sistema</p>
          </div>
        </div>
        <div className="dashboard-overview">
          {modules.map((module) => (
            <div key={module} className="module-card">
              <div className="module-card-header">
                <h2 className="module-card-title capitalize">{module}</h2>
                {getModuleIcon(module)}
              </div>
              <div className="module-card-content">{renderModuleSummary(module, data && data[module])}</div>
              <div className="chart-container">
                <canvas id={`chart-${module}`} height="200"></canvas>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Si se selecciona "usuarios", mostrar la tabla CRUD
  if (selectedModule === "usuarios") {
    if (!data) return <p>Cargando datos...</p>
    if (data.error) {
      const errorMsg = typeof data.error === "object" ? data.error.msg || "Error al cargar datos" : data.error
      return (
        <div className="error-container">
          <AlertCircle className="error-icon" />
          <p className="error-message">Error: {errorMsg}</p>
        </div>
      )
    }

    const items = Array.isArray(data) ? data : []
    let columns = []
    if (items.length > 0) {
      columns = Object.keys(items[0]).filter((col) => col !== "password" && col !== "__v")
    } else {
      columns = ["nombre", "email", "rol", "estado"]
    }
    return (
      <div className="data-table-container">
        <div className="table-actions">
          {hasModulePermission(selectedModule, "crear") && (
            <button
              className="add-button"
              onClick={() => {
                if (selectedModule === "usuarios") {
                  setNewItem({ nombre: "", email: "", password: "", rol: "recepcion", estado: true })
                } else {
                  setNewItem({})
                }
                setShowNewForm(true)
              }}
            >
              <Plus className="icon-sm" /> Agregar nuevo
            </button>
          )}
        </div>
        {showNewForm && (
          <div className="new-item-form">
            <h3 className="form-title">
              Nuevo {selectedModule === "usuarios" ? "Usuario" : selectedModule.slice(0, -1)}
            </h3>
            <div className="form-fields">
              {selectedModule === "usuarios" ? (
                <>
                  <div className="form-field">
                    <label className="field-label">Nombre</label>
                    <input
                      type="text"
                      className="field-input"
                      value={newItem.nombre || ""}
                      onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">Email</label>
                    <input
                      type="email"
                      className="field-input"
                      value={newItem.email || ""}
                      onChange={(e) => setNewItem({ ...newItem, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">Contraseña</label>
                    <div className="password-input-container">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="field-input password-input"
                        value={newItem.password || ""}
                        onChange={(e) => setNewItem({ ...newItem, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="field-label">Rol</label>
                    <select
                      className="field-input"
                      value={newItem.rol || "recepcion"}
                      onChange={(e) => setNewItem({ ...newItem, rol: e.target.value })}
                      required
                    >
                      <option value="administrador">Administrador</option>
                      <option value="recepcion">Recepción</option>
                      <option value="cliente">Cliente</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="field-label">Estado</label>
                    <select
                      className="field-input"
                      value={newItem.estado === true ? "true" : "false"}
                      onChange={(e) => setNewItem({ ...newItem, estado: e.target.value === "true" })}
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </>
              ) : (
                columns
                  .filter(
                    (col) =>
                      col !== "id" && col !== "_id" && col !== "__v" && col !== "createdAt" && col !== "updatedAt",
                  )
                  .map((column) => (
                    <div key={column} className="form-field">
                      <label className="field-label">{column.charAt(0).toUpperCase() + column.slice(1)}</label>
                      <input
                        type="text"
                        className="field-input"
                        value={newItem[column] || ""}
                        onChange={(e) => setNewItem({ ...newItem, [column]: e.target.value })}
                      />
                    </div>
                  ))
              )}
            </div>
            <button
              className="save-button"
              onClick={() => {
                if (!hasModulePermission(selectedModule, "crear")) {
                  alert("No tienes permiso para crear en este módulo")
                  return
                }
                onCreate && onCreate(selectedModule, newItem)
                setNewItem({})
                setShowNewForm(false)
              }}
            >
              <Save className="icon-sm" /> Guardar
            </button>
            <button
              className="cancel-button"
              onClick={() => {
                setNewItem({})
                setShowNewForm(false)
              }}
            >
              <X className="icon-sm" /> Cancelar
            </button>
          </div>
        )}
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className="table-header">
                  {column.charAt(0).toUpperCase() + column.slice(1)}
                </th>
              ))}
              <th className="table-header">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item._id || index} className="table-row">
                {columns.map((column) => (
                  <td key={`${index}-${column}`} className="table-cell">
                    {editingItem === index ? (
                      selectedModule === "usuarios" && column === "rol" ? (
                        <select
                          className="edit-input"
                          value={editingItem[column] || item[column] || ""}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              [column]: e.target.value,
                            })
                          }
                        >
                          <option value="administrador">Administrador</option>
                          <option value="recepcion">Recepción</option>
                          <option value="cliente">Cliente</option>
                        </select>
                      ) : selectedModule === "usuarios" && column === "estado" ? (
                        <select
                          className="edit-input"
                          value={String(editingItem[column] !== undefined ? editingItem[column] : item[column])}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              [column]: e.target.value === "true",
                            })
                          }
                        >
                          <option value="true">Activo</option>
                          <option value="false">Inactivo</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="edit-input"
                          value={editingItem[column] !== undefined ? editingItem[column] : item[column] || ""}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              [column]: e.target.value,
                            })
                          }
                        />
                      )
                    ) : selectedModule === "usuarios" && column === "estado" ? (
                      <span className={`status-badge ${item[column] ? "active" : "inactive"}`}>
                        {item[column] ? "Activo" : "Inactivo"}
                      </span>
                    ) : typeof item[column] === "object" ? (
                      JSON.stringify(item[column])
                    ) : (
                      String(item[column] || "")
                    )}
                  </td>
                ))}
                <td className="table-cell actions-cell">
                  {editingItem === index ? (
                    <>
                      <button
                        className="action-button save"
                        onClick={() => {
                          if (!hasModulePermission(selectedModule, "actualizar")) {
                            alert("No tienes permiso para actualizar en este módulo")
                            return
                          }
                          onUpdate && onUpdate(selectedModule, item._id || item.id, editingItem)
                          setEditingItem(null)
                        }}
                      >
                        <Save className="icon-sm" />
                      </button>
                      <button className="action-button cancel" onClick={() => setEditingItem(null)}>
                        <X className="icon-sm" />
                      </button>
                    </>
                  ) : (
                    <>
                      {hasModulePermission(selectedModule, "actualizar") && (
                        <button className="action-button edit" onClick={() => setEditingItem({ ...item, index })}>
                          <Edit className="icon-sm" />
                        </button>
                      )}
                      {hasModulePermission(selectedModule, "eliminar") && (
                        <button
                          className="action-button delete"
                          onClick={() => {
                            if (
                              window.confirm(
                                `¿Está seguro que desea eliminar este ${selectedModule === "usuarios" ? "usuario" : selectedModule.slice(0, -1)}?`,
                              )
                            ) {
                              onDelete && onDelete(selectedModule, item._id || item.id)
                            }
                          }}
                        >
                          <Trash2 className="icon-sm" />
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Para otros módulos, mostrar la data en formato JSON (o el renderizado que se requiera)
  return (
    <div className="content-container">
      <div className="content-header">
        <div>
          <h1 className="module-title capitalize">{selectedModule}</h1>
          <p className="module-description">Gestión de {selectedModule} del hotel</p>
        </div>
      </div>
      <div className="data-card">
        <div className="data-header">
          <h3 className="data-title">Datos de {selectedModule}</h3>
          <p className="data-description">Información detallada de {selectedModule}</p>
        </div>
        <div className="data-content">{renderDataTable()}</div>
      </div>
    </div>
  )
}

export default Content

