import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  FileText,
  Video,
  Image,
  Link as LinkIcon,
  Upload,
  Download,
  Eye,
  X,
} from 'lucide-react';
import { mockRecursos, mockProfesores } from '../data/mockData';
import { RecursoEducativo, Nivel } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Recursos: React.FC = () => {
  const { user } = useAuth();
  const [recursos, setRecursos] = useState<RecursoEducativo[]>(mockRecursos);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('');
  const [nivelFiltro, setNivelFiltro] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const niveles: Nivel[] = ['Caminadores', 'Párvulos', 'Prejardín', 'Jardín', 'Transición'];

  const recursosFiltrados = recursos.filter((recurso) => {
    const matchesSearch =
      recurso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recurso.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recurso.materia.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = tipoFiltro ? recurso.tipo === tipoFiltro : true;
    const matchesNivel = nivelFiltro ? recurso.nivel === nivelFiltro : true;

    return matchesSearch && matchesTipo && matchesNivel;
  });

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'documento':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'imagen':
        return <Image className="w-5 h-5" />;
      case 'link':
        return <LinkIcon className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'documento':
        return 'bg-blue-100 text-blue-700';
      case 'video':
        return 'bg-purple-100 text-purple-700';
      case 'imagen':
        return 'bg-green-100 text-green-700';
      case 'link':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getProfesorNombre = (profesorId: string) => {
    const profesor = mockProfesores.find((p) => p.id === profesorId);
    return profesor ? `${profesor.nombres} ${profesor.apellidos}` : 'N/A';
  };

  const handleNuevoRecurso = () => {
    alert('Funcionalidad de subir recursos disponible próximamente');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <BookOpen className="w-8 h-8 text-primary mr-3" />
            Recursos Educativos
          </h1>
          <p className="text-gray-600">
            Biblioteca de materiales didácticos y educativos
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-secondary flex items-center"
        >
          <Upload className="w-5 h-5 mr-2" />
          Subir Recurso
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              placeholder="Buscar recursos..."
            />
          </div>
          <div>
            <label className="label">
              <Filter className="w-4 h-4 inline mr-2" />
              Tipo de Recurso
            </label>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="input-field"
            >
              <option value="">Todos los tipos</option>
              <option value="documento">Documento</option>
              <option value="video">Video</option>
              <option value="imagen">Imagen</option>
              <option value="link">Enlace</option>
            </select>
          </div>
          <div>
            <label className="label">Nivel</label>
            <select
              value={nivelFiltro}
              onChange={(e) => setNivelFiltro(e.target.value)}
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

      {/* Grid de Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recursosFiltrados.map((recurso) => (
          <div
            key={recurso.id}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`p-3 rounded-lg ${getTipoColor(recurso.tipo)}`}
              >
                {getTipoIcon(recurso.tipo)}
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {recurso.nivel}
              </span>
            </div>

            <h3 className="font-bold text-gray-800 mb-2 text-lg">
              {recurso.titulo}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {recurso.descripcion}
            </p>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center text-gray-600">
                <BookOpen className="w-4 h-4 mr-2 text-primary" />
                <span>{recurso.materia}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="font-medium">
                  {getProfesorNombre(recurso.profesorId)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Subido el {new Date(recurso.fechaSubida).toLocaleDateString('es-CO')}
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t">
              <button className="flex-1 flex items-center justify-center px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </button>
              <button className="flex-1 flex items-center justify-center px-3 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm">
                <Download className="w-4 h-4 mr-1" />
                Descargar
              </button>
            </div>
          </div>
        ))}
      </div>

      {recursosFiltrados.length === 0 && (
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron recursos</p>
        </div>
      )}

      {/* Modal Subir Recurso */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border-4 border-primary">
            <div className="bg-primary text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold drop-shadow-lg">Subir Nuevo Recurso</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label">Título del Recurso</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Guía de Lectoescritura"
                />
              </div>

              <div>
                <label className="label">Descripción</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Describe el contenido del recurso..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tipo de Recurso</label>
                  <select className="input-field">
                    <option value="documento">Documento</option>
                    <option value="video">Video</option>
                    <option value="imagen">Imagen</option>
                    <option value="link">Enlace</option>
                  </select>
                </div>

                <div>
                  <label className="label">Nivel</label>
                  <select className="input-field">
                    {niveles.map((nivel) => (
                      <option key={nivel} value={nivel}>
                        {nivel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Materia</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Matemáticas, Lenguaje..."
                />
              </div>

              <div>
                <label className="label">Archivo o URL</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Haz clic para seleccionar un archivo o ingresa una URL
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    PDF, DOC, JPG, PNG, MP4 o enlace web
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleNuevoRecurso}
                  className="btn-primary flex items-center"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Subir Recurso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recursos;
