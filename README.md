# Demo Dashboard

Panel de administración full-stack para la gestión de especialidades, niveles, competencias, personas y evaluaciones.

🌐 **Producción:** [https://demo-dashboard.danielsoltero.com/](https://demo-dashboard.danielsoltero.com/)

---

## Índice

1. [Tecnologías](#tecnologías)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Entidades y esquema de base de datos](#entidades-y-esquema-de-base-de-datos)
4. [Modelo Entidad-Relación](#modelo-entidad-relación)
5. [Migraciones de base de datos](#migraciones-de-base-de-datos)
6. [API](#api)
7. [Funcionalidades del frontend](#funcionalidades-del-frontend)
8. [Funcionamiento general](#funcionamiento-general)
9. [Puesta en marcha](#puesta-en-marcha)
10. [Despliegue en producción](#despliegue-en-producción)

---

## Tecnologías

### Backend
| Capa | Tecnología |
|------|-----------|
| Lenguaje | PHP 8.1+ |
| Framework | Symfony 6.4 |
| ORM | Doctrine ORM 3 |
| Base de datos | PostgreSQL |
| Autenticación | JWT (`lexik/jwt-authentication-bundle`) |
| CORS | `nelmio/cors-bundle` |

### Frontend
| Capa | Tecnología |
|------|-----------|
| Lenguaje | TypeScript |
| Framework | Angular 21 |
| Estilos | SCSS + CSS custom properties (theming) |
| Componentes | Angular Material (table, sort, paginator, icons) |
| Alertas | SweetAlert2 |
| HTTP | `HttpClient` + interceptor JWT |

---

## Estructura del proyecto

```
demo-dashboard/
├── src/                        # Backend Symfony
│   ├── Controller/
│   │   ├── ApiController.php   # Controlador base con helpers de respuesta
│   │   ├── auth/
│   │   │   └── AuthController.php
│   │   └── data/               # Controladores CRUD (Speciality, Level, Competency, Person)
│   ├── Entity/
│   │   ├── auth/
│   │   │   └── Admin.php
│   │   └── data/
│   │       ├── Speciality.php
│   │       ├── Level.php
│   │       ├── Competency.php
│   │       ├── Person.php
│   │       ├── Evaluation.php
│   │       └── Type.php
│   ├── Repository/             # Repositorios Doctrine por entidad
│   ├── Service/
│   │   ├── CrudServiceInterface.php
│   │   ├── auth/AuthService.php
│   │   └── data/               # SpecialityService, LevelService, CompetencyService, PersonService
│   └── Kernel.php
├── config/                     # Configuración Symfony
├── migrations/                 # Migraciones Doctrine (ver sección)
├── frontend/                   # Frontend Angular
│   └── src/app/
│       ├── core/
│       │   ├── guards/         # AuthGuard, GuestGuard
│       │   ├── interceptors/   # JWT interceptor
│       │   ├── models/         # Interfaces TypeScript (SpecialityModel, LevelModel, …)
│       │   └── services/data/  # SpecialityService, LevelService, CompetencyService, PersonService
│       ├── pages/content/
│       │   ├── base/           # Layout con navbar + modal + router dinámico
│       │   └── _components/
│       │       ├── specialities/  (data-table + form)
│       │       ├── levels/        (data-table + form)
│       │       ├── competencies/  (data-table + form)
│       │       └── people/        (data-table + form)
│       └── shared/
│           ├── navbar/         # Barra lateral con toggle dark/light mode
│           ├── modal/          # Modal genérico con ng-content
│           ├── data-table/     # Estilos compartidos de todas las tablas
│           └── form/           # Estilos compartidos de todos los formularios
└── public/
    └── index.php               # Punto de entrada Symfony
```

---

## Entidades y esquema de base de datos

### `Admin`
Administrador del sistema. Se usa para la autenticación JWT.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int | Clave primaria |
| `name` | string | Nombre completo |
| `email` | string (unique) | Email de acceso |
| `password` | string | Contraseña hasheada |
| `active` | bool | Estado de la cuenta |

---

### `Speciality`
Especialidad o área de conocimiento. Agrupa niveles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int | Clave primaria |
| `name` | string | Nombre de la especialidad |
| `description` | string | Descripción |
| `active` | bool | Estado |

---

### `Level`
Nivel de seniority dentro de una especialidad.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int | Clave primaria |
| `name` | string | Nombre del nivel |
| `description` | string | Descripción |
| `percentage` | int | Porcentaje de cumplimiento requerido (0–100) |
| `speciality_id` | FK → Speciality | Especialidad a la que pertenece |

> **Relaciones ORM:** `ManyToOne` a `Speciality`; `OneToMany` inverso a `Competency` (sin columna extra en BD); `OneToMany` inverso a `Person`.
> `jsonSerialize()` incluye `competency_count` (calculado en memoria vía colección Doctrine).

---

### `Competency`
Competencia técnica o de comportamiento asociada a un nivel.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int | Clave primaria |
| `name` | string | Nombre de la competencia |
| `attribute` | string | Atributo o categoría |
| `weight` | int | Peso relativo en la evaluación |
| `active` | bool | Estado |
| `level_id` | FK → Level | Nivel al que pertenece (`ManyToOne`) |
| `type_id` | FK → Type | Tipo de competencia |

---

### `Person`
Persona/empleado que puede ser evaluado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int | Clave primaria |
| `name` | string | Nombre completo |
| `evaluator` | int \| null | ID de otro `Person` que actúa como evaluador |
| `active` | bool | Estado |
| `level_id` | FK → Level | Nivel asignado |

---

### `Evaluation`
Registro de evaluación de una persona en un momento dado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int | Clave primaria |
| `person_id` | FK → Person | Persona evaluada |
| `created_at` | DateTimeImmutable | Fecha de creación |
| `progress` | int | Porcentaje de progreso |
| `competencies` | json | Snapshot de competencias evaluadas |

---

### `Type`
Catálogo genérico de tipos de competencia.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int | Clave primaria |
| `name` | string | Nombre del tipo (ej. Técnica, Soft, Liderazgo) |

---

## Modelo Entidad-Relación

```mermaid
erDiagram
    SPECIALITY {
        int id PK
        string name
        string description
        bool active
    }
    LEVEL {
        int id PK
        string name
        string description
        int percentage
        int speciality_id FK
    }
    COMPETENCY {
        int id PK
        string name
        string attribute
        int weight
        bool active
        int level_id FK
        int type_id FK
    }
    PERSON {
        int id PK
        string name
        int evaluator
        bool active
        int level_id FK
    }
    EVALUATION {
        int id PK
        int person_id FK
        datetime created_at
        int progress
        json competencies
    }
    ADMIN {
        int id PK
        string name
        string email
        string password
        bool active
    }
    TYPE {
        int id PK
        string name
    }

    SPECIALITY ||--o{ LEVEL      : "tiene"
    LEVEL      ||--o{ COMPETENCY : "define"
    LEVEL      ||--o{ PERSON     : "tiene"
    TYPE       ||--o{ COMPETENCY : "clasifica"
    PERSON     ||--o{ EVALUATION : "es evaluado en"
    PERSON     }o--o| PERSON     : "evaluador"
```

---

## Migraciones de base de datos

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| `Version20260303182323` | 03/03/2026 | Creación de tablas iniciales: `speciality`, `level`, `competency`, `person`, `evaluation`, `type`, `admin` |
| `Version20260303210719` | 03/03/2026 | Ajustes de tipos y constraints iniciales |
| `Version20260305120000` | 05/03/2026 | Cambia `competency.level_id` de `OneToOne` (UNIQUE) a `ManyToOne` (INDEX no único), permitiendo múltiples competencias por nivel |

> **Nota:** La relación inversa `OneToMany` añadida en `Level.php` hacia `Competency` es solo una colección PHP de Doctrine y **no genera ninguna migración** (el FK `level_id` ya existía en la tabla `competency`).

---

## API

Todas las rutas tienen prefijo `/api`. Las rutas protegidas requieren `Authorization: Bearer <JWT>`.

### Autenticación

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/v1/login` | Login con email y contraseña | No |
| `POST` | `/api/auth/v1/logout` | Cierre de sesión | Sí |

### Especialidades

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/specialities` | Listar todas |
| `GET` | `/api/specialities/{id}` | Obtener por ID |
| `POST` | `/api/specialities` | Crear |
| `PUT` | `/api/specialities/{id}` | Actualizar |
| `DELETE` | `/api/specialities/{id}` | Eliminar |

### Niveles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/levels` | Listar todos (incluye `competency_count`) |
| `GET` | `/api/levels/{id}` | Obtener por ID |
| `POST` | `/api/levels` | Crear |
| `PUT` | `/api/levels/{id}` | Actualizar |
| `DELETE` | `/api/levels/{id}` | Eliminar |

### Competencias

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/competencies` | Listar todas |
| `GET` | `/api/competencies/{id}` | Obtener por ID |
| `POST` | `/api/competencies` | Crear |
| `PUT` | `/api/competencies/{id}` | Actualizar |
| `DELETE` | `/api/competencies/{id}` | Eliminar |

### Personas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/people` | Listar todas |
| `GET` | `/api/people/{id}` | Obtener por ID |
| `POST` | `/api/people` | Crear |
| `PUT` | `/api/people/{id}` | Actualizar |
| `DELETE` | `/api/people/{id}` | Eliminar |

**Ejemplo de respuesta `GET /api/levels`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Junior",
      "description": "Nivel inicial",
      "percentage": 30,
      "speciality_id": 2,
      "competency_count": 5
    }
  ]
}
```

### Formato de error estándar
```json
{
  "success": false,
  "error": {
    "title": "UNAUTHORIZED",
    "message": "Credenciales incorrectas",
    "code": 401
  }
}
```

---

## Funcionalidades del frontend

### Dark / Light mode
- Botón en la barra lateral (navbar) alterna entre modo claro y oscuro.
- El tema se persiste en `localStorage` y se aplica añadiendo/quitando la clase `body.dark`.
- CSS custom properties (`:root` / `body.dark`) en `styles.scss` controlan todos los colores. Los estilos compartidos de tablas, modales y formularios usan `var(--*)`.

### Módulos CRUD
Cada entidad dispone de:
- **Data-table** con búsqueda por texto, paginación, ordenación por cualquier columna y menú de acciones (editar / eliminar con confirmación SweetAlert2).
- **Form** embebido en modal genérico (crear / editar con valores pre-rellenados).
- **Toggle activo/inactivo** directo desde la tabla (actualiza en BD con rollback optimista si falla).

### Tablas — características específicas

| Tabla | Características destacadas |
|-------|---------------------------|
| **Especialidades** | Nombre mostrado como badge con color propio por índice (paleta de 8 colores cíclica) |
| **Niveles** | Filtro por especialidad (chips coloreados), columna `Competencias` (count), badge de especialidad con color |
| **Competencias** | Filtro por especialidad (select) + filtro por tipo (chips), badges de tipo coloreados |
| **Personas** | Filtro por especialidad (chips coloreados), columna evaluador (resuelto a nombre), badge de especialidad con color, barra de progreso del `percentage` del nivel asignado |

### Paleta de colores de especialidades
Los colores se asignan por posición (índice % 8) y son consistentes en chips de filtro, badges de tabla y la tabla de especialidades:

| Índice | Color |
|--------|-------|
| 0 | Púrpura (`#7c3aed`) |
| 1 | Teal (`#0d9488`) |
| 2 | Ámbar (`#d97706`) |
| 3 | Azul (`#1d4ed8`) |
| 4 | Rosa (`#e11d48`) |
| 5 | Verde (`#16a34a`) |
| 6 | Violeta (`#9333ea`) |
| 7 | Naranja (`#ea580c`) |

---

## Funcionamiento general

1. **Login**: el administrador accede a `/login`. El frontend envía las credenciales al backend, que valida y devuelve un JWT.
2. **Persistencia de sesión**: el token y los datos del admin se guardan en `localStorage`. Un signal de Angular mantiene el estado reactivo en la app.
3. **Protección de rutas**: un `AuthGuard` protege todas las rutas del panel. Un `GuestGuard` redirige al dashboard si ya hay sesión activa al acceder a `/login`.
4. **Interceptor JWT**: todas las peticiones HTTP salientes incluyen automáticamente el header `Authorization: Bearer <token>`.
5. **Panel**: la ruta de contenido usa un componente `base` dinámico que, según la ruta activa, renderiza la tabla y el formulario del módulo correspondiente.
6. **CRUD**: cada módulo dispone de una `data-table` para listar registros y un `form` embebido en un modal genérico para crear/editar.
7. **Reactividad**: los servicios Angular usan signals (`refreshTrigger`, `editing`) para que la tabla se recargue automáticamente al crear, editar o eliminar sin necesidad de recargar la página.

---

## Puesta en marcha

### Backend
```bash
composer install
# Configurar DATABASE_URL y JWT_SECRET_KEY en .env.local
php bin/console doctrine:migrations:migrate
symfony server:start
```

### Frontend
```bash
cd frontend
npm install
ng serve -o
```

La app frontend estará disponible en `http://localhost:4200` y apuntará al backend en la URL configurada en `src/app/env/env.ts`.

---

## Despliegue en producción

### URLs
| Servicio | URL |
|---------|-----|
| Backend (API) | `https://demo-dashboard.danielsoltero.com/server/api/...` |
| Frontend | `https://demo-dashboard.danielsoltero.com/` (o subdirectorio) |

### Estructura de archivos en el servidor
El servidor tiene el document root apuntando a la **raíz del proyecto** (no a `public/`). El routing funciona así:

```
petición → /.htaccess → redirige a /server/public/
                       → /server/public/.htaccess (RewriteBase /server/)
                       → index.php → Symfony
```

### Archivos de configuración de Apache
- **`.htaccess`** (raíz): redirige todo el tráfico a `public/` y bloquea el acceso a `src/`, `config/`, `migrations/`, `vendor/`, `var/`, archivos `.env`, `.yaml`, `.sql`, etc.
- **`public/.htaccess`**: front controller de Symfony con `RewriteBase /server/`.
- **`frontend/public/.htaccess`**: SPA fallback de Angular (redirige todas las rutas a `index.html`). Se copia automáticamente al build (`dist/`).

### Variables de entorno de producción (`.env.prod`)
```dotenv
APP_ENV=prod
APP_DEBUG=0
APP_BASE_URL=https://demo-dashboard.danielsoltero.com/server
DATABASE_URL="mysql://usuario:contraseña@127.0.0.1:3306/nombre_bbdd?serverVersion=8.0&charset=utf8mb4"
CORS_ALLOW_ORIGIN='^https?://(demo-dashboard\.danielsoltero\.com)(:[0-9]+)?$'
```

> La contraseña debe tener los caracteres especiales URL-encodeados (`?` → `%3F`, `:` → `%3A`).

### Base de datos en producción
El servidor de hosting usa **MySQL**. El archivo [migration/demo_dashboard_mysql.sql](migration/demo_dashboard_mysql.sql) contiene el dump convertido de PostgreSQL a MySQL con todas las claves primarias, índices y foreign keys. Importarlo desde phpMyAdmin.

### Build del frontend
```bash
cd frontend
ng build --configuration production
```
El output se genera en `frontend/dist/frontend/browser/`. Subir su contenido al directorio del frontend en el servidor.

### Limpiar caché en producción
Sin acceso CLI, eliminar manualmente la carpeta `var/cache/prod/` del servidor.
Con acceso CLI:
```bash
php bin/console cache:clear --env=prod
```

### Utilidades de servidor
- **`public/unzip.php`**: descomprime archivos `.zip` subidos al servidor directamente desde el navegador. Detecta automáticamente los `.zip` en `public/` y extrae su contenido en la misma carpeta.