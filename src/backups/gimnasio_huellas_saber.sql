-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-11-2025 a las 14:09:00
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gimnasio_huellas_saber`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `acudientes`
--

CREATE TABLE `acudientes` (
  `id` int(11) NOT NULL,
  `estudiante_id` int(11) NOT NULL,
  `tipo_acudiente` enum('padre','madre','abuelo','abuela','tio','tia','otro') NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `identificacion` varchar(20) DEFAULT NULL,
  `telefono_principal` varchar(20) NOT NULL,
  `telefono_secundario` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `ocupacion` varchar(100) DEFAULT NULL,
  `empresa` varchar(100) DEFAULT NULL,
  `es_responsable_pago` tinyint(1) DEFAULT 0,
  `es_contacto_emergencia` tinyint(1) DEFAULT 0,
  `orden_contacto` int(11) DEFAULT 1 CHECK (`orden_contacto` between 1 and 5),
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Padres o responsables de los estudiantes';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `id` int(11) NOT NULL,
  `estudiante_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('presente','ausente','justificado','retardo') DEFAULT 'presente',
  `hora_llegada` time DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `registrado_por` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro diario de asistencia';

--
-- Disparadores `asistencia`
--
DELIMITER $$
CREATE TRIGGER `trg_asistencia_before_insert` BEFORE INSERT ON `asistencia` FOR EACH ROW BEGIN
    IF NEW.fecha > CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La fecha de asistencia no puede ser futura.';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_asistencia_before_update` BEFORE UPDATE ON `asistencia` FOR EACH ROW BEGIN
    IF NEW.fecha > CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La fecha de asistencia no puede ser futura.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificaciones`
--

CREATE TABLE `calificaciones` (
  `id` int(11) NOT NULL,
  `estudiante_id` int(11) NOT NULL,
  `dimension_id` int(11) NOT NULL,
  `indicador_id` int(11) DEFAULT NULL,
  `periodo_id` int(11) NOT NULL,
  `valoracion` enum('superior','alto','basico','bajo') NOT NULL,
  `observaciones` text DEFAULT NULL,
  `fortalezas` text DEFAULT NULL,
  `aspectos_mejorar` text DEFAULT NULL,
  `registrado_por` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Evaluaciones por dimensión y período';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_recursos`
--

CREATE TABLE `categorias_recursos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `icono` varchar(50) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Categorías para organizar recursos';

--
-- Volcado de datos para la tabla `categorias_recursos`
--

INSERT INTO `categorias_recursos` (`id`, `nombre`, `descripcion`, `icono`, `orden`, `activo`, `created_at`) VALUES
(1, 'Circulares', 'Comunicados oficiales del colegio', NULL, 1, 1, '2025-11-16 03:58:20'),
(2, 'Guías de Trabajo', 'Material didáctico para actividades', NULL, 2, 1, '2025-11-16 03:58:20'),
(3, 'Formatos', 'Formularios y documentos descargables', NULL, 3, 1, '2025-11-16 03:58:20'),
(4, 'Material Multimedia', 'Videos, audios y presentaciones', NULL, 4, 1, '2025-11-16 03:58:20'),
(5, 'Información Padres', 'Documentos informativos para acudientes', NULL, 5, 1, '2025-11-16 03:58:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conceptos_pago`
--

CREATE TABLE `conceptos_pago` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `monto_base` decimal(10,2) NOT NULL,
  `tipo` enum('unico','mensual','anual') DEFAULT 'mensual',
  `obligatorio` tinyint(1) DEFAULT 1,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Conceptos de cobro (matrícula, pensión, etc)';

--
-- Volcado de datos para la tabla `conceptos_pago`
--

