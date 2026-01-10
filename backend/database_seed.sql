-- ========================================
-- GIMNASIO PEDAGÓGICO HUELLAS DEL SABER
-- Script de Datos de Prueba (Seed Data)
-- ========================================

USE gimnasio_huellas_saber;

-- ========================================
-- USUARIOS
-- ========================================
-- Contraseñas: admin123 y profesor123 (encriptadas con bcrypt)
INSERT INTO usuarios (id, nombre, email, password, rol, activo) VALUES
('usr001', 'Administrador Principal', 'admin@huellasdelsaber.edu.co', '$2a$10$/h/26EqEW51l.aT0CYbxKeKanPzMAINljByGRv/GFC.OdBwcc7oFq', 'admin', TRUE),
('usr002', 'María García', 'profesor@huellasdelsaber.edu.co', '$2a$10$lwLfyax0sQG0hJN2Us1ot.u4HWhSkc/d3WHjwDLViZXshwydnz9cu', 'profesor', TRUE),
('usr003', 'Laura Mendoza', 'laura.mendoza@huellasdelsaber.edu.co', '$2a$10$lwLfyax0sQG0hJN2Us1ot.u4HWhSkc/d3WHjwDLViZXshwydnz9cu', 'profesor', TRUE),
('usr004', 'Carlos Ramírez', 'carlos.ramirez@huellasdelsaber.edu.co', '$2a$10$lwLfyax0sQG0hJN2Us1ot.u4HWhSkc/d3WHjwDLViZXshwydnz9cu', 'profesor', TRUE);

-- ========================================
-- PROFESORES
-- ========================================
INSERT INTO profesores (id, usuario_id, codigo, nombres, apellidos, tipo_identificacion, numero_identificacion, fecha_nacimiento, genero, direccion, ciudad, telefono, email, email_personal, nombre_contacto_emergencia, telefono_emergencia, nivel_educacion, titulo_profesional, institucion_educativa, especializacion_academica, anos_experiencia, especialidad, fecha_ingreso, tipo_contrato, salario_base, estado, niveles, es_titular, activo) VALUES
('prof001', 'usr002', 'PROF001', 'María', 'García López', 'CC', '1098765432', '1990-05-15', 'Femenino', 'Cra 12 #18-30', 'Neiva', '3201234567', 'maria.garcia@huellasdelsaber.edu.co', 'maria.garcia@gmail.com', 'Pedro García', '3109876543', 'Profesional', 'Licenciada en Pedagogía Infantil', 'Universidad Surcolombiana', 'Primera Infancia', 8, 'Pedagogía Infantil', '2018-02-01', 'Indefinido', 2500000, 'Activo', '["Transición", "Jardín"]', TRUE, TRUE),
('prof002', 'usr003', 'PROF002', 'Laura', 'Mendoza Silva', 'CC', '1087654321', '1988-08-22', 'Femenino', 'Calle 25 #10-45', 'Neiva', '3157654321', 'laura.mendoza@huellasdelsaber.edu.co', 'laura.mendoza@gmail.com', 'Ana Silva', '3186543210', 'Profesional', 'Licenciada en Educación Preescolar', 'Universidad del Tolima', 'Desarrollo Cognitivo', 10, 'Educación Preescolar', '2016-03-15', 'Indefinido', 2800000, 'Activo', '["Prejardín", "Párvulos"]', TRUE, TRUE),
('prof003', 'usr004', 'PROF003', 'Carlos', 'Ramírez Torres', 'CC', '1076543210', '1992-11-10', 'Masculino', 'Av. Circunvalar #15-20', 'Neiva', '3143216789', 'carlos.ramirez@huellasdelsaber.edu.co', 'carlos.ramirez@gmail.com', 'Sandra Torres', '3205678901', 'Profesional', 'Licenciado en Educación Física', 'Universidad Pedagógica Nacional', 'Recreación y Deporte', 5, 'Educación Física', '2020-01-20', 'Fijo', 2200000, 'Activo', '["Caminadores"]', FALSE, TRUE);

