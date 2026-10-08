import { jsPDF } from 'jspdf';
import { MultiAgentOrchestrationResponse } from '../agents/types.ts';

export function exportOrchestrationToMarkdown(result: MultiAgentOrchestrationResponse): void {
  const r = result.finalConsolidatedReport;
  const md = `# ${r.titulo}
**ACADEMIA VIRTUAL DEL DERECHO — ESTUDIO JURÍDICO VIRTUAL MULTIAGENTE**
- **ID de Dictamen:** ${result.id}
- **Fecha:** ${new Date(result.timestamp).toLocaleString('es-AR')}
- **Materia Principal:** ${result.classification.materiaPrincipal}
- **Jurisdicción:** ${result.jurisdictionContext.pais} — ${result.jurisdictionContext.tipoJurisdiccion} (${result.jurisdictionContext.provincia})
- **Fuero / Tribunal:** ${result.jurisdictionContext.fuero} — ${result.jurisdictionContext.tribunal}
- **Equipo Interviniente:** ${result.selectedTeamName}
- **Nivel de Confianza:** **${result.confidenceLevel}** (${result.confidenceExplanation})

---

> **AVISO DEONTOLÓGICO OBLIGATORIO:** ${result.ethicalDisclaimer}

---

## I. CLASIFICACIÓN Y SEPARACIÓN EPISTÉMICA
### 1. Información Aportada por el Usuario
${result.epistemicSeparation.informacionAportadaPorUsuario.map(i => `- ${i}`).join('\n')}

### 2. Conocimiento Jurídico General
${result.epistemicSeparation.conocimientoJuridicoGeneral.map(i => `- ${i}`).join('\n')}

### 3. Normativa Identificada
${result.epistemicSeparation.normativaIdentificada.map(n => `- **[${n.status}] ${n.norma} (${n.articulo})** — Ámbito: ${n.ambito} | Vigencia: ${n.vigencia} | Fuente: ${n.fuente} — *${n.relevancia}*`).join('\n')}

### 4. Jurisprudencia Identificada
${result.epistemicSeparation.jurisprudenciaIdentificada.map(j => `- **[${j.status}] "${j.caratula}"** — Tribunal: ${j.tribunal} | Fecha: ${j.fecha} | Exp.: ${j.expediente} | Criterio: ${j.criterio} | Utilidad: ${j.utilidadParaElCaso}`).join('\n')}

### 5. Información que Requiere Verificación y Preguntas Aclaratorias
${result.epistemicSeparation.informacionQueRequiereVerificacion.map(i => `- [REQUIERE VERIFICACIÓN] ${i}`).join('\n')}
${result.classification.preguntasAclaratorias.map(p => `- **Pregunta aclaratoria:** ${p}`).join('\n')}

---

## II. DICTAMEN JURÍDICO CONSOLIDADO (10 SECCIONES)

### 1. Antecedentes
${r.antecedentes}

### 2. Hechos
${r.hechos}

### 3. Problema Jurídico
${r.problemaJuridico}

### 4. Normativa Aplicable
${r.normativaAplicable}

### 5. Jurisprudencia
${r.jurisprudencia}

### 6. Análisis Jurídico
${r.analisisJuridico}

### 7. Riesgos y Contraargumentos (Auditoría Abogado del Diablo)
${r.riesgosYContraargumentos}

### 8. Alternativas y Estrategia Procesal (Plan A y Plan B)
${r.alternativasYEstrategia}

### 9. Recomendación Profesional
${r.recomendacion}

### 10. Conclusión
${r.conclusion}

${r.borradorEscritoOContrato ? `\n---\n## III. BORRADOR DE PIEZA FORENSE / CONTRACTUAL\n\`\`\`text\n${r.borradorEscritoOContrato}\n\`\`\`\n` : ''}

---
## IV. INTERVENCIONES INDIVIDUALES DE LOS AGENTES ESPECIALIZADOS
${result.agentContributions.map(a => `### ${a.agentEmoji} ${a.agentName} (${a.stage})\n*Entregable: ${a.deliverableType}*\n\n${a.detailedOutput}\n`).join('\n')}
`;

  downloadBlob(md, `Dictamen_AVD_${result.id}.md`, 'text/markdown;charset=utf-8');
}

export function exportOrchestrationToTXT(result: MultiAgentOrchestrationResponse): void {
  const r = result.finalConsolidatedReport;
  const txt = `======================================================================
ACADEMIA VIRTUAL DEL DERECHO — ESTUDIO JURÍDICO VIRTUAL MULTIAGENTE
======================================================================
TÍTULO: ${r.titulo}
ID: ${result.id} | FECHA: ${new Date(result.timestamp).toLocaleString('es-AR')}
MATERIA: ${result.classification.materiaPrincipal}
JURISDICCIÓN: ${result.jurisdictionContext.pais} - ${result.jurisdictionContext.tipoJurisdiccion} (${result.jurisdictionContext.provincia})
FUERO / TRIBUNAL: ${result.jurisdictionContext.fuero} / ${result.jurisdictionContext.tribunal}
NIVEL DE CONFIANZA: ${result.confidenceLevel} (${result.confidenceExplanation})
----------------------------------------------------------------------
AVISO DEONTOLÓGICO:
${result.ethicalDisclaimer}
======================================================================

1. ANTECEDENTES:
${r.antecedentes}

2. HECHOS:
${r.hechos}

3. PROBLEMA JURÍDICO:
${r.problemaJuridico}

4. NORMATIVA APLICABLE:
${r.normativaAplicable}

5. JURISPRUDENCIA:
${r.jurisprudencia}

6. ANÁLISIS JURÍDICO:
${r.analisisJuridico}

7. RIESGOS Y CONTRAARGUMENTOS (ABOGADO DEL DIABLO):
${r.riesgosYContraargumentos}

8. ALTERNATIVAS Y ESTRATEGIA:
${r.alternativasYEstrategia}

9. RECOMENDACIÓN:
${r.recomendacion}

10. CONCLUSIÓN:
${r.conclusion}

${r.borradorEscritoOContrato ? `\n======================================================================\nBORRADOR DE ESCRITO / CONTRATO\n======================================================================\n${r.borradorEscritoOContrato}\n` : ''}
`;

  downloadBlob(txt, `Dictamen_AVD_${result.id}.txt`, 'text/plain;charset=utf-8');
}

export function exportOrchestrationToDOCX(result: MultiAgentOrchestrationResponse): void {
  const r = result.finalConsolidatedReport;
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${r.titulo}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #111; margin: 2.5cm; }
        h1 { font-size: 16pt; text-transform: uppercase; text-align: center; border-bottom: 2px solid #876524; padding-bottom: 8px; }
        h2 { font-size: 13pt; color: #0c1836; margin-top: 18px; border-bottom: 1px solid #ccc; }
        h3 { font-size: 11.5pt; color: #333; margin-top: 12px; }
        .meta { background: #f7f5f0; padding: 10px; border: 1px solid #c5a059; font-size: 10.5pt; margin-bottom: 16px; }
        .disclaimer { font-style: italic; font-size: 10pt; color: #555; border-left: 3px solid #876524; padding-left: 10px; margin-bottom: 20px; }
        pre { font-family: 'Courier New', monospace; font-size: 10.5pt; white-space: pre-wrap; background: #fafafa; padding: 12px; border: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <h1>ACADEMIA VIRTUAL DEL DERECHO<br/><span style="font-size:12pt;">Estudio Jurídico Virtual Multiagente — República Argentina</span></h1>
      <div class="meta">
        <strong>Dictamen:</strong> ${r.titulo}<br/>
        <strong>Materia:</strong> ${result.classification.materiaPrincipal}<br/>
        <strong>Jurisdicción:</strong> ${result.jurisdictionContext.tipoJurisdiccion} — ${result.jurisdictionContext.provincia} (${result.jurisdictionContext.fuero})<br/>
        <strong>Equipo Interviniente:</strong> ${result.participatingAgents.map(a => a.name).join(', ')}<br/>
        <strong>Nivel de Confianza:</strong> ${result.confidenceLevel} — ${result.confidenceExplanation}
      </div>
      <div class="disclaimer">${result.ethicalDisclaimer}</div>

      <h2>1. Antecedentes</h2><p>${r.antecedentes}</p>
      <h2>2. Hechos</h2><p>${r.hechos}</p>
      <h2>3. Problema Jurídico</h2><p>${r.problemaJuridico}</p>
      <h2>4. Normativa Aplicable</h2><p>${r.normativaAplicable}</p>
      <h2>5. Jurisprudencia</h2><p>${r.jurisprudencia}</p>
      <h2>6. Análisis Jurídico</h2><p>${r.analisisJuridico}</p>
      <h2>7. Riesgos y Contraargumentos (Abogado del Diablo)</h2><p>${r.riesgosYContraargumentos}</p>
      <h2>8. Alternativas y Estrategia Procesal</h2><p>${r.alternativasYEstrategia}</p>
      <h2>9. Recomendación</h2><p>${r.recomendacion}</p>
      <h2>10. Conclusión</h2><p>${r.conclusion}</p>

      ${r.borradorEscritoOContrato ? `<h2>Borrador Forense / Contractual</h2><pre>${r.borradorEscritoOContrato}</pre>` : ''}
    </body>
    </html>
  `;

  downloadBlob(
    htmlContent,
    `Dictamen_AVD_${result.id}.doc`,
    'application/msword;charset=utf-8'
  );
}

