let cartCount = 0

function addItemCount(){
    cartCount += 1
    const cartElem = document.querySelector('.cart-count')
    if (cartElem) cartElem.textContent = cartCount
    console.log('cartCount:', cartCount)
    return cartCount
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.remove-button').forEach(btn => {
        if (btn.textContent.trim() === 'Remove from Cart') btn.textContent = 'Add to Cart'
        // avoid adding duplicate listeners when HTML already uses onclick
        btn.addEventListener('click', addItemCount)
    })
})