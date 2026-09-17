export interface GlobalAiNewsArticle {
  id: string;
  title: string;
  summary: string;
  keyPoints?: string[];
  source: string;
  date: string;
  category: 'llm' | 'hardware' | 'robotics' | 'opensource' | 'science' | 'regulation';
  categoryLabel: string;
  badgeColor?: string;
  url?: string;
  suggestedPrompt?: string;
  deviceImpact?: {
    badge: string;
    text: string;
    linkText: string;
    linkHref: string;
    startingPrice?: string;
  };
}

export const GLOBAL_AI_NEWS: GlobalAiNewsArticle[] = [
  {
    id: 'ai-news-1',
    title: 'Google DeepMind, Karmaşık Akıl Yürütme ve Agentic AI Odaklı Yeni Gemini Mimarilerini Duyurdu',
    summary: 'Google DeepMind, çok adımlı matematiksel muhakeme, otonom yazılım geliştirme ve multimodal algı yeteneklerini birleştiren yeni nesil yapay zeka mimarisini küresel ölçekte kullanıma sundu.',
    keyPoints: [
      'Gelişmiş düşünce zinciri (Chain-of-Thought) ile halüsinasyon oranlarında %45 azalma',
      'Karmaşık yazılım mühendisliği kıyaslamalarında (SWE-bench) rekor başarı skoru',
      'Gerçek zamanlı multimodal video ve ses işleme optimizasyonu'
    ],
    source: 'Google DeepMind / The Verge',
    date: 'Bugün, 16:30',
    category: 'llm',
    categoryLabel: 'Büyük Dil Modelleri',
    url: 'https://deepmind.google/technologies/gemini/',
    suggestedPrompt: 'Google DeepMind\'ın yeni Gemini mimarisindeki akıl yürütme yetenekleri hakkında ne biliyorsun?',
    deviceImpact: {
      badge: 'Ekosistem Notu',
      text: 'Google Pixel 9/10 ve Samsung Galaxy AI cihazları bu mimariden ilk faydalanan akıllı telefonlar olacak.',
      linkText: 'Galaxy AI ve Pixel Modellerini Gör →',
      linkHref: '/phones?q=samsung',
      startingPrice: '₺42.999\'dan başlayan'
    }
  },
  {
    id: 'ai-news-2',
    title: 'OpenAI, Otonom Görev Yürütme ve Mantıksal Çıkarım Ailesini Genişletiyor',
    summary: 'OpenAI, yapay genel zeka (AGI) yol haritasında önemli bir basamak olan ve saatler süren analitik görevleri kendi kendine planlayıp yürüten yeni nesil akıl yürütme sistemlerini geliştiricilere açtı.',
    keyPoints: [
      'Doktora seviyesinde fen ve matematik sorularında yüksek doğruluk oranı',
      'Ajan tabanlı (Agentic) web araştırması ve çoklu araç çağırma yetkinliği',
      'Kurumsal veri güvenliği ve yerel denetim protokolleri entegrasyonu'
    ],
    source: 'Reuters Tech',
    date: 'Bugün, 14:15',
    category: 'llm',
    categoryLabel: 'Büyük Dil Modelleri',
    url: 'https://openai.com/news/',
    suggestedPrompt: 'OpenAI\'ın yeni nesil akıl yürütme modelleri donanım testlerinde nasıl sonuçlar veriyor?',
    deviceImpact: {
      badge: 'Donanım Tavsiyesi',
      text: 'Ajan tabanlı otonom çıkarım için minimum 32GB RAM ve güçlü çok çekirdekli işlemcili iş istasyonları öneriliyor.',
      linkText: 'Yüksek RAM\'li İş İstasyonlarını Gör →',
      linkHref: '/laptops?q=64gb',
      startingPrice: '₺64.999\'dan başlayan'
    }
  },
  {
    id: 'ai-news-3',
    title: 'Anthropic, Hibrit Düşünme Yeteneğine Sahip Claude 3.7 Sonnet Modelini Yayınladı',
    summary: 'Kullanıcının tek bir model üzerinden hem anlık hızlı yanıtlar hem de derinlemesine analiz için düşünme süresini kontrol edebildiği ilk hibrit yapay zeka sistemi tanıtıldı.',
    keyPoints: [
      'Kullanıcı ayarlı düşünme bütçesi (Thinking Budget) ile esnek maliyet ve hız kontrolü',
      'Tam yığın kodlama (Full-Stack Coding) görevlerinde sektör lideri doğruluk',
      'Uzun bağlam pencerelerinde (200K+ token) üstün bilgi yakalama kabiliyeti'
    ],
    source: 'TechCrunch',
    date: 'Dün, 18:45',
    category: 'llm',
    categoryLabel: 'Büyük Dil Modelleri',
    url: 'https://www.anthropic.com/news',
    suggestedPrompt: 'Claude 3.7 Sonnet\'in hibrit düşünme özelliği nasıl çalışıyor?',
    deviceImpact: {
      badge: 'Yazılımcı Rehberi',
      text: 'Yazılım geliştiriciler için 32GB/64GB RAM\'li MacBook Pro ve RTX laptoplar hibrit ajan modellerinde maksimum verim sağlıyor.',
      linkText: 'Kodlama Laptoplarını İncele →',
      linkHref: '/laptops?sortBy=popular',
      startingPrice: '₺54.999\'dan başlayan'
    }
  },
  {
    id: 'ai-news-4',
    title: 'NVIDIA Blackwell B200 ve Rubin AI Çipleri Veri Merkezlerinde Devrim Yaratıyor',
    summary: 'NVIDIA, Blackwell mimarisine sahip B200 süperçipleriyle yapay zeka eğitim ve çıkarım süreçlerinde enerji verimliliğini 4 katına çıkardığını, 2026 Rubin mimarisinin ise bant genişliğini ikiye katlayacağını açıkladı.',
    keyPoints: [
      '208 milyar transistörlü çift kalıp (dual-die) silikon tasarımı',
      'Önceki nesil H100\'e kıyasla çıkarım (inference) görevlerinde 30 kata kadar hız artışı',
      'Sıvı soğutmalı yeni nesil GB200 NVL72 kabinet sistemleri'
    ],
    source: 'Bloomberg AI / NVIDIA',
    date: 'Bugün, 11:20',
    category: 'hardware',
    categoryLabel: 'Yonga & Donanım',
    url: 'https://nvidianews.nvidia.com/',
    suggestedPrompt: 'NVIDIA Blackwell B200 ve Apple M4 çiplerinin yapay zeka NPU güçlerini karşılaştırır mısın?',
    deviceImpact: {
      badge: 'GPU Tavsiyesi',
      text: 'Yapay zeka modelleriyle çalışan geliştiriciler için RTX 4080 / 4090 laptoplar en yüksek fiyat/performansı sunuyor.',
      linkText: 'Uyumlu RTX Laptopları Gör →',
      linkHref: '/laptops?q=rtx',
      startingPrice: '₺124.999\'dan başlayan'
    }
  },
  {
    id: 'ai-news-5',
    title: 'DeepSeek R1 ve Açık Kaynaklı Yapay Zeka Modelleri Küresel Piyasaları Sarstı',
    summary: 'Düşük bütçeler ve açık kaynak felsefesiyle eğitilen DeepSeek mimarisi, tescilli modellerin fahiş maliyetlerine meydan okuyarak açık toplulukta büyük bir ivme kazandı.',
    keyPoints: [
      'Yenilikçi Pekiştirmeli Öğrenme (Reinforcement Learning) tabanlı saf düşünme süreci',
      'Lokal cihazlarda ve standart GPU\'larda çalışabilen distile (küçültülmüş) modeller',
      'Akademik araştırma ve açık kaynaklı AI geliştirme ekosistemine tam erişim'
    ],
    source: 'MIT Technology Review',
    date: '2 gün önce',
    category: 'opensource',
    categoryLabel: 'Açık Kaynak',
    url: 'https://www.technologyreview.com/',
    suggestedPrompt: 'DeepSeek R1 modeli açık kaynak dünyasında neden bu kadar ses getirdi?',
    deviceImpact: {
      badge: 'Donanım Gereksinimi',
      text: 'DeepSeek R1 14B modelini yerel çalıştırmak için en az 16GB VRAM veya 32GB Unified Memory gerekiyor.',
      linkText: 'Uyumlu Bilgisayarları Listele →',
      linkHref: '/laptops?q=dell',
      startingPrice: '₺69.999\'dan başlayan'
    }
  },
  {
    id: 'ai-news-6',
    title: 'Apple Intelligence, Cihaz Üzeri Özel NPU Donanımıyla Küresel Desteğini Genişletiyor',
    summary: 'Apple, M4 ve A18 Pro yongalarındaki 16 çekirdekli Neural Engine işlemcileri üzerinden kullanıcı gizliliğini koruyan cihaz içi yapay zeka modellerini yeni dillere ve coğrafyalara açıyor.',
    keyPoints: [
      'Kişisel bağlam motoru ile e-posta, mesaj ve fotoğrafların tamamen cihazda işlenmesi',
      'Private Cloud Compute ile sunucu tarafında doğrulanabilir şifreli hesaplama',
      'Yazı araçları, sesli özetleme ve Siri derin entegrasyonu'
    ],
    source: 'Ars Technica',
    date: 'Bugün, 09:50',
    category: 'hardware',
    categoryLabel: 'Yonga & Donanım',
    url: 'https://www.apple.com/newsroom/',
    suggestedPrompt: 'Apple Intelligence hangi iPhone ve Mac modellerinde tam performans çalışıyor?',
    deviceImpact: {
      badge: 'Satın Alma Tavsiyesi',
      text: 'Apple Intelligence özelliklerini kullanmak için en az iPhone 15 Pro, iPhone 16 veya M serisi iPad/Mac gerekiyor.',
      linkText: 'Uyumlu iPhone Modellerini Gör →',
      linkHref: '/phones?q=iphone',
      startingPrice: '₺64.999\'dan başlayan'
    }
  },
  {
    id: 'ai-news-7',
    title: 'Yapay Zeka Destekli İnsansı Robotlar Endüstriyel Üretim Tesislerinde Göreve Başladı',
    summary: 'Görsel-Dil-Eylem (Vision-Language-Action) modelleriyle donatılan yeni nesil otonom insansı robotlar, otomotiv fabrikalarında ve lojistik merkezlerinde fiziksel montaj testlerine katılıyor.',
    keyPoints: [
      'İnsan hareketlerini simülasyonsuz doğrudan izleyerek öğrenen nöral ağlar',
      'Dinamik denge kontrolü ve milimetrik parmak hassasiyetine sahip dokunsal sensörler',
      '2026 sonuna kadar ticari fabrika filolarının genişletilmesi hedefleniyor'
    ],
    source: 'Wired Tech',
    date: 'Dün, 13:00',
    category: 'robotics',
    categoryLabel: 'Robotik & Otonom',
    url: 'https://www.wired.com/',
    suggestedPrompt: 'İnsansı robotların üretimde kullanılması yapay zeka donanımlarını nasıl etkiliyor?'
  },
  {
    id: 'ai-news-8',
    title: 'AlphaFold ve Biyomoleküler AI, Yeni Antibiyotik ve İlaç Keşiflerini Yıllardan Haftalara İndirdi',
    summary: 'Protein katlanması ve moleküler etkileşimleri simüle eden yapay zeka algoritmaları, dirençli enfeksiyonlara karşı yeni moleküler bileşikleri laboratuvar öncesinde başarıyla modelledi.',
    keyPoints: [
      '200 milyondan fazla protein yapısının 3 boyutlu atomik doğruluğu',
      'Kanser ve nadir genetik hastalıklar için hedefe yönelik antikor tasarımı',
      'Küresel sağlık araştırmacılarına ücretsiz açık veri tabanı desteği'
    ],
    source: 'Nature / Financial Times',
    date: '3 gün önce',
    category: 'science',
    categoryLabel: 'Bilim & Tıp',
    url: 'https://www.nature.com/',
    suggestedPrompt: 'Yapay zeka bilim dünyasında ve tıp alanında en çok hangi keşiflerde kullanılıyor?'
  },
  {
    id: 'ai-news-9',
    title: 'Meta, 100K GPU ile Eğitilen Yeni Llama 4 Model Mimarisi İçin Yol Haritasını Paylaştı',
    summary: 'Meta AI, açık ağırlıklı yapay zeka ekosisteminde liderliğini korumak amacıyla çok modlu (multimodal) ve otonom akıl yürütme kabiliyetlerine sahip Llama 4 mimarisini duyurdu.',
    keyPoints: [
      'Devasa GPU kümelerinde eşzamanlı hibrit paralel eğitim',
      'Doğal çok dilli anlama ve yerel ses/görsel girdi sentezi',
      'Ticari lisanslı açık model dağıtım stratejisi'
    ],
    source: 'VentureBeat',
    date: 'Dün, 21:10',
    category: 'opensource',
    categoryLabel: 'Açık Kaynak',
    url: 'https://ai.meta.com/blog/',
    suggestedPrompt: 'Meta Llama modelleri açık kaynak yapay zeka gelişimine ne gibi katkılar sundu?'
  },
  {
    id: 'ai-news-10',
    title: 'Avrupa Birliği Yapay Zeka Yasası (EU AI Act) Yüksek Riskli Sistemler İçin Yürürlüğe Girdi',
    summary: 'Küresel ölçekte yapay zeka regülasyonuna öncülük eden Avrupa Birliği, temel modeller ve kamuya açık AI sistemleri için şeffaflık, telif ve risk denetim yönergelerini resmileştirdi.',
    keyPoints: [
      'Eğitim verilerinin telif hakkı şeffaflığı ve enerji tüketimi raporlama zorunluluğu',
      'Yüksek riskli biyometrik ve kamu güvenliği sistemlerine sıkı denetimler',
      'Yapay zeka üretimi içeriklerde zorunlu dijital filigran (watermark) şartı'
    ],
    source: 'Reuters Legal',
    date: 'Bugün, 08:30',
    category: 'regulation',
    categoryLabel: 'Regülasyon',
    url: 'https://www.reuters.com/',
    suggestedPrompt: 'Avrupa Birliği Yapay Zeka Yasası kullanıcıları ve teknoloji şirketlerini nasıl etkileyecek?'
  }
];
