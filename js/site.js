/* Lógica compartida entre index.html y menu.html:
   - sesión / perfil (rol cliente vs. comensal·dueño)
   - encabezado (login, chip de usuario, banner de modo staff)
   - modal de inicio de sesión / registro
   - edición de imágenes de sitio (site_images) para las fotos placeholder
*/
(function(){
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

  window.Barro = window.Barro || {};
  let profile = null; // {id, name, role}

  function isStaff(){ return !!profile && profile.role === 'staff'; }
  window.Barro.isStaff = isStaff;
  window.Barro.getProfile = ()=> profile;

  if(!window.BARRO_CONFIGURED){
    console.warn('Barro Café: falta configurar Supabase en js/supabase-client.js (SUPABASE_URL / SUPABASE_ANON_KEY).');
  }

  /* ---------------- session ---------------- */
  async function refreshProfile(){
    if(!window.BARRO_CONFIGURED) return;
    const { data:{ session } } = await sb.auth.getSession();
    if(!session){ profile = null; onAuthChange(); return; }
    const { data, error } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
    if(error || !data){
      profile = { id: session.user.id, name: session.user.email, role: 'cliente' };
    } else {
      profile = data;
    }
    onAuthChange();
  }

  function onAuthChange(){
    document.body.classList.toggle('admin-on', isStaff());
    renderNavAuth();
    document.dispatchEvent(new CustomEvent('barro:auth-changed'));
  }

  function initials(name){
    return (name||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0].toUpperCase()).join('');
  }

  function renderNavAuth(){
    const el = $('#navAuthArea');
    if(!el) return;
    if(!profile){
      el.innerHTML = `<button class="btn btn-clay btn-sm" id="openLogin"><svg class="icon"><use href="#ic-user"/></svg>Iniciar sesión</button>`;
      $('#openLogin').addEventListener('click', ()=>openAuth('login','cliente'));
      return;
    }
    const roleLabel = profile.role === 'staff' ? 'Comensal · Dueño' : 'Cliente';
    el.innerHTML = `
      <div class="user-chip">
        <div class="av">${initials(profile.name)}</div>
        <div>${profile.name}</div>
        <span class="role-tag">${roleLabel}</span>
      </div>
      <button class="btn btn-ghost btn-sm" id="logoutBtn">Salir</button>`;
    $('#logoutBtn').addEventListener('click', async ()=>{
      await sb.auth.signOut();
      profile = null; onAuthChange();
    });
  }

  /* ---------------- auth modal ---------------- */
  let authMode = 'login', authRole = 'cliente';

  function openAuth(mode, role){
    authMode = mode; authRole = role;
    const ov = $('#authOverlay'); if(!ov) return;
    ov.classList.add('show');
    updateAuthUI();
  }
  window.Barro.openAuth = openAuth;

  function closeAuth(){
    const ov = $('#authOverlay'); if(!ov) return;
    ov.classList.remove('show');
    $('#authMsg').classList.remove('show');
    $('#authForm').reset();
  }

  function updateAuthUI(){
    const ov = $('#authOverlay'); if(!ov) return;
    $$('.role-switch [data-role]', ov).forEach(b=>b.classList.toggle('active', b.dataset.role===authRole));
    const login = authMode==='login';
    $('#authTitle').textContent = login ? 'Inicia sesión' : 'Crea tu cuenta';
    $('#authSub').textContent = authRole==='staff'
      ? 'Acceso para el personal y dueños de la cafetería. Podrás editar el menú y las fotos del sitio.'
      : 'Entra como cliente para guardar tus preferencias y pedidos.';
    $('#authSubmit').textContent = login ? 'Iniciar sesión' : 'Crear cuenta';
    $('#switchText').textContent = login ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?';
    $('#switchBtn').textContent = login ? 'Crear una' : 'Iniciar sesión';
    $('#fieldName').style.display = login ? 'none' : 'block';
    $('#authName').required = !login;
  }

  function wireAuthModal(){
    const ov = $('#authOverlay'); if(!ov) return;
    $$('.role-switch [data-role]', ov).forEach(b=>b.addEventListener('click', ()=>{ authRole=b.dataset.role; updateAuthUI(); }));
    $('#switchBtn').addEventListener('click', ()=>{ authMode = authMode==='login' ? 'signup' : 'login'; updateAuthUI(); });

    $('#authForm').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const msg = $('#authMsg'); msg.className='form-msg';
      if(!window.BARRO_CONFIGURED){
        msg.textContent = 'Falta conectar Supabase: edita js/supabase-client.js con la URL y la anon key de tu proyecto.';
        msg.classList.add('show','error'); return;
      }
      const email = $('#authEmail').value.trim().toLowerCase();
      const pass = $('#authPass').value;
      const name = $('#authName').value.trim();

      $('#authSubmit').disabled = true;
      try{
        if(authMode==='login'){
          const { error } = await sb.auth.signInWithPassword({ email, password: pass });
          if(error){ msg.textContent = 'Correo o contraseña incorrectos.'; msg.classList.add('show','error'); return; }
        } else {
          if(!name){ msg.textContent = 'Escribe tu nombre.'; msg.classList.add('show','error'); return; }
          const { data, error } = await sb.auth.signUp({
            email, password: pass,
            options:{ data: { name, role: authRole } }
          });
          if(error){ msg.textContent = error.message; msg.classList.add('show','error'); return; }
          if(data.session === null){
            msg.textContent = 'Cuenta creada. Revisa tu correo para confirmar antes de iniciar sesión.';
            msg.classList.add('show','ok');
            setTimeout(closeAuth, 2200);
            return;
          }
        }
        await refreshProfile();
        closeAuth();
      } finally {
        $('#authSubmit').disabled = false;
      }
    });
  }

  /* ---------------- site image placeholders (site_images table) ---------------- */
  let editingImgKey = null;

  async function loadSiteImages(){
    if(!window.BARRO_CONFIGURED) return;
    const nodes = $$('.ph[data-img-key]');
    if(!nodes.length) return;
    const { data, error } = await sb.from('site_images').select('*');
    if(error || !data) return;
    const map = {}; data.forEach(r=>map[r.key]=r.url);
    nodes.forEach(ph=>{
      const key = ph.dataset.imgKey;
      const url = map[key];
      const existing = ph.querySelector('img.real');
      if(url){
        if(!existing){ const img=document.createElement('img'); img.className='real'; img.src=url; img.alt=''; ph.prepend(img); }
        else existing.src = url;
        ph.querySelectorAll('.ph-icon,.ph-label').forEach(n=>n.style.display='none');
      } else if(existing){ existing.remove(); ph.querySelectorAll('.ph-icon,.ph-label').forEach(n=>n.style.display=''); }
    });
  }

  function openImageModal(key){
    editingImgKey = key;
    const ov = $('#imageOverlay'); if(!ov) return;
    $('#imgUrl').value = '';
    ov.classList.add('show');
  }

  function wireImageModal(){
    const ov = $('#imageOverlay'); if(!ov) return;
    $('#imageForm').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const url = $('#imgUrl').value.trim();
      if(editingImgKey){
        await sb.from('site_images').update({ url, updated_at: new Date().toISOString() }).eq('key', editingImgKey);
        await loadSiteImages();
      }
      ov.classList.remove('show'); editingImgKey=null;
    });
  }

  document.body.addEventListener('click', (e)=>{
    const editBtn = e.target.closest('.ph-edit');
    if(editBtn) openImageModal(editBtn.dataset.edit);
  });

  /* ---------------- generic modal close ---------------- */
  function wireGenericModals(){
    $$('[data-close]').forEach(b=>b.addEventListener('click', (e)=>{ e.target.closest('.overlay').classList.remove('show'); }));
    $$('.overlay').forEach(ov=>ov.addEventListener('click', (e)=>{ if(e.target===ov) ov.classList.remove('show'); }));
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') $$('.overlay.show').forEach(o=>o.classList.remove('show')); });
  }

  /* ---------------- header scroll state ---------------- */
  function wireHeaderScroll(){
    const header = $('#siteHeader'); if(!header) return;
    window.addEventListener('scroll', ()=>{ header.classList.toggle('solid', window.scrollY > 40); }, {passive:true});
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    wireAuthModal();
    wireImageModal();
    wireGenericModals();
    wireHeaderScroll();
    renderNavAuth();
    loadSiteImages();
    if(window.BARRO_CONFIGURED){
      refreshProfile();
      sb.auth.onAuthStateChange(()=>{ refreshProfile(); });
    }
    const y = $('#year'); if(y) y.textContent = new Date().getFullYear();
  });
})();
