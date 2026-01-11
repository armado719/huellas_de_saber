import {
  AlertCircle,
  ChevronRight,
  Edit,
  Eye,
  Info,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { estudiantesService } from '../services/estudiantesService';
import {
  Acudiente,
  EstadoEstudiante,
  Estudiante,
  Genero,
  Nivel,
  TipoAcudiente,
  TipoIdentificacion,
  TipoSangre,
} from '../types';

const Estudiantes: React.FC = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNivel, setSelectedNivel] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);

  const niveles: Nivel[] = ['Caminadores', 'Párvulos', 'Prejardín', 'Jardín'];

  // Cargar estudiantes al montar el componente
  useEffect(() => {
    cargarEstudiantes();
  }, []);

  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const datos = await estudiantesService.getAll();
      setEstudiantes(datos);
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
      setError('Error al cargar los estudiantes. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEstudiantes = estudiantes.filter((est) => {
    const matchesSearch =
      est.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (est.codigo && est.codigo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesNivel = selectedNivel ? est.nivel === selectedNivel : true;

    return matchesSearch && matchesNivel && est.activo;
  });

  const handleCreate = () => {
    setModalMode('create');
    setSelectedEstudiante(null);
    setShowModal(true);
  };

  const handleEdit = (estudiante: Estudiante) => {
    setModalMode('edit');
    setSelectedEstudiante(estudiante);
    setShowModal(true);
  };

  const handleView = (estudiante: Estudiante) => {
    setModalMode('view');
    setSelectedEstudiante(estudiante);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este estudiante?')) {
      try {
        await estudiantesService.delete(id);
        await cargarEstudiantes(); // Recargar la lista
      } catch (err) {
        console.error('Error al eliminar estudiante:', err);
        alert('Error al eliminar el estudiante. Por favor, intente nuevamente.');
      }
    }
  };

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <Users className="w-8 h-8 text-primary mr-3" />
            Gestión de Estudiantes
          </h1>
          <p className="text-gray-600">
            Administra la información completa de los estudiantes y sus acudientes
          </p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Estudiante
        </button>
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
              placeholder="Buscar por nombre, apellido, código o ID..."
            />
          </div>
          <div>
            <label className="label">Filtrar por Nivel</label>
            <select
              value={selectedNivel}
              onChange={(e) => setSelectedNivel(e.target.value)}
              className="input-field"
            >
              <option value="">Todos los niveles</option>
              {niveles.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {nivel}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Indicadores de Loading y Error */}
      {loading && (
        <div className="card text-center py-8">
          <p className="text-gray-600">Cargando estudiantes...</p>
        </div>
      )}

      {error && (
        <div className="card text-center py-8 bg-red-50">
          <p className="text-red-600">{error}</p>
          <button onClick={cargarEstudiantes} className="btn-primary mt-4">
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de Estudiantes */}
      {!loading && !error && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4">Código</th>
                <th className="text-left py-3 px-4">Nombre Completo</th>
                <th className="text-left py-3 px-4">Edad</th>
                <th className="text-left py-3 px-4">Nivel</th>
                <th className="text-left py-3 px-4">Acudientes</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-center py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEstudiantes.map((estudiante) => (
                <tr
                  key={estudiante.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-sm font-semibold text-primary">
                    {estudiante.codigo || estudiante.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-800">
                      {estudiante.nombres} {estudiante.apellidos}
                    </div>
                    {estudiante.numeroIdentificacion && (
                      <div className="text-xs text-gray-500">
                        {estudiante.tipoIdentificacion}: {estudiante.numeroIdentificacion}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {calcularEdad(estudiante.fechaNacimiento)} años
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {estudiante.nivel}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {estudiante.acudientes.length} acudiente(s)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estudiante.estado === 'Activo' ? 'bg-green-100 text-green-700' :
                        estudiante.estado === 'Retirado' ? 'bg-red-100 text-red-700' :
                          estudiante.estado === 'Graduado' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                      }`}>
                      {estudiante.estado || 'Activo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleView(estudiante)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(estudiante)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(estudiante.id)}
                        className="p-2 text-secondary hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEstudiantes.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron estudiantes</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <EstudianteModal
          mode={modalMode}
          estudiante={selectedEstudiante}
          estudiantes={estudiantes}
          onClose={() => setShowModal(false)}
          onSave={async (estudiante) => {
            try {
              if (modalMode === 'create') {
                // Eliminar el campo 'id' antes de enviarlo al backend
                const { id, ...estudianteData } = estudiante;
                await estudiantesService.create(estudianteData);
              } else if (modalMode === 'edit' && estudiante.id) {
                await estudiantesService.update(estudiante.id, estudiante);
              }
              await cargarEstudiantes(); // Recargar la lista
              setShowModal(false);
            } catch (err) {
              console.error('Error al guardar estudiante:', err);
              alert('Error al guardar el estudiante. Por favor, intente nuevamente.');
            }
          }}
        />
      )}
    </div>
  );
};

interface EstudianteModalProps {
  mode: 'create' | 'edit' | 'view';
  estudiante: Estudiante | null;
  estudiantes: Estudiante[];
  onClose: () => void;
  onSave: (estudiante: Estudiante) => void;
}

const EstudianteModal: React.FC<EstudianteModalProps> = ({
  mode,
  estudiante,
  estudiantes,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'contacto' | 'medica' | 'acudientes'>('personal');

  // Generar código de estudiante automáticamente
  const generateCodigo = () => {
    const maxCodigo = estudiantes
      .filter(e => e.codigo && e.codigo.startsWith('EST'))
      .map(e => parseInt(e.codigo!.replace('EST', '')))
      .reduce((max, num) => Math.max(max, num), 0);
    return `EST${String(maxCodigo + 1).padStart(3, '0')}`;
  };

  const [formData, setFormData] = useState<Estudiante>(
    estudiante || {
      id: `est${Date.now()}`,
      codigo: generateCodigo(),
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      genero: undefined,
      nivel: 'Caminadores',
      estado: 'Activo',
      activo: true,
      fechaIngreso: new Date().toISOString().split('T')[0],
      fechaMatricula: new Date().toISOString().split('T')[0],
      acudientes: [],
    }
  );

  // Actualizar formData cuando cambie el estudiante (para modo editar/ver)
  useEffect(() => {
    if (estudiante) {
      setFormData({
        ...estudiante,
        // Mapeo explícito de fechas (soporta tanto snake_case como camelCase)
        // Convertir a formato YYYY-MM-DD para inputs type="date"
        fechaNacimiento: ((estudiante as any).fecha_nacimiento || estudiante.fechaNacimiento || '')?.split('T')[0] || '',
        fechaIngreso: ((estudiante as any).fecha_ingreso || estudiante.fechaIngreso || '')?.split('T')[0] || '',
        fechaMatricula: ((estudiante as any).fecha_matricula || estudiante.fechaMatricula || '')?.split('T')[0] || '',
      });
    } else {
      // Resetear al formulario vacío para modo crear
      setFormData({
        id: `est${Date.now()}`,
        codigo: generateCodigo(),
        nombres: '',
        apellidos: '',
        fechaNacimiento: '',
        genero: undefined,
        nivel: 'Caminadores',
        estado: 'Activo',
        activo: true,
        fechaIngreso: new Date().toISOString().split('T')[0],
        fechaMatricula: new Date().toISOString().split('T')[0],
        acudientes: [],
      });
    }
  }, [estudiante]);

  const [showAcudienteForm, setShowAcudienteForm] = useState(false);
  const [editingAcudiente, setEditingAcudiente] = useState<Acudiente | null>(null);
  const [acudienteData, setAcudienteData] = useState<Acudiente>({
    id: '',
    nombres: '',
    apellidos: '',
    parentesco: '',
    telefonoPrincipal: '',
    email: '',
    direccion: '',
  });

  // Estado para manejar errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Validar campos obligatorios del tab actual
  const validateCurrentTab = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (activeTab) {
      case 'personal':
        if (!formData.nombres) {
          newErrors.nombres = 'Los nombres son obligatorios';
        }
        if (!formData.apellidos) {
          newErrors.apellidos = 'Los apellidos son obligatorios';
        }
        if (!formData.fechaNacimiento) {
          newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
        }
        if (!formData.genero) {
          newErrors.genero = 'Debe seleccionar el género';
        }
        break;
      case 'contacto':
        // El tab de contacto no tiene campos obligatorios
        break;
      case 'medica':
        // El tab de información médica no tiene campos obligatorios
        break;
      case 'acudientes':
        if (formData.acudientes.length === 0) {
          newErrors.acudientes = 'Debe agregar al menos un acudiente';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Avanzar al siguiente tab
  const handleContinue = () => {
    if (!validateCurrentTab()) {
      return;
    }

    // Limpiar errores del tab actual al avanzar exitosamente
    const tabErrors: string[] = [];
    switch (activeTab) {
      case 'personal':
        tabErrors.push('nombres', 'apellidos', 'fechaNacimiento', 'genero');
        break;
      case 'acudientes':
        tabErrors.push('acudientes');
        break;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      tabErrors.forEach(key => delete newErrors[key]);
      return newErrors;
    });

    const tabOrder: Array<'personal' | 'contacto' | 'medica' | 'acudientes'> = [
      'personal',
      'contacto',
      'medica',
      'acudientes',
    ];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  // Volver al tab anterior
  const handleBack = () => {
    const tabOrder: Array<'personal' | 'contacto' | 'medica' | 'acudientes'> = [
      'personal',
      'contacto',
      'medica',
      'acudientes',
    ];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los campos obligatorios
    const newErrors: Record<string, string> = {};

    if (!formData.nombres) {
      newErrors.nombres = 'Los nombres son obligatorios';
    }
    if (!formData.apellidos) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    }
    if (!formData.genero) {
      newErrors.genero = 'Debe seleccionar el género';
    }
    if (formData.acudientes.length === 0) {
      newErrors.acudientes = 'Debe agregar al menos un acudiente';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Ir al primer tab con errores
      if (newErrors.nombres || newErrors.apellidos || newErrors.fechaNacimiento || newErrors.genero) {
        setActiveTab('personal');
      } else if (newErrors.acudientes) {
        setActiveTab('acudientes');
      }
      return;
    }

    onSave(formData);
  };

  const handleAddAcudiente = () => {
    const acudienteErrors: Record<string, string> = {};

    if (!acudienteData.nombres) {
      acudienteErrors.acudienteNombres = 'El nombre del acudiente es obligatorio';
    }
    if (!acudienteData.telefonoPrincipal) {
      acudienteErrors.acudienteTelefono = 'El teléfono principal es obligatorio';
    }

    if (Object.keys(acudienteErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...acudienteErrors }));
      return;
    }

    // Limpiar errores del acudiente al agregar
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.acudienteNombres;
      delete newErrors.acudienteTelefono;
      return newErrors;
    });

    if (editingAcudiente) {
      // Actualizar acudiente existente
      setFormData(prev => ({
        ...prev,
        acudientes: prev.acudientes.map(a =>
          a.id === editingAcudiente.id ? { ...acudienteData, id: editingAcudiente.id } : a
        ),
      }));
      setEditingAcudiente(null);
    } else {
      // Agregar nuevo acudiente
      const newAcudiente = {
        ...acudienteData,
        id: `acu${Date.now()}`,
      };
      setFormData(prev => ({
        ...prev,
        acudientes: [...prev.acudientes, newAcudiente],
      }));
    }

    // Limpiar error de acudientes después de agregar/editar
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.acudientes;
      return newErrors;
    });

    // Resetear formulario
    setAcudienteData({
      id: '',
      nombres: '',
      apellidos: '',
      parentesco: '',
      telefonoPrincipal: '',
      email: '',
      direccion: '',
    });
    setShowAcudienteForm(false);
  };

  const handleEditAcudiente = (acudiente: Acudiente) => {
    setEditingAcudiente(acudiente);
    setAcudienteData(acudiente);
    setShowAcudienteForm(true);
  };

  const handleRemoveAcudiente = (id: string) => {
    if (confirm('¿Eliminar este acudiente?')) {
      setFormData(prev => ({
        ...prev,
        acudientes: prev.acudientes.filter((a) => a.id !== id),
      }));
    }
  };

  const isViewMode = mode === 'view';

  const tabs = [
    { id: 'personal' as const, label: 'Información Personal', icon: Users },
    { id: 'contacto' as const, label: 'Contacto', icon: Info },
    { id: 'medica' as const, label: 'Información Médica', icon: Info },
    { id: 'acudientes' as const, label: 'Acudientes', icon: UserPlus },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container-lg">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>
              {mode === 'create' && 'Nuevo Estudiante'}
              {mode === 'edit' && 'Editar Estudiante'}
              {mode === 'view' && 'Detalles del Estudiante'}
            </h2>
            {formData.codigo && (
              <p>Código: {formData.codigo}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        {!isViewMode && (
          <div className="modal-tabs">
            <div className="modal-tabs-list">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`modal-tab ${activeTab === tab.id
                        ? 'modal-tab-active'
                        : 'modal-tab-inactive'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-body">
          {/* SECCIÓN 1: INFORMACIÓN PERSONAL */}
          {activeTab === 'personal' && (
            <div className="form-section">
              <h3 className="form-section-title">
                Información Personal
              </h3>

              <div className="form-grid-3">
                <div>
                  <label className="label-compact">
                    Código de Estudiante <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.codigo || ''}
                    className="input-compact bg-gray-100"
                    disabled
                    title="Código generado automáticamente"
                  />
                </div>

                <div>
                  <label className="label-compact">Tipo de Identificación</label>
                  <select
                    value={formData.tipoIdentificacion || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, tipoIdentificacion: e.target.value as TipoIdentificacion }))
                    }
                    className="input-compact"
                    disabled={isViewMode}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                    <option value="Registro Civil">Registro Civil</option>
                    <option value="Sin Documento">Sin Documento</option>
                  </select>
                </div>

                <div>
                  <label className="label-compact">Número de Identificación</label>
                  <input
                    type="text"
                    value={formData.numeroIdentificacion || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, numeroIdentificacion: e.target.value }))
                    }
                    className="input-compact"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="label-compact">
                    Nombres <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombres}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, nombres: e.target.value }));
                      // Limpiar error al escribir
                      if (errors.nombres) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.nombres;
                          return newErrors;
                        });
                      }
                    }}
                    className={`input-compact ${errors.nombres ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    required
                    disabled={isViewMode}
                  />
                  {errors.nombres && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.nombres}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label-compact">
                    Apellidos <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, apellidos: e.target.value }));
                      // Limpiar error al escribir
                      if (errors.apellidos) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.apellidos;
                          return newErrors;
                        });
                      }
                    }}
                    className={`input-compact ${errors.apellidos ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    required
                    disabled={isViewMode}
                  />
                  {errors.apellidos && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.apellidos}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label-compact">
                    Fecha de Nacimiento <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, fechaNacimiento: e.target.value }));
                      // Limpiar error al cambiar
                      if (errors.fechaNacimiento) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.fechaNacimiento;
                          return newErrors;
                        });
                      }
                    }}
                    className={`input-compact ${errors.fechaNacimiento ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    required
                    disabled={isViewMode}
                  />
                  {errors.fechaNacimiento && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.fechaNacimiento}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label-compact">Edad (calculada)</label>
                  <input
                    type="text"
                    value={formData.fechaNacimiento ? `${calcularEdad(formData.fechaNacimiento)} años` : ''}
                    className="input-compact bg-gray-100"
                    disabled
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label-compact">
                    Género <span className="text-secondary">*</span>
                  </label>
                  <div className="flex space-x-6 mt-1">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="genero"
                        value="Masculino"
                        checked={formData.genero === 'Masculino'}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, genero: e.target.value as Genero }));
                          // Limpiar error al seleccionar
                          if (errors.genero) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.genero;
                              return newErrors;
                            });
                          }
                        }}
                        className="mr-2 w-4 h-4 text-primary"
                        disabled={isViewMode}
                        required
                      />
                      <span className="text-sm text-gray-700">Masculino</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="genero"
                        value="Femenino"
                        checked={formData.genero === 'Femenino'}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, genero: e.target.value as Genero }));
                          // Limpiar error al seleccionar
                          if (errors.genero) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.genero;
                              return newErrors;
                            });
                          }
                        }}
                        className="mr-2 w-4 h-4 text-primary"
                        disabled={isViewMode}
                        required
                      />
                      <span className="text-sm text-gray-700">Femenino</span>
                    </label>
                  </div>
                  {errors.genero && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.genero}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label-compact">
                    Nivel/Grupo <span className="text-secondary">*</span>
                  </label>
                  <select
                    value={formData.nivel}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, nivel: e.target.value as Nivel }))
                    }
                    className="input-compact"
                    required
                    disabled={isViewMode}
                  >
                    <option value="Caminadores">Caminadores</option>
                    <option value="Párvulos">Párvulos</option>
                    <option value="Prejardín">Prejardín</option>
                    <option value="Jardín">Jardín</option>
                  </select>
                </div>

                <div>
                  <label className="label-compact">Estado</label>
                  <select
                    value={formData.estado || 'Activo'}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, estado: e.target.value as EstadoEstudiante }))
                    }
                    className="input-compact"
                    disabled={isViewMode}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Retirado">Retirado</option>
                    <option value="Graduado">Graduado</option>
                    <option value="Suspendido">Suspendido</option>
                  </select>
                </div>

                <div>
                  <label className="label-compact">
                    Fecha de Ingreso <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fechaIngreso}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, fechaIngreso: e.target.value }))
                    }
                    className="input-compact"
                    required
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="label-compact">Fecha de Matrícula</label>
                  <input
                    type="date"
                    value={formData.fechaMatricula || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, fechaMatricula: e.target.value }))
                    }
                    className="input-compact"
                    disabled={isViewMode}
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="label-compact">
                    Foto del Estudiante (opcional)
                    {!isViewMode && (
                      <button
                        type="button"
                        className="ml-2 text-primary text-xs hover:underline"
                        title="Subir foto"
                      >
                        <Upload className="w-3 h-3 inline" /> Subir
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.foto || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, foto: e.target.value }))
                    }
                    className="input-compact"
                    placeholder="URL de la foto"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 2: INFORMACIÓN DE CONTACTO */}
          {activeTab === 'contacto' && (
            <div className="form-section">
              <h3 className="form-section-title">
                Información de Contacto
              </h3>

              <div className="form-grid-2">
                <div className="md:col-span-2">
                  <label className="label-compact">Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, direccion: e.target.value }))
                    }
                    className="input-compact"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="label-compact">Barrio</label>
                  <input
                    type="text"
                    value={formData.barrio || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, barrio: e.target.value }))
                    }
                    className="input-compact"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="label-compact">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    value={formData.telefonoContacto || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, telefonoContacto: e.target.value }))
                    }
                    className="input-compact"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: INFORMACIÓN MÉDICA */}
          {activeTab === 'medica' && (
            <div className="form-section">
              <h3 className="form-section-title">
                Información Médica
              </h3>

              <div className="form-grid-2">
                <div>
                  <label className="label-compact">Tipo de Sangre</label>
                  <select
                    value={formData.tipoSangre || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, tipoSangre: e.target.value as TipoSangre }))
                    }
                    className="input-compact"
                    disabled={isViewMode}
                  >
                    <option value="">Seleccione...</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="label-compact">EPS</label>
                  <input
                    type="text"
                    value={formData.eps || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, eps: e.target.value }))
                    }
                    className="input-compact"
                    disabled={isViewMode}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label-compact">Alergias</label>
                  <textarea
                    value={formData.alergias || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, alergias: e.target.value }))
                    }
                    className="textarea-compact"
                    disabled={isViewMode}
                    placeholder="Describa las alergias del estudiante"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label-compact">Condiciones Médicas</label>
                  <textarea
                    value={formData.condicionesMedicas || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, condicionesMedicas: e.target.value }))
                    }
                    className="textarea-compact"
                    disabled={isViewMode}
                    placeholder="Describa las condiciones médicas del estudiante"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label-compact">Medicamentos</label>
                  <textarea
                    value={formData.medicamentos || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, medicamentos: e.target.value }))
                    }
                    className="textarea-compact"
                    disabled={isViewMode}
                    placeholder="Liste los medicamentos que toma el estudiante"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label-compact">Observaciones Médicas</label>
                  <textarea
                    value={formData.observacionesMedicas || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, observacionesMedicas: e.target.value }))
                    }
                    className="textarea-compact"
                    disabled={isViewMode}
                    placeholder="Observaciones adicionales sobre la salud del estudiante"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 4: ACUDIENTES */}
          {activeTab === 'acudientes' && (
            <div className="form-section">
              <div className="flex justify-between items-center mb-3">
                <h3 className="form-section-title mb-0">
                  Acudientes <span className="text-secondary">*</span>
                  <span className="text-xs font-normal text-gray-600 ml-2">
                    (mínimo 1 requerido)
                  </span>
                </h3>
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAcudiente(null);
                      setAcudienteData({
                        id: '',
                        nombres: '',
                        apellidos: '',
                        parentesco: '',
                        telefonoPrincipal: '',
                        email: '',
                        direccion: '',
                      });
                      setShowAcudienteForm(!showAcudienteForm);
                    }}
                    className="btn-primary text-xs flex items-center py-1 px-3"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {editingAcudiente ? 'Cancelar' : 'Agregar'}
                  </button>
                )}
              </div>

              {/* Formulario de Acudiente */}
              {showAcudienteForm && !isViewMode && (
                <div className="bg-gray-50 border-2 border-primary/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">
                    {editingAcudiente ? 'Editar Acudiente' : 'Nuevo Acudiente'}
                  </h4>

                  <div className="form-grid-2">
                    <div>
                      <label className="label-compact">Tipo de Acudiente</label>
                      <select
                        value={acudienteData.tipoAcudiente || ''}
                        onChange={(e) =>
                          setAcudienteData({
                            ...acudienteData,
                            tipoAcudiente: e.target.value as TipoAcudiente,
                          })
                        }
                        className="input-compact"
                      >
                        <option value="">Seleccione...</option>
                        <option value="Padre">Padre</option>
                        <option value="Madre">Madre</option>
                        <option value="Abuelo">Abuelo</option>
                        <option value="Abuela">Abuela</option>
                        <option value="Tío">Tío</option>
                        <option value="Tía">Tía</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="label-compact">
                        Nombres <span className="text-secondary">*</span>
                      </label>
                      <input
                        type="text"
                        value={acudienteData.nombres}
                        onChange={(e) => {
                          setAcudienteData({ ...acudienteData, nombres: e.target.value });
                          // Limpiar error al escribir
                          if (errors.acudienteNombres) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.acudienteNombres;
                              return newErrors;
                            });
                          }
                        }}
                        className={`input-compact ${errors.acudienteNombres ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Nombres del acudiente"
                      />
                      {errors.acudienteNombres && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.acudienteNombres}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label-compact">Apellidos</label>
                      <input
                        type="text"
                        value={acudienteData.apellidos || ''}
                        onChange={(e) =>
                          setAcudienteData({ ...acudienteData, apellidos: e.target.value })
                        }
                        className="input-compact"
                        placeholder="Apellidos del acudiente"
                      />
                    </div>

                    <div>
                      <label className="label-compact">Identificación</label>
                      <input
                        type="text"
                        value={acudienteData.identificacion || ''}
                        onChange={(e) =>
                          setAcudienteData({ ...acudienteData, identificacion: e.target.value })
                        }
                        className="input-compact"
                        placeholder="Número de identificación"
                      />
                    </div>

                    <div>
                      <label className="label-compact">Parentesco</label>
                      <input
                        type="text"
                        value={acudienteData.parentesco}
                        onChange={(e) =>
                          setAcudienteData({
                            ...acudienteData,
                            parentesco: e.target.value,
                          })
                        }
                        className="input-compact"
                        placeholder="Ej: Madre, Padre, Tío"
                      />
                    </div>

                    <div>
                      <label className="label-compact">
                        Teléfono Principal <span className="text-secondary">*</span>
                      </label>
                      <input
                        type="tel"
                        value={acudienteData.telefonoPrincipal}
                        onChange={(e) => {
                          setAcudienteData({
                            ...acudienteData,
                            telefonoPrincipal: e.target.value,
                          });
                          // Limpiar error al escribir
                          if (errors.acudienteTelefono) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.acudienteTelefono;
                              return newErrors;
                            });
                          }
                        }}
                        className={`input-compact ${errors.acudienteTelefono ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Teléfono principal"
                      />
                      {errors.acudienteTelefono && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.acudienteTelefono}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label-compact">Teléfono Secundario</label>
                      <input
                        type="tel"
                        value={acudienteData.telefonoSecundario || ''}
                        onChange={(e) =>
                          setAcudienteData({
                            ...acudienteData,
                            telefonoSecundario: e.target.value,
                          })
                        }
                        className="input-compact"
                        placeholder="Opcional"
                      />
                    </div>

                    <div>
                      <label className="label-compact">Email</label>
                      <input
                        type="email"
                        value={acudienteData.email}
                        onChange={(e) =>
                          setAcudienteData({ ...acudienteData, email: e.target.value })
                        }
                        className="input-compact"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="label-compact">Dirección</label>
                      <input
                        type="text"
                        value={acudienteData.direccion}
                        onChange={(e) =>
                          setAcudienteData({
                            ...acudienteData,
                            direccion: e.target.value,
                          })
                        }
                        className="input-compact"
                        placeholder="Dirección de residencia"
                      />
                    </div>

                    <div>
                      <label className="label-compact">Ocupación</label>
                      <input
                        type="text"
                        value={acudienteData.ocupacion || ''}
                        onChange={(e) =>
                          setAcudienteData({ ...acudienteData, ocupacion: e.target.value })
                        }
                        className="input-compact"
                        placeholder="Ocupación laboral"
                      />
                    </div>

                    <div>
                      <label className="label-compact">Empresa</label>
                      <input
                        type="text"
                        value={acudienteData.empresa || ''}
                        onChange={(e) =>
                          setAcudienteData({ ...acudienteData, empresa: e.target.value })
                        }
                        className="input-compact"
                        placeholder="Empresa donde trabaja"
                      />
                    </div>

                    <div>
                      <label className="label-compact">Orden de Contacto</label>
                      <select
                        value={acudienteData.ordenContacto || ''}
                        onChange={(e) =>
                          setAcudienteData({
                            ...acudienteData,
                            ordenContacto: parseInt(e.target.value),
                          })
                        }
                        className="input-compact"
                      >
                        <option value="">Seleccione...</option>
                        <option value="1">1 - Primero</option>
                        <option value="2">2 - Segundo</option>
                        <option value="3">3 - Tercero</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acudienteData.esResponsablePago || false}
                          onChange={(e) =>
                            setAcudienteData({
                              ...acudienteData,
                              esResponsablePago: e.target.checked,
                            })
                          }
                          className="mr-1 w-3 h-3 text-primary rounded"
                        />
                        <span className="text-xs text-gray-700">Resp. Pago</span>
                      </label>

                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acudienteData.esContactoEmergencia || false}
                          onChange={(e) =>
                            setAcudienteData({
                              ...acudienteData,
                              esContactoEmergencia: e.target.checked,
                            })
                          }
                          className="mr-1 w-3 h-3 text-primary rounded"
                        />
                        <span className="text-xs text-gray-700">Emergencia</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="label-compact">Observaciones</label>
                      <textarea
                        value={acudienteData.observaciones || ''}
                        onChange={(e) =>
                          setAcudienteData({
                            ...acudienteData,
                            observaciones: e.target.value,
                          })
                        }
                        className="textarea-compact"
                        placeholder="Observaciones adicionales"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAcudienteForm(false);
                        setEditingAcudiente(null);
                        setAcudienteData({
                          id: '',
                          nombres: '',
                          apellidos: '',
                          parentesco: '',
                          telefonoPrincipal: '',
                          email: '',
                          direccion: '',
                        });
                      }}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleAddAcudiente}
                      className="btn-primary flex items-center text-xs py-1 px-3"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      {editingAcudiente ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Mensaje de error si no hay acudientes */}
              {errors.acudientes && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.acudientes}
                  </p>
                </div>
              )}

              {/* Lista de Acudientes */}
              <div className="space-y-2">
                {formData.acudientes.length > 0 ? (
                  formData.acudientes.map((acudiente) => (
                    <div
                      key={acudiente.id}
                      className="bg-white border border-gray-200 rounded-lg p-3 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm">
                              {acudiente.nombres} {acudiente.apellidos}
                              {acudiente.tipoAcudiente && (
                                <span className="ml-2 text-xs font-medium px-1 py-0.5 bg-primary/10 text-primary rounded">
                                  {acudiente.tipoAcudiente}
                                </span>
                              )}
                            </h4>
                            <p className="text-xs text-gray-600">{acudiente.parentesco}</p>
                          </div>

                          <div className="text-xs text-gray-600 space-y-0.5">
                            <p><strong>Tel:</strong> {acudiente.telefonoPrincipal}</p>
                            <p><strong>Email:</strong> {acudiente.email}</p>
                          </div>

                          <div className="flex flex-wrap gap-1 md:col-span-2">
                            {acudiente.esResponsablePago && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                Resp. Pago
                              </span>
                            )}
                            {acudiente.esContactoEmergencia && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                Emergencia
                              </span>
                            )}
                            {acudiente.ordenContacto && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                Orden: {acudiente.ordenContacto}
                              </span>
                            )}
                          </div>
                        </div>

                        {!isViewMode && (
                          <div className="flex space-x-1 ml-2">
                            <button
                              type="button"
                              onClick={() => handleEditAcudiente(acudiente)}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveAcudiente(acudiente.id)}
                              className="p-1.5 text-secondary hover:bg-red-50 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <UserPlus className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No hay acudientes registrados</p>
                    <p className="text-xs mt-1">Debe agregar al menos un acudiente</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observaciones Generales (visible en modo vista) */}
          {isViewMode && (
            <div className="mt-4 pt-4 border-t">
              <label className="label-compact">Observaciones Generales</label>
              <textarea
                value={formData.observaciones || ''}
                className="textarea-compact bg-gray-50"
                disabled
              />
            </div>
          )}
        </form>

        {/* Footer - Fixed at bottom */}
        <div className="modal-footer">
          {!isViewMode ? (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-600">
                  <span className="text-secondary">*</span> Campos obligatorios
                </p>
                {/* Indicador de progreso */}
                <div className="flex items-center space-x-1">
                  {tabs.map((tab, index) => {
                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    return (
                      <div
                        key={tab.id}
                        className={`w-2 h-2 rounded-full ${isCompleted || isCurrent ? 'bg-primary' : 'bg-gray-300'
                          }`}
                        title={tab.label}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                >
                  Cancelar
                </button>
                {activeTab !== 'personal' && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                  >
                    Atrás
                  </button>
                )}
                {activeTab === 'acudientes' ? (
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="btn-primary flex items-center text-sm py-2 px-4"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {mode === 'create' ? 'Crear Estudiante' : 'Guardar Cambios'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="btn-primary flex items-center text-sm py-2 px-4"
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary text-sm py-2 px-4"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Estudiantes;
