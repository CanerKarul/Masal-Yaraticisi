# 📖 Masal Yaratıcısı (Tale Creator)

**Masal Yaratıcısı**, yapay zeka desteğiyle çocuklar ve hayal gücünü geliştirmek isteyen herkes için özgün masallar oluşturan etkileşimli bir web uygulamasıdır. Kullanıcıdan alınan anahtar kelimeler ve tercihler doğrultusunda saniyeler içinde benzersiz hikayeler kurgular.

![Proje Durumu](https://img.shields.io/badge/Durum-Aktif-brightgreen)
![Lisans](https://img.shields.io/badge/Lisans-MIT-blue)
![React](https://img.shields.io/badge/Frontend-React-61dafb?logo=react)
![AI](https://img.shields.io/badge/AI-Gemini_/_GPT-orange)

## ✨ Özellikler

* **Kişiselleştirilmiş Hikayeler:** Kahraman ismi, masalın geçtiği yer ve ana fikir gibi parametreleri kullanıcı belirler.
* **Yapay Zeka Entegrasyonu:** Güçlü dil modelleri kullanarak her seferinde farklı ve tutarlı masallar üretir.
* **Seslendirme Desteği (Opsiyonel):** Yazılan masalları sesli dinleme imkanı (Text-to-Speech).
* **Kategori Seçimi:** Eğitici, fantastik, macera veya uyku öncesi masalları gibi farklı türlerde üretim.
* **Modern Arayüz:** Kullanıcı dostu, göz yormayan ve mobil uyumlu (Responsive) tasarım.

## 🛠️ Kullanılan Teknolojiler

Bu proje, hız ve kullanıcı deneyimi ön planda tutularak aşağıdaki teknolojilerle geliştirilmiştir:

- **Framework:** [React.js](https://reactjs.org/) (Vite ile optimize edilmiştir)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** React Hooks
- **AI Model:** Google Gemini API veya OpenAI API entegrasyonu
- **Geliştirme Aracı:** [Lovable](https://lovable.dev/)

## 🚀 Kurulum ve Çalıştırma

Projeyi kendi yerel bilgisayarınızda çalıştırmak için:

1.  **Depoyu klonlayın:**
    ```bash
    git clone [https://github.com/CanerKarul/Masal-Yaraticisi.git](https://github.com/CanerKarul/Masal-Yaraticisi.git)
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
    `.env` dosyası oluşturup AI API anahtarınızı ekleyin:
    ```env
    VITE_AI_API_KEY=your_api_key_here
    ```
5.  **Uygulamayı başlatın:**
    ```bash
    npm run dev
    ```

## 📝 Örnek Kullanım Senaryosu

1. Masalın kahramanına bir isim verin (Örn: "Minik Tavşan Pamuk").
2. Masalın temasını seçin (Örn: "Dürüstlük").
3. "Masal Oluştur" butonuna basın.
4. Yapay zeka, seçtiğiniz temaya uygun eğitici ve eğlenceli bir masalı saniyeler içinde karşınıza getirsin!

## 🤝 Katkıda Bulunma

Geliştirmelere katkıda bulunmak isterseniz:
1. Projeyi fork'layın.
2. Yeni bir özellik dalı (branch) açın (`git checkout -b feature/yenilik`).
3. Değişikliklerinizi kaydedin (`git commit -am 'Yeni masal türü eklendi'`).
4. Dalınızı push'layın (`git push origin feature/yenilik`).
5. Bir Pull Request oluşturun.

## 📄 Lisans

Bu proje **MIT** lisansı ile korunmaktadır. Daha fazla bilgi için `LICENSE` dosyasına bakabilirsiniz.

---
Developed with ✨ by [Caner Karul](https://github.com/CanerKarul)
