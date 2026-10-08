import { LEGAL_DIRECTOR_AGENT } from './orchestration/legalDirector.ts';
import { CORE_AGENTS } from './core/coreAgents.ts';
import { BRANCH_SPECIALIST_AGENTS } from './specialists/branchAgents.ts';
import { RESEARCH_AND_QUALITY_AGENTS } from './quality/researchAndQualityAgents.ts';
import { LEGAL_TEAMS, QUICK_ACTIONS } from './teams/legalTeams.ts';
import { LegalAgentDefinition, LegalTeamDefinition, QuickActionType } from './types.ts';

export * from './types.ts';
export {
  LEGAL_DIRECTOR_AGENT,
  CORE_AGENTS,
  BRANCH_SPECIALIST_AGENTS,
  RESEARCH_AND_QUALITY_AGENTS,
  LEGAL_TEAMS,
  QUICK_ACTIONS
};

export const ALL_LEGAL_AGENTS: LegalAgentDefinition[] = [
  LEGAL_DIRECTOR_AGENT,
  ...CORE_AGENTS,
  ...BRANCH_SPECIALIST_AGENTS,
  ...RESEARCH_AND_QUALITY_AGENTS
];

export function getAgentById(id: string): LegalAgentDefinition | undefined {
  return ALL_LEGAL_AGENTS.find(a => a.id === id);
}

export function getTeamById(id: string): LegalTeamDefinition | undefined {
  return LEGAL_TEAMS.find(t => t.id === id);
}

/**
 * Intelligent Multi-Agent Router (Director Jurídico Automatic Selection)
 * Analyzes user query and action type to assemble the optimal specialist team
 * without requiring the user to know which agent to choose.
 */
