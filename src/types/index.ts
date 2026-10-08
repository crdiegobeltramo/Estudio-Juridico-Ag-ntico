export type UserRole = 
  | 'estudiante'
  | 'abogado'
  | 'docente'
  | 'admin_plataforma'
  | 'admin_institucion';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution?: string;
  matricula?: string;
  jurisdiction: string;
  plan: 'free' | 'estudiante' | 'abogado' | 'institucional';
  avatarUrl?: string;
}

export type Jurisdiction = 
  | 'Nacional / Federal'
  | 'Ciudad Autónoma de Buenos Aires (CABA)'
  | 'Provincia de Buenos Aires'
  | 'Córdoba'
  | 'Santa Fe'
  | 'Mendoza'
  | 'Derecho Comparado / Mercosur';

export type LegalBranch = 
  | 'Derecho Constitucional'
  | 'Derecho Civil y Comercial'
  | 'Derecho Penal y Procesal Penal'
  | 'Derecho del Trabajo y Seguridad Social'
  | 'Derecho Administrativo'
  | 'Derecho Tributario y Financiero'
  | 'Derecho de Familia y Sucesiones'
  | 'Derecho Ambiental y Recursos Naturales'
  | 'Derecho Internacional Público y DDHH';

export type ResponseDepth = 'simple' | 'academica' | 'profesional';

export interface LegalDocument {
  id: string;
  title: string;
  category: 'legislacion' | 'jurisprudencia' | 'doctrina' | 'tratado' | 'resolucion' | 'apunte_academico';
  branch: LegalBranch;
  jurisdiction: Jurisdiction;
  courtOrOrganism: string;
  officialNumber?: string;
  officialSourceUrl?: string;
  publicationDate: string;
  decisionDate?: string;
  status: 'vigente' | 'derogado' | 'modificado_parcialmente' | 'en_analisis';
  license: string;
  incorporationDate: string;
  lastVerifiedDate: string;
  summary: string;
  fullText?: string;
  articles?: LegalArticle[];
  caseBrief?: CaseBrief;
  tags: string[];
  isDemo?: boolean;
}

export interface LegalArticle {
  number: string;
  title?: string;
  text: string;
  notes?: string;
  historicalVersion?: string;
}

export interface CaseBrief {
  caratula: string;
  tribunal: string;
  expedienteNumber: string;
  date: string;
  hechos: string;
  cuestionJuridica: string;
  decision: string;
  doctrinaFallo: string;
  votosMayoristas: string;
  votosDisidentes?: string;
  normasAplicadas: string[];
  lineaPrecedente: string;
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docTitle: string;
  articleOrSection?: string;
  paragraphIndex: number;
  sourceUrl?: string;
  text: string;
  jurisdiction: Jurisdiction;
  branch: LegalBranch;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: Citation[];
  depth?: ResponseDepth;
  branch?: LegalBranch;
  jurisdiction?: Jurisdiction;
  insufficientEvidence?: boolean;
}

export interface Citation {
  sourceTitle: string;
  docId?: string;
  articleOrSection?: string;
  officialUrl?: string;
  snippet: string;
  relevanceScore: number;
}

export interface LegalCaseFile {
  id: string;
  caratula: string;
  numeroExpediente: string;
  fuero: string;
  juzgado: string;
  jurisdiccion: Jurisdiction;
  cliente: string;
  contraparte: string;
  estadoProcesal: string;
  fechaInicio: string;
  proximoVencimiento?: string;
  resumenHechos: string;
  pretension: string;
  documentosAdjuntos: {
    id: string;
    nombre: string;
    tipo: string;
    fecha: string;
    contenido?: string;
  }[];
  actuaciones: {
    id: string;
    fecha: string;
    tipo: string;
    descripcion: string;
    responsable: string;
  }[];
  notasInternas?: string[];
}

export interface Flashcard {
  id: string;
  materia: string;
  pregunta: string;
  respuesta: string;
  normaReferencia: string;
  dificultad: 'basica' | 'intermedia' | 'avanzada';
}

export interface QuizQuestion {
  id: string;
  materia: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number; // 0-indexed
  explicacion: string;
  fundamentoLegal: string;
}

export interface OralExamSimulation {
  id: string;
  materia: string;
  tema: string;
  pregunta: string;
  respuestaEstudiante?: string;
  evaluacion?: {
    puntaje: number; // 1 to 10
    nivel: 'Aprobado Sobresaliente' | 'Aprobado Distinguido' | 'Aprobado Bueno' | 'Insuficiente / Requiere Repaso';
    fundamentacion: string;
    aspectosPositivos: string[];
    puntosMejora: string[];
    conceptosClaveFaltantes: string[];
  };
}

export interface StudyPlannerGoal {
  id: string;
  materia: string;
  fechaExamen: string;
  horasSemanales: number;
  unidadesTotales: number;
  unidadesCompletadas: number;
  proximoRepaso: string;
  estado: 'en_curso' | 'al_dia' | 'atrasado' | 'completado';
}
