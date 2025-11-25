import React from 'react';
import { DATOS_COLEGIO } from '../types';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#006741] text-white mt-auto">
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          {/* Columna 1: Información del Colegio */}
          <div>
            <h3 className="font-bold text-lg mb-2">{DATOS_COLEGIO.nombreCompleto}</h3>
            <p className="text-sm text-white/90">NIT: {DATOS_COLEGIO.nit}</p>
          </div>

          {/* Columna 2: Dirección */}
          <div>
            <h4 className="font-semibold mb-2">Ubicación</h4>
            <p className="text-sm text-white/90">{DATOS_COLEGIO.direccion}</p>
            <p className="text-sm text-white/90">
              {DATOS_COLEGIO.ciudad}, {DATOS_COLEGIO.departamento} - Colombia
            </p>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h4 className="font-semibold mb-2">Contacto</h4>
            <p className="text-sm text-white/90">Tel: {DATOS_COLEGIO.telefono}</p>
            <p className="text-sm text-white/90">{DATOS_COLEGIO.email}</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-6 pt-4 text-center">
          <p className="text-sm text-white/90">
            © {new Date().getFullYear()} {DATOS_COLEGIO.nombreCompleto} - Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
