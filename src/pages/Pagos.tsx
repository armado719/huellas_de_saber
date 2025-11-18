import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { mockPagos, mockEstudiantes } from '../data/mockData';
import { Pago } from '../types';

const Pagos: React.FC = () => {
  const [pagos] = useState<Pago[]>(mockPagos);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('');

  const pagosFiltrados = pagos.filter((pago) => {
    const estudiante = mockEstudiantes.find((e) => e.id === pago.estudianteId);
    const nombreCompleto = estudiante
      ? `${estudiante.nombres} ${estudiante.apellidos}`
      : '';

    const matchesSearch =
      nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.concepto.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = estadoFiltro ? pago.estado === estadoFiltro : true;

    return matchesSearch && matchesEstado;
  });

  const totalRecaudado = pagos
    .filter((p) => p.estado === 'pagado')
    .reduce((sum, p) => sum + p.monto, 0);

  const totalPendiente = pagos
    .filter((p) => p.estado === 'pendiente' || p.estado === 'vencido')
    .reduce((sum, p) => sum + p.monto, 0);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return 'bg-green-100 text-green-700';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-700';
      case 'vencido':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return <CheckCircle className="w-5 h-5" />;
      case 'pendiente':
        return <AlertCircle className="w-5 h-5" />;
      case 'vencido':
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getEstudianteNombre = (estudianteId: string) => {
    const estudiante = mockEstudiantes.find((e) => e.id === estudianteId);
    return estudiante
      ? `${estudiante.nombres} ${estudiante.apellidos}`
      : 'N/A';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <CreditCard className="w-8 h-8 text-primary mr-3" />
          Gestión de Pagos
        </h1>
        <p className="text-gray-600">
          Administra los pagos de matrícula y pensiones
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Recaudado</p>
              <p className="text-3xl font-bold">
                ${totalRecaudado.toLocaleString('es-CO')}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Pendiente</p>
              <p className="text-3xl font-bold">
                ${totalPendiente.toLocaleString('es-CO')}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Esperado</p>
              <p className="text-3xl font-bold">
                ${(totalRecaudado + totalPendiente).toLocaleString('es-CO')}
              </p>
            </div>
            <CreditCard className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Buscar por estudiante o concepto..."
            />
          </div>
          <div>
            <label className="label">
              <Filter className="w-4 h-4 inline mr-2" />
              Filtrar por Estado
            </label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="input-field"
            >
              <option value="">Todos los estados</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Pagos */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4">Estudiante</th>
              <th className="text-left py-3 px-4">Concepto</th>
              <th className="text-right py-3 px-4">Monto</th>
              <th className="text-left py-3 px-4">Fecha Vencimiento</th>
              <th className="text-left py-3 px-4">Fecha Pago</th>
              <th className="text-center py-3 px-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {pagosFiltrados.map((pago) => (
              <tr
                key={pago.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {getEstudianteNombre(pago.estudianteId)}
                    </p>
                    <p className="text-xs text-gray-600">{pago.estudianteId}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="text-gray-800">{pago.concepto}</p>
                  {pago.periodo && (
                    <p className="text-xs text-gray-600">
                      Periodo {pago.periodo}
                    </p>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <p className="font-bold text-gray-800">
                    ${pago.monto.toLocaleString('es-CO')}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm text-gray-700">
                    {new Date(pago.fechaVencimiento).toLocaleDateString('es-CO')}
                  </p>
                </td>
                <td className="py-3 px-4">
                  {pago.fechaPago ? (
                    <p className="text-sm text-gray-700">
                      {new Date(pago.fechaPago).toLocaleDateString('es-CO')}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">-</p>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(
                      pago.estado
                    )}`}
                  >
                    {getEstadoIcon(pago.estado)}
                    <span className="ml-2 capitalize">{pago.estado}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron pagos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagos;
