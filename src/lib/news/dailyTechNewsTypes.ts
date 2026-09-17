export interface DailyTechNewsArticle {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  takeaway: string;
  category: 'mobile' | 'hardware' | 'ai' | 'pc' | 'gaming' | 'robotics';
  categoryLabel: string;
  source: string;
  date: string;
  readTime: string;
  url?: string;
  suggestedPrompt: string;
  isLead?: boolean;
}

export interface DailyTechNewsPayload {
  success: boolean;
  dateStr: string;
  lastUpdated: string;
  scheduledTime: string;
  count: number;
  articles: DailyTechNewsArticle[];
}

export function getFormattedTurkishDate(d = new Date()): string {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function generateCuratedDailyArticles(now = new Date()): DailyTechNewsArticle[] {
  const dateFormatted = getFormattedTurkishDate(now);
  const timeStr = `${dateFormatted}, 09:00`;

  return [
    {
      id: 'tech-lead-1',
      isLead: true,
      title: "Apple ve Qualcomm'un 2nm Silikon Yarışı: Akıllı Telefonlarda Yeni Bir Performans Çağı Başlıyor",
      summary: "TSMC'nin 2 nanometrelik GAA (Gate-All-Around) üretim hattında ilk ticari kapasite paylaşımları netleşti. Gelecek nesil iPhone ve Android amiral gemisi işlemcileri enerji tüketimini dramatik ölçüde düşürürken nöral işlem birimlerinde (NPU) iki kat hız vadediyor.",
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
      takeaway: "Mevcut 3nm amiral gemisi cihazlar (iPhone 16 Pro / S25 Ultra) en az 4 yıl zirvede kalacak; ancak batarya verimliliği odaklı olanlar 2nm sıçramasını bekleyebilir.",
      category: "mobile",
      categoryLabel: "Mobil & Çip",
      source: "Bloomberg Tech",
      date: timeStr,
      readTime: "3 dk okuma",
      url: "https://www.bloomberg.com/technology",
      suggestedPrompt: "Apple ve Qualcomm'un 2nm işlemci planları akıllı telefon pazarını ve fiyatları nasıl etkileyecek?"
    },
    {
      id: 'tech-item-2',
      title: "NVIDIA RTX 50 Serisi ve GDDR7 Bellek: Masaüstü Ekran Kartlarında Güç Dengeleri Değişiyor",
      summary: "28 Gbps hızındaki yeni nesil GDDR7 bellek modülleri ve DLSS 4 nöral kare üretimi ile 4K ışın izlemeli oyunculukta güç tüketim dengesi yeniden yazılıyor. Yeni soğutma mimarileri kasa uyumluluğunu ön plana çıkarıyor.",
      imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80",
      takeaway: "Mevcut RTX 4070 ve üstü ekran kartı sahipleri için 1440p'de geçiş şart değil; ancak 4K 144Hz hedefleyenler için GDDR7 bant genişliği devrimsel fark yaratıyor.",
      category: "hardware",
      categoryLabel: "Donanım & GPU",
      source: "Tom's Hardware",
      date: timeStr,
      readTime: "4 dk okuma",
      url: "https://www.tomshardware.com",
      suggestedPrompt: "NVIDIA RTX 50 serisi ekran kartları çıktığında mevcut sistemimi yükseltmeli miyim?"
    },
    {
      id: 'tech-item-3',
      title: "Sony ve AMD'den Taşınabilir PlayStation Hamlesi: El Konsolu Savaşı Kızışıyor",
      summary: "Steam Deck, ROG Ally ve Lenovo Legion Go'nun yakaladığı pazar ivmesi sonrası Sony'nin yerel PS4/PS5 kütüphanesini çalıştırabilen yeni nesil el konsolu prototipleri gün yüzüne çıktı.",
      imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80",
      takeaway: "Özel RDNA 4 APU ve OLED panel kombinasyonuyla 1080p 60 FPS AAA mobil oyun deneyimi hedefleniyor.",
      category: "gaming",
      categoryLabel: "Oyun & Konsol",
      source: "IGN Tech",
      date: timeStr,
      readTime: "3 dk okuma",
      url: "https://www.ign.com/tech",
      suggestedPrompt: "Taşınabilir el konsolları Nintendo Switch ve PS5 yerine tercih edilir mi?"
    },
    {
      id: 'tech-item-4',
      title: "Google DeepMind ve Anthropic'ten Hibrit Düşünme Mimarileri: Otonom Kodlama ve Ajanlar",
      summary: "Yapay zeka modelleri artık sadece sohbet etmiyor; saatlerce süren kodlama, veri tabanı optimizasyonu ve donanım kıyaslamalarını kendi kendine planlayıp hatasız tamamlayan otonom ajanlara dönüşüyor.",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
      takeaway: "Bilgisayarlarda 45+ TOPS gücündeki NPU çiplerinin önemi artıyor; bu modeller buluta ihtiyaç duymadan yerel çalışabiliyor.",
      category: "ai",
      categoryLabel: "Yapay Zekâ",
      source: "The Verge",
      date: timeStr,
      readTime: "2 dk okuma",
      url: "https://www.theverge.com",
      suggestedPrompt: "Google DeepMind ve Anthropic'in en yeni akıl yürütme modelleri donanımlara nasıl yansıyor?"
    },
    {
      id: 'tech-item-5',
      title: "Tandem OLED Paneller ve ARM Tabanlı Çipler Ultrabook Pazarını Baştan Tanımlıyor",
      summary: "Apple MacBook ve Dell XPS serisinde çift katmanlı Tandem OLED paneller ile 22 saatlik gerçek pil ömrü ve 1000 nit tam ekran parlaklık standardı yakalandı. İnce kasalarda fan sesi tarihe karışıyor.",
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80",
      takeaway: "Ofis ve yazılım geliştirme için laptop bakanlar artık harici adaptör taşımadan tam gün mobil çalışabiliyor.",
      category: "pc",
      categoryLabel: "Laptop & PC",
      source: "Ars Technica",
      date: timeStr,
      readTime: "3 dk okuma",
      url: "https://arstechnica.com",
      suggestedPrompt: "Tandem OLED ekranlı laptoplar ile standart IPS ekranlar arasındaki fark nedir?"
    },
    {
      id: 'tech-item-6',
      title: "İnsansı Ev Asistanları ve 15.000 Pa Emiş Güçlü Yeni Nesil Robot Süpürgeler",
      summary: "Dyson, Roborock ve Dreame'nin engelleri tırmanabilen robotik kollu ve sıcak suyla kendi kendini sterilize eden paspas istasyonları, ev temizliğini tamamen otonom hale getirmeyi başarıyor.",
      imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&auto=format&fit=crop&q=80",
      takeaway: "Halı ve sert zeminleri lazerle ayırt eden akıllı istasyonlar evdeki bakım süresini haftada 5 dakikaya indiriyor.",
      category: "robotics",
      categoryLabel: "Robotik & Ev",
      source: "WIRED",
      date: timeStr,
      readTime: "3 dk okuma",
      url: "https://www.wired.com",
      suggestedPrompt: "Yeni nesil robot süpürgelerde 15.000 Pa emiş gücü gerçekten gerekli mi?"
    }
  ];
}
