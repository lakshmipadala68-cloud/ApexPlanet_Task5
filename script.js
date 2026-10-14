
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 999,
        category: "Electronics",
        rating: 4.5,
        image: "images (4).jpg?text=Headphones"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 1499,
        category: "Electronics",
        rating: 4.8,
        image: "image2.webp?text=watch"
    },
    {
        id: 3,
        name: "Classic T-Shirt",
        price: 599,
        category: "Fashion",
        rating: 4.2,
        image: "images (3).jpg?text=T-Shirt"
    },
    {
        id: 4,
        name: "Running Shoes",
        price: 1299,
        category: "Shoes",
        rating: 4.6,
        image: "images (5).jpg?text=Running+Shoes"
    },
    {
        id: 5,
        name: "Travel Backpack",
        price: 899,
        category: "Accessories",
        rating: 4.3,
        image: "backpack.jpg?text=Backpack"
    },
    {
        id: 6,
        name: "Bluetooth Speaker",
        price: 799,
        category: "Electronics",
        rating: 4.4,
        image: "speakers.jpg?text=Speaker"
    }
];
const productContainer = document.getElementById("productContainer");
const searchForm = document.querySelector("header form");
const searchInput = document.querySelector('input[type="search"]');
const categoryButtons = document.querySelectorAll(".category-btn");
const cartContainer = document.getElementById("cartContainer");
const cartTotal = document.getElementById("cartTotal");


let selectedCategory = "All";
let searchText = "";
let sortOrder = "default";
let cart = loadCart();


function loadCart() {
    try {
        const savedCart = JSON.parse(localStorage.getItem("shopSmartCart"));
        return Array.isArray(savedCart) ? savedCart : [];
    } catch (error) {
        return [];
    }
}


function saveCart() {
    localStorage.setItem("shopSmartCart", JSON.stringify(cart));
}
function displayProducts() {
    let filteredProducts = products.filter(product => {
        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        const matchesSearch =
            product.name.toLowerCase().includes(searchText.toLowerCase()) ||
            product.category.toLowerCase().includes(searchText.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    if (sortOrder === "low-high") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "high-low") {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "rating") {
        filteredProducts.sort((a, b) => b.rating - a.rating);
    }

    if (filteredProducts.length === 0) {
        productContainer.innerHTML =
            "<p>No products found. Try another search.</p>";
        return;
    }

    productContainer.innerHTML = filteredProducts.map(product => `
        <article class="product-card">
            <img
                src="${product.image}"
                alt="${product.name}"
                loading="lazy"
                onerror="this.onerror=null;this.src='https://placehold.co/600x400/F1F5F9/12372A?text=Product';"
            >
            <h3>${product.name}</h3>
            <p>Category: ${product.category}</p>
            <p>Rating: ⭐ ${product.rating}</p>
            <p class="price">₹${product.price.toLocaleString("en-IN")}</p>
            <button type="button" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        </article>
    `).join("");
}


searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    searchText = searchInput.value.trim();
    displayProducts();
});

searchInput.addEventListener("input", function() {
    searchText = searchInput.value.trim();
    displayProducts();
});


categoryButtons.forEach(button => {
    button.addEventListener("click", function() {
        selectedCategory = button.dataset.category;

        categoryButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        displayProducts();
    });
});

function addToCart(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) return;

    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            quantity: 1
        });
    }

    saveCart();
    displayCart();
}

function changeQuantity(productId, amount) {
    const item = cart.find(product => product.id === productId);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(product => product.id !== productId);
    }

    saveCart();
    displayCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    displayCart();
}


function displayCart() {
    cart = cart.filter(item =>
        products.some(product => product.id === item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cartContainer.innerHTML = cart.map(item => {
            const product = products.find(p => p.id === item.id);

            return `
                <div class="cart-item">
                    <div>
                        <strong>${product.name}</strong>
                        <p>₹${product.price.toLocaleString("en-IN")} each</p>
                    </div>

                    <div class="cart-controls">
                        <button type="button"
                            onclick="changeQuantity(${product.id}, -1)"
                            aria-label="Decrease quantity">
                            −
                        </button>

                        <span>${item.quantity}</span>

                        <button type="button"
                            onclick="changeQuantity(${product.id}, 1)"
                            aria-label="Increase quantity">
                            +
                        </button>

                        <button type="button"
                            onclick="removeFromCart(${product.id})">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    const total = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + product.price * item.quantity;
    }, 0);

    cartTotal.textContent = total.toLocaleString("en-IN");
    saveCart();
}

function createSortControl() {
    const section = document.querySelector(".featured-products");

    if (!section || document.getElementById("sortProducts")) return;

    const sortLabel = document.createElement("label");
    sortLabel.htmlFor = "sortProducts";
    sortLabel.textContent = "Sort products: ";

    const sortSelect = document.createElement("select");
    sortSelect.id = "sortProducts";

    sortSelect.innerHTML = `
        <option value="default">Featured</option>
        <option value="low-high">Price: Low to High</option>
        <option value="high-low">Price: High to Low</option>
        <option value="rating">Highest Rated</option>
    `;

    sortSelect.addEventListener("change", function() {
        sortOrder = this.value;
        displayProducts();
    });

    const heading = section.querySelector("h2");
    heading.insertAdjacentElement("afterend", sortLabel);
    sortLabel.appendChild(sortSelect);
}

createSortControl();
displayProducts();
displayCart();

window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
