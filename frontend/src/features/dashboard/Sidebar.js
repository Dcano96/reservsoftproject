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

const cn = (...classes) => classes.filter(Boolean).join(" ")

const moduleIcons = {
  dashboard: BarChart3,
  usuarios: Users,
  roles: Settings,
  permisos: Settings,
  acceso: Settings,
  clientes: User,
  tipoApartamento: Building2,
  mobiliarios: Armchair,
  apartamentos: Building2,
  descuentos: Tag,
  reservas: CalendarDays,
  hospedaje: Hotel,
  historicoHospedaje: Hotel,
  pagos: CreditCard,
  comportamiento: BarChart3,
}

const Sidebar = ({ modules, selectedModule, onModuleClick, isCollapsed }) => {
  const moduleGroups = {
    configuracion: ["roles", "permisos"],
    usuarios: ["usuarios", "acceso"],
    apartamentos: ["tipoApartamento", "mobiliarios", "apartamentos", "descuentos"],
    reservas: ["clientes", "reservas"],
    hospedaje: ["hospedaje", "historicoHospedaje"],
    pagos: ["pagos"],
    comportamiento: ["dashboard"],
  }

  const groupNames = {
    configuracion: "Proceso de configuración",
    usuarios: "Proceso de usuarios",
    apartamentos: "Proceso de apartamentos",
    reservas: "Proceso de reservas",
    hospedaje: "Proceso de hospedaje",
    pagos: "Proceso de pagos",
    comportamiento: "Proceso de medición de comportamiento del desempeño",
  }

  const moduleLabels = {
    roles: "Gestión de roles",
    permisos: "Gestión de permisos",
    usuarios: "Gestión de usuarios",
    acceso: "Gestión de acceso",
    tipoApartamento: "Gestión de tipo de apartamentos",
    mobiliarios: "Gestión de mobiliario de apartamentos",
    apartamentos: "Gestión de apartamentos",
    descuentos: "Gestión de descuentos",
    clientes: "Gestión de clientes",
    reservas: "Gestión de reservas",
    hospedaje: "Gestión de hospedaje",
    historicoHospedaje: "Histórico de hospedaje",
    pagos: "Gestión de pagos",
    dashboard: "Medición comportamiento reservas, descuentos y hospedajes - ReservSoft",
  }

  const [expandedGroups, setExpandedGroups] = useState({
    configuracion: true,
    usuarios: true,
    apartamentos: true,
    reservas: true,
    hospedaje: true,
    pagos: true,
    comportamiento: true,
  })

  const toggleGroup = (group) => {
    if (!isCollapsed) {
      setExpandedGroups((prev) => ({
        ...prev,
        [group]: !prev[group],
      }))
    }
  }

  return (
    <div className="sidebar-content">
      {Object.keys(moduleGroups).map((groupKey) => {
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
                      title={isCollapsed ? moduleLabels[moduleName] : ""}
                    >
                      <div className="sidebar-menu-icon">
                        <Icon />
                      </div>
                      {!isCollapsed && (
                        <span className="sidebar-menu-text capitalize">
                          {moduleLabels[moduleName]}
                        </span>
                      )}
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
