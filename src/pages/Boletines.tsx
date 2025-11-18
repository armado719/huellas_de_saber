import React, { useState, useRef } from 'react';
import { FileText, Download, Eye, Search } from 'lucide-react';
import { mockEstudiantes, mockCalificaciones, mockAsistencias } from '../data/mockData';
import { Boletin, Nivel, Periodo } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Boletines: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nivelSeleccionado, setNivelSeleccionado] = useState<Nivel>('Transición');
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

    const asistenciasEstudiante = mockAsistencias.filter(
      (a) => a.estudianteId === estudianteId
    );

    const presentes = asistenciasEstudiante.filter((a) => a.presente).length;
    const total = asistenciasEstudiante.length;

    return {
      estudiante,
      periodo: periodoSeleccionado,
      año: añoSeleccionado,
      calificaciones: calificacion.calificaciones,
      asistencias: {
        total,
        presentes,
        ausentes: total - presentes,
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
        return 'text-green-700 bg-green-100';
      case 'Alto':
        return 'text-blue-700 bg-blue-100';
      case 'Básico':
        return 'text-yellow-700 bg-yellow-100';
      case 'Bajo':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <FileText className="w-8 h-8 text-primary mr-3" />
          Boletines Académicos
        </h1>
        <p className="text-gray-600">
          Genera y descarga los boletines de calificaciones
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
              <option value={1}>Periodo 1</option>
              <option value={2}>Periodo 2</option>
              <option value={3}>Periodo 3</option>
              <option value={4}>Periodo 4</option>
            </select>
          </div>
          <div>
            <label className="label">Año</label>
            <select
              value={añoSeleccionado}
              onChange={(e) => setAñoSeleccionado(Number(e.target.value))}
              className="input-field"
            >
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
            <div ref={boletinRef} className="p-8 bg-white">
              {/* Header */}
              <div className="text-center border-b-4 border-primary pb-6 mb-6 bg-gray-50 rounded-t-lg">
                <div className="flex justify-center items-center mb-4 gap-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg p-2">
                    <img
                      src="/images/escudo.png"
                      alt="Escudo Huellas Del Saber"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-primary mb-2">
                  GIMNASIO PEDAGÓGICO HUELLAS DEL SABER
                </h1>
                <p className="text-gray-700 font-semibold">
                  Calle 24A #34 Bis-35, Neiva, Colombia
                </p>
                <p className="text-gray-700">Tel: 316 7927255</p>
                <h2 className="text-2xl font-bold text-gray-800 mt-4">
                  BOLETÍN ACADÉMICO
                </h2>
                <p className="text-lg text-gray-700 mt-2">
                  Periodo {boletinPreview.periodo} - Año {boletinPreview.año}
                </p>
              </div>

              {/* Información del Estudiante */}
              <div className="mb-6 border-2 border-primary/20 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3 bg-primary px-4 py-2 rounded shadow-md">
                  INFORMACIÓN DEL ESTUDIANTE
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-semibold">Nombre:</span>{' '}
                    {boletinPreview.estudiante.nombres}{' '}
                    {boletinPreview.estudiante.apellidos}
                  </div>
                  <div>
                    <span className="font-semibold">Nivel:</span>{' '}
                    {boletinPreview.estudiante.nivel}
                  </div>
                  <div>
                    <span className="font-semibold">Fecha de Nacimiento:</span>{' '}
                    {new Date(
                      boletinPreview.estudiante.fechaNacimiento
                    ).toLocaleDateString('es-CO')}
                  </div>
                  <div>
                    <span className="font-semibold">ID:</span>{' '}
                    {boletinPreview.estudiante.id}
                  </div>
                </div>
              </div>

              {/* Calificaciones por Dimensión */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-3 bg-primary px-4 py-2 rounded shadow-md">
                  VALORACIÓN POR DIMENSIONES
                </h3>
                <div className="space-y-4">
                  {boletinPreview.calificaciones.map((cal) => (
                    <div
                      key={cal.dimension}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800">
                          {cal.dimension}
                        </h4>
                        <span
                          className={`px-4 py-1 rounded-full font-bold ${getValoracionColor(
                            cal.valoracion
                          )}`}
                        >
                          {cal.valoracion}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {cal.observaciones}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Asistencia */}
              <div className="mb-6 border-2 border-primary/20 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3 bg-primary px-4 py-2 rounded shadow-md">
                  ASISTENCIA
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Días</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {boletinPreview.asistencias.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Presentes</p>
                    <p className="text-2xl font-bold text-green-600">
                      {boletinPreview.asistencias.presentes}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ausentes</p>
                    <p className="text-2xl font-bold text-red-600">
                      {boletinPreview.asistencias.ausentes}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600">Porcentaje de Asistencia</p>
                  <p className="text-3xl font-bold text-primary">
                    {boletinPreview.asistencias.total > 0
                      ? Math.round(
                          (boletinPreview.asistencias.presentes /
                            boletinPreview.asistencias.total) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>

              {/* Observaciones Generales */}
              {boletinPreview.observacionesGenerales && (
                <div className="mb-6 border-2 border-primary/20 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-3 bg-primary px-4 py-2 rounded shadow-md">
                    OBSERVACIONES GENERALES
                  </h3>
                  <p className="text-sm text-gray-700">
                    {boletinPreview.observacionesGenerales}
                  </p>
                </div>
              )}

              {/* Escala de Valoración */}
              <div className="border border-gray-300 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  ESCALA DE VALORACIÓN
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="flex items-center">
                    <span className="px-3 py-1 rounded-full font-bold text-green-700 bg-green-100 mr-2">
                      Superior
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="px-3 py-1 rounded-full font-bold text-blue-700 bg-blue-100 mr-2">
                      Alto
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="px-3 py-1 rounded-full font-bold text-yellow-700 bg-yellow-100 mr-2">
                      Básico
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="px-3 py-1 rounded-full font-bold text-red-700 bg-red-100 mr-2">
                      Bajo
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-6 border-t-2 border-gray-300">
                <p className="text-sm text-gray-600">
                  Documento generado el {new Date().toLocaleDateString('es-CO')}
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
