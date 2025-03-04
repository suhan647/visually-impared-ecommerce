export function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }
  
  export function addToCart(product) {
    let cart = getCart();
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  
  export function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(product => product.id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  