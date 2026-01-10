-- ========================================
-- GIMNASIO PEDAGÓGICO HUELLAS DEL SABER
-- Script de Creación de Base de Datos
-- ========================================

-- Usar la base de datos
USE gimnasio_huellas_saber;

-- Eliminar tablas si existen (en orden inverso por dependencias)
DROP TABLE IF EXISTS abonos;
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS recursos_educativos;
DROP TABLE IF EXISTS mensajes;
DROP TABLE IF EXISTS eventos_calendario;
DROP TABLE IF EXISTS horarios;
DROP TABLE IF EXISTS calificaciones_detalle;
DROP TABLE IF EXISTS calificaciones;
DROP TABLE IF EXISTS asistencia;
DROP TABLE IF EXISTS estudiantes_acudientes;
DROP TABLE IF EXISTS acudientes;
DROP TABLE IF EXISTS estudiantes;
DROP TABLE IF EXISTS profesores;
DROP TABLE IF EXISTS usuarios;

-- ========================================
-- TABLA: usuarios
-- ========================================
CREATE TABLE usuarios (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'profesor') NOT NULL,
  foto TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: profesores
-- ========================================
CREATE TABLE profesores (
  id VARCHAR(50) PRIMARY KEY,
  usuario_id VARCHAR(50),
  codigo VARCHAR(20),
  nombres VARCHAR(200) NOT NULL,
  apellidos VARCHAR(200) NOT NULL,
  tipo_identificacion ENUM('CC', 'CE', 'TI', 'Pasaporte'),
  numero_identificacion VARCHAR(50),
  fecha_nacimiento DATE,
  genero ENUM('Masculino', 'Femenino'),
  foto TEXT,

  -- Información de Contacto
  direccion TEXT,
  ciudad VARCHAR(100),
  telefono_fijo VARCHAR(20),
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(200) NOT NULL,
  email_personal VARCHAR(200),

  -- Contacto de Emergencia
  nombre_contacto_emergencia VARCHAR(200),
  telefono_emergencia VARCHAR(20),

  -- Formación Académica
  nivel_educacion ENUM('Bachiller', 'Técnico', 'Profesional', 'Especialización', 'Maestría', 'Doctorado'),
  titulo_profesional VARCHAR(200),
  institucion_educativa VARCHAR(200),
  especializacion_academica VARCHAR(200),
  anos_experiencia INT,

  -- Información Laboral
  especialidad VARCHAR(200) NOT NULL,
  fecha_ingreso DATE NOT NULL,
  tipo_contrato ENUM('Indefinido', 'Fijo', 'Prestación de Servicios'),
  salario_base DECIMAL(12, 2),
  estado ENUM('Activo', 'Inactivo', 'Vacaciones', 'Licencia') DEFAULT 'Activo',
  hoja_vida TEXT,

  -- Asignación
  niveles JSON, -- Array de niveles: ["Transición", "Jardín"]
  es_titular BOOLEAN DEFAULT FALSE,

  -- Otros
  activo BOOLEAN DEFAULT TRUE,
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_codigo (codigo),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: estudiantes
-- ========================================
CREATE TABLE estudiantes (
  id VARCHAR(50) PRIMARY KEY,
  codigo VARCHAR(20),
  tipo_identificacion ENUM('Tarjeta de Identidad', 'Registro Civil', 'Sin Documento'),
  numero_identificacion VARCHAR(50),
  nombres VARCHAR(200) NOT NULL,
  apellidos VARCHAR(200) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  genero ENUM('Masculino', 'Femenino'),
  nivel ENUM('Caminadores', 'Párvulos', 'Prejardín', 'Jardín', 'Transición') NOT NULL,
  estado ENUM('Activo', 'Retirado', 'Graduado', 'Suspendido') DEFAULT 'Activo',
  foto TEXT,

  -- Información de Contacto
  direccion TEXT,
  barrio VARCHAR(100),
  telefono_contacto VARCHAR(20),

  -- Información Médica
  tipo_sangre ENUM('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'),
  eps VARCHAR(200),
  alergias TEXT,
  condiciones_medicas TEXT,
  medicamentos TEXT,
  observaciones_medicas TEXT,

  -- Fechas
  fecha_ingreso DATE NOT NULL,
  fecha_matricula DATE,

  -- Otros
  activo BOOLEAN DEFAULT TRUE,
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_nivel (nivel),
  INDEX idx_estado (estado),
  INDEX idx_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: acudientes
-- ========================================
CREATE TABLE acudientes (
  id VARCHAR(50) PRIMARY KEY,
  tipo_acudiente ENUM('Padre', 'Madre', 'Abuelo', 'Abuela', 'Tío', 'Tía', 'Otro'),
  nombres VARCHAR(200) NOT NULL,
  apellidos VARCHAR(200),
  identificacion VARCHAR(50),
  parentesco VARCHAR(100) NOT NULL,
  telefono_principal VARCHAR(20) NOT NULL,
  telefono_secundario VARCHAR(20),
  email VARCHAR(200) NOT NULL,
  direccion TEXT NOT NULL,
  ocupacion VARCHAR(200),
  empresa VARCHAR(200),
  es_responsable_pago BOOLEAN DEFAULT FALSE,
  es_contacto_emergencia BOOLEAN DEFAULT FALSE,
  orden_contacto INT,
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: estudiantes_acudientes (Relación)
-- ========================================
CREATE TABLE estudiantes_acudientes (
  estudiante_id VARCHAR(50) NOT NULL,
  acudiente_id VARCHAR(50) NOT NULL,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (estudiante_id, acudiente_id),
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  FOREIGN KEY (acudiente_id) REFERENCES acudientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: asistencia
-- ========================================
CREATE TABLE asistencia (
  id VARCHAR(50) PRIMARY KEY,
  estudiante_id VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  presente BOOLEAN NOT NULL,
  estado ENUM('presente', 'ausente', 'justificado', 'retardo') NOT NULL,
  hora_llegada TIME,
  observaciones TEXT,
  registrado_por VARCHAR(50) NOT NULL,

  -- Justificación (denormalizada por simplicidad)
  justificacion_id VARCHAR(50),
  justificacion_motivo ENUM('Enfermedad', 'Cita Médica', 'Calamidad Doméstica', 'Viaje', 'Otro'),
  justificacion_descripcion TEXT,
  justificacion_documento TEXT,
  justificacion_fecha TIMESTAMP,
  justificacion_por VARCHAR(200),
  justificacion_aprobada BOOLEAN,

  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  FOREIGN KEY (registrado_por) REFERENCES usuarios(id),
  INDEX idx_fecha (fecha),
  INDEX idx_estudiante_fecha (estudiante_id, fecha),
  UNIQUE KEY unique_estudiante_fecha (estudiante_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: calificaciones
-- ========================================
CREATE TABLE calificaciones (
  id VARCHAR(50) PRIMARY KEY,
  estudiante_id VARCHAR(50) NOT NULL,
  periodo TINYINT NOT NULL CHECK (periodo BETWEEN 1 AND 4),
  año YEAR NOT NULL,
  observaciones_generales TEXT,
  registrado_por VARCHAR(50) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  FOREIGN KEY (registrado_por) REFERENCES usuarios(id),
  INDEX idx_estudiante (estudiante_id),
  INDEX idx_periodo_año (periodo, año),
  UNIQUE KEY unique_estudiante_periodo_año (estudiante_id, periodo, año)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: calificaciones_detalle
-- ========================================
CREATE TABLE calificaciones_detalle (
  id VARCHAR(50) PRIMARY KEY,
  calificacion_id VARCHAR(50) NOT NULL,
  dimension ENUM('Cognitiva', 'Comunicativa', 'Corporal', 'Socio-Afectiva', 'Estética', 'Ética') NOT NULL,
  valoracion ENUM('Superior', 'Alto', 'Básico', 'Bajo') NOT NULL,
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (calificacion_id) REFERENCES calificaciones(id) ON DELETE CASCADE,
  INDEX idx_calificacion (calificacion_id),
  UNIQUE KEY unique_calificacion_dimension (calificacion_id, dimension)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: horarios
-- ========================================
CREATE TABLE horarios (
  id VARCHAR(50) PRIMARY KEY,
  nivel ENUM('Caminadores', 'Párvulos', 'Prejardín', 'Jardín', 'Transición') NOT NULL,
  dia_semana TINYINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 5),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  materia VARCHAR(200) NOT NULL,
  tipo_actividad ENUM('Académica', 'Artística', 'Física', 'Descanso', 'Almuerzo', 'Otro'),
  profesor_id VARCHAR(50) NOT NULL,
  aula VARCHAR(50),
  color VARCHAR(20),
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE CASCADE,
  INDEX idx_nivel (nivel),
  INDEX idx_dia_semana (dia_semana),
  INDEX idx_profesor (profesor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: eventos_calendario
-- ========================================
CREATE TABLE eventos_calendario (
  id VARCHAR(50) PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha DATE NOT NULL,
  fecha_fin DATE,
  hora_inicio TIME,
  hora_fin TIME,
  tipo ENUM('Festivo', 'Reunión', 'Actividad', 'Evaluación', 'Ceremonia', 'Otro') NOT NULL,
  lugar VARCHAR(200),
  niveles JSON, -- Array de niveles
  responsable_id VARCHAR(50),
  prioridad ENUM('Normal', 'Importante', 'Urgente') DEFAULT 'Normal',
  enviar_recordatorio BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_fecha (fecha),
  INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: mensajes
-- ========================================
CREATE TABLE mensajes (
  id VARCHAR(50) PRIMARY KEY,
  remitente_id VARCHAR(50) NOT NULL,
  destinatario_id VARCHAR(50) NOT NULL,
  asunto VARCHAR(300) NOT NULL,
  contenido TEXT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  leido BOOLEAN DEFAULT FALSE,
  importante BOOLEAN DEFAULT FALSE,
  prioridad ENUM('Normal', 'Importante', 'Urgente') DEFAULT 'Normal',
  estado ENUM('Enviado', 'Entregado', 'Leído', 'No Entregado') DEFAULT 'Enviado',
  tiene_adjunto BOOLEAN DEFAULT FALSE,
  respondido_a VARCHAR(50),
  borrador BOOLEAN DEFAULT FALSE,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (remitente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (respondido_a) REFERENCES mensajes(id) ON DELETE SET NULL,
  INDEX idx_remitente (remitente_id),
  INDEX idx_destinatario (destinatario_id),
  INDEX idx_fecha (fecha),
  INDEX idx_leido (leido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: pagos
-- ========================================
CREATE TABLE pagos (
  id VARCHAR(50) PRIMARY KEY,
  numero_recibo VARCHAR(50) UNIQUE NOT NULL,
  estudiante_id VARCHAR(50) NOT NULL,
  concepto ENUM('Matrícula', 'Pensión', 'Materiales Didácticos', 'Uniforme Escolar', 'Transporte Escolar', 'Alimentación', 'Seguro Estudiantil', 'Salida Pedagógica', 'Certificados', 'Actividades Extracurriculares', 'Otro') NOT NULL,
  descripcion_concepto TEXT,
  monto DECIMAL(12, 2) NOT NULL,
  monto_pagado DECIMAL(12, 2) DEFAULT 0,
  saldo_pendiente DECIMAL(12, 2),
  fecha_vencimiento DATE NOT NULL,
  fecha_pago DATE,
  estado ENUM('pendiente', 'pagado', 'vencido', 'parcial') NOT NULL,
  periodo TINYINT CHECK (periodo BETWEEN 1 AND 4),
  mes ENUM('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'),
  año YEAR NOT NULL,
  metodo_pago ENUM('Efectivo', 'Transferencia Bancaria', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Cheque', 'Otro'),
  numero_referencia VARCHAR(100),
  observaciones TEXT,
  descuento DECIMAL(12, 2) DEFAULT 0,
  motivo_descuento TEXT,
  generar_recibo BOOLEAN DEFAULT TRUE,
  enviar_email BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  INDEX idx_estudiante (estudiante_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha_vencimiento (fecha_vencimiento),
  INDEX idx_numero_recibo (numero_recibo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: abonos
-- ========================================
CREATE TABLE abonos (
  id VARCHAR(50) PRIMARY KEY,
  pago_id VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  monto DECIMAL(12, 2) NOT NULL,
  metodo_pago ENUM('Efectivo', 'Transferencia Bancaria', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Cheque', 'Otro') NOT NULL,
  numero_referencia VARCHAR(100),
  observaciones TEXT,
  numero_recibo VARCHAR(50) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (pago_id) REFERENCES pagos(id) ON DELETE CASCADE,
  INDEX idx_pago (pago_id),
  INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: recursos_educativos
-- ========================================
CREATE TABLE recursos_educativos (
  id VARCHAR(50) PRIMARY KEY,
  titulo VARCHAR(300) NOT NULL,
  descripcion TEXT NOT NULL,
  tipo ENUM('documento', 'video', 'presentacion', 'imagen', 'enlace', 'plantilla') NOT NULL,
  url TEXT NOT NULL,
  nivel VARCHAR(50) NOT NULL, -- 'Caminadores', 'Todos los niveles', 'Solo Profesores', etc.
  materia VARCHAR(200) NOT NULL,
  categoria ENUM('Lenguaje y Comunicación', 'Matemáticas', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés', 'Música', 'Arte y Creatividad', 'Educación Física', 'Tecnología e Informática', 'Valores y Ética', 'Guías para Profesores', 'Documentos Administrativos') NOT NULL,
  profesor_id VARCHAR(50) NOT NULL,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tamaño VARCHAR(20),
  descargas INT DEFAULT 0,
  visualizaciones INT DEFAULT 0,
  destacado BOOLEAN DEFAULT FALSE,
  nuevo BOOLEAN DEFAULT TRUE,
  etiquetas JSON, -- Array de strings
  visible_profesores BOOLEAN DEFAULT TRUE,
  visible_padres BOOLEAN DEFAULT FALSE,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE CASCADE,
  INDEX idx_profesor (profesor_id),
  INDEX idx_tipo (tipo),
  INDEX idx_categoria (categoria),
  INDEX idx_nivel (nivel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Triggers para actualizar saldo_pendiente en pagos
-- ========================================
DELIMITER //

CREATE TRIGGER after_abono_insert
AFTER INSERT ON abonos
FOR EACH ROW
BEGIN
  UPDATE pagos
  SET
    monto_pagado = (SELECT COALESCE(SUM(monto), 0) FROM abonos WHERE pago_id = NEW.pago_id),
    saldo_pendiente = monto - (SELECT COALESCE(SUM(monto), 0) FROM abonos WHERE pago_id = NEW.pago_id),
    estado = CASE
      WHEN monto = (SELECT COALESCE(SUM(monto), 0) FROM abonos WHERE pago_id = NEW.pago_id) THEN 'pagado'
      WHEN (SELECT COALESCE(SUM(monto), 0) FROM abonos WHERE pago_id = NEW.pago_id) > 0 THEN 'parcial'
      WHEN fecha_vencimiento < CURDATE() THEN 'vencido'
      ELSE 'pendiente'
    END
  WHERE id = NEW.pago_id;
END//

DELIMITER ;

-- ========================================
-- Fin del script de esquema
-- ========================================
