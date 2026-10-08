import { LegalTeamDefinition, QuickActionConfig } from '../types.ts';

export const LEGAL_TEAMS: LegalTeamDefinition[] = [
  {
    id: 'equipo-demanda',
    name: 'EQUIPO DEMANDA',
    emoji: '⚔️',
    specialty: 'Preparación Integral de Demandas y Pretensiones Judiciales',
    description:
      'Equipo de litigación activa para estructurar demandas desde cero, recolectar normativa y jurisprudencia, construir la cronología fáctica, redactar el escrito constitutivo y blindarlo frente a excepciones previas.',
    directorId: 'legal-director',
    memberAgentIds: [
      'litigation-builder',
      'legal-writer',
      'legislation-researcher',
      'jurisprudence-researcher',
      'chronology-builder',
      'procedural-strategist',
      'devils-advocate',
      'legal-verifier'
    ],
    workflowSummary:
      'Director Jurídico → Constructor de Cronología → Investigadores (Legislación y Jurisprudencia) → Litigation Builder (13 etapas) & Legal Writer → Abogado del Diablo (Red Team) → Verificador Jurídico → Demanda Consolidada.',
    recommendedFor: [
      'Promover demanda de daños y perjuicios o incumplimiento contractual',
      'Iniciar acción ejecutiva, desalojo o cobro de pesos',
      'Solicitar medidas cautelares previas o conjuntas con la demanda'
    ]
  },
  {
    id: 'equipo-defensa',
    name: 'EQUIPO DEFENSA',
    emoji: '🛡️',
    specialty: 'Contestación de Demanda, Excepciones Previas, Nulidades y Reconvención',
    description:
      'Escuadrón defensivo especializado en auditar demandas recibidas, detectar defectos procesales, prescripción o falta de legitimación, negar hechos categóricamente (art. 356 CPCCN) y estructurar la estrategia de resistencia o reconvención.',
    directorId: 'legal-director',
    memberAgentIds: [
      'document-analyst',
      'chronology-builder',
      'procedural-strategist',
      'devils-advocate',
      'legislation-researcher',
      'jurisprudence-researcher',
      'legal-writer',
      'legal-verifier'
    ],
    workflowSummary:
      'Director Jurídico → Analista de Documentos (auditoría de traslado) → Cronología y Prescripción → Abogado del Diablo (excepciones previas) → Estratega Procesal → Legal Writer (Contestación) → Verificador Jurídico.',
    recommendedFor: [
      'Contestar una demanda dentro de un plazo perentorio en curso',
      'Oponer excepciones de prescripción, incompetencia o falta de legitimación',
      'Responder cartas documento o intimaciones extrajudiciales'
    ]
  },
  {
    id: 'equipo-laboral',
    name: 'EQUIPO LABORAL',
    emoji: '👷',
    specialty: 'Derecho Individual y Colectivo del Trabajo, Despidos, Registración y ART',
    description:
      'Integra especialistas en derecho laboral de fondo (LCT 20.744 y reformas Ley 27.742), procedimiento laboral (SECLO, Comisiones Médicas, Ley 18.345 y ritos provinciales), liquidaciones e intercambio telegráfico.',
    directorId: 'legal-director',
    memberAgentIds: [
      'labor-lawyer',
      'labor-procedure-lawyer',
      'legislation-researcher',
      'jurisprudence-researcher',
      'document-analyst',
      'procedural-strategist',
      'legal-writer',
      'legal-verifier'
    ],
    workflowSummary:
      'Director Jurídico → Abogado Laboralista + Procesal Laboral → Investigadores Normativo/Jurisprudencial → Analista de Recibos/TCL → Estratega Procesal → Legal Writer → Verificador Jurídico.',
    recommendedFor: [
      'Despido directo o indirecto y trabajo no registrado o deficientemente registrado',
      'Redacción de telegramas laborales (Ley 23.789) o cartas documento patronales',
      'Accidentes de trabajo y enfermedades profesionales ante Comisiones Médicas / Justicia Laboral'
    ]
  },
  {
    id: 'equipo-penal',
    name: 'EQUIPO PENAL',
    emoji: '⚖️',
    specialty: 'Defensa Penal, Querella, Garantías Constitucionales y Juicio Oral',
    description:
      'Equipo especializado en dogmática penal (teoría del delito) y derecho procesal penal (sistema acusatorio CPPF, CPPN y códigos provinciales), nulidades de procedimiento, medidas de coerción y recursos.',
    directorId: 'legal-director',
    memberAgentIds: [
      'criminal-lawyer',
      'criminal-procedure-lawyer',
      'constitutional-lawyer',
      'chronology-builder',
      'jurisprudence-researcher',
      'devils-advocate',
      'legal-writer',
      'legal-verifier'
    ],
    workflowSummary:
      'Director Jurídico → Penalista de Fondo (Teoría del Delito) + Procesalista Penal → Constitucionalista (Garantías art. 18 CN) → Abogado del Diablo → Legal Writer → Verificador Jurídico.',
    recommendedFor: [
      'Estrategia de defensa técnica, eximición de prisión o excarcelación',
      'Redacción de denuncia penal o constitución en parte querellante',
      'Planteo de nulidades de allanamiento, requisa o cadena de custodia'
    ]
  },
  {
    id: 'equipo-familia',
    name: 'EQUIPO FAMILIA',
    emoji: '👨‍👩‍👧',
    specialty: 'Divorcio, Alimentos, Responsabilidad Parental, Compensación Económica y Violencia Familiar',
    description:
      'Equipo interdisciplinario enfocado en el Libro Segundo del CCCN, tutela urgente de niños, niñas y adolescentes, convenios reguladores, liquidación de bienes y mediación familiar.',
    directorId: 'legal-director',
    memberAgentIds: [
      'family-lawyer',
      'negotiation-mediator',
      'human-rights-lawyer',
      'legislation-researcher',
      'jurisprudence-researcher',
      'legal-writer',
      'legal-verifier'
    ],
    workflowSummary:
      'Director Jurídico → Abogado de Familia → Especialista en Derechos Humanos (Interés Superior del Niño) → Mediador Familiar → Legal Writer → Verificador Jurídico.',
    recommendedFor: [
      'Demanda o convenio de alimentos provisorios y definitivos',
      'Divorcio vincular y reclamo de compensación económica (plazo de caducidad 6 meses)',
      'Cuidado personal, régimen de comunicación y medidas de protección'
    ]
  },
  {
    id: 'equipo-sucesiones',
    name: 'EQUIPO SUCESIONES',
    emoji: '🏛️',
    specialty: 'Sucesiones Ab Intestato y Testamentarias, Legítima, Colación y Partición',
    description:
      'Especializado en el Libro Quinto del CCCN, determinación de herederos, distinción de bienes propios y gananciales, defensa de la legítima hereditaria y acuerdos de partición.',
    directorId: 'legal-director',
    memberAgentIds: [
      'succession-lawyer',
      'civil-commercial-lawyer',
      'family-lawyer',
      'document-analyst',
      'negotiation-mediator',
      'legal-writer',
      'legal-verifier'
    ],
    workflowSummary:
      'Director Jurídico → Abogado de Sucesiones + Civil/Familia (bienes propios vs. gananciales) → Analista Documental (partidas y títulos) → Negociador de Partición → Legal Writer → Verificador.',
    recommendedFor: [
      'Inicio de sucesión ab intestato o testamentaria y declaratoria de herederos',
      'Acciones de colación o reducción por donaciones que afectan la legítima',
      'Convenios de administración y partición privada de herencia'
    ]
  },
  {
    id: 'equipo-tributario',
    name: 'EQUIPO TRIBUTARIO',
    emoji: '🏦',
    specialty: 'Defensa del Contribuyente, Determinaciones de Oficio, Tribunal Fiscal y Ejecuciones Fiscales',
    description:
      'Reúne especialistas en derecho tributario sustantivo, procedimiento fiscal (Ley 11.683 y códigos fiscales provinciales) y derecho constitucional tributario.',
    directorId: 'legal-director',
    memberAgentIds: [
      'tax-lawyer',
      'tax-procedure-lawyer',
      'constitutional-lawyer',
      'administrative-lawyer',
      'jurisprudence-researcher',
      'devils-advocate',
      'legal-writer',
      'legal-verifier'
    ],
    workflowSummary:
      'Director Jurídico → Tributarista + Procesal Tributario → Constitucionalista (No confiscatoriedad / Reserva de ley) → Abogado del Diablo → Legal Writer → Verificador Jurídico.',
    recommendedFor: [
      'Contestación de vistas en determinaciones de oficio y sumarios por multas',
      'Recursos ante ARCA/AFIP, Tribunal Fiscal de la Nación o comisiones provinciales',
      'Defensas y excepciones en juicios de ejecución fiscal'
    ]
  },
  {
    id: 'equipo-constitucional',
    name: 'EQUIPO CONSTITUCIONAL',
    emoji: '🇦🇷',
    specialty: 'Acciones de Amparo, Hábeas Data, Control de Constitucionalidad y Recurso Extraordinario Federal',
    description:
      'Equipo de litigio constitucional de alta complejidad para amparos individuales y colectivos (art. 43 CN), planteos de inconstitucionalidad y recursos ante la CSJN (art. 14 Ley 48).',
    directorId: 'legal-director',
    memberAgentIds: [
      'constitutional-lawyer',
      'human-rights-lawyer',
      'legislation-researcher',
      'jurisprudence-researcher',
      'procedural-strategist',
      'devils-advocate',
      'legal-writer',
      'legal-verifier'
    ],
    workflowSummary:
      'Director Jurídico → Constitucionalista + Especialista DDHH → Investigador de Fallos CSJN → Estratega Procesal → Abogado del Diablo (Admisibilidad Acordada 4/2007) → Legal Writer → Verificador.',
    recommendedFor: [
      'Amparos de salud contra obras sociales o empresas de medicina prepaga',
      'Amparos constitucionales y acciones declarativas de inconstitucionalidad (art. 322 CPCCN)',
      'Preparación de Recurso Extraordinario Federal y Queja ante la CSJN'
    ]
  },
  {
    id: 'equipo-administrativo',
    name: 'EQUIPO ADMINISTRATIVO',
    emoji: '🏛️',
    specialty: 'Procedimiento Administrativo, Empleo Público, Licitaciones y Responsabilidad del Estado',
    description:
      'Especializado en impugnación de actos administrativos (LNPA 19.549 y leyes provinciales), agotamiento de la vía, contrataciones públicas y demandas contencioso-administrativas.',
    directorId: 'legal-director',
    memberAgentIds: [
      'administrative-lawyer',
      'constitutional-lawyer',
      'chronology-builder',
      'legislation-researcher',
      'jurisprudence-researcher',
      'legal-writer',
      'legal-verifier'
    ],
    workflowSummary:
      'Director Jurídico → Abogado Administrativo → Constructor de Cronología (plazos de recursos y caducidad art. 25 LNPA) → Investigadores → Legal Writer → Verificador Jurídico.',
    recommendedFor: [
      'Recursos de reconsideración, jerárquico o alzada contra actos estatales',
      'Defensa en sumarios de empleo público o impugnación de pliegos licitatorios',
      'Demandas por responsabilidad del Estado por falta de servicio'
    ]
  },
  {
    id: 'equipo-empresarial',
    name: 'EQUIPO EMPRESARIAL',
    emoji: '🏢',
    specialty: 'Derecho Societario, Gobierno Corporativo, Propiedad Intelectual y Tecnología',
    description:
      'Asesoría corporativa integral combinando derecho comercial, sociedades (Ley 19.550), contratos empresariales, propiedad intelectual/marcas y derecho digital.',
    directorId: 'legal-director',
    memberAgentIds: [
      'corporate-society-lawyer',
      'civil-commercial-lawyer',
      'contracts-specialist',
      'ip-lawyer',
      'digital-tech-lawyer',
      'tax-lawyer',
      'legal-verifier'
    ],
    workflowSummary:
      'Director Jurídico → Abogado Societario + Comercial → Especialista en Contratos + Propiedad Intelectual / Digital → Tributarista → Verificador Jurídico.',
    recommendedFor: [
      'Constitución de sociedades, acuerdos de accionistas y conflictos de directorio/asamblea',
      'Protección de marcas, software, datos personales y activos digitales',
      'Reestructuración empresarial y prevención de contingencias societarias'
    ]
  },
  {
    id: 'equipo-contratos',
    name: 'EQUIPO CONTRATOS',
    emoji: '📑',
    specialty: 'Redacción, Auditoría de Riesgos, Revisión de Cláusulas y Negociación Contractual',
    description:
      'Equipo dedicado a la ingeniería contractual: audita borradores, detecta cláusulas críticas, equilibra obligaciones y genera la versión revisada lista para firma.',
    directorId: 'legal-director',
    memberAgentIds: [
      'contracts-specialist',
      'civil-commercial-lawyer',
      'document-analyst',
      'negotiation-mediator',
      'devils-advocate',
      'legal-writer',
      'legal-verifier'
    ],
    workflowSummary:
      'Director Jurídico → Analista Documental → Especialista en Contratos (6 bloques obligatorios) → Abogado del Diablo (detección de trampas contractuales) → Negociador → Versión Revisada.',
    recommendedFor: [
      'Revisar un contrato antes de firmarlo y detectar cláusulas riesgosas',
      'Redactar contratos de locación, prestación de servicios, fideicomiso, distribución o suministro',
      'Resolver o renegociar contratos en curso de ejecución'
    ]
  },
  {
    id: 'equipo-consumidor',
    name: 'EQUIPO CONSUMIDOR',
    emoji: '🛒',
    specialty: 'Defensa del Consumidor, Fraudes Bancarios/Fintech, Cláusulas Abusivas y Daño Punitivo',
    description:
      'Especializado en la Ley 24.240, art. 42 CN y CCCN para reclamos administrativos (COPREC / Defensa del Consumidor) y juicios sumarísimos con daño punitivo.',
    directorId: 'legal-director',
    memberAgentIds: [
      'consumer-lawyer',
      'digital-tech-lawyer',
      'civil-commercial-lawyer',
      'jurisprudence-researcher',
      'legal-writer',
      'legal-verifier'
    ],
    workflowSummary:
      'Director Jurídico → Especialista en Consumidor + Derecho Digital (evidencia electrónica / phishing) → Investigador Jurisprudencial → Legal Writer → Verificador Jurídico.',
    recommendedFor: [
      'Estafas bancarias, phishing, vaciamiento de cuentas o créditos preaprobados no consentidos',
      'Incumplimiento de garantías, planes de ahorro, aerolíneas, medicina prepaga o comercio electrónico',
      'Demandas sumarísimas con pedido de Daño Punitivo (art. 52 bis LDC)'
    ]
  },
  {
    id: 'equipo-derechos-humanos',
    name: 'EQUIPO DERECHOS HUMANOS',
    emoji: '🕊️',
    specialty: 'Control de Convencionalidad, Sistema Interamericano (CIDH / Corte IDH) y Grupos Vulnerables',
    description:
      'Equipo especializado en litigio estratégico de derechos humanos, aplicación de tratados del art. 75 inc. 22 CN, tutela de personas vulnerables y peticiones internacionales.',
    directorId: 'legal-director',
    memberAgentIds: [
      'human-rights-lawyer',
      'constitutional-lawyer',
      'social-security-lawyer',
      'environmental-lawyer',
      'jurisprudence-researcher',
      'legal-writer',
      'legal-verifier'
    ],
    workflowSummary:
      'Director Jurídico → Especialista en DDHH + Constitucionalista → Investigador de Estándares Corte IDH y CSJN → Legal Writer → Verificador Jurídico.',
    recommendedFor: [
      'Fundamentación de control de convencionalidad y principio pro persona en causas internas',
      'Tutela urgente de personas con discapacidad, niñez, adultos mayores o pueblos indígenas',
      'Análisis de agotamiento de recursos internos para petición ante la CIDH'
    ]
  }
];

