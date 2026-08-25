(function(){
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

  const GROUPS = ['Buenos días','Salados','Para la tarde','Experiencias'];
  const TINT = {'Buenos días':'manana','Salados':'salado','Para la tarde':'tarde','Experiencias':'experiencia'};
  const ICONS = ['coffee','v60','chemex','espresso','flatwhite','coldbrew','toast','sandwich','cupping'];

  let items = [];
  let editingId = null;

  // Vista de muestra usada solo si Supabase todavía no está conectado.
  function demoMenu(){
    return [
      {id:'d1', name:'V60 grano dominicano', category:'Buenos días', icon:'v60', price:250, description:'Extracción por goteo, single origin, notas frutales.', featured:true},
      {id:'d2', name:'Chemex para dos', category:'Buenos días', icon:'chemex', price:420, description:'Inmersión-goteo, taza limpia, ideal para compartir.', featured:false},
      {id:'d3', name:'Espresso doble origen', category:'Buenos días', icon:'espresso', price:150, description:'Cuerpo denso, notas a chocolate y frutos secos.', featured:false},
      {id:'d4', name:'Tostada de aguacate', category:'Salados', icon:'toast', price:320, description:'Masa madre, aguacate, semillas y limón.', featured:false},
      {id:'d5', name:'Sandwich de la barra', category:'Salados', icon:'sandwich', price:380, description:'Jamón serrano, manchego y rúcula.', featured:false},
      {id:'d6', name:'Flat white de autor', category:'Para la tarde', icon:'flatwhite', price:210, description:'Doble shot, leche microespumada, textura sedosa.', featured:true},
      {id:'d7', name:'Cold brew 24h', category:'Para la tarde', icon:'coldbrew', price:220, description:'Reposado 24 horas, baja acidez, cuerpo suave.', featured:false},
      {id:'d8', name:'Cata guiada', category:'Experiencias', icon:'cupping', price:650, description:'Tres orígenes dominicanos, guiada por la barra.', featured:false},
    ];
  }

  function money(n){ return 'RD$ ' + Number(n).toLocaleString('es-DO'); }

  function showToast(msg){
    const t = $('#toast'); if(!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(()=> t.classList.remove('show'), 2600);
  }

  async function loadItems(){
    if(!window.BARRO_CONFIGURED){
      items = demoMenu();
      renderSections();
      return;
    }
    const { data, error } = await sb.from('menu_items').select('*').order('created_at', { ascending:true });
    if(error){ $('#menuSections').innerHTML = `<p class="empty-note">No se pudo cargar el menú: ${error.message}</p>`; return; }
    items = (data && data.length) ? data.map(normalizeRow) : demoMenu();
    renderSections();
  }

  // Compatibilidad: si el registro viene de una versión anterior sin `icon`/`featured`,
  // le asigna un ícono razonable según el nombre.
  function normalizeRow(row){
    if(row.icon && ICONS.includes(row.icon)) return row;
    const n = (row.name||'').toLowerCase();
    let icon = 'coffee';
    if(n.includes('v60')) icon = 'v60';
    else if(n.includes('chemex')) icon = 'chemex';
    else if(n.includes('espresso')) icon = 'espresso';
    else if(n.includes('flat white') || n.includes('latte')) icon = 'flatwhite';
    else if(n.includes('cold brew') || n.includes('frío') || n.includes('frio')) icon = 'coldbrew';
    else if(n.includes('tostada') || n.includes('aguacate')) icon = 'toast';
    else if(n.includes('sandwich')) icon = 'sandwich';
    else if(n.includes('cata')) icon = 'cupping';
    return Object.assign({}, row, { icon, featured: !!row.featured });
  }

  function renderSections(){
    const wrap = $('#menuSections');
    const groupsWithItems = GROUPS.filter(g => items.some(i=>i.category===g));

    if(!groupsWithItems.length){
      wrap.innerHTML = `<p class="empty-note">Todavía no hay productos en el menú.</p>`;
      return;
    }

    wrap.innerHTML = groupsWithItems.map((group, gi)=>{
      const list = items.filter(i=>i.category===group);
      const cards = list.map((item,i)=>cardHtml(item, group, i)).join('');
      return `
        <div class="carousel-section reveal" style="transition-delay:${Math.min(gi*0.08,0.24)}s">
          <div class="carousel-head">
            <h3>${group}</h3>
          </div>
          <div class="carousel-wrap">
            <button class="carousel-arrow left" data-dir="left" aria-label="Anterior"><svg class="icon"><use href="#ic-chev-l"/></svg></button>
            <div class="carousel-track">${cards}</div>
            <button class="carousel-arrow right" data-dir="right" aria-label="Siguiente"><svg class="icon"><use href="#ic-chev-r"/></svg></button>
          </div>
        </div>`;
    }).join('');

    wireCarousels();
    wireCardActions();
    if(window.Barro && window.Barro.refreshReveal) window.Barro.refreshReveal();
  }

  function cardHtml(item, group, index){
    const tint = TINT[group] || 'manana';
    const delay = Math.min(index * 0.07, 0.42);
    return `
      <article class="p-card reveal" data-id="${item.id}" style="transition-delay:${delay}s">
        ${item.featured ? `<span class="p-fav">Favorito</span>` : ''}
        <div class="p-admin" data-bar="${item.id}">
          <button class="icon-btn" data-edit-item="${item.id}" aria-label="Editar"><svg class="icon" style="width:13px;height:13px;"><use href="#ic-pencil"/></svg></button>
          <button class="icon-btn danger" data-del-item="${item.id}" aria-label="Eliminar"><svg class="icon" style="width:13px;height:13px;"><use href="#ic-trash"/></svg></button>
        </div>
        <div class="p-icon-wrap" style="background:var(--tint-${tint});">
          <svg><use href="#pi-${item.icon||'coffee'}"/></svg>
        </div>
        <div class="p-name">${item.name}</div>
        <p class="p-desc">${item.description || ''}</p>
        <div class="p-bottom">
          <span class="p-price">${money(item.price)}</span>
          <button class="p-add" data-add="${item.id}">Agregar</button>
        </div>
      </article>`;
  }

  function wireCarousels(){
    $$('.carousel-section').forEach(section=>{
      const track = $('.carousel-track', section);
      const left = $('.carousel-arrow.left', section);
      const right = $('.carousel-arrow.right', section);

      function update(){
        const max = track.scrollWidth - track.clientWidth;
        left.disabled = track.scrollLeft <= 4;
        right.disabled = track.scrollLeft >= max - 4;
        if(max <= 4){ left.disabled = true; right.disabled = true; }
      }
      left.addEventListener('click', ()=> track.scrollBy({ left: -track.clientWidth*0.8, behavior:'smooth' }));
      right.addEventListener('click', ()=> track.scrollBy({ left: track.clientWidth*0.8, behavior:'smooth' }));
      track.addEventListener('scroll', update, { passive:true });
      window.addEventListener('resize', update);
      update();
    });
  }

  function wireCardActions(){
    $$('[data-add]').forEach(b=>b.addEventListener('click', ()=>{
      const item = items.find(i=>i.id===b.dataset.add);
      showToast(`${item ? item.name : 'Producto'} — pídelo en la barra. El pedido en línea llega pronto ☕`);
    }));
    $$('[data-edit-item]').forEach(b=>b.addEventListener('click', ()=>openProduct(items.find(i=>i.id===b.dataset.editItem))));
    $$('[data-del-item]').forEach(b=>b.addEventListener('click', ()=>confirmDelete(b)));
  }

  function confirmDelete(btn){
    const card = btn.closest('.p-card');
    const id = btn.dataset.delItem;
    const box = document.createElement('div');
    box.className = 'confirm-del-sm';
    box.innerHTML = `<span>¿Eliminar este producto?</span>
      <div style="display:flex; gap:8px;">
        <button data-yes class="btn-amber" style="border:none;">Sí, eliminar</button>
        <button data-no class="btn-ghost" style="border:1px solid var(--line); background:#fff;">Cancelar</button>
      </div>`;
    card.appendChild(box);
    box.querySelector('[data-yes]').addEventListener('click', async ()=>{
      if(window.BARRO_CONFIGURED){
        const { error } = await sb.from('menu_items').delete().eq('id', id);
        if(error){ alert('No se pudo eliminar: ' + error.message); box.remove(); return; }
      }
      await loadItems();
    });
    box.querySelector('[data-no]').addEventListener('click', ()=> box.remove());
  }

  function openProduct(item){
    editingId = item ? item.id : null;
    $('#productTitle').textContent = item ? 'Editar producto' : 'Agregar producto';
    $('#productSubmit').textContent = item ? 'Guardar cambios' : 'Guardar producto';
    $('#pName').value = item ? item.name : '';
    $('#pPrice').value = item ? item.price : '';
    $('#pCat').value = item ? item.category : 'Buenos días';
    $('#pIcon').value = item ? (item.icon||'coffee') : 'coffee';
    $('#pDesc').value = item ? (item.description||'') : '';
    $('#pFeatured').checked = item ? !!item.featured : false;
    $('#productMsg').className='form-msg';
    $('#productOverlay').classList.add('show');
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const addBtn = $('#addProductBtn');
    if(addBtn) addBtn.addEventListener('click', ()=>openProduct(null));

    const form = $('#productForm');
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const msg = $('#productMsg');
      const payload = {
        name: $('#pName').value.trim(),
        price: parseFloat($('#pPrice').value),
        category: $('#pCat').value,
        icon: $('#pIcon').value,
        description: $('#pDesc').value.trim(),
        featured: $('#pFeatured').checked,
      };
      if(!payload.name || isNaN(payload.price)){
        msg.textContent='Completa el nombre y el precio.'; msg.className='form-msg show error'; return;
      }
      if(!window.BARRO_CONFIGURED){
        msg.textContent='Conecta Supabase en js/supabase-client.js para guardar cambios de verdad.'; msg.className='form-msg show error'; return;
      }
      let error;
      if(editingId){
        payload.updated_at = new Date().toISOString();
        ({ error } = await sb.from('menu_items').update(payload).eq('id', editingId));
      } else {
        ({ error } = await sb.from('menu_items').insert(payload));
      }
      if(error){ msg.textContent = error.message; msg.className='form-msg show error'; return; }
      $('#productOverlay').classList.remove('show');
      form.reset(); editingId=null;
      await loadItems();
    });

    document.addEventListener('barro:auth-changed', ()=>{
      const isStaff = window.Barro && window.Barro.isStaff && window.Barro.isStaff();
      if(addBtn) addBtn.style.display = isStaff ? 'inline-flex' : 'none';
      renderSections();
    });

    loadItems();
  });
})();
