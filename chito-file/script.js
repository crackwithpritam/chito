document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. STICKY NAV & MOBILE MENU
  // ==========================================
  const nav = document.getElementById('nav');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  // Sticky nav blur on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });

  // Mobile menu toggle
  const toggleMobileMenu = (open) => {
    menuToggle.classList.toggle('active', open);
    navLinks.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  menuToggle.addEventListener('click', () => {
    toggleMobileMenu(!navLinks.classList.contains('active'));
  });

  // Close mobile menu when a link is clicked
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  // ==========================================
  // 2. SCROLL REVEAL ANIMATIONS
  // ==========================================
  const revealElements = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Stop observing once revealed
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  
  revealElements.forEach(el => observer.observe(el));

  // ==========================================
  // 3. AUTH MODAL (LOGIN / SIGNUP)
  // ==========================================
  const authModal = document.getElementById('auth-modal');
  const loginBtn = document.getElementById('login-btn');
  const authClose = document.getElementById('auth-close');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const nameGroup = document.getElementById('name-group');
  const authForm = document.getElementById('auth-form');
  const authSubmit = document.getElementById('auth-submit');
  let isSignup = false;

  const openAuth = () => {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Close mobile menu if it's open
    if (navLinks.classList.contains('active')) toggleMobileMenu(false);
  };

  const closeAuth = () => {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  loginBtn.addEventListener('click', openAuth);
  authClose.addEventListener('click', closeAuth);
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuth();
  });

  // Tab switching logic
  const switchAuthTab = (signup) => {
    isSignup = signup;
    if (signup) {
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      nameGroup.style.display = 'block';
      authSubmit.innerHTML = 'Create account <span class="arrow">→</span>';
    } else {
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      nameGroup.style.display = 'none';
      authSubmit.innerHTML = 'Sign in <span class="arrow">→</span>';
    }
  };

  tabLogin.addEventListener('click', () => switchAuthTab(false));
  tabSignup.addEventListener('click', () => switchAuthTab(true));

  // Fake submit
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = isSignup ? 'Account created successfully! (Demo)' : 'Logged in successfully! (Demo)';
    alert(message);
    closeAuth();
  });

  // ==========================================
  // 4. SHOPPING CART LOGIC
  // ==========================================
  let cart = [];
  const cartCountEl = document.getElementById('cart-count');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartClose = document.getElementById('cart-close');
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total-price');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Add to Cart
  document.querySelectorAll('.add-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const name = e.target.getAttribute('data-name');
      const price = parseInt(e.target.getAttribute('data-price'));
      
      // Check if item is already in cart
      const existingItem = cart.find(item => item.name === name);
      if (existingItem) {
        existingItem.qty++;
      } else {
        cart.push({ name, price, qty: 1 });
      }

      updateCart();
      
      // Visual feedback
      button.textContent = 'Added ✓';
      button.classList.add('added');
      setTimeout(() => {
        button.textContent = 'Add to cart';
        button.classList.remove('added');
      }, 1500);
    });
  });

  // Update Cart UI
  function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = `(${totalItems})`;

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.<br/>Add something beautiful.</p>';
      cartTotalEl.textContent = 'Rs. 0';
      return;
    }

    let html = '';
    let total = 0;
    
    cart.forEach((item, index) => {
      total += item.price * item.qty;
      html += `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <span class="cart-item-price">Rs. ${item.price.toLocaleString()}</span>
            <div class="cart-qty-controls">
              <button class="qty-btn" data-action="decrease" data-index="${index}">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" data-action="increase" data-index="${index}">+</button>
            </div>
          </div>
          <div class="cart-item-actions">
            <div class="cart-item-total">Rs. ${(item.price * item.qty).toLocaleString()}</div>
            <button class="cart-remove" data-index="${index}">Remove</button>
          </div>
        </div>
      `;
    });
    
    cartItemsEl.innerHTML = html;
    cartTotalEl.textContent = `Rs. ${total.toLocaleString()}`;

    // Attach event listeners for new buttons
    attachCartEvents();
  }

  function attachCartEvents() {
    // Remove item buttons
    document.querySelectorAll('.cart-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        cart.splice(index, 1);
        updateCart();
      });
    });

    // Quantity increase/decrease buttons
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        const action = e.target.getAttribute('data-action');
        
        if (action === 'increase') {
          cart[index].qty++;
        } else if (action === 'decrease') {
          cart[index].qty--;
          if (cart[index].qty <= 0) {
            cart.splice(index, 1); // Remove if quantity hits 0
          }
        }
        updateCart();
      });
    });
  }

  // Open/Close Cart
  const openCart = () => {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  
  const closeCart = () => {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  document.getElementById('cart-btn').addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // ==========================================
  // 5. CHECKOUT LOGIC
  // ==========================================
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Please add items first.');
      return;
    }
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    
    alert(`✓ Order Placed Successfully!\n\nItems: ${totalItems}\nTotal: Rs. ${totalAmount.toLocaleString()}\n\nThank you for shopping with chito. (Demo)`);
    
    // Reset cart after checkout
    cart = [];
    updateCart();
    closeCart();
  });

  // ==========================================
  // 6. GLOBAL KEYBOARD SHORTCUTS
  // ==========================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (cartDrawer.classList.contains('active')) closeCart();
      if (authModal.classList.contains('active')) closeAuth();
    }
  });

});