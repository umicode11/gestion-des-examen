'use client';

function getDayLabelFull(date) {
  return ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][date.getDay()];
}
function formatDateFR(d) {
  return d.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' });
}
function toStr(d) {
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function isVendredi(d) { return d.getDay()===5; }

export default function PdfExport({ annee, session, savedPlannings, examDates }) {
  const exportPDF = async () => {
    const { default: jsPDF }     = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const pdf   = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // Detect selected semestres from savedPlannings
    const sems = [...new Set(savedPlannings.map(p=>p.semestre))].sort();
    const semsLabel = sems.map(s=>'S'+s).join(', ');

    // Header
    pdf.setFontSize(9); pdf.setFont('helvetica','bold');
    pdf.text('UNIVERSITE CHOUAIB DOUKKALI', pageW/2, 8, { align:'center' });
    pdf.text('FACULTE DES SCIENCES - EL JADIDA', pageW/2, 13, { align:'center' });
    pdf.setFontSize(11);
    pdf.text('CALENDRIER DES EXAMENS - '+semsLabel, pageW/2, 20, { align:'center' });
    pdf.setFont('helvetica','normal'); pdf.setFontSize(9);
    pdf.text('Annee universitaire '+annee+' - '+session, pageW/2, 26, { align:'center' });

    // ── Head row 1: FILIERES | Day (colspan 2) | ...
    const headRow1 = [
      { content:'FILIERES', rowSpan:2, styles:{ valign:'middle', halign:'center', fontStyle:'bold', fillColor:[30,58,138], textColor:255, fontSize:8 } }
    ];
    examDates.forEach(d => {
      headRow1.push({
        content: getDayLabelFull(d)+'\n'+formatDateFR(d),
        colSpan: 2,
        styles: { halign:'center', fontStyle:'bold', fillColor:[30,58,138], textColor:255, fontSize:7 }
      });
    });

    // ── Head row 2: Matin | Après-midi per day
    const headRow2 = [];
    examDates.forEach(d => {
      const amH = isVendredi(d) ? '15h00' : '14h30';
      headRow2.push({ content:'Matin\n8h30',    styles:{ halign:'center', fontStyle:'bold', fillColor:[30,58,160], textColor:220, fontSize:6 } });
      headRow2.push({ content:'A-midi\n'+amH,   styles:{ halign:'center', fontStyle:'bold', fillColor:[22,78,99],  textColor:220, fontSize:6 } });
    });

    // ── Body: one row per filière, 2 cells per day
    const body = savedPlannings.map(({ short, slots }) => {
      const row = [
        { content: short, styles:{ fontStyle:'bold', halign:'center', fillColor:[241,245,249], fontSize:8, textColor:[15,23,42] } }
      ];
      examDates.forEach(d => {
        const dateStr = toStr(d);
        const amH     = isVendredi(d) ? '15h00' : '14h30';
        const matin   = slots.find(s => s.jour===dateStr && s.periode==='matin');
        const aprem   = slots.find(s => s.jour===dateStr && s.periode==='apres-midi');
        row.push(matin
          ? { content: matin.module_nom+'\n8h30', styles:{ fillColor:[239,246,255], textColor:[15,23,42], fontSize:6, halign:'center' } }
          : { content:'', styles:{ fillColor:[250,250,252] } }
        );
        row.push(aprem
          ? { content: aprem.module_nom+'\n'+amH, styles:{ fillColor:[240,253,244], textColor:[15,23,42], fontSize:6, halign:'center' } }
          : { content:'', styles:{ fillColor:[250,250,252] } }
        );
      });
      return row;
    });

    const nDays  = examDates.length;
    const filW   = 20;
    const dayW   = Math.floor((pageW - 10 - filW) / (nDays * 2)); // width per matin/aprem col
    const colStyles = { 0: { cellWidth: filW } };
    for (let i=0; i<nDays*2; i++) colStyles[i+1] = { cellWidth: dayW };

    autoTable(pdf, {
      head: [headRow1, headRow2],
      body,
      startY: 31,
      theme: 'grid',
      styles: { fontSize:6, cellPadding:1.5, valign:'middle', halign:'center', lineColor:[180,180,180], lineWidth:0.2, overflow:'linebreak' },
      columnStyles: colStyles,
      margin: { left:5, right:5 },
      tableWidth: pageW-10,
      didDrawPage: () => {
        pdf.setFontSize(7); pdf.setFont('helvetica','normal'); pdf.setTextColor(120);
        pdf.text('Matin : 8h30          Apres-midi : 14h30  (Vendredi : 15h00)', 5, pageH-4);
        pdf.setTextColor(0);
      }
    });

    pdf.save('calendrier_'+annee.replace('-','_')+'_'+sems.join('-')+'.pdf');
  };

  return (
    <button onClick={exportPDF}
      className="px-5 py-2 rounded-xl font-semibold bg-red-700 hover:bg-red-600 transition-all text-sm">
      📄 Exporter PDF
    </button>
  );
}
