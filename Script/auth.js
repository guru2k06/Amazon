const messageEl = document.getElementById('auth-message')

function showMessage(text, isError) {
  if (!messageEl) return
  messageEl.textContent = text
  messageEl.style.color = isError ? '#b00020' : '#0b3d91'
}

async function postJson(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(payload.error || 'Request failed')
  return payload
}

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value
  try {
    await postJson('/api/login', { email, password })
    showMessage('Login successful. Redirecting...', false)
    setTimeout(() => { window.location.href = 'orders.html' }, 400)
  } catch (err) {
    showMessage(err.message, true)
  }
})

document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('register-email').value
  const password = document.getElementById('register-password').value
  try {
    await postJson('/api/register', { email, password })
    showMessage('Account created. You can login now.', false)
  } catch (err) {
    showMessage(err.message, true)
  }
})

fetch('/api/me')
  .then(res => res.json())
  .then(data => {
    if (data.loggedIn) showMessage(`Logged in as ${data.email}`, false)
  })
  .catch(() => {})
