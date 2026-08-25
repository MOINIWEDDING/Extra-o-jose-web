document.addEventListener('DOMContentLoaded', () => {
    if (window.supabaseClient) {
        fetchMenuItems();
    }
});

async function fetchMenuItems() {
    try {
        const { data: productos, error } = await window.supabaseClient
            .from('productos')
            .select('*');

        if (error) throw error;

        renderMenuCards(productos);
    } catch (err) {
        console.error('Error al cargar el menú:', err);
    }
}

function renderMenuCards(productos) {
    const container = document.getElementById('menu-grid') || document.getElementById('menu-container');
    if (!container) return;

    container.innerHTML = productos.map(producto => `
        <div class="menu-card-floating" data-id="${producto.id}">
            <img src="${producto.imagen_url}" alt="${producto.nombre}" class="floating-img" />
            
            <div class="card-content">
                <h3 class="product-title">${producto.nombre}</h3>
                
                <div class="card-actions">
                    <button class="icon-btn cart-btn" onclick="addToCart('${producto.id}')" aria-label="Agregar al carrito">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                    </button>
                    <button class="icon-btn heart-btn" onclick="toggleFavorite('${producto.id}')" aria-label="Favorito">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="price-badge">
                RD$ ${parseFloat(producto.precio).toFixed(2)}
            </div>
        </div>
    `).join('');
}

function addToCart(productId) {
    console.log('Producto agregado al carrito:', productId);
}

function toggleFavorite(productId) {
    console.log('Favorito alternado:', productId);
}
