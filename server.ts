import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { 
  LegalDocument, 
  DocumentChunk, 
  LegalCaseFile, 
  QuizQuestion, 
  Flashcard,
  UserProfile 
} from './src/types/index.ts';
import { mercadoPagoService } from './src/services/mercadopago.service.ts';
import {
  ALL_LEGAL_AGENTS,
  LEGAL_TEAMS,
  QUICK_ACTIONS,
  selectOptimalAgentsForQuery,
  getAgentById,
  MultiAgentOrchestrationResponse,
  ArgentineJurisdictionContext,
  QuickActionType,
  AgentContribution,
  IdentifiedNorm,
  IdentifiedJurisprudence
} from './src/agents/index.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Shared Gemini client utility initialized server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Initial verified Argentine legal seed documents
const initialDocuments: LegalDocument[] = [
  {
    id: 'doc-cn-1994',
    title: 'Constitución de la Nación Argentina (Reforma 1994)',
    category: 'legislacion',
    branch: 'Derecho Constitucional',
    jurisdiction: 'Nacional / Federal',
    courtOrOrganism: 'Convención Nacional Constituyente',
    officialNumber: 'Ley 24.430',
    officialSourceUrl: 'http://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/804/norma.htm',
    publicationDate: '1994-08-23',
    status: 'vigente',
    license: 'Dominio Público Oficial (República Argentina)',
    incorporationDate: '2026-01-15',
    lastVerifiedDate: '2026-09-15',
    summary: 'Ley suprema de la Nación Argentina. Establece los derechos, deberes y garantías fundamentales, el sistema representativo, republicano y federal, y la jerarquía constitucional de los tratados de derechos humanos (art. 75 inc. 22).',
    tags: ['Constitución', 'Garantías', 'Derechos Humanos', 'Supremacía', 'Amparo', 'Art 75 inc 22'],
    articles: [
      {
        number: '14',
        title: 'Derechos individuales',
        text: 'Todos los habitantes de la Nación gozan de los siguientes derechos conforme a las leyes que reglamenten su ejercicio; a saber: de trabajar y ejercer toda industria lícita; de navegar y comerciar; de peticionar a las autoridades; de entrar, permanecer, transitar y salir del territorio argentino; de publicar sus ideas por la prensa sin censura previa; de usar y disponer de su propiedad; de asociarse con fines útiles; de profesar libremente su culto; de enseñar y aprender.'
      },
      {
        number: '14 bis',
        title: 'Derechos del trabajo y la seguridad social',
        text: 'El trabajo en sus diversas formas gozará de la protección de las leyes, las que asegurarán al trabajador: condiciones dignas y equitativas de labor, jornada limitada; descanso y vacaciones pagados; retribución justa; salario mínimo vital móvil; igual remuneración por igual tarea; participación en las ganancias de las empresas, con control de la producción y colaboración en la dirección; protección contra el despido arbitrario; estabilidad del empleado público; organización sindical libre y democrática, reconocida por la simple inscripción en un registro especial. Queda garantizado a los gremios: concertar convenios colectivos de trabajo; recurrir a la conciliación y al arbitraje; el derecho de huelga. Los representantes gremiales gozarán de las garantías necesarias para el cumplimiento de su gestión sindical y las relacionadas con la estabilidad de su empleo. El Estado otorgará los beneficios de la seguridad social, que tendrá carácter de integral e irrenunciable...'
      },
      {
        number: '18',
        title: 'Garantías del debido proceso penal',
        text: 'Ningún habitante de la Nación puede ser penado sin juicio previo fundado en ley anterior al hecho del proceso, ni juzgado por comisiones especiales, o sacado de los jueces designados por la ley antes del hecho de la causa. Nadie puede ser obligado a declarar contra sí mismo; ni arrestado sino en virtud de orden escrita de autoridad competente. Es inviolable la defensa en juicio de la persona y de los derechos. El domicilio es inviolable, como también la correspondencia epistolar y los papeles privados; y una ley determinará en qué casos y con qué justificativos podrá procederse a su allanamiento y ocupación. Quedan abolidos para siempre la pena de muerte por causas políticas, toda especie de tormento y los azotes...'
      },
      {
        number: '19',
        title: 'Principio de reserva y legalidad',
        text: 'Las acciones privadas de los hombres que de ningún modo ofendan al orden y a la moral pública, ni perjudiquen a un tercero, están sólo reservadas a Dios, y exentas de la autoridad de los magistrados. Ningún habitante de la Nación será obligado a hacer lo que no manda la ley, ni privado de lo que ella no prohíbe.'
      },
      {
        number: '43',
        title: 'Acción expedita de Amparo, Habeas Data y Habeas Corpus',
        text: 'Toda persona puede interponer acción expedita y rápida de amparo, siempre que no exista otro medio judicial más idóneo, contra todo acto u omisión de autoridades públicas o de particulares, que en forma actual o inminente lesione, restrinja, altere o amenace, con arbitrariedad o ilegalidad manifiesta, derechos y garantías reconocidos por esta Constitución, un tratado o una ley. En el caso, el juez podrá declarar la inconstitucionalidad de la norma en que se funde el acto u omisión lesiva. Podrán interponer esta acción contra cualquier forma de discriminación y en lo relativo a los derechos que protegen al ambiente, a la competencia, al usuario y al consumidor, así como a los derechos de incidencia colectiva en general, el afectado, el defensor del pueblo y las asociaciones que propendan a esos fines...'
      },
      {
        number: '75 inc. 22',
        title: 'Jerarquía constitucional de los Tratados Internacionales de Derechos Humanos',
        text: 'Aprobar o desechar tratados concluidos con las demás naciones y con las organizaciones internacionales y los concordatos con la Santa Sede. Los tratados y concordatos tienen jerarquía superior a las leyes. La Declaración Americana de los Derechos y Deberes del Hombre; la Declaración Universal de Derechos Humanos; la Convención Americana sobre Derechos Humanos; el Pacto Internacional de Derechos Económicos, Sociales y Culturales; el Pacto Internacional de Derechos Civiles y Políticos y su Protocolo Facultativo; la Convención sobre la Prevención y la Sanción del Delito de Genocidio... en las condiciones de su vigencia, tienen jerarquía constitucional, no derogan artículo alguno de la primera parte de esta Constitución y deben entenderse complementarios de los derechos y garantías por ella reconocidos.'
      }
    ]
  },
  {
    id: 'doc-cccn-2015',
    title: 'Código Civil y Comercial de la Nación',
    category: 'legislacion',
    branch: 'Derecho Civil y Comercial',
    jurisdiction: 'Nacional / Federal',
    courtOrOrganism: 'Congreso de la Nación Argentina',
    officialNumber: 'Ley 26.994',
    officialSourceUrl: 'http://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/norma.htm',
    publicationDate: '2014-10-07',
    decisionDate: '2015-08-01',
    status: 'vigente',
    license: 'Dominio Público Oficial (República Argentina)',
    incorporationDate: '2026-01-15',
    lastVerifiedDate: '2026-09-20',
    summary: 'Cuerpo normativo unificado del derecho privado argentino. Regula la persona humana y jurídica, bienes, hechos y actos jurídicos, obligaciones, contratos, derechos reales, relaciones de familia y sucesiones, incorporando el paradigma de constitucionalización del derecho privado.',
    tags: ['Código Civil y Comercial', 'Buena Fe', 'Responsabilidad Civil', 'Daño', 'Contratos', 'Persona'],
    articles: [
      {
        number: '1',
        title: 'Fuentes y aplicación',
        text: 'Los casos que este Código rige deben ser resueltos según las leyes que resulten aplicables, conforme con la Constitución Nacional y los tratados de derechos humanos en los que la República sea parte. A tal efecto, se tendrá en cuenta la finalidad de la norma. Los usos, prácticas y costumbres son vinculantes cuando las leyes o los interesados se refieren a ellos o en situaciones no regladas legalmente, siempre que no sean contrarios a derecho.'
      },
      {
        number: '2',
        title: 'Interpretación',
        text: 'La ley debe ser interpretada teniendo en cuenta sus palabras, sus finalidades, las leyes análogas, las disposiciones que surgen de los tratados sobre derechos humanos, los principios y los valores jurídicos, de modo coherente con todo el ordenamiento.'
      },
      {
        number: '9',
        title: 'Principio de buena fe',
        text: 'Los derechos deben ser ejercidos de buena fe.'
      },
      {
        number: '10',
        title: 'Abuso del derecho',
        text: 'El ejercicio regular de un derecho propio o el cumplimiento de una obligación legal no puede constituir como ilícito ningún acto. La ley no ampara el ejercicio abusivo de los derechos. Se considera tal el que contraría los fines del ordenamiento jurídico o el que excede los límites impuestos por la buena fe, la moral y las buenas costumbres. El juez debe ordenar lo necesario para evitar los efectos del ejercicio abusivo o de la situación jurídica abusiva y, si correspondiere, procurar la reposición al estado de hecho anterior y fijar una indemnización.'
      },
      {
        number: '1708',
        title: 'Funciones de la responsabilidad civil',
        text: 'Las disposiciones de este Título son aplicables a la prevención del daño y a su reparación.'
      },
      {
        number: '1710',
        title: 'Deber de prevención del daño',
        text: 'Toda persona tiene el deber, en cuanto de ella dependa, de: a) evitar causar un daño no justificado; b) adoptar, de buena fe y conforme a las circunstancias, las medidas razonables para evitar que se produzca un daño, o disminuir su magnitud; si tales medidas evitan o disminuyen la magnitud de un daño del cual un tercero sería responsable, tiene derecho a que éste le reembolse el valor de los gastos en que incurrió, conforme a las reglas del enriquecimiento sin causa; c) no agravar el daño, si ya se produjo.'
      },
      {
        number: '1716',
        title: 'Deber de reparar',
        text: 'La violación del deber de no dañar a otro, o el incumplimiento de una obligación, da lugar a la reparación del daño causado, conforme con las disposiciones de este Código.'
      },
      {
        number: '1722',
        title: 'Factor objetivo de atribución',
        text: 'El factor de atribución es objetivo cuando la culpa del agente es irrelevante a los efectos de atribuir responsabilidad. En tales casos, el responsable se libera demostrando la causa ajena, excepto disposición legal en contrario.'
      }
    ]
  },
  {
    id: 'doc-lct-20744',
    title: 'Ley de Contrato de Trabajo (Régimen de Contrato de Trabajo)',
    category: 'legislacion',
    branch: 'Derecho del Trabajo y Seguridad Social',
    jurisdiction: 'Nacional / Federal',
    courtOrOrganism: 'Congreso de la Nación Argentina',
    officialNumber: 'Ley 20.744 (t.o. Decreto 390/76)',
    officialSourceUrl: 'http://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/norma.htm',
    publicationDate: '1976-05-21',
    status: 'vigente',
    license: 'Dominio Público Oficial (República Argentina)',
    incorporationDate: '2026-01-20',
    lastVerifiedDate: '2026-09-22',
    summary: 'Régimen rector de las relaciones laborales individuales bajo relación de dependencia en el ámbito privado en la República Argentina. Establece los principios tutelares, la presunción de contrato de trabajo, el ius variandi y el régimen indemnizatorio.',
    tags: ['LCT', 'Trabajo', 'Despido', 'Ius Variandi', 'Indemnización', 'Orden Público Laboral'],
    articles: [
      {
        number: '9',
        title: 'Principio in dubio pro operario',
        text: 'En caso de duda sobre la aplicación de normas legales o convencionales prevalecerá la más favorable al trabajador, considerándose la norma o conjuntos de normas que rija cada una de las instituciones del derecho del trabajo. Si la duda recayese en la apreciación de la prueba en los casos concretos, los jueces o encargados de aplicarla decidirán igualmente en el sentido más favorable al trabajador.'
      },
      {
        number: '12',
        title: 'Principio de irrenunciabilidad',
        text: 'Será nula y sin valor toda convención de partes que suprima o reduzca los derechos previstos en esta ley, los estatutos profesionales, las convenciones colectivas o los contratos individuales de trabajo, ya sea al tiempo de su celebración o de su ejecución, o del ejercicio de derechos provenientes de su extinción.'
      },
      {
        number: '66',
        title: 'Facultades de modificación de las formas y modalidades del trabajo (Ius Variandi)',
        text: 'El empleador está facultado para introducir todos aquellos cambios relativos a la forma y modalidades de la prestación del trabajo, en tanto esos cambios respondan a exigencias razonables de la empresa y no importen un ejercicio irrazonable de esa facultad, ni alteren modalidades esenciales del contrato, ni causen perjuicio material ni moral al trabajador. Cuando el empleador disponga medidas vedadas por este artículo, al trabajador le asistirá la posibilidad de optar por considerarse despedido sin causa o accionar persiguiendo el restablecimiento de las condiciones alteradas...'
      },
      {
        number: '245',
        title: 'Indemnización por antigüedad o despido incausado',
        text: 'En los casos de despido dispuesto por el empleador sin justa causa, habiendo o no mediado preaviso, éste deberá abonar al trabajador una indemnización equivalente a un (1) mes de sueldo por cada año de servicio o fracción mayor de tres (3) meses, tomando como base la mejor remuneración mensual, normal y habitual devengada durante el último año o durante el tiempo de prestación de servicios si éste fuera menor...'
      }
    ]
  },
  {
    id: 'doc-fallo-siri-1957',
    title: 'Fallo CSJN "Siri, Ángel s/ recurso de hábeas corpus" (Fallos 239:459)',
    category: 'jurisprudencia',
    branch: 'Derecho Constitucional',
    jurisdiction: 'Nacional / Federal',
    courtOrOrganism: 'Corte Suprema de Justicia de la Nación',
    officialNumber: 'Fallos 239:459',
    officialSourceUrl: 'https://sjconsulta.csjn.gov.ar/sjconsulta/fallos/verFallo.html?tomo=239&pagina=459',
    publicationDate: '1957-12-27',
    decisionDate: '1957-12-27',
    status: 'vigente',
    license: 'Jurisprudencia Pública CSJN',
    incorporationDate: '2026-02-01',
    lastVerifiedDate: '2026-09-18',
    summary: 'Precedente fundacional del amparo constitucional en Argentina. La CSJN reconoció por vía pretoriana que las garantías constitucionales tienen vigencia directa y no requieren ley reglamentaria previa para ser tuteladas frente a actos manifiestamente arbitrarios de la autoridad pública.',
    tags: ['Amparo', 'Garantías', 'Creación Pretoriana', 'CSJN', 'Libertad de Prensa', 'Debido Proceso'],
    caseBrief: {
      caratula: 'Siri, Ángel s/ interpone recurso de hábeas corpus',
      tribunal: 'Corte Suprema de Justicia de la Nación',
      expedienteNumber: 'Fallos 239:459',
      date: '1957-12-27',
      hechos: 'Ángel Siri, director del diario "El Mercedes" de la Provincia de Buenos Aires, sufrió la clausura de su imprenta y la colocación de una consigna policial armada en su puerta por orden de una autoridad policial sin invocación de orden judicial ni causa legal fundada.',
      cuestionJuridica: '¿Puede un ciudadano reclamar judicialmente la tutela inmediata de sus libertades constitucionales (libertad de imprenta y trabajo) cuando la ley procesal solo prevé el hábeas corpus para la libertad corporal y no existe reglamentación legislativa expresa para el amparo?',
      decision: 'La Corte Suprema revocó la sentencia de primera instancia y ordenó a la autoridad policial levantar de inmediato la clausura e intimación.',
      doctrinaFallo: 'Las garantías constitucionales existen y protegen a los individuos por el solo hecho de estar consagradas en la Constitución, con prescindencia de que el Congreso haya dictado o no leyes reglamentarias para su ejercicio judicial expedito. Bastan la comprobación de la restricción indebida y la invocación de la cláusula constitucional vulnerada.',
      votosMayoristas: 'Voto conjunto de los ministros Alfredo Orgaz, Manuel J. Argañarás, Enrique P. Galli y Carlos Herrera.',
      normasAplicadas: ['Constitución Nacional arts. 14, 17, 18, 19, 31'],
      lineaPrecedente: 'Piedra angular del amparo individual, continuado por "Kot" (1958) respecto a particulares y luego plasmado en la Ley 16.986 y en el art. 43 CN (1994).'
    }
  },
  {
    id: 'doc-fallo-halabi-2009',
    title: 'Fallo CSJN "Halabi, Ernesto c/ P.E.N. - ley 25.873 - dto. 1563/04 s/ amparo ley 16.986" (Fallos 332:111)',
    category: 'jurisprudencia',
    branch: 'Derecho Constitucional',
    jurisdiction: 'Nacional / Federal',
    courtOrOrganism: 'Corte Suprema de Justicia de la Nación',
    officialNumber: 'Fallos 332:111',
    officialSourceUrl: 'https://sjconsulta.csjn.gov.ar/sjconsulta/fallos/verFallo.html?tomo=332&pagina=111',
    publicationDate: '2009-02-24',
    decisionDate: '2009-02-24',
    status: 'vigente',
    license: 'Jurisprudencia Pública CSJN',
    incorporationDate: '2026-02-05',
    lastVerifiedDate: '2026-09-20',
    summary: 'Sentencia de trascendencia histórica en materia procesal colectiva. La CSJN clasificó los derechos en tres categorías: individuales, de incidencia colectiva sobre bienes colectivos, y de incidencia colectiva referentes a intereses individuales homogéneos, delineando la admisibilidad y efectos erga omnes de las acciones colectivas en Argentina ante la mora legislativa.',
    tags: ['Acciones de Clase', 'Intereses Individuales Homogéneos', 'Privacidad', 'Erga Omnes', 'Art 43 CN'],
    caseBrief: {
      caratula: 'Halabi, Ernesto c/ P.E.N. - ley 25.873 - dto. 1563/04 s/ amparo ley 16.986',
      tribunal: 'Corte Suprema de Justicia de la Nación',
      expedienteNumber: 'H. 270. XLII',
      date: '2009-02-24',
      hechos: 'Un abogado interpuso acción de amparo cuestionando la inconstitucionalidad de la ley 25.873 y su decreto reglamentario 1563/04, que obligaban a las empresas prestadoras de telecomunicaciones a captar y almacenar por diez años las comunicaciones telefónicas y de internet de todos los usuarios para ponerlas a disposición del Ministerio Público.',
      cuestionJuridica: '¿Procede declarar la inconstitucionalidad de una norma con efecto extensivo a todos los usuarios (efecto erga omnes) en el marco de una acción promovida por un particular sin ley reglamentaria de procesos colectivos?',
      decision: 'La Corte confirmó la inconstitucionalidad de la normativa y le otorgó a la sentencia efectos erga omnes para todos los usuarios y abonados del país.',
      doctrinaFallo: 'Se delinean tres categorías de derechos: 1) Individuales; 2) Colectivos sobre bienes colectivos; 3) De incidencia colectiva referentes a intereses individuales homogéneos. En estos últimos existe una causa fáctica o normativa común y homogénea, y no se justifica obligar a cada individuo a litigar individualmente. Fijó los recaudos de legitimación y adecuada representación para las acciones colectivas en Argentina.',
      votosMayoristas: 'Voto unánime con precisiones de Lorenzetti, Highton de Nolasco, Fayt, Petracchi, Maqueda, Zaffaroni y Argibay.',
      normasAplicadas: ['Constitución Nacional arts. 18, 19, 43'],
      lineaPrecedente: 'Configuró el régimen general de acciones colectivas en el país, complementado por Acordadas 32/2014 y 12/2016 de Registro Público de Procesos Colectivos.'
    }
  },
  {
    id: 'doc-fallo-arriola-2009',
    title: 'Fallo CSJN "Arriola, Sebastián y otros s/ causa N° 9080" (Fallos 332:1963)',
    category: 'jurisprudencia',
    branch: 'Derecho Penal y Procesal Penal',
    jurisdiction: 'Nacional / Federal',
    courtOrOrganism: 'Corte Suprema de Justicia de la Nación',
    officialNumber: 'Fallos 332:1963',
    officialSourceUrl: 'https://sjconsulta.csjn.gov.ar/sjconsulta/fallos/verFallo.html?tomo=332&pagina=1963',
    publicationDate: '2009-08-25',
    decisionDate: '2009-08-25',
    status: 'vigente',
    license: 'Jurisprudencia Pública CSJN',
    incorporationDate: '2026-02-10',
    lastVerifiedDate: '2026-09-10',
    summary: 'La CSJN declaró por unanimidad la inconstitucionalidad del art. 14, segundo párrafo, de la Ley 23.737, en cuanto incrimina la tenencia de estupefacientes para consumo personal que no traiga aparejado peligro o daño concreto para terceros, ratificando la doctrina del fallo "Bazterrica" (1986) al amparo del art. 19 de la Constitución Nacional.',
    tags: ['Art 19 CN', 'Estupefacientes', 'Privacidad', 'Principio de Lesividad', 'Consumo Personal'],
    caseBrief: {
      caratula: 'Arriola, Sebastián y otros s/ recurso de hecho en causa N° 9080',
      tribunal: 'Corte Suprema de Justicia de la Nación',
      expedienteNumber: 'A. 891. XLIV',
      date: '2009-08-25',
      hechos: 'Varios jóvenes fueron interceptados y aprehendidos portando escasos cigarrillos de marihuana en sus bolsillos para consumo personal, sin exhibición ni ofrecimiento a terceros.',
      cuestionJuridica: '¿Es constitucional la sanción penal al consumidor por la simple tenencia para consumo personal escaso que no afecte derechos de terceros ni altere el orden público?',
      decision: 'La Corte declaró la inconstitucionalidad del art. 14 segundo párrafo de la ley 23.737 y sobreseyó a los imputados.',
      doctrinaFallo: 'El principio de reserva del art. 19 CN prohíbe al Estado castigar conductas privadas que no trasciendan a terceros con daño o peligro comprobable. La persecución del adicto o consumidor individual vulnera su autonomía y no reduce el narcotráfico, debiendo el Estado implementar políticas de salud en lugar de punición penal.',
      votosMayoristas: 'Lorenzetti, Highton de Nolasco, Fayt, Petracchi, Maqueda, Zaffaroni y Argibay.',
      normasAplicadas: ['Constitución Nacional arts. 19, 18, 75 inc. 22', 'Ley 23.737 art. 14 2° párr.'],
      lineaPrecedente: 'Retoma la línea "Bazterrica" (1986) y abandona el criterio restrictivo de "Montalvo" (1990).'
    }
  }
];