-- ========================================
-- ESTUDIANTES
-- ========================================
INSERT INTO estudiantes (id, codigo, tipo_identificacion, numero_identificacion, nombres, apellidos, fecha_nacimiento, genero, nivel, estado, direccion, barrio, telefono_contacto, tipo_sangre, eps, alergias, condiciones_medicas, fecha_ingreso, fecha_matricula, activo) VALUES
('est001', 'EST001', 'Tarjeta de Identidad', '1234567890', 'Juan Sebastián', 'Rodríguez Pérez', '2020-03-15', 'Masculino', 'Transición', 'Activo', 'Cra 5 #12-34', 'Centro', '3201234567', 'O+', 'Salud Total', 'Ninguna', NULL, '2023-01-10', '2024-01-15', TRUE),
('est002', 'EST002', 'Registro Civil', '987654321', 'Ana Sofía', 'Martínez López', '2021-05-20', 'Femenino', 'Jardín', 'Activo', 'Calle 8 #15-20', 'Las Palmas', '3157654321', 'A+', 'Sanitas', 'Ninguna', NULL, '2023-02-01', '2024-01-20', TRUE),
('est003', 'EST003', 'Registro Civil', '876543210', 'Carlos Andrés', 'Gómez Silva', '2021-08-10', 'Masculino', 'Prejardín', 'Activo', 'Av. Circunvalar #20-30', 'La Gaitana', '3186543210', 'B+', 'Nueva EPS', 'Lactosa', NULL, '2023-01-15', '2024-01-18', TRUE),
('est004', 'EST004', 'Registro Civil', '765432109', 'Laura Valentina', 'Torres Ramírez', '2022-02-28', 'Femenino', 'Caminadores', 'Activo', 'Calle 15 #8-45', 'Calixto Leiva', '3143216789', 'O-', 'Compensar', 'Ninguna', 'Asma leve', '2023-03-01', '2024-02-01', TRUE),
('est005', 'EST005', 'Registro Civil', '654321098', 'Miguel Ángel', 'Hernández Castro', '2020-11-12', 'Masculino', 'Transición', 'Activo', 'Cra 20 #25-15', 'Altico', '3112345678', 'A-', 'Sura', 'Polen', NULL, '2023-01-20', '2024-01-22', TRUE),
('est006', 'EST006', 'Registro Civil', '543210987', 'Isabella', 'Vargas Muñoz', '2021-09-05', 'Femenino', 'Jardín', 'Activo', 'Calle 30 #12-25', 'Los Pinos', '3178901234', 'AB+', 'Medimás', 'Ninguna', NULL, '2023-02-15', '2024-01-25', TRUE),
('est007', 'EST007', 'Registro Civil', '432109876', 'Santiago', 'López Gutiérrez', '2022-04-18', 'Masculino', 'Párvulos', 'Activo', 'Cra 15 #22-40', 'Quirinal', '3165432109', 'O+', 'Salud Total', 'Ninguna', NULL, '2023-08-01', '2024-02-05', TRUE),
('est008', 'EST008', 'Registro Civil', '321098765', 'Valentina', 'Sánchez Díaz', '2022-07-22', 'Femenino', 'Caminadores', 'Activo', 'Calle 18 #10-30', 'Granjas', '3209876543', 'B-', 'Compensar', 'Frutos secos', NULL, '2023-09-01', '2024-02-10', TRUE);

