# Mendez Barbershop — Backend

API multitenant para gestión de barberías (catálogo, personal/sillas, ventas/tickets, dashboards) construida con NestJS, TypeORM y PostgreSQL, siguiendo arquitectura DDD (domain / application / infrastructure) y principios SOLID.

## Arquitectura

- **Multitenant por código de establecimiento**: cada barbería (`Barbershop`) tiene un código único (`code`, ej. `mendez`). El cliente lo envía en el header `X-Tenant-Code` en cada request; `TenantMiddleware` lo resuelve antes de que llegue a cualquier controller. Si no se envía el header, la request queda en contexto `super_admin` (sin tenant).
- **Capas por módulo** (`src/modules/<contexto>/`):
  - `domain/` — entidades de negocio (clases planas, sin TypeORM) e interfaces de repositorio (puertos).
  - `application/` — casos de uso (una clase por acción) y DTOs.
  - `infrastructure/persistence/` — entidades TypeORM + implementación del repositorio (adaptador). Es la única capa acoplada al ORM; cambiarlo no debería afectar `domain` ni `application`.
  - `infrastructure/http/` — controllers, que solo orquestan casos de uso.
- **Seguridad**: JWT (access 15m + refresh 7d con rotación y hash en DB), bcrypt, `helmet`, rate limiting (`@nestjs/throttler`), `ValidationPipe` global, guards de tenant y rol.

## Requisitos

- Node.js 20+
- PostgreSQL accesible (host/usuario/password/db)

## Setup

1. Copiar `.env.example` a `.env` y completar con tus credenciales de PostgreSQL y los secretos JWT:

   ```bash
   cp .env.example .env
   ```

   Genera secretos JWT con:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Crear la base de datos (si no existe) y correr las migraciones:

   ```bash
   npm run migration:run
   ```

4. Crear el primer usuario `super_admin` (administra el alta de barberías). Puedes pasar los datos por argumento:

   ```bash
   npm run seed:super-admin -- admin@tusistema.com "contraseñaSegura123" "Nombre Admin"
   ```

   O definir `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` / `SUPER_ADMIN_NAME` (opcional) en tu `.env` y correr el script sin argumentos:

   ```bash
   npm run seed:super-admin
   ```

   Los argumentos de línea de comandos, si se pasan, tienen prioridad sobre las variables de entorno.

5. Levantar el servidor:

   ```bash
   npm run start:dev
   ```

## Flujo multitenant

- El `super_admin` se loguea sin enviar el header `X-Tenant-Code` y usa `POST /api/tenants` para crear barberías (cada una con su `code` único, ej. `mendez`).
- Cada barbería creada necesita su propio admin: `POST /api/tenants/:id/admin` (solo super_admin) crea el primer admin de esa barbería.
- Los usuarios (admin/barbero) de una barbería se loguean enviando `X-Tenant-Code: <code>` en el header (`POST /api/auth/login`); el JWT resultante queda atado a ese `barbershopId` y es rechazado si se usa con un código de tenant distinto.

## Migraciones

```bash
npm run migration:generate -- src/database/migrations/NombreDescriptivo
npm run migration:run
npm run migration:revert
```

## Endpoints principales

| Recurso | Rutas | Rol |
|---|---|---|
| Tenants | `POST/GET /api/tenants`, `PATCH /api/tenants/:id/active` | super_admin |
| Auth | `POST /api/auth/login`, `POST /api/auth/refresh` | público |
| Users | `POST/GET /api/users`, `PATCH /api/users/:id/active` | admin |
| Services | `GET /api/services`, `POST/PATCH ...` | admin (lectura: admin+barbero) |
| Products | `GET /api/products`, `POST/PATCH ...` | admin (lectura: admin+barbero) |
| Stations | `GET /api/stations`, `POST /api/stations`, `PATCH /api/stations/:id/assign\|release` | admin |
| Tickets | `POST/GET /api/tickets` | admin, barbero |
| Dashboard | `GET /api/dashboard/admin`, `GET /api/dashboard/barber` | admin / barbero respectivamente |

## Notas de seguridad pendientes de revisión

- `multer` (dependencia transitiva de `@nestjs/platform-express`) tiene advisories de DoS conocidos; no se usa upload de archivos todavía, pero revisar antes de añadir esa funcionalidad (`npm audit`).
