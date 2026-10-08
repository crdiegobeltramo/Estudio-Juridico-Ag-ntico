import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  ExternalLink,
  Copy,
  Check,
  Send,
  RefreshCw,
  ShieldCheck,
  User,
  Building2
} from 'lucide-react';
import {
  exportCartaDocumentoToDOC,
  exportCartaDocumentoToPDF,
  CartaDocumentoPayload
} from '../utils/exportDocuments.ts';

const TIPOS_CARTA_DOCUMENTO = [
  'Carta Documento de Intimación de Pago y Constitución en Mora (Art. 886 CCCN)',
  'Carta Documento / TCL de Intimación Laboral por Regularización (Ley 20.744 / Ley 23.789)',
  'Carta Documento de Resolución Contractual / Pacto Comisorio (Art. 1088 CCCN)',
  'Carta Documento de Rechazo e Impugnación de Intimación Recibida',
  'Carta Documento por Incumplimiento de Contrato de Locación / Desalojo',
  'Carta Documento de Reclamo por Defensa del Consumidor y Garantía (Ley 24.240)',
  'Carta Documento de Cese de Conducta Dañosa y Reserva de Daños y Perjuicios (Art. 1710 CCCN)',
  'Escrito Jurídico de Intimación Extrajudicial / Presentación Administrativa'
];

const PLAZOS_OPCIONES = [
  '24 horas hábiles',
  '48 horas hábiles',
  '72 horas hábiles',
  '5 días hábiles',
  '10 días corridos',
  '15 días corridos (Art. 1088 CCCN)',
  '30 días corridos'
];

