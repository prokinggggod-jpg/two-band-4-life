const cart = [];
const cartEl = document.querySelector('#cart');
const shade = document.querySelector('#shade');
const itemsEl = document.querySelector('#cartItems');
const totalEl = document.querySelector('#total');
const countEl = document.querySelector('#cartCount');

function addToCart(name, price) {
  const existing = cart.find(x => x.name === name);
  if (existing) existing.quantity += 1;
  else cart.push({ name, price, quantity: 1 });
  render();
  openCart();
}

document.querySelectorAll('.add').forEach(button => {
  button.addEventListener('click', () => {
    const product = button.closest('.product');
    addToCart(product.dataset.name, Number(product.dataset.price));
  });
});

function render() {
  itemsEl.innerHTML = cart.length
    ? cart.map((x, i) => `<div class="cart-item"><span>${escapeHtml(x.name)} × ${x.quantity}</span><span>$${(x.price * x.quantity).toFixed(2)} <button onclick="removeItem(${i})">×</button></span></div>`).join('')
    : '<p style="color:#888;font-size:12px">Your cart is empty.</p>';
  const total = cart.reduce((sum, x) => sum + x.price * x.quantity, 0);
  totalEl.textContent = '$' + total.toFixed(2);
  countEl.textContent = cart.reduce((sum, x) => sum + x.quantity, 0);
}

function removeItem(i) {
  cart.splice(i, 1);
  render();
}

function openCart() {
  cartEl.classList.add('open');
  shade.classList.add('show');
}

function closeCart() {
  cartEl.classList.remove('open');
  shade.classList.remove('show');
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}

document.querySelector('#cartBtn').onclick = openCart;
document.querySelector('#closeCart').onclick = closeCart;
shade.onclick = closeCart;

document.querySelector('#checkout').onclick = async () => {
  if (!cart.length) return alert('Your cart is empty.');

  const checkoutButton = document.querySelector('#checkout');
  checkoutButton.disabled = true;
  checkoutButton.textContent = 'OPENING STRIPE…';

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: cart.map(x => ({ name: x.name, quantity: x.quantity })) })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Checkout could not be started.');
    window.location.href = data.url;
  } catch (error) {
    alert(error.message);
    checkoutButton.disabled = false;
    checkoutButton.textContent = 'CHECKOUT';
  }
};

render();