export function selectOptimalAgentsForQuery(
  query: string,
  actionType: QuickActionType = 'CONSULTA_JURIDICA',
  manualAgentIds?: string[],
  teamId?: string
): {
  detectedMateria: string;
  secondaryBranches: string[];
  selectedAgents: LegalAgentDefinition[];
  teamName: string;
} {
  const q = query.toLowerCase();

  let detectedMateria = 'Derecho Civil y Comercial';
  const secondaryBranches: string[] = [];
  const chosenIds = new Set<string>(['legal-director']);

  // 1. Domain keyword analysis for Argentine Law
  if (/(despid|trabaj|sueldo|salari|indemnizaci|lct|art\b|accidente laboral|registrad|negro|seclo|telegrama laboral|empleador|convenio colectivo)/i.test(q)) {
    detectedMateria = 'Derecho del Trabajo y Seguridad Social';
    chosenIds.add('labor-lawyer');
    chosenIds.add('labor-procedure-lawyer');
    secondaryBranches.push('Derecho Procesal Laboral');
  }

  if (/(jubilaci|pensi|anses|previsional|haber|retiro por invalidez|aportes|sipa)/i.test(q)) {
    if (detectedMateria === 'Derecho Civil y Comercial') {
      detectedMateria = 'Derecho de la Seguridad Social y Previsional';
    } else {
      secondaryBranches.push('Derecho Previsional');
    }
    chosenIds.add('social-security-lawyer');
  }

  if (/(penal|delito|denuncia|querella|imputad|prisi|excarcelaci|allanamiento|estafa|robo|hurto|homicidio|lesiones|fiscal|sobreseimiento)/i.test(q)) {
    detectedMateria = 'Derecho Penal y Procesal Penal';
    chosenIds.add('criminal-lawyer');
    chosenIds.add('criminal-procedure-lawyer');
    secondaryBranches.push('Garantías Constitucionales Penales');
  }

  if (/(divorcio|alimentos|cuota alimentaria|cuidado personal|tenencia|visitas|comunicaci|filiaci|adopci|violencia familiar|compensaci[oó]n econ[oó]mica|convivencial|matrimonio)/i.test(q)) {
    detectedMateria = 'Derecho de las Familias';
    chosenIds.add('family-lawyer');
    chosenIds.add('negotiation-mediator');
  }

  if (/(sucesi[oó]n|hereder|herencia|testamento|leg[ií]tima|declaratoria|colaci[oó]n|acervo|causante|partici[oó]n)/i.test(q)) {
    detectedMateria = 'Derecho Sucesorio';
    chosenIds.add('succession-lawyer');
    chosenIds.add('civil-commercial-lawyer');
  }

  if (/(impuesto|tribut|afip|arca|arba|agip|ingresos brutos|iva|ganancias|multa fiscal|determinaci[oó]n de oficio|ejecuci[oó]n fiscal|tribunal fiscal)/i.test(q)) {
    detectedMateria = 'Derecho Tributario y Contencioso Fiscal';
    chosenIds.add('tax-lawyer');
    chosenIds.add('tax-procedure-lawyer');
  }

  if (/(amparo|inconstitucional|constitucion|corte suprema|csjn|recurso extraordinario|h[aá]beas|derechos fundamentales|prepaga|obra social)/i.test(q)) {
    if (detectedMateria === 'Derecho Civil y Comercial') {
      detectedMateria = 'Derecho Constitucional y Procesal Constitucional';
    } else {
      secondaryBranches.push('Derecho Constitucional');
    }
    chosenIds.add('constitutional-lawyer');
    chosenIds.add('human-rights-lawyer');
  }

  if (/(acto administrativo|estado|licitaci[oó]n|empleo p[uú]blico|sumario administrativo|municipio|ministerio|recurso jer[aá]rquico|lnpa)/i.test(q)) {
    detectedMateria = 'Derecho Administrativo';
    chosenIds.add('administrative-lawyer');
  }

  if (/(consumidor|compra|garant[ií]a|cl[aá]usula abusiva|coprec|da[nñ]o punitivo|phishing|banco|vuelo|aerol[ií]nea|plan de ahorro)/i.test(q)) {
    detectedMateria = 'Derecho del Consumidor';
    chosenIds.add('consumer-lawyer');
    chosenIds.add('civil-commercial-lawyer');
  }

  if (/(sociedad|srl|s\.a\.|sas|estatuto|directorio|asamblea|socio|igj|concurso|quiebra)/i.test(q)) {
    detectedMateria = 'Derecho Societario y Empresario';
    chosenIds.add('corporate-society-lawyer');
    chosenIds.add('civil-commercial-lawyer');
  }

  if (/(contrato|locaci[oó]n|alquiler|cl[aá]usula|rescisi[oó]n|resoluci[oó]n|se[nñ]a|boleto de compraventa|fideicomiso)/i.test(q) || actionType === 'ANALIZAR_CONTRATO') {
    if (detectedMateria === 'Derecho Civil y Comercial') {
      detectedMateria = 'Derecho Contractual Civil y Comercial';
    }
    chosenIds.add('contracts-specialist');
    chosenIds.add('civil-commercial-lawyer');
  }

  if (/(ambiental|contaminaci[oó]n|impacto ambiental|residuos)/i.test(q)) {
    detectedMateria = 'Derecho Ambiental';
    chosenIds.add('environmental-lawyer');
  }

  if (/(whatsapp|firma digital|correo electr[oó]nico|datos personales|inform[aá]tic|software|ciber)/i.test(q)) {
    secondaryBranches.push('Derecho Digital y Evidencia Electrónica');
    chosenIds.add('digital-tech-lawyer');
  }

  if (/(marca|patente|inpi|derecho de autor|propiedad intelectual|plagio)/i.test(q)) {
    secondaryBranches.push('Propiedad Intelectual y Marcaria');
    chosenIds.add('ip-lawyer');
  }

  if (/(carta documento|telegrama|tcl\b|intimaci[oó]n|constituir en mora|mis comunicaciones|cd\b)/i.test(q)) {
    secondaryBranches.push('Comunicaciones Fehacientes y Cartas Documento');
    chosenIds.add('carta-documento-writer');
    chosenIds.add('legal-writer');
  }

  // 2. Action-based specialization
  if (actionType === 'PREPARAR_DEMANDA') {
    chosenIds.add('litigation-builder');
    chosenIds.add('legal-writer');
    chosenIds.add('chronology-builder');
  } else if (actionType === 'REDACTAR_ESCRITO' || actionType === 'REVISAR_ESCRITO') {
    chosenIds.add('legal-writer');
    chosenIds.add('carta-documento-writer');
  } else if (actionType === 'ESTUDIAR_DERECHO' || actionType === 'CREAR_CASO_PRACTICO') {
    chosenIds.add('academic-case-professor');
  } else if (actionType === 'ANALIZAR_DOCUMENTOS') {
    chosenIds.add('document-analyst');
    chosenIds.add('chronology-builder');
  }

  // If no specific branch was matched yet, include General + Civil/Commercial
  if (chosenIds.size <= 2) {
    chosenIds.add('general-lawyer');
    chosenIds.add('civil-commercial-lawyer');
    chosenIds.add('legal-consultant');
  }

  // Always include Research, Strategy, Devil's Advocate & Quality Verifier for complete pipeline
  chosenIds.add('legislation-researcher');
  chosenIds.add('jurisprudence-researcher');
  chosenIds.add('procedural-strategist');
  chosenIds.add('devils-advocate');
  chosenIds.add('legal-verifier');

  // Merge team or manual overrides if specified
  let teamName = 'Equipo Multiagente Dinámico (Convocado por Director Jurídico)';
  if (teamId) {
    const foundTeam = getTeamById(teamId);
    if (foundTeam) {
      teamName = foundTeam.name;
      foundTeam.memberAgentIds.forEach(id => chosenIds.add(id));
    }
  }
  if (manualAgentIds && manualAgentIds.length > 0) {
    manualAgentIds.forEach(id => chosenIds.add(id));
  }

  const selectedAgents = Array.from(chosenIds)
    .map(id => getAgentById(id))
    .filter((a): a is LegalAgentDefinition => !!a && a.isActive);

  return {
    detectedMateria,
    secondaryBranches,
    selectedAgents,
    teamName
  };
}
