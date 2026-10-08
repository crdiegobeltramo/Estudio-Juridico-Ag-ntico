export type AgentCategory =
  | 'orchestration'
  | 'legal'
  | 'civil'
  | 'commercial'
  | 'family'
  | 'succession'
  | 'criminal'
  | 'labor'
  | 'tax'
  | 'constitutional'
  | 'administrative'
  | 'human-rights'
  | 'research'
  | 'documents'
  | 'litigation'
  | 'quality'
  | 'academic';

export type VerificationStatus = 'VERIFICADA' | 'REQUIERE VERIFICACIÓN' | 'NO VERIFICADA';

export type ConfidenceLevel = 'ALTO' | 'MEDIO' | 'BAJO';

export interface LegalAgentDefinition {
  id: string;
  internalName: string;
  name: string;
  emoji: string;
  category: AgentCategory;
  folderPath: string; // e.g. /agents/orchestration, /agents/labor, etc.
  specialty: string;
  description: string;
  isCore: boolean;
  isActive: boolean;
  // Structured Agency-style specification
  identity: string;
  personality: string;
  experience: string;
  mission: string;
  capabilities: string[];
  responsibilities: string[];
  workflow: string[];
  clarifyingQuestions: string[];
  deliverables: string[];
  qualityCriteria: string[];
  errorsToAvoid: string[];
  communicationStyle: string;
  handoffRules: string[];
  systemPrompt: string;
}

export interface LegalTeamDefinition {
  id: string;
  name: string;
  emoji: string;
  specialty: string;
  description: string;
  directorId: string;
  memberAgentIds: string[];
  workflowSummary: string;
  recommendedFor: string[];
}

export type QuickActionType =
  | 'CONSULTA_JURIDICA'
  | 'ANALIZAR_CASO'
  | 'REDACTAR_ESCRITO'
  | 'PREPARAR_DEMANDA'
  | 'ANALIZAR_CONTRATO'
  | 'INVESTIGAR_JURISPRUDENCIA'
  | 'INVESTIGAR_LEGISLACION'
  | 'ANALIZAR_DOCUMENTOS'
  | 'PREPARAR_ESTRATEGIA'
  | 'ESTUDIAR_DERECHO'
  | 'CREAR_CASO_PRACTICO'
  | 'REVISAR_ESCRITO';

export interface QuickActionConfig {
  id: QuickActionType;
  label: string;
  emoji: string;
  subtitle: string;
  defaultTeamId: string;
  suggestedAgents: string[];
  placeholderPrompt: string;
}

export interface ArgentineJurisdictionContext {
  pais: string; // default 'Argentina'
  tipoJurisdiccion: 'Federal' | 'Nacional' | 'Provincial' | 'Municipal' | 'Internacional / DDHH';
  provincia: string;
  ciudad: string;
  fuero: string;
  tribunal: string;
}

export interface AgentContribution {
  agentId: string;
  agentName: string;
  agentEmoji: string;
  specialty: string;
  stage:
    | 'DIAGNÓSTICO Y CLASIFICACIÓN'
    | 'INVESTIGACIÓN LEGISLATIVA'
    | 'INVESTIGACIÓN JURISPRUDENCIAL'
    | 'ANÁLISIS ESPECIALIZADO'
    | 'ESTRATEGIA PROCESAL'
    | 'AUDITORÍA ABOGADO DEL DIABLO'
    | 'VERIFICACIÓN DE CALIDAD'
    | 'REDACCIÓN FORENSE'
    | 'CONSOLIDACIÓN FINAL';
  summary: string;
  detailedOutput: string;
  deliverableType: string;
  verificationNotes?: string[];
}

export interface IdentifiedNorm {
  norma: string;
  articulo: string;
  ambito: 'NACIONAL' | 'PROVINCIAL' | 'MUNICIPAL' | 'INTERNACIONAL';
  fuente: string;
  vigencia: string;
  status: VerificationStatus;
  relevancia: string;
}

export interface IdentifiedJurisprudence {
  tribunal: string;
  fecha: string;
  caratula: string;
  expediente: string;
  tema: string;
  criterio: string;
  utilidadParaElCaso: string;
  fuente: string;
  status: VerificationStatus;
}

export interface ChronologyItem {
  fecha: string;
  hecho: string;
  documentoRelacionado: string;
  importancia: 'ALTA' | 'MEDIA' | 'BAJA';
  pruebaVinculada: string;
  alertaPlazo?: string;
}

export interface DevilAdvocateAudit {
  argumentosContraparte: string[];
  excepcionesPosibles: string[];
  pruebasFaltantes: string[];
  jurisprudenciaAdversa: string[];
  puntosDebiles: string[];
  riesgosProcesales: string[];
}

export interface ProceduralStrategyMatrix {
  fortalezas: string[];
  debilidades: string[];
  riesgos: string[];
  oportunidades: string[];
  estrategiaRecomendada: string;
  planB: string;
  alternativasConciliatorias: string;
}

export interface MultiAgentOrchestrationResponse {
  id: string;
  timestamp: string;
  query: string;
  actionType: QuickActionType;
  jurisdictionContext: ArgentineJurisdictionContext;
  // Stage 1-3: Director Classification
  classification: {
    materiaPrincipal: string;
    ramasSecundarias: string[];
    competenciaDetectada: string;
    posiblesConflictosNormativos: string[];
    informacionFaltante: string[];
    preguntasAclaratorias: string[];
  };
  // Separation of Information (Strict Deontological Rule)
  epistemicSeparation: {
    informacionAportadaPorUsuario: string[];
    conocimientoJuridicoGeneral: string[];
    normativaIdentificada: IdentifiedNorm[];
    jurisprudenciaIdentificada: IdentifiedJurisprudence[];
    informacionQueRequiereVerificacion: string[];
  };
  // Selected Agents & Team
  selectedTeamName: string;
  participatingAgents: {
    id: string;
    name: string;
    emoji: string;
    specialty: string;
  }[];
  // Step-by-step Agent Contributions
  agentContributions: AgentContribution[];
  // Strategy & Red Team Audit
  strategyMatrix: interfaceProceduralStrategyMatrix;
  devilAdvocate: DevilAdvocateAudit;
  chronology: ChronologyItem[];
  // Final Consolidated Document / Dictamen (10-section structure or forensic draft)
  finalConsolidatedReport: {
    titulo: string;
    antecedentes: string;
    hechos: string;
    problemaJuridico: string;
    normativaAplicable: string;
    jurisprudencia: string;
    analisisJuridico: string;
    riesgosYContraargumentos: string;
    alternativasYEstrategia: string;
    recomendacion: string;
    conclusion: string;
    borradorEscritoOContrato?: string;
    checklistFinal: string[];
  };
  // Confidence & Verification
  confidenceLevel: ConfidenceLevel;
  confidenceExplanation: string;
  ethicalDisclaimer: string;
}
