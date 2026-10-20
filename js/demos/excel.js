/* Consolidación de ejemplo a partir de conjuntos CSV ficticios. */
window.PacnoloDemos = window.PacnoloDemos || {};
window.PacnoloDemos.excel = function initExcel() {
  const sheets=[
    {sucursal:'Centro',rows:[['V-101',' ana lópez  ',1250],['V-102','CARLOS MÉNDEZ',820],['V-103','maría   ruiz',2170],['V-104','sofia nava',475],['V-105','jose pérez',1200]]},
    {sucursal:'Norte',rows:[['V-106','  marco flores',990],['V-107','Andrea GARCÍA',1780],['V-103','maría ruiz',2170],['V-108','luis gonzalez ',1350]]},
    {sucursal:'Sur',rows:[['V-109','Daniela Torres',740],['V-110','ROBERTO LUNA',1200],['V-111','  elena cortez',620],['V-107','andrea garcía',1780]]}
  ];
  const el=id=>document.getElementById(id);
  const body=el('excel-body');
  let consolidated=[];
  const money=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n);
  const escapeHtml=str=>String(str).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function normalizeName(name){return name.trim().replace(/\s+/g,' ').toLocaleLowerCase('es-MX').replace(/(^|\s)(\p{L})/gu,(_,a,b)=>a+b.toLocaleUpperCase('es-MX'));}
  function process(){
    const normalize=el('excel-normalize').checked,dedup=el('excel-dedup').checked;
    const all=sheets.flatMap(s=>s.rows.map(r=>({folio:r[0],sucursal:s.sucursal,cliente:normalize?normalizeName(r[1]):r[1],importe:r[2]})));
    const seen=new Set();let duplicates=0;
    consolidated=all.filter(row=>{if(dedup&&seen.has(row.folio)){duplicates++;return false;}seen.add(row.folio);return true;});
    el('excel-original').textContent=all.length;el('excel-final').textContent=consolidated.length;el('excel-duplicates').textContent=duplicates;
    body.innerHTML=consolidated.map(row=>`<tr><td><strong>${escapeHtml(row.folio)}</strong></td><td>${escapeHtml(row.sucursal)}</td><td>${escapeHtml(row.cliente)}</td><td>${money(row.importe)}</td></tr>`).join('');
    el('excel-results').hidden=false;
    window.pacnoloToast?.('Archivos de ejemplo consolidados correctamente.');
  }
  function csvCell(value){return '"'+String(value).replace(/"/g,'""')+'"';}
  function downloadCsv(){
    if(!consolidated.length)return;
    const rows=[['Folio','Sucursal','Cliente','Importe'],...consolidated.map(r=>[r.folio,r.sucursal,r.cliente,r.importe])];
    const csv='\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='pacnolo_demo_consolidado.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
    window.pacnoloToast?.('CSV de ejemplo descargado.');
  }
  el('excel-process').addEventListener('click',process);
  el('excel-download').addEventListener('click',downloadCsv);
  el('excel-reset').addEventListener('click',()=>{consolidated=[];el('excel-normalize').checked=true;el('excel-dedup').checked=true;el('excel-results').hidden=true;window.pacnoloToast?.('Ejemplo de Excel reiniciado.');});
};
