# Sistema de Gestión Escolar - Gimnasio Pedagógico Huellas Del Saber

Sistema completo de gestión escolar desarrollado con React, TypeScript, Vite y Tailwind CSS.

## Características Principales

- **Sistema de Autenticación**: Login con roles (Admin/Profesor)
- **Dashboard Interactivo**: Estadísticas y métricas en tiempo real
- **Gestión de Estudiantes**: CRUD completo con manejo de acudientes
- **Gestión de Profesores**: Administración del personal docente
- **Control de Asistencia**: Registro diario de asistencia por nivel
- **Sistema de Calificaciones**: Evaluación en 6 dimensiones pedagógicas
- **Generación de Boletines**: Vista previa y descarga en PDF
- **Horarios y Calendario**: Gestión de horarios de clase y eventos
- **Mensajería Interna**: Comunicación entre usuarios del sistema
- **Gestión de Pagos**: Control de matrículas y pensiones
- **Recursos Educativos**: Biblioteca de materiales didácticos

## Dimensiones de Evaluación

1. Cognitiva
2. Comunicativa
3. Corporal
4. Socio-Afectiva
5. Estética
6. Ética

## Niveles Educativos

- Caminadores (1-2 años)
- Prejardín (2-3 años)
- Jardín (3-4 años)
- Párvulos (4-5 años)

## Tecnologías Utilizadas

- **React 18**: Biblioteca para interfaces de usuario
- **TypeScript**: Tipado estático para JavaScript
- **Vite**: Build tool y dev server ultra rápido
- **Tailwind CSS**: Framework CSS utility-first
- **React Router DOM**: Navegación entre páginas
- **jsPDF**: Generación de documentos PDF
- **html2canvas**: Captura de HTML para PDF
- **Lucide React**: Librería de iconos

## Colores Institucionales

- Verde Principal: `#008751`
- Rojo Acento: `#C1272D`
- Blanco: `#FFFFFF`

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## Credenciales de Demo

### Administrador
- Email: `admin@huellasdelsaber.edu.co`
- Password: `admin123`

### Profesor
- Email: `profesor@huellasdelsaber.edu.co`
- Password: `profesor123`

## Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
│   ├── Layout.tsx    # Layout principal con navegación
│   └── ProtectedRoute.tsx
├── contexts/         # Contextos de React
│   └── AuthContext.tsx
├── data/             # Datos mock
│   └── mockData.ts
├── pages/            # Páginas de la aplicación
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Estudiantes.tsx
│   ├── Profesores.tsx
│   ├── Asistencia.tsx
│   ├── Calificaciones.tsx
│   ├── Boletines.tsx
│   ├── Horarios.tsx
│   ├── Mensajes.tsx
│   ├── Pagos.tsx
│   └── Recursos.tsx
├── types/            # Definiciones de TypeScript
│   └── index.ts
├── App.tsx           # Componente principal
├── main.tsx          # Punto de entrada
└── index.css         # Estilos globales
```

## Funcionalidades por Módulo

### Dashboard
- Tarjetas de estadísticas generales
- Gráficos de estudiantes por nivel
- Estado de pagos
- Alertas y notificaciones

### Estudiantes
- Crear, editar, ver y eliminar estudiantes
- Gestión de múltiples acudientes por estudiante
- Búsqueda y filtros por nivel
- Información detallada de cada estudiante

### Profesores
- CRUD completo de profesores
- Asignación de niveles
- Información de contacto y especialidades
- Vista en tarjetas responsive

### Asistencia
- Registro diario por nivel
- Estadísticas de asistencia en tiempo real
- Observaciones para ausencias
- Porcentaje de asistencia

### Calificaciones
- Calificación por 6 dimensiones pedagógicas
- 4 períodos académicos
- Observaciones por dimensión y generales
- Valoraciones: Superior, Alto, Básico, Bajo

### Boletines
- Vista previa del boletín completo
- Generación dinámica de PDF
- Información del estudiante y calificaciones
- Estadísticas de asistencia
- Descarga personalizada

### Horarios
- Vista de horarios por nivel
- Calendario de eventos
- Clasificación de eventos (académico, festivo, reunión)

### Mensajería
- Bandeja de entrada y enviados
- Notificaciones de mensajes no leídos
- Interfaz similar a correo electrónico

### Pagos
- Seguimiento de pagos (pagado, pendiente, vencido)
- Estadísticas financieras
- Búsqueda y filtros

### Recursos
- Biblioteca de materiales educativos
- Diferentes tipos: documentos, videos, imágenes, enlaces
- Filtros por tipo, nivel y materia
- Sistema de carga de recursos

## Información Institucional

**Gimnasio Pedagógico Huellas Del Saber**
- Dirección: Calle 24A #34 Bis-35, Neiva, Colombia
- Teléfono: 316 7927255
- Sistema de 4 períodos académicos por año

## Notas de Desarrollo

- Los datos actuales son simulados (mock data)
- El sistema está preparado para conectarse a una API REST
- Las funcionalidades de subida de archivos están como placeholders
- La generación de PDF usa html2canvas para capturar el contenido

## Próximas Mejoras

- Integración con backend/API
- Sistema de notificaciones push
- Reportes y estadísticas avanzadas
- Exportación de datos a Excel
- Sistema de permisos granular
- Módulo de comunicación con padres (WhatsApp/Email)
- Gestión de inventario y activos

## Licencia

Proyecto desarrollado para el Gimnasio Pedagógico Huellas Del Saber.

---

Desarrollado con ❤️ para mejorar la gestión educativa
