"use client"

import { useState } from "react"
import {
  BarChart3,
  Users,
  User,
  Building2,
  Armchair,
  CalendarDays,
  CreditCard,
  Tag,
  Hotel,
  ChevronRight,
  Settings,
  Lock,
} from "lucide-react"
import "./Dashboard.css"

// Función de utilidad para combinar clases
const cn = (...classes) => classes.filter(Boolean).join(" ")

// Mapeo de iconos para cada módulo (se agrega roles y tipoApartamento)
const moduleIcons = {
  dashboard: BarChart3,
  usuarios: Users,
  roles: Lock,
  clientes: User,
  tipoApartamento: Building2, // Agregado para el módulo tipoApartamento
  apartamentos: Building2,
  mobiliarios: Armchair,
  reservas: CalendarDays,
  pagos: CreditCard,
  descuentos: Tag,
  hospedaje: Hotel,
}

// Mapeo de nombres para mostrar en la UI según la estructura de subprocesos
const moduleDisplayNames = {
  dashboard: "Subproceso de Medición",
  roles: "Subproceso Gestión de Roles",
  usuarios: "Subproceso Gestión de Usuarios",
  tipoApartamento: "Subproceso Tipo de Apartamentos",
  apartamentos: "Subproceso Gestión de Apartamentos",
  mobiliarios: "Subproceso Gestión de Mobiliario",
  descuentos: "Subproceso Gestión de Descuentos",
  clientes: "Subproceso Gestión de Clientes",
  reservas: "Subproceso Gestión de Reservas",
  hospedaje: "Subproceso Gestión de Hospedaje",
  pagos: "Subproceso Gestión de Pagos",
}

const Sidebar = ({ modules, selectedModule, onModuleClick, isCollapsed, userRole }) => {
  // Agrupación de módulos según los procesos definidos
  const moduleGroups = {
    desempeno: ["dashboard"],
    configuracion: ["roles"],
    usuarios: ["usuarios"],
    apartamentos: ["tipoApartamento", "apartamentos", "mobiliarios", "descuentos"],
    reservas: ["clientes", "reservas"],
    hospedaje: ["hospedaje"],
    pagos: ["pagos"],
  }

  // Nombres de los procesos para los títulos de grupo
  const groupNames = {
    desempeno: "Proceso de Medición",
    configuracion: "Proceso de Configuración",
    usuarios: "Proceso de Usuarios",
    apartamentos: "Proceso de Apartamentos",
    reservas: "Proceso de Reservas",
    hospedaje: "Proceso de Hospedaje",
    pagos: "Proceso de Pagos",
  }

  // Estado para grupos expandidos
  const [expandedGroups, setExpandedGroups] = useState(
    Object.keys(groupNames).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
  )

  // Función para alternar la expansión de un grupo
  const toggleGroup = (group) => {
    if (!isCollapsed) {
      setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }))
    }
  }

  return (
    <div className="sidebar-content">
      {Object.keys(moduleGroups).map((groupKey) => {
        // Filtrar módulos del grupo que están en la lista de módulos visibles
        const groupModules = moduleGroups[groupKey].filter((module) => modules.includes(module))
        if (groupModules.length === 0) return null

        return (
          <div key={groupKey} className="sidebar-section">
            {!isCollapsed && (
              <button className="sidebar-section-title" onClick={() => toggleGroup(groupKey)}>
                {groupNames[groupKey]}
                <span className={`group-arrow ${expandedGroups[groupKey] ? "expanded" : ""}`}>
                  <ChevronRight />
                </span>
              </button>
            )}
            {(isCollapsed || expandedGroups[groupKey]) && (
              <div className="sidebar-menu">
                {groupModules.map((moduleName) => {
                  const Icon = moduleIcons[moduleName] || Settings
                  return (
                    <button
                      key={moduleName}
                      className={cn("sidebar-menu-item", selectedModule === moduleName && "active")}
                      onClick={() => onModuleClick(moduleName)}
                      title={isCollapsed ? moduleDisplayNames[moduleName] || moduleName : ""}
                    >
                      <div className="sidebar-menu-icon">
                        <Icon />
                      </div>
                      {!isCollapsed && <span className="sidebar-menu-text">{moduleDisplayNames[moduleName] || moduleName}</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Sidebar
