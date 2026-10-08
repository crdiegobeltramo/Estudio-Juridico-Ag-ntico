import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Gavel, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { NavTab } from './Sidebar.tsx';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab, params?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'Constitución Nacional — Art. 19 Principio de Reserva', type: 'norma', tab: 'legislation' as NavTab },
    { title: 'Constitución Nacional — Art. 43 Acción de Amparo Colectivo', type: 'norma', tab: 'legislation' as NavTab },
    { title: 'Fallo CSJN "Halabi, Ernesto" (Acciones de clase e intereses homogéneos)', type: 'fallo', tab: 'jurisprudence' as NavTab },
    { title: 'Fallo CSJN "Siri, Ángel" (Nacimiento del amparo constitucional)', type: 'fallo', tab: 'jurisprudence' as NavTab },
    { title: 'Código Civil y Comercial — Art. 1708 Funciones de la Responsabilidad', type: 'norma', tab: 'legislation' as NavTab },
    { title: 'Ley de Contrato de Trabajo — Art. 245 Indemnización por antigüedad', type: 'norma', tab: 'legislation' as NavTab },
    { title: 'Expediente Pérez c/ Transporte s/ Daños y Perjuicios', type: 'expediente', tab: 'expediente' as NavTab },
    { title: 'Simulador de Examen Oral — Responsabilidad Civil', type: 'campus', tab: 'campus' as NavTab },
  ];

  const filtered = searchTerm.trim() 
    ? quickLinks.filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : quickLinks;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-[#0c162e] border border-[#1d2f5d] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-[#1d2f5d] flex items-center gap-3 bg-[#0f1d3c]">
          <Search className="w-5 h-5 text-[#c5a059]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por norma, número de ley, carátula de fallo, concepto dogmático o expediente..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#16274e]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-3 divide-y divide-[#1d2f5d]/30">
          <div className="text-[10px] uppercase font-bold text-[#c5a059] px-2 py-1 tracking-wider">
            {searchTerm ? 'Resultados Coincidentes' : 'Acceso Rápido a Fuentes Fundamentales'}
          </div>
          {filtered.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                onNavigate(item.tab);
                onClose();
              }}
              className="w-full text-left p-3 rounded-lg hover:bg-[#132349] flex items-center justify-between text-xs text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-3">
                {item.type === 'norma' && <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />}
                {item.type === 'fallo' && <Gavel className="w-4 h-4 text-emerald-400 shrink-0" />}
                {item.type === 'expediente' && <FileText className="w-4 h-4 text-blue-400 shrink-0" />}
                {item.type === 'campus' && <Sparkles className="w-4 h-4 text-[#c5a059] shrink-0" />}
                <span className="font-medium text-slate-200 group-hover:text-[#fdfbf7]">{item.title}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#c5a059] transform group-hover:translate-x-1 transition-all" />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No se encontraron coincidencias exactas para "{searchTerm}". Pruebe consultar directamente en el Asistente Jurídico IA.
            </div>
          )}
        </div>

        <div className="p-3 bg-[#080e1d] border-t border-[#1d2f5d] flex justify-between items-center text-[11px] text-slate-400">
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-[#122040] border border-[#1d2f5d] text-[10px] font-mono">ESC</kbd> para cerrar
          </span>
          <span className="text-[#c5a059] font-medium">Academia Virtual del Derecho</span>
        </div>
      </div>
    </div>
  );
};
