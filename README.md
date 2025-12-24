# 📄 Fiyat Teklifi Uygulaması

Modern, kullanıcı dostu bir web tabanlı fiyat teklifi (quotation) uygulaması. Tamamen LocalStorage ile çalışır, herhangi bir backend'e ihtiyaç duymaz.

## ✨ Özellikler

### 🏢 Firma Yönetimi
- Firma bilgilerini (logo, adres, vergi no, vb.) kaydetme
- Logo yükleme ve önizleme
- Bilgileri düzenleme

### 📦 Ürün Kütüphanesi
- Ürün ekleme, düzenleme ve silme
- Ürün arama ve filtreleme
- Birim fiyat ve KDV oranı tanımlama
- Farklı birimler (Adet, Kg, Metre, vb.)

### 💼 Teklif Oluşturma
- Müşteri bilgileri girişi
- Ürün kütüphanesinden hızlı seçim
- Miktar, fiyat, iskonto ve KDV hesaplaması
- Otomatik toplam hesaplamaları
- Ek notlar ekleme

### 📄 PDF Çıktısı
- E-arşiv formatında profesyonel PDF oluşturma
- Firma logosu ve bilgileri
- Detaylı ürün listesi
- Toplam hesaplamalar
- Tek tıkla PDF indirme

### 📚 Geçmiş Teklifler
- Tüm teklifleri görüntüleme
- Teklif arama ve filtreleme
- Eski teklifleri düzenleme
- PDF olarak tekrar çıktı alma
- Teklif silme

### 💾 Veri Yönetimi
- Tüm veriler LocalStorage'da
- JSON formatında dışa aktarma
- JSON dosyasından içe aktarma
- Farklı cihazlar arası veri taşıma

## 🚀 Kurulum

### GitHub Pages'te Yayınlama

1. Bu projeyi GitHub'a yükleyin:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/quotation-app.git
git push -u origin main
```

2. GitHub repository ayarlarından:
   - **Settings** → **Pages**
   - **Source**: `main` branch seçin
   - **Save** butonuna tıklayın

3. Birkaç dakika içinde siteniz yayında olacak:
   `https://KULLANICI_ADINIZ.github.io/quotation-app/`

### Yerel Kullanım

Projeyi doğrudan tarayıcıda açabilirsiniz:

```bash
# Basit HTTP sunucu başlatma (Python 3)
python3 -m http.server 8000

# veya Node.js ile
npx serve
```

Tarayıcınızda `http://localhost:8000` adresini açın.

## 📖 Kullanım Kılavuzu

### İlk Kurulum

1. **Firma Bilgilerinizi Girin**
   - Sol menüden "Firma Bilgileri" seçin
   - Firma adı, logo, adres gibi bilgileri doldurun
   - "Kaydet" butonuna tıklayın

2. **Ürün Kütüphanesini Oluşturun**
   - "Ürün Yönetimi" bölümüne gidin
   - "Yeni Ürün" butonuna tıklayın
   - Ürün bilgilerini girin ve kaydedin

### Teklif Oluşturma

1. "Yeni Teklif" sekmesine gidin
2. Müşteri bilgilerini doldurun
3. Ürün ekleyin:
   - Kütüphaneden seçin veya yeni ürün girin
   - Miktar, fiyat, iskonto bilgilerini girin
   - "Listeye Ekle" butonuna tıklayın
4. Gerekirse ek notlar ekleyin
5. "Teklifi Kaydet" veya "PDF Oluştur" butonuna tıklayın

### Veri Yedekleme

Verilerinizi yedeklemek için:
- Sol alttaki "Verileri Dışa Aktar" butonuna tıklayın
- JSON dosyası indirilecektir
- Bu dosyayı güvenli bir yerde saklayın

Verileri geri yüklemek için:
- "Verileri İçe Aktar" butonuna tıklayın
- Yedek JSON dosyanızı seçin

## 🛠️ Teknik Detaylar

### Kullanılan Teknolojiler
- **HTML5**: Yapı
- **CSS3**: Modern ve responsive tasarım
- **Vanilla JavaScript**: İşlevsellik
- **LocalStorage API**: Veri saklama
- **jsPDF**: PDF oluşturma
- **FileReader API**: Logo yükleme

### Tarayıcı Desteği
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### Veri Yapısı

Tüm veriler LocalStorage'da şu anahtarlarla saklanır:
- `quotation_company`: Firma bilgileri
- `quotation_products`: Ürün listesi
- `quotation_offers`: Geçmiş teklifler
- `quotation_current_offer`: Aktif taslak (opsiyonel)

## 🎨 Özelleştirme

### Renk Teması
`style.css` dosyasındaki CSS değişkenlerini düzenleyerek renk temasını değiştirebilirsiniz:

```css
:root {
    --primary-color: #2563eb;  /* Ana renk */
    --success-color: #10b981;  /* Başarı rengi */
    /* ... */
}
```

### KDV Oranları
`index.html` dosyasındaki KDV select elementini düzenleyerek farklı oranlar ekleyebilirsiniz.

## 📱 Responsive Tasarım

Uygulama mobil cihazlarda da sorunsuz çalışır:
- Telefon
- Tablet
- Masaüstü

## 🔒 Gizlilik

- Tüm veriler tarayıcınızın LocalStorage'ında saklanır
- Hiçbir veri sunucuya gönderilmez
- Tamamen offline çalışır
- Gizliliğiniz %100 korunur

## 🐛 Sorun Giderme

### Veriler kayboldu
- Tarayıcı geçmişini/cache'i temizlerseniz veriler silinir
- Düzenli olarak "Verileri Dışa Aktar" ile yedek alın

### PDF oluşturulmuyor
- Tarayıcınızın JavaScript'i etkinleştirdiğinden emin olun
- Pop-up engelleyicisi varsa devre dışı bırakın

### Logo görünmüyor
- Sadece resim dosyaları (JPG, PNG) desteklenir
- Dosya boyutu 2MB'dan küçük olmalı

## 📄 Lisans

MIT License - İstediğiniz gibi kullanabilir, değiştirebilir ve paylaşabilirsiniz.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

Sorularınız için GitHub Issues kullanabilirsiniz.

---

**Not**: Bu uygulama eğitim ve kişisel kullanım amaçlıdır. Ticari kullanım için muhasebe yazılımları ile entegrasyon önerilir.

## 🎯 Gelecek Özellikler

- [ ] Çoklu dil desteği
- [ ] Tema değiştirme (Dark mode)
- [ ] Excel import/export
- [ ] E-posta gönderme entegrasyonu
- [ ] Bulut senkronizasyonu (opsiyonel)
- [ ] Şablon sistemleri
- [ ] Otomatik yedekleme

---

⭐ Beğendiyseniz yıldız vermeyi unutmayın!
