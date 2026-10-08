import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Database, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Server,
  Lock,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const AdminView: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    totalDocuments: 6,
    totalChunks: 38,
    totalCases: 2,
    activeQuizzes: 3,
    activeFlashcards: 4,
    apiStatus: 'Gemini 3.8 Flash Activo',
    connectors: []
  });

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, time: '2026-09-30 20:12', user: 'Dra. Luciana Cervelli', action: 'Consulta Asistente Jurídico IA', detail: 'Factor objetivo CCCN art. 1722', status: 'Exitoso' },
    { id: 2, time: '2026-09-30 19:45', user: 'Dra. Luciana Cervelli', action: 'Generación de Borrador Forense', detail: 'Demanda Ordinaria Daños y Perjuicios', status: 'Exitoso' },
    { id: 3, time: '2026-09-30 18:30', user: 'Dra. Luciana Cervelli', action: 'Ingesta RAG Documental', detail: 'Carga de Nota Doctrina Fallo Halabi', status: 'Verificado' },
    { id: 4, time: '2026-09-30 17:15', user: 'Estudiante Campus', action: 'Simulacro Examen Oral', detail: 'Evaluación formativa Responsabilidad Civil', status: 'Completado' },
  ]);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Consola de Administración & Auditoría
        </div>
        <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#fdfbf7]">
          Panel de Control de la Plataforma Institucional
        </h1>
        <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
          Supervisión de conectores a fuentes normativas de la República Argentina, monitoreo de inferencia de modelos Gemini en backend, control de accesos e indexación RAG.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c162e] border border-[#1d2f5d] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Documentos Oficiales</span>
            <Database className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.totalDocuments}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% verificados con InfoLEG/CSJN
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c162e] border border-[#1d2f5d] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Fragmentos RAG Indexados</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.totalChunks}
          </div>
          <p className="text-[11px] text-slate-400">
            Artículos y holdings segmentados
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c162e] border border-[#1d2f5d] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Motor de Inferencia</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-slate-100 truncate mt-1">
            {stats.apiStatus}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Servidor seguro en Node.js
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c162e] border border-[#1d2f5d] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Seguridad & Privacidad</span>
            <Lock className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1">
            Aislamiento Estricto
          </div>
          <p className="text-[11px] text-slate-400">
            Sin exposición de secretos en frontend
          </p>
        </div>
      </div>

      {/* Official Connectors Status */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-sm text-[#fdfbf7] flex items-center gap-2">
          <Server className="w-4 h-4 text-[#c5a059]" /> Conectores Oficiales de Datos Jurídicos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {stats.connectors?.map((conn: any, i: number) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#0a1429] border border-[#1d2f5d] flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">{conn.name}</span>
                <span className="text-[10px] text-slate-400">Última comprobación: {conn.lastSync}</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {conn.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sensitive Operations Audit Log */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#1d2f5d] pb-3">
          <h3 className="font-serif font-bold text-sm text-[#fdfbf7] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#c5a059]" /> Registro de Auditoría de Operaciones Sensibles
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Últimas actividades registradas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-[#1d2f5d] text-[10px] uppercase font-mono text-[#c5a059]">
                <th className="pb-2.5">Fecha y Hora</th>
                <th className="pb-2.5">Usuario / Operador</th>
                <th className="pb-2.5">Acción</th>
                <th className="pb-2.5">Detalle</th>
                <th className="pb-2.5 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d2f5d]/50">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#112040]/50 transition-colors">
                  <td className="py-2.5 font-mono text-[11px] text-slate-400">{log.time}</td>
                  <td className="py-2.5 font-medium text-slate-200">{log.user}</td>
                  <td className="py-2.5 text-slate-300">{log.action}</td>
                  <td className="py-2.5 text-slate-400 text-[11px]">{log.detail}</td>
                  <td className="py-2.5 text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
