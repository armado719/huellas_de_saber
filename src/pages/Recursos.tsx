import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Grid,
  Image as ImageIcon,
  List,
  Presentation,
  Search,
  Share2,
  Sparkles,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Video,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockProfesores, mockRecursos } from '../data/mockData';
import { CategoriaRecurso, Nivel, RecursoEducativo, TipoRecurso } from '../types';

const Recursos: React.FC = () => {
  const { user } = useAuth();

  // ========== ESTADOS ==========
  const [recursos, setRecursos] = useState<RecursoEducativo[]>(mockRecursos);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('');
  const [nivelFiltro, setNivelFiltro] = useState<string>('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [ordenamiento, setOrdenamiento] = useState<string>('recientes');
  const [vistaActual, setVistaActual] = useState<'cuadricula' | 'lista'>('cuadricula');
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Modales
  const [showModalSubir, setShowModalSubir] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [showModalCompartir, setShowModalCompartir] = useState(false);
  const [showModalEstadisticas, setShowModalEstadisticas] = useState(false);
  const [recursoSeleccionado, setRecursoSeleccionado] = useState<RecursoEducativo | null>(null);

  // Formulario de subir recurso
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'documento' as TipoRecurso,
    url: '',
    nivel: [] as string[],
    categoria: '' as CategoriaRecurso | '',
    etiquetas: '',
    destacado: false,
    visibleProfesores: true,
    visiblePadres: false,
  });

  // Selección múltiple para vista de lista
  const [recursosSeleccionados, setRecursosSeleccionados] = useState<string[]>([]);

  const niveles: (Nivel | 'Todos los niveles' | 'Solo Profesores')[] = [
    'Caminadores',
    'Párvulos',
    'Prejardín',
    'Jardín',
    'Todos los niveles',
    'Solo Profesores',
  ];

  const categorias: CategoriaRecurso[] = [
    'Lenguaje y Comunicación',
    'Matemáticas',
    'Ciencias Naturales',
    'Ciencias Sociales',
    'Inglés',
    'Música',
    'Arte y Creatividad',
    'Educación Física',
    'Tecnología e Informática',
    'Valores y Ética',
    'Guías para Profesores',
    'Documentos Administrativos',
  ];

  // ========== FUNCIONES AUXILIARES ==========

  const getTipoIcon = (tipo: TipoRecurso, size: string = 'w-5 h-5') => {
    switch (tipo) {
      case 'documento':
        return <FileText className={size} />;
      case 'video':
        return <Video className={size} />;
      case 'presentacion':
        return <Presentation className={size} />;
      case 'imagen':
        return <ImageIcon className={size} />;
      case 'enlace':
        return <ExternalLink className={size} />;
      case 'plantilla':
        return <FileSpreadsheet className={size} />;
      default:
        return <FileText className={size} />;
    }
  };

  const getTipoColor = (tipo: TipoRecurso) => {
    switch (tipo) {
      case 'documento':
        return 'bg-red-100 text-red-700';
      case 'video':
        return 'bg-purple-100 text-purple-700';
      case 'presentacion':
        return 'bg-orange-100 text-orange-700';
      case 'imagen':
        return 'bg-blue-100 text-blue-700';
      case 'enlace':
        return 'bg-green-100 text-green-700';
      case 'plantilla':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTipoNombre = (tipo: TipoRecurso) => {
    switch (tipo) {
      case 'documento':
        return 'Documento PDF';
      case 'video':
        return 'Video';
      case 'presentacion':
        return 'Presentación';
      case 'imagen':
        return 'Imagen';
      case 'enlace':
        return 'Enlace';
      case 'plantilla':
        return 'Plantilla';
      default:
        return tipo;
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Caminadores':
        return 'bg-pink-100 text-pink-700';
      case 'Párvulos':
        return 'bg-purple-100 text-purple-700';
      case 'Prejardín':
        return 'bg-blue-100 text-blue-700';
      case 'Jardín':
        return 'bg-green-100 text-green-700';
      case 'Todos los niveles':
        return 'bg-primary/10 text-primary';
      case 'Solo Profesores':
        return 'bg-secondary/10 text-secondary';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getProfesorNombre = (profesorId: string) => {
    const profesor = mockProfesores.find((p) => p.id === profesorId);
    return profesor ? `${profesor.nombres} ${profesor.apellidos}` : 'N/A';
  };

  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const toggleFavorito = (recursoId: string) => {
    if (favoritos.includes(recursoId)) {
      setFavoritos(favoritos.filter((id) => id !== recursoId));
    } else {
      setFavoritos([...favoritos, recursoId]);
    }
  };

  const incrementarVisualizacion = (recursoId: string) => {
    setRecursos(
      recursos.map((rec) =>
        rec.id === recursoId
          ? { ...rec, visualizaciones: (rec.visualizaciones || 0) + 1 }
          : rec
      )
    );
  };

  const incrementarDescarga = (recursoId: string) => {
    setRecursos(
      recursos.map((rec) =>
        rec.id === recursoId ? { ...rec, descargas: (rec.descargas || 0) + 1 } : rec
      )
    );
  };

  // ========== FILTROS Y ORDENAMIENTO ==========

  const recursosFiltrados = useMemo(() => {
    let filtrados = recursos.filter((recurso) => {
      const matchesSearch =
        recurso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recurso.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recurso.materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recurso.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recurso.etiquetas?.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesTipo = tipoFiltro ? recurso.tipo === tipoFiltro : true;
      const matchesNivel = nivelFiltro ? recurso.nivel === nivelFiltro : true;
      const matchesCategoria = categoriaFiltro
        ? recurso.categoria === categoriaFiltro
        : true;

      return matchesSearch && matchesTipo && matchesNivel && matchesCategoria;
    });

    // Ordenamiento
    switch (ordenamiento) {
      case 'recientes':
        filtrados.sort(
          (a, b) =>
            new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime()
        );
        break;
      case 'antiguos':
        filtrados.sort(
          (a, b) =>
            new Date(a.fechaSubida).getTime() - new Date(b.fechaSubida).getTime()
        );
        break;
      case 'descargas':
        filtrados.sort((a, b) => (b.descargas || 0) - (a.descargas || 0));
        break;
      case 'alfabetico-asc':
        filtrados.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case 'alfabetico-desc':
        filtrados.sort((a, b) => b.titulo.localeCompare(a.titulo));
        break;
      default:
        break;
    }

    return filtrados;
  }, [recursos, searchTerm, tipoFiltro, nivelFiltro, categoriaFiltro, ordenamiento]);

  const recursosDestacados = useMemo(() => {
    return recursos.filter((r) => r.destacado);
  }, [recursos]);

  const recursosNuevos = useMemo(() => {
    return recursos.filter((r) => r.nuevo);
  }, [recursos]);

  const topRecursos = useMemo(() => {
    return [...recursos]
      .sort((a, b) => (b.descargas || 0) - (a.descargas || 0))
      .slice(0, 5);
  }, [recursos]);

  const limpiarFiltros = () => {
    setSearchTerm('');
    setTipoFiltro('');
    setNivelFiltro('');
    setCategoriaFiltro('');
    setOrdenamiento('recientes');
  };

  // ========== HANDLERS DE MODALES ==========

  const handleVerDetalle = (recurso: RecursoEducativo) => {
    setRecursoSeleccionado(recurso);
    incrementarVisualizacion(recurso.id);
    setShowModalDetalle(true);
  };

  const handleDescargar = (recurso: RecursoEducativo) => {
    incrementarDescarga(recurso.id);
    alert(`Descargando: ${recurso.titulo}`);
  };

  const handleCompartir = (recurso: RecursoEducativo) => {
    setRecursoSeleccionado(recurso);
    setShowModalCompartir(true);
  };

  const handleSubirRecurso = () => {
    if (!formData.titulo || !formData.descripcion || !formData.categoria || formData.nivel.length === 0) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const nuevoRecurso: RecursoEducativo = {
      id: `rec${recursos.length + 1}`,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      tipo: formData.tipo,
      url: formData.url || `/recursos/${formData.titulo.toLowerCase().replace(/ /g, '-')}.pdf`,
      nivel: formData.nivel[0] as any,
      materia: formData.categoria,
      categoria: formData.categoria as CategoriaRecurso,
      profesorId: user?.id || 'prof001',
      fechaSubida: new Date().toISOString().split('T')[0],
      tamaño: '2.5 MB',
      descargas: 0,
      visualizaciones: 0,
      destacado: formData.destacado,
      nuevo: true,
      etiquetas: formData.etiquetas.split(',').map((t) => t.trim()).filter((t) => t),
      visibleProfesores: formData.visibleProfesores,
      visiblePadres: formData.visiblePadres,
    };

    setRecursos([nuevoRecurso, ...recursos]);
    setShowModalSubir(false);

    // Limpiar formulario
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'documento',
      url: '',
      nivel: [],
      categoria: '',
      etiquetas: '',
      destacado: false,
      visibleProfesores: true,
      visiblePadres: false,
    });

    alert('✓ Recurso subido exitosamente');
  };

  const handleEliminarRecurso = (recursoId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este recurso?')) {
      setRecursos(recursos.filter((r) => r.id !== recursoId));
      setShowModalDetalle(false);
      alert('Recurso eliminado exitosamente');
    }
  };

  const handleCopiarEnlace = (recurso: RecursoEducativo) => {
    const enlace = `${window.location.origin}/recursos/${recurso.id}`;
    navigator.clipboard.writeText(enlace);
    alert('✓ Enlace copiado al portapapeles');
  };

  const toggleSeleccionRecurso = (recursoId: string) => {
    if (recursosSeleccionados.includes(recursoId)) {
      setRecursosSeleccionados(recursosSeleccionados.filter((id) => id !== recursoId));
    } else {
      setRecursosSeleccionados([...recursosSeleccionados, recursoId]);
    }
  };

  const handleDescargarSeleccionados = () => {
    if (recursosSeleccionados.length === 0) {
      alert('Selecciona al menos un recurso');
      return;
    }
    recursosSeleccionados.forEach((id) => {
      const recurso = recursos.find((r) => r.id === id);
      if (recurso) {
        incrementarDescarga(id);
      }
    });
    alert(`Descargando ${recursosSeleccionados.length} recursos seleccionados`);
    setRecursosSeleccionados([]);
  };

  // ========== ESTADÍSTICAS ==========

  const estadisticas = useMemo(() => {
    const totalRecursos = recursos.length;
    const totalDescargas = recursos.reduce((sum, r) => sum + (r.descargas || 0), 0);
    const recursoMasPopular = recursos.reduce((max, r) =>
      (r.descargas || 0) > (max.descargas || 0) ? r : max
    , recursos[0]);

    const recursoPorCategoria: Record<string, number> = {};
    recursos.forEach((r) => {
      recursoPorCategoria[r.categoria] = (recursoPorCategoria[r.categoria] || 0) + 1;
    });
    const categoriaMasUsada = Object.entries(recursoPorCategoria).reduce(
      (max, [cat, count]) => (count > max[1] ? [cat, count] : max),
      ['', 0]
    );

    return {
      totalRecursos,
      totalDescargas,
      recursoMasPopular,
      categoriaMasUsada: categoriaMasUsada[0],
    };
  }, [recursos]);

  // ========== CARRUSEL ==========

  const nextCarousel = () => {
    setCarouselIndex((prev) =>
      prev === recursosDestacados.length - 1 ? 0 : prev + 1
    );
  };

  const prevCarousel = () => {
    setCarouselIndex((prev) =>
      prev === 0 ? recursosDestacados.length - 1 : prev - 1
    );
  };

  // ========== RECURSOS RELACIONADOS ==========

  const getRecursosRelacionados = (recurso: RecursoEducativo) => {
    return recursos
      .filter(
        (r) =>
          r.id !== recurso.id &&
          (r.categoria === recurso.categoria || r.nivel === recurso.nivel)
      )
      .slice(0, 3);
  };

  // ========== RENDER ==========

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <BookOpen className="w-8 h-8 text-primary mr-3" />
            Recursos Educativos
          </h1>
          <p className="text-gray-600">
            Biblioteca completa de materiales didácticos y educativos
          </p>
        </div>
        <div className="flex space-x-3">
          {user?.rol === 'admin' && (
            <button
              onClick={() => setShowModalEstadisticas(true)}
              className="btn-outline flex items-center"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Estadísticas
            </button>
          )}
          <button
            onClick={() => setShowModalSubir(true)}
            className="btn-secondary flex items-center"
          >
            <Upload className="w-5 h-5 mr-2" />
            Subir Recurso
          </button>
        </div>
      </div>

      {/* Carrusel de Destacados */}
      {recursosDestacados.length > 0 && (
        <div className="card bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Sparkles className="w-6 h-6 text-primary mr-2" />
              Recursos Destacados
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={prevCarousel}
                className="p-2 rounded-lg bg-white hover:bg-gray-100 border"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextCarousel}
                className="p-2 rounded-lg bg-white hover:bg-gray-100 border"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {recursosDestacados[carouselIndex] && (
            <div className="bg-white rounded-xl p-6 border-2 border-primary/20">
              <div className="flex items-start space-x-6">
                <div className={`p-6 rounded-xl ${getTipoColor(recursosDestacados[carouselIndex].tipo)}`}>
                  {getTipoIcon(recursosDestacados[carouselIndex].tipo, 'w-12 h-12')}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {recursosDestacados[carouselIndex].titulo}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {recursosDestacados[carouselIndex].descripcion}
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      DESTACADO
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getNivelColor(recursosDestacados[carouselIndex].nivel)}`}>
                      {recursosDestacados[carouselIndex].nivel}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {recursosDestacados[carouselIndex].categoria}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center">
                      <Download className="w-3 h-3 mr-1" />
                      {recursosDestacados[carouselIndex].descargas} descargas
                    </span>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleVerDetalle(recursosDestacados[carouselIndex])}
                      className="btn-primary flex items-center"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Ver Detalle
                    </button>
                    <button
                      onClick={() => handleDescargar(recursosDestacados[carouselIndex])}
                      className="btn-outline flex items-center"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Descargar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Contenido Principal */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filtros */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros de Búsqueda
              </h3>
              <button
                onClick={limpiarFiltros}
                className="text-sm text-primary hover:text-primary/80"
              >
                Limpiar Filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="label-compact">
                  <Search className="w-4 h-4 inline mr-2" />
                  Buscar
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                  placeholder="Título, descripción, etiquetas..."
                />
              </div>

              <div>
                <label className="label-compact">Tipo de Recurso</label>
                <select
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos los tipos</option>
                  <option value="documento">📄 Documentos PDF</option>
                  <option value="video">🎥 Videos</option>
                  <option value="presentacion">📊 Presentaciones</option>
                  <option value="imagen">🖼️ Imágenes</option>
                  <option value="enlace">🔗 Enlaces</option>
                  <option value="plantilla">📁 Plantillas</option>
                </select>
              </div>

              <div>
                <label className="label-compact">Nivel Educativo</label>
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

              <div>
                <label className="label-compact">Categoría</label>
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-compact">Ordenar Por</label>
                <select
                  value={ordenamiento}
                  onChange={(e) => setOrdenamiento(e.target.value)}
                  className="input-field"
                >
                  <option value="recientes">Más recientes</option>
                  <option value="antiguos">Más antiguos</option>
                  <option value="descargas">Más descargados</option>
                  <option value="alfabetico-asc">Alfabético (A-Z)</option>
                  <option value="alfabetico-desc">Alfabético (Z-A)</option>
                </select>
              </div>

              <div>
                <label className="label-compact">Vista</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setVistaActual('cuadricula')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      vistaActual === 'cuadricula'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                    }`}
                  >
                    <Grid className="w-5 h-5 mr-2" />
                    Cuadrícula
                  </button>
                  <button
                    onClick={() => setVistaActual('lista')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      vistaActual === 'lista'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                    }`}
                  >
                    <List className="w-5 h-5 mr-2" />
                    Lista
                  </button>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Mostrando {recursosFiltrados.length} de {recursos.length} recursos
            </div>
          </div>

          {/* Vista de Cuadrícula */}
          {vistaActual === 'cuadricula' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recursosFiltrados.map((recurso) => (
                <div
                  key={recurso.id}
                  className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative group"
                >
                  {/* Badges superiores */}
                  <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
                    {recurso.nuevo && (
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg animate-pulse">
                        NUEVO
                      </span>
                    )}
                    {recurso.destacado && (
                      <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold shadow-lg">
                        ⭐ DESTACADO
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`p-4 rounded-xl ${getTipoColor(recurso.tipo)} shadow-md`}
                    >
                      {getTipoIcon(recurso.tipo, 'w-8 h-8')}
                    </div>
                    <button
                      onClick={() => toggleFavorito(recurso.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          favoritos.includes(recurso.id)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="font-bold text-gray-800 mb-2 text-lg line-clamp-2 min-h-[3.5rem]">
                    {recurso.titulo}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                    {recurso.descripcion}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getNivelColor(
                        recurso.nivel
                      )}`}
                    >
                      {recurso.nivel}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {recurso.categoria}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2 text-primary" />
                      <span className="font-medium">
                        {getProfesorNombre(recurso.profesorId)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(recurso.fechaSubida).toLocaleDateString('es-CO')}
                      </div>
                      {recurso.tamaño && (
                        <span className="font-medium">{recurso.tamaño}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Download className="w-3 h-3 mr-1" />
                        {recurso.descargas || 0} descargas
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {recurso.visualizaciones || 0} vistas
                      </div>
                    </div>
                  </div>

                  {recurso.etiquetas && recurso.etiquetas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recurso.etiquetas.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs flex items-center"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4 border-t">
                    <button
                      onClick={() => handleVerDetalle(recurso)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleDescargar(recurso)}
                      className="flex-1 flex items-center justify-center px-3 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </button>
                    <button
                      onClick={() => handleCompartir(recurso)}
                      className="px-3 py-2 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vista de Lista */}
          {vistaActual === 'lista' && (
            <div className="card overflow-x-auto">
              {recursosSeleccionados.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    {recursosSeleccionados.length} recursos seleccionados
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDescargarSeleccionados}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Seleccionados
                    </button>
                    <button
                      onClick={() => setRecursosSeleccionados([])}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              )}

              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRecursosSeleccionados(
                              recursosFiltrados.map((r) => r.id)
                            );
                          } else {
                            setRecursosSeleccionados([]);
                          }
                        }}
                        checked={
                          recursosSeleccionados.length ===
                            recursosFiltrados.length &&
                          recursosFiltrados.length > 0
                        }
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Nombre del Recurso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Nivel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Autor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Descargas
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Tamaño
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recursosFiltrados.map((recurso) => (
                    <tr
                      key={recurso.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={recursosSeleccionados.includes(recurso.id)}
                          onChange={() => toggleSeleccionRecurso(recurso.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`p-2 rounded-lg inline-flex ${getTipoColor(
                            recurso.tipo
                          )}`}
                        >
                          {getTipoIcon(recurso.tipo, 'w-5 h-5')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div>
                            <div className="font-medium text-gray-800 flex items-center space-x-2">
                              <span>{recurso.titulo}</span>
                              {recurso.nuevo && (
                                <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-bold">
                                  NUEVO
                                </span>
                              )}
                              {recurso.destacado && (
                                <span className="text-yellow-400">⭐</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {recurso.descripcion}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {recurso.categoria}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getNivelColor(
                            recurso.nivel
                          )}`}
                        >
                          {recurso.nivel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getProfesorNombre(recurso.profesorId)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(recurso.fechaSubida).toLocaleDateString(
                          'es-CO'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-1 text-blue-500" />
                          {recurso.descargas || 0}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                        {recurso.tamaño || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVerDetalle(recurso)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDescargar(recurso)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Descargar"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCompartir(recurso)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Compartir"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {recursosFiltrados.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No se encontraron recursos
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {recursosFiltrados.length === 0 && vistaActual === 'cuadricula' && (
            <div className="card text-center py-16">
              <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No se encontraron recursos
              </h3>
              <p className="text-gray-500 mb-4">
                Intenta ajustar los filtros de búsqueda
              </p>
              <button onClick={limpiarFiltros} className="btn-outline">
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Derecho */}
        <div className="space-y-6">
          {/* Top 5 Recursos */}
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-primary mr-2" />
              Top 5 Más Descargados
            </h3>
            <div className="space-y-3">
              {topRecursos.map((recurso, idx) => (
                <div
                  key={recurso.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleVerDetalle(recurso)}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">
                      {recurso.titulo}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Download className="w-3 h-3 mr-1" />
                      {recurso.descargas || 0} descargas
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recursos Nuevos */}
          {recursosNuevos.length > 0 && (
            <div className="card bg-red-50 border-2 border-red-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 text-red-600 mr-2" />
                Recursos Nuevos
              </h3>
              <div className="space-y-3">
                {recursosNuevos.slice(0, 3).map((recurso) => (
                  <div
                    key={recurso.id}
                    className="flex items-start space-x-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all"
                    onClick={() => handleVerDetalle(recurso)}
                  >
                    <div
                      className={`p-2 rounded-lg ${getTipoColor(recurso.tipo)}`}
                    >
                      {getTipoIcon(recurso.tipo, 'w-5 h-5')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">
                        {recurso.titulo}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(recurso.fechaSubida).toLocaleDateString(
                          'es-CO'
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mis Favoritos */}
          {favoritos.length > 0 && (
            <div className="card bg-yellow-50 border-2 border-yellow-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Star className="w-5 h-5 text-yellow-600 mr-2 fill-yellow-400" />
                Mis Favoritos ({favoritos.length})
              </h3>
              <div className="space-y-2">
                {recursos
                  .filter((r) => favoritos.includes(r.id))
                  .slice(0, 3)
                  .map((recurso) => (
                    <div
                      key={recurso.id}
                      className="flex items-center space-x-2 p-2 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => handleVerDetalle(recurso)}
                    >
                      <div
                        className={`p-2 rounded ${getTipoColor(recurso.tipo)}`}
                      >
                        {getTipoIcon(recurso.tipo, 'w-4 h-4')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 text-xs line-clamp-1">
                          {recurso.titulo}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Estadísticas Rápidas */}
          <div className="card bg-gradient-to-br from-primary/10 to-secondary/10">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 text-primary mr-2" />
              Estadísticas
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Total Recursos</span>
                <span className="font-bold text-primary text-lg">
                  {recursos.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Total Descargas</span>
                <span className="font-bold text-green-600 text-lg">
                  {recursos.reduce((sum, r) => sum + (r.descargas || 0), 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Mis Favoritos</span>
                <span className="font-bold text-yellow-600 text-lg">
                  {favoritos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MODAL SUBIR RECURSO ========== */}
      {showModalSubir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8 border-4 border-primary">
            <div className="bg-primary text-white p-6 flex justify-between items-center rounded-t-lg">
              <h2 className="text-2xl font-bold drop-shadow-lg flex items-center">
                <Upload className="w-7 h-7 mr-3" />
                Subir Nuevo Recurso
              </h2>
              <button
                onClick={() => setShowModalSubir(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">
                    Título del Recurso <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData({ ...formData, titulo: e.target.value })
                    }
                    className="input-field"
                    placeholder="Ej: Guía de Matemáticas para Jardín"
                    maxLength={100}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.titulo.length}/100 caracteres
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="label">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    className="input-field"
                    rows={3}
                    placeholder="Describe brevemente el contenido del recurso..."
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Mínimo 20 caracteres
                  </div>
                </div>

                <div>
                  <label className="label">
                    Tipo de Recurso <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipo: e.target.value as TipoRecurso,
                      })
                    }
                    className="input-field"
                  >
                    <option value="documento">📄 Documento PDF</option>
                    <option value="video">🎥 Video (Link de YouTube)</option>
                    <option value="presentacion">📊 Presentación</option>
                    <option value="imagen">🖼️ Imagen/Infografía</option>
                    <option value="enlace">🔗 Enlace Externo</option>
                    <option value="plantilla">📁 Archivo Descargable</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    Categoría/Materia <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoria: e.target.value as CategoriaRecurso,
                      })
                    }
                    className="input-field"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {(formData.tipo === 'video' || formData.tipo === 'enlace') && (
                  <div className="md:col-span-2">
                    <label className="label">
                      URL {formData.tipo === 'video' ? 'de YouTube' : ''}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      className="input-field"
                      placeholder={
                        formData.tipo === 'video'
                          ? 'https://www.youtube.com/watch?v=...'
                          : 'https://...'
                      }
                    />
                  </div>
                )}

                {formData.tipo !== 'video' && formData.tipo !== 'enlace' && (
                  <div className="md:col-span-2">
                    <label className="label">
                      Subir Archivo <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium mb-2">
                        Arrastra el archivo aquí o haz clic para seleccionar
                      </p>
                      <p className="text-sm text-gray-500">
                        Formatos permitidos: PDF, DOC, JPG, PNG, PPTX, XLSX
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Tamaño máximo: 50MB
                      </p>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="label">
                    Nivel Educativo <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-gray-50 rounded-lg border">
                    {niveles.map((nivel) => (
                      <label
                        key={nivel}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.nivel.includes(nivel)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                nivel: [...formData.nivel, nivel],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                nivel: formData.nivel.filter((n) => n !== nivel),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{nivel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="label">Etiquetas (separadas por comas)</label>
                  <input
                    type="text"
                    value={formData.etiquetas}
                    onChange={(e) =>
                      setFormData({ ...formData, etiquetas: e.target.value })
                    }
                    className="input-field"
                    placeholder="Ej: actividades, lúdico, evaluación"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  {user?.rol === 'admin' && (
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <input
                        type="checkbox"
                        checked={formData.destacado}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            destacado: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          ⭐ Marcar como destacado
                        </div>
                        <div className="text-xs text-gray-600">
                          Solo administradores
                        </div>
                      </div>
                    </label>
                  )}

                  <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 rounded-lg border">
                    <input
                      type="checkbox"
                      checked={formData.visibleProfesores}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          visibleProfesores: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">Visible para profesores</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 rounded-lg border">
                    <input
                      type="checkbox"
                      checked={formData.visiblePadres}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          visiblePadres: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">
                      Visible para padres (futuro)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowModalSubir(false)}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => alert('Función de guardar como borrador')}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Guardar como Borrador
              </button>
              <button
                onClick={handleSubirRecurso}
                className="btn-secondary flex items-center px-6"
              >
                <Upload className="w-5 h-5 mr-2" />
                Subir Recurso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL VER DETALLE ========== */}
      {showModalDetalle && recursoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 flex justify-between items-start rounded-t-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className={`p-3 rounded-lg ${getTipoColor(
                      recursoSeleccionado.tipo
                    )} bg-white`}
                  >
                    {getTipoIcon(recursoSeleccionado.tipo, 'w-8 h-8')}
                  </div>
                  <div>
                    <div className="text-sm opacity-90">
                      {getTipoNombre(recursoSeleccionado.tipo)}
                    </div>
                    <h2 className="text-2xl font-bold drop-shadow-lg">
                      {recursoSeleccionado.titulo}
                    </h2>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getNivelColor(
                      recursoSeleccionado.nivel
                    )}`}
                  >
                    {recursoSeleccionado.nivel}
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {recursoSeleccionado.categoria}
                  </span>
                  {recursoSeleccionado.destacado && (
                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold">
                      ⭐ DESTACADO
                    </span>
                  )}
                  {recursoSeleccionado.nuevo && (
                    <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
                      NUEVO
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowModalDetalle(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-4"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Descripción */}
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Descripción</h3>
                <p className="text-gray-600">{recursoSeleccionado.descripcion}</p>
              </div>

              {/* Información */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Autor</div>
                  <div className="font-medium text-gray-800 flex items-center">
                    <User className="w-4 h-4 mr-1 text-primary" />
                    {getProfesorNombre(recursoSeleccionado.profesorId)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Fecha</div>
                  <div className="font-medium text-gray-800 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-primary" />
                    {new Date(recursoSeleccionado.fechaSubida).toLocaleDateString(
                      'es-CO',
                      { day: 'numeric', month: 'long', year: 'numeric' }
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Tamaño</div>
                  <div className="font-medium text-gray-800">
                    {recursoSeleccionado.tamaño || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Descargas</div>
                  <div className="font-medium text-gray-800 flex items-center">
                    <Download className="w-4 h-4 mr-1 text-green-600" />
                    {recursoSeleccionado.descargas || 0}
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="flex items-center space-x-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Visualizaciones</div>
                    <div className="text-xl font-bold text-blue-600">
                      {recursoSeleccionado.visualizaciones || 0}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">Descargas</div>
                    <div className="text-xl font-bold text-green-600">
                      {recursoSeleccionado.descargas || 0}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Star
                    className={`w-5 h-5 ${
                      favoritos.includes(recursoSeleccionado.id)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-400'
                    }`}
                  />
                  <div>
                    <div className="text-sm text-gray-600">Favoritos</div>
                    <div className="text-xl font-bold text-yellow-600">
                      {favoritos.includes(recursoSeleccionado.id) ? '1' : '0'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Embebido */}
              {recursoSeleccionado.tipo === 'video' && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Vista Previa</h3>
                  {getYoutubeVideoId(recursoSeleccionado.url) ? (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                          recursoSeleccionado.url
                        )}`}
                        title={recursoSeleccionado.titulo}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="p-8 bg-gray-100 rounded-lg text-center">
                      <Video className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">
                        Vista previa no disponible
                      </p>
                      <a
                        href={recursoSeleccionado.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Ver en YouTube →
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Imagen */}
              {recursoSeleccionado.tipo === 'imagen' && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Vista Previa</h3>
                  <div className="p-8 bg-gray-100 rounded-lg text-center">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Vista previa de imagen</p>
                  </div>
                </div>
              )}

              {/* Enlace Externo */}
              {recursoSeleccionado.tipo === 'enlace' && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">
                    Enlace Externo
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <div className="flex items-center space-x-3">
                      <ExternalLink className="w-8 h-8 text-primary" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-1">URL:</div>
                        <div className="font-mono text-sm text-primary break-all">
                          {recursoSeleccionado.url}
                        </div>
                      </div>
                    </div>
                    <a
                      href={recursoSeleccionado.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Abrir Enlace
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                </div>
              )}

              {/* Etiquetas */}
              {recursoSeleccionado.etiquetas &&
                recursoSeleccionado.etiquetas.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3">Etiquetas</h3>
                    <div className="flex flex-wrap gap-2">
                      {recursoSeleccionado.etiquetas.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Recursos Relacionados */}
              {getRecursosRelacionados(recursoSeleccionado).length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">
                    Recursos Similares
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getRecursosRelacionados(recursoSeleccionado).map(
                      (recurso) => (
                        <div
                          key={recurso.id}
                          className="p-3 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                          onClick={() => {
                            setRecursoSeleccionado(recurso);
                            incrementarVisualizacion(recurso.id);
                          }}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <div
                              className={`p-2 rounded ${getTipoColor(
                                recurso.tipo
                              )}`}
                            >
                              {getTipoIcon(recurso.tipo, 'w-4 h-4')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-800 line-clamp-2">
                                {recurso.titulo}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {recurso.descargas || 0} descargas
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => handleDescargar(recursoSeleccionado)}
                className="btn-primary flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Descargar
              </button>
              <button
                onClick={() => handleCopiarEnlace(recursoSeleccionado)}
                className="btn-outline flex items-center"
              >
                <Copy className="w-5 h-5 mr-2" />
                Copiar Enlace
              </button>
              <button
                onClick={() => toggleFavorito(recursoSeleccionado.id)}
                className={`px-6 py-2 rounded-lg border-2 font-medium flex items-center transition-colors ${
                  favoritos.includes(recursoSeleccionado.id)
                    ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Star
                  className={`w-5 h-5 mr-2 ${
                    favoritos.includes(recursoSeleccionado.id)
                      ? 'fill-yellow-400'
                      : ''
                  }`}
                />
                {favoritos.includes(recursoSeleccionado.id)
                  ? 'En Favoritos'
                  : 'Añadir a Favoritos'}
              </button>
              <button
                onClick={() => handleCompartir(recursoSeleccionado)}
                className="btn-outline flex items-center"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Compartir
              </button>
              {(user?.rol === 'admin' ||
                user?.id === recursoSeleccionado.profesorId) && (
                <>
                  <button className="px-6 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-medium flex items-center">
                    <Edit className="w-5 h-5 mr-2" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminarRecurso(recursoSeleccionado.id)}
                    className="px-6 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL COMPARTIR ========== */}
      {showModalCompartir && recursoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-primary text-white p-6 flex justify-between items-center rounded-t-lg">
              <h2 className="text-xl font-bold flex items-center">
                <Share2 className="w-6 h-6 mr-3" />
                Compartir Recurso
              </h2>
              <button
                onClick={() => setShowModalCompartir(false)}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  {recursoSeleccionado.titulo}
                </h3>
                <p className="text-sm text-gray-600">
                  {recursoSeleccionado.descripcion}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleCopiarEnlace(recursoSeleccionado)}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center">
                    <Copy className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="font-medium text-gray-800">
                      Copiar Enlace
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">→</span>
                </button>

                <button className="w-full px-4 py-3 bg-green-100 hover:bg-green-200 rounded-lg flex items-center justify-between transition-colors">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📧</span>
                    <span className="font-medium text-green-800">
                      Compartir por Email
                    </span>
                  </div>
                  <span className="text-sm text-green-600">→</span>
                </button>

                <button className="w-full px-4 py-3 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-between transition-colors">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">💬</span>
                    <span className="font-medium text-blue-800">
                      Compartir en WhatsApp
                    </span>
                  </div>
                  <span className="text-sm text-blue-600">→</span>
                </button>

                <button className="w-full px-4 py-3 bg-purple-100 hover:bg-purple-200 rounded-lg flex items-center justify-between transition-colors">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📱</span>
                    <span className="font-medium text-purple-800">
                      Generar Código QR
                    </span>
                  </div>
                  <span className="text-sm text-purple-600">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL ESTADÍSTICAS ========== */}
      {showModalEstadisticas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 flex justify-between items-center rounded-t-lg">
              <h2 className="text-2xl font-bold flex items-center">
                <BarChart3 className="w-7 h-7 mr-3" />
                Estadísticas de Recursos
              </h2>
              <button
                onClick={() => setShowModalEstadisticas(false)}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Tarjetas de Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <div className="text-3xl font-bold text-blue-600">
                      {estadisticas.totalRecursos}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-800">
                    Total de Recursos
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Download className="w-8 h-8 text-green-600" />
                    <div className="text-3xl font-bold text-green-600">
                      {estadisticas.totalDescargas}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-800">
                    Total de Descargas
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <Star className="w-8 h-8 text-yellow-600 fill-yellow-400" />
                    <div className="text-3xl font-bold text-yellow-600">
                      {recursosDestacados.length}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-yellow-800">
                    Recursos Destacados
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-8 h-8 text-red-600" />
                    <div className="text-3xl font-bold text-red-600">
                      {recursosNuevos.length}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-red-800">
                    Recursos Nuevos
                  </div>
                </div>
              </div>

              {/* Recurso Más Popular */}
              <div className="card bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Award className="w-6 h-6 text-purple-600 mr-2" />
                  Recurso Más Popular
                </h3>
                {estadisticas.recursoMasPopular && (
                  <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-4 rounded-lg ${getTipoColor(
                          estadisticas.recursoMasPopular.tipo
                        )}`}
                      >
                        {getTipoIcon(
                          estadisticas.recursoMasPopular.tipo,
                          'w-8 h-8'
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800 mb-2">
                          {estadisticas.recursoMasPopular.titulo}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {estadisticas.recursoMasPopular.descripcion}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-green-600">
                            <Download className="w-4 h-4 mr-1" />
                            <span className="font-bold">
                              {estadisticas.recursoMasPopular.descargas || 0}{' '}
                              descargas
                            </span>
                          </div>
                          <div className="flex items-center text-blue-600">
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="font-bold">
                              {estadisticas.recursoMasPopular.visualizaciones ||
                                0}{' '}
                              vistas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Categoría Más Usada */}
              <div className="card bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
                  Categoría Más Usada
                </h3>
                <div className="text-2xl font-bold text-blue-600">
                  {estadisticas.categoriaMasUsada}
                </div>
              </div>

              {/* Distribución por Tipo */}
              <div className="card">
                <h3 className="font-bold text-gray-800 mb-4">
                  Distribución por Tipo de Recurso
                </h3>
                <div className="space-y-3">
                  {['documento', 'video', 'presentacion', 'imagen', 'enlace', 'plantilla'].map(
                    (tipo) => {
                      const count = recursos.filter((r) => r.tipo === tipo).length;
                      const percentage = (count / recursos.length) * 100;
                      return (
                        <div key={tipo}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              {getTipoIcon(tipo as TipoRecurso, 'w-4 h-4')}
                              <span className="text-sm font-medium text-gray-700">
                                {getTipoNombre(tipo as TipoRecurso)}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-800">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Distribución por Nivel */}
              <div className="card">
                <h3 className="font-bold text-gray-800 mb-4">
                  Distribución por Nivel Educativo
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {niveles.map((nivel) => {
                    const count = recursos.filter((r) => r.nivel === nivel).length;
                    return (
                      <div
                        key={nivel}
                        className={`p-4 rounded-lg ${getNivelColor(
                          nivel
                        )} text-center`}
                      >
                        <div className="text-2xl font-bold mb-1">{count}</div>
                        <div className="text-xs font-medium">{nivel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recursos;
