let productsData = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];


const cartModal = document.querySelector('.cart-modal');
const cartButton = document.querySelector('.nav__btn--cart');
const cartCloseButton = document.querySelector('.cart-modal__close');
const cartContinueButton = document.querySelector('.cart-modal__btn--continue');
const cartItemsContainer = document.querySelector('.cart-modal__items');
const cartTotalPrice = document.querySelector('.cart-modal__total-price');


document.addEventListener('DOMContentLoaded', () => {
  console.log('The page has loaded');
  
  fetch('./data/products.json')
    .then(response => response.json())
    .then(products => {
      productsData = products;
      renderProducts(products);
      updateCartCount();
      setupEventListeners();
    })
    .catch(error => {
      console.error('Error loading products:', error);
    });
});


function setupEventListeners() {
  if (cartButton) {
    cartButton.addEventListener('click', openCart);
  }
  if (cartCloseButton) {
    cartCloseButton.addEventListener('click', closeCart);
  }
  if (cartModal) {
    cartModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('cart-modal__overlay')) {
        closeCart();
      }
    });
  }
  if (cartContinueButton) {
    cartContinueButton.addEventListener('click', closeCart);
  }
  

  document.addEventListener('click', (e) => {
    if (e.target.closest('.product-card__btn')) {
      const button = e.target.closest('.product-card__btn');
      const productId = parseInt(button.dataset.id);
      
      if (productId) {
        addToCart(productId);
      }
    }
  });
}

function openCart() {
  if (cartModal) {
    cartModal.classList.remove('cart-modal--hidden');
    document.body.style.overflow = 'hidden';
    renderCartItems();
  }
}

function closeCart() {
  if (cartModal) {
    cartModal.classList.add('cart-modal--hidden');
    document.body.style.overflow = '';
  }
}

function addToCart(productId) {
  const product = productsData.find(p => p.id === productId);
  if (!product) return;

  const existingItemIndex = cart.findIndex(item => item.id === productId);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  
  updateCartCount();
  showNotification(`${product.title} added to cart!`);
  
  if (!cartModal.classList.contains('cart-modal--hidden')) {
    renderCartItems();
  }
}

function removeFromCart(productId) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex > -1) {
    cart.splice(itemIndex, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartCount();
    renderCartItems();
  }
}

function updateQuantity(productId, change) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  
  if (itemIndex > -1) {
    cart[itemIndex].quantity += change;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartCount();
    renderCartItems();
  }
}

function renderCartItems() {
  if (!cartItemsContainer) return;
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <p>Your cart is empty</p>
      </div>
    `;
    cartTotalPrice.textContent = '$0.00';
    return;
  }
  
  let totalPrice = 0;
  const itemsHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;
    
    return `
      <div class="cart-modal__item" data-id="${item.id}">
        <div class="cart-modal__item-image">
          <img src="${item.image}" alt="${item.title}" />
        </div>
        
        <div class="cart-modal__item-info">
          <h4 class="cart-modal__item-title">${item.title}</h4>
          <div class="cart-modal__item-price">$${item.price.toFixed(2)}</div>
          
          <div class="cart-modal__item-quantity">
            <button class="quantity-decrease" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-increase" data-id="${item.id}">+</button>
          </div>
          
          <button class="cart-modal__item-remove" data-id="${item.id}">
            Remove
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  cartItemsContainer.innerHTML = itemsHTML;
  cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
  
  addCartItemListeners();
}

function addCartItemListeners() {
  document.querySelectorAll('.cart-modal__item-remove').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(button.dataset.id);
      removeFromCart(productId);
    });
  });
  
  document.querySelectorAll('.quantity-decrease').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(button.dataset.id);
      updateQuantity(productId, -1);
    });
  });
  
  document.querySelectorAll('.quantity-increase').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(button.dataset.id);
      updateQuantity(productId, 1);
    });
  });
}

function updateCartCount() {
  const cartCount = document.querySelector('.nav__cart-count');
  if (cartCount) {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = total;
    cartCount.style.display = total > 0 ? 'flex' : 'none';
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 200);
  }, 1000);
}

function renderProducts(products) {
  const container = document.querySelector('.products__list');
  if (!container) return;
  
  container.innerHTML = '';
  
  products.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.id = product.id;
    
    card.innerHTML = `
      <div class="product-card__image">
        <img src="${product.image}" alt="${product.title}" loading="lazy" />
        <div class="product-card__overlay">
          <button class="product-card__btn" data-id="${product.id}">
            <img src="./img/img4.png" alt="Cart" />
            Add to Cart
          </button>
        </div>
      </div>
      <div class="product-card__content">
        <h3 class="product-card__name">${product.title}</h3>
        <p class="product-card__description">${product.description}</p>
        <span class="product-card__price">$${product.price.toFixed(2)}</span>
      </div>
    `;
    
    container.appendChild(card);
  });
}


const menu = document.querySelector('.menu');
const burger = document.querySelector('.nav__btn--menu');

function toggleMenu() {
  menu.classList.toggle('menu--hidden');
}

burger.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMenu();
});

document.addEventListener('click', (e) => {
  if (!menu.classList.contains('menu--hidden')) {
    if (!menu.contains(e.target) && !burger.contains(e.target)) {
      menu.classList.add('menu--hidden');
    }
  }
});

