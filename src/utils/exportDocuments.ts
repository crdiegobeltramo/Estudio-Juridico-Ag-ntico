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

export interface CartaDocumentoPayload {
  tipoComunicacion: string;
  lugarYFecha: string;
  remitente: {
    nombre: string;
    dniCuit: string;
    domicilio: string;
    codigoPostal: string;
    localidad: string;
    provincia: string;
  };
  destinatario: {
    nombre: string;
    dniCuit: string;
    domicilio: string;
    codigoPostal: string;
    localidad: string;
    provincia: string;
  };
  cuerpoTexto: string;
}

export function exportCartaDocumentoToDOC(payload: CartaDocumentoPayload): void {
  const safeBody = (payload.cuerpoTexto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Carta Documento - ${payload.remitente.nombre} a ${payload.destinatario.nombre}</title>
      <style>
        body { font-family: 'Courier New', Courier, monospace; font-size: 11pt; line-height: 1.45; color: #000; margin: 1.8cm; }
        .header-title { font-family: 'Times New Roman', serif; font-size: 15pt; font-weight: bold; text-align: center; text-transform: uppercase; border: 2px solid #000; padding: 8px; margin-bottom: 14px; background: #f4f4f4; }
        table.parties { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-family: Arial, sans-serif; font-size: 9.5pt; }
        table.parties td, table.parties th { border: 1px solid #000; padding: 7px 9px; vertical-align: top; width: 50%; }
        table.parties th { background: #e8e8e8; text-transform: uppercase; font-weight: bold; text-align: left; font-size: 9pt; }
        .date-bar { border: 1px solid #000; padding: 6px 10px; margin-bottom: 16px; font-family: Arial, sans-serif; font-size: 9.5pt; background: #fafafa; }
        .body-box { border: 2px solid #000; padding: 16px; min-height: 360px; font-family: 'Courier New', Courier, monospace; font-size: 11pt; text-align: justify; white-space: pre-wrap; }
        .signature-table { width: 100%; margin-top: 28px; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 9.5pt; }
        .signature-table td { width: 33%; text-align: center; padding-top: 35px; border-top: 1px solid #000; }
        .footer-note { margin-top: 18px; font-family: Arial, sans-serif; font-size: 8.5pt; color: #444; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header-title">
        CARTA DOCUMENTO / COMUNICACIÓN FEHACIENTE<br/>
        <span style="font-size: 9.5pt; font-weight: normal;">${payload.tipoComunicacion} — República Argentina</span>
      </div>

      <table class="parties">
        <tr>
          <th>REMITENTE</th>
          <th>DESTINATARIO</th>
        </tr>
        <tr>
          <td>
            <strong>Apellido y Nombre / Razón Social:</strong> ${payload.remitente.nombre || '[COMPLETAR]'}<br/>
            <strong>DNI / CUIT:</strong> ${payload.remitente.dniCuit || '[COMPLETAR]'}<br/>
            <strong>Domicilio:</strong> ${payload.remitente.domicilio || '[COMPLETAR]'}<br/>
            <strong>CP / Localidad:</strong> (${payload.remitente.codigoPostal || '----'}) ${payload.remitente.localidad || '[COMPLETAR]'}<br/>
            <strong>Provincia:</strong> ${payload.remitente.provincia || '[COMPLETAR]'}
          </td>
          <td>
            <strong>Apellido y Nombre / Razón Social:</strong> ${payload.destinatario.nombre || '[COMPLETAR]'}<br/>
            <strong>DNI / CUIT:</strong> ${payload.destinatario.dniCuit || '[COMPLETAR]'}<br/>
            <strong>Domicilio:</strong> ${payload.destinatario.domicilio || '[COMPLETAR]'}<br/>
            <strong>CP / Localidad:</strong> (${payload.destinatario.codigoPostal || '----'}) ${payload.destinatario.localidad || '[COMPLETAR]'}<br/>
            <strong>Provincia:</strong> ${payload.destinatario.provincia || '[COMPLETAR]'}
          </td>
        </tr>
      </table>

      <div class="date-bar">
        <strong>LUGAR Y FECHA DE EMISIÓN:</strong> ${payload.lugarYFecha}
      </div>

      <div class="body-box">${safeBody}</div>

      <br/>
      <table class="signature-table">
        <tr>
          <td>Firma del Remitente</td>
          <td>Aclaración: ${payload.remitente.nombre || '____________________'}</td>
          <td>Tipo y N° Doc.: ${payload.remitente.dniCuit || '____________________'}</td>
        </tr>
      </table>

      <div class="footer-note">
        Documento generado por el Agente Especialista en Cartas Documento y Escritos Jurídicos IA — Academia Virtual del Derecho. Listo para imposición en https://miscomunicacionesdigitales.com.ar/account/login
      </div>
    </body>
    </html>
  `;

  const cleanName = (payload.destinatario.nombre || 'Destinatario').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadBlob(
    htmlContent,
    `Carta_Documento_${cleanName}.doc`,
    'application/msword;charset=utf-8'
  );
}

export function exportCartaDocumentoToPDF(payload: CartaDocumentoPayload): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  // Title Box
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, contentWidth, 14);
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('CARTA DOCUMENTO — COMUNICACION FEHACIENTE', pageWidth / 2, y + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`${payload.tipoComunicacion} | Republica Argentina`, pageWidth / 2, y + 11.5, { align: 'center' });
  y += 18;

  // Parties Boxes (Remitente | Destinatario)
  const colWidth = contentWidth / 2;
  doc.setLineWidth(0.35);
  doc.rect(margin, y, colWidth, 32);
  doc.rect(margin + colWidth, y, colWidth, 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('1. REMITENTE', margin + 3, y + 5);
  doc.text('2. DESTINATARIO', margin + colWidth + 3, y + 5);
  doc.line(margin, y + 7, margin + contentWidth, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const remLines = [
    `Nombre / Razon Social: ${payload.remitente.nombre || '[COMPLETAR]'}`,
    `DNI / CUIT: ${payload.remitente.dniCuit || '[COMPLETAR]'}`,
    `Domicilio: ${payload.remitente.domicilio || '[COMPLETAR]'}`,
    `CP / Localidad: (${payload.remitente.codigoPostal || '----'}) ${payload.remitente.localidad || ''}`,
    `Provincia: ${payload.remitente.provincia || ''}`
  ];
  const destLines = [
    `Nombre / Razon Social: ${payload.destinatario.nombre || '[COMPLETAR]'}`,
    `DNI / CUIT: ${payload.destinatario.dniCuit || '[COMPLETAR]'}`,
    `Domicilio: ${payload.destinatario.domicilio || '[COMPLETAR]'}`,
    `CP / Localidad: (${payload.destinatario.codigoPostal || '----'}) ${payload.destinatario.localidad || ''}`,
    `Provincia: ${payload.destinatario.provincia || ''}`
  ];

  let py = y + 11.5;
  for (let i = 0; i < remLines.length; i++) {
    doc.text(remLines[i].slice(0, 52), margin + 3, py);
    doc.text(destLines[i].slice(0, 52), margin + colWidth + 3, py);
    py += 4.5;
  }
  y += 36;

  // Place & Date bar
  doc.rect(margin, y, contentWidth, 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`LUGAR Y FECHA: ${payload.lugarYFecha}`, margin + 3, y + 5.3);
  y += 12;

  // Body Text Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('TEXTO DE LA CARTA DOCUMENTO / ESCRITO:', margin, y);
  y += 3;

  // Body Text Content
  doc.setFont('courier', 'normal');
  doc.setFontSize(9.5);
  const bodyLines = doc.splitTextToSize(payload.cuerpoTexto || '', contentWidth - 8);
  const boxStartY = y;

  y += 6;
  for (const line of bodyLines) {
    if (y > 245) {
      doc.rect(margin, boxStartY, contentWidth, y - boxStartY + 2);
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin + 4, y);
    y += 4.5;
  }

  const finalBoxHeight = Math.max(115, y - boxStartY + 8);
  if (boxStartY + finalBoxHeight <= 255) {
    doc.rect(margin, boxStartY, contentWidth, finalBoxHeight);
    y = boxStartY + finalBoxHeight + 16;
  } else {
    doc.rect(margin, boxStartY, contentWidth, y - boxStartY + 4);
    y += 14;
  }

  if (y > 265) {
    doc.addPage();
    y = 35;
  }

  // Signature block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.line(margin + 5, y, margin + 55, y);
  doc.line(margin + 65, y, margin + 120, y);
  doc.line(margin + 130, y, margin + contentWidth - 5, y);

  doc.text('Firma del Remitente', margin + 15, y + 4.5);
  doc.text(`Aclaracion: ${(payload.remitente.nombre || '').slice(0, 25)}`, margin + 67, y + 4.5);
  doc.text(`DNI/CUIT: ${(payload.remitente.dniCuit || '').slice(0, 18)}`, margin + 132, y + 4.5);

  const cleanName = (payload.destinatario.nombre || 'Destinatario').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Carta_Documento_${cleanName}.pdf`);
}

export function exportLegalDraftToDOC(title: string, content: string): void {
  const safeContent = (content || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; margin: 2.5cm; text-align: justify; }
        h1 { font-size: 14pt; text-transform: uppercase; text-align: center; border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 18px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div>${safeContent}</div>
    </body>
    </html>
  `;

  const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadBlob(htmlContent, `${cleanTitle}.doc`, 'application/msword;charset=utf-8');
}

export function exportLegalDraftToPDF(title: string, content: string): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxLineWidth = pageWidth - margin * 2;
  let y = 22;

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  const titleLines = doc.splitTextToSize(title.toUpperCase(), maxLineWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 2;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  const bodyLines = doc.splitTextToSize(content || '', maxLineWidth);
  for (const line of bodyLines) {
    if (y > 275) {
      doc.addPage();
      y = 22;
    }
    doc.text(line, margin, y);
    y += 5;
  }

  const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${cleanTitle}.pdf`);
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