-- ========================================
-- ACUDIENTES
-- ========================================
INSERT INTO acudientes (id, tipo_acudiente, nombres, apellidos, identificacion, parentesco, telefono_principal, telefono_secundario, email, direccion, ocupacion, empresa, es_responsable_pago, es_contacto_emergencia, orden_contacto) VALUES
('acu001', 'Padre', 'Carlos', 'Rodríguez', '80123456', 'Padre', '3201234567', '8711234', 'carlos.rodriguez@email.com', 'Cra 5 #12-34', 'Ingeniero Civil', 'Construcciones del Sur', TRUE, TRUE, 1),
('acu002', 'Madre', 'María', 'Pérez', '63234567', 'Madre', '3109876543', NULL, 'maria.perez@email.com', 'Cra 5 #12-34', 'Médica', 'Hospital Universitario', TRUE, TRUE, 2),
('acu003', 'Padre', 'Luis', 'Martínez', '80234567', 'Padre', '3157654321', '8722345', 'luis.martinez@email.com', 'Calle 8 #15-20', 'Contador', 'Contaduría LM', TRUE, TRUE, 1),
('acu004', 'Madre', 'Andrea', 'Silva', '63345678', 'Madre', '3186543210', NULL, 'andrea.silva@email.com', 'Av. Circunvalar #20-30', 'Abogada', 'Bufete Jurídico Silva', TRUE, TRUE, 1),
('acu005', 'Padre', 'Pedro', 'Torres', '80345678', 'Padre', '3143216789', '8733456', 'pedro.torres@email.com', 'Calle 15 #8-45', 'Empresario', 'Torres SAS', TRUE, TRUE, 1),
('acu006', 'Madre', 'Carmen', 'Ramírez', '63456789', 'Madre', '3112345678', NULL, 'carmen.ramirez@email.com', 'Calle 15 #8-45', 'Profesora', 'Colegio Nacional', TRUE, TRUE, 2),
('acu007', 'Padre', 'Jorge', 'Hernández', '80456789', 'Padre', '3112345678', '8744567', 'jorge.hernandez@email.com', 'Cra 20 #25-15', 'Arquitecto', 'Diseños JH', TRUE, TRUE, 1),
('acu008', 'Padre', 'Roberto', 'Vargas', '80567890', 'Padre', '3178901234', NULL, 'roberto.vargas@email.com', 'Calle 30 #12-25', 'Administrador', 'Empresa XYZ', TRUE, TRUE, 1),
('acu009', 'Madre', 'Patricia', 'Muñoz', '63567890', 'Madre', '3165432109', NULL, 'patricia.munoz@email.com', 'Calle 30 #12-25', 'Enfermera', 'Clínica Los Ángeles', TRUE, TRUE, 2),
('acu010', 'Padre', 'Fernando', 'López', '80678901', 'Padre', '3165432109', NULL, 'fernando.lopez@email.com', 'Cra 15 #22-40', 'Comerciante', 'Comercial FG', TRUE, TRUE, 1),
('acu011', 'Madre', 'Mónica', 'Gutiérrez', '63678901', 'Madre', '3154321098', NULL, 'monica.gutierrez@email.com', 'Cra 15 #22-40', 'Psicóloga', 'Consultorio MG', TRUE, TRUE, 2),
('acu012', 'Padre', 'Andrés', 'Sánchez', '80789012', 'Padre', '3209876543', NULL, 'andres.sanchez@email.com', 'Calle 18 #10-30', 'Vendedor', 'Automotores AS', TRUE, TRUE, 1),
('acu013', 'Madre', 'Diana', 'Díaz', '63789012', 'Madre', '3187654321', NULL, 'diana.diaz@email.com', 'Calle 18 #10-30', 'Diseñadora', 'Freelance', TRUE, TRUE, 2);

-- ========================================
-- RELACIÓN ESTUDIANTES-ACUDIENTES
-- ========================================
INSERT INTO estudiantes_acudientes (estudiante_id, acudiente_id) VALUES
('est001', 'acu001'),
('est001', 'acu002'),
('est002', 'acu003'),
('est003', 'acu004'),
('est004', 'acu005'),
('est004', 'acu006'),
('est005', 'acu007'),
('est006', 'acu008'),
('est006', 'acu009'),
('est007', 'acu010'),
('est007', 'acu011'),
('est008', 'acu012'),
('est008', 'acu013');

