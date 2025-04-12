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
  Settings
} from "lucide-react"
import "./Dashboard.css"

// Función de utilidad para combinar clases
const cn = (...classes) => classes.filter(Boolean).join(" ")

// Mapeo de iconos para cada módulo (se agrega roles y tipoApartamento)
const moduleIcons = {
  dashboard: BarChart3,
  usuarios: Users,
  roles: Settings, // Agregado para el módulo roles
  clientes: User,
  tipoApartamento: Building2, // Agregado para el módulo tipoApartamento
  apartamentos: Building2,
  mobiliarios: Armchair,
  reservas: CalendarDays,
  pagos: CreditCard,
  descuentos: Tag,
  hospedaje: Hotel,
}

// Agrupación de módulos por categoría (se agrega "roles" en administración y "tipoApartamento" en operaciones)
const Sidebar = ({ modules, selectedModule, onModuleClick, isCollapsed, userRole }) => {
  const moduleGroups = {
    administracion: ["dashboard", "usuarios", "roles", "clientes"],
    operaciones: ["tipoApartamento", "apartamentos", "mobiliarios", "reservas", "hospedaje"],
    finanzas: ["pagos", "descuentos"],
  }

  // Nombres de las categorías
  const groupNames = {
    administracion: "Administración",
    operaciones: "Operaciones",
    finanzas: "Finanzas",
  }

  // Estado para grupos expandidos
  const [expandedGroups, setExpandedGroups] = useState({
    administracion: true,
    operaciones: true,
    finanzas: true,
  })

  // Función para alternar la expansión de un grupo
  const toggleGroup = (group) => {
    if (!isCollapsed) {
      setExpandedGroups({
        ...expandedGroups,
        [group]: !expandedGroups[group],
      })
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
              <div className="sidebar-section-title" onClick={() => toggleGroup(groupKey)}>
                {groupNames[groupKey]}
                <span className={`group-arrow ${expandedGroups[groupKey] ? "expanded" : ""}`}>
                  <ChevronRight />
                </span>
              </div>
            )}
            {(isCollapsed || expandedGroups[groupKey]) && (
              <div className="sidebar-menu">
                {groupModules.map((moduleName) => {
                  const Icon = moduleIcons[moduleName] || Building2
                  return (
                    <button
                      key={moduleName}
                      className={cn("sidebar-menu-item", selectedModule === moduleName && "active")}
                      onClick={() => onModuleClick(moduleName)}
                      title={isCollapsed ? moduleName : ""}
                    >
                      <div className="sidebar-menu-icon">
                        <Icon />
                      </div>
                      {!isCollapsed && <span className="sidebar-menu-text capitalize">{moduleName}</span>}
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
