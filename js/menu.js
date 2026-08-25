(function(){
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

  let items = [];
  let activeCat = 'Todos';
  let editingId = null;

  // Vista de muestra usada solo si Supabase todavía no está conectado, para que
  // la página del menú se vea completa desde el primer momento.
  function demoMenu(){
    const img = window.Barro && window.Barro.DEFAULT_IMAGES ? window.Barro.DEFAULT_IMAGES : {};
    return [
      {id:'d1', name:'V60 grano dominicano', category:'Filtrado', price:250, description:'Extracción por goteo, single origin, perfil de taza definido en cada lote.', image_url:'https://images.unsplash.com/photo-1753837787691-84a06d715d24?q=80&w=800&auto=format&fit=crop'},
      {id:'d2', name:'Chemex para dos', category:'Filtrado', price:420, description:'Método de inmersión-goteo, taza limpia y brillante, ideal para compartir.', image_url:'https://images.unsplash.com/photo-1758593386033-cb1f842d550c?q=80&w=800&auto=format&fit=crop'},
      {id:'d3', name:'Espresso doble origen', category:'Espresso', price:150, description:'Shot doble, cuerpo denso, notas a chocolate y frutos secos.', image_url:'https://images.unsplash.com/photo-1498241804937-a517467c0db6?q=80&w=800&auto=format&fit=crop'},
      {id:'d4', name:'Flat white de autor', category:'Espresso', price:210, description:'Doble shot, leche microespumada, textura sedosa de principio a fin.', image_url:'https://images.unsplash.com/photo-1758900450186-e829f72d25fb?q=80&w=800&auto=format&fit=crop'},
      {id:'d5', name:'Cold brew 24h', category:'Frío', price:220, description:'Reposado 24 horas en frío, baja acidez, cuerpo suave.', image_url:'https://images.unsplash.com/photo-1759259639356-6eee63241869?q=80&w=800&auto=format&fit=crop'},
      {id:'d6', name:'Tostada de aguacate', category:'Comidas', price:320, description:'Pan de masa madre, aguacate, semillas y limón.', image_url:'https://images.unsplash.com/photo-1752095809157-9dd2e2dfae8b?q=80&w=800&auto=format&fit=crop'},
      {id:'d7', name:'Sandwich de la barra', category:'Comidas', price:380, description:'Jamón serrano, queso manchego y rúcula en pan artesanal.', image_url:'https://images.unsplash.com/photo-1696721497656-682d1376c3c8?q=80&w=800&auto=format&fit=crop'},
      {id:'d8', name:'Cata guiada', category:'Experiencias', price:650, description:'Tres orígenes dominicanos, guiada por nuestro equipo de barra.', image_url:'https://images.unsplash.com/photo-1758945185175-3d54780cd8d0?q=80&w=800&auto=format&fit=crop'},
    ];
  }

  function money(n){ return 'RD$ ' + Number(n).toLocaleString('es-DO'); }

  async function loadItems(){
    if(!window.BARRO_CONFIGURED){
      items = demoMenu();
      renderTabs(); renderGrid();
      return;
    }
    const { data, error } = await sb.from('menu_items').select('*').order('created_at', { ascending:true });
    if(error){ $('#menuGrid').innerHTML = `<p class="empty-note">No se pudo cargar el menú: ${error.message}</p>`; return; }
    items = (data && data.length) ? data : demoMenu();
    renderTabs();
    renderGrid();
  }

  function renderTabs(){
    const cats = ['Todos', ...Array.from(new Set(items.map(m=>m.category)))];
    $('#catTabs').innerHTML = cats.map(c=>`<button class="tab ${activeCat===c?'active':''}" data-cat="${c}">${c}</button>`).join('');
    $$('#catTabs .tab').forEach(btn=>btn.addEventListener('click', ()=>{ activeCat = btn.dataset.cat; renderTabs(); renderGrid(); }));
  }

  function renderGrid(){
    const grid = $('#menuGrid');
    const list = activeCat==='Todos' ? items : items.filter(m=>m.category===activeCat);
    const cards = list.map(item=>`
      <article class="item-card reveal in" data-id="${item.id}">
        <div class="ph">
          ${item.image_url ? `<img class="real" src="${item.image_url}" alt="${item.name}">` : `<svg class="ph-icon"><use href="#ic-camera"/></svg><span class="ph-label">Foto de ${item.name}</span>`}
        </div>
        <div class="item-body">
          <div class="item-top"><h4>${item.name}</h4><span class="item-price">${money(item.price)}</span></div>
          <p class="item-desc">${item.description || ''}</p>
          <span class="item-cat">${item.category}</span>
        </div>
        <div class="item-admin-bar" data-bar="${item.id}">
          <button class="icon-btn" data-edit-item="${item.id}" aria-label="Editar"><svg class="icon" style="width:14px;height:14px;"><use href="#ic-pencil"/></svg></button>
          <button class="icon-btn danger" data-del-item="${item.id}" aria-label="Eliminar"><svg class="icon" style="width:14px;height:14px;"><use href="#ic-trash"/></svg></button>
        </div>
      </article>`).join('');

    grid.innerHTML = (list.length ? cards : `<p class="empty-note">Todavía no hay productos en esta categoría.</p>`) + `
      <button class="add-card" id="addProductBtn" type="button">
        <div class="plus"><svg class="icon"><use href="#ic-plus"/></svg></div>
        <span>Agregar producto</span>
      </button>`;

    const addBtn = $('#addProductBtn');
    if(addBtn) addBtn.addEventListener('click', ()=>openProduct(null));
    $$('[data-edit-item]').forEach(b=>b.addEventListener('click', ()=>openProduct(items.find(m=>m.id===b.dataset.editItem))));
    $$('[data-del-item]').forEach(b=>b.addEventListener('click', ()=>confirmDelete(b)));
  }

  function confirmDelete(btn){
    const bar = btn.closest('.item-admin-bar');
    const id = btn.dataset.delItem;
    bar.innerHTML = `<div class="confirm-del">¿Eliminar? <button data-yes>Sí</button> <button data-no>No</button></div>`;
    bar.querySelector('[data-yes]').addEventListener('click', async ()=>{
      if(window.BARRO_CONFIGURED){
        const { error } = await sb.from('menu_items').delete().eq('id', id);
        if(error){ alert('No se pudo eliminar: ' + error.message); return; }
      }
      await loadItems();
    });
    bar.querySelector('[data-no]').addEventListener('click', renderGrid);
  }

  function openProduct(item){
    editingId = item ? item.id : null;
    $('#productTitle').textContent = item ? 'Editar producto' : 'Agregar producto';
    $('#productSubmit').textContent = item ? 'Guardar cambios' : 'Guardar producto';
    $('#pName').value = item ? item.name : '';
    $('#pPrice').value = item ? item.price : '';
    $('#pCat').value = item ? item.category : 'Filtrado';
    $('#pDesc').value = item ? (item.description||'') : '';
    $('#pImg').value = item ? (item.image_url||'') : '';
    $('#productMsg').className='form-msg';
    $('#productOverlay').classList.add('show');
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const form = $('#productForm');
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const msg = $('#productMsg');
      const payload = {
        name: $('#pName').value.trim(),
        price: parseFloat($('#pPrice').value),
        category: $('#pCat').value,
        description: $('#pDesc').value.trim(),
        image_url: $('#pImg').value.trim(),
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

    document.addEventListener('barro:auth-changed', ()=>{ renderGrid(); });
    loadItems();
  });
})();
