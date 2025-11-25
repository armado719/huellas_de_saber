import React, { useState, useRef } from 'react';
import { FileText, Download, Eye, Search } from 'lucide-react';
import { mockEstudiantes, mockCalificaciones, mockAsistencias, mockProfesores } from '../data/mockData';
import { Boletin, Nivel, Periodo, Valoracion, DATOS_COLEGIO } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Competencias por dimensión (formato real del boletín)
const COMPETENCIAS_COGNITIVA = [
  'Identifica los símbolos patrios (Bandera, Escudo, Himno)',
  'Reconoce las estaciones del año (Verano, Invierno, Otoño y Primavera)',
  'Participa del Desfile Mexica, El transporte en material reciclado',
  'Reconoce el uno y la importancia de la higiene (ojos, verde y amarillo)',
  'Reconoce y cuenta los números del 40 al 50',
  'Identifica los signos de la suma y la resta',
  'Realiza sumas y restas por una cifra (utilizando el Ábaco)',
  'Dibuja elementos en orden secuencial',
  'Relaciona imágenes con palabras cortas',
  'Maneja caracteres especiales (Largo-Corto, Grueso-Delgado, Cerca-Lejos)',
  'Maneja nociones espaciales (Largo-Corto, Grueso-Delgado, Cerca-Lejos)',
];

const COMPETENCIAS_COMUNICATIVA = [
  'Reconoce y visualiza las letras del abecedario',
  'Desarrolla el hábito de la lectura con párrafos cortos (en cartilla Nacho Lee)',
  'Reconoce los fonemas (C, D, S, R, L)',
  'Realiza escritura y pronunciación de fonemas vistos',
  'Deletrea frases cortas y sencillas con fonemas vistos',
  'Práctica escritura de su nombre',
  'Realiza práctica de escritura a través de dictados cortos',
  'Repaso de vocabulario visto en inglés (Saludos, Familia, Colores, Útiles Escolares, animales, prendas de vestir y números)',
  'Aprende canción en inglés (Twinkle twinkle Little star)',
];

const COMPETENCIAS_SOCIO_AFECTIVA = [
  'Expresa sus emociones de manera adecuada (triste, bravo y feliz)',
  'Comparte experiencias de su vida cotidiana',
  'Reconoce las emociones básicas (Alegría, tristeza y enojo en sí mismo y otras personas)',
  'Establece vínculos especiales con sus amigos',
  'Afianza su personalidad de autoconcepto y autonomía',
  'Reconoce que hace parte de un grupo',
  'Participa de las celebraciones especiales (Aniquito secreto, Fiesta del Dulce, La Navidad)',
];

const COMPETENCIAS_SOCIO_ETICA = [
  'Respeta y Valora los momentos de oración',
  'Identifica y practica el valor de la amistad y tolerancia',
  'Reconoce la importancia de los buenos modales',
  'Disfruta de pertenecer a un grupo',
  'Respeta a los integrantes y goza de aceptación',
  'Participa en la elaboración de normas para una convivencia sana y se adapta a ellas',
  'Atiende normas e instrucciones',
  'Reconoce el uso de las palabras mágicas (Gracias, Por favor, disculpe, permiso, lo siento)',
];

const COMPETENCIAS_CORPORAL = [
  'Realiza manualidades utilizando material reciclable',
  'Ejecuta actividades de cortar con tijeras',
  'Reconoce la importancia de reciclar y socializa con desfile',
  'Se ubica Témporo-espacial en actividades propuestas',
  'Realiza actividades Óculo-manual (mano y ojos) y Óculo-pedica (Ojos y pies) en ejercicios',
  'Utiliza su cuerpo y el movimiento como medio de expresión y comunicación',
  'Se organiza de forma correcta en filas y círculos',
  'Realiza ejercicios de coordinación usando diferentes elementos (Aros, Pelotas, Conos, Lazos etc)',
];

