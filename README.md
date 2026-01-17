# 📖 Masal Yaratıcısı (Tale Creator)

**Masal Yaratıcısı**, yapay zeka desteğiyle çocuklar ve hayal gücünü geliştirmek isteyen herkes için özgün masallar oluşturan etkileşimli bir web uygulamasıdır. Kullanıcıdan alınan anahtar kelimeler ve tercihler doğrultusunda saniyeler içinde benzersiz hikayeler kurgular.

![Proje Durumu](https://img.shields.io/badge/Durum-Aktif-brightgreen)
![Lisans](https://img.shields.io/badge/Lisans-MIT-blue)
![React](https://img.shields.io/badge/Frontend-React-61dafb?logo=react)
![AI](https://img.shields.io/badge/AI-Gemini_3-orange)

## ✨ Özellikler

* **Kişiselleştirilmiş Hikayeler:** Kahraman ismi, masalın konusu ve sayfa sayısını kullanıcı belirler.
* **Yapay Zeka Entegrasyonu:** Google Gemini 3 Pro kullanarak her seferinde farklı, detaylı ve tutarlı masallar üretir.
* **Zengin İçerik:** Her sayfa 120-150 kelime uzunluğunda, detaylı betimlemeler ve diyaloglarla zenginleştirilmiş.
* **Otomatik Görsel Üretimi:** Her sayfa için Gemini 2.5 Flash Image ile Pixar tarzı 3D görseller.
* **Seslendirme Desteği:** Gemini 2.5 Flash TTS ile Türkçe sesli okuma.
* **Hız Kontrolü:** Ses hızını ayarlama (Yavaş, Normal, Hızlı).
* **Modern Arayüz:** Kullanıcı dostu, göz yormayan ve mobil uyumlu (Responsive) tasarım.

## 🛠️ Kullanılan Teknolojiler

Bu proje, hız ve kullanıcı deneyimi ön planda tutularak aşağıdaki teknolojilerle geliştirilmiştir:

- **Framework:** [React.js](https://reactjs.org/) (Vite ile optimize edilmiştir)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (CDN)
- **State Management:** React Hooks
- **AI Models:** 
  - Google Gemini 3 Pro Preview (Metin üretimi)
  - Gemini 2.5 Flash Image (Görsel üretimi)
  - Gemini 2.5 Flash TTS (Sesli okuma)

## 🚀 Kurulum ve Çalıştırma

Projeyi kendi yerel bilgisayarınızda çalıştırmak için:

1.  **Depoyu klonlayın:**
    ```bash
    git clone https://github.com/CanerKarul/Masal-Yaraticisi.git
    ```
2.  **Dizine gidin:**
    ```bash
    cd Masal-Yaraticisi
    ```
3.  **Bağımlılıkları yükleyin:**
    ```bash
    npm install
    ```
4.  **API Anahtarınızı Tanımlayın:**
    
    `.env` dosyası oluşturun ve Gemini API anahtarınızı ekleyin:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```
    
    > API anahtarı almak için: [Google AI Studio](https://aistudio.google.com/app/apikey)
    
5.  **Uygulamayı başlatın:**
    ```bash
    npm run dev
    ```
    
    Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 🚀 Deployment (Yayınlama)

### Netlify ile Deployment

1. [Netlify](https://www.netlify.com/) hesabınıza giriş yapın
2. "New site from Git" seçeneğini tıklayın
3. GitHub repository'nizi bağlayın
4. Build ayarları:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Environment Variables bölümüne gidin ve ekleyin:
   - Key: `VITE_GEMINI_API_KEY`
   - Value: `your_gemini_api_key`
6. "Deploy site" butonuna tıklayın

### Vercel ile Deployment

1. [Vercel](https://vercel.com/) hesabınıza giriş yapın
2. "Import Project" seçeneğini tıklayın
3. GitHub repository'nizi seçin
4. Framework Preset: Vite
5. Environment Variables bölümüne ekleyin:
   - Name: `VITE_GEMINI_API_KEY`
   - Value: `your_gemini_api_key`
6. "Deploy" butonuna tıklayın

> **Önemli:** Production ortamında API anahtarınızı korumak için Google Cloud Console'da domain restriction ve rate limiting ayarlarını yapmanız önerilir.

## 📝 Örnek Kullanım Senaryosu

1. **Masal Konusu Girin:** "Uzayda kaybolan kedi yavrusu" gibi bir konu yazın
2. **Kahraman İsmi (İsteğe Bağlı):** Örneğin "Pamuk" 
3. **Sayfa Sayısı Seçin:** 3-8 arası (varsayılan: 5)
4. **"Masalı Başlat!" Butonuna Tıklayın**
5. **Masalınızı Okuyun ve Dinleyin:** 
   - Her sayfada otomatik oluşturulan görseller
   - Play butonuyla sesli okuma
   - Ok tuşlarıyla sayfa geçişi
   - Ses hızını ayarlama seçeneği

## 🎯 Özellikler ve İyileştirmeler

### ✅ Tamamlanan
- Gemini 3 Pro ile zengin içerik üretimi
- Otomatik görsel ve ses üretimi
- Lazy loading ile performans optimizasyonu
- Responsive tasarım
- Ses hızı kontrolü
- Prefetching ile hızlı sayfa geçişleri

### 🔜 Planlanan Özellikler
- Kullanıcı kimlik doğrulama (Firebase/Clerk)
- Veritabanı entegrasyonu (masalları kaydetme)
- Ödeme sistemi (Shopier entegrasyonu)
- Reklam sistemi
- Masal kategorileri
- Favori masallar
- Paylaşım özellikleri

## 🤝 Katkıda Bulunma

Geliştirmelere katkıda bulunmak isterseniz:
1. Projeyi fork'layın
2. Yeni bir özellik dalı (branch) açın (`git checkout -b feature/yenilik`)
3. Değişikliklerinizi kaydedin (`git commit -am 'Yeni masal türü eklendi'`)
4. Dalınızı push'layın (`git push origin feature/yenilik`)
5. Bir Pull Request oluşturun

## 📄 Lisans

Bu proje **MIT** lisansı ile korunmaktadır.

---

**Developed with ✨ by [Caner Karul](https://github.com/CanerKarul)**

*Powered by Google Gemini 3 AI*