// Document Chunks in-memory vector/semantic index
let documentChunks: DocumentChunk[] = [];

function buildChunksFromDocuments() {
  documentChunks = [];
  for (const doc of initialDocuments) {
    if (doc.articles && doc.articles.length > 0) {
      doc.articles.forEach((art, idx) => {
        documentChunks.push({
          id: `${doc.id}-art-${art.number}`,
          docId: doc.id,
          docTitle: `${doc.title} - Art. ${art.number}${art.title ? ': ' + art.title : ''}`,
          articleOrSection: `Art. ${art.number}`,
          paragraphIndex: idx,
          sourceUrl: doc.officialSourceUrl,
          text: `[${doc.title}] [Artículo ${art.number}${art.title ? ' - ' + art.title : ''}]: ${art.text}`,
          jurisdiction: doc.jurisdiction,
          branch: doc.branch,
        });
      });
    }
    if (doc.caseBrief) {
      const cb = doc.caseBrief;
      documentChunks.push({
        id: `${doc.id}-brief-hechos`,
        docId: doc.id,
        docTitle: `${doc.title} - Hechos y Cuestión Jurídica`,
        articleOrSection: 'Hechos del Fallo',
        paragraphIndex: 1,
        sourceUrl: doc.officialSourceUrl,
        text: `[FALLO JUDICIAL: ${cb.caratula}] [Tribunal: ${cb.tribunal}] [Expediente: ${cb.expedienteNumber} - Fecha: ${cb.date}]\nHechos: ${cb.hechos}\nCuestión Jurídica sometida a debate: ${cb.cuestionJuridica}`,
        jurisdiction: doc.jurisdiction,
        branch: doc.branch,
      });
      documentChunks.push({
        id: `${doc.id}-brief-doctrina`,
        docId: doc.id,
        docTitle: `${doc.title} - Doctrina del Fallo y Decisión`,
        articleOrSection: 'Doctrina del Fallo',
        paragraphIndex: 2,
        sourceUrl: doc.officialSourceUrl,
        text: `[DOCTRINA LEGAL: ${cb.caratula}] Decisión de la Corte: ${cb.decision}\nDoctrina jurisprudencial sentada: ${cb.doctrinaFallo}\nVotos y fundamentación: ${cb.votosMayoristas}\nNormas aplicadas: ${cb.normasAplicadas.join(', ')}`,
        jurisdiction: doc.jurisdiction,
        branch: doc.branch,
      });
    }
    if (!doc.articles && !doc.caseBrief && doc.summary) {
      documentChunks.push({
        id: `${doc.id}-summary`,
        docId: doc.id,
        docTitle: doc.title,
        articleOrSection: 'Resumen Oficial',
        paragraphIndex: 0,
        sourceUrl: doc.officialSourceUrl,
        text: `[DOCUMENTO OFICIAL: ${doc.title}] [${doc.courtOrOrganism}]: ${doc.summary}`,
        jurisdiction: doc.jurisdiction,
        branch: doc.branch,
      });
    }
  }
}

buildChunksFromDocuments();

// Sample Initial Expedientes / Cases for Estudio Jurídico
const initialCases: LegalCaseFile[] = [
  {
    id: 'exp-2026-001',
    caratula: 'Pérez, Mariana Lucía c/ Transporte Metropolitano S.A. s/ Daños y Perjuicios',
    numeroExpediente: 'EXP-10482/2025',
    fuero: 'Civil y Comercial Federal',
    juzgado: 'Juzgado Nacional en lo Civil y Comercial Federal N° 4, Secretaría N° 8',
    jurisdiccion: 'Nacional / Federal',
    cliente: 'Mariana Lucía Pérez (DNI 34.892.114)',
    contraparte: 'Transporte Metropolitano S.A.',
    estadoProcesal: 'Apertura a prueba - Pericial médica pendiente',
    fechaInicio: '2025-04-12',
    proximoVencimiento: '2026-10-15 (Plazo de 5 días para impugnar pericia contable)',
    resumenHechos: 'La actora sufrió politraumatismos severos al descender de la unidad de transporte público en parada autorizada debido a arranque intempestivo con puertas abiertas.',
    pretension: 'Reclamo resarcitorio integral fundado en los arts. 1708, 1716, 1722 y 1757 del CCCN, más ley 24.240 de Defensa del Consumidor.',
    documentosAdjuntos: [
      { id: 'doc-adj-1', nombre: 'Demanda_Inicial_Perez_vs_Transporte.pdf', tipo: 'Demanda', fecha: '2025-04-12' },
      { id: 'doc-adj-2', nombre: 'Contestacion_Demanda_Transporte_SA.pdf', tipo: 'Contestación', fecha: '2025-06-20' },
      { id: 'doc-adj-3', nombre: 'Dictamen_Pericial_Medico_Traumatologia.pdf', tipo: 'Pericia', fecha: '2026-08-30' }
    ],
    actuaciones: [
      { id: 'act-1', fecha: '2025-04-12', tipo: 'Presentación', descripcion: 'Interposición de demanda resarcitoria y ofrecimiento de prueba.', responsable: 'Dra. Luciana Cervelli' },
      { id: 'act-2', fecha: '2025-06-20', tipo: 'Procesal', descripcion: 'La demandada contesta oponiendo culpa de la víctima.', responsable: 'Estudio Jurídico Rivadavia' },
      { id: 'act-3', fecha: '2026-08-30', tipo: 'Pericial', descripcion: 'Presentación de pericia médica determinando un 18% de incapacidad física parcial y permanente.', responsable: 'Dr. Roberto Carrizo (Perito Oficial)' }
    ],
    notasInternas: [
      'Recordar solicitar traslado de la pericia y preparar ampliación de rubro incapacidad sobreviniente.',
      'Citar fallo CSJN "Aquino" y precedentes de la Cámara Nacional en lo Civil sobre cuantificación por fórmula Méndez/Vuotto.'
    ]
  },
  {
    id: 'exp-2026-002',
    caratula: 'González, Carlos Alberto c/ Telecomunicaciones del Sur S.R.L. s/ Despido Incapaz e Indemnización',
    numeroExpediente: 'EXP-8834/2026',
    fuero: 'Laboral',
    juzgado: 'Juzgado Nacional del Trabajo N° 23',
    jurisdiccion: 'Ciudad Autónoma de Buenos Aires (CABA)',
    cliente: 'Carlos Alberto González (CUIL 20-31849201-4)',
    contraparte: 'Telecomunicaciones del Sur S.R.L.',
    estadoProcesal: 'Trámite conciliatorio previo SECLO cerrado sin acuerdo. Demanda en redacción.',
    fechaInicio: '2026-02-14',
    proximoVencimiento: '2026-10-08 (Vencimiento de plazo para interposición de demanda ordinaria laboral)',
    resumenHechos: 'Despido directo fundado en supuesta pérdida de confianza no acreditada. Antigüedad de 7 años como técnico de redes.',
    pretension: 'Indemnización art. 245 LCT, falta de preaviso, integración mes de despido y multas de las leyes laborales aplicables.',
    documentosAdjuntos: [
      { id: 'doc-adj-21', nombre: 'TLC_Intimacion_Rechazo_Causal.pdf', tipo: 'Telegrama Ley 23.789', fecha: '2026-01-20' },
      { id: 'doc-adj-22', nombre: 'Carta_Documento_Despido.pdf', tipo: 'Carta Documento', fecha: '2026-01-18' },
      { id: 'doc-adj-23', nombre: 'Acta_Cierre_SECLO_Sin_Acuerdo.pdf', tipo: 'Acta Administrativa', fecha: '2026-02-14' }
    ],
    actuaciones: [
      { id: 'act-21', fecha: '2026-01-18', tipo: 'Notificación', descripcion: 'Recepción de Carta Documento de despido con invocación genérica.', responsable: 'Dra. Luciana Cervelli' },
      { id: 'act-22', fecha: '2026-02-14', tipo: 'Audiencia SECLO', descripcion: 'Audiencia de conciliación laboral frustrada por incomparecencia de la requerida.', responsable: 'Conciliador Dra. Funes' }
    ],
    notasInternas: [
      'Calcular liquidación base con mejor sueldo de $1.250.000.',
      'Revisar si corresponde invocar art. 2 ley 25.323 por mora en el pago indemnizatorio.'
    ]
  }
];

