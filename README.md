# 🌱 AgroSmart — Plataforma Integral de Gestión Agrícola y Comercialización

**AgroSmart** es una aplicación web full-stack desarrollada bajo la arquitectura **MERN** (MongoDB, Express, React/Vite, Node.js) diseñada para productores agrícolas, compradores y administradores de la región de **Pairumani / Vinto, Cochabamba, Bolivia** (`America/La_Paz`).

El sistema digitaliza el ciclo agrícola completo: desde la georreferenciación de parcelas y el control fenológico de cultivos hasta la publicación de cosechas en un marketplace directo con gestión automatizada de pedidos e inventario.

---

## 👥 Equipo de Desarrollo

- **Miguel Angel Chura Condori** — Desarrollo Full-Stack (Backend API, Arquitectura MERN, Marketplace y Documentación Swagger)
- **Norma Mendoza Layme** — Desarrollo Full-Stack (Frontend React, Gestión Agrícola, Analítica y Control de Calidad QA)

---

## 📋 Matriz de Cumplimiento de Requisitos Funcionales (100% RF-001 a RF-014)

| Código | Requisito Funcional | Módulo / Endpoint Principal | Estado |
| :--- | :--- | :--- | :---: |
| **RF-001** | Registro y autenticación segura de usuarios (JWT + bcrypt) | `POST /api/auth/register`, `POST /api/auth/login` | ✅ |
| **RF-002** | Control de Acceso Basado en Roles (Agricultor, Comprador, Admin) | Middleware RBAC + `ProtectedRoute` | ✅ |
| **RF-003** | Gestión CRUD de cultivos y etapas fenológicas | `GET/POST/PUT/DELETE /api/crops` | ✅ |
| **RF-004** | Publicación de cosechas en catálogo con stock y precio en Bs. | `PUT /api/crops/:id` (`isForSale`) | ✅ |
| **RF-005** | Marketplace y solicitudes de compra por parte del Comprador | `GET/POST /api/orders` | ✅ |
| **RF-006** | Aprobación/rechazo de pedidos con descuento automático de stock | `PUT /api/orders/:id` | ✅ |
| **RF-007** | Gestión y georreferenciación GPS de parcelas e invernaderos | `GET/POST/PUT/DELETE /api/parcels` | ✅ |
| **RF-008** | Monitoreo meteorológico en tiempo real por coordenadas GPS | `GET /api/weather` (Open-Meteo API) | ✅ |
| **RF-009** | Sistema de alertas preventivas (heladas, tareas y stock crítico) | Dashboard + Notificaciones en tiempo real | ✅ |
| **RF-010** | Agenda agrícola y gestión de tareas por prioridad y fecha | `GET/POST/PUT/DELETE /api/tasks` | ✅ |
| **RF-011** | Control de inventario de insumos y alertas de stock mínimo | `GET/POST/PUT/DELETE /api/supplies` | ✅ |
| **RF-012** | Consulta de precios referenciales de mercado agrícola | `GET/POST /api/market-prices` | ✅ |
| **RF-013** | Analítica de ingresos, producción y exportación de reportes CSV | `GET /api/analytics` | ✅ |
| **RF-014** | Documentación interactiva de API REST (OpenAPI 3.0 / Swagger) | `GET /apidocs` | ✅ |

---

## 🏗️ Arquitectura del Proyecto

```text
AgroSmart/
├── backend/                  # API RESTful con Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/           # Conexión a MongoDB y configuración OpenAPI/Swagger
│   │   ├── controllers/      # Lógica de negocio (Auth, Crops, Orders, Analytics, etc.)
│   │   ├── middlewares/      # Verificación JWT y control de acceso por roles
│   │   ├── models/           # Esquemas Mongoose (User, Crop, Parcel, Order, Task, Supply)
│   │   ├── routes/           # Definición de endpoints RESTful
│   │   └── server.js         # Punto de entrada del servidor Express
│   └── .env.example          # Plantilla de variables de entorno del servidor
│
├── frontend/                 # SPA con React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/              # Cliente Axios con interceptores JWT
│   │   ├── components/       # Navbar dinámico por rol, OrdersModal, ProtectedRoute
│   │   ├── context/          # AuthContext (gestión global de sesión y RBAC)
│   │   └── pages/            # Dashboard, BuyerMarketplace, Parcels, Analytics, AdminPanel
│   └── dist/                 # Compilado optimizado para producción
│
├── .env.example              # Variables de entorno del cliente
├── .gitignore                # Exclusión de dependencias y archivos sensibles
└── README.md                 # Documentación general del proyecto
