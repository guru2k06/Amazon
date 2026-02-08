const cartKey = window.CART_KEY || 'amazon_cart'

function getCartItems() {
  try {
    const raw = localStorage.getItem(cartKey)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setCartItems(items) {
  localStorage.setItem(cartKey, JSON.stringify(items))
}

function formatMoney(value) {
  return `$${value.toFixed(2)}`
}

function calcTotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.qty), 0)
}

function adjustQty(title, delta) {
  const items = getCartItems()
  const idx = items.findIndex(item => item.title === title)
  if (idx === -1) return
  items[idx].qty += delta
  if (items[idx].qty <= 0) items.splice(idx, 1)
  setCartItems(items)
  if (typeof updateCartCount === 'function') updateCartCount()
  renderCartPage()
  renderCheckoutPage()
}

function renderCartPage() {
  const listEl = document.getElementById('cart-items')
  const totalEl = document.getElementById('cart-total')
  const emptyEl = document.getElementById('cart-empty')
  if (!listEl || !totalEl) return

  const items = getCartItems()
  listEl.innerHTML = ''
  if (!items.length) {
    if (emptyEl) emptyEl.textContent = 'Your cart is empty. Add items from the home page.'
  } else {
    if (emptyEl) emptyEl.textContent = ''
  }

  items.forEach(item => {
    const row = document.createElement('div')
    row.className = 'cart-item'
    row.innerHTML = `
      <img src="${item.img}" alt="${item.title}">
      <div>
        <div><strong>${item.title}</strong></div>
        <div class="muted">${formatMoney(item.price)} x ${item.qty}</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
        <button class="qty-btn" data-action="minus">-</button>
        <span>${item.qty}</span>
        <button class="qty-btn" data-action="plus">+</button>
      </div>
    `
    row.querySelector('[data-action="minus"]').addEventListener('click', () => adjustQty(item.title, -1))
    row.querySelector('[data-action="plus"]').addEventListener('click', () => adjustQty(item.title, 1))
    listEl.appendChild(row)
  })

  totalEl.textContent = `Total: ${formatMoney(calcTotal(items))}`
}

function renderCheckoutPage() {
  const listEl = document.getElementById('checkout-items')
  const totalEl = document.getElementById('checkout-total')
  if (!listEl || !totalEl) return

  const items = getCartItems()
  listEl.innerHTML = ''
  items.forEach(item => {
    const row = document.createElement('div')
    row.className = 'cart-item'
    row.innerHTML = `
      <img src="${item.img}" alt="${item.title}">
      <div>
        <div><strong>${item.title}</strong></div>
        <div class="muted">${formatMoney(item.price)} x ${item.qty}</div>
      </div>
    `
    listEl.appendChild(row)
  })

  totalEl.textContent = `Total: ${formatMoney(calcTotal(items))}`
}

async function initCheckout() {
  const statusEl = document.getElementById('checkout-status')
  const placeBtn = document.getElementById('place-order-btn')
  const nameEl = document.getElementById('address-name')
  const phoneEl = document.getElementById('address-phone')
  const line1El = document.getElementById('address-line1')
  const cityEl = document.getElementById('address-city')
  const stateEl = document.getElementById('address-state')
  const zipEl = document.getElementById('address-zip')
  if (!statusEl || !placeBtn) return

  const me = await fetch('/api/me').then(r => r.json()).catch(() => ({ loggedIn: false }))
  if (!me.loggedIn) {
    statusEl.textContent = 'Please login to place an order.'
    placeBtn.disabled = true
    return
  }

  placeBtn.addEventListener('click', async () => {
    const items = getCartItems()
    const total = calcTotal(items)
    if (!items.length) {
      statusEl.textContent = 'Your cart is empty.'
      return
    }

    const address = {
      name: nameEl?.value.trim(),
      phone: phoneEl?.value.trim(),
      line1: line1El?.value.trim(),
      city: cityEl?.value.trim(),
      state: stateEl?.value.trim(),
      zip: zipEl?.value.trim()
    }

    if (!address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.zip) {
      statusEl.textContent = 'Please fill in all delivery address fields.'
      return
    }

    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'cod'

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, total, address, paymentMethod })
    })
    if (!res.ok) {
      statusEl.textContent = 'Failed to place order.'
      return
    }

    setCartItems([])
    if (typeof updateCartCount === 'function') updateCartCount()
    window.location.href = 'orders.html'
  })
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage()
  renderCheckoutPage()
  initCheckout()
})
