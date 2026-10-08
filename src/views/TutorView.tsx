import React, { useState } from 'react';
import { 
  CalendarClock, 
  Target, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  BookOpen, 
  Calendar as CalendarIcon,
  Award
} from 'lucide-react';
import { StudyPlannerGoal } from '../types/index.ts';

export const TutorView: React.FC = () => {
  const [goals, setGoals] = useState<StudyPlannerGoal[]>([
    {
      id: 'goal-1',
      materia: 'Derecho Civil y Comercial — Obligaciones y Daños',
      fechaExamen: '2026-11-14',
      horasSemanales: 8,
      unidadesTotales: 14,
      unidadesCompletadas: 10,
      proximoRepaso: 'Mañana (Unidad 11: Responsabilidad Objetiva)',
      estado: 'al_dia'
    },
    {
      id: 'goal-2',
      materia: 'Derecho Constitucional — Poder y Garantías',
      fechaExamen: '2026-10-28',
      horasSemanales: 6,
      unidadesTotales: 12,
      unidadesCompletadas: 8,
      proximoRepaso: 'Viernes (Acciones Colectivas y Fallo Halabi)',
      estado: 'en_curso'
    },
    {
      id: 'goal-3',
      materia: 'Derecho del Trabajo y la Seguridad Social',
      fechaExamen: '2026-12-05',
      horasSemanales: 5,
      unidadesTotales: 10,
      unidadesCompletadas: 3,
      proximoRepaso: 'Lunes próximo (Principios del Derecho Laboral y Art 14 bis)',
      estado: 'en_curso'
    }
  ]);

  const [newMateria, setNewMateria] = useState('');
  const [newFecha, setNewFecha] = useState('2026-11-30');
  const [newHoras, setNewHoras] = useState(6);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMateria.trim()) return;

    const newGoal: StudyPlannerGoal = {
      id: `goal-${Date.now()}`,
      materia: newMateria,
      fechaExamen: newFecha,
      horasSemanales: newHoras,
      unidadesTotales: 12,
      unidadesCompletadas: 1,
      proximoRepaso: 'Próxima sesión planificada con técnica de repetición espaciada',
      estado: 'en_curso'
    };

    setGoals([...goals, newGoal]);
    setNewMateria('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c378] text-xs font-semibold uppercase tracking-wider mb-2">
              <CalendarClock className="w-3.5 h-3.5" /> Tutor Jurídico & Planificador de Metas
            </div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#fdfbf7]">
              Planificador Académico y Repaso Espaciado
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Organice materias, asigne horas de dedicación semanal, supervise el avance de unidades y reciba cronogramas pedagógicos con algoritmos de retención activa basados en repetición espaciada.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm self-start"
          >
            <Plus className="w-4 h-4" /> Nueva Materia o Meta
          </button>
        </div>
      </div>

      {/* Add Goal Modal / Form */}
      {showAddForm && (
        <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-5 shadow-sm animate-in fade-in">
          <h3 className="font-serif font-bold text-sm text-[#fdfbf7] mb-3">
            Programar Asignatura y Meta de Examen
          </h3>
          <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre de la Asignatura:</label>
              <input
                type="text"
                required
                value={newMateria}
                onChange={(e) => setNewMateria(e.target.value)}
                placeholder="Ej: Derecho Penal Parte Especial"
                className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Fecha de Examen Final / Parcial:</label>
              <input
                type="date"
                required
                value={newFecha}
                onChange={(e) => setNewFecha(e.target.value)}
                className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Horas Semanales Dedicables:</label>
              <input
                type="number"
                min="1"
                max="40"
                value={newHoras}
                onChange={(e) => setNewHoras(parseInt(e.target.value))}
                className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-[#122042] text-slate-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-[#c5a059] text-[#0b1325] px-5 py-2 rounded-xl font-bold hover:bg-[#d4af37]"
              >
                Guardar en Planificador
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Cards List */}
      <div className="space-y-4">
        {goals.map((g) => {
          const progressPercent = Math.round((g.unidadesCompletadas / g.unidadesTotales) * 100);
          return (
            <div
              key={g.id}
              className="p-5 rounded-2xl bg-[#0c162e] border border-[#1d2f5d] shadow-sm space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1d2f5d]/60 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-wider font-semibold">
                    {g.horasSemanales} horas semanales programadas
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#fdfbf7] mt-0.5">
                    {g.materia}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="p-2 rounded-lg bg-[#112040] border border-[#1d2f5d] flex items-center gap-1.5 text-slate-200">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Examen: <strong className="text-white">{g.fechaExamen}</strong></span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {progressPercent}% completado
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Progreso de Unidades: {g.unidadesCompletadas} de {g.unidadesTotales} módulos</span>
                  <span className="text-[#c5a059] font-medium">{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#122042] h-2.5 rounded-full overflow-hidden border border-[#1d2f5d]/80">
                  <div
                    className="bg-gradient-to-r from-[#c5a059] to-[#e5c378] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Spaced Repetition Box */}
              <div className="p-3 bg-[#0a1429] rounded-xl border border-[#1d2f5d] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c5a059] shrink-0" />
                  <span className="text-slate-300 font-medium">{g.proximoRepaso}</span>
                </div>
                <button
                  onClick={() => {
                    if (g.unidadesCompletadas < g.unidadesTotales) {
                      setGoals(goals.map(item => item.id === g.id ? { ...item, unidadesCompletadas: item.unidadesCompletadas + 1 } : item));
                    }
                  }}
                  className="px-3 py-1 rounded-lg bg-[#14264d] hover:bg-[#1a3266] text-[#e5c378] font-semibold text-xs border border-[#1d2f5d]"
                >
                  Registrar Avance (+1 Unidad)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