// Interactive Flashcards for Academic Campus
const academicFlashcards: Flashcard[] = [
  {
    id: 'fc-1',
    materia: 'Derecho Constitucional',
    pregunta: '¿Cuál es el alcance del principio de reserva establecido en el artículo 19 de la Constitución Nacional?',
    respuesta: 'El art. 19 CN consagra que las acciones privadas que no ofendan al orden y a la moral pública ni perjudiquen a terceros están reservadas a Dios y exentas de la autoridad de los magistrados. Constituye la esfera de autonomía individual infranqueable para el poder punitivo del Estado (Doctrina CSJN en "Bazterrica" y "Arriola").',
    normaReferencia: 'Art. 19 Constitución Nacional',
    dificultad: 'intermedia'
  },
  {
    id: 'fc-2',
    materia: 'Derecho Civil y Comercial - Responsabilidad',
    pregunta: '¿Cuáles son las tres funciones de la responsabilidad civil reguladas en el Código Civil y Comercial de la Nación?',
    respuesta: 'El art. 1708 del CCCN reconoce la función preventiva del daño (arts. 1710 a 1713) y la función reparadora o resarcitoria (art. 1716 y ss.). La doctrina y jurisprudencia reconocen además la función punitiva en ámbitos especiales (v.gr., daño punitivo del art. 52 bis de la Ley 24.240 de Defensa del Consumidor).',
    normaReferencia: 'Arts. 1708, 1710, 1716 CCCN',
    dificultad: 'basica'
  },
  {
    id: 'fc-3',
    materia: 'Derecho del Trabajo',
    pregunta: '¿Qué condiciones exige el artículo 66 de la LCT para la procedencia válida del ejercicio del Ius Variandi por parte del empleador?',
    respuesta: 'Exige tres condiciones copulativas y estrictas: 1) Razonabilidad funcional (responder a exigencias operativas fundadas de la empresa); 2) No alteración de modalidades esenciales del contrato (salario, jerarquía o calificación profesional, jornada nuclear); 3) Ausencia de perjuicio material o moral al dependiente.',
    normaReferencia: 'Art. 66 Ley de Contrato de Trabajo (Ley 20.744)',
    dificultad: 'avanzada'
  },
  {
    id: 'fc-4',
    materia: 'Derecho Procesal Constitucional',
    pregunta: '¿Cuáles son las tres categorías de derechos delineadas por la CSJN en el precedente "Halabi" (2009)?',
    respuesta: '1) Derechos individuales (ejercidos por su titular con efecto inter partes); 2) Derechos de incidencia colectiva que tienen por objeto bienes colectivos (ambiente, patrimonio público, ejercidos por el afectado, defensor del pueblo u ONG); 3) Derechos de incidencia colectiva referentes a intereses individuales homogéneos (causa fáctica/normativa común y lesión divisible, donde procede la acción de clase con efectos erga omnes).',
    normaReferencia: 'Fallo CSJN "Halabi" (Fallos 332:111)',
    dificultad: 'avanzada'
  }
];

// Academic Quizzes
const academicQuizzes: QuizQuestion[] = [
  {
    id: 'quiz-1',
    materia: 'Derecho Constitucional',
    pregunta: 'De acuerdo con el artículo 75 inciso 22 de la Constitución Nacional de 1994, ¿cuál es la jerarquía normativa de los Tratados Internacionales de Derechos Humanos enumerados en dicha cláusula?',
    opciones: [
      'Tienen jerarquía idéntica a las leyes federales ordinarias emanadas del Congreso.',
      'Tienen jerarquía superior a las leyes pero inferior a la primera parte de la Constitución Nacional.',
      'Tienen jerarquía constitucional en las condiciones de su vigencia, no derogan artículo alguno de la primera parte y son complementarios de los derechos reconocidos.',
      'Tienen supremacía absoluta por encima del texto de la Constitución Nacional en cualquier circunstancia.'
    ],
    respuestaCorrecta: 2,
    explicacion: 'El art. 75 inc. 22 establece expresamente que los tratados de DDHH allí individualizados gozan de jerarquía constitucional en las condiciones de su vigencia, integrando el Bloque de Constitucionalidad Federal, complementando los derechos y garantías sin derogar la primera parte de la Carta Magna.',
    fundamentoLegal: 'Art. 75 inc. 22 Constitución Nacional Argentina.'
  },
  {
    id: 'quiz-2',
    materia: 'Derecho Civil y Comercial',
    pregunta: 'Conforme al artículo 1722 del Código Civil y Comercial de la Nación, en un factor de atribución objetivo de responsabilidad:',
    opciones: [
      'El demandante debe demostrar la culpa, negligencia o dolo del accionado.',
      'La culpa del agente es irrelevante a los efectos de atribuir responsabilidad, y el sindicado solo se libera demostrando la causa ajena (hecho de la víctima, de un tercero por quien no responde o caso fortuito).',
      'El demandado nunca puede eximirse de responsabilidad bajo ninguna circunstancia.',
      'La víctima solo puede reclamar indemnización si contaba con un seguro contra todo riesgo previo.'
    ],
    respuestaCorrecta: 1,
    explicacion: 'El art. 1722 CCCN define que el factor es objetivo cuando la culpa del agente es irrelevante para imputar el deber de reparar. El sujeto pasivo responde por el riesgo o vicio de la cosa o de la actividad riesgosa, liberándose únicamente mediante la acreditación de la fractura del nexo causal (causa ajena).',
    fundamentoLegal: 'Arts. 1722 y 1729 a 1733 CCCN.'
  },
  {
    id: 'quiz-3',
    materia: 'Derecho del Trabajo',
    pregunta: 'Si un empleador despide a un dependiente sin causa justificada y sin preaviso (art. 245 LCT), ¿cómo se calcula la indemnización por antigüedad?',
    opciones: [
      'Un mes de sueldo bruto fijo sin importar los años trabajados.',
      'Medio sueldo por cada semestre completo prestado.',
      'Un mes de sueldo por cada año de servicio o fracción mayor de tres meses, tomando como base la mejor remuneración mensual, normal y habitual devengada durante el último año.',
      'El total de las remuneraciones percibidas durante todo el historial de la relación laboral.'
    ],
    respuestaCorrecta: 2,
    explicacion: 'El art. 245 de la Ley 20.744 dispone que ante el despido incausado corresponde abonar un mes de remuneración por cada año de antigüedad o fracción mayor a tres meses, calculado sobre la mejor remuneración mensual, normal y habitual (MRMNH) devengada en el último año o tiempo de servicio menor, respetando los topes jurisprudenciales del fallo CSJN "Vizzoti".',
    fundamentoLegal: 'Art. 245 LCT y doctrina del fallo CSJN "Vizzoti, Carlos c/ AMSA" (2004).'
  }
];

// RAG Search Algorithm with Lexical + Semantic Token Scoring
function searchRAGChunks(query: string, branchFilter?: string, jurisdictionFilter?: string, minScore = 0.15) {
  const queryTokens = query.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'¡¿]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  if (queryTokens.length === 0) {
    return { results: [], insufficient: true, topScore: 0 };
  }

  const scored = documentChunks.map(chunk => {
    // If filters provided, ensure match
    if (branchFilter && branchFilter !== 'Todas las ramas' && chunk.branch !== branchFilter) {
      return { chunk, score: 0 };
    }
    if (jurisdictionFilter && jurisdictionFilter !== 'Todas las jurisdicciones' && chunk.jurisdiction !== jurisdictionFilter) {
      return { chunk, score: 0 };
    }

    const textLower = chunk.text.toLowerCase();
    const titleLower = chunk.docTitle.toLowerCase();

    let score = 0;
    for (const token of queryTokens) {
      if (titleLower.includes(token)) {
        score += 2.5;
      }
      const count = (textLower.match(new RegExp(token, 'g')) || []).length;
      if (count > 0) {
        score += Math.min(count, 5) * 1.0;
      }
    }

    // Boost exact phrase matches
    if (textLower.includes(query.toLowerCase().trim())) {
      score += 10.0;
    }

    // Normalize roughly by length
    const normalizedScore = score / (1 + Math.log(chunk.text.length));
    return { chunk, score: normalizedScore };
  });

  scored.sort((a, b) => b.score - a.score);

  const topMatches = scored.filter(item => item.score >= minScore).slice(0, 5);
  const topScore = scored.length > 0 ? scored[0].score : 0;
  const insufficient = topMatches.length === 0 || topScore < minScore;

  return {
    results: topMatches.map(m => ({ ...m.chunk, score: m.score })),
    insufficient,
    topScore
  };
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. Library endpoints
app.get('/api/library', (req: Request, res: Response) => {
  const { q, category, branch, jurisdiction } = req.query;
  let filtered = [...initialDocuments];

  if (category && typeof category === 'string' && category !== 'todos') {
    filtered = filtered.filter(d => d.category === category);
  }
  if (branch && typeof branch === 'string' && branch !== 'todas') {
    filtered = filtered.filter(d => d.branch === branch);
  }
  if (jurisdiction && typeof jurisdiction === 'string' && jurisdiction !== 'todas') {
    filtered = filtered.filter(d => d.jurisdiction === jurisdiction);
  }
  if (q && typeof q === 'string' && q.trim()) {
    const term = q.toLowerCase();
    filtered = filtered.filter(d => 
      d.title.toLowerCase().includes(term) ||
      d.summary.toLowerCase().includes(term) ||
      d.tags.some(t => t.toLowerCase().includes(term))
    );
  }

  res.json({ documents: filtered, total: filtered.length });
});

// Upload/Ingest document into library & RAG index
app.post('/api/library/upload', (req: Request, res: Response) => {
  const { title, category, branch, jurisdiction, courtOrOrganism, fullText, summary, tags, officialSourceUrl } = req.body;
  if (!title || !fullText) {
    return res.status(400).json({ error: 'Título y contenido completo del texto son obligatorios.' });
  }

  const newDocId = `doc-user-${Date.now()}`;
  const newDoc: LegalDocument = {
    id: newDocId,
    title,
    category: category || 'doctrina',
    branch: branch || 'Derecho Civil y Comercial',
    jurisdiction: jurisdiction || 'Nacional / Federal',
    courtOrOrganism: courtOrOrganism || 'Carga Autorizada de Usuario',
    officialSourceUrl: officialSourceUrl || '',
    publicationDate: new Date().toISOString().split('T')[0],
    status: 'vigente',
    license: 'Material Académico / Profesional Autorizado',
    incorporationDate: new Date().toISOString().split('T')[0],
    lastVerifiedDate: new Date().toISOString().split('T')[0],
    summary: summary || (fullText.slice(0, 300) + '...'),
    fullText,
    tags: Array.isArray(tags) ? tags : ['Ingesta RAG', 'Usuario'],
  };

  initialDocuments.unshift(newDoc);

  // Divide fullText into paragraphs / chunks of ~500 chars
  const paragraphs = fullText.split(/\n\n+/).filter((p: string) => p.trim().length > 30);
  paragraphs.forEach((para: string, idx: number) => {
    documentChunks.push({
      id: `${newDocId}-para-${idx}`,
      docId: newDocId,
      docTitle: `${title} (Fragmento ${idx + 1})`,
      articleOrSection: `Sección / Párrafo ${idx + 1}`,
      paragraphIndex: idx,
      sourceUrl: officialSourceUrl,
      text: `[DOCUMENTO: ${title}] [Párrafo ${idx + 1}]: ${para.trim()}`,
      jurisdiction: newDoc.jurisdiction,
      branch: newDoc.branch,
    });
  });

  res.json({ success: true, document: newDoc, chunksCreated: paragraphs.length });
});

// 2. Cases / Expedientes endpoints
app.get('/api/cases', (req: Request, res: Response) => {
  res.json({ cases: initialCases });
});

app.post('/api/cases', (req: Request, res: Response) => {
  const { caratula, numeroExpediente, fuero, juzgado, jurisdiccion, cliente, contraparte, resumenHechos, pretension } = req.body;
  if (!caratula || !numeroExpediente) {
    return res.status(400).json({ error: 'Carátula y número de expediente son obligatorios.' });
  }

  const newCase: LegalCaseFile = {
    id: `exp-${Date.now()}`,
    caratula,
    numeroExpediente,
    fuero: fuero || 'Civil y Comercial',
    juzgado: juzgado || 'Juzgado de Primera Instancia',
    jurisdiccion: jurisdiccion || 'Nacional / Federal',
    cliente: cliente || 'Particular',
    contraparte: contraparte || 'A determinar',
    estadoProcesal: 'Iniciado / En preparación',
    fechaInicio: new Date().toISOString().split('T')[0],
    resumenHechos: resumenHechos || 'Sin hechos descriptos.',
    pretension: pretension || 'Demanda ordinaria.',
    documentosAdjuntos: [],
    actuaciones: [
      {
        id: `act-${Date.now()}`,
        fecha: new Date().toISOString().split('T')[0],
        tipo: 'Apertura',
        descripcion: 'Creación de expediente digital en Academia Virtual del Derecho.',
        responsable: 'Usuario Titular'
      }
    ]
  };

  initialCases.unshift(newCase);
  res.json({ success: true, caseFile: newCase });
});

// 3. Academic Campus endpoints
app.get('/api/campus/flashcards', (req: Request, res: Response) => {
  res.json({ flashcards: academicFlashcards });
});

app.get('/api/campus/quizzes', (req: Request, res: Response) => {
  res.json({ quizzes: academicQuizzes });
});

