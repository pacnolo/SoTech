/* PACNOLO Tech — navegación, apariencia y orquestación de demos. */
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
  // Las demos se instancian una sola vez para conservar su estado al cambiar de pestaña.
  const demos=window.PacnoloDemos||{};
  Object.entries(demos).forEach(([name,init])=>{
    try{init();}catch(error){console.error(`No se pudo iniciar la demo ${name}`,error);}
  });
  const tabs=[...document.querySelectorAll('.demo-tab')];
  function activateTab(tab,focus){
    tabs.forEach(t=>{
      const active=t===tab;
      t.classList.toggle('active',active);
      t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;
      document.getElementById('panel-'+t.dataset.demo).hidden=!active;
    });
    if(focus)tab.focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>activateTab(tab,false));
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      let next=index;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      activateTab(tabs[next],true);
    });
  });
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
    companion.dataset.state='expanded';
    companion.setAttribute('aria-label','Chispa, asistente visual de PACNOLO Tech');
    companion.innerHTML=`
      <div class="chispa-dock">
        <div class="chispa-dock-tools" role="group" aria-label="Controles de Chispa">
          <button type="button" class="chispa-dock-tool" data-chispa-action="motion" aria-label="Pausar animación de Chispa" title="Pausar animación">Ⅱ</button>
          <button type="button" class="chispa-dock-tool" data-chispa-action="minimize" aria-label="Minimizar a Chispa" title="Minimizar">−</button>
          <button type="button" class="chispa-dock-tool" data-chispa-action="close" aria-label="Ocultar temporalmente a Chispa" title="Ocultar temporalmente">×</button>
        </div>
        <div class="chispa-dock-speech" id="chispa-dock-speech">¡Hola! Soy Chispa ✨</div>
        <button type="button" class="chispa-dock-face" aria-label="Saludar a Chispa" title="Saludar a Chispa"></button>
      </div>
      <button class="chispa-dock-mini" type="button" aria-label="Expandir a Chispa" title="Expandir a Chispa"><span aria-hidden="true">✦</span> Chispa</button>
      <button class="chispa-dock-restore" type="button" aria-label="Mostrar de nuevo a Chispa" title="Mostrar a Chispa"><span aria-hidden="true">✦</span> Mostrar Chispa</button>`;
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
    const dockFace=companion.querySelector('.chispa-dock-face');
    const mini=companion.querySelector('.chispa-dock-mini');
    const restore=companion.querySelector('.chispa-dock-restore');
    const motion=companion.querySelector('[data-chispa-action="motion"]');
    const heroArt=chispaStage;
    let speechTimer;
    let companionMessage='¡Hola! Soy Chispa ✨';
    let paused=false;
    try{paused=localStorage.getItem('pacnolo-chispa-paused')==='yes';}catch(error){}
    function applyMotion(){
      body.classList.toggle('chispa-motion-paused',paused);
      motion.textContent=paused?'▶':'Ⅱ';
      motion.setAttribute('aria-label',paused?'Reanudar animación de Chispa':'Pausar animación de Chispa');
      motion.title=paused?'Reanudar animación':'Pausar animación';
    }
    applyMotion();
    const setState=state=>{companion.dataset.state=state;};
    function showCompanionMessage(message,react=false){
      if(!message)return;
      companionMessage=message;
      speech.textContent=message;
      companion.classList.add('has-message');
      clearTimeout(speechTimer);
      companion.classList.remove('is-reacting');
      if(react&&!paused&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        void companion.offsetWidth;
        companion.classList.add('is-reacting');
      }
      speechTimer=setTimeout(()=>{
        companion.classList.remove('is-reacting');
        companion.classList.remove('has-message');
      },4000);
    }
    dockFace.addEventListener('click',()=>showCompanionMessage('¡Qué gusto verte! ✨',true));
    motion.addEventListener('click',()=>{
      paused=!paused;applyMotion();
      try{localStorage.setItem('pacnolo-chispa-paused',paused?'yes':'no');}catch(error){}
    });
    companion.querySelector('[data-chispa-action="minimize"]').addEventListener('click',()=>{
      setState('mini');mini.focus();
    });
    companion.querySelector('[data-chispa-action="close"]').addEventListener('click',()=>{
      setState('closed');restore.focus();
    });
    mini.addEventListener('click',()=>{setState('expanded');dockFace.focus();});
    restore.addEventListener('click',()=>{setState('expanded');dockFace.focus();});
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
      const busyObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>busyZones.set(entry.target.id,entry.isIntersecting));
        companion.classList.toggle('is-ui-busy',[...busyZones.values()].some(Boolean));
      },{rootMargin:'-12% 0px -15% 0px',threshold:0});
      ['demos','contacto'].forEach(id=>{
        const zone=document.getElementById(id);if(zone)busyObserver.observe(zone);
      });
      // Detecta secciones durante la navegación, además de los clics en acordeones.
      const currentNames={servicios:'¡Explora nuestros servicios!',demos:'¡Prueba nuestras demos!',paquetes:'¡Mira los paquetes!',proceso:'¡Así trabajamos!',nosotros:'¡Conoce PACNOLO Tech!',contacto:'¡Cuéntanos tu proyecto!'};
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
      showCompanionMessage('¡Mira esta demostración! ✨',true);
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
    const sectionMessages={servicios:'¡Conoce nuestros servicios!',demos:'¡Prueba las demostraciones!',paquetes:'¡Hay una solución para ti!',proceso:'¡Te acompañamos!',nosotros:'¡Somos PACNOLO Tech!',contacto:'¡Cuéntanos tu idea!'};
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
})();
