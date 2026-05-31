// ============================================================
// WHATSAPP.JS — Logika Halaman Order & Kirim Pesan WA
//
// Alur kerja:
//   1. Render daftar item dari keranjang (localStorage)
//   2. Tampilkan/sembunyikan input alamat sesuai pilihan kurir
//   3. Validasi form sebelum kirim
//   4. Rakit format teks WhatsApp & buka wa.me link
//
// Bergantung pada: cart.js (harus di-load lebih dulu)
// ============================================================

// ------------------------------------------------------------
// KONFIGURASI TOKO
// Ganti nomor WA sesuai nomor klien.
// Format: kode negara + nomor tanpa tanda + atau 0 di depan.
// Contoh: 628123456789 (Indonesia, nomor 08123456789)
// ------------------------------------------------------------

var NOMOR_WA   = '6281200000000';
var NAMA_TOKO  = 'Warung Makan Sederhana';

// ------------------------------------------------------------
// FUNGSI UTAMA: INISIALISASI HALAMAN ORDER
// Dipanggil satu kali saat halaman order.html selesai dimuat.
// ------------------------------------------------------------

function inisialisasiOrder() {
  renderDaftarItem();
  pasangListenerKurir();
  pasangListenerTombolWA();
}

// ------------------------------------------------------------
// FUNGSI: RENDER DAFTAR ITEM DI HALAMAN ORDER
// Membaca keranjang dari localStorage,
// lalu mengisi #daftar-item dan #total-harga.
// ------------------------------------------------------------

function renderDaftarItem() {
  var elDaftar = document.getElementById('daftar-item');
  if (elDaftar === null) { return; }

  var keranjang = cartAmbil();
  elDaftar.innerHTML = '';

  if (keranjang.length === 0) {
    cartUpdateUI();
    return;
  }

  // Render setiap baris item
  for (var i = 0; i < keranjang.length; i++) {
    var item = keranjang[i];
    var html = '';

    html += '<div class="baris-item">';
    html += '  <div class="item-info">';
    html += '    <span class="item-nama">' + item.nama + '</span>';
    html += '    <span class="item-harga">' + formatRupiah(item.harga) + ' / porsi</span>';
    html += '  </div>';
    html += '  <div class="item-kontrol">';
    html += '    <button class="btn-kurang" data-id="' + item.id + '">−</button>';
    html += '    <span class="item-jumlah">' + item.jumlah + '</span>';
    html += '    <button class="btn-tambah-kecil" data-id="' + item.id + '" ';
    html += '            data-nama="' + item.nama + '" ';
    html += '            data-harga="' + item.harga + '">+</button>';
    html += '    <button class="btn-hapus" data-id="' + item.id + '">🗑</button>';
    html += '  </div>';
    html += '  <span class="item-subtotal">';
    html +=      formatRupiah(item.harga * item.jumlah);
    html += '  </span>';
    html += '</div>';

    elDaftar.innerHTML = elDaftar.innerHTML + html;
  }

  // Update total harga
  var elTotal = document.getElementById('total-harga');
  if (elTotal !== null) {
    elTotal.textContent = formatRupiah(cartHitungTotal());
  }

  // Pasang listener pada tombol +/−/hapus
  pasangListenerKontrolItem();

  // Update state UI (tampilkan/sembunyikan section)
  cartUpdateUI();
}

// ------------------------------------------------------------
// FUNGSI: LISTENER TOMBOL +/−/HAPUS DI DAFTAR ITEM
// Menggunakan event delegation pada #daftar-item.
// Setiap perubahan → re-render seluruh daftar.
// ------------------------------------------------------------

function pasangListenerKontrolItem() {
  var elDaftar = document.getElementById('daftar-item');
  if (elDaftar === null) { return; }

  elDaftar.addEventListener('click', function(event) {
    var tombol = event.target;
    var id = tombol.getAttribute('data-id');
    if (id === null) { return; }

    if (tombol.classList.contains('btn-kurang')) {
      cartKurang(id);
      renderDaftarItem();
    }

    if (tombol.classList.contains('btn-tambah-kecil')) {
      var nama  = tombol.getAttribute('data-nama');
      var harga = parseInt(tombol.getAttribute('data-harga'), 10);
      cartTambah(id, nama, harga);
      renderDaftarItem();
    }

    if (tombol.classList.contains('btn-hapus')) {
      cartHapus(id);
      renderDaftarItem();
    }
  });
}

// ------------------------------------------------------------
// FUNGSI: LISTENER PILIHAN KURIR
// Jika kurir = "Ambil Sendiri" → sembunyikan input alamat.
// Jika kurir lain → tampilkan input alamat.
// ------------------------------------------------------------

