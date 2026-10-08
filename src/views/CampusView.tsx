import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  RotateCw, 
  Award, 
  BookOpen, 
  Send, 
  ChevronRight,
  TrendingUp,
  Brain,
  MessageSquare,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Flashcard, QuizQuestion } from '../types/index.ts';

export const CampusView: React.FC = () => {
  const [activeCampusTab, setActiveCampusTab] = useState<'flashcards' | 'quiz' | 'oralExam'>('flashcards');

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Oral Exam Simulator state
  const [materiaExam, setMateriaExam] = useState('Derecho Civil y Comercial — Obligaciones y Daños');
  const [temaExam, setTemaExam] = useState('Factor Objetivo de Atribución y Eximentes CCCN');
  const [examQuestion, setExamQuestion] = useState<string | null>(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isExamLoading, setIsExamLoading] = useState(false);
  const [examEvaluation, setExamEvaluation] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/campus/flashcards')
      .then(res => res.json())
      .then(data => setFlashcards(data.flashcards || []))
      .catch(console.error);

    fetch('/api/campus/quizzes')
      .then(res => res.json())
      .then(data => setQuizzes(data.quizzes || []))
      .catch(console.error);
  }, []);

  const handleStartExam = async () => {
    setIsExamLoading(true);
    setExamEvaluation(null);
    setStudentAnswer('');
    try {
      const res = await fetch('/api/gemini/oral-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materia: materiaExam,
          tema: temaExam
        })
      });
      const data = await res.json();
      setExamQuestion(data.pregunta);
    } catch (err) {
      console.error(err);
      setExamQuestion('Explique los elementos de la responsabilidad civil en el CCCN y las causales de fractura del nexo causal.');
    } finally {
      setIsExamLoading(false);
    }
  };

  const handleSubmitExamAnswer = async () => {
    if (!studentAnswer.trim() || isExamLoading) return;
    setIsExamLoading(true);
    try {
      const res = await fetch('/api/gemini/oral-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materia: materiaExam,
          tema: temaExam,
          pregunta: examQuestion,
          respuestaEstudiante: studentAnswer
        })
      });
      const data = await res.json();
      setExamEvaluation(data.evaluacion);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExamLoading(false);
    }
  };

  const currentCard = flashcards[currentCardIndex];
  const currentQuiz = quizzes[currentQuizIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c378] text-xs font-semibold uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5" /> Campus Universitario & Pedagogía Jurídica
            </div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#fdfbf7]">
              Espacio de Aprendizaje & Práctica Universitaria
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Herramientas interactivas de consolidación dogmática: tarjetas de memoria con repetición espaciada, cuestionarios con fundamentación explicativa y simulador de examen oral evaluado por tribunal de IA.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#122042] p-1 rounded-xl border border-[#1d2f5d] self-start">
            <button
              onClick={() => setActiveCampusTab('flashcards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCampusTab === 'flashcards' ? 'bg-[#c5a059] text-[#0b1325] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Tarjetas de Memoria
            </button>
            <button
              onClick={() => setActiveCampusTab('quiz')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCampusTab === 'quiz' ? 'bg-[#c5a059] text-[#0b1325] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Cuestionarios
            </button>
            <button
              onClick={() => setActiveCampusTab('oralExam')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                activeCampusTab === 'oralExam' ? 'bg-[#c5a059] text-[#0b1325] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" /> Simulador Oral IA
            </button>
          </div>
        </div>
      </div>

      {/* Featured Banner: Catálogo Oficial & Adquisición de Resúmenes */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#122247] via-[#0d1833] to-[#1a2d59] border-2 border-[#c5a059]/50 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#876524] p-0.5 shadow-md shadow-[#c5a059]/20 shrink-0">
            <div className="w-full h-full bg-[#0a1429] rounded-[9px] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#f3dfa2]" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#c5a059] tracking-wider bg-[#c5a059]/15 px-2 py-0.5 rounded border border-[#c5a059]/30">
                Editorial Oficial AVD
              </span>
              <span className="text-xs text-slate-400">• Resúmenes Jurídicos Oficiales</span>
            </div>
            <h3 className="font-serif font-bold text-base text-[#fdfbf7]">
              ¿Preparando materias, parciales o exámenes finales?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Ingresa a nuestra tienda oficial, consulta el catálogo completo y adquiere resúmenes doctrinarios con jurisprudencia y legislación argentina actualizada.
            </p>
          </div>
        </div>

        <div className="shrink-0 self-start md:self-center">
          <a
            href="https://academiavirtualdelderecho.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#c5a059] via-[#e5c378] to-[#b38728] hover:from-[#d4af37] text-[#0b1325] font-serif font-bold text-xs shadow-lg shadow-[#c5a059]/30 transition-all hover:scale-105 group cursor-pointer"
            title="Ingresa a https://academiavirtualdelderecho.netlify.app/ y adquiere tu resumen"
          >
            <BookOpen className="w-4 h-4 text-[#0b1325]" />
            <span>Consulta nuestro catálogo</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#0b1325] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* 1. Flashcards Tab */}
      {activeCampusTab === 'flashcards' && currentCard && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-[#c5a059]">{currentCard.materia}</span>
            <span className="font-mono">Tarjeta {currentCardIndex + 1} de {flashcards.length}</span>
          </div>

          {/* Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[280px] rounded-2xl bg-[#0e1a38] border-2 border-[#1d2f5d] hover:border-[#c5a059]/60 p-8 flex flex-col justify-between transition-all duration-300 shadow-xl group"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-4">
                <span className="uppercase text-[10px] bg-[#16274e] px-2 py-0.5 rounded text-[#e5c378]">
                  {isFlipped ? 'Respuesta & Fundamento' : 'Pregunta Dogmática'}
                </span>
                <span className="capitalize text-[10px] text-slate-400">Dificultad: {currentCard.dificultad}</span>
              </div>

              {!isFlipped ? (
                <div className="space-y-3">
                  <h3 className="font-serif text-lg md:text-xl text-[#fdfbf7] font-semibold leading-snug">
                    {currentCard.pregunta}
                  </h3>
                  <p className="text-xs text-slate-400 italic">
                    Haga clic en la tarjeta para voltear y revelar la respuesta y la norma aplicable.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {currentCard.respuesta}
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#0b1325] border border-[#1d2f5d] text-xs text-[#c5a059] font-mono">
                    Referencia: {currentCard.normaReferencia}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#1d2f5d]/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <RotateCw className="w-3.5 h-3.5 text-[#c5a059]" /> Clic para voltear
              </span>
              <span className="text-[11px] text-slate-400">Repaso Activo Espaciado</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentCardIndex(prev => (prev > 0 ? prev - 1 : flashcards.length - 1));
              }}
              className="px-4 py-2 rounded-xl bg-[#122042] hover:bg-[#182a54] text-slate-300 text-xs border border-[#1d2f5d]"
            >
              Anterior
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIndex(prev => (prev + 1) % flashcards.length);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] text-xs font-bold shadow-sm"
              >
                Siguiente Tarjeta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Quizzes Tab */}
      {activeCampusTab === 'quiz' && currentQuiz && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-[#1d2f5d] pb-3">
              <span className="font-semibold text-[#c5a059]">{currentQuiz.materia}</span>
              <span className="font-mono">Pregunta {currentQuizIndex + 1} de {quizzes.length}</span>
            </div>

            <h3 className="font-serif text-base md:text-lg font-bold text-[#fdfbf7] leading-snug">
              {currentQuiz.pregunta}
            </h3>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQuiz.opciones.map((op, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuiz.respuestaCorrecta;
                let optionStyle = 'bg-[#0e1a38] text-slate-200 border-[#1d2f5d] hover:bg-[#132349]';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-950/40 text-emerald-200 border-emerald-500 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-rose-950/40 text-rose-200 border-rose-500';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-[#182c58] text-white border-[#c5a059] font-medium';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border text-xs leading-relaxed transition-all flex items-start gap-3 ${optionStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full bg-[#1b2b4e] flex items-center justify-center font-mono font-bold text-[10px] shrink-0 text-[#f3dfa2]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{op}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Submit or Next Button */}
            {!isAnswerSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={() => {
                  setIsAnswerSubmitted(true);
                  if (selectedOption === currentQuiz.respuestaCorrecta) {
                    setQuizScore(prev => prev + 1);
                  }
                }}
                className="w-full bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] disabled:opacity-40 text-[#0b1325] py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm"
              >
                Confirmar Respuesta
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Explanation Card */}
                <div className="p-4 rounded-xl bg-[#091329] border border-[#1d2f5d] space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#c5a059]">
                    <BookOpen className="w-4 h-4" /> Devolución Pedagógica & Fundamento Legal:
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {currentQuiz.explicacion}
                  </p>
                  <p className="text-[11px] font-mono text-emerald-400 pt-1">
                    Norma: {currentQuiz.fundamentoLegal}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setIsAnswerSubmitted(false);
                      setSelectedOption(null);
                      setCurrentQuizIndex(prev => (prev + 1) % quizzes.length);
                    }}
                    className="bg-[#122042] hover:bg-[#182a54] text-slate-200 px-5 py-2 rounded-xl text-xs font-semibold border border-[#1d2f5d] flex items-center gap-2"
                  >
                    <span>Siguiente Pregunta</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Oral Exam Simulation Tab */}
      {activeCampusTab === 'oralExam' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Setup / Start Exam Box */}
          <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#fdfbf7]">
              <Brain className="w-4 h-4 text-[#c5a059]" /> Configuración de Mesa de Examen Oral
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Materia / Cátedra:</label>
                <select
                  value={materiaExam}
                  onChange={(e) => setMateriaExam(e.target.value)}
                  className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="Derecho Civil y Comercial — Obligaciones y Daños">Derecho Civil y Comercial — Obligaciones y Daños</option>
                  <option value="Derecho Constitucional — Parte Dogmática y Amparo">Derecho Constitucional — Parte Dogmática y Amparo</option>
                  <option value="Derecho del Trabajo — LCT y Principios">Derecho del Trabajo — LCT y Principios</option>
                  <option value="Derecho Penal — Parte General e Imputabilidad">Derecho Penal — Parte General e Imputabilidad</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bolilla o Tema Central:</label>
                <input
                  type="text"
                  value={temaExam}
                  onChange={(e) => setTemaExam(e.target.value)}
                  placeholder="Ej: Factor Objetivo de Atribución y Eximentes CCCN"
                  className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleStartExam}
                disabled={isExamLoading}
                className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{examQuestion ? 'Generar Nueva Pregunta' : 'Iniciar Interrogatorio Oral'}</span>
              </button>
            </div>
          </div>

          {/* Exam Question from Tribunal */}
          {examQuestion && (
            <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#c5a059] uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" /> Interrogante del Tribunal Examinador:
              </div>

              <div className="p-4 rounded-xl bg-[#091329] border border-[#1d2f5d] text-sm text-[#fdfbf7] font-serif leading-relaxed">
                "{examQuestion}"
              </div>

              {/* Student Response Area */}
              {!examEvaluation && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Respuesta del Alumno (Redacte su exposición oral como si estuviese frente a la mesa examinadora):
                  </label>
                  <textarea
                    rows={6}
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Comience fundamentando con los artículos específicos de la ley, el concepto dogmático y los criterios jurisprudenciales aplicables..."
                    className="w-full bg-[#122042] text-slate-100 text-xs rounded-xl p-3 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">
                      * Evaluación diagnóstica formativa asistida por IA — No sustituye calificación oficial.
                    </span>
                    <button
                      onClick={handleSubmitExamAnswer}
                      disabled={!studentAnswer.trim() || isExamLoading}
                      className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] disabled:opacity-40 text-[#0b1325] px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isExamLoading ? 'Evaluando...' : 'Enviar Respuesta al Tribunal'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Evaluation Rubric Results */}
              {examEvaluation && (
                <div className="mt-6 pt-5 border-t border-[#1d2f5d] space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0e1d3e] border border-[#c5a059]/40">
                    <div>
                      <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-wider">Dictamen del Tribunal:</span>
                      <h4 className="text-base font-serif font-bold text-white mt-0.5">{examEvaluation.nivel}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold font-mono text-[#f3dfa2]">
                        {examEvaluation.puntaje} / 10
                      </span>
                      <p className="text-[10px] text-slate-400">Calificación Pedagógica</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed p-4 rounded-xl bg-[#091329] border border-[#1d2f5d]">
                    <span className="font-bold text-[#c5a059] block mb-1">Fundamentación del Voto:</span>
                    {examEvaluation.fundamentacion}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Aspectos Positivos */}
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                      <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Aciertos en la Exposición:
                      </h5>
                      <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11.5px]">
                        {examEvaluation.aspectosPositivos?.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Puntos de Mejora */}
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                      <h5 className="font-bold text-amber-400 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" /> Conceptos a Profundizar:
                      </h5>
                      <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11.5px]">
                        {examEvaluation.puntosMejora?.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        setExamEvaluation(null);
                        setStudentAnswer('');
                        handleStartExam();
                      }}
                      className="bg-[#122042] hover:bg-[#182a54] text-slate-200 px-5 py-2.5 rounded-xl text-xs font-semibold border border-[#1d2f5d]"
                    >
                      Tomar Otro Interrogatorio Oral
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
