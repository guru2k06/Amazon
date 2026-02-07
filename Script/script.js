const CART_KEY = 'amazon_cart'

function getCartItems(){
    try{
        const raw = localStorage.getItem(CART_KEY)
        return raw ? JSON.parse(raw) : []
    }catch{
        return []
    }
}

function setCartItems(items){
    localStorage.setItem(CART_KEY, JSON.stringify(items))
}

function updateCartCount(){
    const cartElem = document.querySelector('.cart-count')
    if (!cartElem) return
    const items = getCartItems()
    const count = items.reduce((sum, item)=> sum + (item.qty || 0), 0)
    cartElem.textContent = count
}

function addToCartFromButton(button){
    const card = button.closest('.product-card')
    if (!card) return
    const title = card.querySelector('.product-title')?.textContent?.trim() || 'Item'
    const priceText = card.querySelector('.product-price')?.textContent || '$0'
    const price = parseFloat(priceText.replace(/[^0-9.]/g,'')) || 0
    const img = card.querySelector('.product-img')?.getAttribute('src') || ''

    const items = getCartItems()
    const existing = items.find(item => item.title === title)
    if (existing){
        existing.qty += 1
    } else {
        items.push({ title, price, img, qty: 1 })
    }
    setCartItems(items)
    updateCartCount()
}

function removeFromCartFromButton(button){
    const card = button.closest('.product-card')
    if (!card) return
    const title = card.querySelector('.product-title')?.textContent?.trim() || 'Item'
    const items = getCartItems()
    const idx = items.findIndex(item => item.title === title)
    if (idx >= 0){
        items[idx].qty -= 1
        if (items[idx].qty <= 0) items.splice(idx, 1)
        setCartItems(items)
        updateCartCount()
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    updateCartCount()

    // hamburger toggle
    const hamburger = document.querySelector('.hamburger')
    const mobileNav = document.querySelector('.mobile-nav')
    if (hamburger && mobileNav){
        hamburger.addEventListener('click', ()=>{
            const open = mobileNav.classList.toggle('open')
            hamburger.setAttribute('aria-expanded', open ? 'true' : 'false')
            mobileNav.setAttribute('aria-hidden', open ? 'false' : 'true')
        })
    }
})
