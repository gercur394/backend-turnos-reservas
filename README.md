# Backend Turnos y Reservas

API REST para gestionar los servicios y las reservas de un sistema de turnos. Construida con Node.js (ESM), Express y FileSystem: los datos se guardan en archivos JSON, por lo que no se pierden al reiniciar el servidor.

La lógica de cada recurso vive en una clase manager (`ServiceManager` y `BookingManager`), y los endpoints se organizan en un router por recurso.

## Instalación

1. Clonar el repositorio
2. Instalar las dependencias:

```bash
npm install
```

3. Crear un archivo `.env` en la raíz a partir de `.env.example` y completar los valores (ver sección siguiente).

## Ejecución

```bash
npm start
```

Para desarrollo, con reinicio automático al guardar cambios:

```bash
npm run dev
```

El servidor queda disponible en `http://localhost:8080` (o en el puerto configurado en `.env`).

## Variables de entorno

| Variable   | Descripción              | Ejemplo       |
|------------|--------------------------|---------------|
| `PORT`     | Puerto del servidor      | `8080`        |
| `NODE_ENV` | Entorno de ejecución     | `development` |

Si falta alguna, la aplicación no inicia y muestra un mensaje indicando cuáles faltan.

## Estructura del proyecto

```
src/
  config/env.config.js         # Lectura y validación de variables de entorno
  managers/ServiceManager.js   # Lógica de los servicios
  managers/BookingManager.js   # Lógica de las reservas
  data/services.json           # Persistencia de servicios
  data/bookings.json           # Persistencia de reservas
  routes/services.router.js    # Endpoints de /api/services
  routes/bookings.router.js    # Endpoints de /api/bookings
  app.js                       # Configuración de Express
  server.js                    # Arranque del servidor
```

## Recurso `services`

| Campo         | Tipo    | Descripción                               |
|---------------|---------|-------------------------------------------|
| `id`          | number  | Identificador, generado automáticamente   |
| `name`        | string  | Nombre del servicio                       |
| `description` | string  | Descripción del servicio                  |
| `duration`    | number  | Duración en minutos                       |
| `price`       | number  | Precio                                    |
| `category`    | string  | Categoría                                 |
| `available`   | boolean | Si el servicio está disponible            |

### Endpoints de services

| Método | Ruta                 | Descripción                                          | Respuestas |
|--------|----------------------|------------------------------------------------------|------------|
| GET    | `/api/services`      | Lista los servicios (filtros opcionales)             | 200        |
| GET    | `/api/services/:sid` | Devuelve un servicio por id                          | 200, 404   |
| POST   | `/api/services`      | Crea un servicio con los datos del body              | 201, 400   |
| PUT    | `/api/services/:sid` | Actualiza un servicio (el id no se puede modificar)  | 200, 404   |
| DELETE | `/api/services/:sid` | Elimina un servicio                                  | 200, 404   |

Filtros de `GET /api/services`:

- `category`: por categoría (no distingue mayúsculas). Ejemplo: `/api/services?category=spa`
- `available`: por disponibilidad. Ejemplo: `/api/services?available=true`

## Recurso `bookings`

| Campo         | Tipo   | Descripción                                                              |
|---------------|--------|--------------------------------------------------------------------------|
| `id`          | number | Identificador, generado automáticamente                                  |
| `clientName`  | string | Nombre del cliente                                                       |
| `clientEmail` | string | Email del cliente                                                        |
| `date`        | string | Fecha de la reserva                                                      |
| `time`        | string | Hora de la reserva                                                       |
| `status`      | string | Estado de la reserva (por defecto `pending`)                             |
| `services`    | array  | Servicios de la reserva, con la forma `{ "service": id, "quantity": n }` |

### Endpoints de bookings

| Método | Ruta                                  | Descripción                                    | Respuestas |
|--------|---------------------------------------|------------------------------------------------|------------|
| POST   | `/api/bookings`                       | Crea una reserva con `services` vacío          | 201, 400   |
| GET    | `/api/bookings/:bid`                  | Devuelve una reserva por id                    | 200, 404   |
| POST   | `/api/bookings/:bid/services/:sid`    | Agrega un servicio a una reserva existente     | 200, 404   |

Detalles:

- Al crear una reserva, `id` y `services` se generan internamente: si se envían en el body, se ignoran. Si no se envía `status`, queda como `pending`.
- Al agregar un servicio, se valida que existan tanto la reserva como el servicio. Si el servicio ya estaba en la reserva, no se duplica: se incrementa su `quantity`.

### Ejemplo de body para `POST /api/bookings`

```json
{
  "clientName": "Ana Pérez",
  "clientEmail": "ana@mail.com",
  "date": "2026-11-20",
  "time": "15:30"
}
```

### Ejemplo de body para `POST /api/services`

```json
{
  "name": "Barba",
  "description": "Perfilado y recorte de barba",
  "duration": 20,
  "price": 5000,
  "category": "Peluquería",
  "available": true
}
```

## Pruebas

El archivo `pruebas.http` contiene pedidos de ejemplo para probar todos los endpoints. Se puede usar con la extensión REST Client de VS Code.