export const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    id: 'CONSULTA_JURIDICA',
    label: 'CONSULTA JURÍDICA',
    emoji: '⚖️',
    subtitle: 'Encuadre integral, normativa aplicable y orientación clara',
    defaultTeamId: 'equipo-demanda',
    suggestedAgents: ['legal-director', 'general-lawyer', 'legal-consultant', 'legislation-researcher', 'legal-verifier'],
    placeholderPrompt: 'Describa su consulta jurídica (ej.: "Quiero saber qué derechos tengo ante un incumplimiento de contrato de locación comercial en CABA...").'
  },
  {
    id: 'ANALIZAR_CASO',
    label: 'ANALIZAR MI CASO',
    emoji: '🔍',
    subtitle: 'Diagnóstico fáctico, cronología, pruebas, riesgos y estrategia',
    defaultTeamId: 'equipo-demanda',
    suggestedAgents: ['legal-director', 'general-lawyer', 'chronology-builder', 'procedural-strategist', 'devils-advocate', 'legal-verifier'],
    placeholderPrompt: 'Relate los hechos de su caso con fechas aproximadas, partes involucradas y pruebas con las que cuenta...'
  },
  {
    id: 'REDACTAR_ESCRITO',
    label: 'REDACTAR ESCRITO',
    emoji: '✍️',
    subtitle: 'Escritos judiciales, contestaciones, recursos, oficios y cartas documento',
    defaultTeamId: 'equipo-demanda',
    suggestedAgents: ['legal-director', 'legal-writer', 'legislation-researcher', 'devils-advocate', 'legal-verifier'],
    placeholderPrompt: 'Indique qué escrito necesita redactar (ej.: Carta documento de intimación laboral, contestación de traslado, recurso de apelación, medida cautelar)...'
  },
  {
    id: 'PREPARAR_DEMANDA',
    label: 'PREPARAR DEMANDA',
    emoji: '🏗️',
    subtitle: 'Construcción de demanda en 13 etapas con borrador y checklist',
    defaultTeamId: 'equipo-demanda',
    suggestedAgents: ['legal-director', 'litigation-builder', 'legal-writer', 'legislation-researcher', 'jurisprudence-researcher', 'devils-advocate', 'legal-verifier'],
    placeholderPrompt: 'Describa la pretensión, quién es el actor y el demandado, los hechos principales, las pruebas disponibles y la jurisdicción...'
  },
  {
    id: 'ANALIZAR_CONTRATO',
    label: 'ANALIZAR CONTRATO',
    emoji: '📑',
    subtitle: 'Resumen, riesgos, cláusulas críticas, obligaciones y versión revisada',
    defaultTeamId: 'equipo-contratos',
    suggestedAgents: ['legal-director', 'contracts-specialist', 'civil-commercial-lawyer', 'devils-advocate', 'legal-verifier'],
    placeholderPrompt: 'Pegue el texto del contrato o las cláusulas que desea auditar, indicando qué parte representa usted...'
  },
  {
    id: 'INVESTIGAR_JURISPRUDENCIA',
    label: 'INVESTIGAR JURISPRUDENCIA',
    emoji: '🏛️',
    subtitle: 'Fallos de la CSJN, cámaras y tribunales con ficha técnica verificada',
    defaultTeamId: 'equipo-constitucional',
    suggestedAgents: ['legal-director', 'jurisprudence-researcher', 'constitutional-lawyer', 'legal-verifier'],
    placeholderPrompt: 'Indique el tema o instituto jurídico sobre el que busca jurisprudencia (ej.: amparo colectivo, responsabilidad objetiva, despido discriminatorio)...'
  },
  {
    id: 'INVESTIGAR_LEGISLACION',
    label: 'INVESTIGAR LEGISLACIÓN',
    emoji: '📚',
    subtitle: 'Leyes nacionales, códigos de fondo, vigencia y reformas',
    defaultTeamId: 'equipo-constitucional',
    suggestedAgents: ['legal-director', 'legislation-researcher', 'general-lawyer', 'legal-verifier'],
    placeholderPrompt: 'Indique la materia o ley cuya vigencia, artículos y alcance desea investigar en el ordenamiento argentino...'
  },
  {
    id: 'ANALIZAR_DOCUMENTOS',
    label: 'ANALIZAR DOCUMENTOS',
    emoji: '📂',
    subtitle: 'Extracción de fechas, partes, inconsistencias y cronología probatoria',
    defaultTeamId: 'equipo-defensa',
    suggestedAgents: ['legal-director', 'document-analyst', 'chronology-builder', 'legal-verifier'],
    placeholderPrompt: 'Pegue o cargue el contenido de la notificación, cédula, sentencia, pericia o expediente que desea analizar...'
  },
  {
    id: 'PREPARAR_ESTRATEGIA',
    label: 'PREPARAR ESTRATEGIA',
    emoji: '♟️',
    subtitle: 'Matriz FODA procesal, ataque del Abogado del Diablo y Plan B',
    defaultTeamId: 'equipo-defensa',
    suggestedAgents: ['legal-director', 'procedural-strategist', 'devils-advocate', 'negotiation-mediator', 'legal-verifier'],
    placeholderPrompt: 'Describa el conflicto procesal o negociación en curso para diseñar Fortalezas, Debilidades, Riesgos, Estrategia Recomendada y Plan B...'
  },
  {
    id: 'ESTUDIAR_DERECHO',
    label: 'ESTUDIAR DERECHO',
    emoji: '🎓',
    subtitle: 'Explicaciones dogmáticas, apuntes, cuadros comparativos y examen oral',
    defaultTeamId: 'equipo-constitucional',
    suggestedAgents: ['legal-director', 'academic-case-professor', 'legislation-researcher', 'jurisprudence-researcher'],
    placeholderPrompt: 'Indique la materia y el tema que está estudiando (ej.: Teoría del Delito, Obligaciones de Valor en el CCCN, Control de Constitucionalidad)...'
  },
  {
    id: 'CREAR_CASO_PRACTICO',
    label: 'CREAR CASO PRÁCTICO',
    emoji: '🧩',
    subtitle: 'Generación y resolución de casos prácticos universitarios en 8 pasos',
    defaultTeamId: 'equipo-constitucional',
    suggestedAgents: ['legal-director', 'academic-case-professor', 'devils-advocate', 'legal-verifier'],
    placeholderPrompt: 'Indique sobre qué materia o artículos desea generar o resolver un caso práctico completo con argumentos y contraargumentos...'
  },
  {
    id: 'REVISAR_ESCRITO',
    label: 'REVISAR ESCRITO',
    emoji: '🛡️',
    subtitle: 'Auditoría de calidad, control de citas y detección de puntos débiles',
    defaultTeamId: 'equipo-defensa',
    suggestedAgents: ['legal-director', 'devils-advocate', 'legal-verifier', 'legal-writer', 'procedural-strategist'],
    placeholderPrompt: 'Pegue el borrador de su escrito judicial o recurso para que el Abogado del Diablo y el Verificador Jurídico detecten fisuras antes de presentarlo...'
  }
];
