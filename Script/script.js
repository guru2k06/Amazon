let cartCount = 0

function addItemCount(){
    cartCount += 1
    const cartElem = document.querySelector('.cart-count')
    if (cartElem) cartElem.textContent = cartCount
    return cartCount
}

function removeItemCount(){
    cartCount -= 1
    if (cartCount < 0) cartCount = 0
    const cartElem = document.querySelector('.cart-count')
    if (cartElem) cartElem.textContent = cartCount
    return cartCount
}

document.addEventListener('DOMContentLoaded', ()=>{
    // initialize cart count from DOM if present
    const cartElem = document.querySelector('.cart-count')
    if (cartElem) cartCount = parseInt(cartElem.textContent,10) || 0

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