INSERT INTO `conceptos_pago` (`id`, `nombre`, `descripcion`, `monto_base`, `tipo`, `obligatorio`, `activo`, `created_at`) VALUES
(1, 'Matrícula', 'Matrícula anual', 500000.00, 'anual', 1, 1, '2025-11-16 03:58:20'),
(2, 'Pensión Mensual', 'Cuota mensual de enseñanza', 350000.00, 'mensual', 1, 1, '2025-11-16 03:58:20'),
(3, 'Alimentación', 'Servicio de alimentación mensual', 150000.00, 'mensual', 0, 1, '2025-11-16 03:58:20'),
(4, 'Materiales', 'Kit de materiales escolares', 100000.00, 'unico', 0, 1, '2025-11-16 03:58:20'),
(5, 'Salida Pedagógica', 'Costo de salidas y actividades especiales', 50000.00, 'unico', 0, 1, '2025-11-16 03:58:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pagos`
--

CREATE TABLE `detalle_pagos` (
  `id` int(11) NOT NULL,
  `pago_id` int(11) NOT NULL,
  `fecha_abono` date NOT NULL,
  `monto_abono` decimal(10,2) NOT NULL,
  `metodo_pago` enum('efectivo','transferencia','tarjeta','cheque','otro') NOT NULL,
  `numero_comprobante` varchar(50) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `registrado_por` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dimensiones`
--

CREATE TABLE `dimensiones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `orden` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dimensiones de desarrollo para preescolar';

--
-- Volcado de datos para la tabla `dimensiones`
--

INSERT INTO `dimensiones` (`id`, `nombre`, `codigo`, `descripcion`, `orden`, `activo`, `created_at`) VALUES
(1, 'Dimensión Cognitiva', 'COG', 'Desarrollo del pensamiento, memoria, atención, percepción y resolución de problemas', 1, 1, '2025-11-16 03:58:20'),
(2, 'Dimensión Comunicativa', 'COM', 'Desarrollo del lenguaje oral, escrito y gestual', 2, 1, '2025-11-16 03:58:20'),
(3, 'Dimensión Corporal', 'COR', 'Desarrollo de la motricidad fina y gruesa, coordinación y expresión corporal', 3, 1, '2025-11-16 03:58:20'),
(4, 'Dimensión Socio-Afectiva', 'SOC', 'Desarrollo emocional, relaciones interpersonales y convivencia', 4, 1, '2025-11-16 03:58:20'),
(5, 'Dimensión Estética', 'EST', 'Desarrollo de la sensibilidad, creatividad y expresión artística', 5, 1, '2025-11-16 03:58:20'),
(6, 'Dimensión Ética y Valores', 'ETI', 'Formación en valores, normas y respeto', 6, 1, '2025-11-16 03:58:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudiantes`
--

CREATE TABLE `estudiantes` (
  `id` int(11) NOT NULL,
  `codigo_estudiante` varchar(20) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `tipo_identificacion` enum('tarjeta_identidad','registro_civil','sin_documento') DEFAULT 'registro_civil',
  `numero_identificacion` varchar(20) DEFAULT NULL,
  `fecha_nacimiento` date NOT NULL,
  `edad` int(11) DEFAULT NULL,
  `genero` enum('masculino','femenino') NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `barrio` varchar(100) DEFAULT NULL,
  `telefono_contacto` varchar(20) DEFAULT NULL,
  `tipo_sangre` varchar(5) DEFAULT NULL,
  `eps` varchar(100) DEFAULT NULL,
  `alergias` text DEFAULT NULL,
  `condiciones_medicas` text DEFAULT NULL,
  `medicamentos` text DEFAULT NULL,
  `observaciones_medicas` text DEFAULT NULL,
  `fecha_matricula` date NOT NULL DEFAULT curdate(),
  `estado` enum('activo','retirado','graduado','suspendido') DEFAULT 'activo',
  `foto_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Disparadores `estudiantes`
--
DELIMITER $$
CREATE TRIGGER `trg_estudiantes_before_insert` BEFORE INSERT ON `estudiantes` FOR EACH ROW BEGIN
    IF NEW.fecha_nacimiento IS NOT NULL THEN
        SET NEW.edad = TIMESTAMPDIFF(YEAR, NEW.fecha_nacimiento, CURDATE());
    ELSE
        SET NEW.edad = NULL;
    END IF;

    -- Validación rango de edad (1..5)
    IF NEW.edad IS NOT NULL AND (NEW.edad < 1 OR NEW.edad > 5) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Edad del estudiante fuera del rango permitido (1-5 años).';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_estudiantes_before_update` BEFORE UPDATE ON `estudiantes` FOR EACH ROW BEGIN
    IF NEW.fecha_nacimiento IS NOT NULL THEN
        SET NEW.edad = TIMESTAMPDIFF(YEAR, NEW.fecha_nacimiento, CURDATE());
    ELSE
        SET NEW.edad = NULL;
    END IF;

    -- Validación rango de edad (1..5)
    IF NEW.edad IS NOT NULL AND (NEW.edad < 1 OR NEW.edad > 5) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Edad del estudiante fuera del rango permitido (1-5 años).';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos_calendario`
--

CREATE TABLE `eventos_calendario` (
  `id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo_evento` enum('festivo','reunion','actividad','evaluacion','otro') NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `grupo_id` int(11) DEFAULT NULL COMMENT 'NULL = aplica para todos',
  `lugar` varchar(150) DEFAULT NULL,
  `responsable_id` int(11) DEFAULT NULL,
  `recordatorio` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos`
--

CREATE TABLE `grupos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `nivel` enum('caminadores','parvulos','prejardin','jardin','transicion') NOT NULL,
  `edad_minima` int(11) NOT NULL CHECK (`edad_minima` >= 1 and `edad_minima` <= 5),
  `edad_maxima` int(11) NOT NULL CHECK (`edad_maxima` >= 1 and `edad_maxima` <= 5),
  `cupo_maximo` int(11) NOT NULL DEFAULT 20,
  `ano_lectivo` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Niveles educativos del preescolar';

--
-- Volcado de datos para la tabla `grupos`
--

INSERT INTO `grupos` (`id`, `nombre`, `nivel`, `edad_minima`, `edad_maxima`, `cupo_maximo`, `ano_lectivo`, `activo`, `created_at`) VALUES
(1, 'Caminadores A', 'caminadores', 1, 2, 15, 2025, 1, '2025-11-16 03:58:20'),
(2, 'Prejardín A', 'prejardin', 2, 3, 20, 2025, 1, '2025-11-16 03:58:20'),
(3, 'Jardín A', 'jardin', 3, 4, 20, 2025, 1, '2025-11-16 03:58:20'),
(4, 'Transición A', 'transicion', 4, 5, 25, 2025, 1, '2025-11-16 03:58:20'),
(5, 'Párvulos A', 'parvulos', 2, 3, 20, 2025, 1, '2025-11-17 03:07:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `materia` varchar(100) NOT NULL,
  `profesor_id` int(11) DEFAULT NULL,
  `aula` varchar(50) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `indicadores`
--

CREATE TABLE `indicadores` (
  `id` int(11) NOT NULL,
  `dimension_id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `descripcion` text NOT NULL,
  `orden` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Indicadores de logro por dimensión y nivel';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `justificaciones`
--

CREATE TABLE `justificaciones` (
  `id` int(11) NOT NULL,
  `asistencia_id` int(11) NOT NULL,
  `motivo` enum('enfermedad','cita_medica','calamidad','viaje','otro') NOT NULL,
  `descripcion` text NOT NULL,
  `documento_url` varchar(255) DEFAULT NULL,
  `fecha_justificacion` date NOT NULL DEFAULT curdate(),
  `justificado_por` int(11) DEFAULT NULL,
  `aprobado` tinyint(1) DEFAULT 0,
  `aprobado_por` int(11) DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Justificaciones de ausencias';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs_sistema`
--

CREATE TABLE `logs_sistema` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `accion` varchar(100) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `datos_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_anteriores`)),
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_nuevos`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de auditoría del sistema';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes`
--

CREATE TABLE `mensajes` (
  `id` int(11) NOT NULL,
  `remitente_id` int(11) NOT NULL,
  `destinatario_id` int(11) NOT NULL,
  `asunto` varchar(200) NOT NULL,
  `mensaje` text NOT NULL,
  `leido` tinyint(1) DEFAULT 0,
  `fecha_lectura` datetime DEFAULT NULL,
  `importante` tinyint(1) DEFAULT 0,
  `respondido` tinyint(1) DEFAULT 0,
  `mensaje_padre_id` int(11) DEFAULT NULL COMMENT 'Para hilos de conversación',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mensajería interna entre usuarios';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo` enum('informativo','alerta','urgente','recordatorio') DEFAULT 'informativo',
  `titulo` varchar(150) NOT NULL,
  `mensaje` text NOT NULL,
  `link_accion` varchar(255) DEFAULT NULL,
  `leido` tinyint(1) DEFAULT 0,
  `fecha_lectura` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Notificaciones del sistema';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

CREATE TABLE `pagos` (
  `id` int(11) NOT NULL,
  `codigo_pago` varchar(20) NOT NULL,
  `estudiante_id` int(11) NOT NULL,
  `concepto_id` int(11) NOT NULL,
  `periodo` varchar(50) DEFAULT NULL COMMENT 'Ej: Enero 2025, Matrícula 2025',
  `monto_total` decimal(10,2) NOT NULL,
  `monto_pagado` decimal(10,2) DEFAULT 0.00,
  `saldo_pendiente` decimal(10,2) GENERATED ALWAYS AS (`monto_total` - `monto_pagado`) STORED,
  `estado` enum('pendiente','parcial','pagado','vencido') DEFAULT 'pendiente',
  `fecha_vencimiento` date NOT NULL,
  `fecha_pago` date DEFAULT NULL,
  `metodo_pago` enum('efectivo','transferencia','tarjeta','cheque','otro') DEFAULT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `registrado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodos_academicos`
--

CREATE TABLE `periodos_academicos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `numero_periodo` int(11) NOT NULL CHECK (`numero_periodo` between 1 and 4),
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `ano_lectivo` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Volcado de datos para la tabla `periodos_academicos`
--

INSERT INTO `periodos_academicos` (`id`, `nombre`, `numero_periodo`, `fecha_inicio`, `fecha_fin`, `ano_lectivo`, `activo`, `created_at`) VALUES
(1, 'Primer Período', 1, '2025-01-20', '2025-03-31', 2025, 1, '2025-11-16 03:58:20'),
(2, 'Segundo Período', 2, '2025-04-01', '2025-06-30', 2025, 1, '2025-11-16 03:58:20'),
(3, 'Tercer Período', 3, '2025-07-15', '2025-09-30', 2025, 1, '2025-11-16 03:58:20'),
(4, 'Cuarto Período', 4, '2025-10-01', '2025-11-30', 2025, 1, '2025-11-16 03:58:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesores`
--

CREATE TABLE `profesores` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `codigo_profesor` varchar(20) NOT NULL,
  `tipo_identificacion` varchar(10) NOT NULL DEFAULT 'CC',
  `numero_identificacion` varchar(20) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `genero` enum('masculino','femenino') NOT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT 'Neiva',
  `telefono_fijo` varchar(20) DEFAULT NULL,
  `telefono_movil` varchar(20) NOT NULL,
  `email_personal` varchar(100) DEFAULT NULL,
  `contacto_emergencia` varchar(100) DEFAULT NULL,
  `telefono_emergencia` varchar(20) DEFAULT NULL,
  `nivel_educacion` enum('bachiller','tecnico','profesional','especializacion','maestria','doctorado') DEFAULT NULL,
  `titulo_profesional` varchar(150) DEFAULT NULL,
  `institucion_educativa` varchar(150) DEFAULT NULL,
  `especializacion` varchar(150) DEFAULT NULL,
  `anos_experiencia` int(11) DEFAULT 0,
  `fecha_ingreso` date NOT NULL,
  `tipo_contrato` enum('indefinido','fijo','prestacion_servicios') DEFAULT 'fijo',
  `salario_base` decimal(10,2) DEFAULT NULL,
  `estado` enum('activo','inactivo','vacaciones','licencia') DEFAULT 'activo',
  `foto_url` varchar(255) DEFAULT NULL,
  `hoja_vida_url` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Información de docentes y personal';

--
-- Disparadores `profesores`
--
DELIMITER $$
CREATE TRIGGER `trg_profesores_before_insert` BEFORE INSERT ON `profesores` FOR EACH ROW BEGIN
    IF NEW.fecha_nacimiento IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Fecha de nacimiento requerida para el profesor.';
    END IF;

    IF TIMESTAMPDIFF(YEAR, NEW.fecha_nacimiento, CURDATE()) < 18 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El profesor debe ser mayor de 18 años.';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_profesores_before_update` BEFORE UPDATE ON `profesores` FOR EACH ROW BEGIN
    IF NEW.fecha_nacimiento IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Fecha de nacimiento requerida para el profesor.';
    END IF;

    IF TIMESTAMPDIFF(YEAR, NEW.fecha_nacimiento, CURDATE()) < 18 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El profesor debe ser mayor de 18 años.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesor_grupo`
--

CREATE TABLE `profesor_grupo` (
  `id` int(11) NOT NULL,
  `profesor_id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `ano_lectivo` int(11) NOT NULL,
  `es_titular` tinyint(1) DEFAULT 0,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asignación de profesores a grupos';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recursos`
--

CREATE TABLE `recursos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('documento','video','audio','imagen','enlace','otro') NOT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `url_archivo` varchar(255) DEFAULT NULL,
  `tamano_archivo` int(11) DEFAULT NULL COMMENT 'Tamaño en bytes',
  `extension` varchar(10) DEFAULT NULL,
  `grupo_id` int(11) DEFAULT NULL COMMENT 'NULL = aplica para todos',
  `visible_profesores` tinyint(1) DEFAULT 1,
  `visible_padres` tinyint(1) DEFAULT 0,
  `descargas` int(11) DEFAULT 0,
  `subido_por` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Biblioteca de recursos educativos';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Hash bcrypt',
  `rol` enum('admin','profesor') NOT NULL DEFAULT 'profesor',
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `ultimo_acceso` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios del sistema con credenciales de acceso';

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `password`, `rol`, `nombres`, `apellidos`, `telefono`, `activo`, `ultimo_acceso`, `created_at`, `updated_at`) VALUES
(1, 'admin@gphuellasdelsaber.com', '$2b$10$XQ3ZvGz0NxGY6iY1Z5K1nO7jKFf8GrxWvCKfQQF5KvLNDxJ8L5qyC', 'admin', 'Administrador', 'Sistema', '3167927255', 1, NULL, '2025-11-16 03:58:20', '2025-11-16 03:58:20');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `acudientes`
--
ALTER TABLE `acudientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_estudiante` (`estudiante_id`),
  ADD KEY `idx_identificacion` (`identificacion`),
  ADD KEY `idx_responsable_pago` (`es_responsable_pago`),
  ADD KEY `idx_contacto_emergencia` (`es_contacto_emergencia`);

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_unico_estudiante_fecha` (`estudiante_id`,`fecha`),
  ADD KEY `idx_estudiante` (`estudiante_id`),
  ADD KEY `idx_fecha` (`fecha`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_estudiante_fecha` (`estudiante_id`,`fecha`),
  ADD KEY `registrado_por` (`registrado_por`);

--
-- Indices de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_unico_estudiante_dimension_periodo` (`estudiante_id`,`dimension_id`,`periodo_id`),
  ADD KEY `idx_estudiante` (`estudiante_id`),
  ADD KEY `idx_dimension` (`dimension_id`),
  ADD KEY `idx_periodo` (`periodo_id`),
  ADD KEY `indicador_id` (`indicador_id`),
  ADD KEY `registrado_por` (`registrado_por`);

--
-- Indices de la tabla `categorias_recursos`
--
ALTER TABLE `categorias_recursos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `conceptos_pago`
--
ALTER TABLE `conceptos_pago`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `detalle_pagos`
--
ALTER TABLE `detalle_pagos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pago` (`pago_id`),
  ADD KEY `idx_fecha` (`fecha_abono`),
  ADD KEY `registrado_por` (`registrado_por`);

--
-- Indices de la tabla `dimensiones`
--
ALTER TABLE `dimensiones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_orden` (`orden`);

--
-- Indices de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_estudiante` (`codigo_estudiante`),
  ADD KEY `idx_apellidos_nombres` (`apellidos`,`nombres`),
  ADD KEY `idx_grupo` (`grupo_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_codigo` (`codigo_estudiante`);

--
-- Indices de la tabla `eventos_calendario`
--
ALTER TABLE `eventos_calendario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fecha_inicio` (`fecha_inicio`),
  ADD KEY `idx_tipo` (`tipo_evento`),
  ADD KEY `idx_grupo` (`grupo_id`),
  ADD KEY `responsable_id` (`responsable_id`);

--
-- Indices de la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_nombre_ano` (`nombre`,`ano_lectivo`),
  ADD KEY `idx_nivel` (`nivel`),
  ADD KEY `idx_ano_activo` (`ano_lectivo`,`activo`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_grupo` (`grupo_id`),
  ADD KEY `idx_dia` (`dia_semana`),
  ADD KEY `idx_profesor` (`profesor_id`);

--
-- Indices de la tabla `indicadores`
--
ALTER TABLE `indicadores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dimension` (`dimension_id`),
  ADD KEY `idx_grupo` (`grupo_id`),
  ADD KEY `idx_orden` (`orden`);

--
-- Indices de la tabla `justificaciones`
--
ALTER TABLE `justificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_asistencia` (`asistencia_id`),
  ADD KEY `justificado_por` (`justificado_por`),
  ADD KEY `aprobado_por` (`aprobado_por`);

--
-- Indices de la tabla `logs_sistema`
--
ALTER TABLE `logs_sistema`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_modulo` (`modulo`),
  ADD KEY `idx_fecha` (`created_at`);

--
-- Indices de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_remitente` (`remitente_id`),
  ADD KEY `idx_destinatario` (`destinatario_id`),
  ADD KEY `idx_leido` (`leido`),
  ADD KEY `idx_fecha` (`created_at`),
  ADD KEY `mensaje_padre_id` (`mensaje_padre_id`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_leido` (`leido`),
  ADD KEY `idx_tipo` (`tipo`);

--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_pago` (`codigo_pago`),
  ADD KEY `idx_estudiante` (`estudiante_id`),
  ADD KEY `idx_concepto` (`concepto_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha_vencimiento` (`fecha_vencimiento`),
  ADD KEY `idx_codigo` (`codigo_pago`),
  ADD KEY `registrado_por` (`registrado_por`);

--
-- Indices de la tabla `periodos_academicos`
--
ALTER TABLE `periodos_academicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_periodo_ano` (`numero_periodo`,`ano_lectivo`),
  ADD KEY `idx_ano_periodo` (`ano_lectivo`,`numero_periodo`);

--
-- Indices de la tabla `profesores`
--
ALTER TABLE `profesores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD UNIQUE KEY `codigo_profesor` (`codigo_profesor`),
  ADD UNIQUE KEY `numero_identificacion` (`numero_identificacion`),
  ADD KEY `idx_codigo` (`codigo_profesor`),
  ADD KEY `idx_identificacion` (`numero_identificacion`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `profesor_grupo`
--
ALTER TABLE `profesor_grupo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_profesor_grupo_ano` (`profesor_id`,`grupo_id`,`ano_lectivo`),
  ADD KEY `idx_profesor` (`profesor_id`),
  ADD KEY `idx_grupo` (`grupo_id`),
  ADD KEY `idx_ano` (`ano_lectivo`);

--
-- Indices de la tabla `recursos`
--
ALTER TABLE `recursos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_categoria` (`categoria_id`),
  ADD KEY `idx_grupo` (`grupo_id`),
  ADD KEY `subido_por` (`subido_por`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_rol_activo` (`rol`,`activo`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `acudientes`
--
ALTER TABLE `acudientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias_recursos`
--
ALTER TABLE `categorias_recursos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `conceptos_pago`
--
ALTER TABLE `conceptos_pago`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `detalle_pagos`
--
ALTER TABLE `detalle_pagos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `dimensiones`
--
ALTER TABLE `dimensiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `eventos_calendario`
--
ALTER TABLE `eventos_calendario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `indicadores`
--
ALTER TABLE `indicadores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `justificaciones`
--
ALTER TABLE `justificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `logs_sistema`
--
ALTER TABLE `logs_sistema`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `periodos_academicos`
--
ALTER TABLE `periodos_academicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `profesores`
--
ALTER TABLE `profesores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `profesor_grupo`
--
ALTER TABLE `profesor_grupo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `recursos`
--
ALTER TABLE `recursos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `acudientes`
--
ALTER TABLE `acudientes`
  ADD CONSTRAINT `acudientes_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asistencia_ibfk_2` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`dimension_id`) REFERENCES `dimensiones` (`id`),
  ADD CONSTRAINT `calificaciones_ibfk_3` FOREIGN KEY (`indicador_id`) REFERENCES `indicadores` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `calificaciones_ibfk_4` FOREIGN KEY (`periodo_id`) REFERENCES `periodos_academicos` (`id`),
  ADD CONSTRAINT `calificaciones_ibfk_5` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `detalle_pagos`
--
ALTER TABLE `detalle_pagos`
  ADD CONSTRAINT `detalle_pagos_ibfk_1` FOREIGN KEY (`pago_id`) REFERENCES `pagos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_pagos_ibfk_2` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD CONSTRAINT `estudiantes_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`);

--
-- Filtros para la tabla `eventos_calendario`
--
ALTER TABLE `eventos_calendario`
  ADD CONSTRAINT `eventos_calendario_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `eventos_calendario_ibfk_2` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `horarios_ibfk_2` FOREIGN KEY (`profesor_id`) REFERENCES `profesores` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `indicadores`
--
ALTER TABLE `indicadores`
  ADD CONSTRAINT `indicadores_ibfk_1` FOREIGN KEY (`dimension_id`) REFERENCES `dimensiones` (`id`),
  ADD CONSTRAINT `indicadores_ibfk_2` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`);

--
-- Filtros para la tabla `justificaciones`
--
ALTER TABLE `justificaciones`
  ADD CONSTRAINT `justificaciones_ibfk_1` FOREIGN KEY (`asistencia_id`) REFERENCES `asistencia` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `justificaciones_ibfk_2` FOREIGN KEY (`justificado_por`) REFERENCES `acudientes` (`id`),
  ADD CONSTRAINT `justificaciones_ibfk_3` FOREIGN KEY (`aprobado_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `logs_sistema`
--
ALTER TABLE `logs_sistema`
  ADD CONSTRAINT `logs_sistema_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD CONSTRAINT `mensajes_ibfk_1` FOREIGN KEY (`remitente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mensajes_ibfk_2` FOREIGN KEY (`destinatario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mensajes_ibfk_3` FOREIGN KEY (`mensaje_padre_id`) REFERENCES `mensajes` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`),
  ADD CONSTRAINT `pagos_ibfk_2` FOREIGN KEY (`concepto_id`) REFERENCES `conceptos_pago` (`id`),
  ADD CONSTRAINT `pagos_ibfk_3` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `profesores`
--
ALTER TABLE `profesores`
  ADD CONSTRAINT `profesores_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `profesor_grupo`
--
ALTER TABLE `profesor_grupo`
  ADD CONSTRAINT `profesor_grupo_ibfk_1` FOREIGN KEY (`profesor_id`) REFERENCES `profesores` (`id`),
  ADD CONSTRAINT `profesor_grupo_ibfk_2` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`);

--
-- Filtros para la tabla `recursos`
--
ALTER TABLE `recursos`
  ADD CONSTRAINT `recursos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_recursos` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `recursos_ibfk_2` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `recursos_ibfk_3` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
