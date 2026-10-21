/* Pacno Tech — navegación, apariencia y orquestación de demos. */
(function(){
  'use strict';
  const body=document.body;
  const year=document.getElementById('footer-year');year.textContent=String(new Date().getFullYear());
  let toastTimeout;
  window.pacnoloToast=function(message){
    const toast=document.getElementById('toast');
    toast.textContent=message;toast.classList.add('show');
    clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('show'),3100);
  };
  const themeToggle=document.getElementById('theme-toggle');
  let savedTheme='light';
  try{savedTheme=localStorage.getItem('pacnolo-theme')||'light';}catch(error){}
  function setTheme(theme){
    if(theme==='dark')body.dataset.theme='dark';else delete body.dataset.theme;
    themeToggle.setAttribute('aria-label',theme==='dark'?'Activar modo claro':'Activar modo oscuro');
    themeToggle.setAttribute('title',theme==='dark'?'Cambiar a modo claro':'Cambiar a modo oscuro');
    themeToggle.innerHTML=theme==='dark'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.5 8.5 0 1 0 20.2 15.2Z"/></svg>';
  }
  setTheme(savedTheme);
  themeToggle.addEventListener('click',()=>{
    const next=body.dataset.theme==='dark'?'light':'dark';setTheme(next);
    try{localStorage.setItem('pacnolo-theme',next);}catch(error){}
  });
  const menuButton=document.getElementById('menu-toggle'),menu=document.getElementById('mobile-menu');
  function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Abrir menú');}
  menuButton.addEventListener('click',()=>{
    const open=menu.hidden;
    menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');
  });
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  window.addEventListener('resize',()=>{if(window.innerWidth>1020)closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  // Las secciones se abren por su título, y también al seguir un vínculo del menú.
  function openSectionForHash(hash){
    if(!hash||hash[0]!=='#')return;
    const target=document.getElementById(hash.slice(1));
    if(!target)return;
    const fold=target.closest('.section-fold')||target.querySelector('.section-fold');
    if(fold&&!fold.open)fold.open=true;
  }
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>openSectionForHash(a.getAttribute('href'))));
  window.addEventListener('hashchange',()=>openSectionForHash(location.hash));
  openSectionForHash(location.hash);
  // Navegación compacta: solo una sección principal expandida al mismo tiempo.
  // Los detalles interiores (servicios, FAQ, procesos) mantienen su funcionamiento.
  const mainFolds=[...document.querySelectorAll('.main-section-fold')];
  mainFolds.forEach(current=>current.addEventListener('toggle',()=>{
    if(!current.open)return;
    mainFolds.forEach(other=>{if(other!==current&&other.open)other.open=false;});
  }));
  // Acordeones: al abrir un elemento cerramos sus hermanos del mismo grupo.
  // Se usa <details>/<summary> para conservar el funcionamiento sin JavaScript.
  document.querySelectorAll('[data-accordion-group]').forEach(group=>{
    const details=[...group.querySelectorAll(':scope > details, :scope > .service-accordion > details')];
    details.forEach(item=>item.addEventListener('toggle',()=>{
      if(!item.open)return;
      details.forEach(other=>{if(other!==item&&other.open)other.open=false;});
    }));
  });
  // Vista previa dinámica de cada servicio y videos aportados por el propietario del sitio.
  (function setupServicePreviews(){
    const section=document.getElementById('fold-servicios');
    if(!section)return;
    const items=[...section.querySelectorAll('.service-accordion-item')];
    const title=document.getElementById('services-title-interior');
    const description=document.getElementById('service-preview-description');
    const video=document.getElementById('service-preview-video');
    const videoChoices=document.getElementById('service-video-choices');
    const illustration=document.getElementById('service-preview-illustration');
    const illustrationIcon=document.getElementById('service-illustration-icon');
    const illustrationScene=document.getElementById('service-illustration-scene');
    const caption=document.getElementById('service-illustration-caption');
    const meta=document.getElementById('service-preview-meta');
    const chips=document.getElementById('service-preview-chips');
    const price=document.getElementById('service-preview-price');
    const quote=document.getElementById('service-preview-quote');
    if(!title||!description||!video||!illustration||!meta||!quote)return;
    const previews=[
      {headline:'Hojas de cálculo que <em>trabajan por ti.</em>',caption:'Reportes y automatización',media:'media/ReporteAutomatizacion.mp4',poster:'media/ReporteAutomatizacion-poster.jpg'},
      {headline:'Organiza tu negocio <em>en un solo lugar.</em>',caption:'Inventarios, pedidos y controles',media:'media/Organizacion.mp4',poster:'media/Organizacion-poster.jpg'},
      {headline:'Decisiones más claras con <em>datos visibles.</em>',caption:'Indicadores y proyecciones',media:'media/Graficas.mp4',poster:'media/Graficas-poster.jpg'},
      {headline:'Dale presencia digital <em>a tus ideas.</em>',caption:'Sitios web y portales',media:'media/pagina web.mp4',poster:'media/pagina-web-poster.jpg'},
      {headline:'Tu información, <em>mejor organizada.</em>',caption:'Bases de datos y Access'},
      {headline:'Tecnología para una atención <em>más organizada.</em>',caption:'Historia clínica, citas y resultados',media:'media/HistoriaClinica.mp4',poster:'media/HistoriaClinica-poster.jpg'},
      {headline:'Presenta tus ideas de forma <em>profesional.</em>',caption:'Presentaciones y proyectos escolares',media:'media/ProyectosEscolares.mp4',poster:'media/ProyectosEscolares-poster.jpg'},
      {headline:'Una solución única para <em>tu proyecto.</em>',caption:'Diseñado a tu medida'}
    ];
    // Vistas distintas de cada servicio sin depender de videos inexistentes.
    // Los videos se vinculan a cada servicio; inventarios conserva el selector de dos demostraciones.
    const scenes={
      2:`<div class="scene-board" aria-hidden="true"><div class="scene-board-top"><i></i><i></i><i></i><b>RESULTADOS</b></div><div class="scene-bars"><span style="--h:45%"></span><span style="--h:66%"></span><span style="--h:56%"></span><span style="--h:83%"></span><span style="--h:100%"></span></div><div class="scene-trend">↗ +24%</div></div>`,
      3:`<div class="scene-browser" aria-hidden="true"><div class="scene-browser-top"><i></i><i></i><i></i><span>tusitio.mx</span></div><div class="scene-browser-hero"><b>Tu negocio online</b><i></i><i></i></div><div class="scene-browser-cards"><span></span><span></span><span></span></div></div>`,
      4:`<div class="scene-db" aria-hidden="true"><span class="scene-db-node">CLIENTES</span><div class="scene-db-cyl"><i></i><b>DATOS</b><i></i></div><span class="scene-db-node">REPORTES</span></div>`,
      7:`<div class="scene-custom" aria-hidden="true"><div class="scene-custom-line"><i></i><i></i><i></i></div><div class="scene-custom-core">✦</div><div class="scene-custom-tags"><span>IDEA</span><span>DISEÑO</span><span>SOLUCIÓN</span></div></div>`
    };
    let selection=-1;
    const inventoryDemos={
      organizacion:{src:'media/Organizacion.mp4',poster:'media/Organizacion-poster.jpg'},
      citas:{src:'media/Citas.mp4',poster:'media/Citas-poster.jpg'}
    };
    function setInventoryDemo(name){
      const chosen=inventoryDemos[name];if(!chosen || selection!==1)return;
      const already=video.getAttribute('src')===chosen.src;
      videoChoices?.querySelectorAll('[data-demo]').forEach(btn=>btn.classList.toggle('is-current',btn.dataset.demo===name));
      if(already)return;
      video.pause();video.src=chosen.src;video.poster=chosen.poster;video.load();
      if(section.open)video.play().catch(()=>{});
    }
    videoChoices?.querySelectorAll('[data-demo]').forEach(btn=>btn.addEventListener('click',()=>setInventoryDemo(btn.dataset.demo)));
    function stopVideo(){
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.hidden=true;
    }
    function selectService(i){
      if(i===selection)return;
      const item=items[i],info=previews[i];
      if(!item||!info)return;
      selection=i;
      items.forEach((node,n)=>{
        node.classList.toggle('is-service-selected',n===i);
        if(n!==i&&node.open)node.open=false;
      });
      const bodyText=item.querySelector('.service-accordion-body>p');
      const sourcePrice=item.querySelector('.service-price');
      const sourceQuote=item.querySelector('[data-quote-service]');
      title.innerHTML=info.headline;
      description.textContent=bodyText?.textContent?.trim()||'Diseñamos soluciones prácticas que se adaptan a tu proyecto.';
      caption.textContent=info.caption;
      illustrationIcon.innerHTML=item.querySelector('.service-accordion-symbol')?.innerHTML||'';
      illustration.dataset.scene=String(i);
      if(illustrationScene)illustrationScene.innerHTML=scenes[i]||'';
      chips.replaceChildren();
      item.querySelectorAll('.service-usecases span').forEach(x=>{
        const tag=document.createElement('span');tag.textContent=x.textContent;chips.appendChild(tag);
      });
      price.replaceChildren();
      if(sourcePrice)price.textContent=sourcePrice.textContent.replace(/\s+/g,' ').trim();
      meta.hidden=false;
      quote.dataset.quoteService=sourceQuote?.dataset.quoteService||'Proyecto personalizado';
      quote.firstChild.textContent='Cotizar este servicio ';
      stopVideo();
      if(videoChoices)videoChoices.hidden=i!==1;
      if(i===1)videoChoices?.querySelectorAll('[data-demo]').forEach(btn=>btn.classList.toggle('is-current',btn.dataset.demo==='organizacion'));
      if(info.media){
        video.src=info.media;
        video.poster=info.poster;
        video.hidden=false;
        illustration.hidden=true;
        if(section.open)video.play().catch(()=>{ /* El usuario puede reproducir desde los controles. */ });
      }else{
        illustration.hidden=false;
      }
      // En teléfonos volvemos al comienzo del banner para mostrar el recurso recién seleccionado.
      if(section.open && window.innerWidth<=720){
        const view=section.querySelector(':scope > .section-fold-content');
        view?.scrollTo({top:0,behavior:'smooth'});
      }
    }
    items.forEach((item,i)=>{
      item.addEventListener('toggle',()=>{if(item.open)selectService(i);});
      item.querySelector('summary')?.addEventListener('click',()=>{
        // Al cerrar la tarjeta seleccionada, mantenemos la vista previa hasta elegir otra.
        if(selection!==i||!item.open)requestAnimationFrame(()=>selectService(i));
      });
    });
    section.addEventListener('toggle',()=>{
      if(!section.open){video.pause();}
      else if(selection>=0&&!video.hidden)video.play().catch(()=>{});
    });
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden)video.pause();
      else if(section.open&&!video.hidden)video.play().catch(()=>{});
    });
  })();

  // CHISPA: reacciona a las secciones sin bloquear ninguna función del portal.
  const chispaStage=document.getElementById('chispa-stage');
  const chispaButton=document.getElementById('chispa-touch');
  const chispaBubble=document.getElementById('chispa-bubble');
  if(chispaStage&&chispaButton&&chispaBubble){

    // Un segundo Chispa acompaña al visitante cuando la original sale de la pantalla.
    // El SVG se reutiliza con identificadores únicos para evitar conflictos de degradados.
    const companion=document.createElement('aside');
    companion.id='chispa-companion';
    companion.className='chispa-companion is-offscreen';
    companion.setAttribute('aria-label','Chispa, asistente visual de Pacno Tech');
    companion.innerHTML=`
      <div class="chispa-dock">
        <div class="chispa-dock-aura" aria-hidden="true"></div>
        <div class="chispa-dock-speech" id="chispa-dock-speech">¡Hola! Soy Chispa ✨</div>
        <button type="button" class="chispa-dock-face" aria-label="Saludar a Chispa" title="Saludar a Chispa"></button>
      </div>`;
    const art=chispaButton.querySelector('svg').cloneNode(true);
    art.setAttribute('aria-hidden','true');
    art.removeAttribute('aria-label');
    const svgIds=new Map();
    art.querySelectorAll('[id]').forEach(el=>{
      const previous=el.id, next='global-'+previous;
      svgIds.set(previous,next);
      el.id=next;
    });
    art.querySelectorAll('*').forEach(el=>{
      for(const attr of [...el.attributes]){
        let value=attr.value;
        for(const [previous,next] of svgIds){
          value=value.split('url(#'+previous+')').join('url(#'+next+')');
          if(value==='#'+previous)value='#'+next;
        }
        if(value!==attr.value)el.setAttribute(attr.name,value);
      }
    });
    companion.querySelector('.chispa-dock-face').appendChild(art);
    document.body.appendChild(companion);

    const speech=companion.querySelector('#chispa-dock-speech');
    speech.setAttribute('role','status');
    speech.setAttribute('aria-live','polite');
    const dockFace=companion.querySelector('.chispa-dock-face');
    const heroArt=chispaStage;
    let speechTimer;
        function showCompanionMessage(message,react=false){
      if(!message)return;
      speech.textContent=message;
      companion.classList.add('has-message');
      clearTimeout(speechTimer);
      companion.classList.remove('is-reacting');
      if(react&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        void companion.offsetWidth;
        companion.classList.add('is-reacting');
      }
      speechTimer=setTimeout(()=>{
        companion.classList.remove('is-reacting');
        companion.classList.remove('has-message');
      },4100);
    }
    dockFace.addEventListener('click',()=>showCompanionMessage('¡Hola! Puedo mostrarte servicios, ejemplos y formas de comenzar.',true));
    // No tapamos el formulario mientras una persona está escribiendo.
    const quoteForm=document.getElementById('quote-form');
    if(quoteForm){
      quoteForm.addEventListener('focusin',()=>companion.classList.add('is-form-active'));
      quoteForm.addEventListener('focusout',()=>{
        requestAnimationFrame(()=>{
          if(!quoteForm.contains(document.activeElement))companion.classList.remove('is-form-active');
        });
      });
    }
    function updateVisibility(isHeroVisible){
      const hadBeenHidden=companion.classList.contains('is-offscreen');
      companion.classList.toggle('is-offscreen',isHeroVisible);
      if(!isHeroVisible&&hadBeenHidden)showCompanionMessage('¡Te acompaño por aquí! ✨');
    }
    // Solo aparece al salir del recuadro original: nunca dos Chispas a la vez.
    if('IntersectionObserver' in window){
      const heroObserver=new IntersectionObserver(entries=>{
        updateVisibility(entries[0].isIntersecting);
      },{threshold:.10});
      heroObserver.observe(heroArt);
      // En móvil, las zonas con formularios y controles reciben prioridad.
      const busyZones=new Map();
      function refreshBusyZones(){
        // Una sección cerrada no tiene campos activos y no debe empequeñecer a Chispa.
        const busy=[...busyZones].some(([id,visible])=>{
          if(!visible)return false;
          const section=document.getElementById(id);
          return !!section?.querySelector('.main-section-fold')?.open;
        });
        companion.classList.toggle('is-ui-busy',busy);
      }
      const busyObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>busyZones.set(entry.target.id,entry.isIntersecting));
        refreshBusyZones();
      },{rootMargin:'-12% 0px -15% 0px',threshold:0});
      ['demos','contacto'].forEach(id=>{
        const zone=document.getElementById(id);
        if(zone){
          busyObserver.observe(zone);
          zone.querySelector('.main-section-fold')?.addEventListener('toggle',refreshBusyZones);
        }
      });
      // Detecta secciones durante la navegación, además de los clics en acordeones.
      const currentNames={servicios:'Inventarios, tableros, hojas de cálculo y más.',demos:'Inventarios, automatización, tableros y portales a tu medida.',paquetes:'Hay opciones según el tamaño de tu proyecto.',proceso:'Te explicamos cómo desarrollamos cada solución.',nosotros:'Convertimos tus ideas en herramientas prácticas.',contacto:'Cuéntanos tu idea y recibe orientación.'};
      const sectionsObserver=new IntersectionObserver(entries=>{
        const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
        if(visible.length){
          const name=visible[0].target.id;
          if(currentNames[name])showCompanionMessage(currentNames[name]);
        }
      },{rootMargin:'-25% 0px -53% 0px',threshold:0});
      Object.keys(currentNames).forEach(id=>{
        const element=document.getElementById(id);if(element)sectionsObserver.observe(element);
      });
    }else{
      const handleScroll=()=>updateVisibility(heroArt.getBoundingClientRect().bottom>0);
      window.addEventListener('scroll',handleScroll,{passive:true});
      handleScroll();
    }
    // Los clics y los enlaces conservan las funciones originales.
    document.querySelectorAll('.demo-tab').forEach(tab=>tab.addEventListener('click',()=>{
      showCompanionMessage('Prueba este ejemplo; funciona con datos ficticios.',true);
    }));
    document.querySelectorAll('#quote-form button[type="submit"]').forEach(button=>button.addEventListener('click',()=>{
      showCompanionMessage('¡Vamos a crear algo juntos! ✨',true);
    }));

    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    let chispaReset;
    function chispaReact(message){
      chispaBubble.textContent=message;
      showCompanionMessage(message,true);
      clearTimeout(chispaReset);
      chispaStage.classList.remove('is-reacting');
      if(!reducedMotion.matches){
        void chispaStage.offsetWidth; // Reinicia solo la animación CSS elegida.
        chispaStage.classList.add('is-reacting');
      }
      chispaReset=setTimeout(()=>{
        chispaStage.classList.remove('is-reacting');
        chispaBubble.textContent='¡Hola! Soy Chispa ✨';
      },3200);
    }
    chispaButton.addEventListener('click',()=>chispaReact('¡Me alegra verte! ✨'));
    const sectionMessages={servicios:'Control de inventario, Access, presentaciones y proyectos escolares.',demos:'Conoce lo que puede incluir tu proyecto.',paquetes:'Cada proyecto se cotiza según sus necesidades.',proceso:'De tu idea a una herramienta funcionando.',nosotros:'Somos Pacno Tech: soluciones a tu medida.',contacto:'Escríbenos y conversemos sobre tu proyecto.'};
    document.querySelectorAll('.main-section-fold').forEach(section=>section.addEventListener('toggle',()=>{
      if(!section.open)return;
      const name=section.closest('section')?.id||'';
      if(sectionMessages[name])chispaReact(sectionMessages[name]);
    }));
    document.querySelectorAll('.service-accordion-item').forEach(item=>item.addEventListener('toggle',()=>{
      if(!item.open)return;
      const title=item.querySelector('.service-accordion-label strong')?.textContent?.trim();
      if(title)chispaReact('¡'+title+'! ✨');
    }));
    document.querySelectorAll('[data-quote-service]').forEach(link=>link.addEventListener('click',()=>chispaReact('¡Vamos a crear algo!')));
  }
  if(typeof window.pacnoloQuotes==='function')window.pacnoloQuotes();

  // Matriz: banner real de 75% en una ventana independiente, no en el flujo de la página.
  const overviewMatrix=document.getElementById('overview-matrix');
  const overviewModal=document.getElementById('overview-modal');
  const summaryCards = {
    servicios:{title:'Servicios para tu negocio',kicker:'SERVICIOS PRINCIPALES',text:'Creamos soluciones prácticas para organizar tareas, ahorrar tiempo y dar mejor seguimiento a la información de tu negocio o proyecto.',points:['Inventarios, controles y seguimiento de entradas y salidas.','Hojas de cálculo, macros, reportes y formatos automatizados.','Páginas web, portales y formularios adaptados a tu necesidad.','Bases de datos, catálogos y consultas para tener mejor control.'],link:'#servicios'},
    proceso:{title:'De tu idea a una solución real',kicker:'CÓMO TRABAJAMOS',text:'Primero entendemos el problema, definimos el alcance y desarrollamos una solución funcional contigo.',points:['Escuchamos tu idea y revisamos el proceso actual.','Definimos las funciones, el alcance y los tiempos.','Desarrollamos y validamos avances contigo.','Entregamos y explicamos cómo usar la solución.'],link:'#proceso'},
    paquetes:{title:'Opciones y precios',kicker:'REFERENCIAS FLEXIBLES',text:'Los precios son puntos de partida para dimensionar tu proyecto, no paquetes rígidos.',points:['Soluciones sencillas para necesidades puntuales.','Opciones de control, reportes y automatización.','Sistemas personalizados para procesos completos.','La propuesta final depende del alcance acordado.'],link:'#paquetes'},
    alcance:{title:'Alcance de nuestras soluciones',kicker:'POSIBILIDADES DE DESARROLLO',text:'Te mostramos soluciones que pueden adaptarse a tu negocio y sus necesidades.',points:['Sistemas administrativos, inventarios y seguimiento.','Tableros ejecutivos, proyecciones y reportes.','Portales web, catálogos y formularios.','Procesos automatizados y herramientas a medida.'],link:'#demos'},
    nosotros:{title:'Conoce Pacno Tech',kicker:'QUIÉNES SOMOS',text:'Diseñamos herramientas claras y útiles para negocios, profesionales y proyectos.',points:['Trabajamos según tu forma de operar.','Priorizamos soluciones funcionales y prácticas.','Explicamos cada etapa de manera sencilla.','Evitamos funciones innecesarias.'],link:'#nosotros'},
    faq:{title:'Preguntas frecuentes',kicker:'RESOLVEMOS TUS DUDAS',text:'Aclara las preguntas más habituales sobre los proyectos antes de comenzar.',points:['No necesitas saber programación.','Los tiempos dependen del alcance.','Los precios son referencias iniciales.','Los cambios se acuerdan antes de implementarlos.'],link:'#preguntas'},
    contacto:{title:'Cotiza tu proyecto',kicker:'PLATIQUEMOS',text:'Cuéntanos qué necesitas y conoce la forma en que podemos ayudarte.',points:['Describe tu idea o proceso actual.','Recibe orientación directa por WhatsApp.','Definimos alcances antes de cotizar.','El formulario prepara tu mensaje para enviarlo.'],link:'#contacto'},
    'explora-redes':{title:'Explora',kicker:'REDES Y PROYECTOS',text:'Este espacio será el punto de partida para mostrar nuestras redes y nuevos proyectos.',points:['TikTok, Instagram y Facebook en preparación.','Proyectos terminados se enlazarán más adelante.','Ejemplos reales, conforme se autorice su publicación.','Una muestra de lo que podemos construir.'],link:'#pie-redes'}
  };
  let overviewTrigger=null;
  function closeOverview(restoreFocus=true){
    if(!overviewModal || overviewModal.hidden)return;
    overviewModal.hidden=true;
    overviewModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('overview-modal-open');
    overviewMatrix?.querySelectorAll('.overview-card').forEach(card=>card.classList.remove('is-active'));
    if(restoreFocus && overviewTrigger?.isConnected)overviewTrigger.focus({preventScroll:true});
  }
  if(overviewMatrix && overviewModal){
    const title=document.getElementById('overview-banner-title');
    const kicker=document.getElementById('overview-banner-kicker');
    const intro=document.getElementById('overview-banner-text');
    const points=document.getElementById('overview-banner-points');
    const destination=document.getElementById('overview-banner-link');
    const close=document.getElementById('overview-banner-close');
    function openOverview(key,trigger){
      const info=summaryCards[key];if(!info)return;
      overviewTrigger=trigger;
      title.textContent=info.title;kicker.textContent=info.kicker;intro.textContent=info.text;
      points.replaceChildren(...info.points.map(point=>{const li=document.createElement('li');li.textContent=point;return li;}));
      destination.href=info.link;
      overviewMatrix.querySelectorAll('.overview-card').forEach(card=>card.classList.toggle('is-active',card===trigger));
      // No dejamos simultáneamente abierta otra sección.
      document.querySelectorAll('.main-section-fold[open]').forEach(f=>f.open=false);
      overviewModal.hidden=false;
      overviewModal.setAttribute('aria-hidden','false');
      document.body.classList.add('overview-modal-open');
      close.focus({preventScroll:true});
    }
    overviewMatrix.querySelectorAll('.overview-card').forEach(card=>card.addEventListener('click',()=>openOverview(card.dataset.key,card)));
    close.addEventListener('click',()=>closeOverview());
    overviewModal.querySelector('[data-overview-close]')?.addEventListener('click',()=>closeOverview());
    overviewModal.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>closeOverview(false)));
  }

  // Los siete apartados mantienen su DOM, estados de formulario, eventos y contenido.
  // Solo cambiamos la presentación del <details> abierto por un modal del 75%.
  const sectionBackdrop=document.getElementById('section-modal-backdrop');
  const mainSectionFolds=[...document.querySelectorAll('.main-section-fold')];
  let lastMainTrigger=null;
  function updateSectionModal(){
    const open=mainSectionFolds.find(f=>f.open);
    const active=!!open;
    document.body.classList.toggle('section-modal-open',active);
    if(sectionBackdrop)sectionBackdrop.hidden=!active;
    if(open){
      open.classList.add('section-modal-active');
      open.querySelector('.section-modal-close')?.focus({preventScroll:true});
    }else{
      mainSectionFolds.forEach(f=>f.classList.remove('section-modal-active'));
    }
  }
  mainSectionFolds.forEach(fold=>{
    const button=document.createElement('button');button.type='button';
    button.className='section-modal-close';button.textContent='×';
    button.setAttribute('aria-label','Cerrar '+(fold.querySelector('.section-fold-summary strong')?.textContent||'apartado'));
    const content=fold.querySelector(':scope > .section-fold-content');
    if(content)fold.insertBefore(button,content);else fold.appendChild(button);
    const summary=fold.querySelector(':scope > summary');
    summary?.addEventListener('click',()=>{lastMainTrigger=summary;});
    button.addEventListener('click',()=>{fold.open=false;lastMainTrigger?.focus({preventScroll:true});});
    fold.addEventListener('toggle',()=>{
      if(fold.open){
        closeOverview(false);
        mainSectionFolds.forEach(other=>{if(other!==fold&&other.open)other.open=false;});
      }
      requestAnimationFrame(updateSectionModal);
    });
  });
  sectionBackdrop?.addEventListener('click',()=>{
    mainSectionFolds.forEach(f=>f.open=false);
    lastMainTrigger?.focus({preventScroll:true});
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      if(overviewModal && !overviewModal.hidden)closeOverview();
      else if(mainSectionFolds.some(f=>f.open)){
        mainSectionFolds.forEach(f=>f.open=false);
        lastMainTrigger?.focus({preventScroll:true});
      }
    }
    // Mantiene el teclado dentro de la ventana activa (accesibilidad).
    if(event.key!=='Tab')return;
    const container=(overviewModal&&!overviewModal.hidden)?overviewModal:mainSectionFolds.find(f=>f.open);
    if(!container)return;
    const nodes=[...container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')]
      .filter(n=>n.getClientRects().length && getComputedStyle(n).visibility!=='hidden');
    if(!nodes.length)return;
    const first=nodes[0],last=nodes[nodes.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  updateSectionModal();

})();
