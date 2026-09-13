/**
 * RoboPengu Voice Controller (Web Speech API)
 * aceleetme.com - Bağımsız Seslendirme Modülü
 */

const RoboPenguVoice = {
  isMuted: false,
  activeUtterance: null,

  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/\[\/?SUMMARY_CHAT\]/gi, '')
      .replace(/\[\/?DEEP_ANALYSIS\]/gi, '')
      .replace(/[*#_~\[\]]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  speak(text) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    this.stop();

    const plainText = this.cleanText(text);
    if (!plainText) return;

    try {
      // Chromium duraklatılmış ses kuyruğunu uyandır
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = 'tr-TR';
      utterance.pitch = 1.18; // Sempatik, genç siborg / asistan tınısı
      utterance.rate = 1.05;  // Akıcı, kendinden emin ve anlaşılır tempo
      utterance.volume = 1.0;

      // Türkçe ses profilini önceliklendir (Google Türkçe, Microsoft Tolga vb.)
      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find(
        (v) =>
          (v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('tr')) ||
          (v.name && (v.name.toLowerCase().includes('turkish') || v.name.toLowerCase().includes('türkçe') || v.name.toLowerCase().includes('tolga')))
      );
      if (trVoice) {
        utterance.voice = trVoice;
        utterance.lang = trVoice.lang;
      }

      // Chromium Çöp Toplayıcı (Garbage Collector) hafıza koruması
      this.activeUtterance = utterance;

      utterance.onend = () => {
        this.activeUtterance = null;
      };
      utterance.onerror = (e) => {
        console.warn('[RoboPenguVoice] error:', e);
        this.activeUtterance = null;
      };

      // Cancel ve Speak arasındaki asenkron çakışmayı önleyen 50ms gecikme
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    } catch (err) {
      console.warn('[RoboPenguVoice] speak exception:', err);
      this.activeUtterance = null;
    }
  },

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      this.activeUtterance = null;
    }
  },

  toggleMute(btnElement) {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('robopengu_voice_enabled', String(!this.isMuted));
    } catch {}

    if (this.isMuted) {
      this.stop();
      if (btnElement) {
        btnElement.classList.add('muted');
        btnElement.setAttribute('aria-label', 'Sesi Aç');
      }
    } else {
      if (btnElement) {
        btnElement.classList.remove('muted');
        btnElement.setAttribute('aria-label', 'Sesi Kapat');
      }
    }
    return this.isMuted;
  }
};

// Sayfa yüklendiğinde sesleri önbelleğe al
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

if (typeof window !== 'undefined') {
  window.RoboPenguVoice = RoboPenguVoice;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RoboPenguVoice;
}
