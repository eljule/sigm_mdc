# SIGM - Sistema Integrado de Gestión Municipal (MDC)
**Municipalidad Distrital de Castilla** • Fase 1: Infraestructura Docker y Portal Inicial de Lanzador de Módulos

---

## 🏛️ Arquitectura del Sistema

El proyecto está diseñado como un monorepositorio desacoplado con contenedores Docker para desarrollo ágil y recarga en caliente:

```
sigm_mdc/
├── docker-compose.yml                       # Orquestación de servicios (BD, Backend, Frontend, PgAdmin)
├── .env.example                             # Variables de entorno unificadas
├── .gitignore                               # Exclusiones de Git
│
├── backend/                                 # API REST en NestJS (Arquitectura Hexagonal)
│   ├── Dockerfile                           # Contenedor optimizado para desarrollo
│   ├── .dockerignore
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── common/dto/api-response.dto.ts
│       ├── config/database.config.ts
│       └── core/modules-registry/
│           ├── domain/                      # Capa de Dominio (Pura, cero dependencias)
│           │   ├── entities/module.entity.ts
│           │   └── ports/module.repository.port.ts
│           ├── application/                 # Capa de Aplicación (Casos de uso y DTOs)
│           │   ├── dtos/module-response.dto.ts
│           │   └── use-cases/get-active-modules.use-case.ts
│           ├── infrastructure/              # Capa de Infraestructura (TypeORM, REST, Seeders)
│           │   ├── adapters/typeorm-module.repository.ts
│           │   ├── controllers/module.controller.ts
│           │   └── persistence/
│           │       ├── entities/module.entity.ts
│           │       ├── mappers/module.mapper.ts
│           │       └── seeders/modules.seeder.ts
│           └── modules-registry.module.ts
│
└── frontend/                                # Aplicación Next.js 14+ (App Router) + Tailwind CSS
    ├── Dockerfile                           # Contenedor optimizado para desarrollo
    ├── .dockerignore
    ├── package.json
    ├── tailwind.config.ts
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx                         # Portal de inicio y lanzador de subsistemas
    └── src/
        ├── components/                      # Header, Banner, ModuleCard, Footer, ThemeToggle, Icons
        ├── services/modules.service.ts      # Fetch a NestJS con fallback local controlado
        └── types/module.ts                  # Tipos TypeScript estrictos
```

---

## 🐳 Despliegue con Docker Compose (Recomendado)

### 1. Preparar Variables de Entorno
Copia el archivo de ejemplo en la raíz:
```bash
cp .env.example .env
```

### 2. Levantar Todos los Servicios
```bash
docker-compose up --build
```
Los servicios quedarán expuestos en:
- **Frontend (Next.js)**: [http://localhost:3000](http://localhost:3000)
- **Backend (NestJS API)**: [http://localhost:4000](http://localhost:4000)
- **Endpoint de Módulos**: [http://localhost:4000/api/v1/modules](http://localhost:4000/api/v1/modules)
- **PgAdmin 4**: [http://localhost:5050](http://localhost:5050)
  * *Usuario:* `admin@castilla.gob.pe`
  * *Contraseña:* `AdminCastilla2026!`
- **PostgreSQL**: `localhost:5432` (`sigm_mdc_db`)

---

## 💻 Ejecución Manual sin Docker (Opcional)

### 1. Iniciar Base de Datos
```bash
docker-compose up -d database
```

### 2. Backend
```bash
cd backend
npm install
npm run start:dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Acceder a [http://localhost:3000](http://localhost:3000).