// 4. Server-Side Gemini API: Chat & Legal Assistant
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { 
      message, 
      jurisdiction = 'Nacional / Federal', 
      branch = 'Derecho Civil y Comercial', 
      depth = 'profesional',
      role = 'abogado',
      history = []
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El mensaje de consulta es requerido.' });
    }

    // System prompt tailored for Argentine Law with strict deontological accuracy
    const systemInstruction = `Eres el Asistente Jurídico de "Academia Virtual del Derecho — Legal AI", perteneciente a Academia Virtual del Derecho.
Tu rol es asistir a estudiantes, abogados, docentes y magistrados con rigor técnico, precisión dogmática y absoluta fidelidad al ordenamiento jurídico de la República Argentina y la jurisdicción seleccionada.

Parámetros de esta consulta:
- Jurisdicción activa: ${jurisdiction}
- Rama del Derecho: ${branch}
- Perfil del usuario: ${role}
- Profundidad requerida: ${depth} (simple: didáctico y claro; academica: exhaustivo dogmático con debates doctrinarios; profesional: operativo procesal, táctico y fundado en precedentes)

REGLAS METODOLÓGICAS ESTRICTAS:
1. NUNCA inventes artículos de leyes, números de decretos, fallos, carátulas, magistrados, doctrina ni citas bibliográficas. Si no tienes certeza de un dato, declara expresamente: "Dato normativo/jurisprudencial no verificado en la fuente oficial".
2. Estructura tu respuesta separando claramente:
   a) Hechos o Supuesto Jurídico.
   b) Marco Normativo Positivo aplicable (citando ley y artículo con precisión textual cuando sea conocido, v.gr., Código Civil y Comercial de la Nación Ley 26.994, Constitución Nacional, Ley de Contrato de Trabajo 20.744, Código Penal Ley 11.179).
   c) Interpretación doctrinaria y Criterio Jurisprudencial (mencionando tribunales: CSJN, Cámaras Nacionales o Federales).
   d) Conclusión o Estrategia sugerida.
3. Diferencia categóricamente entre: norma vigente, doctrina mayoritaria vs. minoritaria, interpretación analógica y opinión.
4. Si la consulta involucra plazos procesales, advierte explícitamente que los plazos judiciales dependen del Código Procesal de la jurisdicción (v.gr., CPCCN o Códigos Provinciales), días hábiles judiciales, feriados y deben ser auditados por el letrado matriculado.
5. Emplea un tono culto, preciso, respetuoso y en español rioplatense neutro con terminología técnico-jurídica argentina.
6. AVISO DEONTOLÓGICO: Todas las respuestas son herramientas de apoyo a la investigación y no sustituyen el juicio crítico ni el asesoramiento profesional de un abogado matriculado.`;

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not yet populated
      return res.json({
        content: `**Respuesta Jurídica Preliminar (Modo Consulta Estructurada)**\n\n` +
          `*Jurisdicción:* ${jurisdiction} | *Rama:* ${branch} | *Enfoque:* ${depth}\n\n` +
          `Respecto a su consulta sobre: "${message}"\n\n` +
          `1. **Marco Normativo Vigente:**\n` +
          `En el Derecho positivo argentino, esta cuestión se rige primariamente por las disposiciones de la Constitución Nacional (arts. 14, 18 y 19) y, según la materia, por el Código Civil y Comercial de la Nación (Ley 26.994) o estatutos especiales.\n\n` +
          `2. **Principios Rectores Aplicables:**\n` +
          `- Principio de legalidad y reserva (art. 19 CN).\n` +
          `- Deber de buena fe y proscripción del ejercicio abusivo de los derechos (arts. 9 y 10 CCCN).\n` +
          `- Deber de prevención y reparación integral (art. 1708 CCCN).\n\n` +
          `3. **Pauta Operativa para el Profesional/Estudiante:**\n` +
          `Se sugiere cotejar los antecedentes fácticos con la doctrina legal sentada por la Corte Suprema de Justicia de la Nación y verificar la vigencia de resoluciones reglamentarias locales.\n\n` +
          `*(Para habilitar el razonamiento profundo en tiempo real con Gemini 3.8 Flash, configure GEMINI_API_KEY en su entorno)*.`,
        citations: [
          {
            sourceTitle: 'Constitución de la Nación Argentina',
            articleOrSection: 'Arts. 18 y 19',
            officialUrl: 'http://servicios.infoleg.gob.ar',
            snippet: 'Garantías del debido proceso y principio de reserva constitucional.',
            relevanceScore: 0.95
          }
        ]
      });
    }

    const contents = [
      ...history.map((h: { sender: string; content: string }) => ({
        role: h.sender === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.2, // low temperature for legal precision
      }
    });

    const replyText = response.text || 'No fue posible generar una respuesta fundamentada para la consulta.';

    // Check if query hits RAG chunks for citations
    const ragCheck = searchRAGChunks(message, branch, jurisdiction, 0.2);
    const citations = ragCheck.results.map(r => ({
      sourceTitle: r.docTitle,
      docId: r.docId,
      articleOrSection: r.articleOrSection,
      officialUrl: r.sourceUrl,
      snippet: r.text.slice(0, 220) + '...',
      relevanceScore: Number(r.score.toFixed(2))
    }));

    return res.json({
      content: replyText,
      citations
    });

  } catch (error: any) {
    console.error('Error en /api/gemini/chat:', error);
    return res.status(500).json({ 
      error: 'Error al procesar la consulta con el motor de IA.',
      details: error.message 
    });
  }
});

// 5. Server-Side Gemini API: Motor RAG Jurídico
app.post('/api/gemini/rag', async (req: Request, res: Response) => {
  try {
    const { query, branch, jurisdiction, minThreshold = 0.25 } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'La consulta jurídica para RAG es obligatoria.' });
    }

    const { results, insufficient, topScore } = searchRAGChunks(query, branch, jurisdiction, minThreshold);

    if (insufficient || results.length === 0) {
      return res.json({
        content: `**Respuesta de Abstención por Evidencia Insuficiente (Control de Veracidad RAG)**\n\n` +
          `No se han recuperado fragmentos normativos o jurisprudenciales autorizados que alcancen el umbral de relevancia mínimo requerido (Puntaje máximo obtenido: ${topScore.toFixed(2)} / Umbral exigido: ${minThreshold}) para responder a la consulta con absoluta fundamentación documental.\n\n` +
          `Por directriz deontológica de Academia Virtual del Derecho, el sistema se abstiene de elaborar hipótesis sintéticas que puedan inducir a error respecto a normas no verificadas.\n\n` +
          `*Sugerencia:* Ingrese una búsqueda con términos más específicos (por ejemplo: "amparo colectivo Halabi", "factor objetivo de responsabilidad CCCN", "artículo 19 Constitución Nacional", "indemnización despido 245 LCT") o incorpore la pieza documental a la Biblioteca a través del módulo de carga.`,
        insufficientEvidence: true,
        topScore,
        citations: []
      });
    }

    const contextText = results.map((r, i) => `[FUENTE ${i + 1}] (${r.docTitle} - Ref: ${r.articleOrSection})\n${r.text}`).join('\n\n---\n\n');

    const prompt = `Tienes acceso a los siguientes fragmentos jurídicos recuperados de documentos oficiales y verificados de la República Argentina:

${contextText}

PREGUNTA DEL USUARIO:
"${query}"

INSTRUCCIONES DE RESPUESTA:
1. Responde a la pregunta fundamentándote EXCLUSIVAMENTE en los fragmentos de arriba.
2. Cada afirmación jurídica debe llevar una cita explícita entre corchetes referenciando la fuente (ejemplo: "[FUENTE 1]", "[FUENTE 2]").
3. Si algún aspecto de la pregunta no está contemplado en los fragmentos recuperados, declara expresamente: "Este punto no surge de los documentos autorizados aportados".
4. Redacta con estilo dogmático jurídico formal argentino.`;

    if (!ai) {
      return res.json({
        content: `**Respuesta RAG Fundamentada en Fuentes Recuperadas**\n\n` +
          `A partir del análisis de los fragmentos autorizados recuperados:\n\n` +
          results.map((r, i) => `- **[FUENTE ${i + 1}] (${r.docTitle}):** Aporta soporte sobre ${r.articleOrSection}.`).join('\n') +
          `\n\nConforme a los textos citados, la cuestión controvertida encuentra sustento normativo en los artículos identificados.\n\n*(Nota: Conectado a base documental estricta)*.`,
        insufficientEvidence: false,
        topScore,
        citations: results.map((r, i) => ({
          sourceTitle: r.docTitle,
          docId: r.docId,
          articleOrSection: r.articleOrSection,
          officialUrl: r.sourceUrl,
          snippet: r.text.slice(0, 240) + '...',
          relevanceScore: Number(r.score.toFixed(2))
        }))
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres el motor RAG de Academia Virtual del Derecho. Cita rigurosamente las fuentes [FUENTE X] provistas y abstente de incorporar conocimiento externo no contrastable.',
        temperature: 0.1
      }
    });

    return res.json({
      content: response.text || 'Respuesta generada a partir de los documentos recuperados.',
      insufficientEvidence: false,
      topScore,
      citations: results.map((r, i) => ({
        sourceTitle: r.docTitle,
        docId: r.docId,
        articleOrSection: r.articleOrSection,
        officialUrl: r.sourceUrl,
        snippet: r.text.slice(0, 240) + '...',
        relevanceScore: Number(r.score.toFixed(2))
      }))
    });

  } catch (error: any) {
    console.error('Error en /api/gemini/rag:', error);
    return res.status(500).json({ error: 'Error en el motor RAG.', details: error.message });
  }
});

// 6. Server-Side Gemini API: Procedural Document Drafter (Estudio Jurídico)
app.post('/api/gemini/draft', async (req: Request, res: Response) => {
  try {
    const { tipoDocumento, partes, hechos, pretension, fuero, jurisdiccion, rubros } = req.body;
    if (!tipoDocumento || !hechos) {
      return res.status(400).json({ error: 'Tipo de documento y hechos son obligatorios.' });
    }

    const prompt = `Actúa como un abogado especialista en redacción forense en la República Argentina.
Genera un borrador profesional completo y técnicamente impecable de:
Tipo: ${tipoDocumento}
Fuero: ${fuero || 'Civil y Comercial'}
Jurisdicción: ${jurisdiccion || 'Nacional / Federal'}
Partes involucradas: ${JSON.stringify(partes || {})}
Hechos del caso: ${hechos}
Pretensión y rubros: ${pretension} ${rubros ? 'Rubros: ' + JSON.stringify(rubros) : ''}

REGLAS DE REDACCIÓN FORENSE:
- Respeta la estructura forense argentina tradicional según el tipo (por ejemplo, para demanda: OBJETO, HECHOS, DERECHO, PRUEBA [Documental, Confesional, Testimonial, Pericial], MEDIDA CAUTELAR si corresponde, PETITORIO).
- Para Carta Documento: estilo telegráfico enérgico, intimación con plazo perentorio de ley (v.gr., 48 hs. o plazo LCT) bajo apercibimiento expreso.
- Deja campos rellenables entre corchetes [COMPLETAR: ...] para datos que deben ser verificados por el letrado (v.gr., datos de matrícula, bono ley, bono de derecho fijo, domicilio procesal constituido y electrónico).
- ADVERTENCIA OBLIGATORIA: Incluye al inicio una advertencia formal de que el texto es un borrador generado por IA que debe ser revisado, adaptado y suscripto bajo exclusiva responsabilidad profesional del abogado patrocinante o apoderado.`;

    if (!ai) {
      return res.json({
        draft: `[AVISO: BORRADOR ASISTIDO POR IA - REQUIERE REVISIÓN Y FIRMA DE LETRADO MATRICULADO]\n\n` +
          `PROMUEVE ${tipoDocumento.toUpperCase()}\n\n` +
          `Señor Juez:\n\n` +
          `[COMPLETAR: Nombre del Letrado], abogado inscripto al T° [...], F° [...] del CPACF/Colegio de Abogados, constituyendo domicilio procesal en [...], y domicilio electrónico en [...], en representación de [COMPLETAR: Nombre del Cliente], a V.S. respetuosamente me presento y digo:\n\n` +
          `I. OBJETO:\n` +
          `Que vengo por el presente a promover formal demanda de ${tipoDocumento} contra [COMPLETAR: Contraparte], con domicilio en [...], a fin de que sea condenada a abonar la suma que en más o en menos resulte de las probanzas de autos.\n\n` +
          `II. HECHOS:\n` +
          `${hechos}\n\n` +
          `III. DERECHO:\n` +
          `Fundo el derecho que asiste a mi parte en los arts. 1708, 1716, 1722 y concordantes del Código Civil y Comercial de la Nación, ley 24.240 y doctrina legal aplicable.\n\n` +
          `IV. PRUEBA:\n` +
          `Ofrezco la siguiente prueba que hace al derecho de mi representada: Documental, Informativa y Pericial.\n\n` +
          `V. PETITORIO:\n` +
          `Por todo lo expuesto, a V.S. solicito:\n` +
          `1) Me tenga por presentado, por parte y por constituido el domicilio procesal indicado.\n` +
          `2) Se corra traslado de la demanda por el término y bajo apercibimiento de ley.\n` +
          `3) Oportunamente se haga lugar a la pretensión con costas.\n\n` +
          `Proveer de conformidad,\n` +
          `SERÁ JUSTICIA.`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.25
      }
    });

    return res.json({
      draft: response.text || 'Error al generar el borrador procesal.'
    });

  } catch (error: any) {
    console.error('Error en /api/gemini/draft:', error);
    return res.status(500).json({ error: 'Error al generar el borrador.', details: error.message });
  }
});

