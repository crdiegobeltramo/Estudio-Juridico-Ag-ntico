# Academia Virtual del Derecho — Legal AI

Plataforma jurídica y académica integral, moderna, segura, escalable y responsive, destinada a estudiantes de Derecho, abogados litigantes, docentes universitarios, investigadores y estudios jurídicos en la **República Argentina**, con arquitectura preparada para incorporar Derecho comparado y jurisdicciones latinoamericanas.

---

## 🏛️ Identidad Editorial & Visual
- **Paleta Institucional:** Azul Marino Profundo (`#070d18`, `#0b1325`), Dorado Clásico (`#c5a059`, `#e5c378`), Marfil (`#fdfbf7`) y pizarra sutil.
- **Tipografía:** Tipografías serif para títulos y encabezados de estilo judicial (*EB Garamond*, *Cinzel*) combinadas con sans-serif técnica y legible (*Plus Jakarta Sans*) para interfaces de alta densidad operativa.
- **Accesibilidad y diseño:** Responsive en teléfonos móviles, tablets y monitores de escritorio.

---

## 🚀 Módulos Implementados

1. **Panel de Inicio (Dashboard):** Visión panorámica adaptada por rol con buscador global (`⌘K`), accesos rápidos, estado de fuentes oficiales (InfoLEG, SAIJ, CSJN) y agenda procesal/académica.
2. **Asistente Jurídico con IA (Gemini 3.8 Flash):** Chat jurídico asistido desde el backend seguro en Node.js. Selectores de jurisdicción, rama del Derecho (Civil y Comercial, Constitucional, Laboral, Penal, etc.), perfil de usuario y profundidad de respuesta (*simple*, *académica*, *profesional*). Respuestas estructuradas que diferencian hechos, normas, interpretación, citas verificables y advertencia deontológica.
3. **Biblioteca Jurídica Inteligente:** Catálogo consultable con filtros multifacéticos (leyes, fallos CSJN, doctrina, tratados). Fichas completas con metadatos, estado de vigencia y enlace oficial.
4. **Motor RAG Jurídico (Retrieval-Augmented Generation):**
   - Ingesta de texto y documentos autorizados con segmentación automática por párrafos/artículos.
   - Búsqueda semántica con cálculo de similitud.
   - **Regla estricta de abstención:** Si la evidencia documental es inferior al umbral mínimo, el motor emite una respuesta de abstención deontológica para prevenir alucinaciones.
   - Citas verificables directas a las fuentes recuperadas.
5. **Explorador Normativo:** Visualizador interactivo de la Constitución Nacional (1994), Código Civil y Comercial de la Nación (Ley 26.994), Ley de Contrato de Trabajo (Ley 20.744) y Código Penal, con comparación de versiones históricas y análisis directo por artículo con IA.
6. **Laboratorio de Jurisprudencia:** Fichas de sentencias de la Corte Suprema de Justicia de la Nación (*Siri*, *Kot*, *Halabi*, *Arriola*, *Mendoza*), desglose de plataforma fáctica, cuestión de derecho, holding, votos y línea de precedentes.
7. **Campus Universitario:**
   - Tarjetas de memoria (Flashcards) interactivas con repetición espaciada.
   - Cuestionarios de opción múltiple con devolución pedagógica inmediata y fundamento normativo.
   - **Simulador de Examen Oral con IA:** El tribunal examinador formula interrogantes jurídicos y evalúa las respuestas del alumno con rúbrica universitaria detallada (calificación 1 a 10, fortalezas, puntos de mejora y conceptos faltantes).
8. **Estudio Jurídico Digital:**
   - Gestión de expedientes judiciales y clientes.
   - **Redactor Forense IA:** Generación de borradores de demandas, contestaciones, cartas documento y contratos con advertencia obligatoria de firma por letrado matriculado.
   - **Calculadora Procesal de Plazos:** Cómputo de días hábiles judiciales con plazo de gracia de 2 horas (art. 124 CPCCN).
9. **Expediente Inteligente:** Dossier digital con cronología de actuaciones, piezas adjuntas y asistente de consulta enfocado en los autos.
10. **Tribuna IA — Debate Jurídico:** Examen dialéctico imparcial de controversias del Derecho argentino (DNU, daño punitivo, plataformas de delivery, IA judicial) con síntesis neutral.
11. **Tutor Jurídico Personal:** Planificador de estudio con fechas de examen, metas semanales y seguimiento de progreso.
12. **Investigación y Documentos:** Editor de dictámenes con formateador de citas oficiales (Fallos CSJN Tomo:Página, leyes y normas de estilo).
13. **Consola Administrativa:** Métricas de uso de IA, conectores a fuentes oficiales (InfoLEG, SAIJ, CSJN) y auditoría de operaciones sensibles.
14. **Suscripciones y Planes:** Planes Free, Estudiantes, Abogados e Institucional con pasarela modular desacoplada.

---

## 🛠️ Pila Tecnológica & Arquitectura
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Backend:** Node.js, Express, TypeScript (`server.ts`).
- **Inferencia IA:** SDK `@google/genai` (modelo `gemini-3.8-flash`) ejecutado exclusivamente en el servidor con header `User-Agent: aistudio-build`.
- **RAG & Búsqueda:** Motor vectorial y léxico en servidor con indexación y cálculo de similitud.
- **Entorno de Ejecución:** Servidor full-stack en puerto `3000` con `vite.middlewares` montado en desarrollo y estáticos en producción.

---

## ⚙️ Variables de Entorno & Configuración
Crear o verificar el archivo `.env`:
```env
GEMINI_API_KEY="su_api_key_de_gemini"
APP_URL="http://localhost:3000"
NODE_ENV="development"
PORT=3000
```

---

## 🚦 Ejecución en Desarrollo
```bash
# Iniciar servidor full-stack (Express + Vite)
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

---

## 📦 Compilación para Producción
```bash
# Construir cliente Vite
npm run build

# Iniciar servidor en modo producción
NODE_ENV=production npm start
```

---

## ⚖️ Aviso Deontológico & Responsabilidad Profesional
La aplicación es una herramienta tecnológica de asistencia, estudio e investigación jurídica. Las respuestas, borradores y análisis emitidos por modelos de lenguaje artificial **no sustituyen el dictamen ni el patrocinio letrado obligatorio de un abogado debidamente matriculado en el colegio o fuero correspondiente**.