const Boletines: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nivelSeleccionado, setNivelSeleccionado] = useState<Nivel>('Párvulos');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<Periodo>(1);
  const [añoSeleccionado, setAñoSeleccionado] = useState(2024);
  const [boletinPreview, setBoletinPreview] = useState<Boletin | null>(null);
  const boletinRef = useRef<HTMLDivElement>(null);

  const niveles: Nivel[] = ['Caminadores', 'Párvulos', 'Prejardín', 'Jardín', 'Transición'];

  const estudiantesDelNivel = mockEstudiantes.filter(
    (est) =>
      est.nivel === nivelSeleccionado &&
      est.activo &&
      (searchTerm === '' ||
        est.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.apellidos.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatearFecha = (fecha: Date): string => {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    return `${dia} de ${mes} de ${año}`;
  };

  const generarBoletin = (estudianteId: string): Boletin | null => {
    const estudiante = mockEstudiantes.find((e) => e.id === estudianteId);
    if (!estudiante) return null;

    const calificacion = mockCalificaciones.find(
      (c) =>
        c.estudianteId === estudianteId &&
        c.periodo === periodoSeleccionado &&
        c.año === añoSeleccionado
    );

    if (!calificacion) return null;

    // Buscar el profesor del nivel
    const profesor = mockProfesores.find((p) => p.niveles.includes(estudiante.nivel));

    const asistenciasEstudiante = mockAsistencias.filter(
      (a) => a.estudianteId === estudianteId
    );

    const presentes = asistenciasEstudiante.filter((a) => a.presente).length;
    const total = asistenciasEstudiante.length;
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;

    return {
      estudiante,
      periodo: periodoSeleccionado,
      año: añoSeleccionado,
      fecha: formatearFecha(new Date()),
      maestra: profesor ? `${profesor.nombres} ${profesor.apellidos}` : 'Sin asignar',
      calificaciones: calificacion.calificaciones,
      asistencias: {
        total,
        presentes,
        ausentes: total - presentes,
        porcentaje,
      },
      observacionesGenerales: calificacion.observacionesGenerales,
    };
  };

  const handleVerBoletin = (estudianteId: string) => {
    const boletin = generarBoletin(estudianteId);
    if (boletin) {
      setBoletinPreview(boletin);
    } else {
      alert('No hay calificaciones registradas para este periodo');
    }
  };

  const handleDescargarPDF = async () => {
    if (!boletinRef.current) return;

    const canvas = await html2canvas(boletinRef.current, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'letter');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(
      `Boletin_${boletinPreview?.estudiante.nombres}_${boletinPreview?.estudiante.apellidos}_P${periodoSeleccionado}_${añoSeleccionado}.pdf`
    );
  };

  const getValoracionColor = (valoracion: string) => {
    switch (valoracion) {
      case 'Superior':
        return 'bg-green-500';
      case 'Alto':
        return 'bg-blue-500';
      case 'Básico':
        return 'bg-yellow-500';
      case 'Bajo':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEmojiValoracion = (valoracion: Valoracion) => {
    switch (valoracion) {
      case 'Superior':
        return '😊';
      case 'Alto':
        return '😐';
      case 'Básico':
        return '😐';
      case 'Bajo':
        return '☹️';
      default:
        return '';
    }
  };

  // Generar valoraciones aleatorias para competencias (simulación)
  const generarValoracionAleatoria = (): Valoracion => {
    const valoraciones: Valoracion[] = ['Superior', 'Alto', 'Básico', 'Bajo'];
    return valoraciones[Math.floor(Math.random() * valoraciones.length)];
  };

  const renderTablaCompetencias = (nombreDimension: string, competencias: string[]) => {
    return (
      <div className="mb-6">
        <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase bg-gray-100 p-2 rounded">
          {nombreDimension}
        </h4>
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left font-bold w-[70%]">
                COMPETENCIAS
              </th>
              <th className="border border-black p-1 text-center w-[10%]">
                <div className="flex flex-col items-center">
                  <span className="text-2xl">😊</span>
                </div>
              </th>
              <th className="border border-black p-1 text-center w-[10%]">
                <div className="flex flex-col items-center">
                  <span className="text-2xl">😐</span>
                </div>
              </th>
              <th className="border border-black p-1 text-center w-[10%]">
                <div className="flex flex-col items-center">
                  <span className="text-2xl">☹️</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {competencias.map((competencia, idx) => {
              const valoracion = generarValoracionAleatoria();
              return (
                <tr key={idx}>
                  <td className="border border-black p-2 text-justify">{competencia}</td>
                  <td className="border border-black p-1 text-center">
                    {valoracion === 'Superior' ? 'X' : ''}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {valoracion === 'Alto' || valoracion === 'Básico' ? 'X' : ''}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {valoracion === 'Bajo' ? 'X' : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <FileText className="w-8 h-8 text-primary mr-3" />
          Boletines Académicos
        </h1>
        <p className="text-gray-600">
          Genera y descarga los boletines de calificaciones con el formato oficial
        </p>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Nivel</label>
            <select
              value={nivelSeleccionado}
              onChange={(e) => setNivelSeleccionado(e.target.value as Nivel)}
              className="input-field"
            >
              {niveles.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {nivel}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Periodo</label>
            <select
              value={periodoSeleccionado}
              onChange={(e) =>
                setPeriodoSeleccionado(Number(e.target.value) as Periodo)
              }
              className="input-field"
            >
              <option value={1}>Periodo I</option>
              <option value={2}>Periodo II</option>
              <option value={3}>Periodo III</option>
              <option value={4}>Periodo IV</option>
            </select>
          </div>
          <div>
            <label className="label">Año</label>
            <select
              value={añoSeleccionado}
              onChange={(e) => setAñoSeleccionado(Number(e.target.value))}
              className="input-field"
            >
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
          </div>
          <div>
            <label className="label">
              <Search className="w-4 h-4 inline mr-2" />
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              placeholder="Buscar estudiante..."
            />
          </div>
        </div>
      </div>

      {!boletinPreview ? (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Seleccionar Estudiante
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estudiantesDelNivel.map((estudiante) => (
              <div
                key={estudiante.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-800 mb-2">
                  {estudiante.nombres} {estudiante.apellidos}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Nivel: {estudiante.nivel}
                </p>
                <button
                  onClick={() => handleVerBoletin(estudiante.id)}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Boletín
                </button>
              </div>
            ))}
          </div>

          {estudiantesDelNivel.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron estudiantes</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setBoletinPreview(null)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={handleDescargarPDF}
              className="btn-primary flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Descargar PDF
            </button>
          </div>

          {/* Vista Previa del Boletín */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div ref={boletinRef} className="p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
              {/* Header Institucional */}
              <div className="text-center border-b-4 border-primary pb-4 mb-6">
                <div className="flex justify-center items-center mb-3">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-2">
                    <img
                      src="/images/escudo.png"
                      alt="Escudo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <h1 className="text-xl font-bold text-primary mb-1">
                  {DATOS_COLEGIO.nombreCompleto}
                </h1>
                <p className="text-xs text-gray-700 font-semibold">NIT: {DATOS_COLEGIO.nit}</p>
                <p className="text-xs text-gray-700">{DATOS_COLEGIO.direccion}</p>
                <p className="text-xs text-gray-700">
                  Tel: {DATOS_COLEGIO.telefono} | Email: {DATOS_COLEGIO.email}
                </p>
                <p className="text-xs text-gray-700">
                  {DATOS_COLEGIO.ciudad}, {DATOS_COLEGIO.departamento} - Colombia
                </p>
                <h2 className="text-lg font-bold text-gray-800 mt-3">
                  INFORME ACADÉMICO
                </h2>
              </div>

              {/* Información del Estudiante */}
              <div className="mb-6 border-2 border-gray-300 rounded p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-semibold">Período:</span> {boletinPreview.periodo} (
                    {boletinPreview.periodo === 1
                      ? 'I'
                      : boletinPreview.periodo === 2
                      ? 'II'
                      : boletinPreview.periodo === 3
                      ? 'III'
                      : 'IV'}
                    )
                  </div>
                  <div>
                    <span className="font-semibold">Fecha:</span> {boletinPreview.fecha}
                  </div>
                  <div>
                    <span className="font-semibold">Nombre:</span>{' '}
                    {boletinPreview.estudiante.nombres} {boletinPreview.estudiante.apellidos}
                  </div>
                  <div>
                    <span className="font-semibold">Maestra:</span> {boletinPreview.maestra}
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">Nivel:</span>{' '}
                    <span className="uppercase font-bold">{boletinPreview.estudiante.nivel}</span>
                  </div>
                </div>
              </div>

              {/* Dimensiones con Competencias */}
              <div className="mb-6">
                {renderTablaCompetencias('DIMENSIÓN COGNITIVA', COMPETENCIAS_COGNITIVA)}
                {renderTablaCompetencias(
                  'DIMENSIÓN COMUNICATIVA (Pre-Lectura/Pre-Escritura e Inglés)',
                  COMPETENCIAS_COMUNICATIVA
                )}
                {renderTablaCompetencias(
                  'DIMENSIÓN SOCIO-AFECTIVA (Actitudes y Valores)',
                  COMPETENCIAS_SOCIO_AFECTIVA
                )}
                {renderTablaCompetencias(
                  'DIMENSIÓN SOCIO-ÉTICA (Religión-Ética)',
                  COMPETENCIAS_SOCIO_ETICA
                )}
                {renderTablaCompetencias(
                  'DIMENSIÓN CORPORAL (Educación Artística y Educación Física)',
                  COMPETENCIAS_CORPORAL
                )}
              </div>

              {/* Asistencia */}
              <div className="mb-6 border-2 border-gray-300 rounded p-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase">
                  ASISTENCIA
                </h3>
                <table className="w-full border-collapse border border-black text-xs">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-black p-2">Total Días</th>
                      <th className="border border-black p-2">Presentes</th>
                      <th className="border border-black p-2">Ausentes</th>
                      <th className="border border-black p-2">Porcentaje de Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-center font-bold">
                        {boletinPreview.asistencias.total}
                      </td>
                      <td className="border border-black p-2 text-center font-bold text-green-600">
                        {boletinPreview.asistencias.presentes}
                      </td>
                      <td className="border border-black p-2 text-center font-bold text-red-600">
                        {boletinPreview.asistencias.ausentes}
                      </td>
                      <td className="border border-black p-2 text-center font-bold text-primary">
                        {boletinPreview.asistencias.porcentaje}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Observaciones Generales */}
              <div className="mb-6 border-2 border-gray-300 rounded p-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase">
                  OBSERVACIONES GENERALES
                </h3>
                <p className="text-xs text-gray-700 text-justify">
                  {boletinPreview.observacionesGenerales ||
                    'El estudiante muestra un desempeño satisfactorio en todas las dimensiones trabajadas durante el periodo.'}
                </p>
              </div>

              {/* Escala de Valoración */}
              <div className="border-2 border-gray-300 rounded p-4 mb-6">
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase">
                  ESCALA DE VALORACIÓN
                </h3>
                <div className="flex flex-wrap gap-4 justify-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 rounded-full font-bold text-white bg-green-500">
                      Superior
                    </span>
                    <span>😊</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 rounded-full font-bold text-white bg-blue-500">
                      Alto
                    </span>
                    <span>😐</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 rounded-full font-bold text-white bg-yellow-500">
                      Básico
                    </span>
                    <span>😐</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 rounded-full font-bold text-white bg-red-500">
                      Bajo
                    </span>
                    <span>☹️</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-4 border-t-2 border-gray-300">
                <p className="text-xs text-gray-600">
                  Documento generado el {formatearFecha(new Date())}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Este documento es de carácter oficial y certifica el desempeño
                  académico del estudiante
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Boletines;