export const CartaDocumentoBuilder: React.FC = () => {
  const todayFormatted = `Buenos Aires, ${new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })}`;

  const [tipoComunicacion, setTipoComunicacion] = useState(TIPOS_CARTA_DOCUMENTO[0]);
  const [lugarYFecha, setLugarYFecha] = useState(todayFormatted);
  const [plazoIntimacion, setPlazoIntimacion] = useState('48 horas hábiles');
  const [referenciaPrevia, setReferenciaPrevia] = useState('');

  const [remitente, setRemitente] = useState({
    nombre: 'Martín Alejandro Gómez',
    dniCuit: '20-31456789-4',
    domicilio: 'Av. Corrientes 2450, Piso 4° "B"',
    codigoPostal: 'C1046AAP',
    localidad: 'Ciudad Autónoma de Buenos Aires',
    provincia: 'CABA'
  });

  const [destinatario, setDestinatario] = useState({
    nombre: 'Desarrollos Constructivos del Plata S.R.L.',
    dniCuit: '30-71234567-9',
    domicilio: 'Av. del Libertador 6200, Piso 10°',
    codigoPostal: 'C1428ARF',
    localidad: 'Ciudad Autónoma de Buenos Aires',
    provincia: 'CABA'
  });

  const [hechos, setHechos] = useState(
    'Con fecha 15 de enero de 2026 suscribimos el contrato de provisión y obra sobre la unidad funcional sita en calle Gurruchaga 1840, habiendo abonado íntegramente el anticipo pactado de USD 12.000 según recibo oficial N° 0004-00012890, venciendo el plazo de entrega el día 15 de marzo de 2026 sin que a la fecha haya cumplido con la prestación a su cargo.'
  );

  const [intimacion, setIntimacion] = useState(
    'Cumpla en forma íntegra con la entrega y finalización de las tareas comprometidas en el contrato suscripto o, en su defecto, restituya las sumas percibidas con más los intereses moratorios y compensatorios devengados.'
  );

  const [apercibimiento, setApercibimiento] = useState(
    'declarar resuelto de pleno derecho el vínculo contractual por su exclusiva culpa (arts. 1084 y 1088 CCCN) y promover de inmediato demanda judicial por cobro de sumas de dinero, daños y perjuicios, lucro cesante y costas procesales'
  );

  const [cuerpoTexto, setCuerpoTexto] = useState<string>(() => {
    return `${todayFormatted.toUpperCase()}

AL DESTINATARIO: DESARROLLOS CONSTRUCTIVOS DEL PLATA S.R.L. (CUIT 30-71234567-9)
DOMICILIO: Av. del Libertador 6200, Piso 10°, (C1428ARF) Ciudad Autónoma de Buenos Aires, CABA

DE MI CONSIDERACIÓN:

Me dirijo a Ud. en mi carácter de contratante acreedor (Martín Alejandro Gómez, CUIT/DNI N° 20-31456789-4, constituyendo domicilio en Av. Corrientes 2450, Piso 4° "B", CABA), a fin de cursarle formal y fehaciente INTIMACIÓN DE CUMPLIMIENTO Y CONSTITUCIÓN EN MORA:

1. ANTECEDENTES: Con fecha 15 de enero de 2026 suscribimos el contrato de provisión y obra sobre la unidad funcional sita en calle Gurruchaga 1840, habiendo abonado íntegramente el anticipo pactado de USD 12.000 según recibo oficial N° 0004-00012890, venciendo el plazo de entrega el día 15 de marzo de 2026 sin que a la fecha haya cumplido con la prestación a su cargo.

2. INTIMACIÓN FEHACIENTE: En consecuencia, conforme lo dispuesto por los arts. 9, 724, 886, 1084, 1088 y cctes. del Código Civil y Comercial de la Nación, INTIMO A UD. por el plazo perentorio e improrrogable de 48 HORAS HÁBILES de recibida la presente a que cumpla en forma íntegra con la entrega y finalización de las tareas comprometidas en el contrato suscripto o, en su defecto, restituya las sumas percibidas con más los intereses moratorios y compensatorios devengados.

3. APERCIBIMIENTO LEGAL: Todo ello BAJO APERCIBIMIENTO de declarar resuelto de pleno derecho el vínculo contractual por su exclusiva culpa (arts. 1084 y 1088 CCCN) y promover de inmediato demanda judicial por cobro de sumas de dinero, daños y perjuicios, lucro cesante y costas procesales.

QUEDA UD. DEBIDAMENTE NOTIFICADO, INTIMADO Y CONSTITUIDO EN MORA.

Firma: ____________________________________
Aclaración: Martín Alejandro Gómez
DNI / CUIT: 20-31456789-4`;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateCartaDocumento = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/multiagent/carta-documento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoComunicacion,
          lugarYFecha,
          remitente,
          destinatario,
          plazoIntimacion,
          hechos,
          intimacion,
          apercibimiento,
          referenciaPrevia
        })
      });

      const data = await res.json();
      if (data.cuerpoTexto) {
        setCuerpoTexto(data.cuerpoTexto);
      }
    } catch (err) {
      console.error('Error al redactar Carta Documento:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const buildPayload = (): CartaDocumentoPayload => ({
    tipoComunicacion,
    lugarYFecha,
    remitente,
    destinatario,
    cuerpoTexto
  });

  const handleCopyText = () => {
    navigator.clipboard.writeText(cuerpoTexto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Specialist Agent Header + Direct Mis Comunicaciones Digitales CTA */}
      <div className="bg-gradient-to-r from-[#0d1832] via-[#112246] to-[#0c162e] border border-[#c5a059]/50 rounded-2xl p-5 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#132347] border border-[#c5a059]/40 flex items-center justify-center text-2xl shrink-0">
              ✉️
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#e5c378]">
                Agente Especialista Activo · /agents/documents/carta-documento-writer
              </div>
              <h2 className="font-serif font-bold text-lg text-[#fdfbf7]">
                Especialista en Cartas Documento y Escritos Jurídicos IA
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-0.5">
                Redactá el texto fehaciente de tu Carta Documento o escrito jurídico a partir de los datos del caso, descargalo en formato <strong>Word (.DOC)</strong> y <strong>PDF (.PDF)</strong>, e iniciá el envío digital directo en <strong>Mis Comunicaciones Digitales</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="https://miscomunicacionesdigitales.com.ar/account/login"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (cuerpoTexto) {
                  navigator.clipboard.writeText(cuerpoTexto).catch(() => {});
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              title="Copia automáticamente el texto redactado y abre Mis Comunicaciones Digitales"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar en Mis Comunicaciones Digitales</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Structured Input Data (5 cols) */}
        <div className="lg:col-span-5 bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#1d2f5d] pb-3">
            <h3 className="text-sm font-serif font-bold text-[#fdfbf7] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c5a059]" /> Datos para Redacción de la Carta Documento
            </h3>
          </div>

          <form onSubmit={handleGenerateCartaDocumento} className="space-y-3.5 text-xs">
            {/* Tipo de Comunicación */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Tipo de Carta Documento / Escrito:
              </label>
              <select
                value={tipoComunicacion}
                onChange={(e) => setTipoComunicacion(e.target.value)}
                className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              >
                {TIPOS_CARTA_DOCUMENTO.map((t, i) => (
                  <option key={i} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Lugar, Fecha y Plazo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lugar y Fecha:</label>
                <input
                  type="text"
                  value={lugarYFecha}
                  onChange={(e) => setLugarYFecha(e.target.value)}
                  className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Plazo de Intimación:</label>
                <select
                  value={plazoIntimacion}
                  onChange={(e) => setPlazoIntimacion(e.target.value)}
                  className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                >
                  {PLAZOS_OPCIONES.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Remitente Card */}
            <div className="p-3 rounded-xl bg-[#091224] border border-[#1d2f5d] space-y-2.5">
              <div className="flex items-center gap-1.5 text-[#c5a059] font-bold text-[11px] uppercase tracking-wider">
                <User className="w-3.5 h-3.5" /> 1. Datos del Remitente (Quien Envía)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-0.5">Nombre / Razón Social:</label>
                  <input
                    type="text"
                    value={remitente.nombre}
                    onChange={(e) => setRemitente({ ...remitente, nombre: e.target.value })}
                    className="w-full bg-[#122042] text-slate-100 rounded-lg px-2.5 py-1.5 border border-[#1d2f5d]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-0.5">DNI / CUIT:</label>
                  <input
                    type="text"
                    value={remitente.dniCuit}
                    onChange={(e) => setRemitente({ ...remitente, dniCuit: e.target.value })}
                    className="w-full bg-[#122042] text-slate-100 rounded-lg px-2.5 py-1.5 border border-[#1d2f5d]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-0.5">Domicilio Real / Constituido:</label>
                <input
                  type="text"
                  value={remitente.domicilio}
                  onChange={(e) => setRemitente({ ...remitente, domicilio: e.target.value })}
                  className="w-full bg-[#122042] text-slate-100 rounded-lg px-2.5 py-1.5 border border-[#1d2f5d]"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-0.5">Cód. Postal:</label>
                  <input
                    type="text"
                    value={remitente.codigoPostal}
                    onChange={(e) => setRemitente({ ...remitente, codigoPostal: e.target.value })}
                    className="w-full bg-[#122042] text-slate-100 rounded-lg px-2.5 py-1.5 border border-[#1d2f5d]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-0.5">Localidad:</label>
                  <input
                    type="text"
                    value={remitente.localidad}
                    onChange={(e) => setRemitente({ ...remitente, localidad: e.target.value })}
                    className="w-full bg-[#122042] text-slate-100 rounded-lg px-2.5 py-1.5 border border-[#1d2f5d]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-0.5">Provincia:</label>
                  <input
                    type="text"
                    value={remitente.provincia}
                    onChange={(e) => setRemitente({ ...remitente, provincia: e.target.value })}
                    className="w-full bg-[#122042] text-slate-100 rounded-lg px-2.5 py-1.5 border border-[#1d2f5d]"
                  />
                </div>
              </div>
            </div>

            {/* Destinatario Card */}
            <div className="p-3 rounded-xl bg-[#091224] border border-[#1d2f5d] space-y-2.5">
              <div className="flex items-center gap-1.5 text-[#c5a059] font-bold text-[11px] uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" /> 2. Datos del Destinatario (Intimado)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-0.5">Nombre / Razón Social:</label>
                  <input
                    type="text"
                    value={destinatario.nombre}
                    onChange={(e) => setDestinatario({ ...destinatario, nombre: e.target.value })}
                    className="w-full bg-[#122042] text-slate-100 rounded-lg px-2.5 py-1.5 border border-[#1d2f5d]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-0.5">CUIT / DNI:</label>
                  <input
                    type="text"
                    value={destinatario.dniCuit}
                    onChange={(e) => setDestinatario({ ...destinatario, dniCuit: e.target.value })}
                    className="w-full bg-[#122042] text-slate-100 rounded-lg px-2.5 py-1.5 border border-[#1d2f5d]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-0.5">Domicilio de Notificación:</label>
                <input
                  type="text"
                  value={destinatario.domicilio}
                  onChange={(e) => setDestinatario({ ...destinatario, domicilio: e.target.value })}
                  className="w-full bg-[#122042] text-slate-100 rounded-lg px-2.5 py-1.5 border border-[#1d2f5d]"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-0.5">Cód. Postal:</label>
                  <input
                    type="text"
                    value={destinatario.codigoPostal}
                    onChange={(e) => setDestinatario({ ...destinatario, codigoPostal: e.target.value })}
                    className="w-full bg-[#122042] text-slate-100 rounded-lg px-2.5 py-1.5 border border-[#1d2f5d]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-0.5">Localidad:</label>
                  <input
                    type="text"
                    value={destinatario.localidad}
                    onChange={(e) => setDestinatario({ ...destinatario, localidad: e.target.value })}
                    className="w-full bg-[#122042] text-slate-100 rounded-lg px-2.5 py-1.5 border border-[#1d2f5d]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-0.5">Provincia:</label>
                  <input
                    type="text"
                    value={destinatario.provincia}
                    onChange={(e) => setDestinatario({ ...destinatario, provincia: e.target.value })}
                    className="w-full bg-[#122042] text-slate-100 rounded-lg px-2.5 py-1.5 border border-[#1d2f5d]"
                  />
                </div>
              </div>
            </div>

            {/* Referencia CD Previa */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                CD o Comunicación Previa que se responde (opcional):
              </label>
              <input
                type="text"
                value={referenciaPrevia}
                onChange={(e) => setReferenciaPrevia(e.target.value)}
                placeholder="Ej.: En respuesta a su CD N° 894512340 de fecha..."
                className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            {/* Hechos */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Hechos / Antecedentes de la Relación Jurídica:
              </label>
              <textarea
                rows={3}
                value={hechos}
                onChange={(e) => setHechos(e.target.value)}
                placeholder="Describa fechas, contrato, relación laboral, facturas o incumplimiento..."
                className="w-full bg-[#122042] text-slate-100 text-xs rounded-xl p-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            {/* Intimación Concreta */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Exigencia / Intimación Concreta:
              </label>
              <textarea
                rows={2}
                value={intimacion}
                onChange={(e) => setIntimacion(e.target.value)}
                placeholder="Qué conducta o pago exacto se exige dentro del plazo perentorio..."
                className="w-full bg-[#122042] text-slate-100 text-xs rounded-xl p-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            {/* Apercibimiento */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Apercibimiento Legal en caso de incumplimiento:
              </label>
              <textarea
                rows={2}
                value={apercibimiento}
                onChange={(e) => setApercibimiento(e.target.value)}
                className="w-full bg-[#122042] text-slate-100 text-xs rounded-xl p-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Redactando Texto Fehaciente con Especialista IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Redactar Carta Documento con Agente Especialista</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Official Carta Documento Preview, DOC/PDF Emission & Mis Comunicaciones Digitales Button (7 cols) */}
        <div className="lg:col-span-7 bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          {/* Top Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1d2f5d] pb-3">
            <div>
              <span className="font-serif font-bold text-sm text-[#fdfbf7] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#c5a059]" /> Vista Previa Editable de Carta Documento
              </span>
              <p className="text-[11px] text-slate-400">
                Podés editar directamente cualquier línea antes de emitir el archivo DOC o PDF o iniciar el envío digital.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="px-3 py-2 rounded-xl bg-[#122042] hover:bg-[#192c58] text-slate-200 border border-[#1d2f5d] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Texto Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => exportCartaDocumentoToDOC(buildPayload())}
                className="px-3.5 py-2 rounded-xl bg-[#162a54] hover:bg-[#1e3870] text-[#f3dfa2] border border-[#c5a059]/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Emitir DOC (.doc)</span>
              </button>

              <button
                type="button"
                onClick={() => exportCartaDocumentoToPDF(buildPayload())}
                className="px-3.5 py-2 rounded-xl bg-[#162a54] hover:bg-[#1e3870] text-[#f3dfa2] border border-[#c5a059]/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Emitir PDF (.pdf)</span>
              </button>
            </div>
          </div>

          {/* Visual Official Header Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#091224] p-3.5 rounded-xl border border-[#1d2f5d] text-xs">
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-[#c5a059]">REMITENTE</div>
              <div className="font-bold text-slate-100">{remitente.nombre || '[COMPLETAR]'}</div>
              <div className="text-slate-400">DNI/CUIT: {remitente.dniCuit || '[COMPLETAR]'}</div>
              <div className="text-slate-400">
                {remitente.domicilio} ({remitente.codigoPostal}) {remitente.localidad}, {remitente.provincia}
              </div>
            </div>
            <div className="space-y-0.5 border-t md:border-t-0 md:border-l border-[#1d2f5d] pt-2 md:pt-0 md:pl-3">
              <div className="text-[10px] font-mono uppercase text-[#c5a059]">DESTINATARIO</div>
              <div className="font-bold text-slate-100">{destinatario.nombre || '[COMPLETAR]'}</div>
              <div className="text-slate-400">CUIT/DNI: {destinatario.dniCuit || '[COMPLETAR]'}</div>
              <div className="text-slate-400">
                {destinatario.domicilio} ({destinatario.codigoPostal}) {destinatario.localidad}, {destinatario.provincia}
              </div>
            </div>
          </div>

          {/* Editable Carta Documento Body */}
          <div className="flex-1 flex flex-col">
            <label className="text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              Cuerpo Epistolar Fehaciente (Editable):
            </label>
            <textarea
              rows={18}
              value={cuerpoTexto}
              onChange={(e) => setCuerpoTexto(e.target.value)}
              className="w-full flex-1 bg-[#081020] text-slate-100 font-mono text-xs leading-relaxed p-4 rounded-xl border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Bottom Direct Send Banner -> Mis Comunicaciones Digitales */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#112246] via-[#152a56] to-[#0f1d3d] border border-[#c5a059]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#f3dfa2]">
                <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                <span>Listo para Imposición Digital de Carta Documento</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Al pulsar el botón se copiará automáticamente el texto redactado al portapapeles y se abrirá el portal oficial de <strong>Mis Comunicaciones Digitales</strong> para iniciar el envío.
              </p>
            </div>

            <a
              href="https://miscomunicacionesdigitales.com.ar/account/login"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (cuerpoTexto) {
                  navigator.clipboard.writeText(cuerpoTexto).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] font-bold text-xs flex items-center gap-2 shadow-lg shrink-0 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Iniciar Envío en Mis Comunicaciones Digitales</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
