;(function() {
  'use strict';

  const SUBS = ['orslokx','memexico','yo_ctm','dankgentina','latesitoo','mediomemes','maau'];
  function getAPI() { return 'https://meme-api.com/gimme/' + SUBS[Math.floor(Math.random() * SUBS.length)]; }
  const SDK_NAME = 'show_11026821';

  const container = document.getElementById('meme-container');
  const loader = document.getElementById('loader');
  const content = document.getElementById('meme-content');
  const errorMsg = document.getElementById('error-msg');
  const image = document.getElementById('meme-image');
  const title = document.getElementById('meme-title');
  const author = document.getElementById('meme-author');
  const ups = document.getElementById('meme-ups');
  const memeBtn = document.getElementById('meme-btn');
  const shareBtn = document.getElementById('share-btn');
  const adBtn = document.getElementById('meme-ad-btn');
  const counter = document.getElementById('counter');

  let count = 0;
  let currentUrl = '';
  let currentTitle = '';

  function waitForSDK(retries = 20) {
    return new Promise((resolve, reject) => {
      function check(n) {
        if (typeof window[SDK_NAME] === 'function') {
          resolve(true);
        } else if (n <= 0) {
          reject(new Error('SDK timeout'));
        } else {
          setTimeout(() => check(n - 1), 500);
        }
      }
      check(retries);
    });
  }

  function initTelegram() {
    const tg = window.Telegram = window.Telegram || {};
    tg.WebApp = tg.WebApp || {};
    if (tg.WebApp.initData) {
      tg.WebApp.ready();
      tg.WebApp.expand();
    }
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.WebApp.backgroundColor || '#1a1a2e');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.WebApp.textColor || '#eee');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.WebApp.hintColor || '#888');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.WebApp.buttonColor || '#2ea6ff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.WebApp.secondaryBackgroundColor || '#16213e');
  }

  async function showVideoAd() {
    try {
      await waitForSDK(8);
      await window[SDK_NAME]().catch(() => {});
    } catch (e) {}
  }

  async function showPopupAd() {
    try {
      await waitForSDK();
      await window[SDK_NAME]('pop').catch(() => {});
    } catch (e) {}
  }

  function showLoader() {
    loader.classList.remove('hidden');
    content.classList.add('hidden');
    errorMsg.classList.add('hidden');
    memeBtn.disabled = true;
  }

  function hideLoader() {
    loader.classList.add('hidden');
    memeBtn.disabled = false;
  }

  function showAdBtn() {
    adBtn.textContent = '🎬 Ver oferta + bonus';
    adBtn.classList.remove('hidden');
  }

  function fetchMeme() {
    if (memeBtn.disabled) return;
    showLoader();

    fetch(getAPI())
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(data => {
        currentUrl = data.url;
        currentTitle = data.title || 'Sin título';

        image.src = currentUrl;
        title.textContent = currentTitle;
        author.textContent = '✏️ ' + (data.author || 'anon');
        ups.textContent = '⬆️ ' + (data.ups || 0);

        count++;
        counter.textContent = count + ' memes vistos';

        hideLoader();
        content.classList.remove('hidden');
        shareBtn.classList.remove('hidden');

        if (count % 2 === 0) showVideoAd();
        showAdBtn();
      })
      .catch(err => {
        hideLoader();
        errorMsg.classList.remove('hidden');
      });
  }

  function shareMeme() {
    if (!currentUrl) return;
    const tg = window.Telegram?.WebApp;
    if (tg?.initData) {
      tg.shareToStory?.(currentUrl) || tg.shareUrl?.(currentUrl);
    } else {
      window.open('https://t.me/share/url?url=' + encodeURIComponent(currentUrl) + '&text=' + encodeURIComponent(currentTitle));
    }
  }

  async function handleAd() {
    adBtn.disabled = true;
    adBtn.textContent = 'Cargando...';
    await showPopupAd();
    adBtn.classList.add('hidden');
    adBtn.disabled = false;
    count += 3;
    counter.textContent = count + ' memes vistos';
    fetchMeme();
  }

  memeBtn.addEventListener('click', fetchMeme);
  memeBtn.addEventListener('touchend', e => { e.preventDefault(); fetchMeme(); });
  shareBtn.addEventListener('click', shareMeme);
  adBtn.addEventListener('click', handleAd);
  image.addEventListener('dragstart', e => e.preventDefault());

  let touchY = 0;
  container.addEventListener('touchstart', e => {
    touchY = e.changedTouches[0].clientY;
  });
  container.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dy) > 60) fetchMeme();
  });

  initTelegram();
  fetchMeme();

  setTimeout(() => showVideoAd(), 5000);
  setInterval(() => showVideoAd(), 30000);
})();
