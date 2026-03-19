<div align="center">

<img src="https://img.shields.io/badge/ReservSoft-Sistema%20Hotelero-6C3FFF?style=for-the-badge&logo=hotel&logoColor=white" alt="ReservSoft" />

# 🏨 ReservSoft

### Sistema de Gestión Hotelera Full Stack

*Plataforma integral para la administración de reservas, apartamentos, clientes y pagos hoteleros*

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com/)

<br/>

**[🚀 Ver Demo en Vivo](https://reservsoftproject-1.onrender.com/)**

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Screenshots](#-screenshots)
- [Autor](#-autor)

---

## 📖 Descripción

**ReservSoft** es una aplicación web empresarial diseñada para centralizar y optimizar la gestión de un complejo hotelero. Permite administrar el ciclo completo de una reserva: desde la disponibilidad de apartamentos, la creación de reservas por clientes, hasta el seguimiento de pagos y la gestión del personal con control de acceso por roles.

Construida con una arquitectura **cliente-servidor desacoplada** (SPA + REST API), garantiza escalabilidad, seguridad mediante **JWT** y una experiencia de usuario fluida.

---

## ✨ Características

| Módulo | Descripción |
|---|---|
| 🔐 **Autenticación** | Login seguro con JWT, rutas protegidas y expiración de sesión |
| 👥 **Usuarios** | CRUD completo con validaciones estrictas y control de estado |
| 🛡️ **Roles & Permisos** | Gestión de roles con asignación dinámica de permisos por módulo |
| 🏨 **Apartamentos** | Inventario de unidades con tipos, tarifas y disponibilidad |
| 👤 **Clientes** | Registro y administración de clientes con historial |
| 📅 **Reservas** | Creación, edición y seguimiento de reservas con fechas y titulares |
| 💳 **Pagos** | Registro de pagos parciales, estado y faltante por reserva |
| 🏷️ **Descuentos** | Configuración de descuentos por tipo de apartamento y vigencia |
| 📊 **Dashboard** | Panel con métricas y resumen general del sistema |
| 🌐 **Landing Page** | Página pública de presentación con sistema de reservas en línea |

---

## 🛠️ Tecnologías

### Frontend
- **React** — Interfaz de usuario dinámica tipo SPA
- **Material UI** — Componentes y sistema de diseño
- **React Router** — Navegación y rutas protegidas
- **Axios** — Cliente HTTP para consumo de la API
- **SweetAlert2** — Alertas y confirmaciones elegantes
- **Lucide React** — Iconografía moderna

### Backend
- **Node.js + Express** — Servidor REST API
- **Mongoose** — ODM para MongoDB
- **JSON Web Tokens (JWT)** — Autenticación stateless
- **Bcrypt** — Encriptación de contraseñas
- **CORS** — Configuración de seguridad de origen cruzado

### Base de datos & Deploy
- **MongoDB Atlas** — Base de datos NoSQL en la nube
- **Render** — Hosting del backend y frontend

---

## 🏗️ Arquitectura

```
reservsoft/
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── features/          # Módulos por dominio
│   │   │   ├── usuarios/
│   │   │   ├── clientes/
│   │   │   ├── reservas/
│   │   │   ├── pagos/
│   │   │   ├── descuentos/
│   │   │   ├── apartamentos/
│   │   │   └── roles/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── context/           # AuthContext (JWT)
│   │   └── routes/            # Rutas protegidas
│   └── package.json
│
└── backend/                   # Node.js REST API
    ├── controllers/           # Lógica de negocio
    ├── models/                # Esquemas Mongoose
    ├── routes/                # Endpoints REST
    ├── middleware/             # Auth, validación
    └── server.js
```

---

## ⚙️ Instalación

### Prerrequisitos

- Node.js ≥ 16
- npm ≥ 8
- MongoDB Atlas (o instancia local)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Dcano96/reservsoftproject.git
cd reservsoftproject
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

### 4. Configurar variables de entorno

Crear un archivo `.env` en `/backend` con las variables indicadas en la sección siguiente.

### 5. Ejecutar en desarrollo

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

La aplicación estará disponible en `http://localhost:3000`

---

## 🔑 Variables de Entorno

Crear el archivo `/backend/.env`:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de datos
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/reservsoft

# Autenticación
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000
```

---

## 📸 Screenshots

### 🔐 Login

| Pantalla principal | Vista alternativa |
|---|---|
| ![Login](screenshots/1%20login.JPG) | ![Login 2](screenshots/Captura%202%20login.JPG) |

---

### 📊 Dashboard

![Dashboard](screenshots/1%20dashboard.JPG)

---

### 👥 Gestión de Usuarios

| Lista | Crear | Editar | Detalles |
|---|---|---|---|
| ![](screenshots/1%20usuarios.JPG) | ![](screenshots/2%20crear%20usuario.JPG) | ![](screenshots/Captura%203%20editar%20usuario.JPG) | ![](screenshots/Captura%204%20detalles%20usuario.JPG) |

---

### 🛡️ Gestión de Roles

| Lista | Crear | Editar | Detalles |
|---|---|---|---|
| ![](screenshots/1%20roles.JPG) | ![](screenshots/2%20crear%20rol.JPG) | ![](screenshots/Captura%203%20editar%20rol.JPG) | ![](screenshots/Captura%204%20detalles%20rol.JPG) |

---

### 🏨 Apartamentos

| Lista | Crear | Editar | Detalles |
|---|---|---|---|
| ![](screenshots/1%20Apartamentos.JPG) | ![](screenshots/Crear%20apartamento.JPG) | ![](screenshots/editar%20apartamento.JPG) | ![](screenshots/detalles%20apartamento.JPG) |

---

### 📅 Reservas

| Lista | Crear | Detalles |
|---|---|---|
| ![](screenshots/1Reservas.JPG) | ![](screenshots/crear%20reserva.JPG) | ![](screenshots/detalles%20reserva.JPG) |

---

## 👨‍💻 Autor

<div align="center">

**David Andres Goez Cano**

*Desarrollador Full Stack*

[![GitHub](https://img.shields.io/badge/GitHub-Dcano96-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Dcano96)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-David%20Goez-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/david-goez-a0171a20a)

</div>

---

<div align="center">

*Desarrollado con ❤️ — ReservSoft © 2024*

</div>