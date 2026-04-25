const products = [
  { id: 1, name: "Organic Apples", price: 3.99, category: "Fruits", promo: "Fresh" },
  { id: 2, name: "Whole Wheat Bread", price: 2.49, category: "Bakery", promo: "Popular" },
  { id: 3, name: "Almond Milk", price: 4.25, category: "Dairy", promo: "Healthy" },
  { id: 4, name: "Premium Rice (5kg)", price: 11.99, category: "Grains", promo: "Value" },
  { id: 5, name: "Farm Eggs (12 pcs)", price: 3.75, category: "Poultry", promo: "Daily" },
  { id: 6, name: "Mixed Nuts", price: 6.5, category: "Snacks", promo: "Energy" }
];

const state = {
  cart: JSON.parse(localStorage.getItem("bhk_cart") || "[]")
};

const productGrid = document.getElementById("productGrid");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function saveCart() {
  localStorage.setItem("bhk_cart", JSON.stringify(state.cart));
}

function addToCart(productId) {
  const found = state.cart.find((item) => item.id === productId);
  if (found) {
    found.qty += 1;
  } else {
    const product = products.find((p) => p.id === productId);
    state.cart.push({ ...product, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast("Item added to cart");
}

function updateQty(productId, delta) {
  const item = state.cart.find((p) => p.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((p) => p.id !== productId);
  }
  saveCart();
  renderCart();
}

function removeItem(productId) {
  state.cart = state.cart.filter((p) => p.id !== productId);
  saveCart();
  renderCart();
  showToast("Item removed");
}

function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (item) => `
      <article class="product-card glass reveal">
        <h3>${item.name}</h3>
        <p>${item.category}</p>
        <p class="product-price">$${item.price.toFixed(2)}</p>
        <span class="badge">${item.promo}</span>
        <div style="margin-top: .85rem">
          <button class="btn btn-primary" data-add="${item.id}">Add to Cart</button>
        </div>
      </article>
    `
    )
    .join("");

  document.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.add)));
  });

  setupRevealAnimations();
}

function renderCart() {
  if (state.cart.length === 0) {
    cartItems.innerHTML = `<p style="color: var(--muted)">Your cart is empty.</p>`;
  } else {
    cartItems.innerHTML = state.cart
      .map(
        (item) => `
      <article class="cart-item">
        <div class="cart-item-top">
          <h4>${item.name}</h4>
          <strong>$${(item.price * item.qty).toFixed(2)}</strong>
        </div>
        <div class="qty-row">
          <div class="qty-controls">
            <button data-dec="${item.id}">−</button>
            <span>${item.qty}</span>
            <button data-inc="${item.id}">+</button>
          </div>
          <button class="remove-btn" data-remove="${item.id}">Remove</button>
        </div>
      </article>
    `
      )
      .join("");
  }

  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  cartCount.textContent = String(count);
  cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;

  document.querySelectorAll("[data-inc]").forEach((button) => {
    button.addEventListener("click", () => updateQty(Number(button.dataset.inc), 1));
  });

  document.querySelectorAll("[data-dec]").forEach((button) => {
    button.addEventListener("click", () => updateQty(Number(button.dataset.dec), -1));
  });

  document.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeItem(Number(button.dataset.remove)));
  });
}

function setupRevealAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
}

document.getElementById("cartToggle").addEventListener("click", () => {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
});

document.getElementById("closeCart").addEventListener("click", () => {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (state.cart.length === 0) {
    showToast("Add items before checkout");
    return;
  }
  showToast("Checkout successful! Thank you for shopping.");
  state.cart = [];
  saveCart();
  renderCart();
  cartDrawer.classList.remove("open");
});

document.getElementById("clearCartBtn").addEventListener("click", () => {
  state.cart = [];
  saveCart();
  renderCart();
  showToast("Cart cleared");
});

document.getElementById("year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
setupRevealAnimations();
