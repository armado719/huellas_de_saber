export type UserRole = 'admin' | 'profesor';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  foto?: string;
}

export type Nivel = 'Caminadores' | 'Párvulos' | 'Prejardín' | 'Jardín' | 'Transición';

export type Periodo = 1 | 2 | 3 | 4;

export type Valoracion = 'Superior' | 'Alto' | 'Básico' | 'Bajo';

export type Dimension =
  | 'Cognitiva'
  | 'Comunicativa'
  | 'Corporal'
  | 'Socio-Afectiva'
  | 'Estética'
  | 'Ética';

export type TipoIdentificacion = 'Tarjeta de Identidad' | 'Registro Civil' | 'Sin Documento';
export type TipoSangre = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
export type Genero = 'Masculino' | 'Femenino';
export type EstadoEstudiante = 'Activo' | 'Retirado' | 'Graduado' | 'Suspendido';
export type TipoAcudiente = 'Padre' | 'Madre' | 'Abuelo' | 'Abuela' | 'Tío' | 'Tía' | 'Otro';

export interface Acudiente {
  id: string;
  tipoAcudiente?: TipoAcudiente;
  nombres: string;
  apellidos?: string;
  identificacion?: string;
  parentesco: string;
  telefonoPrincipal: string;
  telefonoSecundario?: string;
  email: string;
  direccion: string;
  ocupacion?: string;
  empresa?: string;
  esResponsablePago?: boolean;
  esContactoEmergencia?: boolean;
  ordenContacto?: number;
  observaciones?: string;
}

export interface Estudiante {
  id: string;
  codigo?: string; // EST001, EST002, etc.
  tipoIdentificacion?: TipoIdentificacion;
  numeroIdentificacion?: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  genero?: Genero;
  nivel: Nivel;
  estado?: EstadoEstudiante;
  foto?: string;
  activo: boolean;

  // Información de Contacto
  direccion?: string;
  barrio?: string;
  telefonoContacto?: string;

  // Información Médica
  tipoSangre?: TipoSangre;
  eps?: string;
  alergias?: string;
  condicionesMedicas?: string;
  medicamentos?: string;
  observacionesMedicas?: string;

  // Fechas
  fechaIngreso: string;
  fechaMatricula?: string;

  // Relaciones
  acudientes: Acudiente[];
  observaciones?: string;
}

export type TipoIdentificacionProfesor = 'CC' | 'CE' | 'TI' | 'Pasaporte';
export type NivelEducacion = 'Bachiller' | 'Técnico' | 'Profesional' | 'Especialización' | 'Maestría' | 'Doctorado';
export type TipoContrato = 'Indefinido' | 'Fijo' | 'Prestación de Servicios';
export type EstadoProfesor = 'Activo' | 'Inactivo' | 'Vacaciones' | 'Licencia';

export interface Profesor {
  id: string;
  codigo?: string; // PROF001, PROF002, etc.
  nombres: string;
  apellidos: string;
  tipoIdentificacion?: TipoIdentificacionProfesor;
  numeroIdentificacion?: string;
  fechaNacimiento?: string;
  genero?: Genero;
  foto?: string;

  // Información de Contacto
  direccion?: string;
  ciudad?: string;
  telefonoFijo?: string;
  telefono: string; // Teléfono Móvil
  email: string; // Email Institucional
  emailPersonal?: string;

  // Contacto de Emergencia
  nombreContactoEmergencia?: string;
  telefonoEmergencia?: string;

  // Formación Académica
  nivelEducacion?: NivelEducacion;
  tituloProfesional?: string;
  institucionEducativa?: string;
  especializacionAcademica?: string;
  anosExperiencia?: number;

  // Información Laboral
  especialidad: string;
  fechaIngreso: string;
  tipoContrato?: TipoContrato;
  salarioBase?: number;
  estado?: EstadoProfesor;
  hojaVida?: string;

  // Asignación
  niveles: Nivel[];
  esTitular?: boolean;

  // Otros
  activo: boolean;
  observaciones?: string;
}

export type EstadoAsistencia = 'presente' | 'ausente' | 'justificado' | 'retardo';
export type MotivoJustificacion = 'Enfermedad' | 'Cita Médica' | 'Calamidad Doméstica' | 'Viaje' | 'Otro';

export interface Justificacion {
  id: string;
  motivo: MotivoJustificacion;
  descripcion: string;
  documento?: string;
  fechaJustificacion: string;
  justificadoPor: string;
  aprobada?: boolean;
}

export interface AsistenciaRegistro {
  id: string;
  estudianteId: string;
  fecha: string;
  presente: boolean;
  estado?: EstadoAsistencia;
  horaLlegada?: string;
  observaciones?: string;
  justificacion?: Justificacion;
  registradoPor: string;
}

