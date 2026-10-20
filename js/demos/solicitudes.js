/* Tablero kanban de solicitudes, datos almacenados solo en memoria. */
window.PacnoloDemos = window.PacnoloDemos || {};
window.PacnoloDemos.solicitudes = function initSolicitudes() {
  const initial=[
    {id:101,title:'Actualizar catálogo de productos',status:'registrada'},
    {id:102,title:'Revisar inventario mensual',status:'progreso'},
    {id:103,title:'Generar reporte de ventas',status:'terminada'},
    {id:104,title:'Cotizar nuevos materiales',status:'registrada'},
    {id:105,title:'Preparar propuesta comercial',status:'progreso'}
  ];
  let requests=initial.map(r=>({...r})),nextId=106;
  const el=id=>document.getElementById(id);
  const escapeHtml=str=>String(str).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const states=[['registrada','Registradas'],['progreso','En proceso'],['terminada','Terminadas']];
  function render(){
    el('req-registered').textContent=requests.filter(r=>r.status==='registrada').length;
    el('req-progress').textContent=requests.filter(r=>r.status==='progreso').length;
    el('req-done').textContent=requests.filter(r=>r.status==='terminada').length;
    el('req-board').innerHTML=states.map(([status,title])=>{
      const list=requests.filter(r=>r.status===status);
      const cards=list.map(r=>`<article class="kanban-card"><strong>${escapeHtml(r.title)}</strong><small>#REQ-${r.id}</small><label><span class="sr-only">Cambiar estado de ${escapeHtml(r.title)}</span><select data-id="${r.id}" aria-label="Cambiar estado de ${escapeHtml(r.title)}">${states.map(([s,name])=>`<option value="${s}" ${r.status===s?'selected':''}>${name}</option>`).join('')}</select></label></article>`).join('');
      return `<div class="kanban-column" data-status="${status}"><div class="kanban-heading"><span><i class="kanban-dot"></i>${title}</span><span>${list.length}</span></div>${cards||'<div class="kanban-empty">Sin solicitudes en esta etapa</div>'}</div>`;
    }).join('');
  }
  el('req-board').addEventListener('change',event=>{
    if(!event.target.matches('select[data-id]'))return;
    const req=requests.find(r=>r.id===Number(event.target.dataset.id));
    if(req&&states.some(s=>s[0]===event.target.value)){req.status=event.target.value;render();window.pacnoloToast?.('Estado actualizado.');}
  });
  el('req-form').addEventListener('submit',event=>{
    event.preventDefault();const title=el('req-title').value.trim();if(!title)return;
    requests.unshift({id:nextId++,title,status:'registrada'});el('req-form').reset();render();window.pacnoloToast?.('Solicitud de prueba registrada.');
  });
  el('req-reset').addEventListener('click',()=>{requests=initial.map(r=>({...r}));nextId=106;el('req-form').reset();render();window.pacnoloToast?.('Tablero de ejemplo reiniciado.');});
  render();
};
