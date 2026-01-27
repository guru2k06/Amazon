let cartCount = 0

function addItemCount(){
    cartCount += 1
    const cartElem = document.querySelector('.cart-count')
    if (cartElem) cartElem.textContent = cartCount
    console.log('cartCount:', cartCount)
    return cartCount
}

function removeItemCount(){
    cartCount -= 1
    if (cartCount < 0) cartCount = 0
    const cartElem = document.querySelector('.cart-count')
    if (cartElem) cartElem.textContent = cartCount
    console.log('cartCount:', cartCount)
    return cartCount
}
