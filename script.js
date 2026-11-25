let cart = JSON.parse(localStorage.getItem("lavelleCart") || "[]");

const FALLBACK_CAKE_IMG =
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80";

function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

function saveCart() {
  localStorage.setItem("lavelleCart", JSON.stringify(cart));
  updateCart();
}

function showAddedNotice(name) {
  const notice = document.getElementById("cartNotice");
  if (notice) {
    notice.textContent = `${name} ditambahkan ke keranjang.`;
    notice.classList.remove("d-none");
    clearTimeout(notice._hideTimer);
    notice._hideTimer = setTimeout(() => notice.classList.add("d-none"), 2500);
    return;
  }

  let toast = document.getElementById("floatingCartToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "floatingCartToast";
    toast.style.cssText =
      "position:fixed;bottom:20px;right:20px;z-index:1080;background:#3e2922;color:#fff;padding:12px 18px;border-radius:10px;font-size:12px;box-shadow:0 10px 25px rgba(0,0,0,.2);max-width:300px;";
    document.body.appendChild(toast);
  }
  toast.textContent = `${name} ditambahkan ke keranjang.`;
  toast.style.display = "block";
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.style.display = "none";
  }, 2400);
}

function addToCart(name, price) {
  const found = cart.find(item => item.name === name);
  if (found) found.quantity += 1;
  else cart.push({ name, price, quantity: 1 });
  saveCart();
  showAddedNotice(name);
}

function updateCart() {
  const count = document.getElementById("cartCount");
  if (count) {
    count.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }
  renderCart();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const totalNode = document.getElementById("cartTotal");
  if (!container || !totalNode) return;

  if (!cart.length) {
    container.innerHTML = '<p class="text-center text-secondary py-4">Keranjang masih kosong.</p>';
    totalNode.textContent = rupiah(0);
    return;
  }

  let total = 0;
  container.innerHTML = cart
    .map((item, index) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      return `<div class="cart-item">
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <small>${rupiah(item.price)} × ${item.quantity}</small>
          <small class="fw-semibold">${rupiah(subtotal)}</small>
        </div>
        <div class="cart-quantity">
          <button type="button" onclick="changeQuantity(${index},-1)" aria-label="Kurangi">−</button>
          <span>${item.quantity}</span>
          <button type="button" onclick="changeQuantity(${index},1)" aria-label="Tambah">+</button>
          <button type="button" class="cart-remove" onclick="removeItem(${index})" aria-label="Hapus"><i class="bi bi-trash"></i></button>
        </div>
      </div>`;
    })
    .join("");

  totalNode.textContent = rupiah(total);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function changeQuantity(index, amount) {
  if (!cart[index]) return;
  cart[index].quantity += amount;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
}

function checkout() {
  if (!cart.length) {
    alert("Keranjang masih kosong. Pilih produk terlebih dahulu.");
    return;
  }
  const lines = cart.map(
    item => `${item.name} x${item.quantity} = ${rupiah(item.price * item.quantity)}`
  );
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  alert(
    "RINGKASAN PESANAN CEYCAKES\n\n" +
      lines.join("\n") +
      "\n\nTotal: " +
      rupiah(total) +
      "\n\nSilakan hubungi toko untuk konfirmasi. Ini belum merupakan transaksi."
  );
}

function setupImageFallbacks() {
  document.querySelectorAll("img").forEach(img => {
    img.addEventListener("error", () => {
      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = "true";
        img.src = FALLBACK_CAKE_IMG;
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCart();
  setupImageFallbacks();

  const navbar = document.querySelector(".bakery-navbar");
  const updateNavbar = () => navbar?.classList.toggle("scrolled", window.scrollY > 20);
  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      const name = document.getElementById("customerName").value.trim();
      const email = document.getElementById("customerEmail").value.trim();
      const message = document.getElementById("customerMessage").value.trim();
      const result = document.getElementById("formResult");
      result.innerHTML = `Terima kasih, <strong>${escapeHTML(name)}</strong> (${escapeHTML(email)}). Pesan demo "${escapeHTML(message.slice(0, 80))}${message.length > 80 ? "..." : ""}" berhasil divalidasi di browser. Belum dikirim ke toko.`;
      result.classList.remove("d-none");
      contactForm.reset();
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});