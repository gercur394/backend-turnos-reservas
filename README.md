# Backend Turnos y Reservas

API REST para gestionar los servicios de un sistema de turnos y reservas. Construida con Node.js (ESM) y Express. La lógica de los servicios vive en la clase `ServiceManager`, que guarda los datos en un archivo JSON, y los endpoints se organizan en un router de Express.

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
  config/env.config.js       # Lectura y validación de variables de entorno
  managers/ServiceManager.js # Lógica de los servicios
  data/services.json         # Datos de los servicios
  routes/services.router.js  # Endpoints de /api/services
  app.js                     # Configuración de Express
  server.js                  # Arranque del servidor
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

## Endpoints

| Método | Ruta                     | Descripción                                              | Respuestas        |
|--------|--------------------------|----------------------------------------------------------|-------------------|
| GET    | `/api/services`          | Lista los servicios. Acepta filtros por query params     | 200               |
| GET    | `/api/services/:sid`     | Devuelve un servicio por id                              | 200, 404          |
| POST   | `/api/services`          | Crea un servicio con los datos del body                  | 201, 400          |
| PUT    | `/api/services/:sid`     | Actualiza un servicio (el id no se puede modificar)      | 200, 404          |
| DELETE | `/api/services/:sid`     | Elimina un servicio                                      | 200, 404          |

### Filtros en `GET /api/services`

- `category`: filtra por categoría (no distingue mayúsculas). Ejemplo: `/api/services?category=spa`
- `available`: filtra por disponibilidad (`true` o `false`). Ejemplo: `/api/services?available=true`
- Se pueden combinar: `/api/services?category=peluquería&available=true`

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

- El `id` se genera automáticamente: si se envía en el body, se ignora.
- Si falta algún campo, responde `400` indicando cuáles faltan.

### Ejemplo de body para `PUT /api/services/:sid`

Se envían solo los campos a modificar:

```json
{
  "price": 6000
}
```

El `id` no se puede modificar: si se envía en el body, se ignora.

### Archivo "pruebas.http"

Se deja creado el archivo "pruebas.http" donde se dejan las pruebas realizadas de GET, POST, PUT y DELETE.
Usando REST Client de VS Code.