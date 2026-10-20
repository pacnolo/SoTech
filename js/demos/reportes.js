/* Dashboard con filtros y exportación CSV, datos ficticios y deterministas. */
window.PacnoloDemos = window.PacnoloDemos || {};
window.PacnoloDemos.reportes = function initReportes() {
  const el=id=>document.getElementById(id);
  const sales={
    '2026-10':{Tienda:[12300,16700,14100,18500],Online:[6800,5100,9000,8200]},
    '2026-09':{Tienda:[10800,14300,11800,16200],Online:[4200,6600,5800,7900]},
    '2026-08':{Tienda:[9800,10100,15100,13200],Online:[4000,5100,6800,6200]}
  };
  const productNames=['Café molido','Leche entera','Galletas surtidas','Bebidas'];
  const money=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n);
  let rows=[];
  function render(){
    const month=el('rep-month').value,channel=el('rep-channel').value;
    const sources=channel==='todos'?['Tienda','Online']:[channel];
    const weekly=[0,1,2,3].map(i=>sources.reduce((sum,c)=>sum+sales[month][c][i],0));
    const total=weekly.reduce((a,b)=>a+b,0);
    const orders=Math.max(1,Math.round(total/340));
    el('rep-total').textContent=money(total);el('rep-orders').textContent=orders;el('rep-ticket').textContent=money(total/orders);
    const max=Math.max(...weekly)*1.28;
    el('rep-chart').innerHTML=weekly.map((v,i)=>`<div class="report-bar-item"><div class="bar" style="--height:${Math.max(3,100*v/max)}%" data-value="${money(v)}" title="Semana ${i+1}: ${money(v)}"></div><small>Sem. ${i+1}</small></div>`).join('');
    const weights=[.34,.29,.21,.16],maxRank=weights[0];
    el('rep-ranking').innerHTML=weights.map((w,i)=>`<div class="ranking-item"><span class="rank-number">${i+1}</span><span class="rank-content"><strong>${productNames[i]}</strong><span class="rank-line"><i style="width:${Math.round(w/maxRank*100)}%"></i></span></span><strong>${money(Math.round(total*w))}</strong></div>`).join('');
    rows=weekly.map((importe,i)=>({periodo:month,canal:channel==='todos'?'Todos':channel,semana:i+1,importe}));
    el('rep-chart').setAttribute('aria-label',weekly.map((v,i)=>`Semana ${i+1}: ${money(v)}`).join('; '));
  }
  function csvCell(value){return '"'+String(value).replace(/"/g,'""')+'"';}
  function download(){
    const csv='\uFEFF'+[['Periodo','Canal','Semana','Ventas MXN'],...rows.map(r=>[r.periodo,r.canal,r.semana,r.importe])].map(x=>x.map(csvCell).join(',')).join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='pacnolo_demo_ventas.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
    window.pacnoloToast?.('Reporte de ejemplo descargado.');
  }
  el('rep-month').addEventListener('change',render);el('rep-channel').addEventListener('change',render);el('rep-download').addEventListener('click',download);render();
};
