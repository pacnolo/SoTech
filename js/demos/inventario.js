/* Inventario: ejemplo interactivo en memoria, sin conexión con servidor. */
window.PacnoloDemos = window.PacnoloDemos || {};
window.PacnoloDemos.inventario = function initInventario() {
  const base = [
    {id:1,nombre:'Café molido 500 g',categoria:'Alimentos',precio:118,stock:24,min:8},
    {id:2,nombre:'Leche entera 1 L',categoria:'Lácteos',precio:29,stock:5,min:8},
    {id:3,nombre:'Azúcar 1 kg',categoria:'Alimentos',precio:38,stock:34,min:8},
    {id:4,nombre:'Agua embotellada',categoria:'Bebidas',precio:18,stock:6,min:10},
    {id:5,nombre:'Galletas surtidas',categoria:'Botanas',precio:42,stock:19,min:8}
  ];
  let products = base.map(p => ({...p}));
  let nextId = 6;
  const el = id => document.getElementById(id);
  const money = amount => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(amount);
  const escapeHtml = str => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const body=el('inv-body');
  function render(){
    el('inv-products').textContent=products.length;
    el('inv-units').textContent=products.reduce((sum,p)=>sum+p.stock,0);
    el('inv-value').textContent=money(products.reduce((sum,p)=>sum+p.stock*p.precio,0));
    el('inv-low').textContent=products.filter(p=>p.stock<=p.min).length;
    const query=el('inv-search').value.trim().toLocaleLowerCase('es-MX');
    const lowOnly=el('inv-only-low').checked;
    const filtered=products.filter(p=>(!query||p.nombre.toLocaleLowerCase('es-MX').includes(query)||p.categoria.toLocaleLowerCase('es-MX').includes(query))&&(!lowOnly||p.stock<=p.min));
    body.innerHTML=filtered.length?filtered.map(p=>`<tr><td class="product-name">${escapeHtml(p.nombre)}</td><td>${escapeHtml(p.categoria)}</td><td>${money(p.precio)}</td><td>${p.stock}</td><td><span class="stock-badge ${p.stock<=p.min?'low':''}">${p.stock<=p.min?'⚠ Stock bajo':'✓ Disponible'}</span></td><td><div class="qty-controls"><button type="button" data-id="${p.id}" data-delta="-1" aria-label="Restar una unidad a ${escapeHtml(p.nombre)}" ${p.stock===0?'disabled':''}>−</button><span>${p.stock}</span><button type="button" data-id="${p.id}" data-delta="1" aria-label="Sumar una unidad a ${escapeHtml(p.nombre)}">+</button></div></td></tr>`).join(''):'<tr><td colspan="6" class="empty-table">No hay productos que coincidan con el filtro.</td></tr>';
  }
  body.addEventListener('click',event=>{
    const btn=event.target.closest('button[data-id]');if(!btn)return;
    const product=products.find(p=>p.id===Number(btn.dataset.id));if(!product)return;
    product.stock=Math.max(0,product.stock+Number(btn.dataset.delta));render();
  });
  el('inv-search').addEventListener('input',render);
  el('inv-only-low').addEventListener('change',render);
  el('inv-form').addEventListener('submit',event=>{
    event.preventDefault();
    const nombre=el('inv-name').value.trim(),cantidad=Number(el('inv-qty').value),precio=Number(el('inv-price').value);
    if(!nombre||!Number.isInteger(cantidad)||cantidad<1||cantidad>10000||!Number.isFinite(precio)||precio<0||precio>1000000)return;
    products.push({id:nextId++,nombre,categoria:'Nuevo',precio,stock:cantidad,min:8});
    el('inv-form').reset();el('inv-qty').value='10';el('inv-price').value='35';
    el('inv-search').value='';el('inv-only-low').checked=false;render();
    window.pacnoloToast?.('Producto agregado a la demostración.');
  });
  el('inv-reset').addEventListener('click',()=>{
    products=base.map(p=>({...p}));nextId=6;
    el('inv-search').value='';el('inv-only-low').checked=false;el('inv-form').reset();render();
    window.pacnoloToast?.('Inventario de ejemplo reiniciado.');
  });
  render();
};
