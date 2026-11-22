# Backend Turnos y Reservas

**Pre-entrega 6:** migración de la persistencia de archivos JSON a MongoDB Atlas con Mongoose, manteniendo la arquitectura en capas y los endpoints.

API REST para gestionar los servicios y las reservas de un sistema de turnos. Construida con Node.js (ESM), Express y MongoDB Atlas (Mongoose). La API está organizada en capas (routers, controllers, services, repositories y DAO), y los DAO guardan los datos en MongoDB mediante modelos de Mongoose.

## Instalación

1. Clonar el repositorio
2. Instalar las dependencias:

```bash
npm install
```

3. Configurar MongoDB Atlas (ver sección siguiente).
4. Crear un archivo `.env` en la raíz a partir de `.env.example` y completar los valores.

## Configuración de MongoDB Atlas

El proyecto necesita una base de datos MongoDB. Para obtenerla:

1. Crear una cuenta y un cluster gratuito en [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Crear un usuario de base de datos (**Database Access**).
3. Permitir el acceso desde la IP donde se ejecuta el proyecto (**Network Access**).
4. Copiar la URI de conexión (**Connect → Drivers → Node.js**) y agregar el nombre de la base de datos antes del `?`. Por ejemplo: `mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/turnos-reservas?retryWrites=true&w=majority`
5. Pegarla en el archivo `.env` como valor de `MONGO_URI`.

Las colecciones se crean automáticamente al guardar el primer documento. La base empieza vacía: se pueden crear servicios con `POST /api/services`.

## Variables de entorno

| Variable    | Descripción                     | Ejemplo                                    |
|-------------|---------------------------------|--------------------------------------------|
| `PORT`      | Puerto del servidor             | `8080`                                     |
| `NODE_ENV`  | Entorno de ejecución            | `development`                              |
| `MONGO_URI` | URI de conexión a MongoDB Atlas | `mongodb+srv://<usuario>:<contraseña>@...` |

Si falta alguna, la aplicación no inicia y muestra un mensaje indicando cuáles faltan. El archivo `.env` contiene credenciales y **no se sube al repositorio**.

## Ejecución

```bash
npm start
```

Para desarrollo, con reinicio automático al guardar cambios:

```bash
npm run dev
```

El servidor queda disponible en `http://localhost:8080` (o en el puerto configurado en `.env`).

## Estructura del proyecto

```
src/
  config/env.config.js                  # Lectura y validación de variables de entorno
  config/db.config.js                   # Conexión a MongoDB
  models/service.model.js               # Modelo de Mongoose: services
  models/booking.model.js               # Modelo de Mongoose: bookings
  models/message.model.js               # Modelo de Mongoose: messages
  routes/services.router.js             # Endpoints de /api/services
  routes/bookings.router.js             # Endpoints de /api/bookings
  controllers/services.controller.js    # Controllers de services
  controllers/bookings.controller.js    # Controllers de bookings
  services/services.service.js          # Reglas de negocio de services
  services/bookings.service.js          # Reglas de negocio de bookings
  repositories/services.repository.js   # Acceso a datos de services
  repositories/bookings.repository.js   # Acceso a datos de bookings
  dao/services.dao.js                   # Acceso a MongoDB (modelo Service)
  dao/bookings.dao.js                   # Acceso a MongoDB (modelo Booking)
  app.js                                # Configuración de Express
  server.js                             # Conexión a la base y arranque del servidor
```

## Arquitectura en capas

Cada petición recorre las capas en este orden:

```
router → controller → service → repository → DAO → MongoDB
```

| Capa | Responsabilidad | No hace |
|---|---|---|
| Router | Define los endpoints y los conecta con su controller | Lógica |
| Controller | Lee `req`, llama al service y responde con `res` | Reglas de negocio |
| Service | Reglas de negocio: validaciones, valores por defecto, filtros y regla de `quantity` | Usar `req`/`res` ni acceder a la base |
| Repository | Métodos de acceso a datos | Reglas de negocio |
| DAO | Lee y escribe en MongoDB mediante los modelos de Mongoose | Reglas de negocio |

El controller lee `req.params`, `req.query` y `req.body`, y responde con `res.status().json()`.

### Persistencia con MongoDB

Los datos se guardan en tres colecciones (`services`, `bookings` y `messages`), definidas por los modelos de `src/models/`. En las reservas, cada servicio se guarda como una referencia (`ObjectId`) al servicio, junto con su cantidad.

La migración desde archivos JSON a MongoDB se resolvió cambiando principalmente el DAO, los modelos y la configuración. Los routers y casi todo el código de controllers y services se mantuvieron sin cambios, que es el beneficio de separar el acceso a los datos de las reglas de negocio.

### Ejemplo: agregar un servicio a una reserva

`POST /api/bookings/:bid/services/:sid`

1. El **router** deriva el pedido a `addServiceToBooking` del controller.
2. El **controller** lee `bid` y `sid` de `req.params` y llama al service.
3. El **service** comprueba que existan la reserva y el servicio, y aplica la regla de negocio: si el servicio ya estaba en la reserva, incrementa su `quantity`; si no, lo agrega con cantidad 1.
4. El **repository** recibe el pedido de guardar la reserva actualizada y se lo pasa al DAO.
5. El **DAO** guarda el resultado en la colección `bookings`.

### Manejo de resultados y errores

Las capas inferiores no conocen HTTP: avisan lo que pasó y el controller lo traduce a un código de estado.

- Si algo no existe (o el id tiene un formato inválido), se devuelve `null` o se lanza un error con el código `NOT_FOUND`, y el controller responde `404`.
- Si faltan campos obligatorios, el service lanza un error y el controller responde `400`.
- Si los datos no cumplen el schema (por ejemplo, un texto en `price`), el DAO lanza un error con el código `INVALID_DATA` y el controller responde `400`.

## Recurso `services`

| Campo         | Tipo     | Descripción                                     |
|---------------|----------|-------------------------------------------------|
| `_id`         | ObjectId | Identificador generado por MongoDB              |
| `name`        | string   | Nombre del servicio                             |
| `description` | string   | Descripción del servicio                        |
| `duration`    | number   | Duración en minutos                             |
| `price`       | number   | Precio                                          |
| `category`    | string   | Categoría                                       |
| `available`   | boolean  | Si el servicio está disponible                  |
| `createdAt`   | date     | Fecha de creación, generada automáticamente     |
| `updatedAt`   | date     | Fecha de modificación, generada automáticamente |

### Endpoints de services

| Método | Ruta                 | Descripción                                         | Respuestas    |
|--------|----------------------|-----------------------------------------------------|---------------|
| GET    | `/api/services`      | Lista los servicios (filtros opcionales)            | 200           |
| GET    | `/api/services/:sid` | Devuelve un servicio por id                         | 200, 404      |
| POST   | `/api/services`      | Crea un servicio con los datos del body             | 201, 400      |
| PUT    | `/api/services/:sid` | Actualiza un servicio (el id no se puede modificar) | 200, 400, 404 |
| DELETE | `/api/services/:sid` | Elimina un servicio                                 | 200, 404      |

Filtros de `GET /api/services`:

- `category`: por categoría (no distingue mayúsculas). Ejemplo: `/api/services?category=spa`
- `available`: por disponibilidad. Ejemplo: `/api/services?available=true`

Detalles:

- Al crear un servicio, el `_id` lo genera MongoDB: si se envía en el body, se ignora.
- Al actualizar un servicio, el `_id` no se puede modificar: si se envía en el body, se ignora.

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

## Recurso `bookings`

| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Identificador generado por MongoDB |
| `clientName` | string | Nombre del cliente |
| `clientEmail` | string | Email del cliente |
| `date` | string | Fecha de la reserva |
| `time` | string | Hora de la reserva |
| `status` | string | Estado de la reserva (por defecto `pending`) |
| `services` | array | Servicios de la reserva (ver detalle abajo) |

Cada elemento de `services` tiene esta forma:

```json
{ "service": "ObjectId del servicio", "quantity": 1 }
```

`service` es una referencia al `_id` del servicio, no una copia de sus datos.

### Endpoints de bookings

| Método | Ruta                               | Descripción                                | Respuestas |
|--------|------------------------------------|--------------------------------------------|------------|
| POST   | `/api/bookings`                    | Crea una reserva con `services` vacío      | 201, 400   |
| GET    | `/api/bookings/:bid`               | Devuelve una reserva por id                | 200, 404   |
| POST   | `/api/bookings/:bid/services/:sid` | Agrega un servicio a una reserva existente | 200, 404   |

Detalles:

- Al crear una reserva, `_id` y `services` se generan internamente: si se envían en el body, se ignoran. Si no se envía `status`, queda como `pending`.
- Al agregar un servicio, se valida que existan tanto la reserva como el servicio. Si el servicio ya estaba en la reserva, no se duplica: se incrementa su `quantity`.
- Los parámetros `:sid` y `:bid` son los `_id` que genera MongoDB (24 caracteres). Un id con formato inválido o inexistente responde `404`.

### Ejemplo de body para `POST /api/bookings`

```json
{
  "clientName": "Ana Pérez",
  "clientEmail": "ana@mail.com",
  "date": "2026-11-20",
  "time": "15:30"
}
```

## Recurso `messages`

Se define el modelo `Message` (`user`, `message`, y las fechas `createdAt` y `updatedAt` generadas automáticamente). La consigna no incluye endpoints para este recurso.

## Pruebas

El archivo `pruebas.http` contiene pedidos de ejemplo para probar los endpoints. Se puede usar con la extensión REST Client de VS Code.

Antes de usarlo, reemplazar los valores de `@serviceId` y `@bookingId` (arriba del archivo) por ids reales, que se obtienen de las respuestas de la API.