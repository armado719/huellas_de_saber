import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { mockHorarios, mockEventos, mockProfesores } from '../data/mockData';
import { Nivel } from '../types';

const Horarios: React.FC = () => {
  const [nivelSeleccionado, setNivelSeleccionado] = useState<Nivel>('Transición');

  const niveles: Nivel[] = ['Caminadores', 'Párvulos', 'Prejardín', 'Jardín', 'Transición'];
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  const horariosDelNivel = mockHorarios.filter(
    (h) => h.nivel === nivelSeleccionado
  );

  const getProfesorNombre = (profesorId: string) => {
    const profesor = mockProfesores.find((p) => p.id === profesorId);
    return profesor ? `${profesor.nombres} ${profesor.apellidos}` : 'N/A';
  };

  const eventosProximos = mockEventos
    .filter((e) => new Date(e.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 5);

  const getTipoEventoColor = (tipo: string) => {
    switch (tipo) {
      case 'academico':
        return 'bg-blue-100 text-blue-700';
      case 'festivo':
        return 'bg-green-100 text-green-700';
      case 'reunion':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <Calendar className="w-8 h-8 text-primary mr-3" />
          Horarios y Calendario
        </h1>
        <p className="text-gray-600">
          Consulta los horarios de clase y eventos del calendario escolar
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horarios */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Clock className="w-6 h-6 text-primary mr-2" />
                Horario de Clases
              </h2>
              <select
                value={nivelSeleccionado}
                onChange={(e) => setNivelSeleccionado(e.target.value as Nivel)}
                className="input-field w-auto"
              >
                {niveles.map((nivel) => (
                  <option key={nivel} value={nivel}>
                    {nivel}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold">Hora</th>
                    {diasSemana.map((dia, index) => (
                      <th key={index} className="text-center py-3 px-4 font-semibold">
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['08:00-09:00', '09:00-10:00', '10:00-10:30', '10:30-11:30'].map(
                    (hora, horaIndex) => (
                      <tr key={horaIndex} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-sm text-gray-600">
                          {hora}
                        </td>
                        {diasSemana.map((_, diaIndex) => {
                          const horario = horariosDelNivel.find(
                            (h) =>
                              h.diaSemana === diaIndex + 1 &&
                              h.horaInicio === hora.split('-')[0]
                          );
                          return (
                            <td key={diaIndex} className="py-3 px-4 text-center">
                              {horario ? (
                                <div
                                  className={`p-2 rounded-lg ${
                                    horario.materia === 'Descanso'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-primary/10 text-primary'
                                  }`}
                                >
                                  <p className="font-semibold text-sm">
                                    {horario.materia}
                                  </p>
                                  {horario.materia !== 'Descanso' && (
                                    <p className="text-xs mt-1">
                                      {getProfesorNombre(horario.profesorId)}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Calendario de Eventos */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-6 h-6 text-primary mr-2" />
              Próximos Eventos
            </h2>

            <div className="space-y-3">
              {eventosProximos.map((evento) => (
                <div
                  key={evento.id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {evento.titulo}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getTipoEventoColor(
                        evento.tipo
                      )}`}
                    >
                      {evento.tipo}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {evento.descripcion}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(evento.fecha).toLocaleDateString('es-CO', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))}

              {eventosProximos.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No hay eventos próximos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Horarios;