-- ========================================
-- ASISTENCIA (Últimas 2 semanas)
-- ========================================
INSERT INTO asistencia (id, estudiante_id, fecha, presente, estado, hora_llegada, registrado_por) VALUES
-- Semana 1
('asis001', 'est001', '2024-11-18', TRUE, 'presente', '07:30:00', 'usr002'),
('asis002', 'est001', '2024-11-19', TRUE, 'presente', '07:25:00', 'usr002'),
('asis003', 'est001', '2024-11-20', TRUE, 'presente', '07:35:00', 'usr002'),
('asis004', 'est001', '2024-11-21', TRUE, 'presente', '07:30:00', 'usr002'),
('asis005', 'est001', '2024-11-22', FALSE, 'justificado', NULL, 'usr002'),
('asis006', 'est002', '2024-11-18', TRUE, 'presente', '07:40:00', 'usr002'),
('asis007', 'est002', '2024-11-19', TRUE, 'presente', '07:30:00', 'usr002'),
('asis008', 'est002', '2024-11-20', TRUE, 'retardo', '08:15:00', 'usr002'),
('asis009', 'est002', '2024-11-21', TRUE, 'presente', '07:35:00', 'usr002'),
('asis010', 'est002', '2024-11-22', TRUE, 'presente', '07:30:00', 'usr002'),
-- Semana 2
('asis011', 'est001', '2024-11-25', TRUE, 'presente', '07:30:00', 'usr002'),
('asis012', 'est001', '2024-11-26', TRUE, 'presente', '07:28:00', 'usr002'),
('asis013', 'est002', '2024-11-25', TRUE, 'presente', '07:35:00', 'usr002'),
('asis014', 'est002', '2024-11-26', TRUE, 'presente', '07:32:00', 'usr002'),
('asis015', 'est003', '2024-11-25', TRUE, 'presente', '07:45:00', 'usr003'),
('asis016', 'est003', '2024-11-26', TRUE, 'presente', '07:40:00', 'usr003'),
('asis017', 'est004', '2024-11-25', TRUE, 'presente', '08:00:00', 'usr004'),
('asis018', 'est004', '2024-11-26', FALSE, 'ausente', NULL, 'usr004'),
('asis019', 'est005', '2024-11-25', TRUE, 'presente', '07:30:00', 'usr002'),
('asis020', 'est005', '2024-11-26', TRUE, 'presente', '07:30:00', 'usr002');

-- Actualizar justificación para ausencia
UPDATE asistencia SET
  justificacion_motivo = 'Cita Médica',
  justificacion_descripcion = 'Control pediátrico programado',
  justificacion_fecha = '2024-11-22 09:00:00',
  justificacion_por = 'María Pérez',
  justificacion_aprobada = TRUE
WHERE id = 'asis005';

-- ========================================
-- CALIFICACIONES (Período 1 - 2024)
-- ========================================
INSERT INTO calificaciones (id, estudiante_id, periodo, año, observaciones_generales, registrado_por) VALUES
('cal001', 'est001', 1, 2024, 'Excelente progreso en todas las dimensiones. Muy participativo y colaborador.', 'usr002'),
('cal002', 'est002', 1, 2024, 'Estudiante destacada, muestra gran interés por aprender.', 'usr002'),
('cal003', 'est003', 1, 2024, 'Buen desempeño general, requiere refuerzo en dimensión comunicativa.', 'usr003'),
('cal004', 'est004', 1, 2024, 'Adaptación exitosa al ambiente escolar. Proceso de socialización positivo.', 'usr004'),
('cal005', 'est005', 1, 2024, 'Estudiante sobresaliente con excelentes habilidades cognitivas.', 'usr002');

-- ========================================
-- CALIFICACIONES DETALLE
-- ========================================
-- Estudiante est001
INSERT INTO calificaciones_detalle (id, calificacion_id, dimension, valoracion, observaciones) VALUES
('cald001', 'cal001', 'Cognitiva', 'Superior', 'Excelente capacidad de análisis y resolución de problemas'),
('cald002', 'cal001', 'Comunicativa', 'Superior', 'Se expresa con claridad y fluidez'),
('cald003', 'cal001', 'Corporal', 'Alto', 'Buena coordinación motriz'),
('cald004', 'cal001', 'Socio-Afectiva', 'Superior', 'Excelentes relaciones con compañeros'),
('cald005', 'cal001', 'Estética', 'Alto', 'Creatividad en actividades artísticas'),
('cald006', 'cal001', 'Ética', 'Superior', 'Respeta normas y valores');

-- Estudiante est002
INSERT INTO calificaciones_detalle (id, calificacion_id, dimension, valoracion, observaciones) VALUES
('cald007', 'cal002', 'Cognitiva', 'Alto', 'Buen desarrollo del pensamiento lógico'),
('cald008', 'cal002', 'Comunicativa', 'Superior', 'Excelente expresión oral y escrita'),
('cald009', 'cal002', 'Corporal', 'Alto', 'Coordinación adecuada'),
('cald010', 'cal002', 'Socio-Afectiva', 'Superior', 'Lidera actividades grupales positivamente'),
('cald011', 'cal002', 'Estética', 'Superior', 'Destaca en actividades artísticas'),
('cald012', 'cal002', 'Ética', 'Alto', 'Buen manejo de normas');

