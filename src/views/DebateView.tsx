import React, { useState } from 'react';
import { 
  MessageSquareQuote, 
  Scale, 
  Sparkles, 
  GitCompare, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

const debateTopics = [
  {
    id: 'dnu-limites',
    title: 'Límites constitucionales de los Decretos de Necesidad y Urgencia (Art. 99 inc. 3 CN)',
    rama: 'Derecho Constitucional',
    desc: '¿Cuál es el alcance del control judicial de la "necesidad y urgencia" a la luz de los fallos "Verrocchi" y "Consumidores Argentinos"?'
  },
  {
    id: 'dano-punitivo',
    title: 'Cuantificación y procedencia del Daño Punitivo (Art. 52 bis Ley 24.240)',
    rama: 'Derecho del Consumidor / Civil',
    desc: '¿Requiere dolo o culpa grave asimilable, o basta el mero incumplimiento contractual reiterado?'
  },
  {
    id: 'plataformas-laboral',
    title: 'Naturaleza jurídica de los repartidores y conductores de plataformas digitales',
    rama: 'Derecho del Trabajo',
    desc: '¿Existe relación de dependencia laboral tutelada por la LCT o es una figura de trabajo autónomo / parasubordinado?'
  },
  {
    id: 'ia-sentencias',
    title: 'Uso de Inteligencia Artificial Generativa en la fundamentación de sentencias judiciales',
    rama: 'Filosofía del Derecho / Procesal',
    desc: '¿Es compatible la asistencia de modelos de lenguaje con la garantía constitucional del juez natural y la debida fundamentación (art. 3 CCCN)?'
  }
];

export const DebateView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState(debateTopics[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [debateContent, setDebateContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateDebate = async (topicTitle: string, rama: string) => {
    setIsLoading(true);
    setDebateContent(null);
    try {
      const res = await fetch('/api/gemini/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temaControversial: topicTitle,
          rama
        })
      });
      const data = await res.json();
      setDebateContent(data.debate);
    } catch (err) {
      console.error(err);
      setDebateContent('Error al procesar el debate.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c378] text-xs font-semibold uppercase tracking-wider mb-2">
          <MessageSquareQuote className="w-3.5 h-3.5" /> Tribuna IA — Debate Jurídico Dialéctico
        </div>
        <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#fdfbf7]">
          Análisis Dialéctico de Controversias del Derecho Argentino
        </h1>
        <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
          Examen imparcial de cuestiones jurídicas complejas y debatidas en doctrina y jurisprudencia. Contrapone tesis y antítesis con fundamentación normativa estricta y culmina con una síntesis neutral de consensos y puntos abiertos.
        </p>
      </div>

      {/* Preset Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {debateTopics.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSelectedTopic(item);
              handleGenerateDebate(item.title, item.rama);
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              selectedTopic.id === item.id
                ? 'bg-[#14264d] border-[#c5a059] shadow-sm'
                : 'bg-[#0c162e] border-[#1d2f5d] hover:bg-[#102042]'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono text-[#c5a059] font-semibold">{item.rama}</span>
              <h3 className="font-serif font-bold text-xs text-[#fdfbf7] mt-1 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {item.desc}
              </p>
            </div>
            <span className="text-[10px] text-[#e5c378] font-semibold mt-3 flex items-center gap-1">
              Examinar Debate <GitCompare className="w-3 h-3" />
            </span>
          </div>
        ))}
      </div>

      {/* Custom Topic Form */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-4 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (customTopic.trim()) {
              handleGenerateDebate(customTopic, 'Derecho General');
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="O ingrese cualquier controversia jurídica argentina para contrastar posturas doctrinales..."
            className="flex-1 bg-[#122042] text-slate-100 placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
          />
          <button
            type="submit"
            disabled={!customTopic.trim() || isLoading}
            className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Debatir</span>
          </button>
        </form>
      </div>

      {/* Main Debate Render Area */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm space-y-4 min-h-[350px]">
        <div className="flex items-center justify-between border-b border-[#1d2f5d] pb-3 text-xs">
          <span className="font-serif font-bold text-[#fdfbf7] flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#c5a059]" /> Tribuna Jurídica: {selectedTopic.title}
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Síntesis Imparcial
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-[#c5a059] animate-spin" />
            <span>Confrontando doctrinas, citas de autores y fallos plenarios de la CSJN...</span>
          </div>
        ) : debateContent ? (
          <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap font-sans space-y-3">
            {debateContent}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            Seleccione una controversia del catálogo superior o proponga un tema para activar el análisis dialéctico.
          </div>
        )}
      </div>
    </div>
  );
};
