import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  BookOpen, 
  Gavel, 
  ScrollText, 
  ExternalLink, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  FileText,
  Tag,
  ArrowRight,
  X,
  Bot
} from 'lucide-react';
import { LegalDocument, LegalBranch, Jurisdiction } from '../types/index.ts';

interface LibraryViewProps {
  onAskAIAboutDoc?: (docTitle: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onAskAIAboutDoc }) => {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [branchFilter, setBranchFilter] = useState('todas');
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [categoryFilter, branchFilter]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'todos') params.append('category', categoryFilter);
      if (branchFilter !== 'todas') params.append('branch', branchFilter);
      if (searchQuery) params.append('q', searchQuery);

      const res = await fetch(`/api/library?${params.toString()}`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c378] text-xs font-semibold uppercase tracking-wider mb-2">
          <Database className="w-3.5 h-3.5" /> Acervo Documental Jurídico Oficial
        </div>
        <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#fdfbf7]">
          Biblioteca Jurídica Inteligente
        </h1>
        <p className="mt-1 text-xs text-slate-300 max-w-3xl leading-relaxed">
          Colección sistemática de leyes argentinas, tratados internacionales, jurisprudencia de la CSJN y doctrina autorizada. Cada pieza cuenta con metadatos verificados, trazabilidad al enlace oficial (InfoLEG, SAIJ, CSJN) y estado de vigencia actualizado.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, carátula de fallo, ley, artículo o descriptor temático..."
              className="w-full bg-[#122042] text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0"
          >
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Categoría:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#122042] text-slate-200 border border-[#1d2f5d] rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="todos">Todas las categorías</option>
              <option value="legislacion">Legislación</option>
              <option value="jurisprudencia">Jurisprudencia</option>
              <option value="doctrina">Doctrina</option>
              <option value="tratado">Tratados Internacionales</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Rama:</span>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-[#122042] text-slate-200 border border-[#1d2f5d] rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="todas">Todas las ramas</option>
              <option value="Derecho Constitucional">Derecho Constitucional</option>
              <option value="Derecho Civil y Comercial">Derecho Civil y Comercial</option>
              <option value="Derecho del Trabajo y Seguridad Social">Derecho del Trabajo</option>
              <option value="Derecho Penal y Procesal Penal">Derecho Penal</option>
            </select>
          </div>

          <span className="text-slate-500 text-[11px] ml-auto">
            {documents.length} documentos verificados disponibles
          </span>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="group cursor-pointer bg-[#0c162e] hover:bg-[#112042] border border-[#1d2f5d] hover:border-[#c5a059]/60 p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-3 text-[10px]">
                <span className={`px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                  doc.category === 'legislacion' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                  doc.category === 'jurisprudencia' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                  'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                }`}>
                  {doc.category}
                </span>
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Vigente
                </span>
              </div>

              <h3 className="font-serif font-semibold text-sm text-[#fdfbf7] group-hover:text-[#c5a059] transition-colors leading-snug">
                {doc.title}
              </h3>

              <p className="mt-1 text-[11px] text-slate-400 font-mono">
                {doc.courtOrOrganism} • {doc.officialNumber || 'Oficial'}
              </p>

              <p className="mt-2 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {doc.summary}
              </p>

              <div className="mt-3 flex flex-wrap gap-1">
                {doc.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-[10px] bg-[#16274e] text-slate-300 px-2 py-0.5 rounded border border-[#213768]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1d2f5d]/50 flex items-center justify-between text-[11px] text-slate-400">
              <span>Verificado: {doc.lastVerifiedDate}</span>
              <span className="text-[#c5a059] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Ficha Completa <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0c162e] border border-[#1d2f5d] rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-[#1d2f5d] bg-[#0f1d3c] flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#c5a059]/20 text-[#f3dfa2] border border-[#c5a059]/30">
                    {selectedDoc.category}
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Estado: {selectedDoc.status}
                  </span>
                </div>
                <h2 className="text-base font-serif font-bold text-[#fdfbf7] leading-snug">
                  {selectedDoc.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedDoc.courtOrOrganism} • Publicación: {selectedDoc.publicationDate}
                </p>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#16274e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-200">
              {/* Official Source Link */}
              {selectedDoc.officialSourceUrl && (
                <div className="p-3 bg-[#112040] border border-[#1d2f5d] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">Enlace Oficial Verificado</span>
                    <p className="text-[11px] text-slate-400">Publicación del Boletín Oficial, InfoLEG o CSJN</p>
                  </div>
                  <a
                    href={selectedDoc.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#c5a059] text-[#0b1325] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 text-xs hover:bg-[#d4af37]"
                  >
                    Ver en Fuente Oficial <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Case Brief if available */}
              {selectedDoc.caseBrief && (
                <div className="space-y-3 p-4 bg-[#0a1327] rounded-xl border border-[#1d2f5d]">
                  <h3 className="font-serif font-bold text-sm text-[#c5a059] flex items-center gap-2">
                    <Gavel className="w-4 h-4" /> Ficha de Jurisprudencia CSJN
                  </h3>
                  <div>
                    <span className="font-semibold text-slate-200">Hechos del Caso:</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">{selectedDoc.caseBrief.hechos}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Cuestión Jurídica:</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">{selectedDoc.caseBrief.cuestionJuridica}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Decisión y Doctrina del Fallo:</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed font-medium text-[#fdfbf7]">
                      {selectedDoc.caseBrief.doctrinaFallo}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Normas Aplicadas:</span>
                    <p className="text-slate-400 mt-0.5 font-mono text-[11px]">{selectedDoc.caseBrief.normasAplicadas.join('; ')}</p>
                  </div>
                </div>
              )}

              {/* Articles if legislation */}
              {selectedDoc.articles && selectedDoc.articles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-serif font-bold text-sm text-[#fdfbf7] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#c5a059]" /> Artículos Clave Incluidos
                  </h3>
                  <div className="space-y-2">
                    {selectedDoc.articles.map((art, idx) => (
                      <div key={idx} className="p-3 bg-[#0a1327] rounded-xl border border-[#1d2f5d]/70">
                        <span className="font-bold text-[#c5a059]">
                          Artículo {art.number} {art.title ? `— ${art.title}` : ''}
                        </span>
                        <p className="mt-1 leading-relaxed text-slate-300 text-[11.5px]">{art.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Summary */}
              <div>
                <h4 className="font-semibold text-slate-200 mb-1">Descripción y Relevancia Doctrinal:</h4>
                <p className="leading-relaxed text-slate-300">{selectedDoc.summary}</p>
              </div>

              {/* Metadata block */}
              <div className="p-3 bg-[#080e1d] rounded-xl border border-[#1d2f5d]/50 text-[11px] text-slate-400 grid grid-cols-2 gap-2">
                <div>Licencia: {selectedDoc.license}</div>
                <div>Jurisdicción: {selectedDoc.jurisdiction}</div>
                <div>Fecha Incorporación: {selectedDoc.incorporationDate}</div>
                <div>Última Verificación: {selectedDoc.lastVerifiedDate}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#1d2f5d] bg-[#091122] flex justify-between items-center">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-lg bg-[#142347] text-slate-300 hover:text-white text-xs"
              >
                Cerrar
              </button>
              {onAskAIAboutDoc && (
                <button
                  onClick={() => {
                    const title = selectedDoc.title;
                    setSelectedDoc(null);
                    onAskAIAboutDoc(title);
                  }}
                  className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Bot className="w-3.5 h-3.5" /> Consultar esta norma con IA
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
