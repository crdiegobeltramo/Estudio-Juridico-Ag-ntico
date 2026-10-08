import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  Briefcase,
  AlertCircle,
  X,
  ExternalLink,
  Copy,
  QrCode,
  ArrowRight,
  Settings,
  Wallet,
  CheckCircle2,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface MPWallet {
  collectorEmail: string;
  collectorName: string;
  alias: string;
  cvu: string;
  currency: string;
  status: 'conectada' | 'pendiente_token' | 'modo_sandbox';
  isWebhookActive: boolean;
}

export const SubscriptionView: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  // Selected plan for checkout modal
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: string;
    priceNumber: number;
    period: string;
  } | null>(null);

  // Mercado Pago Wallet state
  const [walletConfig, setWalletConfig] = useState<MPWallet>({
    collectorEmail: 'lucianacervelli@hotmail.com',
    collectorName: 'Dra. Luciana Cervelli',
    alias: 'ANSIA.ALZAR.BUZOS.MP',
    cvu: '0000003100080194840969',
    currency: 'ARS (Pesos Argentinos)',
    status: 'conectada',
    isWebhookActive: true
  });

  // Modal for editing wallet credentials / alias
  const [showWalletSettingsModal, setShowWalletSettingsModal] = useState(false);
  const [editAlias, setEditAlias] = useState('');
  const [editCvu, setEditCvu] = useState('');
  const [editCollectorName, setEditCollectorName] = useState('');
  const [editCollectorEmail, setEditCollectorEmail] = useState('');
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [walletSaveSuccess, setWalletSaveSuccess] = useState(false);

  // Checkout modal states
  const [checkoutMethod, setCheckoutMethod] = useState<'checkout_pro' | 'transferencia' | 'qr'>('checkout_pro');
  const [isGeneratingPreference, setIsGeneratingPreference] = useState(false);
  const [mpPreference, setMpPreference] = useState<{
    preferenceId?: string;
    initPoint?: string;
    isSandbox?: boolean;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transferReported, setTransferReported] = useState(false);

  useEffect(() => {
    fetch('/api/mercadopago/config')
      .then(res => res.json())
      .then(data => {
        if (data.wallet) {
          setWalletConfig(data.wallet);
          setEditAlias(data.wallet.alias);
          setEditCvu(data.wallet.cvu);
          setEditCollectorName(data.wallet.collectorName);
          setEditCollectorEmail(data.wallet.collectorEmail);
        }
      })
      .catch(console.error);
  }, []);

  const plans = [
    {
      id: 'free',
      name: 'Plan Acceso Abierto',
      badge: 'Básico',
      price: '$0',
      priceNumber: 0,
      period: 'Gratuito permanente',
      description: 'Ideal para consulta normativa y exploración inicial del acervo jurídico.',
      features: [
        'Acceso libre a Constitución Nacional y Códigos Oficiales',
        'Búsqueda en Biblioteca Jurídica y Fallos de la CSJN',
        '10 consultas mensuales con Asistente Jurídico IA',
        'Tarjetas de estudio universitarias básicas'
      ],
      current: user.plan === 'free',
      actionText: 'Plan Activo'
    },
    {
      id: 'estudiante',
      name: 'Plan Estudiantes & Grado',
      badge: 'Popular Académico',
      price: '$9.900',
      priceNumber: 9900,
      period: 'ARS / mes',
      description: 'Herramientas pedagógicas intensivas para alumnos de universidades de Argentina.',
      features: [
        'Consultas ilimitadas con Asistente Jurídico IA',
        'Simulador de Examen Oral con rúbrica pedagógica',
        'Tutor y planificador de estudio con repetición espaciada',
        'Todos los cuestionarios con fundamentación dogmática',
        'Carga e indexación de apuntes de cátedra'
      ],
      current: user.plan === 'estudiante',
      actionText: 'Suscribirme con Mercado Pago'
    },
    {
      id: 'abogado',
      name: 'Plan Abogados & Litigantes',
      badge: 'Recomendado Profesional',
      price: '$29.900',
      priceNumber: 29900,
      period: 'ARS / mes',
      description: 'Potencia de litigación con motor RAG forense, redactor de escritos y gestión procesal.',
      features: [
        'Motor RAG Jurídico con citas verificadas y umbral estricto',
        'Redactor Forense IA (Demandas, Cartas Documento, Contestaciones)',
        'Expediente Digital Inteligente con análisis documental',
        'Calculadora procesal de días hábiles y plazos perentorios',
        'Exportación editable en PDF formal (jspdf / html2canvas)',
        'Soporte prioritario para letrados matriculados'
      ],
      current: user.plan === 'abogado',
      actionText: 'Plan Actual'
    },
    {
      id: 'institucional',
      name: 'Plan Institucional & Estudios',
      badge: 'Grandes Firmas',
      price: '$89.000',
      priceNumber: 89000,
      period: 'ARS / mes',
      description: 'Para estudios jurídicos multidisciplinarios, universidades y organismos públicos.',
      features: [
        'Múltiples espacios de trabajo y usuarios simultáneos',
        'Control granular de permisos por rol institucional',
        'Integración con API personalizada y repositorios propios',
        'Auditoría corporativa y aislamiento seguro de expedientes',
        'Capacitación exclusiva por juristas de Academia Virtual'
      ],
      current: user.plan === 'institucional',
      actionText: 'Contratar con Mercado Pago'
    }
  ];

  const handleOpenCheckout = async (plan: any) => {
    setSelectedPlan(plan);
    setMpPreference(null);
    setTransferReported(false);
    setIsGeneratingPreference(true);

    try {
      const res = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          title: plan.name,
          price: plan.priceNumber,
          payerEmail: user.email
        })
      });
      const data = await res.json();
      setMpPreference(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPreference(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveWalletConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWallet(true);
    setWalletSaveSuccess(false);

    try {
      const res = await fetch('/api/mercadopago/update-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias: editAlias,
          cvu: editCvu,
          collectorName: editCollectorName,
          collectorEmail: editCollectorEmail
        })
      });
      const data = await res.json();
      if (data.success) {
        setWalletConfig(data.wallet);
        setWalletSaveSuccess(true);
        setTimeout(() => {
          setWalletSaveSuccess(false);
          setShowWalletSettingsModal(false);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingWallet(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#009ee3]/15 border border-[#009ee3]/30 text-[#00b1ea] text-xs font-semibold uppercase tracking-wider">
          <Wallet className="w-3.5 h-3.5 text-[#009ee3]" /> Conexión con Mercado Pago Argentina
        </div>
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#fdfbf7]">
          Planes, Membresías & Recaudación
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          Plataforma adaptada a la legislación de la República Argentina con cobros en Pesos Argentinos (ARS) conectados directamente a la billetera de <strong>Mercado Pago</strong>.
        </p>
        <div className="pt-1">
          <a
            href="https://academiavirtualdelderecho.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#122042] hover:bg-[#182a54] border border-[#c5a059]/60 hover:border-[#f3dfa2] text-xs font-semibold text-[#fdfbf7] hover:text-[#f3dfa2] shadow-sm transition-all group cursor-pointer"
            title="Ingresa a https://academiavirtualdelderecho.netlify.app/ y adquiere tu resumen"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#c5a059] group-hover:scale-110 transition-transform" />
            <span className="font-serif font-bold text-xs">Consulta nuestro catálogo</span>
            <span className="text-[11px] text-slate-400 group-hover:text-slate-300">• Adquiere tu resumen</span>
            <ExternalLink className="w-3 h-3 text-[#c5a059] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* Connected Mercado Pago Wallet Card */}
      <div className="bg-gradient-to-r from-[#0c1834] via-[#0e1d3e] to-[#0a1630] border-2 border-[#009ee3]/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#009ee3] flex items-center justify-center text-white font-bold shadow-md shadow-[#009ee3]/30">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-[#fdfbf7]">
                    Billetera Mercado Pago Conectada
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verificada
                  </span>
                </div>
                <p className="text-xs text-[#00b1ea]">
                  Titular de Recaudación: <strong>{walletConfig.collectorName}</strong> ({walletConfig.collectorEmail})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-[#081124]/80 rounded-xl border border-[#1d2f5d] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Alias de Mercado Pago</span>
                  <span className="font-mono font-bold text-[#f3dfa2] text-xs select-all">{walletConfig.alias}</span>
                </div>
                <button
                  onClick={() => handleCopy(walletConfig.alias, 'alias')}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Copiar alias"
                >
                  {copiedField === 'alias' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#c5a059]" />}
                </button>
              </div>

              <div className="p-3 bg-[#081124]/80 rounded-xl border border-[#1d2f5d] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">CVU Mercado Pago</span>
                  <span className="font-mono text-slate-300 text-xs select-all truncate max-w-[170px] inline-block">{walletConfig.cvu}</span>
                </div>
                <button
                  onClick={() => handleCopy(walletConfig.cvu, 'cvu')}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Copiar CVU"
                >
                  {copiedField === 'cvu' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#c5a059]" />}
                </button>
              </div>

              <div className="p-3 bg-[#081124]/80 rounded-xl border border-[#1d2f5d]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Moneda de Liquidación</span>
                <span className="font-semibold text-slate-200 text-xs">{walletConfig.currency}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 self-start md:self-center">
            <button
              onClick={() => setShowWalletSettingsModal(true)}
              className="bg-[#12244a] hover:bg-[#1a3368] text-slate-200 border border-[#009ee3]/50 hover:border-[#009ee3] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#009ee3]" />
              <span>Configurar Billetera</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`p-6 rounded-2xl flex flex-col justify-between border transition-all duration-200 ${
              p.current 
                ? 'bg-[#122349] border-[#c5a059] shadow-xl ring-1 ring-[#c5a059]/40' 
                : 'bg-[#0c162e] border-[#1d2f5d] hover:border-[#009ee3]/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold px-2 py-0.5 rounded bg-[#16274e] border border-[#213565]">
                  {p.badge}
                </span>
                {p.current && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Activo
                  </span>
                )}
              </div>

              <h3 className="font-serif font-bold text-base text-[#fdfbf7] mt-1">{p.name}</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">{p.description}</p>

              <div className="my-5 pb-4 border-b border-[#1d2f5d]">
                <span className="text-2xl font-bold font-mono text-white">{p.price}</span>
                <span className="text-xs text-slate-400 ml-1.5">{p.period}</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                {p.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#009ee3] shrink-0 mt-0.5" />
                    <span className="text-[11.5px] leading-tight">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1d2f5d]/60">
              <button
                onClick={() => {
                  if (p.id !== user.plan) {
                    handleOpenCheckout(p);
                  }
                }}
                disabled={p.current}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  p.current
                    ? 'bg-[#15274d] text-slate-400 cursor-default'
                    : 'bg-gradient-to-r from-[#009ee3] to-[#007eb5] hover:from-[#00b1ea] hover:to-[#008fc9] text-white shadow-md shadow-[#009ee3]/20 flex items-center justify-center gap-1.5'
                }`}
              >
                {!p.current && <Wallet className="w-3.5 h-3.5" />}
                <span>{p.actionText}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Security & Mercado Pago Notice */}
      <div className="p-4 rounded-xl bg-[#0a1429] border border-[#1d2f5d] text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Pagos procesados por <strong>Mercado Pago Argentina</strong>. Certificación PCI-DSS de nivel bancario. Transferencias acreditadas inmediatamente en la billetera de la titular <strong>Dra. Luciana Cervelli</strong>.
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#009ee3] shrink-0 font-bold bg-[#009ee3]/10 px-2.5 py-1 rounded-full border border-[#009ee3]/30">
          Mercado Pago • República Argentina
        </span>
      </div>

      {/* Modal: Mercado Pago Checkout */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0c162e] border-2 border-[#009ee3]/40 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1d2f5d] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#009ee3] flex items-center justify-center text-white">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#fdfbf7]">
                    Suscripción con Mercado Pago
                  </h3>
                  <p className="text-[11px] text-slate-400">Academia Virtual del Derecho</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlan(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#16274e]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Plan Summary Box */}
            <div className="p-4 rounded-xl bg-[#091329] border border-[#1d2f5d] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#009ee3] font-bold">Plan Seleccionado</span>
                <h4 className="font-serif font-bold text-sm text-white mt-0.5">{selectedPlan.name}</h4>
                <p className="text-[11px] text-slate-400">Acceso integral y soporte</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-[#f3dfa2]">{selectedPlan.price}</span>
                <span className="text-[10px] text-slate-400 block">{selectedPlan.period}</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="flex rounded-xl bg-[#122042] p-1 border border-[#1d2f5d] text-xs">
              <button
                onClick={() => setCheckoutMethod('checkout_pro')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  checkoutMethod === 'checkout_pro' ? 'bg-[#009ee3] text-white shadow-sm' : 'text-slate-300'
                }`}
              >
                Checkout Pro MP
              </button>
              <button
                onClick={() => setCheckoutMethod('transferencia')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  checkoutMethod === 'transferencia' ? 'bg-[#009ee3] text-white shadow-sm' : 'text-slate-300'
                }`}
              >
                Alias / CVU Directo
              </button>
              <button
                onClick={() => setCheckoutMethod('qr')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  checkoutMethod === 'qr' ? 'bg-[#009ee3] text-white shadow-sm' : 'text-slate-300'
                }`}
              >
                QR Mercado Pago
              </button>
            </div>

            {/* Method 1: Checkout Pro Button */}
            {checkoutMethod === 'checkout_pro' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0e1d3e] border border-[#009ee3]/30 text-xs space-y-2 text-slate-300">
                  <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#009ee3]" /> Pago Seguro con Tarjeta o Saldo en Cuenta
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-slate-300">
                    Al presionar el botón oficial inferior, se abrirá la pasarela de <strong>Mercado Pago</strong> para abonar con saldo disponible, tarjetas de débito/crédito en cuotas o dinero en cuenta.
                  </p>
                  <div className="text-[10.5px] font-mono text-slate-400 pt-1 border-t border-[#1d2f5d]">
                    Titular de acreditación: {walletConfig.collectorName} ({walletConfig.collectorEmail})
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (mpPreference?.initPoint) {
                      window.open(mpPreference.initPoint, '_blank');
                    } else {
                      alert(`Preferencia creada para ${selectedPlan.name} por ${selectedPlan.price}. Acreditación directa a la cuenta de ${walletConfig.collectorName}.`);
                    }
                  }}
                  className="w-full bg-[#009ee3] hover:bg-[#00b1ea] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#009ee3]/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Pagar {selectedPlan.price} con Mercado Pago</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            )}

            {/* Method 2: Direct Transfer to Wallet Alias / CVU */}
            {checkoutMethod === 'transferencia' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300 leading-relaxed text-[11.5px]">
                  Transfiera el monto de <strong>{selectedPlan.price} ARS</strong> desde su aplicación de Mercado Pago o home banking a la siguiente cuenta oficial:
                </p>

                <div className="space-y-2">
                  <div className="p-3 bg-[#0a1327] rounded-xl border border-[#1d2f5d] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Alias Mercado Pago:</span>
                      <span className="font-mono font-bold text-[#f3dfa2] text-xs select-all">{walletConfig.alias}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(walletConfig.alias, 'alias-modal')}
                      className="px-2.5 py-1 rounded bg-[#16274e] text-slate-200 hover:text-white text-[11px] flex items-center gap-1"
                    >
                      {copiedField === 'alias-modal' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'alias-modal' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-[#0a1327] rounded-xl border border-[#1d2f5d] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">CVU Oficial:</span>
                      <span className="font-mono text-slate-200 text-xs select-all">{walletConfig.cvu}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(walletConfig.cvu, 'cvu-modal')}
                      className="px-2.5 py-1 rounded bg-[#16274e] text-slate-200 hover:text-white text-[11px] flex items-center gap-1"
                    >
                      {copiedField === 'cvu-modal' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'cvu-modal' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="p-2.5 bg-[#0a1327] rounded-xl border border-[#1d2f5d] text-[11px] text-slate-400 flex justify-between">
                    <span>Titular: <strong>{walletConfig.collectorName}</strong></span>
                    <span>Billetera: <strong>Mercado Pago</strong></span>
                  </div>
                </div>

                {!transferReported ? (
                  <button
                    onClick={() => {
                      setTransferReported(true);
                      updateUser({ plan: selectedPlan.id as any });
                    }}
                    className="w-full bg-[#122042] hover:bg-[#182a54] text-[#e5c378] border border-[#c5a059]/40 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all mt-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Ya realicé la transferencia (Habilitar Plan)</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-semibold">
                    ¡Comprobante registrado! Plan "{selectedPlan.name}" activado en su cuenta.
                  </div>
                )}
              </div>
            )}

            {/* Method 3: QR Code Payment */}
            {checkoutMethod === 'qr' && (
              <div className="space-y-3 text-center text-xs">
                <div className="p-5 bg-white rounded-2xl w-48 h-48 mx-auto flex flex-col items-center justify-center border-4 border-[#009ee3] shadow-lg">
                  <QrCode className="w-36 h-36 text-[#0b1325]" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-200">
                    Escanee con la App de Mercado Pago
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Monto: <strong>{selectedPlan.price} ARS</strong> • Titular: {walletConfig.collectorName}
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 border-t border-[#1d2f5d] flex justify-end">
              <button
                onClick={() => setSelectedPlan(null)}
                className="px-4 py-2 rounded-xl bg-[#122042] text-slate-300 hover:text-white text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Configure / Edit Mercado Pago Wallet Settings */}
      {showWalletSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c162e] border-2 border-[#009ee3]/40 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#1d2f5d] pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#009ee3]" />
                <h3 className="font-serif font-bold text-base text-[#fdfbf7]">
                  Configuración de Billetera Mercado Pago
                </h3>
              </div>
              <button 
                onClick={() => setShowWalletSettingsModal(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Ingrese o actualice los datos de su cuenta de Mercado Pago Argentina para recibir automáticamente los cobros y transferencias de las suscripciones.
            </p>

            {walletSaveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Billetera de Mercado Pago actualizada exitosamente.</span>
              </div>
            )}

            <form onSubmit={handleSaveWalletConfig} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Titular de la Cuenta MP:</label>
                <input
                  type="text"
                  required
                  value={editCollectorName}
                  onChange={(e) => setEditCollectorName(e.target.value)}
                  placeholder="Dra. Luciana Cervelli"
                  className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#009ee3]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Registrado en Mercado Pago:</label>
                <input
                  type="email"
                  required
                  value={editCollectorEmail}
                  onChange={(e) => setEditCollectorEmail(e.target.value)}
                  placeholder="lucianacervelli40@gmail.com"
                  className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#009ee3]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alias de Mercado Pago (para transferencias):</label>
                <input
                  type="text"
                  required
                  value={editAlias}
                  onChange={(e) => setEditAlias(e.target.value)}
                  placeholder="CERVELLI.DERECHO.MP"
                  className="w-full bg-[#122042] text-slate-100 font-mono rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#009ee3]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">CVU Oficial de Mercado Pago (22 dígitos):</label>
                <input
                  type="text"
                  required
                  value={editCvu}
                  onChange={(e) => setEditCvu(e.target.value)}
                  placeholder="0000003100084920194821"
                  className="w-full bg-[#122042] text-slate-100 font-mono rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#009ee3]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#1d2f5d]">
                <button
                  type="button"
                  onClick={() => setShowWalletSettingsModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#122042] text-slate-300 hover:text-white text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingWallet}
                  className="bg-[#009ee3] hover:bg-[#00b1ea] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#009ee3]/20"
                >
                  {isSavingWallet && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Conexión MP</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