-- Estudiante est003
INSERT INTO calificaciones_detalle (id, calificacion_id, dimension, valoracion, observaciones) VALUES
('cald013', 'cal003', 'Cognitiva', 'Alto', 'Comprende conceptos básicos'),
('cald014', 'cal003', 'Comunicativa', 'Básico', 'Requiere estimulación en expresión verbal'),
('cald015', 'cal003', 'Corporal', 'Alto', 'Buena motricidad gruesa'),
('cald016', 'cal003', 'Socio-Afectiva', 'Alto', 'Se relaciona bien con pares'),
('cald017', 'cal003', 'Estética', 'Alto', 'Disfruta actividades artísticas'),
('cald018', 'cal003', 'Ética', 'Alto', 'Respeta reglas del aula');

-- ========================================
-- HORARIOS (Nivel Transición - Lunes)
-- ========================================
INSERT INTO horarios (id, nivel, dia_semana, hora_inicio, hora_fin, materia, tipo_actividad, profesor_id, aula, color) VALUES
('hor001', 'Transición', 1, '07:30:00', '08:30:00', 'Bienvenida y Rutina', 'Académica', 'prof001', 'Aula 1', '#3b82f6'),
('hor002', 'Transición', 1, '08:30:00', '09:30:00', 'Dimensión Cognitiva', 'Académica', 'prof001', 'Aula 1', '#8b5cf6'),
('hor003', 'Transición', 1, '09:30:00', '10:00:00', 'Refrigerio', 'Descanso', 'prof001', 'Comedor', '#10b981'),
('hor004', 'Transición', 1, '10:00:00', '11:00:00', 'Dimensión Comunicativa', 'Académica', 'prof001', 'Aula 1', '#f59e0b'),
('hor005', 'Transición', 1, '11:00:00', '12:00:00', 'Educación Física', 'Física', 'prof003', 'Patio', '#ef4444'),
('hor006', 'Transición', 1, '12:00:00', '13:00:00', 'Almuerzo', 'Almuerzo', 'prof001', 'Comedor', '#06b6d4'),
('hor007', 'Transición', 1, '13:00:00', '14:00:00', 'Arte y Creatividad', 'Artística', 'prof001', 'Aula 1', '#ec4899'),
('hor008', 'Transición', 1, '14:00:00', '15:00:00', 'Juego Libre', 'Descanso', 'prof001', 'Patio', '#84cc16');

-- Martes
INSERT INTO horarios (id, nivel, dia_semana, hora_inicio, hora_fin, materia, tipo_actividad, profesor_id, aula, color) VALUES
('hor009', 'Transición', 2, '07:30:00', '08:30:00', 'Bienvenida y Rutina', 'Académica', 'prof001', 'Aula 1', '#3b82f6'),
('hor010', 'Transición', 2, '08:30:00', '09:30:00', 'Matemáticas', 'Académica', 'prof001', 'Aula 1', '#8b5cf6'),
('hor011', 'Transición', 2, '09:30:00', '10:00:00', 'Refrigerio', 'Descanso', 'prof001', 'Comedor', '#10b981'),
('hor012', 'Transición', 2, '10:00:00', '11:00:00', 'Lecto-escritura', 'Académica', 'prof001', 'Aula 1', '#f59e0b'),
('hor013', 'Transición', 2, '11:00:00', '12:00:00', 'Música', 'Artística', 'prof001', 'Aula 1', '#ec4899'),
('hor014', 'Transición', 2, '12:00:00', '13:00:00', 'Almuerzo', 'Almuerzo', 'prof001', 'Comedor', '#06b6d4');