export function exportOrchestrationToPDF(result: MultiAgentOrchestrationResponse): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const r = result.finalConsolidatedReport;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const maxLineWidth = pageWidth - margin * 2;
  let y = 20;

  const checkPageBreak = (needed = 12) => {
    if (y + needed > 275) {
      doc.addPage();
      y = 20;
    }
  };

  // Header
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('ACADEMIA VIRTUAL DEL DERECHO', margin, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont('times', 'italic');
  doc.text('Estudio Juridico Virtual Multiagente — Republica Argentina', margin, y);
  y += 4;
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // Metadata
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  const titleLines = doc.splitTextToSize(r.titulo, maxLineWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 5 + 2;

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  const metaText = `Materia: ${result.classification.materiaPrincipal} | Jurisdiccion: ${result.jurisdictionContext.tipoJurisdiccion} (${result.jurisdictionContext.provincia}) | Confianza: ${result.confidenceLevel}`;
  const metaLines = doc.splitTextToSize(metaText, maxLineWidth);
  doc.text(metaLines, margin, y);
  y += metaLines.length * 4.5 + 3;

  // Disclaimer
  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  const discLines = doc.splitTextToSize(`Aviso: ${result.ethicalDisclaimer}`, maxLineWidth);
  doc.text(discLines, margin, y);
  y += discLines.length * 4 + 5;

  const sections = [
    { title: '1. ANTECEDENTES', body: r.antecedentes },
    { title: '2. HECHOS', body: r.hechos },
    { title: '3. PROBLEMA JURIDICO', body: r.problemaJuridico },
    { title: '4. NORMATIVA APLICABLE', body: r.normativaAplicable },
    { title: '5. JURISPRUDENCIA', body: r.jurisprudencia },
    { title: '6. ANALISIS JURIDICO', body: r.analisisJuridico },
    { title: '7. RIESGOS Y CONTRAARGUMENTOS', body: r.riesgosYContraargumentos },
    { title: '8. ALTERNATIVAS Y ESTRATEGIA', body: r.alternativasYEstrategia },
    { title: '9. RECOMENDACION', body: r.recomendacion },
    { title: '10. CONCLUSION', body: r.conclusion },
  ];

  if (r.borradorEscritoOContrato) {
    sections.push({ title: 'ANEXO: BORRADOR FORENSE / CONTRACTUAL', body: r.borradorEscritoOContrato });
  }

  for (const sec of sections) {
    checkPageBreak(16);
    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    doc.text(sec.title, margin, y);
    y += 5;

    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    const bodyLines = doc.splitTextToSize(sec.body || '-', maxLineWidth);
    for (const line of bodyLines) {
      checkPageBreak(6);
      doc.text(line, margin, y);
      y += 4.5;
    }
    y += 3;
  }

  doc.save(`Dictamen_AVD_${result.id}.pdf`);
}

function downloadBlob(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
