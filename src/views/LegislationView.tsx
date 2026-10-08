import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Bot, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  SplitSquareVertical,
  History,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LegislationViewProps {
  onAskAIAboutArticle: (lawName: string, articleNumber: string, articleText: string) => void;
}

export const LegislationView: React.FC<LegislationViewProps> = ({ onAskAIAboutArticle }) => {
  const [selectedLaw, setSelectedLaw] = useState<'cn' | 'cccn' | 'lct' | 'cp'>('cn');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeArticleNumber, setActiveArticleNumber] = useState('19');
  const [showComparison, setShowComparison] = useState(false);
  const [copied, setCopied] = useState(false);

  const lawsData = {
    cn: {
      name: 'Constitución de la Nación Argentina',
      officialNumber: 'Ley 24.430 (Reforma 1994)',
      sourceUrl: 'http://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/804/norma.htm',
      articles: [
        {
          num: '14',
          title: 'Derechos Civiles Fundamentales',
          text: 'Todos los habitantes de la Nación gozan de los siguientes derechos conforme a las leyes que reglamenten su ejercicio; a saber: de trabajar y ejercer toda industria lícita; de navegar y comerciar; de peticionar a las autoridades; de entrar, permanecer, transitar y salir del territorio argentino; de publicar sus ideas por la prensa sin censura previa; de usar y disponer de su propiedad; de asociarse con fines útiles; de profesar libremente su culto; de enseñar y aprender.',
          historicalVersion: 'Texto original de 1853 con redacción similar, complementado posteriormente por el artículo 14 bis en 1957.'
        },
        {
          num: '14 bis',
          title: 'Derechos del Trabajo y Seguridad Social',
          text: 'El trabajo en sus diversas formas gozará de la protección de las leyes, las que asegurarán al trabajador: condiciones dignas y equitativas de labor, jornada limitada; descanso y vacaciones pagados; retribución justa; salario mínimo vital móvil; igual remuneración por igual tarea; participación en las ganancias de las empresas, con control de la producción y colaboración en la dirección; protección contra el despido arbitrario; estabilidad del empleado público; organización sindical libre y democrática, reconocida por la simple inscripción en un registro especial. Queda garantizado a los gremios: concertar convenios colectivos de trabajo; recurrir a la conciliación y al arbitraje; el derecho de huelga. Los representantes gremiales gozarán de las garantías necesarias para el cumplimiento de su gestión sindical y las relacionadas con la estabilidad de su empleo. El Estado otorgará los beneficios de la seguridad social, que tendrá carácter de integral e irrenunciable...',
          historicalVersion: 'Incorporado por la Convención Constituyente de 1957 (constitucionalismo social argentino).'
        },
        {
          num: '18',
          title: 'Garantías del Debido Proceso y Juicio Previo',
          text: 'Ningún habitante de la Nación puede ser penado sin juicio previo fundado en ley anterior al hecho del proceso, ni juzgado por comisiones especiales, o sacado de los jueces designados por la ley antes del hecho de la causa. Nadie puede ser obligado a declarar contra sí mismo; ni arrestado sino en virtud de orden escrita de autoridad competente. Es inviolable la defensa en juicio de la persona y de los derechos. El domicilio es inviolable, como también la correspondencia epistolar y los papeles privados; y una ley determinará en qué casos y con qué justificativos podrá procederse a su allanamiento y ocupación. Quedan abolidos para siempre la pena de muerte por causas políticas, toda especie de tormento y los azotes. Las cárceles de la Nación serán sanas y limpias, para seguridad y no para castigo de los reos detenidos en ellas...',
          historicalVersion: 'Base de las garantías judiciales penales desde 1853, complementado por el Pacto de San José de Costa Rica (art. 8).'
        },
        {
          num: '19',
          title: 'Principio de Reserva y Legalidad',
          text: 'Las acciones privadas de los hombres que de ningún modo ofendan al orden y a la moral pública, ni perjudiquen a un tercero, están sólo reservadas a Dios, y exentas de la autoridad de los magistrados. Ningún habitante de la Nación será obligado a hacer lo que no manda la ley, ni privado de lo que ella no prohíbe.',
          historicalVersion: 'Cláusula fundamental de la libertad individual civil ideada por Juan Bautista Alberdi.'
        },
        {
          num: '43',
          title: 'Acción de Amparo, Hábeas Data y Hábeas Corpus',
          text: 'Toda persona puede interponer acción expedita y rápida de amparo, siempre que no exista otro medio judicial más idóneo, contra todo acto u omisión de autoridades públicas o de particulares, que en forma actual o inminente lesione, restrinja, altere o amenace, con arbitrariedad o ilegalidad manifiesta, derechos y garantías reconocidos por esta Constitución, un tratado o una ley. En el caso, el juez podrá declarar la inconstitucionalidad de la norma en que se funde el acto u omisión lesiva. Podrán interponer esta acción contra cualquier forma de discriminación y en lo relativo a los derechos que protegen al ambiente, a la competencia, al usuario y al consumidor, así como a los derechos de incidencia colectiva en general, el afectado, el defensor del pueblo y las asociaciones que propendan a esos fines...',
          historicalVersion: 'Incorporado formalmente en la Reforma de 1994, receptando la creación pretoriana de los fallos "Siri" (1957) y "Kot" (1958).'
        },
        {
          num: '75 inc. 22',
          title: 'Jerarquía Constitucional de Tratados de DDHH',
          text: 'Aprobar o desechar tratados concluidos con las demás naciones y con las organizaciones internacionales y los concordatos con la Santa Sede. Los tratados y concordatos tienen jerarquía superior a las leyes. La Declaración Americana de los Derechos y Deberes del Hombre; la Declaración Universal de Derechos Humanos; la Convención Americana sobre Derechos Humanos; el Pacto Internacional de Derechos Económicos, Sociales y Culturales; el Pacto Internacional de Derechos Civiles y Políticos... en las condiciones de su vigencia, tienen jerarquía constitucional, no derogan artículo alguno de la primera parte de esta Constitución y deben entenderse complementarios de los derechos y garantías por ella reconocidos.',
          historicalVersion: 'Incorporado en la Reforma Constitucional de 1994, estableciendo el Bloque de Constitucionalidad Federal.'
        }
      ]
    },
    cccn: {
      name: 'Código Civil y Comercial de la Nación',
      officialNumber: 'Ley 26.994',
      sourceUrl: 'http://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/norma.htm',
      articles: [
        {
          num: '1',
          title: 'Fuentes y aplicación',
          text: 'Los casos que este Código rige deben ser resueltos según las leyes que resulten aplicables, conforme con la Constitución Nacional y los tratados de derechos humanos en los que la República sea parte. A tal efecto, se tendrá en cuenta la finalidad de la norma. Los usos, prácticas y costumbres son vinculantes cuando las leyes o los interesados se refieren a ellos o en situaciones no regladas legalmente, siempre que no sean contrarios a derecho.',
          historicalVersion: 'Sustituyó al art. 16 del Código Civil de Vélez Sarsfield, introduciendo el diálogo de fuentes y la constitucionalización del derecho privado.'
        },
        {
          num: '2',
          title: 'Interpretación',
          text: 'La ley debe ser interpretada teniendo en cuenta sus palabras, sus finalidades, las leyes análogas, las disposiciones que surgen de los tratados sobre derechos humanos, los principios y los valores jurídicos, de modo coherente con todo el ordenamiento.',
          historicalVersion: 'Incorpora el principio de coherencia del ordenamiento frente a la exégesis literal clásica.'
        },
        {
          num: '9',
          title: 'Principio de buena fe',
          text: 'Los derechos deben ser ejercidos de buena fe.',
          historicalVersion: 'Principio general del derecho ampliado respecto al derogado art. 1198 del Código Civil.'
        },
        {
          num: '10',
          title: 'Abuso del derecho',
          text: 'El ejercicio regular de un derecho propio o el cumplimiento de una obligación legal no puede constituir como ilícito ningún acto. La ley no ampara el ejercicio abusivo de los derechos. Se considera tal el que contraría los fines del ordenamiento jurídico o el que excede los límites impuestos por la buena fe, la moral y las buenas costumbres. El juez debe ordenar lo necesario para evitar los efectos del ejercicio abusivo o de la situación jurídica abusiva y, si correspondiere, procurar la reposición al estado de hecho anterior y fijar una indemnización.',
          historicalVersion: 'Perfecciona la reforma de la Ley 17.711 al art. 1071 del Código de Vélez.'
        },
        {
          num: '1708',
          title: 'Funciones de la responsabilidad civil',
          text: 'Las disposiciones de este Título son aplicables a la prevención del daño y a su reparación.',
          historicalVersion: 'Innovación de la Ley 26.994: consagra la función preventiva junto a la resarcitoria tradicional.'
        },
        {
          num: '1710',
          title: 'Deber de prevención del daño',
          text: 'Toda persona tiene el deber, en cuanto de ella dependa, de: a) evitar causar un daño no justificado; b) adoptar, de buena fe y conforme a las circunstancias, las medidas razonables para evitar que se produzca un daño, o disminuir su magnitud; c) no agravar el daño, si ya se produjo.',
          historicalVersion: 'Instituye el mandato preventivo civil operativo aplicable a toda persona y actividad.'
        },
        {
          num: '1722',
          title: 'Factor objetivo de atribución',
          text: 'El factor de atribución es objetivo cuando la culpa del agente es irrelevante a los efectos de atribuir responsabilidad. En tales casos, el responsable se libera demostrando la causa ajena, excepto disposición legal en contrario.',
          historicalVersion: 'Sistematiza el riesgo creado consagrado por la doctrina y jurisprudencia a partir de la Ley 17.711.'
        }
      ]
    },
    lct: {
      name: 'Ley de Contrato de Trabajo',
      officialNumber: 'Ley 20.744 (t.o. Decreto 390/76)',
      sourceUrl: 'http://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/norma.htm',
      articles: [
        {
          num: '9',
          title: 'El principio de la norma más favorable para el trabajador',
          text: 'En caso de duda sobre la aplicación de normas legales o convencionales prevalecerá la más favorable al trabajador, considerándose la norma o conjuntos de normas que rija cada una de las instituciones del derecho del trabajo. Si la duda recayese en la apreciación de la prueba en los casos concretos, los jueces o encargados de aplicarla decidirán igualmente en el sentido más favorable al trabajador.',
          historicalVersion: 'Principio in dubio pro operario consagrado por la doctrina de Norberto Centeno.'
        },
        {
          num: '12',
          title: 'Irrenunciabilidad de derechos',
          text: 'Será nula y sin valor toda convención de partes que suprima o reduzca los derechos previstos en esta ley, los estatutos profesionales, las convenciones colectivas o los contratos individuales de trabajo, ya sea al tiempo de su celebración o de su ejecución, o del ejercicio de derechos provenientes de su extinción.',
          historicalVersion: 'Consagra el orden público laboral absoluto.'
        },
        {
          num: '66',
          title: 'Modificación de las formas y modalidades del trabajo (Ius Variandi)',
          text: 'El empleador está facultado para introducir todos aquellos cambios relativos a la forma y modalidades de la prestación del trabajo, en tanto esos cambios respondan a exigencias razonables de la empresa y no importen un ejercicio irrazonable de esa facultad, ni alteren modalidades esenciales del contrato, ni causen perjuicio material ni moral al trabajador. Cuando el empleador disponga medidas vedadas por este artículo, al trabajador le asistirá la posibilidad de optar por considerarse despedido sin causa o accionar persiguiendo el restablecimiento de las condiciones alteradas...',
          historicalVersion: 'Modificado por Ley 26.088 restituyendo la acción sumarísima de restablecimiento de condiciones.'
        },
        {
          num: '245',
          title: 'Indemnización por antigüedad o despido',
          text: 'En los casos de despido dispuesto por el empleador sin justa causa, habiendo o no mediado preaviso, éste deberá abonar al trabajador una indemnización equivalente a un (1) mes de sueldo por cada año de servicio o fracción mayor de tres (3) meses, tomando como base la mejor remuneración mensual, normal y habitual devengada durante el último año o durante el tiempo de prestación de servicios si éste fuera menor...',
          historicalVersion: 'Tope indemnizatorio sujeto a la doctrina de confiscatoriedad del fallo CSJN "Vizzoti" (máximo recorte del 33%).'
        }
      ]
    },
    cp: {
      name: 'Código Penal de la Nación Argentina',
      officialNumber: 'Ley 11.179',
      sourceUrl: 'http://servicios.infoleg.gob.ar/infolegInternet/anexos/15000-19999/16546/norma.htm',
      articles: [
        {
          num: '34',
          title: 'Inimputabilidad, legítima defensa y estado de necesidad',
          text: 'No son punibles: 1º. El que no haya podido en el momento del hecho, ya sea por insuficiencia de sus facultades, por alteraciones morbosas de las mismas o por su estado de inconciencia, error o ignorancia de hecho no imputable, comprender la criminalidad del acto o dirigir sus acciones. 6º. El que obrare en defensa propia o de sus derechos, siempre que concurrieren las circunstancias siguientes: a) Agresión ilegítima; b) Necesidad racional del medio empleado para impedirla o repelerla; c) Falta de provocación suficiente por parte del que se defiende...',
          historicalVersion: 'Fórmula mixta biológica-psicológica inspirada en el Código Penal suizo.'
        },
        {
          num: '79',
          title: 'Homicidio simple',
          text: 'Se aplicará reclusión o prisión de ocho a veinticinco años, al que matare a otro, siempre que en este Código no se estableciere otra pena.',
          historicalVersion: 'Tipo básico contra la vida humana independiente.'
        }
      ]
    }
  };

  const currentLaw = lawsData[selectedLaw];
  const activeArticle = currentLaw.articles.find(a => a.num === activeArticleNumber) || currentLaw.articles[0];

  const filteredArticles = searchTerm.trim()
    ? currentLaw.articles.filter(a => a.num.includes(searchTerm) || a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : currentLaw.articles;

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c378] text-xs font-semibold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" /> Explorador Normativo Interactivo
            </div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#fdfbf7]">
              Legislación Positiva de la República Argentina
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Consulte artículos de la Constitución Nacional, Códigos de fondo y leyes especiales con texto íntegro consolidado, antecedentes de reformas y análisis asistido por IA.
            </p>
          </div>

          {/* Law Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'cn', label: 'Constitución Nacional' },
              { id: 'cccn', label: 'Código Civil y Comercial' },
              { id: 'lct', label: 'Ley Contrato Trabajo' },
              { id: 'cp', label: 'Código Penal' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedLaw(item.id as any);
                  setActiveArticleNumber(lawsData[item.id as keyof typeof lawsData].articles[0].num);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedLaw === item.id
                    ? 'bg-[#c5a059] text-[#0b1325] shadow-md font-bold'
                    : 'bg-[#122042] text-slate-300 hover:text-white border border-[#1d2f5d]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Law Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Article Selector List (4 cols) */}
        <div className="lg:col-span-4 bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-4 shadow-sm flex flex-col h-[650px]">
          <div className="mb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar artículo por número o tema..."
                className="w-full bg-[#122042] text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-8.5 pr-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredArticles.map((art) => {
              const isSelected = activeArticle.num === art.num;
              return (
                <button
                  key={art.num}
                  onClick={() => setActiveArticleNumber(art.num)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-[#15274d] text-white border-[#c5a059] shadow-sm'
                      : 'bg-[#0e1a34] text-slate-300 hover:bg-[#122246] border-[#1d2f5d]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#f3dfa2]">
                      Art. {art.num}
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Vigente
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-200 mt-0.5 line-clamp-1">
                    {art.title}
                  </p>
                  <p className="text-[10.5px] text-slate-400 mt-1 line-clamp-2">
                    {art.text}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-[#1d2f5d] text-[11px] text-slate-400 flex items-center justify-between">
            <span>{currentLaw.officialNumber}</span>
            <a 
              href={currentLaw.sourceUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-[#c5a059] hover:underline flex items-center gap-1"
            >
              InfoLEG <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Right Column: Article Reader & Comparative View (8 cols) */}
        <div className="lg:col-span-8 bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[650px] overflow-y-auto">
          <div className="space-y-4">
            {/* Article Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1d2f5d] pb-4">
              <div>
                <span className="text-xs font-mono text-[#c5a059] uppercase tracking-wider font-semibold">
                  {currentLaw.name}
                </span>
                <h2 className="text-xl font-serif font-bold text-[#fdfbf7] mt-0.5">
                  Artículo {activeArticle.num}: {activeArticle.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                    showComparison 
                      ? 'bg-[#c5a059] text-[#0b1325] border-[#c5a059] font-bold' 
                      : 'bg-[#122042] text-slate-300 border-[#1d2f5d] hover:text-white'
                  }`}
                >
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                  <span>{showComparison ? 'Ocultar Comparación' : 'Comparar Antecedente'}</span>
                </button>

                <button
                  onClick={() => handleCopyText(`[${currentLaw.name}, Art. ${activeArticle.num}]:\n${activeArticle.text}`)}
                  className="p-1.5 rounded-lg bg-[#122042] hover:bg-[#1a2e5c] text-slate-300 hover:text-white border border-[#1d2f5d] text-xs flex items-center gap-1"
                  title="Copiar texto del artículo"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Split Screen for Comparison or Normal View */}
            {showComparison ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Vigente */}
                <div className="p-4 rounded-xl bg-[#0a1429] border border-[#1d2f5d] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>Texto Vigente Oficial</span>
                    <span className="text-[10px] font-mono">Consolidado</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {activeArticle.text}
                  </p>
                </div>

                {/* Historical */}
                <div className="p-4 rounded-xl bg-[#0a1429] border border-[#1d2f5d] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                    <span>Antecedente Histórico / Reforma</span>
                    <History className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    {activeArticle.historicalVersion}
                  </p>
                </div>
              </div>
            ) : (
              /* Standard Full View */
              <div className="p-6 rounded-2xl bg-[#0a1429] border border-[#1d2f5d] space-y-3">
                <p className="font-serif text-sm lg:text-base text-slate-100 leading-relaxed whitespace-pre-wrap">
                  {activeArticle.text}
                </p>
              </div>
            )}

            {/* Doctrinal Context Note */}
            <div className="p-4 rounded-xl bg-[#0f1d3c] border border-[#1d2f5d] text-xs text-slate-300 space-y-1.5">
              <span className="font-bold text-[#c5a059] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Nota de Técnica Legislativa & Aplicación:
              </span>
              <p className="text-[11.5px] leading-relaxed text-slate-300">
                {activeArticle.historicalVersion}
              </p>
            </div>
          </div>

          {/* Action Footer: AI Article Analysis Button */}
          <div className="pt-4 border-t border-[#1d2f5d] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0c162e]">
            <span className="text-[11px] text-slate-400">
              Fuente: Publicación oficial en InfoLEG • Ministerio de Justicia
            </span>

            <button
              onClick={() => onAskAIAboutArticle(currentLaw.name, activeArticle.num, activeArticle.text)}
              className="w-full sm:w-auto bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Bot className="w-4 h-4" /> Analizar este artículo con Asistente Jurídico IA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