-- ========================================
-- EVENTOS CALENDARIO
-- ========================================
INSERT INTO eventos_calendario (id, titulo, descripcion, fecha, hora_inicio, hora_fin, tipo, lugar, niveles, responsable_id, prioridad) VALUES
('evt001', 'Día de la Familia', 'Celebración del día de la familia con actividades recreativas', '2024-12-15', '08:00:00', '12:00:00', 'Festivo', 'Instalaciones del colegio', '["Caminadores", "Párvulos", "Prejardín", "Jardín", "Transición"]', 'usr001', 'Importante'),
('evt002', 'Reunión de Padres - Transición', 'Entrega de boletines primer periodo', '2024-12-10', '14:00:00', '16:00:00', 'Reunión', 'Aula 1', '["Transición"]', 'usr002', 'Importante'),
('evt003', 'Navidad en el Colegio', 'Celebración navideña con presentaciones artísticas', '2024-12-20', '09:00:00', '13:00:00', 'Ceremonia', 'Auditorio', '["Caminadores", "Párvulos", "Prejardín", "Jardín", "Transición"]', 'usr001', 'Urgente'),
('evt004', 'Salida Pedagógica - Jardín', 'Visita al parque ecológico', '2024-12-05', '08:00:00', '14:00:00', 'Actividad', 'Parque Ecológico', '["Jardín"]', 'usr002', 'Importante'),
('evt005', 'Evaluación Período 4', 'Inicio de evaluaciones finales', '2024-12-02', NULL, NULL, 'Evaluación', NULL, '["Caminadores", "Párvulos", "Prejardín", "Jardín", "Transición"]', 'usr001', 'Normal');

-- ========================================
-- MENSAJES
-- ========================================
INSERT INTO mensajes (id, remitente_id, destinatario_id, asunto, contenido, fecha, leido, prioridad, estado) VALUES
('msg001', 'usr001', 'usr002', 'Reunión de Docentes', 'Recordatorio de la reunión de docentes programada para el viernes 1 de diciembre a las 2:00 PM.', '2024-11-20 10:30:00', TRUE, 'Importante', 'Leído'),
('msg002', 'usr002', 'usr001', 'Solicitud de Material Didáctico', 'Buenos días, necesitamos material adicional para las actividades del mes de diciembre.', '2024-11-21 09:15:00', TRUE, 'Normal', 'Leído'),
('msg003', 'usr001', 'usr003', 'Capacitación Diciembre', 'Se realizará capacitación en manejo de primeros auxilios el 8 de diciembre.', '2024-11-22 11:00:00', FALSE, 'Importante', 'Enviado'),
('msg004', 'usr003', 'usr002', 'Coordinación Actividad', '¿Podemos coordinar la actividad de fin de año? Necesito tu apoyo.', '2024-11-23 14:30:00', TRUE, 'Normal', 'Leído'),
('msg005', 'usr001', 'usr004', 'Horario Educación Física', 'Por favor revisar el horario de educación física para la próxima semana.', '2024-11-24 08:45:00', FALSE, 'Normal', 'Enviado');

-- ========================================
-- PAGOS
-- ========================================
INSERT INTO pagos (id, numero_recibo, estudiante_id, concepto, monto, monto_pagado, saldo_pendiente, fecha_vencimiento, fecha_pago, estado, mes, año, metodo_pago, numero_referencia) VALUES
-- Pagos completados
('pag001', 'REC-2024-001', 'est001', 'Matrícula', 500000, 500000, 0, '2024-01-10', '2024-01-10', 'pagado', NULL, 2024, 'Transferencia Bancaria', 'TRF123456'),
('pag002', 'REC-2024-002', 'est001', 'Pensión', 350000, 350000, 0, '2024-02-05', '2024-02-03', 'pagado', 'Febrero', 2024, 'Efectivo', NULL),
('pag003', 'REC-2024-003', 'est001', 'Pensión', 350000, 350000, 0, '2024-03-05', '2024-03-05', 'pagado', 'Marzo', 2024, 'Transferencia Bancaria', 'TRF234567'),
('pag004', 'REC-2024-004', 'est002', 'Matrícula', 500000, 500000, 0, '2024-01-10', '2024-01-15', 'pagado', NULL, 2024, 'Tarjeta de Crédito', 'TC345678'),
('pag005', 'REC-2024-005', 'est002', 'Pensión', 350000, 350000, 0, '2024-02-05', '2024-02-05', 'pagado', 'Febrero', 2024, 'Efectivo', NULL),
('pag006', 'REC-2024-006', 'est003', 'Matrícula', 500000, 500000, 0, '2024-01-10', '2024-01-12', 'pagado', NULL, 2024, 'Transferencia Bancaria', 'TRF456789'),

