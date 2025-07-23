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
    
    // Inicializar reseñas
    initReviews();
    
    // Mostrar notificación al agregar al carrito
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-icon')) {
            showNotification('Producto agregado al carrito');
        }
    });
});

// Funcion manejar las reseñas
function initReviews() {
    // Cargar reseñas existentes
    loadReviews();
    
    // Configurar estrellas calificación
    setupStarRating();
    
    // Manejar envío de reseña
    const reviewForm = document.getElementById('resena-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
}

// Configurar estrellas calificación
function setupStarRating() {
    const stars = document.querySelectorAll('.estrellas i');
    const ratingInput = document.getElementById('calificacion-resena');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            ratingInput.value = rating;
            
            // Actualizar visualización de estrellas
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('seleccionada');
                } else {
                    s.classList.remove('seleccionada');
                }
            });
        });
        
        // Efecto hover
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.style.color = '#ffd700';
                }
            });
        });
        
        star.addEventListener('mouseout', () => {
            const currentRating = parseInt(ratingInput.value);
            stars.forEach((s, index) => {
                if (index >= currentRating) {
                    s.style.color = '#ddd';
                }
            });
        });
    });
}

// Manejar envío reseña
function handleReviewSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('nombre-resena');
    const commentInput = document.getElementById('comentario-resena');
    const ratingInput = document.getElementById('calificacion-resena');
    
    // Validar calificación
    if (parseInt(ratingInput.value) === 0) {
        showNotification('Por favor, selecciona una calificación con estrellas');
        return;
    }
    
    // Crear reseña
    const review = {
        id: Date.now(),
        name: nameInput.value.trim(),
        comment: commentInput.value.trim(),
        rating: parseInt(ratingInput.value),
        date: new Date().toISOString()
    };
    
    // Obtener reseñas existentes
    let reviews = JSON.parse(localStorage.getItem('productReviews')) || [];
    
    // Agregar nueva reseña
    reviews.unshift(review);
    
    // Guardar en localStorage
    localStorage.setItem('productReviews', JSON.stringify(reviews));
    
    // Actualizar la visualización
    renderReviews(reviews);
    
    // Reiniciar formulario
    e.target.reset();
    document.querySelectorAll('.estrellas i').forEach(star => {
        star.classList.remove('seleccionada');
    });
    
    // Mostrar notificación
    showNotification('¡Gracias por tu reseña!');
}

// Cargar reseñas desde localStorage
function loadReviews() {
    const reviews = JSON.parse(localStorage.getItem('productReviews')) || [];
    renderReviews(reviews);
    return reviews;
}

// Mostrar las reseñas en la página
function renderReviews(reviews) {
    const reviewsContainer = document.getElementById('resenas-lista');
    if (!reviewsContainer) return;
    
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="sin-resenas">Sé el primero en dejar una reseña.</p>';
        return;
    }
    
    reviewsContainer.innerHTML = reviews.map(review => `
        <div class="resena-item">
            <div class="resena-header">
                <span class="resena-nombre">${review.name}</span>
                <span class="resena-fecha">${formatDate(review.date)}</span>
            </div>
            <div class="resena-calificacion">
                ${'<i class="fas fa-star"></i>'.repeat(review.rating)}
                ${'<i class="far fa-star"></i>'.repeat(5 - review.rating)}
            </div>
            <p class="resena-comentario">${review.comment}</p>
        </div>
    `).join('');
}

// Formatear fecha
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Funcion mostrar notificaciones
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