export interface CalificacionDetalle {
  dimension: Dimension;
  valoracion: Valoracion;
  observaciones: string;
}

export interface Calificacion {
  id: string;
  estudianteId: string;
  periodo: Periodo;
  año: number;
  calificaciones: CalificacionDetalle[];
  observacionesGenerales?: string;
  registradoPor: string;
  fechaRegistro: string;
}

export interface Boletin {
  estudiante: Estudiante;
  periodo: Periodo;
  año: number;
  calificaciones: CalificacionDetalle[];
  asistencias: {
    total: number;
    presentes: number;
    ausentes: number;
  };
  observacionesGenerales?: string;
}

export type TipoActividad = 'Académica' | 'Artística' | 'Física' | 'Descanso' | 'Almuerzo' | 'Otro';
export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

export interface Horario {
  id: string;
  nivel: Nivel;
  diaSemana: number; // 1-5 (Lunes-Viernes)
  diaSemanaTexto?: DiaSemana;
  horaInicio: string;
  horaFin: string;
  materia: string;
  tipoActividad?: TipoActividad;
  profesorId: string;
  aula?: string;
  color?: string;
  observaciones?: string;
}

export type TipoEvento = 'Festivo' | 'Reunión' | 'Actividad' | 'Evaluación' | 'Ceremonia' | 'Otro';
export type PrioridadEvento = 'Normal' | 'Importante' | 'Urgente';

export interface EventoCalendario {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  fechaFin?: string;
  horaInicio?: string;
  horaFin?: string;
  tipo: TipoEvento;
  lugar?: string;
  niveles?: Nivel[];
  responsableId?: string;
  prioridad?: PrioridadEvento;
  enviarRecordatorio?: boolean;
}

export type PrioridadMensaje = 'Normal' | 'Importante' | 'Urgente';
export type EstadoMensaje = 'Enviado' | 'Entregado' | 'Leído' | 'No Entregado';

export interface Mensaje {
  id: string;
  remitenteId: string;
  destinatarioId: string | string[]; // Puede ser un array para múltiples destinatarios
  asunto: string;
  contenido: string;
  fecha: string;
  leido: boolean;
  importante?: boolean;
  prioridad?: PrioridadMensaje;
  estado?: EstadoMensaje;
  tieneAdjunto?: boolean;
  respondidoA?: string; // ID del mensaje al que se responde
  borrador?: boolean;
}

export type EstadoPago = 'pendiente' | 'pagado' | 'vencido' | 'parcial';
export type MetodoPago = 'Efectivo' | 'Transferencia Bancaria' | 'Tarjeta de Crédito' | 'Tarjeta de Débito' | 'Cheque' | 'Otro';
export type ConceptoPago =
  | 'Matrícula'
  | 'Pensión'
  | 'Materiales Didácticos'
  | 'Uniforme Escolar'
  | 'Transporte Escolar'
  | 'Alimentación'
  | 'Seguro Estudiantil'
  | 'Salida Pedagógica'
  | 'Certificados'
  | 'Actividades Extracurriculares'
  | 'Otro';
export type MesPension = 'Enero' | 'Febrero' | 'Marzo' | 'Abril' | 'Mayo' | 'Junio' | 'Julio' | 'Agosto' | 'Septiembre' | 'Octubre' | 'Noviembre' | 'Diciembre';

export interface Abono {
  id: string;
  pagoId: string;
  fecha: string;
  monto: number;
  metodoPago: MetodoPago;
  numeroReferencia?: string;
  observaciones?: string;
  numeroRecibo: string;
}

export interface Pago {
  id: string;
  numeroRecibo: string;
  estudianteId: string;
  concepto: ConceptoPago;
  descripcionConcepto?: string;
  monto: number;
  montoPagado?: number;
  saldoPendiente?: number;
  fechaVencimiento: string;
  fechaPago?: string;
  estado: EstadoPago;
  periodo?: Periodo;
  mes?: MesPension;
  año: number;
  metodoPago?: MetodoPago;
  numeroReferencia?: string;
  observaciones?: string;
  abonos?: Abono[];
  descuento?: number;
  motivoDescuento?: string;
  generarRecibo?: boolean;
  enviarEmail?: boolean;
}

export interface RecursoEducativo {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'documento' | 'video' | 'imagen' | 'link';
  url: string;
  nivel: Nivel;
  materia: string;
  profesorId: string;
  fechaSubida: string;
}

export interface Estadisticas {
  totalEstudiantes: number;
  totalProfesores: number;
  estudiantesPorNivel: Record<Nivel, number>;
  asistenciaPromedio: number;
  pagosRecaudados: number;
  pagosPendientes: number;
}