-- Pagos pendientes
('pag007', 'REC-2024-007', 'est003', 'Pensión', 350000, 0, 350000, '2024-11-05', NULL, 'pendiente', 'Noviembre', 2024, NULL, NULL),
('pag008', 'REC-2024-008', 'est004', 'Pensión', 350000, 0, 350000, '2024-11-05', NULL, 'pendiente', 'Noviembre', 2024, NULL, NULL),

-- Pagos vencidos
('pag009', 'REC-2024-009', 'est005', 'Pensión', 350000, 0, 350000, '2024-10-05', NULL, 'vencido', 'Octubre', 2024, NULL, NULL),
('pag010', 'REC-2024-010', 'est006', 'Pensión', 350000, 0, 350000, '2024-09-05', NULL, 'vencido', 'Septiembre', 2024, NULL, NULL),

-- Pagos parciales
('pag011', 'REC-2024-011', 'est007', 'Pensión', 350000, 150000, 200000, '2024-11-05', NULL, 'parcial', 'Noviembre', 2024, 'Efectivo', NULL),
('pag012', 'REC-2024-012', 'est008', 'Matrícula', 500000, 300000, 200000, '2024-01-10', NULL, 'parcial', NULL, 2024, 'Transferencia Bancaria', 'TRF567890');

-- ========================================
-- ABONOS (Para pagos parciales)
-- ========================================
INSERT INTO abonos (id, pago_id, fecha, monto, metodo_pago, numero_recibo) VALUES
('abo001', 'pag011', '2024-11-05', 150000, 'Efectivo', 'REC-2024-011-A1'),
('abo002', 'pag012', '2024-01-10', 300000, 'Transferencia Bancaria', 'REC-2024-012-A1');

-- ========================================
-- RECURSOS EDUCATIVOS
-- ========================================
INSERT INTO recursos_educativos (id, titulo, descripcion, tipo, url, nivel, materia, categoria, profesor_id, tamaño, descargas, visualizaciones, destacado, nuevo, etiquetas, visible_profesores, visible_padres) VALUES
('rec001', 'Guía de Lectoescritura', 'Material completo para enseñanza de vocales y consonantes', 'documento', '/recursos/lectoescritura-guia.pdf', 'Transición', 'Lenguaje', 'Lenguaje y Comunicación', 'prof001', '2.5 MB', 15, 45, TRUE, FALSE, '["lectura", "escritura", "vocales"]', TRUE, FALSE),
('rec002', 'Fichas de Matemáticas', 'Ejercicios de números del 1 al 10', 'documento', '/recursos/matematicas-fichas.pdf', 'Jardín', 'Matemáticas', 'Matemáticas', 'prof001', '1.8 MB', 22, 68, TRUE, FALSE, '["números", "conteo", "figuras"]', TRUE, TRUE),
('rec003', 'Video: El Ciclo del Agua', 'Explicación animada del ciclo del agua', 'video', 'https://youtube.com/ejemplo-agua', 'Transición', 'Ciencias', 'Ciencias Naturales', 'prof002', '50 MB', 8, 34, FALSE, TRUE, '["agua", "naturaleza", "ciencia"]', TRUE, TRUE),
('rec004', 'Canciones Infantiles', 'Recopilación de canciones para estimulación temprana', 'documento', '/recursos/canciones-infantiles.pdf', 'Caminadores', 'Música', 'Música', 'prof003', '1.2 MB', 30, 89, TRUE, FALSE, '["música", "canciones", "estimulación"]', TRUE, TRUE),
('rec005', 'Plantilla de Planeación', 'Formato para planeación semanal de clases', 'plantilla', '/recursos/plantilla-planeacion.docx', 'Solo Profesores', 'Administrativo', 'Documentos Administrativos', 'prof001', '0.5 MB', 12, 25, FALSE, FALSE, '["planeación", "formato", "administrativo"]', TRUE, FALSE),
('rec006', 'Actividades de Arte', 'Propuestas creativas para desarrollo estético', 'presentacion', '/recursos/arte-actividades.pptx', 'Todos los niveles', 'Arte', 'Arte y Creatividad', 'prof002', '3.2 MB', 18, 52, TRUE, TRUE, '["arte", "creatividad", "manualidades"]', TRUE, FALSE);

-- ========================================
-- Fin del script de datos de prueba
-- ========================================
