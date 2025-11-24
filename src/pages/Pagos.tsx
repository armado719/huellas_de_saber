import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Plus,
  Eye,
  Printer,
  Download,
  Send,
  FileText,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Mail,
  DollarSign,
  Calendar,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import { mockPagos, mockEstudiantes } from '../data/mockData';
import {
  Pago,
  Estudiante,
  ConceptoPago,
  MetodoPago,
  MesPension,
  EstadoPago,
  Abono,
} from '../types';

type TipoOrden = 'asc' | 'desc';
type CampoOrden = 'estudiante' | 'concepto' | 'monto' | 'fechaVencimiento' | 'estado';

const Pagos: React.FC = () => {
  // ========== ESTADOS ==========
  const [pagos, setPagos] = useState<Pago[]>(mockPagos);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('');
  const [conceptoFiltro, setConceptoFiltro] = useState<string>('');
  const [mesFiltro, setMesFiltro] = useState<string>('');
  const [nivelFiltro, setNivelFiltro] = useState<string>('');
  const [estudianteFiltro, setEstudianteFiltro] = useState<string>('');

  // Paginación y ordenamiento
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [campoOrden, setCampoOrden] = useState<CampoOrden>('fechaVencimiento');
  const [tipoOrden, setTipoOrden] = useState<TipoOrden>('desc');

  // Selección múltiple
  const [pagosSeleccionados, setPagosSeleccionados] = useState<string[]>([]);

  // Modales
  const [showNuevoPago, setShowNuevoPago] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [showReportes, setShowReportes] = useState(false);
  const [showRecordatorios, setShowRecordatorios] = useState(false);
  const [pagoDetalle, setPagoDetalle] = useState<Pago | null>(null);

  // Confirmación
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');

  // Formulario nuevo pago
  const [nuevoPago, setNuevoPago] = useState<Partial<Pago>>({
    estudianteId: '',
    concepto: 'Pensión',
    monto: 0,
    estado: 'pendiente',
    año: 2024,
    generarRecibo: true,
    enviarEmail: false,
  });
  const [tipoPago, setTipoPago] = useState<'completo' | 'parcial'>('completo');
  const [nivelFormulario, setNivelFormulario] = useState<string>('');

  // ========== FUNCIONES AUXILIARES ==========
  const getEstudianteNombre = (estudianteId: string) => {
    const estudiante = mockEstudiantes.find((e) => e.id === estudianteId);
    return estudiante ? `${estudiante.nombres} ${estudiante.apellidos}` : 'N/A';
  };

  const getEstudiante = (estudianteId: string): Estudiante | undefined => {
    return mockEstudiantes.find((e) => e.id === estudianteId);
  };

  const formatearMoneda = (monto: number) => {
    return `$${monto.toLocaleString('es-CO')}`;
  };

  const getEstadoColor = (estado: EstadoPago) => {
    switch (estado) {
      case 'pagado':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'vencido':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'parcial':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getEstadoIcon = (estado: EstadoPago) => {
    switch (estado) {
      case 'pagado':
        return <CheckCircle className="w-4 h-4" />;
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      case 'vencido':
        return <XCircle className="w-4 h-4" />;
      case 'parcial':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const diasParaVencimiento = (fechaVencimiento: string): number => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferencia = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  // ========== FILTRADO Y ORDENAMIENTO ==========
  const pagosFiltrados = useMemo(() => {
    let resultado = [...pagos];

    // Búsqueda
    if (searchTerm) {
      resultado = resultado.filter((pago) => {
        const nombreEstudiante = getEstudianteNombre(pago.estudianteId).toLowerCase();
        const concepto = pago.concepto.toLowerCase();
        const recibo = pago.numeroRecibo.toLowerCase();
        const busqueda = searchTerm.toLowerCase();

        return (
          nombreEstudiante.includes(busqueda) ||
          concepto.includes(busqueda) ||
          recibo.includes(busqueda)
        );
      });
    }

    // Filtros
    if (estadoFiltro) {
      resultado = resultado.filter((p) => p.estado === estadoFiltro);
    }
    if (conceptoFiltro) {
      resultado = resultado.filter((p) => p.concepto === conceptoFiltro);
    }
    if (mesFiltro) {
      resultado = resultado.filter((p) => p.mes === mesFiltro);
    }
    if (nivelFiltro) {
      resultado = resultado.filter((p) => {
        const estudiante = getEstudiante(p.estudianteId);
        return estudiante && estudiante.nivel === nivelFiltro;
      });
    }
    if (estudianteFiltro) {
      resultado = resultado.filter((p) => p.estudianteId === estudianteFiltro);
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (campoOrden) {
        case 'estudiante':
          valorA = getEstudianteNombre(a.estudianteId);
          valorB = getEstudianteNombre(b.estudianteId);
          break;
        case 'concepto':
          valorA = a.concepto;
          valorB = b.concepto;
          break;
        case 'monto':
          valorA = a.monto;
          valorB = b.monto;
          break;
        case 'fechaVencimiento':
          valorA = new Date(a.fechaVencimiento).getTime();
          valorB = new Date(b.fechaVencimiento).getTime();
          break;
        case 'estado':
          valorA = a.estado;
          valorB = b.estado;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return tipoOrden === 'asc' ? -1 : 1;
      if (valorA > valorB) return tipoOrden === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [
    pagos,
    searchTerm,
    estadoFiltro,
    conceptoFiltro,
    mesFiltro,
    nivelFiltro,
    estudianteFiltro,
    campoOrden,
    tipoOrden,
  ]);

  // Paginación
  const totalPaginas = Math.ceil(pagosFiltrados.length / registrosPorPagina);
  const pagosPaginados = pagosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  // ========== ESTADÍSTICAS ==========
  const totalRecaudado = pagos
    .filter((p) => p.estado === 'pagado')
    .reduce((sum, p) => sum + (p.montoPagado || p.monto), 0);

  const totalPendiente = pagos
    .filter((p) => p.estado === 'pendiente' || p.estado === 'vencido')
    .reduce((sum, p) => sum + p.monto, 0);

  const totalParcial = pagos
    .filter((p) => p.estado === 'parcial')
    .reduce((sum, p) => sum + (p.saldoPendiente || 0), 0);

  const pagosVencidos = pagos.filter((p) => p.estado === 'vencido').length;

  // ========== FUNCIONES DE ACCIÓN ==========
  const handleOrdenar = (campo: CampoOrden) => {
    if (campoOrden === campo) {
      setTipoOrden(tipoOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrden(campo);
      setTipoOrden('asc');
    }
  };

  const toggleSeleccionarPago = (id: string) => {
    if (pagosSeleccionados.includes(id)) {
      setPagosSeleccionados(pagosSeleccionados.filter((p) => p !== id));
    } else {
      setPagosSeleccionados([...pagosSeleccionados, id]);
    }
  };

  const seleccionarTodos = () => {
    if (pagosSeleccionados.length === pagosPaginados.length) {
      setPagosSeleccionados([]);
    } else {
      setPagosSeleccionados(pagosPaginados.map((p) => p.id));
    }
  };

  const handleVerDetalle = (pago: Pago) => {
    setPagoDetalle(pago);
    setShowDetalle(true);
  };

  const handleCerrarModalNuevoPago = () => {
    setShowNuevoPago(false);
    setNivelFormulario('');
    setNuevoPago({
      estudianteId: '',
      concepto: 'Pensión',
      monto: 0,
      estado: 'pendiente',
      año: 2024,
      generarRecibo: true,
      enviarEmail: false,
    });
    setTipoPago('completo');
  };

  const handleRegistrarPago = () => {
    // Validaciones
    if (!nivelFormulario) {
      alert('Debe seleccionar un nivel educativo');
      return;
    }
    if (!nuevoPago.estudianteId) {
      alert('Debe seleccionar un estudiante');
      return;
    }
    if (!nuevoPago.monto || nuevoPago.monto <= 0) {
      alert('El monto debe ser mayor a cero');
      return;
    }
    if (!nuevoPago.fechaVencimiento) {
      alert('Debe especificar una fecha de vencimiento');
      return;
    }

    const numeroRecibo = `REC-2024-${String(pagos.length + 1).padStart(3, '0')}`;

    const pago: Pago = {
      id: `pago${Date.now()}`,
      numeroRecibo,
      estudianteId: nuevoPago.estudianteId,
      concepto: nuevoPago.concepto as ConceptoPago,
      descripcionConcepto: nuevoPago.descripcionConcepto,
      monto: nuevoPago.monto,
      montoPagado:
        tipoPago === 'parcial' && nuevoPago.montoPagado
          ? nuevoPago.montoPagado
          : tipoPago === 'completo'
          ? nuevoPago.monto
          : 0,
      saldoPendiente:
        tipoPago === 'parcial' && nuevoPago.montoPagado
          ? nuevoPago.monto - nuevoPago.montoPagado
          : 0,
      fechaVencimiento: nuevoPago.fechaVencimiento!,
      fechaPago: tipoPago === 'completo' ? nuevoPago.fechaPago : undefined,
      estado:
        tipoPago === 'completo'
          ? 'pagado'
          : tipoPago === 'parcial'
          ? 'parcial'
          : 'pendiente',
      periodo: nuevoPago.periodo,
      mes: nuevoPago.mes,
      año: nuevoPago.año || 2024,
      metodoPago: nuevoPago.metodoPago,
      numeroReferencia: nuevoPago.numeroReferencia,
      observaciones: nuevoPago.observaciones,
      abonos:
        tipoPago === 'parcial' && nuevoPago.montoPagado
          ? [
              {
                id: `abn${Date.now()}`,
                pagoId: `pago${Date.now()}`,
                fecha: nuevoPago.fechaPago || new Date().toISOString().split('T')[0],
                monto: nuevoPago.montoPagado,
                metodoPago: nuevoPago.metodoPago as MetodoPago,
                numeroReferencia: nuevoPago.numeroReferencia,
                numeroRecibo: `ABON-${String(Date.now()).slice(-3)}`,
              },
            ]
          : [],
    };

    setPagos([...pagos, pago]);
    setShowNuevoPago(false);
    setNuevoPago({
      estudianteId: '',
      concepto: 'Pensión',
      monto: 0,
      estado: 'pendiente',
      año: 2024,
      generarRecibo: true,
      enviarEmail: false,
    });
    setTipoPago('completo');
    setNivelFormulario('');
    mostrarConfirmacion('Pago registrado exitosamente ✓');
  };

  const handleImprimirRecibo = (pago: Pago) => {
    const estudiante = getEstudiante(pago.estudianteId);
    if (!estudiante) return;

    // Crear un div temporal para el recibo
    const reciboHTML = document.createElement('div');
    reciboHTML.style.padding = '40px';
    reciboHTML.style.fontFamily = 'Arial, sans-serif';
    reciboHTML.style.backgroundColor = 'white';
    reciboHTML.style.width = '800px';

    reciboHTML.innerHTML = `
      <div style="text-align: center; border-bottom: 3px solid #008751; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #008751; margin: 0;">GIMNASIO PEDAGÓGICO HUELLAS DEL SABER</h1>
        <p style="margin: 5px 0; font-size: 14px;">Calle 24A #34 Bis-35, Neiva, Colombia</p>
        <p style="margin: 5px 0; font-size: 14px;">Tel: 316 7927255 | NIT: 900.123.456-7</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <h2 style="color: #C1272D; margin: 0;">RECIBO DE PAGO No. ${pago.numeroRecibo}</h2>
        <p style="margin: 10px 0; font-size: 14px;">Fecha de emisión: ${new Date().toLocaleDateString(
          'es-CO'
        )}</p>
      </div>

      <div style="margin: 30px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; background-color: #f3f4f6;"><strong>Recibido de:</strong></td>
            <td style="padding: 10px;">${estudiante.nombres} ${estudiante.apellidos}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background-color: #f3f4f6;"><strong>ID Estudiante:</strong></td>
            <td style="padding: 10px;">${estudiante.id}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background-color: #f3f4f6;"><strong>Nivel:</strong></td>
            <td style="padding: 10px;">${estudiante.nivel}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #008751; border-bottom: 2px solid #008751; padding-bottom: 10px;">DETALLE DEL PAGO</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #008751; color: white;">
              <th style="padding: 12px; text-align: left;">Concepto</th>
              <th style="padding: 12px; text-align: left;">Descripción</th>
              <th style="padding: 12px; text-align: right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${pago.concepto}${
      pago.mes ? ` - ${pago.mes}` : ''
    }</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${
                pago.descripcionConcepto || '-'
              }</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatearMoneda(
                pago.monto
              )}</td>
            </tr>
            ${
              pago.descuento
                ? `<tr>
              <td colspan="2" style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Descuento (${
                pago.motivoDescuento || ''
              })</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #10B981;">-${formatearMoneda(
                pago.descuento
              )}</td>
            </tr>`
                : ''
            }
            <tr>
              <td colspan="2" style="padding: 15px; text-align: right;"><strong>TOTAL:</strong></td>
              <td style="padding: 15px; text-align: right; font-size: 18px; font-weight: bold; color: #008751;">${formatearMoneda(
                pago.montoPagado || pago.monto
              )}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin: 30px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; background-color: #f3f4f6;"><strong>Método de pago:</strong></td>
            <td style="padding: 10px;">${pago.metodoPago || 'N/A'}</td>
          </tr>
          ${
            pago.numeroReferencia
              ? `<tr>
            <td style="padding: 10px; background-color: #f3f4f6;"><strong>Referencia:</strong></td>
            <td style="padding: 10px;">${pago.numeroReferencia}</td>
          </tr>`
              : ''
          }
          <tr>
            <td style="padding: 10px; background-color: #f3f4f6;"><strong>Fecha de pago:</strong></td>
            <td style="padding: 10px;">${
              pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString('es-CO') : 'Pendiente'
            }</td>
          </tr>
        </table>
      </div>

      ${
        pago.observaciones
          ? `<div style="margin: 30px 0; padding: 15px; background-color: #FEF3C7; border-left: 4px solid #F59E0B;">
        <strong>Observaciones:</strong><br/>
        ${pago.observaciones}
      </div>`
          : ''
      }

      <div style="margin-top: 60px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
        <div style="display: inline-block; width: 45%; vertical-align: top;">
          <div style="border-top: 1px solid #000; padding-top: 5px; margin-top: 50px;">
            <strong>Firma Responsable</strong><br/>
            <small>Nombre y Cargo</small>
          </div>
        </div>
        <div style="display: inline-block; width: 45%; margin-left: 8%; vertical-align: top;">
          <div style="border-top: 1px solid #000; padding-top: 5px; margin-top: 50px;">
            <strong>Firma Acudiente</strong><br/>
            <small>C.C.</small>
          </div>
        </div>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
        <p>Este recibo es válido sin firma ni sello</p>
        <p>Fecha de impresión: ${new Date().toLocaleString('es-CO')}</p>
        <p>Sistema de Gestión Huellas del Saber - ${new Date().getFullYear()}</p>
      </div>
    `;

    // Agregar temporalmente al DOM
    reciboHTML.style.position = 'fixed';
    reciboHTML.style.left = '-9999px';
    document.body.appendChild(reciboHTML);

    // Generar PDF
    html2canvas(reciboHTML, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Recibo_${pago.numeroRecibo}_${estudiante.nombres}_${estudiante.apellidos}.pdf`);

      // Limpiar
      document.body.removeChild(reciboHTML);
      mostrarConfirmacion('Recibo generado exitosamente ✓');
    });
  };

  const handleEnviarRecordatorios = () => {
    const pagosParaRecordar = pagos.filter(
      (p) => p.estado === 'vencido' || p.estado === 'pendiente'
    );

    if (pagosParaRecordar.length === 0) {
      alert('No hay pagos pendientes o vencidos para enviar recordatorios');
      return;
    }

    setShowRecordatorios(true);
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setEstadoFiltro('');
    setConceptoFiltro('');
    setMesFiltro('');
    setNivelFiltro('');
    setEstudianteFiltro('');
    setPaginaActual(1);
  };

  const mostrarConfirmacion = (mensaje: string) => {
    setMensajeConfirmacion(mensaje);
    setShowConfirmacion(true);
    setTimeout(() => setShowConfirmacion(false), 3000);
  };

  const conceptos: ConceptoPago[] = [
    'Matrícula',
    'Pensión',
    'Materiales Didácticos',
    'Uniforme Escolar',
    'Transporte Escolar',
    'Alimentación',
    'Seguro Estudiantil',
    'Salida Pedagógica',
    'Certificados',
    'Actividades Extracurriculares',
    'Otro',
  ];

  const meses: MesPension[] = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <CreditCard className="w-8 h-8 text-primary mr-3" />
            Gestión de Pagos
          </h1>
          <p className="text-gray-600">
            Administra todos los pagos de matrícula, pensiones y otros conceptos
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowNuevoPago(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Registrar Pago
          </button>
          <button
            onClick={() => setShowReportes(true)}
            className="btn-outline flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Reportes
          </button>
          <button
            onClick={handleEnviarRecordatorios}
            className="btn-outline flex items-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Recordatorios
          </button>
        </div>
      </div>

      {/* Notificación */}
      {showConfirmacion && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          {mensajeConfirmacion}
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Recaudado</p>
              <p className="text-2xl font-bold">{formatearMoneda(totalRecaudado)}</p>
              <p className="text-xs opacity-80 mt-1">
                {pagos.filter((p) => p.estado === 'pagado').length} pagos
              </p>
            </div>
            <CheckCircle className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Pendiente</p>
              <p className="text-2xl font-bold">{formatearMoneda(totalPendiente)}</p>
              <p className="text-xs opacity-80 mt-1">
                {pagos.filter((p) => p.estado === 'pendiente').length} pagos
              </p>
            </div>
            <Clock className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Pagos Vencidos</p>
              <p className="text-2xl font-bold">{pagosVencidos}</p>
              <p className="text-xs opacity-80 mt-1">Requieren atención</p>
            </div>
            <XCircle className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Pagos Parciales</p>
              <p className="text-2xl font-bold">{formatearMoneda(totalParcial)}</p>
              <p className="text-xs opacity-80 mt-1">
                {pagos.filter((p) => p.estado === 'parcial').length} con saldo
              </p>
            </div>
            <AlertCircle className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
          {/* Búsqueda */}
          <div className="xl:col-span-2">
            <label className="label">
              <Search className="w-4 h-4 inline mr-2" />
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              placeholder="Estudiante, concepto, recibo..."
            />
          </div>

          {/* Estado */}
          <div>
            <label className="label">Estado</label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencido">Vencido</option>
              <option value="parcial">Parcial</option>
            </select>
          </div>

          {/* Concepto */}
          <div>
            <label className="label">Concepto</label>
            <select
              value={conceptoFiltro}
              onChange={(e) => setConceptoFiltro(e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              {conceptos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Mes */}
          <div>
            <label className="label">Mes</label>
            <select
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              {meses.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Nivel */}
          <div>
            <label className="label">Nivel</label>
            <select
              value={nivelFiltro}
              onChange={(e) => setNivelFiltro(e.target.value)}
              className="input-field"
            >
              <option value="">Todos los niveles</option>
              <option value="Caminadores">Caminadores</option>
              <option value="Párvulos">Párvulos</option>
              <option value="Prejardín">Prejardín</option>
              <option value="Jardín">Jardín</option>
              <option value="Transición">Transición</option>
            </select>
          </div>

          {/* Estudiante */}
          <div>
            <label className="label">Estudiante</label>
            <select
              value={estudianteFiltro}
              onChange={(e) => {
                setEstudianteFiltro(e.target.value);
                // Auto-actualizar el filtro de nivel al seleccionar un estudiante
                if (e.target.value) {
                  const estudiante = getEstudiante(e.target.value);
                  if (estudiante) {
                    setNivelFiltro(estudiante.nivel);
                  }
                }
              }}
              className="input-field"
            >
              <option value="">Todos</option>
              {mockEstudiantes.map((est) => (
                <option key={est.id} value={est.id}>
                  {est.nombres} {est.apellidos}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Mostrando {pagosPaginados.length} de {pagosFiltrados.length} pagos
          </div>
          {(searchTerm ||
            estadoFiltro ||
            conceptoFiltro ||
            mesFiltro ||
            nivelFiltro ||
            estudianteFiltro) && (
            <button onClick={limpiarFiltros} className="btn-outline text-sm">
              <X className="w-4 h-4 inline mr-1" />
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Acciones de selección múltiple */}
      {pagosSeleccionados.length > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-900">
              {pagosSeleccionados.length} pago(s) seleccionado(s)
            </span>
            <div className="flex gap-2">
              <button className="btn-outline btn-sm text-blue-600 border-blue-600">
                <Printer className="w-4 h-4 mr-1" />
                Imprimir
              </button>
              <button className="btn-outline btn-sm text-blue-600 border-blue-600">
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </button>
              <button
                onClick={() => setPagosSeleccionados([])}
                className="btn-outline btn-sm text-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Pagos */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4">
                <input
                  type="checkbox"
                  checked={
                    pagosSeleccionados.length === pagosPaginados.length &&
                    pagosPaginados.length > 0
                  }
                  onChange={seleccionarTodos}
                  className="cursor-pointer"
                />
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleOrdenar('estudiante')}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  Estudiante
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleOrdenar('concepto')}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  Concepto
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleOrdenar('monto')}
                  className="flex items-center gap-1 hover:text-primary ml-auto"
                >
                  Monto
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="text-left py-3 px-4">Método</th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleOrdenar('fechaVencimiento')}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  Vencimiento
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="text-center py-3 px-4">
                <button
                  onClick={() => handleOrdenar('estado')}
                  className="flex items-center gap-1 hover:text-primary mx-auto"
                >
                  Estado
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="text-center py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagosPaginados.map((pago) => {
              const dias = diasParaVencimiento(pago.fechaVencimiento);
              const proximoAVencer = dias <= 7 && dias >= 0 && pago.estado === 'pendiente';

              return (
                <tr
                  key={pago.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    pagosSeleccionados.includes(pago.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={pagosSeleccionados.includes(pago.id)}
                      onChange={() => toggleSeleccionarPago(pago.id)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {getEstudianteNombre(pago.estudianteId)}
                      </p>
                      <p className="text-xs text-gray-600">{pago.numeroRecibo}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-800">{pago.concepto}</p>
                    {pago.mes && (
                      <p className="text-xs text-gray-600">{pago.mes}</p>
                    )}
                    {pago.descripcionConcepto && (
                      <p className="text-xs text-gray-500">{pago.descripcionConcepto}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="font-bold text-gray-800">
                      {formatearMoneda(pago.monto)}
                    </p>
                    {pago.estado === 'parcial' && (
                      <p className="text-xs text-orange-600">
                        Pagado: {formatearMoneda(pago.montoPagado || 0)}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-700">{pago.metodoPago || '-'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-700">
                      {new Date(pago.fechaVencimiento).toLocaleDateString('es-CO')}
                    </p>
                    {proximoAVencer && (
                      <p className="text-xs text-orange-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Vence en {dias} día{dias !== 1 ? 's' : ''}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(
                        pago.estado
                      )}`}
                    >
                      {getEstadoIcon(pago.estado)}
                      <span className="capitalize">{pago.estado}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => handleVerDetalle(pago)}
                        className="p-2 hover:bg-blue-100 rounded text-blue-600"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(pago.estado === 'pagado' || pago.estado === 'parcial') && (
                        <button
                          onClick={() => handleImprimirRecibo(pago)}
                          className="p-2 hover:bg-green-100 rounded text-green-600"
                          title="Imprimir recibo"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {pagosPaginados.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron pagos</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="card">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Mostrar:</label>
              <select
                value={registrosPorPagina}
                onChange={(e) => {
                  setRegistrosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="input-field w-20"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-gray-600">registros por página</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter(
                    (num) =>
                      num === 1 ||
                      num === totalPaginas ||
                      (num >= paginaActual - 1 && num <= paginaActual + 1)
                  )
                  .map((num, idx, arr) => (
                    <React.Fragment key={num}>
                      {idx > 0 && arr[idx - 1] !== num - 1 && (
                        <span className="px-2 py-1">...</span>
                      )}
                      <button
                        onClick={() => setPaginaActual(num)}
                        className={`px-3 py-1 rounded ${
                          paginaActual === num
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {num}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-gray-600">
              Página {paginaActual} de {totalPaginas}
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL: NUEVO PAGO ========== */}
      {showNuevoPago && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg max-h-[90vh] overflow-y-auto">
            <div className="modal-header">
              <h2 className="text-xl font-bold">Registrar Nuevo Pago</h2>
              <button
                onClick={handleCerrarModalNuevoPago}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-body">
              <div className="space-y-4">
                {/* Nivel */}
                <div>
                  <label className="label">Nivel *</label>
                  <select
                    value={nivelFormulario}
                    onChange={(e) => {
                      setNivelFormulario(e.target.value);
                      // Resetear estudiante si cambia el nivel
                      setNuevoPago({ ...nuevoPago, estudianteId: '' });
                    }}
                    className="input-field"
                  >
                    <option value="" disabled>
                      Seleccione nivel...
                    </option>
                    <option value="Caminadores">Caminadores</option>
                    <option value="Párvulos">Párvulos</option>
                    <option value="Prejardín">Prejardín</option>
                    <option value="Jardín">Jardín</option>
                    <option value="Transición">Transición</option>
                  </select>
                </div>

                {/* Estudiante */}
                <div>
                  <label className="label">Estudiante *</label>
                  <select
                    value={nuevoPago.estudianteId}
                    onChange={(e) =>
                      setNuevoPago({ ...nuevoPago, estudianteId: e.target.value })
                    }
                    className="input-field"
                    disabled={!nivelFormulario}
                  >
                    {!nivelFormulario ? (
                      <option value="">Primero seleccione un nivel</option>
                    ) : (
                      <>
                        <option value="">Seleccione un estudiante</option>
                        {mockEstudiantes
                          .filter((est) => est.nivel === nivelFormulario)
                          .map((est) => (
                            <option key={est.id} value={est.id}>
                              {est.nombres} {est.apellidos} - {est.nivel} - {est.id}
                            </option>
                          ))}
                      </>
                    )}
                  </select>
                </div>

                {/* Concepto */}
                <div>
                  <label className="label">Concepto *</label>
                  <select
                    value={nuevoPago.concepto}
                    onChange={(e) =>
                      setNuevoPago({
                        ...nuevoPago,
                        concepto: e.target.value as ConceptoPago,
                      })
                    }
                    className="input-field"
                  >
                    {conceptos.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Si es Pensión, mostrar mes */}
                {nuevoPago.concepto === 'Pensión' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Mes *</label>
                      <select
                        value={nuevoPago.mes || ''}
                        onChange={(e) =>
                          setNuevoPago({
                            ...nuevoPago,
                            mes: e.target.value as MesPension,
                          })
                        }
                        className="input-field"
                      >
                        <option value="">Seleccione mes</option>
                        {meses.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Período *</label>
                      <select
                        value={nuevoPago.periodo || ''}
                        onChange={(e) =>
                          setNuevoPago({ ...nuevoPago, periodo: Number(e.target.value) as 1 | 2 | 3 | 4 })
                        }
                        className="input-field"
                      >
                        <option value="">Seleccione período</option>
                        <option value="1">Período 1</option>
                        <option value="2">Período 2</option>
                        <option value="3">Período 3</option>
                        <option value="4">Período 4</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Descripción */}
                {nuevoPago.concepto === 'Otro' && (
                  <div>
                    <label className="label">Descripción del concepto *</label>
                    <input
                      type="text"
                      value={nuevoPago.descripcionConcepto || ''}
                      onChange={(e) =>
                        setNuevoPago({
                          ...nuevoPago,
                          descripcionConcepto: e.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="Especifique el concepto..."
                    />
                  </div>
                )}

                {/* Monto Total */}
                <div>
                  <label className="label">Monto Total *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={nuevoPago.monto || ''}
                      onChange={(e) =>
                        setNuevoPago({ ...nuevoPago, monto: Number(e.target.value) })
                      }
                      className="input-field pl-8"
                      placeholder="350000"
                      min="0"
                    />
                  </div>
                  {nuevoPago.monto && nuevoPago.monto > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {formatearMoneda(nuevoPago.monto)}
                    </p>
                  )}
                </div>

                {/* Tipo de Pago */}
                <div>
                  <label className="label">Tipo de Pago *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="completo"
                        checked={tipoPago === 'completo'}
                        onChange={() => setTipoPago('completo')}
                      />
                      <span>Pago Completo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="parcial"
                        checked={tipoPago === 'parcial'}
                        onChange={() => setTipoPago('parcial')}
                      />
                      <span>Abono/Pago Parcial</span>
                    </label>
                  </div>
                </div>

                {/* Si es parcial, mostrar monto del abono */}
                {tipoPago === 'parcial' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="label">Monto del Abono *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={nuevoPago.montoPagado || ''}
                          onChange={(e) =>
                            setNuevoPago({
                              ...nuevoPago,
                              montoPagado: Number(e.target.value),
                            })
                          }
                          className="input-field pl-8"
                          placeholder="100000"
                          min="0"
                          max={nuevoPago.monto}
                        />
                      </div>
                    </div>
                    {nuevoPago.monto && nuevoPago.montoPagado && (
                      <div className="text-sm">
                        <p className="text-gray-700">
                          <strong>Saldo Pendiente:</strong>{' '}
                          {formatearMoneda(nuevoPago.monto - nuevoPago.montoPagado)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Método de Pago */}
                <div>
                  <label className="label">
                    Método de Pago {tipoPago === 'completo' ? '*' : ''}
                  </label>
                  <select
                    value={nuevoPago.metodoPago || ''}
                    onChange={(e) =>
                      setNuevoPago({
                        ...nuevoPago,
                        metodoPago: e.target.value as MetodoPago,
                      })
                    }
                    className="input-field"
                  >
                    <option value="">Seleccione método</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                    <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {/* Número de Referencia */}
                {(nuevoPago.metodoPago === 'Transferencia Bancaria' ||
                  nuevoPago.metodoPago === 'Tarjeta de Crédito' ||
                  nuevoPago.metodoPago === 'Tarjeta de Débito') && (
                  <div>
                    <label className="label">Número de Referencia</label>
                    <input
                      type="text"
                      value={nuevoPago.numeroReferencia || ''}
                      onChange={(e) =>
                        setNuevoPago({
                          ...nuevoPago,
                          numeroReferencia: e.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="TRF-2024-XXX o número de aprobación"
                    />
                  </div>
                )}

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Fecha de Vencimiento *</label>
                    <input
                      type="date"
                      value={nuevoPago.fechaVencimiento || ''}
                      onChange={(e) =>
                        setNuevoPago({
                          ...nuevoPago,
                          fechaVencimiento: e.target.value,
                        })
                      }
                      className="input-field"
                    />
                  </div>
                  {tipoPago === 'completo' && (
                    <div>
                      <label className="label">Fecha de Pago</label>
                      <input
                        type="date"
                        value={nuevoPago.fechaPago || ''}
                        onChange={(e) =>
                          setNuevoPago({ ...nuevoPago, fechaPago: e.target.value })
                        }
                        className="input-field"
                      />
                    </div>
                  )}
                </div>

                {/* Observaciones */}
                <div>
                  <label className="label">Observaciones</label>
                  <textarea
                    value={nuevoPago.observaciones || ''}
                    onChange={(e) =>
                      setNuevoPago({ ...nuevoPago, observaciones: e.target.value })
                    }
                    className="input-field"
                    rows={3}
                    placeholder="Notas adicionales sobre el pago..."
                  />
                </div>

                {/* Opciones */}
                <div className="space-y-2 pt-4 border-t">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={nuevoPago.generarRecibo || false}
                      onChange={(e) =>
                        setNuevoPago({
                          ...nuevoPago,
                          generarRecibo: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Generar recibo automáticamente</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={nuevoPago.enviarEmail || false}
                      onChange={(e) =>
                        setNuevoPago({ ...nuevoPago, enviarEmail: e.target.checked })
                      }
                    />
                    <span className="text-sm">Enviar comprobante por email</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={handleCerrarModalNuevoPago} className="btn-outline">
                Cancelar
              </button>
              <button onClick={handleRegistrarPago} className="btn-primary">
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL: DETALLE DEL PAGO ========== */}
      {showDetalle && pagoDetalle && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg max-h-[90vh] overflow-y-auto">
            <div className="modal-header">
              <h2 className="text-xl font-bold">
                Detalle de Pago - {getEstudianteNombre(pagoDetalle.estudianteId)}
              </h2>
              <button
                onClick={() => setShowDetalle(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-body">
              {/* Información del Estudiante */}
              <div className="card bg-gray-50 mb-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Información del Estudiante
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Nombre completo:</span>
                    <p className="font-semibold">
                      {getEstudianteNombre(pagoDetalle.estudianteId)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">ID:</span>
                    <p className="font-semibold">{pagoDetalle.estudianteId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Nivel:</span>
                    <p className="font-semibold">
                      {getEstudiante(pagoDetalle.estudianteId)?.nivel}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Acudiente:</span>
                    <p className="font-semibold">
                      {getEstudiante(pagoDetalle.estudianteId)?.acudientes[0]?.nombres || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del Pago */}
              <div className="card mb-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Información del Pago
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Recibo:</span>
                    <p className="font-semibold">{pagoDetalle.numeroRecibo}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Concepto:</span>
                    <p className="font-semibold">
                      {pagoDetalle.concepto}
                      {pagoDetalle.mes && ` - ${pagoDetalle.mes}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Monto Total:</span>
                    <p className="text-lg font-bold text-primary">
                      {formatearMoneda(pagoDetalle.monto)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Estado:</span>
                    <p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(
                          pagoDetalle.estado
                        )}`}
                      >
                        {getEstadoIcon(pagoDetalle.estado)}
                        <span className="capitalize">{pagoDetalle.estado}</span>
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Fecha Vencimiento:</span>
                    <p className="font-semibold">
                      {new Date(pagoDetalle.fechaVencimiento).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                  {pagoDetalle.fechaPago && (
                    <div>
                      <span className="text-sm text-gray-600">Fecha de Pago:</span>
                      <p className="font-semibold">
                        {new Date(pagoDetalle.fechaPago).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  )}
                  {pagoDetalle.metodoPago && (
                    <div>
                      <span className="text-sm text-gray-600">Método de Pago:</span>
                      <p className="font-semibold">{pagoDetalle.metodoPago}</p>
                    </div>
                  )}
                  {pagoDetalle.numeroReferencia && (
                    <div>
                      <span className="text-sm text-gray-600">Referencia:</span>
                      <p className="font-semibold">{pagoDetalle.numeroReferencia}</p>
                    </div>
                  )}
                </div>

                {pagoDetalle.observaciones && (
                  <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="text-sm font-semibold text-yellow-800">Observaciones:</p>
                    <p className="text-sm text-yellow-700">{pagoDetalle.observaciones}</p>
                  </div>
                )}
              </div>

              {/* Si es pago parcial, mostrar historial de abonos */}
              {pagoDetalle.estado === 'parcial' && pagoDetalle.abonos && (
                <div className="card mb-4">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Historial de Abonos
                  </h3>

                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3"># Abono</th>
                          <th className="text-left py-2 px-3">Fecha</th>
                          <th className="text-right py-2 px-3">Monto</th>
                          <th className="text-left py-2 px-3">Método</th>
                          <th className="text-left py-2 px-3">Recibo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagoDetalle.abonos.map((abono, idx) => (
                          <tr key={abono.id} className="border-b">
                            <td className="py-2 px-3">{idx + 1}</td>
                            <td className="py-2 px-3">
                              {new Date(abono.fecha).toLocaleDateString('es-CO')}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold">
                              {formatearMoneda(abono.monto)}
                            </td>
                            <td className="py-2 px-3">{abono.metodoPago}</td>
                            <td className="py-2 px-3">{abono.numeroRecibo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Resumen */}
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Total</p>
                        <p className="font-bold text-lg">
                          {formatearMoneda(pagoDetalle.monto)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Pagado</p>
                        <p className="font-bold text-lg text-green-600">
                          {formatearMoneda(pagoDetalle.montoPagado || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Saldo Pendiente</p>
                        <p className="font-bold text-lg text-orange-600">
                          {formatearMoneda(pagoDetalle.saldoPendiente || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all"
                          style={{
                            width: `${
                              ((pagoDetalle.montoPagado || 0) / pagoDetalle.monto) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-center text-gray-600 mt-1">
                        {(
                          ((pagoDetalle.montoPagado || 0) / pagoDetalle.monto) *
                          100
                        ).toFixed(1)}
                        % pagado
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Historial del Estudiante */}
              <div className="card">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Últimos Pagos del Estudiante
                </h3>
                <div className="space-y-2">
                  {pagos
                    .filter((p) => p.estudianteId === pagoDetalle.estudianteId)
                    .slice(0, 5)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <div>
                          <p className="font-semibold">{p.concepto}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(p.fechaVencimiento).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatearMoneda(p.monto)}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded ${getEstadoColor(
                              p.estado
                            )}`}
                          >
                            {p.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {pagoDetalle.estado === 'parcial' && (
                <button className="btn-primary">Registrar Nuevo Abono</button>
              )}
              {(pagoDetalle.estado === 'pagado' || pagoDetalle.estado === 'parcial') && (
                <button
                  onClick={() => handleImprimirRecibo(pagoDetalle)}
                  className="btn-outline flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Recibo
                </button>
              )}
              <button onClick={() => setShowDetalle(false)} className="btn-outline">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL: REPORTES ========== */}
      {showReportes && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg">
            <div className="modal-header">
              <h2 className="text-xl font-bold">Generar Reportes Financieros</h2>
              <button
                onClick={() => setShowReportes(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Reporte por Período
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Genera un reporte filtrado por rango de fechas, estado y concepto
                  </p>
                  <button className="btn-primary w-full">Generar Reporte</button>
                </div>

                <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Estado de Cuenta por Estudiante
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Historial completo de pagos y saldo pendiente de un estudiante
                  </p>
                  <button className="btn-primary w-full">Generar Estado</button>
                </div>

                <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Reporte Financiero General
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Total recaudado, pendiente y proyecciones con gráficos
                  </p>
                  <button className="btn-primary w-full">Generar Reporte</button>
                </div>

                <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Reporte de Morosos
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Lista de estudiantes con pagos vencidos y días de mora
                  </p>
                  <button className="btn-primary w-full">Generar Reporte</button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Los reportes se pueden exportar en formato PDF o
                  Excel.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowReportes(false)} className="btn-outline">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL: RECORDATORIOS ========== */}
      {showRecordatorios && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="text-xl font-bold">Enviar Recordatorios de Pago</h2>
              <button
                onClick={() => setShowRecordatorios(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-body">
              <div className="space-y-4">
                <div>
                  <label className="label">Seleccionar destinatarios</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" />
                      <span className="font-semibold">
                        Todos los morosos ({pagosVencidos} estudiantes)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" />
                      <span className="font-semibold">
                        Pagos próximos a vencer ({'<'} 7 días)
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="label">Mensaje</label>
                  <textarea
                    className="input-field"
                    rows={6}
                    defaultValue={`Estimado acudiente,

Le recordamos que tiene un pago pendiente:
- Concepto: [Concepto]
- Monto: [Monto]
- Vencimiento: [Fecha]

Por favor acérquese a la oficina administrativa o realice su pago por transferencia.

Gracias por su atención.

Gimnasio Pedagógico Huellas Del Saber`}
                  />
                </div>

                <div>
                  <label className="label">Canal de envío</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span>SMS</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span>WhatsApp</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowRecordatorios(false)}
                className="btn-outline"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  mostrarConfirmacion('Recordatorios enviados exitosamente ✓');
                  setShowRecordatorios(false);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar Recordatorios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default Pagos;
