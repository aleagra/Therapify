# Therapify

Aplicación web orientada a centralizar el directorio de profesionales de la psicología de la ciudad en una sola plataforma. Permite buscar psicólogos, consultar perfiles y especialidades, y gestionar la reserva de turnos online.

## Demo

La aplicación cliente se encuentra desplegada en: [https://therapifyy.vercel.app](https://therapifyy.vercel.app)

## Funcionalidades

- **Directorio de profesionales:** Búsqueda, filtrado y visualización detallada del perfil de cada psicólogo (especialidades, valoraciones y datos de contacto).
- **Gestión de turnos y calendario:** Visualización de días y horarios disponibles para agendar o cancelar sesiones.
- **Autenticación y roles:** Registro e inicio de sesión de usuarios y profesionales con verificación de correo, recuperación de contraseña y rutas protegidas por `Guards`.
- **Perfiles diferenciados:** Vistas y paneles dedicados tanto para pacientes (`profile`) como para psicólogos (`profile-doctor`).
- **Sistema de reseñas:** Registro de calificaciones y opiniones de pacientes sobre los profesionales.
- **Notificaciones contextuales:** Avisos en tiempo real mediante `ngx-sonner`.

## Stack Tecnológico

- **Framework:** Angular 19
- **Librería de componentes:** Angular Material y Angular CDK
- **Lenguaje:** TypeScript
- **Estilos:** CSS / Material Design
- **Programación reactiva:** RxJS
- **Notificaciones:** ngx-sonner
- **Testing:** Jasmine y Karma

## Backend y Arquitectura

Este repositorio contiene el código del **frontend** de la plataforma. La API REST y la lógica de negocio se encuentran desacopladas en su propio repositorio:

- **Repositorio Backend:** [Therapify-Backend](https://github.com/aleagra/Therapify-Backend) (Java / Spring Boot / PostgreSQL / Docker)
- **API en producción:** `https://therapify-backend.onrender.com`
- **API en desarrollo local:** `http://localhost:8080`

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/aleagra/Therapify.git
cd Therapify/therapify
```

2. Instalar dependencias:

```bash
npm install
```

3. Configuración de entornos:

Los endpoints de la API se configuran en `src/environments/`:

- `src/environments/environment.ts` (desarrollo): `http://localhost:8080`
- `src/environments/environment.prod.ts` (producción): `https://therapify-backend.onrender.com`

4. Iniciar el servidor de desarrollo:

```bash
npm start
# o con Angular CLI:
# ng serve
```

La aplicación estará disponible en `http://localhost:4200`.

## Estructura de Carpetas

```text
therapify/
├── src/
│   ├── app/
│   │   ├── auth-layout/       # Layouts para flujos de autenticación
│   │   ├── calendar/          # Vistas y componentes de calendario
│   │   ├── doctor-card/       # Tarjeta resumen de profesional
│   │   ├── doctor-detail/     # Vista detallada de perfil profesional
│   │   ├── doctors/           # Listado principal y filtros de psicólogos
│   │   ├── guards/            # Guardas de ruta para protección de accesos
│   │   ├── login/             # Inicio de sesión
│   │   ├── private-layout/    # Layout para usuarios autenticados
│   │   ├── profile/           # Perfil y configuración de paciente
│   │   ├── profile-doctor/    # Perfil y administración de psicólogo
│   │   ├── public-layout/     # Layout público para navegación abierta
│   │   ├── register/          # Registro de cuentas
│   │   ├── reviews/           # Componentes de reseñas y valoraciones
│   │   ├── services/          # Servicios HTTP para consumo del backend
│   │   ├── turnos/            # Módulo de solicitud y gestión de turnos
│   │   ├── verify-email/      # Validación y confirmación de cuenta
│   │   └── app.routes.ts      # Definición y mapeo de rutas
│   ├── environments/          # Variables de entorno (dev / prod)
│   ├── assets/                # Imágenes y recursos estáticos
│   └── styles.css             # Estilos globales y tema Material
├── angular.json               # Configuración del workspace Angular
└── package.json               # Dependencias y scripts de ejecución
```

## Licencia

Este proyecto está bajo la Licencia MIT.
