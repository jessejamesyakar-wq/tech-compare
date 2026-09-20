/* The same file runs as a content script and exports helpers for Node tests. */
(() => {
  const API_BASE = 'https://www.aceleetme.tech';
  const FRESH_MS = 24 * 60 * 60 * 1000;
  const WIDGET_ID = 'aceleetme-widget';
  const money = new Intl.NumberFormat('tr-TR', {style:'currency',currency:'TRY',maximumFractionDigits:2});
  const observed = new Intl.DateTimeFormat('tr-TR', {dateStyle:'short',timeStyle:'short',timeZone:'Europe/Istanbul'});

  function cleanTitle(raw) {
    return String(raw || '').replace(/\s[-|]\s(?:Hepsiburada|Trendyol|MediaMarkt|Vatan Bilgisayar).*$/i, '')
      .replace(/Fiyatı, Yorumları.*$/i, '').replace(/Satın Al.*$/i, '').trim();
  }

  function extractProductName(doc, hostname) {
    const selectors = {
      'www.hepsiburada.com':'h1[data-test-id="title"], header h1',
      'www.trendyol.com':'h1.pr-new-br, h1.product-name',
      'www.mediamarkt.com.tr':'h1[data-test="product-title"]',
      'www.vatanbilgisayar.com':'h1.product-list__product-name',
    };
    const h1 = (selectors[hostname] && doc.querySelector(selectors[hostname])) || doc.querySelector('h1');
    // Empty headings during navigation must not revive stale OG metadata.
    if (h1) return cleanTitle(h1.textContent);
    return cleanTitle(doc.querySelector('meta[property="og:title"]')?.content || doc.title);
  }

  function isProductPage(doc, location) {
    const path = location.pathname;
    if (/^\/(?:ara|arama|search|sr|s)(?:\/|\.|$)/i.test(path)) return false;
    if (/-p-|\/urun\/|\/p\/|-pm-|\/product\//i.test(path)) return true;
    if (location.hostname === 'www.vatanbilgisayar.com' && path.endsWith('.html') && doc.querySelector('h1.product-list__product-name')) return true;
    return doc.querySelector('meta[property="og:type"]')?.content === 'product';
  }

  function freshTimestamp(value, now) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return null;
    const ms = Date.parse(value);
    // API timestamps use the shared application parser and canonical UTC.
    if (!Number.isFinite(ms) || new Date(ms).toISOString() !== value || ms > now || now - ms > FRESH_MS) return null;
    return ms;
  }

  function validateMatch(data, now = Date.now()) {
    const match = data?.match;
    if (!match || typeof match.productName !== 'string' || !match.productName.trim() || match.productName.length > 500) return null;
    let url;
    try { url = new URL(match.aceleetmeUrl); } catch { return null; }
    if (!['https://www.aceleetme.tech','https://aceleetme.tech'].includes(url.origin) || url.username || url.password || url.search || url.hash ||
        !/^\/(?:phones|laptops|tvs|appliances|tablets|smartwatches|headphones|monitors|consoles)\/[^/]+$/.test(url.pathname)) return null;
    if (!Array.isArray(match.allPrices) || !match.allPrices.length || match.allPrices.length > 100) return null;
    const prices = [];
    for (const row of match.allPrices) {
      const checked = freshTimestamp(row?.lastCheckedAt, now);
      if (!row || typeof row.store !== 'string' || !row.store.trim() || row.store.length > 160 || typeof row.price !== 'number' || !Number.isFinite(row.price) || row.price <= 0 || row.inStock !== true || checked === null) return null;
      prices.push({...row,checked});
    }
    const best = prices.reduce((a,b) => b.price < a.price ? b : a);
    if (match.bestPrice !== best.price || match.bestStore !== best.store || match.lastCheckedAt !== best.lastCheckedAt || match.statusLabel !== 'Güncel Fiyat') return null;
    return {name:match.productName,url:url.href,best,prices,expiresAt:Math.min(...prices.map(p=>p.checked + FRESH_MS))};
  }

  function renderWidget(doc, match, dismiss) {
    const make = (tag, className, text) => {
      const element = doc.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    };
    const widget = make('aside'); widget.id = WIDGET_ID; widget.setAttribute('aria-label','aceleEtme Fiyat Radarı');
    const header = make('div','aceleetme-header');
    const close = make('button','aceleetme-close','✕'); close.type = 'button'; close.setAttribute('aria-label','Fiyat radarını kapat');
    header.append(make('span','', '⚡ aceleEtme Fiyat Radarı'),close);
    const body = make('div','aceleetme-body');
    body.append(make('div','aceleetme-product-name',match.name));
    const best = make('div','aceleetme-best');
    best.append(make('div','','Kayıtlı güncel teklifler arasında en düşük fiyat'),make('strong','',money.format(match.best.price)),make('div','',match.best.store));
    const timestamp = make('time','aceleetme-observed','Kontrol: '+observed.format(match.best.checked)+' (Türkiye saati)');
    timestamp.dateTime = match.best.lastCheckedAt;
    best.append(make('div','aceleetme-status','Güncel Fiyat'),timestamp); body.append(best);
    const list = make('ul','aceleetme-list'); list.setAttribute('aria-label','Güncel mağaza teklifleri');
    for (const price of match.prices) {
      const row = make('li','aceleetme-row');
      const store = make('div','aceleetme-store'); store.append(make('span','',price.store));
      const date = make('time','aceleetme-observed',observed.format(price.checked)); date.dateTime = price.lastCheckedAt;
      store.append(date); row.append(store,make('span','aceleetme-price',money.format(price.price))); list.append(row);
    }
    body.append(list,make('p','aceleetme-note','Kargo ve satıcı koşullarını mağazada kontrol edin.'));
    const link = make('a','aceleetme-cta','Ürünü ve mağazaları incele →'); link.href = match.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; body.append(link);
    const returnFocus = doc.activeElement;
    const finish = () => { const hadFocus = widget.contains(doc.activeElement); dismiss(); if (hadFocus && returnFocus?.isConnected) returnFocus.focus({preventScroll:true}); };
    close.addEventListener('click',finish);
    widget.addEventListener('keydown',event => { if (event.key === 'Escape') { event.preventDefault(); finish(); } });
    widget.append(header,body); doc.body.append(widget);
    return widget;
  }

  function startRadar(win, doc) {
    let key = '', previousUrl = '', previousTitle = '', waitingForTitle = false;
    let generation = 0, request, debounce, expiry, timeout, stopped = false;
    const dismissed = new Set();
    const identity = () => {
      const name = extractProductName(doc,win.location.hostname), url = win.location.href;
      return {name,url,key:url+'\n'+name,valid:name.length >= 3 && name.length <= 500 && isProductPage(doc,win.location)};
    };
    const clear = () => {
      generation++; request?.abort(); request = undefined;
      win.clearTimeout(debounce); win.clearTimeout(expiry); win.clearTimeout(timeout);
      doc.getElementById(WIDGET_ID)?.remove();
    };
    const refresh = (force = false) => {
      if (stopped) return;
      const current = identity();
      if (!force && current.key === key) return;
      clear();
      if (previousUrl && current.url !== previousUrl && current.name === previousTitle) waitingForTitle = true;
      if (current.name !== previousTitle) waitingForTitle = false;
      key = current.key; previousUrl = current.url; previousTitle = current.name;
      if (!current.valid || waitingForTitle || dismissed.has(key) || doc.hidden) return;
      const ownGeneration = generation;
      debounce = win.setTimeout(async () => {
        const controller = new AbortController(); request = controller;
        const ownTimeout = win.setTimeout(()=>controller.abort(),10000); timeout = ownTimeout;
        try {
          const response = await win.fetch(API_BASE+'/api/compare?q='+encodeURIComponent(current.name),{signal:controller.signal,cache:'no-store',credentials:'omit'});
          if (!response.ok) return;
          const data = await response.json();
          if (stopped || controller.signal.aborted || ownGeneration !== generation || identity().key !== current.key) return;
          const match = validateMatch(data);
          if (!match) return;
          renderWidget(doc,match,()=>{dismissed.add(current.key);if(dismissed.size>100)dismissed.delete(dismissed.values().next().value);clear();});
          expiry = win.setTimeout(()=>refresh(true),Math.max(1,match.expiresAt-Date.now()+1));
        } catch { /* A failed lookup produces no price claim. */ }
        finally { win.clearTimeout(ownTimeout); }
      },250);
    };
    const observer = new win.MutationObserver(()=>refresh());
    observer.observe(doc.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['content']});
    // Page-world pushState wrappers are not reliable in an isolated content
    // script. Poll only URL/title; never scan the merchant's entire body text.
    const poll = win.setInterval(()=>refresh(),750);
    const onNavigate = () => refresh();
    const onVisible = () => { if (!doc.hidden) refresh(true); };
    win.addEventListener('popstate',onNavigate); win.addEventListener('hashchange',onNavigate); win.addEventListener('pageshow',onVisible); doc.addEventListener('visibilitychange',onVisible);
    refresh();
    return () => { stopped = true; clear(); observer.disconnect(); win.clearInterval(poll); win.removeEventListener('popstate',onNavigate);win.removeEventListener('hashchange',onNavigate);win.removeEventListener('pageshow',onVisible);doc.removeEventListener('visibilitychange',onVisible); };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = {cleanTitle,freshTimestamp,validateMatch,extractProductName,isProductPage,renderWidget,startRadar};
  else {
    const begin = () => { window.__aceleetmeRadarCleanup?.(); window.__aceleetmeRadarCleanup = startRadar(window,document); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',begin,{once:true}); else begin();
  }
})();
