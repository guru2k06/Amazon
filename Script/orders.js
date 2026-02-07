function formatMoney(value) {
  return `$${value.toFixed(2)}`
}

async function loadOrders() {
  const statusEl = document.getElementById('orders-status')
  const listEl = document.getElementById('orders-list')
  if (!statusEl || !listEl) return

  const res = await fetch('/api/orders')
  if (res.status === 401) {
    statusEl.textContent = 'Please login to see your orders.'
    return
  }

  const data = await res.json().catch(() => ({ orders: [] }))
  const orders = data.orders || []
  if (!orders.length) {
    statusEl.textContent = 'No orders yet.'
    return
  }

  statusEl.textContent = ''
  listEl.innerHTML = ''
  orders.forEach(order => {
    const div = document.createElement('div')
    div.className = 'panel'
    const itemsHtml = order.items.map(item => `${item.title} x ${item.qty}`).join(', ')
    div.innerHTML = `
      <div><strong>Order #${order.id}</strong></div>
      <div class="muted">${order.createdAt}</div>
      <div>${itemsHtml}</div>
      <div><strong>Total:</strong> ${formatMoney(order.total)}</div>
    `
    listEl.appendChild(div)
  })
}

const logoutBtn = document.getElementById('logout-btn')
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = 'login.html'
  })
}

document.addEventListener('DOMContentLoaded', loadOrders)
