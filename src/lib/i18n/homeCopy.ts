import type { Language } from '../types';

// UI copy only. Product identities, specifications and price records are never translated or rewritten here.
const rows = `
Akıllı Karşılaştırma & Fiyat Takip|Smart comparison & price tracking|Smart vergleichen & Preise verfolgen|Умное сравнение и отслеживание цен|Comparación y seguimiento de precios|Confronto e monitoraggio prezzi
RoboPengu’ya danış|Ask RoboPengu|RoboPengu fragen|Спросить RoboPengu|Consulta a RoboPengu|Chiedi a RoboPengu
Akıllı asistan|Smart assistant|Intelligenter Assistent|Умный помощник|Asistente inteligente|Assistente intelligente
Eşleşen modeller|Matching models|Passende Modelle|Найденные модели|Modelos coincidentes|Modelli corrispondenti
Katalog referansı|Catalog reference|Katalogreferenz|Цена каталога|Referencia del catálogo|Riferimento di catalogo
Fiyat yok|No price|Kein Preis|Нет цены|Sin precio|Prezzo assente
Doğrudan eşleşen model bulunamadı.|No matching model found.|Kein passendes Modell gefunden.|Подходящая модель не найдена.|No se encontró un modelo coincidente.|Nessun modello corrispondente trovato.
Fiyat takibi nasıl çalışır?|How do price targets work?|Wie funktionieren Preisziele?|Как работают ценовые цели?|¿Cómo funcionan los precios objetivo?|Come funzionano i prezzi obiettivo?
20.000 TL bütçeye telefon|A phone with a TRY 20,000 budget|Smartphone für ein Budget von 20.000 TRY|Телефон с бюджетом 20 000 TRY|Teléfono con presupuesto de 20.000 TRY|Telefono con budget di 20.000 TRY
Teknoloji|Technology|Technologie|Технологии|Tecnología|Tecnologia
Sohbet başlangıçları ve ürün seçimi|Conversation starters and product selection|Gesprächseinstieg und Produktauswahl|Начало разговора и выбор товаров|Inicio de conversación y selección|Avvio conversazione e scelta prodotti
Ürün seçkisi sayfaları|Product selection pages|Produktauswahl-Seiten|Страницы подборки|Páginas de selección|Pagine della selezione
Vitrin kategorileri|Showcase categories|Auswahlkategorien|Категории витрины|Categorías de la selección|Categorie della vetrina
2026 ürün seçkisi|2026 product selection|Produktauswahl 2026|Подборка товаров 2026|Selección de productos 2026|Selezione prodotti 2026
Katalogdan ürün seçkisi|Catalog product selection|Produktauswahl aus dem Katalog|Подборка из каталога|Selección del catálogo|Selezione dal catalogo
RoboPengu hızlı başlangıçlar|RoboPengu quick starts|RoboPengu Schnellstart|Быстрый старт RoboPengu|Inicio rápido RoboPengu|Avvio rapido RoboPengu
ürün grubu|product group|Produktgruppe|группа товаров|grupo de productos|gruppo prodotti
Çok hızlı ilerledik. Bir dakika sonra yeniden deneyebilirsin.|Too many requests. Please try again in a minute.|Zu viele Anfragen. Bitte in einer Minute erneut versuchen.|Слишком много запросов. Повторите через минуту.|Demasiadas solicitudes. Reinténtalo en un minuto.|Troppe richieste. Riprova tra un minuto.
Bağlantı kurulamadı. Yeniden deneyebilirsin.|Could not connect. Please try again.|Verbindung fehlgeschlagen. Bitte erneut versuchen.|Не удалось подключиться. Повторите попытку.|No se pudo conectar. Reinténtalo.|Connessione non riuscita. Riprova.
Yanıt süresi doldu. Yeniden deneyebilirsin.|The response timed out. Please try again.|Zeitüberschreitung. Bitte erneut versuchen.|Время ответа истекло. Повторите попытку.|La respuesta tardó demasiado. Reinténtalo.|Tempo di risposta scaduto. Riprova.
Yanıt tamamlanamadı. Yeniden deneyebilirsin.|The response could not finish. Please try again.|Die Antwort konnte nicht abgeschlossen werden. Bitte erneut versuchen.|Ответ не завершён. Повторите попытку.|No se pudo completar la respuesta. Reinténtalo.|Impossibile completare la risposta. Riprova.
Yanıt kesildi. Yeniden deneyebilirsin.|The response was interrupted. Please try again.|Die Antwort wurde unterbrochen. Bitte erneut versuchen.|Ответ прерван. Повторите попытку.|La respuesta se interrumpió. Reinténtalo.|La risposta è stata interrotta. Riprova.
Yanıt alınamadı.|No response received.|Keine Antwort erhalten.|Ответ не получен.|No se recibió respuesta.|Nessuna risposta ricevuta.
Yanıt tamamlanamadı. Devam et yazarak sürdürebilirsin.|The response is incomplete. Write Continue to resume.|Die Antwort ist unvollständig. Schreibe Weiter zum Fortsetzen.|Ответ неполный. Напишите Продолжай.|La respuesta está incompleta. Escribe Continúa para seguir.|La risposta è incompleta. Scrivi Continua per proseguire.
Teknoloji karmaşık.|Technology is complex.|Technologie ist komplex.|Технологии сложны.|La tecnología es compleja.|La tecnologia è complessa.
Birlikte netleştirelim.|Let's make it clear together.|Schaffen wir gemeinsam Klarheit.|Разберёмся вместе.|Aclaremos las cosas juntos.|Facciamo chiarezza insieme.
Ne aradığını anlat; seçenekleri birlikte inceleyelim.|Tell us what you need; let's explore your options.|Sag uns, was du brauchst; wir prüfen die Möglichkeiten.|Расскажите, что вам нужно; рассмотрим варианты вместе.|Cuéntanos qué necesitas; veamos tus opciones.|Raccontaci cosa cerchi; esploriamo le opzioni.
Birlikte keşfedelim|Let's explore|Gemeinsam entdecken|Откроем вместе|Exploremos juntos|Esploriamo insieme
Tümünü gör|View all|Alle ansehen|Смотреть всё|Ver todo|Vedi tutto
Katalogdan bir başlangıç seçkisi.|A starting selection from the catalog.|Eine erste Auswahl aus dem Katalog.|Начальная подборка из каталога.|Una selección inicial del catálogo.|Una prima selezione dal catalogo.
Güncel teklif doğrulanmadı|Current offer not verified|Aktuelles Angebot nicht bestätigt|Актуальное предложение не подтверждено|Oferta actual sin verificar|Offerta attuale non verificata
Ürün kataloğunu keşfet|Explore the product catalog|Produktkatalog entdecken|Открыть каталог товаров|Explorar el catálogo|Esplora il catalogo
Önce seni anlayalım.|Let's start with your needs.|Zuerst verstehen wir deinen Bedarf.|Начнём с ваших потребностей.|Empecemos por tus necesidades.|Partiamo dalle tue esigenze.
Daha iyi öneriler için birkaç soruyla başlayalım.|A few questions help us guide you.|Ein paar Fragen helfen bei der Auswahl.|Несколько вопросов помогут с выбором.|Unas preguntas nos ayudarán a orientarte.|Qualche domanda ci aiuta a consigliarti.
Sohbet başlangıçları|Start a conversation|Gespräch beginnen|Начать разговор|Iniciar conversación|Inizia una conversazione
Nerede kullanacaksın?|Where will you use it?|Wo wirst du es nutzen?|Где вы будете это использовать?|¿Dónde lo usarás?|Dove lo userai?
Senin için en önemli özellik ne?|What matters most to you?|Was ist dir am wichtigsten?|Что для вас важнее всего?|¿Qué es lo más importante para ti?|Qual è la cosa più importante per te?
İhtiyaçlarını anlattıkça, seçenekleri birlikte netleştirelim.|Tell us your needs and we'll narrow the options together.|Mit deinem Bedarf grenzen wir die Auswahl ein.|Расскажите о потребностях — вместе сузим выбор.|Cuéntanos tus necesidades y acotaremos las opciones.|Raccontaci le tue esigenze e restringeremo le opzioni.
Ne almak istiyorsun? Bana anlat.|What are you looking to buy? Tell me.|Was möchtest du kaufen? Erzähl es mir.|Что хотите купить? Расскажите мне.|¿Qué quieres comprar? Cuéntame.|Cosa vuoi acquistare? Raccontami.
Sessiz bir laptop|A quiet laptop|Ein leiser Laptop|Тихий ноутбук|Un portátil silencioso|Un portatile silenzioso
Film için TV|A TV for movies|TV für Filme|Телевизор для фильмов|TV para películas|TV per i film
Uzun pil ömrü|Long battery life|Lange Akkulaufzeit|Долгая работа батареи|Batería duradera|Batteria di lunga durata
Ürünleri kendim keşfedeceğim|I'll browse products myself|Ich stöbere selbst|Я посмотрю товары самостоятельно|Exploraré los productos por mi cuenta|Esplorerò i prodotti da solo
Sohbete dön|Return to chat|Zurück zum Chat|Вернуться в чат|Volver al chat|Torna alla chat
AI yanıtları hata içerebilir. Kaynakları ve güncel teklif durumunu kontrol et.|AI responses may contain errors. Check sources and current offer status.|KI-Antworten können Fehler enthalten. Prüfe Quellen und Angebotsstatus.|Ответы ИИ могут содержать ошибки. Проверяйте источники и актуальность предложений.|La IA puede cometer errores. Comprueba las fuentes y el estado de la oferta.|L'IA può commettere errori. Controlla fonti e stato dell'offerta.
Ne keşfetmek istersin?|What would you like to explore?|Was möchtest du entdecken?|Что хотите посмотреть?|¿Qué te gustaría explorar?|Cosa vuoi esplorare?
Tüm ürünler|All products|Alle Produkte|Все товары|Todos los productos|Tutti i prodotti
Telefon|Phone|Smartphone|Телефон|Teléfono|Telefono
Bilgisayar|Computer|Computer|Компьютер|Ordenador|Computer
Laptop|Laptop|Laptop|Ноутбук|Portátil|Portatile
Televizyon|Television|Fernseher|Телевизор|Televisor|Televisore
Tablet|Tablet|Tablet|Планшет|Tableta|Tablet
Akıllı saat|Smartwatch|Smartwatch|Умные часы|Reloj inteligente|Smartwatch
Kulaklık|Headphones|Kopfhörer|Наушники|Auriculares|Cuffie
Monitör|Monitor|Monitor|Монитор|Monitor|Monitor
Oyun konsolu|Game console|Spielkonsole|Игровая консоль|Consola|Console
Ev & yaşam|Home & living|Haus & Wohnen|Дом и быт|Hogar|Casa
ürün|products|Produkte|товаров|productos|prodotti
YENİ NESİL SEÇKİ|NEW GENERATION SELECTION|AUSWAHL DER NEUEN GENERATION|ПОДБОРКА НОВОГО ПОКОЛЕНИЯ|SELECCIÓN DE NUEVA GENERACIÓN|SELEZIONE DI NUOVA GENERAZIONE
2026 Teknoloji Vitrini|2026 Technology Showcase|Technologie-Auswahl 2026|Технологии 2026|Tecnología 2026|Tecnologia 2026
Yeni nesli keşfet. Kararını aceleye getirme.|Explore the new generation. Take your time choosing.|Entdecke die neue Generation. Entscheide in Ruhe.|Изучайте новое поколение. Не спешите с выбором.|Descubre la nueva generación. Decide sin prisas.|Scopri la nuova generazione. Scegli senza fretta.
Tümü|All|Alle|Все|Todo|Tutti
Diğer|Other|Weitere|Другое|Otros|Altro
İncele|Explore|Ansehen|Подробнее|Ver detalles|Scopri
Karşılaştır|Compare|Vergleichen|Сравнить|Comparar|Confronta
Önceki ürünler|Previous products|Vorherige Produkte|Предыдущие товары|Productos anteriores|Prodotti precedenti
Sonraki ürünler|Next products|Nächste Produkte|Следующие товары|Productos siguientes|Prodotti successivi
Döngüyü Başlat|Resume rotation|Wechsel fortsetzen|Продолжить смену|Reanudar rotación|Riprendi rotazione
Döngüyü Duraklat|Pause rotation|Wechsel pausieren|Приостановить смену|Pausar rotación|Pausa rotazione
Seçkiyi kaydırarak keşfet|Scroll to explore|Zum Entdecken scrollen|Листайте подборку|Desliza para explorar|Scorri per esplorare
model|models|Modelle|моделей|modelos|modelli
Bu seçkide henüz bu kategoriden model yok.|No models in this category in this selection yet.|Diese Auswahl enthält noch keine Modelle dieser Kategorie.|В этой подборке пока нет моделей этой категории.|Aún no hay modelos de esta categoría en la selección.|Non ci sono ancora modelli di questa categoria nella selezione.
Kayıtlı özellikleri kaynaklarıyla inceleyin. Güncel teklif doğrulanmamışsa fiyat önerisi verilmez.|Check listed specifications and sources. No price recommendation without a verified current offer.|Prüfe Angaben und Quellen. Ohne bestätigtes aktuelles Angebot keine Preisempfehlung.|Проверяйте характеристики и источники. Без подтверждённого предложения ценовых рекомендаций нет.|Revisa características y fuentes. Sin oferta actual verificada no damos recomendaciones de precio.|Controlla specifiche e fonti. Nessun consiglio sul prezzo senza un'offerta attuale verificata.
2025 Model Seçkisi|2025 Model Selection|Modellauswahl 2025|Подборка моделей 2025|Selección de modelos 2025|Selezione modelli 2025
Geçen neslin güçlü seçimleri|Explore the previous generation|Die vorige Generation entdecken|Изучите предыдущее поколение|Explora la generación anterior|Esplora la generazione precedente
Önceki neslin modellerini kayıtlı özellikleriyle keşfet.|Explore previous-generation models and their listed specifications.|Entdecke ältere Modelle und ihre erfassten Eigenschaften.|Изучайте модели прошлого поколения и указанные характеристики.|Explora modelos anteriores y sus características registradas.|Esplora i modelli precedenti e le specifiche registrate.
Teklif yalnız doğrulandığında güncel kabul edilir|An offer is current only when verified|Nur bestätigte Angebote gelten als aktuell|Предложение актуально только после проверки|Una oferta solo es actual si está verificada|Un'offerta è attuale solo se verificata
Yeni nesile alternatif|An alternative to the newest generation|Alternative zur neuesten Generation|Альтернатива новому поколению|Alternativa a la nueva generación|Alternativa alla nuova generazione
Teknoloji arşivini keşfet|Explore the technology archive|Technikarchiv entdecken|Открыть архив технологий|Explorar el archivo tecnológico|Esplora l'archivio tecnologico
Teknoloji Arşivi|Technology Archive|Technikarchiv|Архив технологий|Archivo tecnológico|Archivio tecnologico
Yakın Arşiv|Recent Archive|Jüngeres Archiv|Недавние модели|Archivo reciente|Archivio recente
Sergiyi incele|Explore the archive|Archiv ansehen|Посмотреть архив|Ver el archivo|Visita l'archivio
Raf dışı değil, sergide: döneminin önemli modellerini teknoloji tarihinin bir parçası olarak keşfedin.|Explore earlier models as part of technology history.|Entdecke frühere Modelle als Teil der Technikgeschichte.|Изучайте ранние модели как часть истории технологий.|Explora modelos anteriores como parte de la historia tecnológica.|Esplora i modelli precedenti nella storia della tecnologia.
2024 Yakın Arşiv · 2023 ve öncesi Modern Klasikler|Recent: 2024 · Classics: 2023 and earlier|Neuere: 2024 · Klassiker: 2023 und früher|Недавние: 2024 · Классика: 2023 и ранее|Recientes: 2024 · Clásicos: 2023 y anteriores|Recenti: 2024 · Classici: 2023 e precedenti
Arşiv modeli · fiyat talep üzerine doğrulanır|Archived model · price requires verification|Archivmodell · Preis muss geprüft werden|Архивная модель · цена требует проверки|Modelo archivado · precio por verificar|Modello archiviato · prezzo da verificare
Fiyat zamanlaması|Price timing|Preiszeitpunkt|Когда покупать|Cuándo comprar|Quando acquistare
Ürünün verisini incele|Check product data|Produktdaten ansehen|Посмотреть данные товара|Ver datos del producto|Consulta i dati del prodotto
Fiyat hedeflerim|My price targets|Meine Preisziele|Мои ценовые цели|Mis precios objetivo|I miei prezzi obiettivo
Al / bekle önerisi için yeterli güncel fiyat verisi yok. Fiyat hedefini bu tarayıcıda saklayabilirsin; otomatik bildirim gönderilmez.|There is not enough current price data for buy/wait advice. Save a price target in this browser; no automatic notifications are sent.|Für Kauf-/Warteempfehlungen fehlen aktuelle Preisdaten. Preisziele werden in diesem Browser gespeichert; keine automatischen Benachrichtigungen.|Актуальных цен недостаточно для совета о покупке. Цель сохраняется в этом браузере; автоматические уведомления не отправляются.|Faltan precios actuales para aconsejar comprar o esperar. Guarda un objetivo en este navegador; no se envían avisos automáticos.|Non ci sono prezzi attuali sufficienti per consigliare quando comprare. Salva un obiettivo in questo browser; non vengono inviati avvisi automatici.
Yan yana, daha net|Clearer side by side|Nebeneinander klarer|Наглядное сравнение|Más claro, lado a lado|Più chiaro, fianco a fianco
Popüler karşılaştırmalar|Popular comparisons|Beliebte Vergleiche|Популярные сравнения|Comparaciones populares|Confronti popolari
Kendi karşılaştırmanı yap|Build your comparison|Eigenen Vergleich erstellen|Создать сравнение|Crea tu comparación|Crea il tuo confronto
Farkları gör|See the differences|Unterschiede ansehen|Посмотреть различия|Ver diferencias|Vedi le differenze
Bütçene göre keşfet|Explore by budget|Nach Budget entdecken|Выбор по бюджету|Explora según tu presupuesto|Esplora per budget
Daha çok harcamadan,|Without spending more,|Ohne mehr auszugeben,|Не тратя больше,|Sin gastar más,|Senza spendere di più,
daha doğru seç.|choose what fits.|passender wählen.|выбирайте подходящее.|elige lo adecuado.|scegli ciò che fa per te.
Bir bütçe, binlerce seçenek. Önce senin için önemli olanı bulalım.|One budget, many options. Let's find what matters to you.|Ein Budget, viele Möglichkeiten. Was ist dir wichtig?|Один бюджет, множество вариантов. Что для вас важнее?|Un presupuesto, muchas opciones. Descubramos qué te importa.|Un budget, tante opzioni. Scopriamo cosa conta per te.
Ne arıyorsun?|What are you looking for?|Was suchst du?|Что вы ищете?|¿Qué buscas?|Cosa cerchi?
Bütçen (TL)|Your budget (TRY)|Dein Budget (TRY)|Ваш бюджет (TRY)|Tu presupuesto (TRY)|Il tuo budget (TRY)
Bütçen, Türk lirası|Your budget in Turkish lira|Budget in türkischen Lira|Бюджет в турецких лирах|Presupuesto en liras turcas|Budget in lire turche
Örn. 30000|e.g. 30000|z. B. 30000|Например, 30000|Ej. 30000|Es. 30000
RoboPengu ile planla|Plan with RoboPengu|Mit RoboPengu planen|Планировать с RoboPengu|Planifica con RoboPengu|Pianifica con RoboPengu
AI rehberliğidir, fiyat filtresi değildir. Güncel teklif doğrulanmadan bütçeye uygunluk kesinleştirilemez.|AI guidance, not a price filter. Budget fit requires a verified current offer.|KI-Beratung, kein Preisfilter. Budgeteignung setzt ein bestätigtes aktuelles Angebot voraus.|Это помощь ИИ, а не ценовой фильтр. Соответствие бюджету требует актуального подтверждённого предложения.|Es orientación de IA, no un filtro de precios. Ajustarse al presupuesto requiere una oferta actual verificada.|È una guida IA, non un filtro prezzi. La compatibilità col budget richiede un'offerta attuale verificata.
Bütçem:|My budget:|Mein Budget:|Мой бюджет:|Mi presupuesto:|Il mio budget:
Aradığım ürün:|Product I'm looking for:|Gesuchtes Produkt:|Нужный товар:|Producto que busco:|Prodotto che cerco:
Kullanım amacıma göre birlikte seçelim.|Let's choose based on how I'll use it.|Wählen wir nach meinem Einsatzzweck.|Выберем с учётом моих задач.|Elijamos según el uso que le daré.|Scegliamo in base al mio utilizzo.
Birlikte bulalım.|Let's find it together.|Finden wir es gemeinsam.|Найдём вместе.|Busquemos juntos.|Troviamolo insieme.
SENİN TEKNOLOJİ YOL ARKADAŞIN|YOUR TECHNOLOGY COMPANION|DEIN TECHNIKBEGLEITER|ВАШ ПОМОЩНИК В ТЕХНОЛОГИЯХ|TU COMPAÑERO TECNOLÓGICO|IL TUO COMPAGNO TECNOLOGICO
Her şeyi bilmen gerekmiyor. İhtiyacından başlayalım.|You don't need to know everything. Start with your needs.|Du musst nicht alles wissen. Beginnen wir mit deinem Bedarf.|Не нужно знать всё. Начнём с ваших потребностей.|No necesitas saberlo todo. Empecemos por tus necesidades.|Non devi sapere tutto. Partiamo dalle tue esigenze.
Gün boyu yanında|With you all day|Den ganzen Tag dabei|С вами весь день|Contigo todo el día|Con te tutto il giorno
İş, okul veya oyun|Work, study or gaming|Arbeit, Lernen oder Spielen|Работа, учёба или игры|Trabajo, estudio o juegos|Lavoro, studio o gioco
Evdeki büyük ekran|The big screen at home|Der große Bildschirm zu Hause|Большой экран дома|La gran pantalla en casa|Il grande schermo di casa
Henüz emin değilim|I'm not sure yet|Ich bin noch unsicher|Пока не знаю|Aún no lo sé|Non sono ancora sicuro
Yeni sohbet|New chat|Neuer Chat|Новый чат|Nueva conversación|Nuova chat
Sohbeti kapat|Close chat|Chat schließen|Закрыть чат|Cerrar chat|Chiudi chat
Sohbet mesajları|Chat messages|Chatnachrichten|Сообщения чата|Mensajes del chat|Messaggi della chat
Sen|You|Du|Вы|Tú|Tu
Yanıt hazırlanıyor…|Preparing a response…|Antwort wird vorbereitet…|Готовим ответ…|Preparando respuesta…|Preparazione della risposta…
RoboPengu yanıtlıyor…|RoboPengu is responding…|RoboPengu antwortet…|RoboPengu отвечает…|RoboPengu está respondiendo…|RoboPengu sta rispondendo…
RoboPengu mesajı|Message to RoboPengu|Nachricht an RoboPengu|Сообщение RoboPengu|Mensaje a RoboPengu|Messaggio a RoboPengu
İhtiyacını kendi cümlelerinle anlat…|Describe what you need in your own words…|Beschreibe deinen Bedarf mit eigenen Worten…|Расскажите своими словами, что вам нужно…|Describe con tus palabras lo que necesitas…|Descrivi con parole tue cosa ti serve…
Mesajı gönder|Send message|Nachricht senden|Отправить сообщение|Enviar mensaje|Invia messaggio
Yeniden dene|Try again|Erneut versuchen|Повторить|Reintentar|Riprova
Kataloğu keşfet →|Explore catalog →|Katalog entdecken →|Открыть каталог →|Explorar catálogo →|Esplora catalogo →
Şu anda AI yanıt hizmetine bağlanamıyorum. Sorunu yeniden deneyebilir veya ürünleri katalogda inceleyebilirsin.|I can't connect to the AI service right now. Try again or browse the catalog.|Der KI-Dienst ist gerade nicht erreichbar. Versuche es erneut oder nutze den Katalog.|Сейчас не удаётся подключиться к ИИ. Повторите запрос или откройте каталог.|Ahora no puedo conectar con la IA. Reinténtalo o explora el catálogo.|Al momento non riesco a connettermi all'IA. Riprova o esplora il catalogo.
AI yanıtları hata içerebilir. Güncel fiyat ve kaynak durumunu kontrol et.|AI can make mistakes. Check current prices and sources.|KI kann Fehler machen. Prüfe aktuelle Preise und Quellen.|ИИ может ошибаться. Проверяйте актуальные цены и источники.|La IA puede cometer errores. Comprueba precios y fuentes.|L'IA può commettere errori. Controlla prezzi e fonti.
Telefon arıyorum.|I'm looking for a phone.|Ich suche ein Smartphone.|Я ищу телефон.|Busco un teléfono.|Cerco un telefono.
Bilgisayar arıyorum.|I'm looking for a computer.|Ich suche einen Computer.|Я ищу компьютер.|Busco un ordenador.|Cerco un computer.
Televizyon arıyorum.|I'm looking for a television.|Ich suche einen Fernseher.|Я ищу телевизор.|Busco un televisor.|Cerco un televisore.
Henüz ne alacağımdan emin değilim.|I'm not sure what to buy yet.|Ich weiß noch nicht, was ich kaufen möchte.|Пока не знаю, что купить.|Aún no sé qué comprar.|Non so ancora cosa acquistare.
Sessiz çalışan bir laptop arıyorum.|I'm looking for a quiet laptop.|Ich suche einen leisen Laptop.|Я ищу тихий ноутбук.|Busco un portátil silencioso.|Cerco un portatile silenzioso.
Film izlemek için televizyon arıyorum.|I'm looking for a television for movies.|Ich suche einen Fernseher für Filme.|Я ищу телевизор для фильмов.|Busco un televisor para ver películas.|Cerco un televisore per guardare film.
Uzun pil ömrü benim için önemli.|Long battery life matters to me.|Lange Akkulaufzeit ist mir wichtig.|Мне важна долгая работа батареи.|Me importa que dure la batería.|Per me conta una batteria duratura.
Kullanım amacıma uygun bir cihaz seçmek istiyorum.|I want a device that fits how I'll use it.|Ich suche ein Gerät für meinen Einsatzzweck.|Хочу выбрать устройство под мои задачи.|Quiero un dispositivo adecuado para mi uso.|Voglio un dispositivo adatto al mio utilizzo.
Bir cihaz seçerken önceliklerimi netleştirmek istiyorum.|I want to clarify my priorities when choosing a device.|Ich möchte meine Prioritäten bei der Gerätewahl klären.|Хочу определить приоритеты при выборе устройства.|Quiero aclarar mis prioridades al elegir un dispositivo.|Voglio chiarire le mie priorità nella scelta del dispositivo.
Keşfet|Explore|Entdecken|Обзор|Explorar|Esplora
Güven & Destek|Trust & support|Vertrauen & Hilfe|Доверие и помощь|Confianza y ayuda|Fiducia e assistenza
Hatalı Bilgi Bildir|Report incorrect information|Falsche Angaben melden|Сообщить об ошибке|Notificar información incorrecta|Segnala informazioni errate
Veri ve Fiyat Uyarıları|Data and price notices|Daten- und Preishinweise|Примечания о данных и ценах|Avisos sobre datos y precios|Avvisi su dati e prezzi
Gizlilik Politikası|Privacy policy|Datenschutz|Конфиденциальность|Privacidad|Privacy
Kullanım Koşulları|Terms of use|Nutzungsbedingungen|Условия использования|Condiciones de uso|Condizioni d'uso
İletişim|Contact|Kontakt|Контакты|Contacto|Contatti
Yasal Uyarı|Legal notice|Rechtlicher Hinweis|Правовая информация|Aviso legal|Note legali
Bilmediğimizi de söyleriz.|We say when we don't know.|Wir sagen, wenn wir etwas nicht wissen.|Мы говорим, если не знаем.|Decimos cuando no sabemos.|Diciamo quando non sappiamo.
Güncel teklif, son görülen fiyat ve katalog referansı aynı şey değildir.|Current offers, last-seen prices and catalog references are different.|Aktuelle Angebote, zuletzt erfasste Preise und Katalogreferenzen unterscheiden sich.|Актуальное предложение, последняя цена и цена каталога — разные данные.|Las ofertas actuales, los últimos precios y las referencias del catálogo son distintos.|Offerte attuali, ultimi prezzi e riferimenti di catalogo sono dati diversi.
Bağımsız Fiyat Rehberliği|Independent price guidance|Unabhängige Preisorientierung|Независимый ценовой справочник|Orientación de precios independiente|Guida indipendente ai prezzi
İhtiyacını anla. Seçeneklerini karşılaştır.|Understand your needs. Compare your options.|Bedarf verstehen. Möglichkeiten vergleichen.|Определите потребности. Сравните варианты.|Entiende tus necesidades. Compara opciones.|Comprendi le tue esigenze. Confronta le opzioni.
Kararını aceleye getirme.|Take your time choosing.|Entscheide in Ruhe.|Не спешите с выбором.|Decide sin prisas.|Scegli senza fretta.
Telefon, bilgisayar ve teknoloji ürünlerinin kayıtlı özelliklerini karşılaştırın. Güncel teklifler, son görülen fiyatlar ve katalog referansları ayrı etiketlerle sunulur.|Compare listed product specifications. Current offers, last-seen prices and catalog references are labeled separately.|Vergleiche erfasste Produktdaten. Aktuelle Angebote, letzte Preise und Katalogreferenzen sind getrennt gekennzeichnet.|Сравнивайте указанные характеристики. Актуальные предложения, последние цены и цены каталога отмечены отдельно.|Compara características registradas. Las ofertas actuales, últimos precios y referencias se etiquetan por separado.|Confronta le specifiche registrate. Offerte attuali, ultimi prezzi e riferimenti sono etichettati separatamente.
aceleEtme doğrudan ürün satışı yapmayan bağımsız bir yönlendirme platformudur. Fiyatın güncellik etiketini kontrol ediniz; nihai ve geçerli bilgiler satıcı mağazasındadır.|aceleEtme is an independent referral platform, not a seller. Check price freshness; the retailer provides final details.|aceleEtme ist eine unabhängige Vermittlungsplattform, kein Verkäufer. Prüfe die Preisaktualität; verbindliche Angaben macht der Händler.|aceleEtme — независимая справочная платформа, а не продавец. Проверяйте актуальность цен; окончательные условия у магазина.|aceleEtme es una plataforma independiente, no un vendedor. Comprueba la vigencia del precio; los detalles finales están en la tienda.|aceleEtme è una piattaforma indipendente, non un venditore. Verifica l'attualità del prezzo; i dettagli finali sono del negozio.
Tüm hakları saklıdır.|All rights reserved.|Alle Rechte vorbehalten.|Все права защищены.|Todos los derechos reservados.|Tutti i diritti riservati.
Ürün ara|Search products|Produkte suchen|Поиск товаров|Buscar productos|Cerca prodotti
Arama yap|Search|Suchen|Поиск|Buscar|Cerca
Aramayı temizle|Clear search|Suche löschen|Очистить поиск|Borrar búsqueda|Cancella ricerca
Sesli Arama|Voice search|Sprachsuche|Голосовой поиск|Búsqueda por voz|Ricerca vocale
RoboPengu AI Danışmanı|RoboPengu AI assistant|RoboPengu KI-Assistent|ИИ-помощник RoboPengu|Asistente IA RoboPengu|Assistente IA RoboPengu
Ürün önerileri hazırlanıyor…|Loading suggestions…|Vorschläge werden geladen…|Загружаем подсказки…|Cargando sugerencias…|Caricamento suggerimenti…
Arama önerileri yüklenemedi.|Search suggestions could not load.|Suchvorschläge konnten nicht geladen werden.|Не удалось загрузить подсказки.|No se pudieron cargar las sugerencias.|Impossibile caricare i suggerimenti.
Tekrar Dene|Try again|Erneut versuchen|Повторить|Reintentar|Riprova
Arama Sayfasını Aç|Open search page|Suchseite öffnen|Открыть поиск|Abrir búsqueda|Apri ricerca
Arama Sayfasında Devam Et|Continue on search page|Auf der Suchseite fortfahren|Продолжить поиск|Continuar en búsqueda|Continua nella ricerca
Bu Aramayı RoboPengu’ya Sor 🐧|Ask RoboPengu about this 🐧|RoboPengu dazu fragen 🐧|Спросить RoboPengu 🐧|Preguntar a RoboPengu 🐧|Chiedi a RoboPengu 🐧
Laboratuvar videosunu oynat|Play lab video|Laborvideo abspielen|Включить видео лаборатории|Reproducir vídeo del laboratorio|Riproduci video del laboratorio
Laboratuvar videosunu duraklat|Pause lab video|Laborvideo pausieren|Приостановить видео|Pausar vídeo del laboratorio|Metti in pausa il video
RoboPengu yüklenemedi. Yeniden deneyebilirsin.|RoboPengu could not load. Please try again.|RoboPengu konnte nicht geladen werden. Versuche es erneut.|Не удалось загрузить RoboPengu. Повторите попытку.|No se pudo cargar RoboPengu. Reinténtalo.|Impossibile caricare RoboPengu. Riprova.
3D model hazırlanıyor…|Preparing 3D model…|3D-Modell wird vorbereitet…|Подготовка 3D-модели…|Preparando modelo 3D…|Preparazione modello 3D…
Hareket duraklatıldı.|Motion paused.|Bewegung pausiert.|Движение приостановлено.|Movimiento en pausa.|Movimento in pausa.
Bakış, göz kırpma ve beden hareketleri açık.|Gaze, blinking and body motion are active.|Blick, Blinzeln und Körperbewegung sind aktiv.|Взгляд, моргание и движения тела включены.|Mirada, parpadeo y movimiento corporal activos.|Sguardo, battito delle palpebre e movimento attivi.
Etkileşimli üç boyutlu RoboPengu|Interactive 3D RoboPengu|Interaktiver 3D-RoboPengu|Интерактивный 3D RoboPengu|RoboPengu 3D interactivo|RoboPengu 3D interattivo
Dil seç|Choose language|Sprache wählen|Выбрать язык|Elegir idioma|Scegli lingua
Sesli arama kullanılamıyor. Aramanı yazarak sürdürebilirsin.|Voice search is unavailable. You can type your search instead.|Die Sprachsuche ist nicht verfügbar. Gib deine Suche ein.|Голосовой поиск недоступен. Введите запрос текстом.|La búsqueda por voz no está disponible. Escribe tu búsqueda.|La ricerca vocale non è disponibile. Puoi digitare la ricerca.
`;

export const homeLanguages: Language[] = ['tr', 'en', 'de', 'ru', 'es', 'it'];
export const homeCopy: Record<string, string[]> = Object.fromEntries(rows.trim().split('\n').map(row => { const values = row.split('|'); return [values[0], values]; }));
export function translateHome(language: Language, text: string): string {
  return homeCopy[text]?.[homeLanguages.indexOf(language)] ?? text;
}
