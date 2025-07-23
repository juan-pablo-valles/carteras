// Carrito de compras
let cart = [];
let products = [];

// Función para agregar producto al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Verificar si el producto ya está en el carrito
    const existingProduct = cart.find(item => item.id === productId);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Actualizar el carrito en la interfaz
    renderCart();
    // Guardar en localStorage
    saveCart();
}

// Función para eliminar producto del carrito
function removeFromCart(productId) {
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
        if (cart[productIndex].quantity > 1) {
            cart[productIndex].quantity -= 1;
        } else {
            cart.splice(productIndex, 1);
        }
        
        renderCart();
        saveCart();
    }
}

// Función para incrementar cantidad de un producto
function increaseQuantity(productId) {
    const product = cart.find(item => item.id === productId);
    if (product) {
        product.quantity += 1;
        renderCart();
        saveCart();
    }
}

// Función para renderizar el carrito
function renderCart() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total h3');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>El carrito está vacío</p>';
        cartTotal.textContent = 'Total: $0.00';
        return;
    }
    
    let total = 0;
    let cartHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" loading="lazy">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Precio unitario: $${item.price.toLocaleString()}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="removeFromCart(${item.id})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="increaseQuantity(${item.id})">+</button>
                    </div>
                    <p>Total: $${itemTotal.toLocaleString()}</p>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    cartTotal.textContent = `Total: $${total.toLocaleString()}`;
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

// Función para cargar productos desde el archivo JSON
async function loadProducts() {
    try {
        const response = await fetch("data/productos.json");
        const data = await response.json();
        products = data.products;
        renderProducts();
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

// Función para renderizar los productos
function renderProducts() {
    const productsContainer = document.querySelector('.productos-grid');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = products.map(product => `
        <div class="producto-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.alt}" loading="lazy">
            <h3>${product.name}</h3>
            <p>$${product.price.toLocaleString()}</p>
            <div class="add-to-cart-icon" onclick="addToCart(${product.id})">
                <i class="fas fa-cart-plus"></i>
                <span class="cart-label">Agregar al carrito</span>
            </div>
        </div>
    `).join('');
}

// Cargar carrito desde localStorage
function loadCart() {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        renderCart();
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Cargar productos y carrito
    loadProducts();
    loadCart();
    
    // Mostrar notificación al agregar al carrito
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-icon')) {
            showNotification('Producto agregado al carrito');
        }
    });
});

// Función para mostrar notificaciones
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Ocultar y eliminar notificación después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}