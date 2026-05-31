// ============================================================
// CART.JS — Logika Keranjang Belanja
// Menggunakan localStorage sebagai penyimpanan lintas halaman.
//
// Fungsi yang tersedia (dipakai file JS lain):
//   cartAmbil()          → ambil isi keranjang
//   cartTambah(id, nama, harga) → tambah/update item
//   cartKurang(id)       → kurangi jumlah item
//   cartHapus(id)        → hapus item dari keranjang
//   cartKosongkan()      → hapus semua item
//   cartHitungTotal()    → hitung total harga (number)
//   cartHitungJumlah()   → hitung total item (number)
//   formatRupiah(angka)  → format angka ke "Rp 25.000"
//   cartUpdateUI()       → update semua elemen UI keranjang
// ============================================================

// ------------------------------------------------------------
// KONSTANTA
// Kunci localStorage. Jangan diubah sembarangan —
// semua halaman pakai kunci yang sama.
// ------------------------------------------------------------

var CART_KEY = 'warung_keranjang';

// ------------------------------------------------------------
// FUNGSI DASAR: AMBIL & SIMPAN
// ------------------------------------------------------------

// Ambil data keranjang dari localStorage.
// Selalu kembalikan array, tidak pernah null.
function cartAmbil() {
  var data = localStorage.getItem(CART_KEY);
  if (data === null) {
    return [];
  }
  return JSON.parse(data);
}

// Simpan array keranjang ke localStorage.
function cartSimpan(keranjang) {
  localStorage.setItem(CART_KEY, JSON.stringify(keranjang));
}

// ------------------------------------------------------------
// FUNGSI UTILITY
// ------------------------------------------------------------

// Format angka integer ke string Rupiah.
// Contoh: 25000 → "Rp 25.000"
function formatRupiah(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

// ------------------------------------------------------------
// FUNGSI MANIPULASI KERANJANG
// ------------------------------------------------------------

// Tambah item ke keranjang.
// Jika item dengan id yang sama sudah ada, tambah jumlahnya.
// Jika belum ada, buat entri baru.
function cartTambah(id, nama, harga) {
  var keranjang = cartAmbil();
  var indexItem = -1;

  // Cari apakah item sudah ada di keranjang
  for (var i = 0; i < keranjang.length; i++) {
    if (keranjang[i].id === id) {
      indexItem = i;
      break;
    }
  }

  if (indexItem >= 0) {
    // Item sudah ada → tambah jumlah
    keranjang[indexItem].jumlah = keranjang[indexItem].jumlah + 1;
  } else {
    // Item belum ada → tambah baru
    keranjang.push({
      id: id,
      nama: nama,
      harga: harga,
      jumlah: 1
    });
  }

  cartSimpan(keranjang);
  cartUpdateUI();
}

// Kurangi jumlah item.
// Jika jumlah sudah 1 dan dikurangi, item dihapus otomatis.
function cartKurang(id) {
  var keranjang = cartAmbil();
  var keranjangBaru = [];

  for (var i = 0; i < keranjang.length; i++) {
    if (keranjang[i].id === id) {
      if (keranjang[i].jumlah > 1) {
        keranjang[i].jumlah = keranjang[i].jumlah - 1;
        keranjangBaru.push(keranjang[i]);
      }
      // Jika jumlah = 1, tidak push → otomatis terhapus
    } else {
      keranjangBaru.push(keranjang[i]);
    }
  }

  cartSimpan(keranjangBaru);
  cartUpdateUI();
}

// Hapus item sepenuhnya dari keranjang berdasarkan id.
function cartHapus(id) {
  var keranjang = cartAmbil();
  var keranjangBaru = [];

  for (var i = 0; i < keranjang.length; i++) {
    if (keranjang[i].id !== id) {
      keranjangBaru.push(keranjang[i]);
    }
  }

  cartSimpan(keranjangBaru);
  cartUpdateUI();
}

// Kosongkan seluruh isi keranjang.
function cartKosongkan() {
  localStorage.removeItem(CART_KEY);
  cartUpdateUI();
}

// ------------------------------------------------------------
// FUNGSI KALKULASI
// ------------------------------------------------------------

// Hitung total harga semua item di keranjang.
// Kembalikan angka (bukan string).
function cartHitungTotal() {
  var keranjang = cartAmbil();
  var total = 0;

  for (var i = 0; i < keranjang.length; i++) {
    total = total + (keranjang[i].harga * keranjang[i].jumlah);
  }

  return total;
}

// Hitung total jumlah item (bukan total harga).
// Contoh: 2x Nasi Goreng + 1x Es Teh = 3
function cartHitungJumlah() {
  var keranjang = cartAmbil();
  var total = 0;

  for (var i = 0; i < keranjang.length; i++) {
    total = total + keranjang[i].jumlah;
  }

  return total;
}

// ------------------------------------------------------------
// FUNGSI UI: UPDATE SEMUA ELEMEN KERANJANG DI HALAMAN
// Dipanggil setiap kali keranjang berubah.
// Aman dipanggil di halaman mana pun —
// pakai pengecekan null sebelum update elemen.
// ------------------------------------------------------------

function cartUpdateUI() {
  var jumlah = cartHitungJumlah();

  // --- Update badge counter di navbar (#cart-count) ---
  var elCounter = document.getElementById('cart-count');
  if (elCounter !== null) {
    elCounter.textContent = jumlah;
  }

  // --- Update floating cart bar di menu.html ---
  var elCartBar = docum
function cartUpdateUI() ;
