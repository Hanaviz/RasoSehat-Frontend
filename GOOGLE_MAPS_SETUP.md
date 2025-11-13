# Google Maps Integration Setup Guide

## Masalah
Maps tidak berfungsi karena API key tidak valid atau belum dikonfigurasi.

## Solusi

### 1. Dapatkan Google Maps API Key Anda Sendiri

#### Langkah-langkah:
1. Buka https://console.cloud.google.com
2. Buat project baru atau pilih project yang ada
3. Aktifkan API ini:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Buat API Key di Menu "Credentials" > "Create Credentials" > "API Key"
5. Batasi penggunaan API key:
   - Set "Application restrictions" ke "HTTP referrers"
   - Tambahkan domain Anda (localhost, production domain)
   - Set "API restrictions" ke hanya Maps APIs yang diperlukan

### 2. Update API Key di index.html

Buka file `index.html` dan ganti bagian ini:

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBkLr-_2x9x8xrxkR5xFx-dxRhA_DxQ5kI&libraries=places,geocoding"></script>
```

Dengan API key Anda:

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places,geocoding"></script>
```

### 3. Test di Browser

1. Buka http://localhost:5175
2. Login/Sign in
3. Lihat HeroSection
4. Klik field "Cari Makanan di Sekitar Anda"
5. Google Maps modal harus muncul dengan peta Padang

## Troubleshooting

### Error: "Google Maps API tidak merespons"
- Periksa API key di index.html
- Pastikan API key memiliki izin untuk Maps JavaScript API
- Periksa di browser DevTools > Console untuk error lebih detail

### Maps tidak menampilkan
- Buka browser DevTools (F12)
- Lihat tab Console untuk error messages
- Periksa Network tab untuk memastikan script Google Maps ter-load

### Error: "Geocoding request denied"
- Pastikan Geocoding API sudah diaktifkan di Google Cloud Console
- Pastikan API key memiliki permission untuk Geocoding API

## Testing dengan API Key Demo (Development Only)

Untuk testing lokal tanpa API key, Anda bisa menggunakan:
- Simulator di browser DevTools
- Mock data untuk development

Namun untuk production, gunakan API key yang valid.

## Environment Variables (Opsional)

Untuk security yang lebih baik, buat file `.env`:

```
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

Kemudian update index.html untuk menggunakan dari `.env`:

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geocoding"></script>
```

Namun ini memerlukan konfigurasi build yang lebih kompleks.

## Fitur yang Sudah Diimplementasi

✅ Google Maps Modal Dialog
✅ Draggable Marker
✅ Click to Select Location
✅ Geocoding (Coordinates to Address)
✅ Error Handling & Messages
✅ Responsive Design (Mobile + Desktop)
✅ Smooth Animations

## Next Steps

Setelah mengatur API key:
1. Test location selection
2. Verify coordinates are correct
3. Check if address name appears in input field
4. Test search with selected location
