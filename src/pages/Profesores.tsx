import {
  AlertCircle,
  Briefcase,
  ChevronRight,
  Edit,
  Eye,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profesoresService } from '../services/profesoresService';
import {
  EstadoProfesor,
  Genero,
  Nivel,
  NivelEducacion,
  Profesor,
  TipoContrato,
  TipoIdentificacionProfesor,
} from '../types';

const Profesores: React.FC = () => {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProfesor, setSelectedProfesor] = useState<Profesor | null>(null);

  // Cargar profesores al montar el componente
  useEffect(() => {
    cargarProfesores();
  }, []);

  const cargarProfesores = async () => {
    try {
      setLoading(true);
      setError(null);
      const datos = await profesoresService.getAll();
      setProfesores(datos);
    } catch (err) {
      console.error('Error al cargar profesores:', err);
      setError('Error al cargar los profesores. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProfesores = profesores.filter((prof) => {
    const matchesSearch =
      prof.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.especialidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.codigo?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch && prof.estado === 'Activo';
  });

  const handleCreate = () => {
    setModalMode('create');
    setSelectedProfesor(null);
    setShowModal(true);
  };

  const handleEdit = (profesor: Profesor) => {
    setModalMode('edit');
    setSelectedProfesor(profesor);
    setShowModal(true);
  };

  const handleView = (profesor: Profesor) => {
    setModalMode('view');
    setSelectedProfesor(profesor);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este profesor?')) {
      try {
        await profesoresService.delete(id);
        await cargarProfesores(); // Recargar la lista
      } catch (err) {
        console.error('Error al eliminar profesor:', err);
        alert('Error al eliminar el profesor. Por favor, intente nuevamente.');
      }
    }
  };

  const getEstadoBadge = (estado?: EstadoProfesor) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-700';
      case 'Inactivo':
        return 'bg-gray-100 text-gray-700';
      case 'Vacaciones':
        return 'bg-blue-100 text-blue-700';
      case 'Licencia':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <UserCheck className="w-8 h-8 text-primary mr-3" />
            Gestión de Profesores
          </h1>
          <p className="text-gray-600">
            Administra la información completa del personal docente
          </p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Profesor
        </button>
      </div>

      {/* Búsqueda */}
      <div className="card">
        <label className="label">
          <Search className="w-4 h-4 inline mr-2" />
          Buscar
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
          placeholder="Buscar por nombre, código, email o especialidad..."
        />
      </div>

      {/* Indicadores de Loading y Error */}
      {loading && (
        <div className="card text-center py-8">
          <p className="text-gray-600">Cargando profesores...</p>
        </div>
      )}

      {error && (
        <div className="card text-center py-8 bg-red-50">
          <p className="text-red-600">{error}</p>
          <button onClick={cargarProfesores} className="btn-primary mt-4">
            Reintentar
          </button>
        </div>
      )}

      {/* Grid de Profesores */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfesores.map((profesor) => (
          <div key={profesor.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">
                    {profesor.nombres} {profesor.apellidos}
                  </h3>
                  <p className="text-sm text-gray-600">{profesor.especialidad}</p>
                  {profesor.codigo && (
                    <p className="text-xs font-mono text-primary font-semibold">
                      {profesor.codigo}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(profesor.estado)}`}>
                  {profesor.estado || 'Activo'}
                </span>
                {profesor.esTitular && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                    Titular
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                {profesor.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                {profesor.telefono}
              </div>
              {profesor.anosExperiencia !== undefined && (
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 mr-2 text-primary" />
                  {profesor.anosExperiencia} años de experiencia
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Niveles asignados:
              </p>
              <div className="flex flex-wrap gap-2">
                {profesor.niveles.map((nivel) => (
                  <span
                    key={nivel}
                    className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
                  >
                    {nivel}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-xs text-gray-500">
                Desde {new Date(profesor.fechaIngreso).toLocaleDateString('es-CO')}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleView(profesor)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(profesor)}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(profesor.id)}
                  className="p-2 text-secondary hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            </div>
            ))}
          </div>

          {filteredProfesores.length === 0 && (
            <div className="card text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron profesores</p>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <ProfesorModal
          mode={modalMode}
          profesor={selectedProfesor}
          profesores={profesores}
          onClose={() => setShowModal(false)}
          onSave={async (profesor) => {
            try {
              if (modalMode === 'create') {
                // Eliminar ID falso generado en frontend - el backend genera el real
                const { id, ...profesorData } = profesor;
                await profesoresService.create(profesorData);
              } else if (modalMode === 'edit' && profesor.id) {
                await profesoresService.update(profesor.id, profesor);
              }
              await cargarProfesores(); // Recargar la lista
              setShowModal(false);
            } catch (err) {
              console.error('Error al guardar profesor:', err);
              alert('Error al guardar el profesor. Por favor, intente nuevamente.');
            }
          }}
        />
      )}
    </div>
  );
};

interface ProfesorModalProps {
  mode: 'create' | 'edit' | 'view';
  profesor: Profesor | null;
  profesores: Profesor[];
  onClose: () => void;
  onSave: (profesor: Profesor) => void;
}

const ProfesorModal: React.FC<ProfesorModalProps> = ({
  mode,
  profesor,
  profesores,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';
  const niveles: Nivel[] = ['Caminadores', 'Párvulos', 'Prejardín', 'Jardín', 'Transición'];
  const [activeTab, setActiveTab] = useState<'personal' | 'formacion' | 'laboral'>('personal');
  
  // Estado para manejar errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateCodigo = () => {
    const maxCodigo = profesores
      .filter(p => p.codigo && p.codigo.startsWith('PROF'))
      .map(p => parseInt(p.codigo!.replace('PROF', '')))
      .reduce((max, num) => Math.max(max, num), 0);
    return `PROF${String(maxCodigo + 1).padStart(3, '0')}`;
  };

  const [formData, setFormData] = useState<Profesor>({
    id: `prof${Date.now()}`,
    codigo: generateCodigo(),
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    especialidad: '',
    activo: true,
    fechaIngreso: new Date().toISOString().split('T')[0],
    niveles: [],
    estado: 'Activo',
    ciudad: 'Neiva',
  });

  // Actualizar formData cuando cambie el profesor (para modo editar/ver)
  useEffect(() => {
    if (profesor) {
      setFormData({
        ...profesor,
        // Convertir fechas a formato YYYY-MM-DD para inputs type="date"
        fechaNacimiento: profesor.fechaNacimiento?.split('T')[0] || '',
        fechaIngreso: profesor.fechaIngreso?.split('T')[0] || '',
      });
    } else {
      // Resetear al formulario vacío para modo crear
      setFormData({
        id: `prof${Date.now()}`,
        codigo: generateCodigo(),
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        especialidad: '',
        activo: true,
        fechaIngreso: new Date().toISOString().split('T')[0],
        niveles: [],
        estado: 'Activo',
        ciudad: 'Neiva',
      });
    }
  }, [profesor]);

  const calcularEdad = (fechaNacimiento?: string) => {
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
        if (!formData.tipoIdentificacion) {
          newErrors.tipoIdentificacion = 'El tipo de identificación es obligatorio';
        }
        if (!formData.numeroIdentificacion) {
          newErrors.numeroIdentificacion = 'El número de identificación es obligatorio';
        }
        if (!formData.fechaNacimiento) {
          newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
        }
        if (!formData.genero) {
          newErrors.genero = 'Debe seleccionar el género';
        }
        if (!formData.telefono) {
          newErrors.telefono = 'El teléfono móvil es obligatorio';
        }
        if (!formData.email) {
          newErrors.email = 'El email institucional es obligatorio';
        }
        break;
      case 'formacion':
        if (!formData.nivelEducacion) {
          newErrors.nivelEducacion = 'El nivel de educación es obligatorio';
        }
        break;
      case 'laboral':
        if (!formData.tipoContrato) {
          newErrors.tipoContrato = 'El tipo de contrato es obligatorio';
        }
        if (formData.niveles.length === 0) {
          newErrors.niveles = 'Debe seleccionar al menos un nivel asignado';
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
        tabErrors.push('nombres', 'apellidos', 'tipoIdentificacion', 'numeroIdentificacion', 'fechaNacimiento', 'genero', 'telefono', 'email');
        break;
      case 'formacion':
        tabErrors.push('nivelEducacion');
        break;
      case 'laboral':
        tabErrors.push('tipoContrato', 'niveles');
        break;
    }
    
    setErrors(prev => {
      const newErrors = { ...prev };
      tabErrors.forEach(key => delete newErrors[key]);
      return newErrors;
    });

    const tabOrder: Array<'personal' | 'formacion' | 'laboral'> = [
      'personal',
      'formacion',
      'laboral',
    ];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  // Volver al tab anterior
  const handleBack = () => {
    const tabOrder: Array<'personal' | 'formacion' | 'laboral'> = [
      'personal',
      'formacion',
      'laboral',
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
    if (!formData.tipoIdentificacion) {
      newErrors.tipoIdentificacion = 'El tipo de identificación es obligatorio';
    }
    if (!formData.numeroIdentificacion) {
      newErrors.numeroIdentificacion = 'El número de identificación es obligatorio';
    }
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    }
    if (!formData.genero) {
      newErrors.genero = 'Debe seleccionar el género';
    }
    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono móvil es obligatorio';
    }
    if (!formData.email) {
      newErrors.email = 'El email institucional es obligatorio';
    }
    if (!formData.nivelEducacion) {
      newErrors.nivelEducacion = 'El nivel de educación es obligatorio';
    }
    if (!formData.tipoContrato) {
      newErrors.tipoContrato = 'El tipo de contrato es obligatorio';
    }
    if (formData.niveles.length === 0) {
      newErrors.niveles = 'Debe seleccionar al menos un nivel asignado';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Ir al primer tab con errores
      if (newErrors.nombres || newErrors.apellidos || newErrors.tipoIdentificacion || 
          newErrors.numeroIdentificacion || newErrors.fechaNacimiento || newErrors.genero ||
          newErrors.telefono || newErrors.email) {
        setActiveTab('personal');
      } else if (newErrors.nivelEducacion) {
        setActiveTab('formacion');
      } else if (newErrors.tipoContrato || newErrors.niveles) {
        setActiveTab('laboral');
      }
      return;
    }

    onSave(formData);
  };

  const toggleNivel = (nivel: Nivel) => {
    const newNiveles = formData.niveles.includes(nivel)
      ? formData.niveles.filter((n) => n !== nivel)
      : [...formData.niveles, nivel];
    
    setFormData({
      ...formData,
      niveles: newNiveles,
    });

    // Limpiar error de niveles si ya hay al menos uno seleccionado
    if (newNiveles.length > 0 && errors.niveles) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.niveles;
        return newErrors;
      });
    }
  };

  const isViewMode = mode === 'view';

  const tabs = [
    { id: 'personal' as const, label: 'Datos Personales', icon: User },
    { id: 'formacion' as const, label: 'Formación', icon: GraduationCap },
    { id: 'laboral' as const, label: 'Información Laboral', icon: Briefcase },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container-lg">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>
              {mode === 'create' && 'Nuevo Profesor'}
              {mode === 'edit' && 'Editar Profesor'}
              {mode === 'view' && 'Detalles del Profesor'}
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
                    className={`modal-tab ${
                      activeTab === tab.id
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
          {/* TAB 1: DATOS PERSONALES */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              {/* Sección 1: Información Personal */}
              <div>
                <h3 className="form-section-title">
                  Información Personal
                </h3>
                <div className="form-grid-3">
                  <div>
                    <label className="label-compact">Código de Profesor</label>
                    <input
                      type="text"
                      value={formData.codigo || ''}
                      className="input-compact bg-gray-100"
                      disabled
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
                        setFormData({ ...formData, nombres: e.target.value });
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
                        setFormData({ ...formData, apellidos: e.target.value });
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
                      Tipo de Identificación <span className="text-secondary">*</span>
                    </label>
                    <select
                      value={formData.tipoIdentificacion || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, tipoIdentificacion: e.target.value as TipoIdentificacionProfesor });
                        if (errors.tipoIdentificacion) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.tipoIdentificacion;
                            return newErrors;
                          });
                        }
                      }}
                      className={`input-compact ${errors.tipoIdentificacion ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      disabled={isViewMode}
                    >
                      <option value="">Seleccione...</option>
                      <option value="CC">CC - Cédula de Ciudadanía</option>
                      <option value="CE">CE - Cédula de Extranjería</option>
                      <option value="TI">TI - Tarjeta de Identidad</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                    {errors.tipoIdentificacion && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.tipoIdentificacion}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label-compact">
                      Número de Identificación <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.numeroIdentificacion || ''}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, numeroIdentificacion: e.target.value }));
                        if (errors.numeroIdentificacion) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.numeroIdentificacion;
                            return newErrors;
                          });
                        }
                      }}
                      className={`input-compact ${errors.numeroIdentificacion ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      disabled={isViewMode}
                      required
                      placeholder="Ingrese el número de identificación"
                    />
                    {errors.numeroIdentificacion && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.numeroIdentificacion}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label-compact">
                      Fecha de Nacimiento <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.fechaNacimiento || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, fechaNacimiento: e.target.value });
                        if (errors.fechaNacimiento) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.fechaNacimiento;
                            return newErrors;
                          });
                        }
                      }}
                      className={`input-compact ${errors.fechaNacimiento ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
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
                            setFormData({ ...formData, genero: e.target.value as Genero });
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
                            setFormData({ ...formData, genero: e.target.value as Genero });
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
                  <div className="md:col-span-3">
                    <label className="label-compact">
                      Foto del Profesor (opcional)
                      {!isViewMode && (
                        <button type="button" className="ml-2 text-primary text-xs hover:underline">
                          <Upload className="w-3 h-3 inline" /> Subir
                        </button>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.foto || ''}
                      onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                      className="input-compact"
                      placeholder="URL de la foto"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Información de Contacto */}
              <div>
                <h3 className="form-section-title">
                  Información de Contacto
                </h3>
                <div className="form-grid-2">
                  <div className="md:col-span-2">
                    <label className="label-compact">Dirección</label>
                    <input
                      type="text"
                      value={formData.direccion || ''}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      className="input-compact"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="label-compact">Ciudad</label>
                    <input
                      type="text"
                      value={formData.ciudad || 'Neiva'}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                      className="input-compact"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="label-compact">Teléfono Fijo (opcional)</label>
                    <input
                      type="tel"
                      value={formData.telefonoFijo || ''}
                      onChange={(e) => setFormData({ ...formData, telefonoFijo: e.target.value })}
                      className="input-compact"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="label-compact">
                      Teléfono Móvil <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => {
                        setFormData({ ...formData, telefono: e.target.value });
                        if (errors.telefono) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.telefono;
                            return newErrors;
                          });
                        }
                      }}
                      className={`input-compact ${errors.telefono ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                      disabled={isViewMode}
                    />
                    {errors.telefono && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.telefono}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label-compact">
                      Email Institucional <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.email;
                            return newErrors;
                          });
                        }
                      }}
                      className={`input-compact ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                      disabled={isViewMode}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label-compact">Email Personal (opcional)</label>
                    <input
                      type="email"
                      value={formData.emailPersonal || ''}
                      onChange={(e) => setFormData({ ...formData, emailPersonal: e.target.value })}
                      className="input-compact"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Contacto de Emergencia */}
              <div>
                <h3 className="form-section-title">
                  Contacto de Emergencia
                </h3>
                <div className="form-grid-2">
                  <div>
                    <label className="label-compact">Nombre Contacto de Emergencia</label>
                    <input
                      type="text"
                      value={formData.nombreContactoEmergencia || ''}
                      onChange={(e) => setFormData({ ...formData, nombreContactoEmergencia: e.target.value })}
                      className="input-compact"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="label-compact">Teléfono de Emergencia</label>
                    <input
                      type="tel"
                      value={formData.telefonoEmergencia || ''}
                      onChange={(e) => setFormData({ ...formData, telefonoEmergencia: e.target.value })}
                      className="input-compact"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORMACIÓN */}
          {activeTab === 'formacion' && (
            <div className="form-section">
              <h3 className="form-section-title">
                Formación Académica
              </h3>
              <div className="form-grid-2">
                <div>
                  <label className="label-compact">
                    Nivel de Educación <span className="text-secondary">*</span>
                  </label>
                  <select
                    value={formData.nivelEducacion || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, nivelEducacion: e.target.value as NivelEducacion });
                      if (errors.nivelEducacion) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.nivelEducacion;
                          return newErrors;
                        });
                      }
                    }}
                    className={`input-compact ${errors.nivelEducacion ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isViewMode}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Bachiller">Bachiller</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Profesional">Profesional</option>
                    <option value="Especialización">Especialización</option>
                    <option value="Maestría">Maestría</option>
                    <option value="Doctorado">Doctorado</option>
                  </select>
                  {errors.nivelEducacion && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.nivelEducacion}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label-compact">Título Profesional</label>
                  <input
                    type="text"
                    value={formData.tituloProfesional || ''}
                    onChange={(e) => setFormData({ ...formData, tituloProfesional: e.target.value })}
                    className="input-compact"
                    placeholder="Ej: Licenciatura en Educación Infantil"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="label-compact">Institución Educativa</label>
                  <input
                    type="text"
                    value={formData.institucionEducativa || ''}
                    onChange={(e) => setFormData({ ...formData, institucionEducativa: e.target.value })}
                    className="input-compact"
                    placeholder="Universidad o institución"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="label-compact">Especialización (opcional)</label>
                  <input
                    type="text"
                    value={formData.especializacionAcademica || ''}
                    onChange={(e) => setFormData({ ...formData, especializacionAcademica: e.target.value })}
                    className="input-compact"
                    placeholder="Área de especialización"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="label-compact">Años de Experiencia</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.anosExperiencia || ''}
                    onChange={(e) => setFormData({ ...formData, anosExperiencia: parseInt(e.target.value) || 0 })}
                    className="input-compact"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INFORMACIÓN LABORAL */}
          {activeTab === 'laboral' && (
            <div className="space-y-4">
              {/* Sección 5: Información Laboral */}
              <div>
                <h3 className="form-section-title">
                  Información Laboral
                </h3>
                <div className="form-grid-2">
                  <div>
                    <label className="label-compact">Especialidad</label>
                    <input
                      type="text"
                      value={formData.especialidad}
                      onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                      className="input-compact"
                      placeholder="Área de enseñanza principal"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="label-compact">
                      Fecha de Ingreso <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.fechaIngreso}
                      onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
                      className="input-compact"
                      required
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="label-compact">
                      Tipo de Contrato <span className="text-secondary">*</span>
                    </label>
                    <select
                      value={formData.tipoContrato || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, tipoContrato: e.target.value as TipoContrato });
                        if (errors.tipoContrato) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.tipoContrato;
                            return newErrors;
                          });
                        }
                      }}
                      className={`input-compact ${errors.tipoContrato ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      disabled={isViewMode}
                    >
                      <option value="">Seleccione...</option>
                      <option value="Indefinido">Indefinido</option>
                      <option value="Fijo">Fijo</option>
                      <option value="Prestación de Servicios">Prestación de Servicios</option>
                    </select>
                    {errors.tipoContrato && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.tipoContrato}
                      </p>
                    )}
                  </div>
                  {isAdmin && (
                    <div>
                      <label className="label-compact">Salario Base (COP) - Solo Admin</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.salarioBase || ''}
                        onChange={(e) => setFormData({ ...formData, salarioBase: parseInt(e.target.value) || 0 })}
                        className="input-compact"
                        placeholder="$ 0"
                        disabled={isViewMode}
                      />
                    </div>
                  )}
                  <div>
                    <label className="label-compact">Estado</label>
                    <select
                      value={formData.estado || 'Activo'}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoProfesor })}
                      className="input-compact"
                      disabled={isViewMode}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="Vacaciones">Vacaciones</option>
                      <option value="Licencia">Licencia</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-compact">
                      Hoja de Vida (PDF - opcional)
                      {!isViewMode && (
                        <button type="button" className="ml-2 text-primary text-xs hover:underline">
                          <Upload className="w-3 h-3 inline" /> Subir
                        </button>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.hojaVida || ''}
                      onChange={(e) => setFormData({ ...formData, hojaVida: e.target.value })}
                      className="input-compact"
                      placeholder="URL del documento"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>

              {/* Sección 6: Asignación */}
              <div>
                <h3 className="form-section-title">
                  Asignación <span className="text-secondary">*</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="label-compact">
                      Niveles Asignados <span className="text-secondary">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {niveles.map((nivel) => (
                        <label
                          key={nivel}
                          className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${
                            formData.niveles.includes(nivel)
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-200 hover:border-primary/50'
                          } ${isViewMode ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.niveles.includes(nivel)}
                            onChange={() => toggleNivel(nivel)}
                            className="mr-2 w-4 h-4 text-primary"
                            disabled={isViewMode}
                          />
                          <span className="text-sm font-medium">{nivel}</span>
                        </label>
                      ))}
                    </div>
                    {errors.niveles && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.niveles}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.esTitular || false}
                        onChange={(e) => setFormData({ ...formData, esTitular: e.target.checked })}
                        className="mr-2 w-4 h-4 text-primary rounded"
                        disabled={isViewMode}
                      />
                      <span className="text-sm font-medium text-gray-700">¿Es Profesor Titular?</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Sección 7: Observaciones */}
              <div>
                <h3 className="form-section-title">
                  Observaciones
                </h3>
                <textarea
                  value={formData.observaciones || ''}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="textarea-compact"
                  placeholder="Observaciones generales sobre el profesor"
                  disabled={isViewMode}
                />
              </div>
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
                        className={`w-2 h-2 rounded-full ${
                          isCompleted || isCurrent ? 'bg-primary' : 'bg-gray-300'
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
                {activeTab === 'laboral' ? (
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="btn-primary flex items-center text-sm py-2 px-4"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {mode === 'create' ? 'Crear Profesor' : 'Guardar Cambios'}
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

export default Profesores;