function pasangListenerKurir() {
  var semuaRadio = document.querySelectorAll('input[name="kurir"]');
  if (semuaRadio.length === 0) { return; }

  for (var i = 0; i < semuaRadio.length; i++) {
    semuaRadio[i].addEventListener('change', function(event) {
      toggleInputAlamat(event.target.value);
    });
  }

  // Jalankan sekali saat halaman dibuka
  // sesuai radio button yang ter-checked secara default
  var radioDefault = document.querySelector('input[name="kurir"]:checked');
  if (radioDefault !== null) {
    toggleInputAlamat(radioDefault.value);
  }
}

function toggleInputAlamat(nilaiKurir) {
  var elWrapper = document.getElementById('wrapper-alamat');
  if (elWrapper === null) { return; }

  if (nilaiKurir === 'Ambil Sendiri') {
    elWrapper.classList.remove('alamat-tampil');
    elWrapper.classList.add('alamat-sembunyi');
  } else {
    elWrapper.classList.remove('alamat-sembunyi');
    elWrapper.classList.add('alamat-tampil');
  }

  // Bersihkan pesan error alamat saat opsi berubah
  var elError = document.getElementById('error-alamat');
  if (elError !== null) {
    elError.textContent = '';
  }
}

// ------------------------------------------------------------
// FUNGSI: VALIDASI FORM SEBELUM KIRIM
// Mengembalikan true jika valid, false jika ada error.
// ------------------------------------------------------------

function validasiForm() {
  var elError = document.getElementById('error-alamat');

  var radioTerpilih = document.querySelector('input[name="kurir"]:checked');
  if (radioTerpilih === null) { return false; }

  var nilaiKurir = radioTerpilih.value;

  // Jika bukan ambil sendiri, alamat wajib diisi
  if (nilaiKurir !== 'Ambil Sendiri') {
    var elAlamat = document.getElementById('input-alamat');
    var isiAlamat = elAlamat.value.trim();

    if (isiAlamat === '') {
      if (elError !== null) {
        elError.textContent = '⚠ Alamat wajib diisi untuk pengiriman.';
      }
      elAlamat.focus();
      return false;
    }
  }

  // Keranjang tidak boleh kosong
  if (cartHitungJumlah() === 0) {
    return false;
  }

  return true;
}

// ------------------------------------------------------------
// FUNGSI: RAKIT FORMAT TEKS WHATSAPP
// Menghasilkan string teks yang sudah diformat.
// ------------------------------------------------------------

function rakitPesanWA() {
  var keranjang = cartAmbil();

  var radioTerpilih = document.querySelector('input[name="kurir"]:checked');
  var nilaiKurir    = radioTerpilih ? radioTerpilih.value : 'Ambil Sendiri';

  var elAlamat  = document.getElementById('input-alamat');
  var elCatatan = document.getElementById('input-catatan');

  var isiAlamat  = elAlamat  ? elAlamat.value.trim()  : '';
  var isiCatatan = elCatatan ? elCatatan.value.trim()  : '';

  // --- Mulai rakit pesan ---
  var pesan = '';
  pesan += '*Pesanan Baru - ' + NAMA_TOKO + '*\n';
  pesan += '-------------------------\n';

  for (var i = 0; i < keranjang.length; i++) {
    var item = keranjang[i];
    pesan += '- ' + item.jumlah + 'x ' + item.nama;
    pesan += ' (' + formatRupiah(item.harga * item.jumlah) + ')\n';
  }

  pesan += '-------------------------\n';
  pesan += '*Total: ' + formatRupiah(cartHitungTotal()) + '*\n';
  pesan += '\n';
  pesan += 'Opsi Pengiriman: ' + nilaiKurir + '\n';

  if (nilaiKurir !== 'Ambil Sendiri' && isiAlamat !== '') {
    pesan += 'Alamat: ' + isiAlamat + '\n';
  }

  if (isiCatatan !== '') {
    pesan += 'Catatan: ' + isiCatatan + '\n';
  }

  return pesan;
}

// ------------------------------------------------------------
// FUNGSI: LISTENER TOMBOL KIRIM WA
// Validasi → rakit pesan → buka wa.me link.
// ------------------------------------------------------------

function pasangListenerTombolWA() {
  var elTombol = document.getElementById('btn-wa');
  if (elTombol === null) { return; }

  elTombol.addEventListener('click', function() {
    if (!validasiForm()) { return; }

    var pesan      = rakitPesanWA();
    var pesanEncode = encodeURIComponent(pesan);
    var urlWA      = 'https://wa.me/' + NOMOR_WA + '?text=' + pesanEncode;

    // Buka WhatsApp di tab baru
    window.open(urlWA, '_blank');
  });
}

// ------------------------------------------------------------
// JALANKAN SAAT HALAMAN SIAP
// ------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
  // Hanya jalankan jika elemen order ada di halaman ini
  var elTombolWA = document.getElementById('btn-wa');
  if (elTombolWA !== null) {
    inisialisasiOrder();
  }
});