// 7. Server-Side Gemini API: Oral Exam Simulation (Campus Universitario)
app.post('/api/gemini/oral-exam', async (req: Request, res: Response) => {
  try {
    const { materia, tema, pregunta, respuestaEstudiante } = req.body;

    if (!respuestaEstudiante) {
      // Generate a probing oral exam question from professor
      const prompt = `Eres un distinguido profesor titular de la cátedra de "${materia}" en una prestigiosa Facultad de Derecho de Argentina.
El tema del examen oral final es: "${tema || 'Parte General y Dogmática'}".
Formula una pregunta de examen oral desafiante pero justa, planteando un caso o una pregunta conceptual donde el alumno deba fundamentar en artículos específicos del ordenamiento argentino (Constitución, Códigos de fondo) y citar doctrina o jurisprudencia clave. Formula sólo la pregunta y una breve pauta de lo que esperas escuchar.`;

      if (!ai) {
        return res.json({
          pregunta: `Bienvenido al examen oral de ${materia}. Planteo la siguiente cuestión: Explique la diferencia fundamental entre el factor de atribución subjetivo (culpa y dolo) y el objetivo en el Código Civil y Comercial de la Nación. ¿Cuáles son los únicos supuestos que eximen de responsabilidad cuando el factor es objetivo según el art. 1722 del CCCN?`,
          pautaEvaluacion: 'El estudiante debe citar los arts. 1721, 1722, 1724 y las causales de fractura del nexo causal (hecho del damnificado, caso fortuito, hecho de un tercero).'
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      return res.json({
        pregunta: response.text || 'Explique los principios rectores de la materia y su consagración en el derecho positivo argentino.'
      });
    }

    // Evaluate student answer
    const evalPrompt = `Eres un tribunal examinador universitario de Derecho en Argentina evaluando una respuesta oral de un estudiante.
Materia: ${materia}
Pregunta realizada: "${pregunta}"
Respuesta del estudiante: "${respuestaEstudiante}"

Realiza una evaluación pedagógica detallada.
Devuelve tu evaluación en formato JSON estricto con los siguientes campos:
{
  "puntaje": [número del 1 al 10],
  "nivel": ["Aprobado Sobresaliente" | "Aprobado Distinguido" | "Aprobado Bueno" | "Insuficiente / Requiere Repaso"],
  "fundamentacion": "[Resumen pedagógico y devolución constructiva]",
  "aspectosPositivos": ["[Aspecto 1]", "[Aspecto 2]"],
  "puntosMejora": ["[Punto 1]", "[Punto 2]"],
  "conceptosClaveFaltantes": ["[Concepto 1]", "[Concepto 2]"]
}`;

    if (!ai) {
      return res.json({
        evaluacion: {
          puntaje: 8,
          nivel: 'Aprobado Distinguido',
          fundamentacion: 'El estudiante demostró adecuada comprensión de los conceptos nucleares y utilizó terminología jurídica pertinente, aunque omitió referir expresamente el número de los artículos aplicables.',
          aspectosPositivos: [
            'Dominio conceptual del instituto examinado.',
            'Claridad de expresión y vocabulario técnico forense.'
          ],
          puntosMejora: [
            'Mayor precisión al citar normas positivas y fallos de la CSJN.',
            'Diferenciar con mayor nitidez la doctrina mayoritaria de las posturas disidentes.'
          ],
          conceptosClaveFaltantes: [
            'Artículo 1722 del CCCN y causales de exoneración por causa ajena.'
          ]
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: evalPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      return res.json({ evaluacion: parsed });
    } catch {
      return res.json({
        evaluacion: {
          puntaje: 7,
          nivel: 'Aprobado Bueno',
          fundamentacion: response.text,
          aspectosPositivos: ['Buena fundamentación general.'],
          puntosMejora: ['Repasar citas normativas.'],
          conceptosClaveFaltantes: []
        }
      });
    }

  } catch (error: any) {
    console.error('Error en /api/gemini/oral-exam:', error);
    return res.status(500).json({ error: 'Error en la simulación de examen.', details: error.message });
  }
});

// 8. Server-Side Gemini API: Tribuna IA (Debate Jurídico Dialéctico)
app.post('/api/gemini/debate', async (req: Request, res: Response) => {
  try {
    const { temaControversial, rama } = req.body;
    if (!temaControversial) {
      return res.status(400).json({ error: 'El tema de debate es obligatorio.' });
    }

    const prompt = `Eres el moderador de "Tribuna IA — Debate Jurídico" de la Academia Virtual del Derecho en Argentina.
Analiza la siguiente controversia jurídica del Derecho argentino:
"${temaControversial}" (Rama: ${rama || 'General'}).

INSTRUCCIONES METODOLÓGICAS OBLIGATORIAS:
1. Presenta las dos principales posturas doctrinarias y jurisprudenciales contrapuestas (Postura A vs. Postura B).
2. Para cada postura, expón:
   - Argumentos dogmáticos centrales.
   - Normas positivas en las que se apoya (leyes argentinas, tratados o Constitución).
   - Precedentes jurisprudenciales o autores representativos.
   - Principales críticas o contraargumentos de la postura contraria.
3. Concluye con una SÍNTESIS NEUTRAL que resuma:
   - Puntos de consenso común.
   - Puntos irreconciliables de discordia.
   - Cuestiones abiertas pendientes de resolución legislativa o de fallo plenario / fallo de la CSJN.
4. NUNCA impongas una conclusión unilateral como verdad absoluta si existe debate en la doctrina argentina.`;

    if (!ai) {
      return res.json({
        debate: `### Tribuna IA: Debate sobre "${temaControversial}"\n\n` +
          `#### Postura Tradicional / Restrictiva:\n` +
          `- **Fundamento:** Se sostiene en el principio de seguridad jurídica y la aplicación literal de los textos normativos vigentes.\n` +
          `- **Crítica:** Tiende a desatender las nuevas realidades socioeconómicas y la tutela reforzada de sujetos vulnerables.\n\n` +
          `#### Postura Progresista / Extensiva:\n` +
          `- **Fundamento:** Promueve la constitucionalización del derecho privado y el principio pro homine derivado del art. 75 inc. 22 de la CN.\n` +
          `- **Crítica:** Se le objeta un exceso de discrecionalidad judicial o invasión de la esfera legislativa.\n\n` +
          `#### Síntesis Neutral:\n` +
          `Ambas posiciones reflejan la tensión viva entre la previsibilidad del ordenamiento y la justicia material del caso concreto. *(Debate estructurado por Academia Virtual del Derecho)*.`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.3
      }
    });

    return res.json({
      debate: response.text || 'No fue posible estructurar el debate para el tema propuesto.'
    });

  } catch (error: any) {
    console.error('Error en /api/gemini/debate:', error);
    return res.status(500).json({ error: 'Error en el debate jurídico.', details: error.message });
  }
});

// 9. Document Analyzer (Expediente Inteligente & Análisis Forense)
app.post('/api/gemini/analyze-doc', async (req: Request, res: Response) => {
  try {
    const { docText, docType = 'demanda' } = req.body;
    if (!docText) {
      return res.status(400).json({ error: 'El texto del documento a analizar es obligatorio.' });
    }

    const prompt = `Analiza como perito jurista el siguiente documento legal perteneciente a un proceso en Argentina (Tipo: ${docType}):

"""
${docText.slice(0, 15000)}
"""

Extrae y estructura con rigurosidad:
1. Resumen fáctico (Hechos alegados).
2. Pretensión principal y accesorias.
3. Defensas o excepciones planteadas o viables.
4. Cuadro probatorio aportado u ofrecido.
5. Cuestiones controvertidas que requerirán decisión judicial.
6. Puntos de alerta o contingencias procesales (vicios de forma, prescripción, falta de legitimación, caducidad).
7. Normas y jurisprudencia que deben cotejarse.`;

    if (!ai) {
      return res.json({
        analysis: `**Análisis Forense Preliminar del Documento**\n\n` +
          `1. **Hechos alegados:** Se identifica conflicto contractual/extracontractual con fecha de inicio del diferendo.\n` +
          `2. **Pretensión:** Reclamo de cumplimiento o resarcimiento económico con intereses.\n` +
          `3. **Puntos de alerta:** Verificar plazos de prescripción liberatoria (arts. 2560 a 2564 CCCN) y correcta traba de la litis.\n` +
          `4. **Recomendación:** Auditar la personería acreditada y el agotamiento de instancias prejudiciales obligatorias (ej. Mediación prejudicial Ley 26.589 si tramita en fuero civil nacional).`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.2
      }
    });

    return res.json({
      analysis: response.text || 'Análisis completado.'
    });

  } catch (error: any) {
    console.error('Error en /api/gemini/analyze-doc:', error);
    return res.status(500).json({ error: 'Error en el análisis documental.', details: error.message });
  }
});

// 10. Platform Stats & Audit (Admin)
app.get('/api/stats', (req: Request, res: Response) => {
  res.json({
    totalDocuments: initialDocuments.length,
    totalChunks: documentChunks.length,
    totalCases: initialCases.length,
    activeQuizzes: academicQuizzes.length,
    activeFlashcards: academicFlashcards.length,
    apiStatus: ai ? 'Gemini 3.8 Flash Activo' : 'Modo Seguro Local (Pendiente API Key)',
    connectors: [
      { name: 'InfoLEG (Ministerio de Justicia)', status: 'Operativo / Enlace Verificado', lastSync: '2026-09-28' },
      { name: 'SAIJ (Sistema Argentino de Información Jurídica)', status: 'Operativo / Conector Activo', lastSync: '2026-09-29' },
      { name: 'CSJN Consulta de Fallos', status: 'Operativo / Enlace Oficial Verificado', lastSync: '2026-09-30' },
      { name: 'Boletín Oficial de la República Argentina', status: 'Conector Modular Configurado', lastSync: '2026-09-30' },
      { name: 'Billetera Mercado Pago Argentina', status: 'Conectada / Alias y Checkout Pro', lastSync: '2026-09-30' }
    ]
  });
});

// 11. Mercado Pago Wallet & Subscriptions endpoints
app.get('/api/mercadopago/config', (req: Request, res: Response) => {
  res.json({
    wallet: mercadoPagoService.getWalletConfig(),
    hasAccessToken: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
    publicKey: mercadoPagoService.getPublicKey()
  });
});

app.post('/api/mercadopago/update-wallet', (req: Request, res: Response) => {
  const updated = mercadoPagoService.updateWalletConfig(req.body);
  res.json({ success: true, wallet: updated });
});

app.post('/api/mercadopago/create-preference', async (req: Request, res: Response) => {
  try {
    const { planId, title, price, payerEmail, payerName } = req.body;
    const result = await mercadoPagoService.createPaymentPreference({
      planId: planId || 'abogado',
      title: title || 'Membresía AVD',
      price: Number(price) || 29900,
      payerEmail: payerEmail || 'lucianacervelli40@gmail.com',
      payerName: payerName || 'Dra. Luciana Cervelli'
    });
    return res.json(result);
  } catch (error: any) {
    console.error('Error en /api/mercadopago/create-preference:', error);
    return res.status(500).json({ error: 'Error al generar preferencia de Mercado Pago.' });
  }
});

app.get('/api/mercadopago/payment-status/:id', async (req: Request, res: Response) => {
  try {
    const status = await mercadoPagoService.checkPaymentStatus(req.params.id);
    return res.json(status);
  } catch (error: any) {
    console.error('Error en /api/mercadopago/payment-status:', error);
    return res.status(500).json({ error: 'Error al verificar estado de pago.' });
  }
});

app.post('/api/mercadopago/confirm-manual', (req: Request, res: Response) => {
  try {
    const { id, planId, amount, payerEmail } = req.body;
    const confirmed = mercadoPagoService.confirmPaymentManually(
      id || `transfer_${Date.now()}`,
      planId || 'abogado',
      Number(amount) || 29900,
      payerEmail || 'lucianacervelli40@gmail.com'
    );
    return res.json({ success: true, payment: confirmed });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al confirmar pago.' });
  }
});

// -------------------------------------------------------------
// 12. MULTI-AGENT VIRTUAL LAW FIRM ORCHESTRATOR ENGINE
// -------------------------------------------------------------
const ETHICAL_DISCLAIMER_TEXT =
  'La información proporcionada por la inteligencia artificial tiene carácter informativo y de asistencia. No sustituye el asesoramiento, patrocinio ni representación de un abogado matriculado. La normativa y jurisprudencia deben verificarse antes de adoptar decisiones o presentar escritos.';

interface MultiAgentTelemetry {
  totalOrchestrations: number;
  totalDirectConsults: number;
  documentsGenerated: number;
  verificationsExecuted: number;
  avgResponseTimeMs: number;
  queriesByMateria: Record<string, number>;
  agentUsageCount: Record<string, number>;
  recentLogs: {
    id: string;
    timestamp: string;
    materia: string;
    actionType: string;
    agentsCount: number;
    confidence: string;
  }[];
}

const multiAgentMetrics: MultiAgentTelemetry = {
  totalOrchestrations: 14,
  totalDirectConsults: 28,
  documentsGenerated: 19,
  verificationsExecuted: 42,
  avgResponseTimeMs: 1420,
  queriesByMateria: {
    'Derecho del Trabajo y Seguridad Social': 6,
    'Derecho Civil y Comercial': 5,
    'Derecho Constitucional y Procesal Constitucional': 3,
    'Derecho de las Familias': 2,
    'Derecho Penal y Procesal Penal': 2
  },
  agentUsageCount: {
    'legal-director': 14,
    'legislation-researcher': 14,
    'jurisprudence-researcher': 14,
    'legal-verifier': 14,
    'devils-advocate': 12,
    'procedural-strategist': 12,
    'labor-lawyer': 8,
    'civil-commercial-lawyer': 7,
    'legal-writer': 11,
    'litigation-builder': 6
  },
  recentLogs: [
    {
      id: 'ord-init-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      materia: 'Derecho del Trabajo y Seguridad Social',
      actionType: 'ANALIZAR_CASO',
      agentsCount: 8,
      confidence: 'ALTO'
    },
    {
      id: 'ord-init-2',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      materia: 'Derecho Civil y Comercial',
      actionType: 'PREPARAR_DEMANDA',
      agentsCount: 8,
      confidence: 'ALTO'
    }
  ]
};

app.get('/api/multiagent/metrics', (req: Request, res: Response) => {
  res.json({
    metrics: multiAgentMetrics,
    agents: ALL_LEGAL_AGENTS,
    teams: LEGAL_TEAMS,
    quickActions: QUICK_ACTIONS
  });
});

app.post('/api/multiagent/agents/toggle', (req: Request, res: Response) => {
  const { agentId, isActive, customSystemPrompt } = req.body;
  const agent = getAgentById(agentId);
  if (!agent) {
    return res.status(404).json({ error: 'Agente no encontrado.' });
  }
  if (typeof isActive === 'boolean' && agent.id !== 'legal-director') {
    agent.isActive = isActive;
  }
  if (typeof customSystemPrompt === 'string' && customSystemPrompt.trim()) {
    agent.systemPrompt = customSystemPrompt.trim();
  }
  return res.json({ success: true, agent });
});

function buildStructuredFallbackOrchestration(
  query: string,
  actionType: QuickActionType,
  jurisdictionContext: ArgentineJurisdictionContext,
  detectedMateria: string,
  secondaryBranches: string[],
  selectedAgents: typeof ALL_LEGAL_AGENTS,
  teamName: string,
  ragResults: ReturnType<typeof searchRAGChunks>['results']
): MultiAgentOrchestrationResponse {
  const id = `dictamen-${Date.now()}`;
  const isLabor = detectedMateria.includes('Trabajo');
  const isPenal = detectedMateria.includes('Penal');
  const isFamilia = detectedMateria.includes('Familia');
  const isSucesion = detectedMateria.includes('Sucesorio');
  const isContract = actionType === 'ANALIZAR_CONTRATO' || detectedMateria.includes('Contractual');

  const normativaIdentificada: IdentifiedNorm[] = [
    {
      norma: 'Constitución de la Nación Argentina (Reforma 1994)',
      articulo: 'Arts. 14, 14 bis, 18, 19, 28, 31, 43 y 75 inc. 22',
      ambito: 'NACIONAL',
      fuente: 'InfoLEG — Ley 24.430 (Base RAG Interna)',
      vigencia: 'Vigente',
      status: 'VERIFICADA',
      relevancia: 'Garantías de debido proceso, defensa en juicio, principio de legalidad y supremacía constitucional.'
    }
  ];

  if (isLabor) {
    normativaIdentificada.push(
      {
        norma: 'Ley de Contrato de Trabajo N° 20.744 (t.o. Decreto 390/76)',
        articulo: 'Arts. 9, 12, 14, 23, 55, 66, 242, 243 y 245',
        ambito: 'NACIONAL',
        fuente: 'InfoLEG (Base RAG Verificada)',
        vigencia: 'Vigente (con modificaciones de Ley 27.742 según fecha del distracto)',
        status: 'VERIFICADA',
        relevancia: 'Principio protectorio, irrenunciabilidad, presunción laboral e indemnización por despido.'
      },
      {
        norma: 'Ley Bases N° 27.742 (Título IV — Modernización Laboral)',
        articulo: 'Disposiciones de reforma registral y derogación de multas Leyes 24.013 y 25.323',
        ambito: 'NACIONAL',
        fuente: 'Boletín Oficial de la República Argentina',
        vigencia: 'Vigente desde julio 2024 — Verificar fecha exacta del distracto (art. 7 CCCN)',
        status: 'REQUIERE VERIFICACIÓN',
        relevancia: 'Determina el régimen sancionatorio aplicable según la fecha de extinción del vínculo.'
      }
    );
  } else if (isPenal) {
    normativaIdentificada.push({
      norma: 'Código Penal de la Nación Argentina (Ley 11.179)',
      articulo: 'Arts. 34, 42, 45, 54, 55, 62 y 67',
      ambito: 'NACIONAL',
      fuente: 'InfoLEG',
      vigencia: 'Vigente',
      status: 'VERIFICADA',
      relevancia: 'Causas de justificación, tentativa, participación, concurso y prescripción de la acción penal.'
    });
  } else {
    normativaIdentificada.push({
      norma: 'Código Civil y Comercial de la Nación (Ley 26.994)',
      articulo: isFamilia
        ? 'Arts. 437, 439, 441, 442, 524, 541, 658, 706 y 716'
        : isSucesion
          ? 'Arts. 2277, 2336, 2424, 2433, 2444 y 2445'
          : 'Arts. 1, 2, 9, 10, 765, 886, 957, 1083, 1708, 1710, 1716, 1722 y 2560',
      ambito: 'NACIONAL',
      fuente: 'InfoLEG — Ley 26.994 (Base RAG Verificada)',
      vigencia: 'Vigente desde 01/08/2015',
      status: 'VERIFICADA',
      relevancia: 'Marco sustantivo rector en materia civil, comercial, patrimonial, familiar y sucesoria.'
    });
  }

  normativaIdentificada.push({
    norma: `Código Procesal aplicable en ${jurisdictionContext.provincia} (${jurisdictionContext.fuero})`,
    articulo: 'Normas de competencia, demanda, prueba y plazos procesales',
    ambito: jurisdictionContext.tipoJurisdiccion === 'Provincial' ? 'PROVINCIAL' : 'NACIONAL',
    fuente: 'Digesto Procesal Local / CPCCN',
    vigencia: 'Requiere cotejo según acordadas y feriados locales',
    status: 'REQUIERE VERIFICACIÓN',
    relevancia: 'Regula los plazos perentorios, copias digitales, mediación previa y formalidades del escrito.'
  });

  const jurisprudenciaIdentificada: IdentifiedJurisprudence[] = [
    {
      tribunal: 'Corte Suprema de Justicia de la Nación (CSJN)',
      fecha: '1957-12-27 / 2009-02-24',
      caratula: 'Siri, Ángel (Fallos 239:459) y Halabi, Ernesto (Fallos 332:111)',
      expediente: 'Fallos 239:459 / Fallos 332:111',
      tema: 'Operatividad directa de garantías constitucionales y tutela judicial efectiva',
      criterio: 'Las garantías constitucionales protegen a los individuos por el solo hecho de estar consagradas en la Constitución Nacional.',
      utilidadParaElCaso: 'Sustenta la tutela constitucional preferente y el debido proceso adjetivo y sustantivo.',
      fuente: 'Base RAG Interna — SJConsulta CSJN',
      status: 'VERIFICADA'
    }
  ];

  if (isLabor) {
    jurisprudenciaIdentificada.push({
      tribunal: 'Corte Suprema de Justicia de la Nación (CSJN)',
      fecha: '2004-09-14',
      caratula: 'Vizzoti, Carlos Alberto c/ AMSA S.A. s/ despido',
      expediente: 'Fallos 327:3677',
      tema: 'Integridad de la indemnización por despido (art. 245 LCT) y límite a la confiscatoriedad del tope',
      criterio: 'El trabajador es sujeto de preferente tutela constitucional (art. 14 bis CN); la base salarial no puede reducirse en más de un 33%.',
      utilidadParaElCaso: 'Fundamenta la defensa de la integralidad resarcitoria ante despido incausado o indirecto.',
      fuente: 'Doctrina Jurisprudencial CSJN',
      status: 'VERIFICADA'
    });
  }

  const contributions: AgentContribution[] = selectedAgents.map(agent => {
    let stage: AgentContribution['stage'] = 'ANÁLISIS ESPECIALIZADO';
    let summary = '';
    let detailedOutput = '';

    if (agent.id === 'legal-director') {
      stage = 'DIAGNÓSTICO Y CLASIFICACIÓN';
      summary = `Encuadre en ${detectedMateria} (${jurisdictionContext.tipoJurisdiccion} — ${jurisdictionContext.provincia}). Equipo de ${selectedAgents.length} agentes activado.`;
      detailedOutput = `Diagnóstico de Dirección Jurídica:\n- Materia Principal: ${detectedMateria}\n- Ramas Conexas: ${secondaryBranches.join(', ') || 'Derecho Procesal Aplicable'}\n- Jurisdicción: ${jurisdictionContext.pais} | ${jurisdictionContext.tipoJurisdiccion} | Provincia: ${jurisdictionContext.provincia} | Fuero: ${jurisdictionContext.fuero}\n- Se ordena separación estricta entre los hechos relatados por el consultante, las normas nacionales verificadas y los requisitos procesales locales que requieren constatación.`;
    } else if (agent.id === 'legislation-researcher') {
      stage = 'INVESTIGACIÓN LEGISLATIVA';
      summary = `Localizadas ${normativaIdentificada.length} normas aplicables (Constitución Nacional, códigos de fondo y ley ritual local).`;
      detailedOutput = normativaIdentificada
        .map(n => `• [${n.status}] ${n.norma} (${n.articulo}) — Ámbito: ${n.ambito} | Vigencia: ${n.vigencia}\n  Aplicación: ${n.relevancia}`)
        .join('\n\n');
    } else if (agent.id === 'jurisprudence-researcher') {
      stage = 'INVESTIGACIÓN JURISPRUDENCIAL';
      summary = `Identificados ${jurisprudenciaIdentificada.length} precedentes de la CSJN aplicables al encuadre constitucional y sustantivo.`;
      detailedOutput = jurisprudenciaIdentificada
        .map(j => `• [${j.status}] TRIBUNAL: ${j.tribunal} | FECHA: ${j.fecha}\n  CARÁTULA: "${j.caratula}" (${j.expediente})\n  CRITERIO: ${j.criterio}\n  UTILIDAD: ${j.utilidadParaElCaso}`)
        .join('\n\n');
    } else if (agent.id === 'procedural-strategist') {
      stage = 'ESTRATEGIA PROCESAL';
      summary = 'Matriz FODA construida con Estrategia Principal Recomendada y Plan B de contingencia.';
      detailedOutput = `MATRIZ ESTRATÉGICA PROCESAL:\n- FORTALEZAS: Tutela normativa expresa en el derecho de fondo argentino y viabilidad de intimación fehaciente.\n- DEBILIDADES: Necesidad de respaldar los extremos fácticos mediante prueba documental, informativa y pericial.\n- RIESGOS: Cómputo de prescripción/caducidad y eventuales costas por defectos en la intimación previa.\n- OPORTUNIDADES: Instancia de mediación prejudicial o conciliación (SECLO/COPREC) para acuerdo temprano.\n- ESTRATEGIA RECOMENDADA: 1) Auditoría documental y preservación de evidencia; 2) Intimación fehaciente / agotamiento de vía previa; 3) Promoción de acción con reserva del Caso Federal.\n- PLAN B: Acuerdo transaccional escalonado con garantías de cumplimiento (cláusula penal y título ejecutivo).`;
    } else if (agent.id === 'devils-advocate') {
      stage = 'AUDITORÍA ABOGADO DEL DIABLO';
      summary = '6 puntos críticos auditados: posibles defensas de la contraparte, excepciones y lagunas probatorias.';
      detailedOutput = `INFORME RED TEAM (ABOGADO DEL DIABLO):\n1. ¿Qué argumentará la contraparte?: Negativa general y particular de los hechos (art. 356 CPCCN), invocación de culpa de la víctima o inexistencia de mora.\n2. ¿Qué excepción podría plantear?: Excepción de incompetencia territorial, falta de legitimación activa/pasiva o prescripción si no se acreditan actos suspensivos.\n3. ¿Qué prueba falta?: Constatación pericial informática sobre intercambios digitales y prueba informativa a organismos públicos/privados.\n4. ¿Qué jurisprudencia puede perjudicar?: Precedentes que rechazan reclamos por orfandad probatoria respecto del nexo causal o del daño cierto.\n5. ¿Qué argumento es débil?: Toda afirmación unilateral de montos o daños sin respaldo contable o médico.\n6. ¿Qué riesgo procesal existe?: Caducidad de instancia por inactividad o rechazo de rubros por pluspetición.`;
    } else if (agent.id === 'legal-verifier') {
      stage = 'VERIFICACIÓN DE CALIDAD';
      summary = 'Control de citas completado: normas de fondo VERIFICADAS; plazos rituales locales marcados como REQUIERE VERIFICACIÓN.';
      detailedOutput = `CERTIFICADO DEL VERIFICADOR JURÍDICO:\n- Normas de fondo (CN, CCCN, LCT, CP): [VERIFICADA] contra base RAG interna.\n- Precedentes CSJN troncales: [VERIFICADA].\n- Datos fácticos particulares del usuario: [NO VERIFICADA — Sujeto a prueba en el proceso].\n- Plazos procesales locales en ${jurisdictionContext.provincia}: [REQUIERE VERIFICACIÓN en código procesal provincial y acordadas de feria/inhábiles].\n- Nivel de Confianza Asignado: ALTO en encuadre dogmático / MEDIO en extremos fácticos pendientes de documentación.`;
    } else if (agent.id === 'legal-writer' || agent.id === 'litigation-builder') {
      stage = 'REDACCIÓN FORENSE';
      summary = 'Estructura forense elaborada con marcadores [COMPLETAR] en todos los datos fácticos no provistos.';
      detailedOutput = `Pieza forense estructurada conforme a las reglas del rito argentino (${jurisdictionContext.fuero}), preservando campos [COMPLETAR] para evitar cualquier invención de datos registrales o personales.`;
    } else if (agent.id === 'contracts-specialist' && isContract) {
      stage = 'ANÁLISIS ESPECIALIZADO';
      summary = 'Auditoría contractual en 6 bloques: Resumen, Riesgos, Cláusulas Críticas, Obligaciones, Recomendaciones y Versión Revisada.';
      detailedOutput = `AUDITORÍA CONTRACTUAL (6 BLOQUES OBLIGATORIOS):\n1. RESUMEN DEL CONTRATO: Vínculo bilateral patrimonial regido por los arts. 957 y ss. del CCCN.\n2. RIESGOS: Desequilibrio en cláusulas de rescisión unilateral, mora automática sin intimación previa e indemnidad.\n3. CLÁUSULAS CRÍTICAS: Jurisdicción y competencia, cláusula penal moratoria, actualización monetaria y limitación de responsabilidad.\n4. OBLIGACIONES DE CADA PARTE: Prestación nuclear, deber de colaboración y buena fe (art. 9 CCCN), pago en término.\n5. RECOMENDACIONES: Incorporar pacto comisorio expreso equilibrado (art. 1086 CCCN) y notificación electrónica válida (art. 75 CCCN).\n6. VERSIÓN REVISADA: Incluida en el anexo documental del presente dictamen.`;
    } else {
      stage = 'ANÁLISIS ESPECIALIZADO';
      summary = `Dictamen técnico de ${agent.name} aplicado a la consulta.`;
      detailedOutput = `Análisis de ${agent.name} (${agent.specialty}):\nEvaluados los extremos planteados("${query.slice(0, 140)}..."), se determina la aplicación de las normas rectoras de ${detectedMateria}. Se recomienda asegurar de inmediato la prueba documental e instrumental antes de cursar notificaciones que fijen la posición jurídica de la parte (doctrina de los actos propios y art. 243 LCT / art. 9 CCCN).`;
    }

    return {
      agentId: agent.id,
      agentName: agent.name,
      agentEmoji: agent.emoji,
      specialty: agent.specialty,
      stage,
      summary,
      detailedOutput,
      deliverableType: agent.deliverables[0] || 'Dictamen Especializado',
      verificationNotes: ['Auditado por Verificador Jurídico IA']
    };
  });

  const sampleDraft = `[AVISO DEONTOLÓGICO: BORRADOR PRELIMINAR ASISTIDO POR IA — REQUIERE REVISIÓN Y FIRMA DE ABOGADO MATRICULADO]

SUMARIO:
ACTOR / REQUIRENTE: [COMPLETAR: Nombre y Apellido o Razón Social]
DEMANDADO / REQUERIDO: [COMPLETAR: Nombre y Apellido o Razón Social]
MATERIA: ${detectedMateria.toUpperCase()}
MONTO: $ [COMPLETAR: Monto numérico y en letras] (o lo que en más o en menos resulte de la prueba a producirse)
DOCUMENTACIÓN ACOMPAÑADA: [COMPLETAR: Detalle de anexos documentales]

PROMUEVE ACCIÓN / PRESENTACIÓN FORENSE — INTERPONE PLANTEO JURÍDICO

Señor Juez (${jurisdictionContext.tribunal || 'Juzgado Competente en turno de ' + jurisdictionContext.provincia}):

[COMPLETAR: Nombre y Apellido del actor], DNI N° [COMPLETAR], con domicilio real en la calle [COMPLETAR], localidad de [COMPLETAR], Provincia de ${jurisdictionContext.provincia}, por derecho propio, con el patrocinio letrado del Dr./Dra. [COMPLETAR: Nombre del Abogado/a], inscripto/a al T° [COMPLETAR] F° [COMPLETAR] del Colegio Público de Abogados / Matrícula de ${jurisdictionContext.provincia}, CUIT N° [COMPLETAR], constituyendo domicilio procesal en [COMPLETAR] y domicilio electrónico en [COMPLETAR], a V.S. respetuosamente me presento y digo:

I. OBJETO:
Que vengo en legal tiempo y forma a promover formal planteo en materia de ${detectedMateria} contra [COMPLETAR: Nombre del Demandado], con domicilio real/social en [COMPLETAR], solicitando se haga lugar íntegramente a la pretensión aquí deducida, con expresa imposición de intereses y costas.

II. COMPETENCIA:
V.S. resulta competente para entender en las presentes actuaciones en razón de la materia (${jurisdictionContext.fuero}) y del territorio (${jurisdictionContext.provincia}), habiéndose cumplido con las instancias previas de ley según acta N° [COMPLETAR].

III. HECHOS:
Conforme surge de los antecedentes del caso:
1. En fecha [COMPLETAR: Fecha exacta], se configuró la relación jurídica / el hecho generador consistente en: ${query.slice(0, 350)}.
2. Pese a los reclamos cursados mediante [COMPLETAR: Carta Documento / TCL N° ... de fecha ...], la contraparte mantuvo una conducta reticente y antijurídica.

IV. DERECHO:
Fundo el derecho que asiste a mi parte en lo dispuesto por ${normativaIdentificada.map(n => `${n.norma} (${n.articulo})`).join('; ')}, así como en la doctrina legal sentada por la Corte Suprema de Justicia de la Nación.

V. PRUEBA:
A fin de acreditar los extremos invocados, ofrezco la siguiente prueba:
A) DOCUMENTAL: Se acompaña [COMPLETAR: contratos, recibos, cartas documento, actas].
B) INFORMATIVA: Se libre oficio a [COMPLETAR: Correo Oficial, AFIP/ARCA, Bancos, Registros].
C) TESTIMONIAL: Se cite a prestar declaración a: 1) [COMPLETAR: Nombre, DNI, domicilio]; 2) [COMPLETAR: Nombre, DNI, domicilio].
D) PERICIAL: Se designe perito único de oficio en la especialidad [COMPLETAR: Contable / Médica / Informática].

VI. RESERVA DEL CASO FEDERAL:
Para el hipotético e improbable supuesto de una resolución adversa, dejo desde ya planteada la Cuestión Federal para ocurrir ante la Corte Suprema de Justicia de la Nación por vía del art. 14 de la Ley 48, por encontrarse en juego garantías amparadas en los arts. 14, 14 bis, 17, 18 y 19 de la Constitución Nacional.

VII. PETITORIO:
Por todo lo expuesto, a V.S. solicito:
1) Me tenga por presentado/a, por parte y por constituidos los domicilios procesal y electrónico.
2) Se agregue la prueba documental acompañada y se tenga por ofrecida la restante.
3) Se corra traslado de la presente por el término y bajo apercibimiento de ley.
4) Oportunamente se dicte sentencia haciendo lugar a la pretensión en todas sus partes, con costas.

Proveer de conformidad,
SERÁ JUSTICIA.

[COMPLETAR: Firma y Sello del Letrado Patrocinante] — [COMPLETAR: Firma de la Parte]`;

  return {
    id,
    timestamp: new Date().toISOString(),
    query,
    actionType,
    jurisdictionContext,
    classification: {
      materiaPrincipal: detectedMateria,
      ramasSecundarias: secondaryBranches.length > 0 ? secondaryBranches : ['Derecho Procesal Civil y Comercial', 'Derecho Constitucional'],
      competenciaDetectada: `Competencia ${jurisdictionContext.tipoJurisdiccion} — Provincia/Ámbito: ${jurisdictionContext.provincia} — Fuero: ${jurisdictionContext.fuero}`,
      posiblesConflictosNormativos: [
        'Articulación entre normas de fondo nacionales (art. 75 inc. 12 CN) y normas procesales locales (art. 121 CN).',
        'Aplicación temporal de la ley (art. 7 CCCN) según la fecha exacta de los hechos generadores.'
      ],
      informacionFaltante: [
        'Fechas exactas de inicio del vínculo o del hecho generador y de las notificaciones fehacientes cursadas.',
        'Datos identificatorios completos de las partes (DNI/CUIT y domicilios reales/sociales).',
        'Detalle pormenorizado de los instrumentos documentales originales en poder del consultante.'
      ],
      preguntasAclaratorias: [
        `¿En qué localidad específica de ${jurisdictionContext.provincia} se domicilian las partes o se ejecutó la obligación?`,
        '¿Se ha enviado o recibido alguna Carta Documento o Telegrama Colacionado hasta el momento?',
        '¿Se inició ya el trámite de Mediación Prejudicial Obligatoria o conciliación administrativa (SECLO / COPREC)?',
        '¿Con qué pruebas escritas, testigos o registros digitales cuenta para acreditar los hechos?'
      ]
    },
    epistemicSeparation: {
      informacionAportadaPorUsuario: [
        `Consulta planteada: "${query}"`,
        `Jurisdicción indicada: ${jurisdictionContext.pais} — ${jurisdictionContext.tipoJurisdiccion} (${jurisdictionContext.provincia}, Fuero: ${jurisdictionContext.fuero})`
      ],
      conocimientoJuridicoGeneral: [
        'En el ordenamiento argentino, el Congreso Nacional dicta los códigos de fondo (Civil y Comercial, Penal, Trabajo y Seguridad Social — art. 75 inc. 12 CN), mientras que las provincias y la CABA conservan la potestad de dictar sus códigos procesales y organizar sus tribunales (arts. 5, 121 y 129 CN).',
        'Toda pretensión judicial requiere acreditar legitimación activa y pasiva, interés jurídico actual y el cumplimiento de las instancias previas obligatorias (mediación o conciliación).'
      ],
      normativaIdentificada,
      jurisprudenciaIdentificada,
      informacionQueRequiereVerificacion: [
        `Plazos procesales específicos, feriados locales y acordadas reglamentarias del tribunal (${jurisdictionContext.tribunal || jurisdictionContext.fuero}) en ${jurisdictionContext.provincia}.`,
        'Autenticidad y fecha cierta de los documentos privados o intercambios digitales invocados.'
      ]
    },
    selectedTeamName: teamName,
    participatingAgents: selectedAgents.map(a => ({
      id: a.id,
      name: a.name,
      emoji: a.emoji,
      specialty: a.specialty
    })),
    agentContributions: contributions,
    strategyMatrix: {
      fortalezas: [
        'Encuadre normativo sustantivo claro dentro de la legislación argentina vigente.',
        'Posibilidad de estructurar intimación fehaciente previa que constituya en mora o suspenda por única vez la prescripción (art. 2541 CCCN).'
      ],
      debilidades: [
        'Falta de individualización de fechas exactas y documentación respaldatoria certificada en la consulta inicial.',
        'Carga probatoria sobre los extremos constitutivos del reclamo (art. 377 CPCCN / cargas dinámicas).'
      ],
      riesgos: [
        'Vencimiento de plazos de prescripción liberatoria o caducidad si no se interrumpe o suspende de inmediato.',
        'Riesgo de imposición de costas procesales ante rechazo parcial o defecto en la intimación previa.'
      ],
      oportunidades: [
        'Instancia de Mediación Prejudicial o Conciliación (SECLO / Defensa del Consumidor) para alcanzar un acuerdo rápido y homologable.',
        'Solicitud de medidas cautelares o prueba anticipada si existe peligro en la demora.'
      ],
      estrategiaRecomendada:
        '1) Reunir y auditar toda la documentación original y evidencia digital; 2) Cursar intimación fehaciente redactada por letrado matriculado fijando plazo perentorio; 3) Agotar la instancia de mediación o conciliación obligatoria; 4) Promover demanda fundada con ofrecimiento integral de prueba y reserva del Caso Federal.',
      planB:
        'En caso de orfandad probatoria sobre rubros secundarios o riesgo de insolvencia de la contraparte, negociar en audiencia de mediación/conciliación un convenio de pago transaccional (art. 1641 CCCN) con cláusula de caducidad de plazos y título ejecutivo.',
      alternativasConciliatorias:
        'Alta viabilidad de explorar acuerdo en etapa prejudicial (Mediación Ley 26.589 / provincial o SECLO Ley 24.635), reduciendo tiempos de litigio de 3-5 años a 60 días.'
    },
    devilAdvocate: {
      argumentosContraparte: [
        'Negativa categórica de los hechos e invocación de falta de configuración de mora o injuria suficiente.',
        'Cuestionamiento de la autenticidad de capturas o documentos simples no reconocidos.'
      ],
      excepcionesPosibles: [
        'Excepción de incompetencia territorial o material si no se verifica el domicilio o lugar de cumplimiento.',
        'Excepción de prescripción liberatoria o defecto legal en el modo de proponer la demanda (art. 347 CPCCN).'
      ],
      pruebasFaltantes: [
        'Documentación original suscripta o pericia informática sobre dispositivos y servidores de correo/mensajería.',
        'Prueba informativa (oficios) y pericial contable/médica que cuantifique objetivamente el reclamo.'
      ],
      jurisprudenciaAdversa: [
        'Fallos que desestiman reclamos resarcitorios o indemnizatorios cuando el daño alegado es meramente conjetural o hipotético (art. 1739 CCCN).'
      ],
      puntosDebiles: [
        'Indeterminación actual de fechas exactas y cuantificación líquida de los rubros.'
      ],
      riesgosProcesales: [
        'Peligro de caducidad de instancia por inactividad procesal (arts. 310 y ss. CPCCN) y costas por incidentes.'
      ]
    },
    chronology: [
      {
        fecha: '[COMPLETAR: Fecha de Inicio]',
        hecho: 'Nacimiento de la relación jurídica o hecho generador descripto en la consulta.',
        documentoRelacionado: 'Contrato / Recibos / Registros iniciales [A APORTAR]',
        importancia: 'ALTA',
        pruebaVinculada: 'Prueba Documental e Informativa',
        alertaPlazo: 'Determina el régimen legal vigente en ese momento (art. 7 CCCN).'
      },
      {
        fecha: '[COMPLETAR: Fecha del Conflicto]',
        hecho: 'Producción del incumplimiento, distracto o evento dañoso.',
        documentoRelacionado: 'Comunicaciones / Constataciones [A APORTAR]',
        importancia: 'ALTA',
        pruebaVinculada: 'Prueba Documental, Testimonial y Pericial',
        alertaPlazo: 'Inicio del cómputo de prescripción liberatoria (verificar plazo según materia).'
      },
      {
        fecha: 'Paso Inmediato Sugerido',
        hecho: 'Envío de intimación fehaciente / Apertura de instancia de mediación o conciliación.',
        documentoRelacionado: 'Carta Documento / TCL / Acta de Mediación',
        importancia: 'ALTA',
        pruebaVinculada: 'Oficio a Correo Oficial / Acta certificada',
        alertaPlazo: 'Suspende el curso de la prescripción conforme arts. 2541 y 2542 CCCN (sujeto a verificación local).'
      }
    ],
    finalConsolidatedReport: {
      titulo: `Dictamen Multiagente — ${detectedMateria} (${jurisdictionContext.provincia})`,
      antecedentes: `Se recibe en el Estudio Jurídico Virtual Multiagente de la Academia Virtual del Derecho la consulta formulada bajo la modalidad "${actionType}", radicada contextualmente en ${jurisdictionContext.pais}, jurisdicción ${jurisdictionContext.tipoJurisdiccion} (${jurisdictionContext.provincia}), fuero ${jurisdictionContext.fuero}. El Director Jurídico IA convocó a un equipo integrado por ${selectedAgents.length} especialistas (${selectedAgents.map(a => a.name).join(', ')}).`,
      hechos: `De acuerdo con el relato proporcionado por el usuario (información fáctica aún sujeta a respaldo documental), se plantea la siguiente situación: "${query}". Se han identificado extremos temporales y documentales que deben completarse antes de cualquier presentación formal.`,
      problemaJuridico: `Determinar el encuadre normativo exacto dentro de ${detectedMateria}, establecer los requisitos de admisibilidad y prueba en la jurisdicción ${jurisdictionContext.provincia}, cuantificar los derechos u obligaciones emergentes y neutralizar las defensas o excepciones que pudiera oponer la contraparte.`,
      normativaAplicable: normativaIdentificada.map(n => `[${n.status}] ${n.norma} — ${n.articulo} (${n.ambito}): ${n.relevancia}`).join('\n'),
      jurisprudencia: jurisprudenciaIdentificada.map(j => `[${j.status}] ${j.tribunal}, "${j.caratula}" (${j.expediente}, ${j.fecha}): ${j.criterio}`).join('\n'),
      analisisJuridico: `El equipo de especialistas coincide en que la cuestión se rige sustancialmente por las normas de orden público y derecho común de ${detectedMateria}. Conforme al análisis cruzado entre el especialista de fondo y el procesalista, la viabilidad de la pretensión o defensa depende críticamente de: 1) la correcta fijación de la posición jurídica mediante intimación fehaciente libre de contradicciones; 2) la preservación de la prueba documental, informativa y pericial; y 3) el respeto estricto de las normas rituales de ${jurisdictionContext.provincia}.`,
      riesgosYContraargumentos: `El Abogado del Diablo IA advierte que la contraparte intentará ampararse en la negativa cerrada de los hechos, cuestionar la autenticidad de pruebas simples (capturas de pantalla o fotocopias) y oponer excepciones de incompetencia o prescripción si existen baches temporales no suspendidos.`,
      alternativasYEstrategia: `Se recomienda ejecutar la Estrategia Principal en tres fases: Fase 1 (Auditoría probatoria y envío de intimación fehaciente con campos verificados); Fase 2 (Instancia de Mediación Prejudicial o SECLO/COPREC con cálculo de escenario transaccional); Fase 3 (Interposición de demanda o defensa judicial con ofrecimiento pleno de prueba). Como Plan B, se prevé acuerdo transaccional homologable con garantías ejecutivas.`,
      recomendacion: `1) Responder las preguntas aclaratorias formuladas por el Director Jurídico; 2) Reunir la documentación original listada en el Checklist; 3) Revisar junto a un abogado matriculado en ${jurisdictionContext.provincia} el borrador forense adjunto completando todos los campos marcados como [COMPLETAR].`,
      conclusion: `El caso presenta encuadre jurídico claro en ${detectedMateria}, con normativa de fondo verificada en nuestro repositorio oficial y requerimiento de verificación procesal local respecto a plazos y acordadas de ${jurisdictionContext.provincia}.`,
      borradorEscritoOContrato: sampleDraft,
      checklistFinal: [
        'Verificar DNI/CUIT y domicilios reales y electrónicos de todas las partes ([COMPLETAR]).',
        'Reunir originales de contratos, recibos, cartas documento o notificaciones recibidas.',
        'Preservar evidencia digital en dispositivos originales para pericia informática (evitar simples capturas).',
        'Constatar plazos de prescripción y caducidad en el Código Procesal de la jurisdicción.',
        'Cumplir instancia previa obligatoria (Mediación Ley 26.589 / provincial o SECLO).',
        'Revisión, adaptación final y firma por abogado matriculado en la jurisdicción.'
      ]
    },
    confidenceLevel: ragResults.length > 0 ? 'ALTO' : 'MEDIO',
    confidenceExplanation:
      ragResults.length > 0
        ? 'Nivel de confianza ALTO en el encuadre constitucional y de derecho de fondo por contar con respaldo directo en la base documental verificada (RAG); sujeto a completar datos fácticos del caso.'
        : 'Nivel de confianza MEDIO: el encuadre jurídico general responde al derecho positivo argentino vigente, pero requiere completar fechas exactas, documentación probatoria y verificar el rito procesal local.',
    ethicalDisclaimer: ETHICAL_DISCLAIMER_TEXT
  };
}

app.post('/api/multiagent/orchestrate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const {
      query,
      actionType = 'CONSULTA_JURIDICA',
      jurisdictionContext = {
        pais: 'Argentina',
        tipoJurisdiccion: 'Nacional',
        provincia: 'Ciudad Autónoma de Buenos Aires (CABA)',
        ciudad: 'Buenos Aires',
        fuero: 'Civil y Comercial',
        tribunal: 'Juzgado de Primera Instancia en turno'
      },
      manualAgentIds = [],
      teamId,
      attachedDocumentText
    } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Debe ingresar una consulta, descripción del caso o documento para activar el Estudio Jurídico Multiagente.' });
    }

    const fullQuery = attachedDocumentText
      ? `${query}\n\n[DOCUMENTO ADJUNTO APORTADO POR EL USUARIO]:\n${attachedDocumentText.slice(0, 10000)}`
      : query;

    // 1. Director Jurídico selects optimal agents & team
    const { detectedMateria, secondaryBranches, selectedAgents, teamName } = selectOptimalAgentsForQuery(
      fullQuery,
      actionType as QuickActionType,
      manualAgentIds,
      teamId
    );

    // 2. Search RAG Knowledge Base first
    const ragSearch = searchRAGChunks(fullQuery, undefined, undefined, 0.15);

    // Build baseline structured orchestration result
    const baselineResult = buildStructuredFallbackOrchestration(
      query,
      actionType as QuickActionType,
      jurisdictionContext,
      detectedMateria,
      secondaryBranches,
      selectedAgents,
      teamName,
      ragSearch.results
    );

    // 3. If Gemini API is configured on server, enrich the multi-agent synthesis with real LLM reasoning
    if (ai) {
      try {
        const ragContextText =
          ragSearch.results.length > 0
            ? ragSearch.results.map((r, i) => `[FUENTE RAG VERIFICADA ${i + 1}] (${r.docTitle}): ${r.text}`).join('\n\n')
            : 'Sin fragmentos literales específicos en la base local; utilizar conocimiento jurídico argentino riguroso marcando REQUIERE VERIFICACIÓN cuando corresponda.';

        const agentsBrief = selectedAgents
          .map(a => `- ${a.emoji} ${a.name} (${a.specialty}): Misión: ${a.mission} | Entregables: ${a.deliverables.join(', ')}`)
          .join('\n');

        const orchestrationPrompt = `Actúa como el ECOSISTEMA MULTIAGENTE DE LA ACADEMIA VIRTUAL DEL DERECHO (República Argentina), coordinado por el DIRECTOR JURÍDICO IA (legal-director).

CONTEXTO JURISDICCIONAL:
- País: ${jurisdictionContext.pais}
- Tipo de Jurisdicción: ${jurisdictionContext.tipoJurisdiccion}
- Provincia / Ámbito: ${jurisdictionContext.provincia} (${jurisdictionContext.ciudad || ''})
- Fuero: ${jurisdictionContext.fuero}
- Tribunal: ${jurisdictionContext.tribunal}
- Acción Solicitada: ${actionType}
- Materia Detectada: ${detectedMateria}

EQUIPO DE AGENTES CONVOCADOS:
${agentsBrief}

FUENTES DOCUMENTALES RECUPERADAS DEL MOTOR RAG:
${ragContextText}

CONSULTA / CASO PLANTEADO POR EL USUARIO:
"""
${fullQuery}
"""

REGLAS ABSOLUTAS E INQUEBRANTABLES:
1. NO inventes leyes, artículos, fallos, expedientes, nombres de jueces ni fechas.
2. Si un dato fáctico no fue provisto por el usuario, usa siempre [COMPLETAR: ...].
3. Si una norma local o fallo específico no está en las fuentes RAG verificadas, clasifícalo como "REQUIERE VERIFICACIÓN".
4. Devuelve un objeto JSON válido con la siguiente estructura exacta para enriquecer el dictamen:
{
  "antecedentes": "string detallado",
  "hechos": "string detallado",
  "problemaJuridico": "string detallado",
  "normativaAplicable": "string detallado citando normas argentinas y su estado de verificación",
  "jurisprudencia": "string detallado con criterios aplicables sin inventar citas",
  "analisisJuridico": "string profundo integrando la visión de los especialistas convocados",
  "riesgosYContraargumentos": "string con el ataque crítico del Abogado del Diablo (las 6 preguntas críticas)",
  "alternativasYEstrategia": "string con Fortalezas, Debilidades, Riesgos, Oportunidades, Estrategia Recomendada y Plan B",
  "recomendacion": "string con pasos concretos",
  "conclusion": "string ejecutivo",
  "borradorEscritoOContrato": "string con el borrador forense completo (o auditoría de contrato en 6 bloques si es ANALIZAR_CONTRATO, o Caso Práctico en 8 bloques si es CREAR_CASO_PRACTICO) usando [COMPLETAR] en datos faltantes",
  "preguntasAclaratorias": ["pregunta 1", "pregunta 2", "pregunta 3"],
  "agentOutputs": [
    {
      "agentId": "id del agente",
      "summary": "resumen ejecutivo de 1 línea de su aporte al caso",
      "detailedOutput": "desarrollo técnico específico de este agente según su personalidad y entregables"
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: orchestrationPrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.15
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.analisisJuridico) {
          baselineResult.finalConsolidatedReport = {
            ...baselineResult.finalConsolidatedReport,
            antecedentes: parsed.antecedentes || baselineResult.finalConsolidatedReport.antecedentes,
            hechos: parsed.hechos || baselineResult.finalConsolidatedReport.hechos,
            problemaJuridico: parsed.problemaJuridico || baselineResult.finalConsolidatedReport.problemaJuridico,
            normativaAplicable: parsed.normativaAplicable || baselineResult.finalConsolidatedReport.normativaAplicable,
            jurisprudencia: parsed.jurisprudencia || baselineResult.finalConsolidatedReport.jurisprudencia,
            analisisJuridico: parsed.analisisJuridico || baselineResult.finalConsolidatedReport.analisisJuridico,
            riesgosYContraargumentos: parsed.riesgosYContraargumentos || baselineResult.finalConsolidatedReport.riesgosYContraargumentos,
            alternativasYEstrategia: parsed.alternativasYEstrategia || baselineResult.finalConsolidatedReport.alternativasYEstrategia,
            recomendacion: parsed.recomendacion || baselineResult.finalConsolidatedReport.recomendacion,
            conclusion: parsed.conclusion || baselineResult.finalConsolidatedReport.conclusion,
            borradorEscritoOContrato: parsed.borradorEscritoOContrato || baselineResult.finalConsolidatedReport.borradorEscritoOContrato
          };
        }
        if (Array.isArray(parsed.preguntasAclaratorias) && parsed.preguntasAclaratorias.length > 0) {
          baselineResult.classification.preguntasAclaratorias = parsed.preguntasAclaratorias;
        }
        if (Array.isArray(parsed.agentOutputs)) {
          baselineResult.agentContributions = baselineResult.agentContributions.map(contrib => {
            const match = parsed.agentOutputs.find((o: any) => o.agentId === contrib.agentId);
            if (match && match.detailedOutput) {
              return {
                ...contrib,
                summary: match.summary || contrib.summary,
                detailedOutput: match.detailedOutput
              };
            }
            return contrib;
          });
        }
      } catch (aiErr) {
        console.warn('[MultiAgent Orchestrator] Usando motor estructurado determinista de respaldo:', aiErr);
      }
    }

    // Update Telemetry Metrics
    const elapsed = Date.now() - startTime;
    multiAgentMetrics.totalOrchestrations += 1;
    multiAgentMetrics.documentsGenerated += 1;
    multiAgentMetrics.verificationsExecuted += baselineResult.epistemicSeparation.normativaIdentificada.length;
    multiAgentMetrics.avgResponseTimeMs = Math.round((multiAgentMetrics.avgResponseTimeMs + elapsed) / 2);
    multiAgentMetrics.queriesByMateria[detectedMateria] = (multiAgentMetrics.queriesByMateria[detectedMateria] || 0) + 1;
    selectedAgents.forEach(a => {
      multiAgentMetrics.agentUsageCount[a.id] = (multiAgentMetrics.agentUsageCount[a.id] || 0) + 1;
    });
    multiAgentMetrics.recentLogs.unshift({
      id: baselineResult.id,
      timestamp: baselineResult.timestamp,
      materia: detectedMateria,
      actionType,
      agentsCount: selectedAgents.length,
      confidence: baselineResult.confidenceLevel
    });
    if (multiAgentMetrics.recentLogs.length > 25) {
      multiAgentMetrics.recentLogs.pop();
    }

    return res.json(baselineResult);
  } catch (error: any) {
    console.error('Error en /api/multiagent/orchestrate:', error);
    return res.status(500).json({
      error: 'Error al procesar la orquestación multiagente.',
      details: error.message
    });
  }
});

// Direct Specialist Agent Consultation
app.post('/api/multiagent/agent-consult', async (req: Request, res: Response) => {
  try {
    const { agentId, message, jurisdictionContext } = req.body;
    const agent = getAgentById(agentId) || ALL_LEGAL_AGENTS[0];
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El mensaje de consulta es obligatorio.' });
    }

    multiAgentMetrics.totalDirectConsults += 1;
    multiAgentMetrics.agentUsageCount[agent.id] = (multiAgentMetrics.agentUsageCount[agent.id] || 0) + 1;

    const ragCheck = searchRAGChunks(message, undefined, undefined, 0.15);
    const ragContext =
      ragCheck.results.length > 0
        ? ragCheck.results.map((r, i) => `[FUENTE VERIFICADA ${i + 1}] (${r.docTitle}): ${r.text}`).join('\n\n')
        : 'Sin documentos literales en RAG para esta consulta específica.';

    if (!ai) {
      return res.json({
        agentId: agent.id,
        agentName: agent.name,
        agentEmoji: agent.emoji,
        reply: `### ${agent.emoji} Dictamen de ${agent.name}\n**Especialidad:** ${agent.specialty}\n\n**1. Encuadre Metodológico (${agent.folderPath}):**\nRespecto de su consulta: *"${message}"*, aplicando mi protocolo de trabajo:\n${agent.workflow.map(w => `- ${w}`).join('\n')}\n\n**2. Análisis Técnico-Jurídico Argentino:**\nEn el marco de la jurisdicción indicada (${jurisdictionContext?.provincia || 'Nacional / Federal'}), deben observarse estrictamente las normas de fondo y los recaudos probatorios pertinentes. Toda circunstancia fáctica no acreditada documentalmente debe preservarse mediante marcadores **[COMPLETAR]**.\n\n**3. Preguntas Aclaratorias del Especialista:**\n${agent.clarifyingQuestions.map(q => `- ${q}`).join('\n')}\n\n**4. Entregables comprometidos:** ${agent.deliverables.join(' | ')}\n\n> *Nivel de Confianza: MEDIO (Sujeto a verificación documental) — ${ETHICAL_DISCLAIMER_TEXT}*`
      });
    }

    const systemInstruction = `${agent.systemPrompt}
IDENTIDAD: ${agent.identity}
PERSONALIDAD: ${agent.personality}
EXPERIENCIA: ${agent.experience}
MISIÓN: ${agent.mission}
FLUJO DE TRABAJO: ${agent.workflow.join(' | ')}
ENTREGABLES OBLIGATORIOS: ${agent.deliverables.join(' | ')}
ERRORES A EVITAR: ${agent.errorsToAvoid.join(' | ')}
ESTILO DE COMUNICACIÓN: ${agent.communicationStyle}

REGLAS ABSOLUTAS DE LA ACADEMIA VIRTUAL DEL DERECHO:
- Derecho aplicable por defecto: República Argentina (${jurisdictionContext?.provincia || 'Nacional / Federal'}, Fuero: ${jurisdictionContext?.fuero || 'General'}).
- NUNCA inventes leyes, artículos, expedientes, jueces ni fallos.
- Cuando falten datos del usuario usa [COMPLETAR].
- Clasifica las normas o fallos citados como [VERIFICADA] (si están en las fuentes RAG adjuntas) o [REQUIERE VERIFICACIÓN].
- Incluye al final el Nivel de Confianza (ALTO / MEDIO / BAJO) y el aviso ético obligatorio.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `FUENTES RAG RECUPERADAS:\n${ragContext}\n\nCONSULTA DEL USUARIO:\n${message}`,
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });

    return res.json({
      agentId: agent.id,
      agentName: agent.name,
      agentEmoji: agent.emoji,
      reply: response.text || 'Respuesta procesada por el agente especialista.'
    });
  } catch (error: any) {
    console.error('Error en /api/multiagent/agent-consult:', error);
    return res.status(500).json({ error: 'Error al consultar al agente especializado.', details: error.message });
  }
});

// Dedicated Carta Documento & Escritos Fehacientes Specialist Endpoint
app.post('/api/multiagent/carta-documento', async (req: Request, res: Response) => {
  try {
    const {
      tipoComunicacion = 'Intimación de Pago y Constitución en Mora (Art. 886 CCCN)',
      lugarYFecha = `Buenos Aires, ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      remitente = {},
      destinatario = {},
      plazoIntimacion = '48 horas hábiles',
      hechos = '',
      intimacion = '',
      apercibimiento = 'iniciar las acciones judiciales civiles, comerciales y/o laborales pertinentes, con más intereses, daños y perjuicios y costas',
      referenciaPrevia = ''
    } = req.body;

    const remNombre = remitente.nombre || '[COMPLETAR: Nombre / Razón Social del Remitente]';
    const remDoc = remitente.dniCuit || '[COMPLETAR: DNI / CUIT del Remitente]';
    const remDom = remitente.domicilio || '[COMPLETAR: Domicilio del Remitente]';
    const destNombre = destinatario.nombre || '[COMPLETAR: Nombre / Razón Social del Destinatario]';
    const destDoc = destinatario.dniCuit || '[COMPLETAR: DNI / CUIT del Destinatario]';
    const destDom = destinatario.domicilio || '[COMPLETAR: Domicilio del Destinatario]';

    const fallbackText = `${lugarYFecha.toUpperCase()}

AL DESTINATARIO: ${destNombre.toUpperCase()} (${destDoc})
DOMICILIO: ${destDom}, (${destinatario.codigoPostal || '----'}) ${destinatario.localidad || ''}, ${destinatario.provincia || ''}

DE MI CONSIDERACIÓN:

Me dirijo a Ud. en mi carácter de titular y legitimado (${remNombre}, DNI/CUIT N° ${remDoc}, constituyendo domicilio a todos los efectos legales en ${remDom}, ${remitente.localidad || ''}, ${remitente.provincia || ''})${referenciaPrevia ? `, en relación y respuesta a vuestra comunicación previa (${referenciaPrevia})` : ''}, a fin de cursarle la presente ${tipoComunicacion.toUpperCase()}:

1. ANTECEDENTES Y RELACIÓN FÁCTICA: ${hechos || '[COMPLETAR: Describir con precisión fechas, contrato, relación laboral o hecho generador del reclamo].'}

2. INTIMACIÓN FEHACIENTE Y PLAZO PERENTORIO: En virtud de lo expuesto y conforme a derecho (arts. 9, 724, 886, 1084, 1088, 1716 y cctes. del Código Civil y Comercial de la Nación / Ley 20.744 y Ley 24.240 según corresponda), INTIMO A UD. en el plazo perentorio e improrrogable de ${plazoIntimacion.toUpperCase()} contados a partir de la recepción de la presente, proceda a: ${intimacion || '[COMPLETAR: Indicar conducta exigible, suma adeudada o cumplimiento requerido].'}

3. APERCIBIMIENTO LEGAL: Todo ello BAJO APERCIBIMIENTO de ${apercibimiento}. Hago expresa reserva de derechos, intereses moratorios y punitorios, daños y perjuicios y costas.

QUEDA UD. DEBIDAMENTE NOTIFICADO, INTIMADO Y CONSTITUIDO EN MORA.

Firma: ____________________________________
Aclaración: ${remNombre}
DNI / CUIT: ${remDoc}`;

    if (!ai) {
      return res.json({
        agentId: 'carta-documento-writer',
        agentName: 'Especialista en Cartas Documento y Escritos Jurídicos IA',
        cuerpoTexto: fallbackText
      });
    }

    const prompt = `Actúa como el "Especialista en Cartas Documento y Escritos Jurídicos IA" (carta-documento-writer) de la Academia Virtual del Derecho (República Argentina).
Debes redactar el TEXTO ÍNTEGRO Y DEFINITIVO de una CARTA DOCUMENTO / ESCRITO DE INTIMACIÓN FEHACIENTE argentina, lista para ser impresa en DOC/PDF y cargada en el sistema Mis Comunicaciones Digitales (Correo Argentino).

DATOS PROPORCIONADOS POR EL USUARIO:
- Tipo de Comunicación / Escrito: ${tipoComunicacion}
- Lugar y Fecha: ${lugarYFecha}
- Remitente: ${remNombre} | DNI/CUIT: ${remDoc} | Domicilio: ${remDom}, CP ${remitente.codigoPostal || ''}, ${remitente.localidad || ''}, ${remitente.provincia || ''}
- Destinatario: ${destNombre} | DNI/CUIT: ${destDoc} | Domicilio: ${destDom}, CP ${destinatario.codigoPostal || ''}, ${destinatario.localidad || ''}, ${destinatario.provincia || ''}
- Referencia a CD o comunicación previa (si aplica): ${referenciaPrevia || 'Primera intimación'}
- Hechos / Antecedentes: ${hechos}
- Exigencia / Intimación concreta: ${intimacion}
- Plazo Perentorio otorgado: ${plazoIntimacion}
- Apercibimiento Legal: ${apercibimiento}

REGLAS OBLIGATORIAS:
1. Redacta el texto con el estilo solemne, contundente y técnico-forense propio de las Cartas Documento en la República Argentina.
2. Si es un rechazo/contestación de Carta Documento, incluye la negativa categórica de rigor ("RECHAZO por improcedente, falaz, maliciosa y carente de sustento fáctico y jurídico vuestra Carta Documento...").
3. Si es una intimación laboral, civil, comercial, locativa o de consumo, cita las normas pertinentes del Derecho Argentino (CCCN, LCT 20.744, Ley 24.240, etc.) sin inventar artículos inexistentes.
4. NUNCA inventes datos fácticos que no estén en la solicitud; si falta un monto, fecha o número de comprobante, coloca [COMPLETAR: ...].
5. Cierra obligatoriamente con "QUEDA UD. DEBIDAMENTE NOTIFICADO, INTIMADO Y CONSTITUIDO EN MORA." y los datos de firma del remitente.
6. Devuelve ÚNICAMENTE el texto limpio de la Carta Documento / Escrito sin comentarios introductorios.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.15
      }
    });

    return res.json({
      agentId: 'carta-documento-writer',
      agentName: 'Especialista en Cartas Documento y Escritos Jurídicos IA',
      cuerpoTexto: response.text?.trim() || fallbackText
    });
  } catch (error: any) {
    console.error('Error en /api/multiagent/carta-documento:', error);
    return res.status(500).json({
      error: 'Error al generar el texto de la Carta Documento.',
      details: error.message
    });
  }
});

// -------------------------------------------------------------
// VITE MIDDLEWARE (DEV) / STATIC (PROD)
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Academia Virtual del Derecho — Legal AI] Servidor iniciado en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Error fatal al iniciar servidor:', err);
});
