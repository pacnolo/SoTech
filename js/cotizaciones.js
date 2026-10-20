/* Cotización: solo abre WhatsApp con mensaje precargado; no envía datos a un servidor. */
window.pacnoloQuotes = function initQuotes() {
  const PHONE='525527632157';
  const el=id=>document.getElementById(id);
  const serviceEl=el('quote-service');
  document.querySelectorAll('[data-quote-service]').forEach(anchor=>{
    anchor.addEventListener('click',()=>{
      const value=anchor.getAttribute('data-quote-service');
      if([...serviceEl.options].some(option=>option.value===value)) serviceEl.value=value;
      else serviceEl.value='Proyecto personalizado';
    });
  });
  el('quote-form').addEventListener('submit',event=>{
    event.preventDefault();
    if(!event.currentTarget.reportValidity())return;
    const name=el('quote-name').value.trim(),business=el('quote-business').value.trim();
    const service=serviceEl.value,detail=el('quote-detail').value.trim(),timeline=el('quote-timeline').value;
    if(!name||!service||!detail)return;
    const message=[
      'Hola, PACNOLO Tech. Quiero solicitar una cotización.',
      '',`Nombre: ${name}`,
      `Negocio: ${business||'No especificado'}`,
      `Servicio: ${service}`,
      `Proyecto: ${detail}`,
      `Plazo estimado: ${timeline}`,
      '', '¿Podemos revisar el alcance y el costo?'
    ].join('\n');
    // El clic del usuario genera una nueva pestaña con el mensaje listo para enviar.
    const url=`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
    const link=document.createElement('a');
    link.href=url;
    link.target='_blank';
    link.rel='noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
};
