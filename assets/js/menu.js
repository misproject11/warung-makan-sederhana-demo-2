// ============================================================
// MENU.JS — Render Katalog Menu dari menu.json
//
// Alur kerja:
//   1. Fetch data dari data/menu.json
//   2. Render semua kartu menu ke #menu-grid
//   3. Pasang logika filter tab (show/hide via class)
//   4. Pasang event listener tombol "Tambah ke Keranjang"
//   5. Render 3 preview item di index.html (jika ada #preview-grid)
//
// Bergantung pada: cart.js (harus di-load lebih dulu)
// ============================================================

// ------------------------------------------------------------
// FUNGSI UTAMA: INISIALISASI
// Dipanggil satu kali saat halaman selesai dimuat.
// ------------------------------------------------------------

function inisialisasiMenu() {
  fetch('data/menu.json')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      var semuaMenu = data.menu;

      // Render kartu menu (hanya di menu.html)
      var elGrid = document.getElementById('menu-grid');
      if (elGrid !== null) {
        renderKartuMenu(semuaMenu, elGrid);
        pasangFilterTab(semuaMenu);
      }

      // Render preview (hanya di index.html)
      var elPreview = document.querySelector('.preview-grid');
      if (elPreview !== null) {
        renderPreviewMenu(semuaMenu, elPreview);
      }
    })
    .catch(function(error) {
      console.error('Gagal memuat menu.json:', error);
    });
}

// ------------------------------------------------------------
// FUNGSI: RENDER KARTU MENU
// Mengosongkan #menu-grid lalu mengisi ulang dengan
// kartu yang di-generate dari data JSON.
// ------------------------------------------------------------

function renderKartuMenu(semuaMenu, elGrid) {
  // Kosongkan contoh statis yang ada di HTML
  elGrid.innerHTML = '';

  for (var i = 0; i < semuaMenu.length; i++) {
    var item = semuaMenu[i];
    var htmlKartu = buatHtmlKartu(item);
    elGrid.innerHTML = elGrid.innerHTML + htmlKartu;
  }

  // Setelah semua kartu di-render, pasang event listener
  pasangTombolTambah(semuaMenu);
}

// ------------------------------------------------------------
// FUNGSI: BUAT HTML SATU KARTU
// Mengembalikan string HTML untuk satu item menu.
// ------------------------------------------------------------

function buatHtmlKartu(item) {
  // Tentukan class dan badge berdasarkan status tersedia
  var classHabis = '';
  var badgeHabis = '';
  var attrDisabled = '';

  if (item.tersedia === false) {
    classHabis = ' habis';
    badgeHabis = '<span class="badge-habis">Habis</span>';
    attrDisabled = ' disabled';
  }

  // Rakit HTML kartu
  var html = '';
  html += '<div class="kartu-menu' + classHabis + '" ';
  html += '     data-kategori="' + item.kategori + '">';
  html += '  <div class="kartu-gambar">';
  html += '    <img src="' + item.foto + '" alt="' + item.nama + '">';
  html += '    ' + badgeHabis;
  html += '  </div>';
  html += '  <div class="kartu-info">';
  html += '    <h3>' + item.nama + '</h3>';
  html += '    <p class="deskripsi">' + item.deskripsi + '</p>';
  html += '    <p class="harga">' + formatRupiah(item.harga) + '</p>';
  html += '  </div>';
  html += '  <div class="kartu-aksi">';
  html += '    <button class="btn-tambah"';
  html += '            data-id="' + item.id + '"';
  html += '            data-nama="' + item.nama + '"';
  html += '            data-harga="' + item.harga + '"';
  html += '            ' + attrDisabled + '>';
  html += '      + Tambah';
  html += '    </button>';
  html += '  </div>';
  html += '</div>';

  return html;
}

// ------------------------------------------------------------
// FUNGSI: PASANG EVENT LISTENER TOMBOL TAMBAH
// Dipanggil setelah semua kartu selesai di-render.
// Menggunakan event delegation pada #menu-grid
// agar satu listener menangani semua tombol sekaligus.
// ------------------------------------------------------------

function pasangTombolTambah(semuaMenu) {
  var elGrid = document.getElementById('menu-grid');
  if (elGrid === null) { return; }

  elGrid.addEventListener('click', function(event) {
    // Cek apakah yang diklik adalah tombol .btn-tambah
    var tombol = event.target;
    if (!tombol.classList.contains('btn-tambah')) { return; }
    if (tombol.disabled) { return; }

    var id    = tombol.getAttribute('data-id');
    var nama  = tombol.getAttribute('data-nama');
    var harga = parseInt(tombol.getAttribute('data-harga'), 10);

    // Panggil fungsi dari cart.js
    cartTambah(id, nama, harga);

    // Animasi feedback singkat pada tombol
    tombol.textContent = '✓ Ditambahkan';
    tombol.style.backgroundColor = '#4caf50';

    // Kembalikan teks tombol setelah 1 detik
    setTimeout(function() {
      tombol.textContent = '+ Tambah';
      tombol.style.backgroundColor = '';
    }, 1000);
  });
}

// ------------------------------------------------------------
// FUNGSI: PASANG LOGIKA FILTER TAB
// Klik tab → semua kartu dicek data-kategori-nya.
// Yang cocok ditampilkan, yang tidak disembunyikan.
// ------------------------------------------------------------

function pasangFilterTab(semuaMenu) {
  var tombolFilter = document.querySelectorAll('.btn-filter');
  if (tombolFilter.length === 0) { return; }

  for (var i = 0; i < tombolFilter.length; i++) {
    tombolFilter[i].addEventListener('click', function(event) {
      var filterDipilih = event.target.getAttribute('data-filter');

      // Update class "aktif" pada tombol
      for (var j = 0; j < tombolFilter.length; j++) {
        tombolFilter[j].classList.remove('aktif');
      }
      event.target.classList.add('aktif');

      // Show/hide kartu berdasarkan kategori
      var semuaKartu = document.querySelectorAll('.kartu-menu');
      for (var k = 0; k < semuaKartu.length; k++) {
        var kategoriKartu = semuaKartu[k].getAttribute('data-kategori');

        if (filterDipilih === 'semua' || kategoriKartu === filterDipilih) {
          semuaKartu[k].style.display = '';
        } else {
          semuaKartu[k].style.display = 'none';
        }
      }
    });
  }
}

// ------------------------------------------------------------
// FUNGSI: RENDER PREVIEW MENU (index.html)
// Ambil 3 item pertama yang tersedia, render ke .preview-grid.
// Menggantikan 3 kartu hardcode yang ada di HTML.
// ------------------------------------------------------------

function renderPreviewMenu(semuaMenu, elPreview) {
  // Filter hanya item yang tersedia
  var itemTersedia = [];
  for (var i = 0; i < semuaMenu.length; i++) {
    if (semuaMenu[i].tersedia === true) {
      itemTersedia.push(semuaMenu[i]);
    }
  }

  // Ambil maksimal 3 item
  var itemPreview = itemTersedia.slice(0, 3);

  elPreview.innerHTML = '';

  for (var j = 0; j < itemPreview.length; j++) {
    var item = itemPreview[j];
    var html = '';
    html += '<div class="preview-card">';
    html += '  <img src="' + item.foto + '" alt="' + item.nama + '">';
    html += '  <h4>' + item.nama + '</h4>';
    html += '  <p>' + formatRupiah(item.harga) + '</p>';
    html += '</div>';
    elPreview.innerHTML = elPreview.innerHTML + html;
  }
}

// ------------------------------------------------------------
// JALANKAN SAAT HALAMAN SIAP
// ------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
  inisialisasiMenu();
});