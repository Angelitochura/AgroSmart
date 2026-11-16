# 🌱 AgroSmart — Plataforma Integral de Gestión Agrícola y Comercialización

**AgroSmart** es una aplicación web full-stack desarrollada bajo la arquitectura **MERN** (MongoDB, Express, React/Vite, Node.js) diseñada para productores agrícolas, compradores y administradores de la región de **Pairumani / Vinto, Cochabamba, Bolivia** (`America/La_Paz`).

---

## 🚀 Funcionalidades Principales (100% RF-001 a RF-014)

- **Control de Acceso Basado en Roles (RBAC):** Vistas y navegación diferenciadas para `AGRICULTOR`, `COMPRADOR` y `ADMIN` con autenticación segura mediante JWT.
- **Gestión de Cultivos y Catálogo:** Registro, edición fenológica, control de stock disponible y publicación directa en catálogo con precios en Bolivianos (`Bs.`).
- **Marketplace y Pedidos:** Flujo completo donde el comprador solicita cosechas y el agricultor aprueba o rechaza pedidos con descuento automático de inventario.
- **Georreferenciación de Parcelas:** Mapa interactivo y registro de invernaderos/parcelas con coordenadas GPS.
- **Monitoreo Meteorológico y Alertas:** Pronóstico en tiempo real (Open-Meteo API) según coordenadas de parcela y alertas preventivas (heladas, tareas próximas y stock crítico).
- **Agenda Agrícola e Inventario:** Planificación de labores por prioridad y control de insumos con umbrales de stock mínimo.
- **Analítica y Precios Referenciales:** Reportes de ingresos y producción filtrables por fecha con exportación a CSV.
- **Documentación OpenAPI / Swagger:** Interfaz interactiva disponible en `/apidocs`.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Axios, React Router DOM.
- **Backend:** Node.js, Express, MongoDB, Mongoose, JSON Web Token (JWT), bcryptjs, Swagger UI Express.

---

## ⚙️ Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd AgroSmart