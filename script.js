/**
 * Soft Baby 1st Birthday Invitation - Script
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     Utility Helpers
     ═══════════════════════════════════════════ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function formatDate(dateStr, timeStr) {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = days[d.getDay()];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const h12 = hours % 12 || 12;
    const minuteStr = minutes > 0 ? ` ${minutes}분` : '';
    return `${year}년 ${month}월 ${date}일 ${day}요일 ${period} ${h12}시${minuteStr}`;
  }

  function getEventDateTime() {
    return new Date(`${CONFIG.wedding.date}T${CONFIG.wedding.time}:00`);
  }

  /* ═══════════════════════════════════════════
     Image Auto-Detection
     ═══════════════════════════════════════════ */

  function loadImagesFromFolder(folder, maxAttempts = 50) {
    return new Promise(resolve => {
      const images = [];
      let current = 1;
      let consecutiveFails = 0;

      function tryNext() {
        if (current > maxAttempts || consecutiveFails >= 3) {
          resolve(images);
          return;
        }
        const img = new Image();
        const path = `images/${folder}/${current}.jpg`;
        img.onload = function() {
          images.push(path);
          consecutiveFails = 0;
          current++;
          tryNext();
        };
        img.onerror = function() {
          consecutiveFails++;
          current++;
          tryNext();
        };
        img.src = path;
      }

      tryNext();
    });
  }

  /* ═══════════════════════════════════════════
     Toast
     ═══════════════════════════════════════════ */

  let toastTimer = null;
  function showToast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2500);
  }

  /* ═══════════════════════════════════════════
     Clipboard
     ═══════════════════════════════════════════ */

  async function copyToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(successMsg || '복사되었습니다');
    } catch {
      showToast('복사에 실패했습니다');
    }
  }

  /* ═══════════════════════════════════════════
     OG Meta Tags
     ═══════════════════════════════════════════ */

  function setMetaTags() {
    const m = CONFIG.meta;
    document.title = m.title;
    const setMeta = (attr, val, content) => {
      const el = document.querySelector(`meta[${attr}="${val}"]`);
      if (el) el.setAttribute('content', content);
    };
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:image', 'images/og/1.jpg');
    setMeta('name', 'description', m.description);
  }

  /* ═══════════════════════════════════════════
     Curtain Opening
     ═══════════════════════════════════════════ */

  function initCurtain() {
    const curtain = $('#curtain');
    const btn = $('#curtainBtn');
    const namesEl = $('#curtainNames');

    if (!curtain || !btn) return;

    if (CONFIG.useCurtain === false) {
      curtain.style.display = 'none';
      return;
    }

    namesEl.textContent = `${CONFIG.baby.name}의 첫 돌잔치`;

    btn.addEventListener('click', () => {
      curtain.classList.add('is-open');
      document.body.classList.remove('no-scroll');
      setTimeout(() => {
        curtain.classList.add('is-hidden');
      }, 1400);
    });

    document.body.classList.add('no-scroll');
  }

  /* ═══════════════════════════════════════════
     Hero Section
     ═══════════════════════════════════════════ */

  function initHero() {
    const photo = $('#heroPhoto');
    if (photo) photo.src = 'images/hero/1.jpg';

    const names = $('#heroNames');
    if (names) names.textContent = CONFIG.baby.name;

    const date = $('#heroDate');
    if (date) date.textContent = formatDate(CONFIG.wedding.date, CONFIG.wedding.time);

    const venue = $('#heroVenue');
    if (venue) venue.textContent = CONFIG.wedding.hall;
  }

  /* ═══════════════════════════════════════════
     Countdown
     ═══════════════════════════════════════════ */

  function initCountdown() {
    const target = getEventDateTime();

    function update() {
      const now = new Date();
      const diff = target - now;

      const labelEl = $('#countdownLabel');
      if (!labelEl) return;

      if (diff <= 0) {
        if ($('#countDays')) $('#countDays').textContent = '0';
        if ($('#countHours')) $('#countHours').textContent = '0';
        if ($('#countMinutes')) $('#countMinutes').textContent = '0';
        if ($('#countSeconds')) $('#countSeconds').textContent = '0';
        labelEl.textContent = '돌잔치가 시작되었습니다';
        return;
      }

      const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      labelEl.textContent = `돌잔치까지 D-${totalDays}`;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if ($('#countDays')) $('#countDays').textContent = days;
      if ($('#countHours')) $('#countHours').textContent = String(hours).padStart(2, '0');
      if ($('#countMinutes')) $('#countMinutes').textContent = String(minutes).padStart(2, '0');
      if ($('#countSeconds')) $('#countSeconds').textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════
     Greeting Section
     ═══════════════════════════════════════════ */

  function initGreeting() {
    if ($('#greetingTitle')) $('#greetingTitle').textContent = CONFIG.greeting.title;
    if ($('#greetingContent')) $('#greetingContent').textContent = CONFIG.greeting.content;

    const b = CONFIG.baby;

    const parentsHTML = `
      <div class="parent-row">
        아빠 <span class="child-name">${b.father}</span> · 엄마 <span class="child-name">${b.mother}</span>
      </div>
      <div class="parent-row" style="margin-top: 4px;">
        아기 <span class="child-name">${b.name}</span>
      </div>
    `;

    if ($('#greetingParents')) $('#greetingParents').innerHTML = parentsHTML;
  }

  /* ═══════════════════════════════════════════
     Calendar Section
     ═══════════════════════════════════════════ */

  function initCalendar() {
    const dt = getEventDateTime();
    const year = dt.getFullYear();
    const month = dt.getMonth();
    const eventDay = dt.getDate();

    const grid = $('#calendarGrid');
    if (!grid) return;

    const subDateEl = $('#calendarSubDate');
    if (subDateEl) {
      subDateEl.textContent = formatDate(CONFIG.wedding.date, CONFIG.wedding.time);
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    grid.innerHTML = `<div class="calendar__header">${monthNames[month]} ${year}</div>`;

    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const wdRow = document.createElement('div');
    wdRow.className = 'calendar__weekdays';
    weekdays.forEach(wd => {
      const el = document.createElement('span');
      el.className = 'calendar__weekday';
      el.textContent = wd;
      wdRow.appendChild(el);
    });
    grid.appendChild(wdRow);

    const daysContainer = document.createElement('div');
    daysContainer.className = 'calendar__days';

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('span');
      empty.className = 'calendar__day is-empty';
      daysContainer.appendChild(empty);
    }

    for (let d = 1; d <= lastDate; d++) {
      const dayEl = document.createElement('span');
      dayEl.className = 'calendar__day';
      if (d === eventDay) dayEl.classList.add('is-today');
      dayEl.textContent = d;
      daysContainer.appendChild(dayEl);
    }

    grid.appendChild(daysContainer);

    // Google Calendar link
    const startDate = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDt = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
    const endDate = endDt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CONFIG.baby.name + ' 돌잔치')}&dates=${startDate}/${endDate}&location=${encodeURIComponent(CONFIG.wedding.venue + ' ' + CONFIG.wedding.hall + ' ' + CONFIG.wedding.address)}&details=${encodeURIComponent('첫 돌잔치에 초대합니다.')}`;

    const gcalBtn = $('#googleCalBtn');
    if (gcalBtn) gcalBtn.href = gcalUrl;

    // ICS download (Apple Calendar)
    const icsBtn = $('#icsDownloadBtn');
    if (icsBtn) {
      icsBtn.addEventListener('click', () => {
        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Baby//Invitation//KO',
          'BEGIN:VEVENT',
          `DTSTART:${startDate}`,
          `DTEND:${endDate}`,
          `SUMMARY:${CONFIG.baby.name} 돌잔치`,
          `LOCATION:${CONFIG.wedding.venue} ${CONFIG.wedding.hall} ${CONFIG.wedding.address}`,
          'DESCRIPTION:첫 돌잔치에 초대합니다.',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'baby_birthday.ics';
        a.click();
        URL.revokeObjectURL(url);
        showToast('캘린더 파일이 다운로드됩니다');
      });
    }
  }

  /* ═══════════════════════════════════════════
     Gallery Section
     ═══════════════════════════════════════════ */

  function initGallery(galleryImages) {
    const grid = $('#galleryGrid');
    if (!grid) return;

    const placeholder = grid.querySelector('.loading-placeholder');
    if (placeholder) placeholder.remove();

    if (galleryImages.length === 0) {
      const gallerySection = $('#gallery');
      if (gallerySection) gallerySection.style.display = 'none';
      return;
    }

    galleryImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'gallery__item animate-item';
      div.setAttribute('data-animate', 'scale-in');
      div.innerHTML = `<img src="${src}" alt="갤러리 사진 ${i + 1}" loading="lazy">`;
      div.addEventListener('click', () => openPhotoModal(galleryImages, i));
      grid.appendChild(div);
    });
  }

  /* ═══════════════════════════════════════════
     Photo Modal
     ═══════════════════════════════════════════ */

  let modalImages = [];
  let modalIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  function openPhotoModal(images, index) {
    modalImages = images;
    modalIndex = index;
    showModalImage();
    const modal = $('#photoModal');
    if (modal) modal.classList.add('is-open');
    document.body.classList.add('no-scroll');
  }

  function closePhotoModal(e) {
    if (e && e.preventDefault) e.preventDefault();
    const modal = $('#photoModal');
    if (modal) modal.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }

  function showModalImage() {
    const img = $('#modalImg');
    if (img) img.src = modalImages[modalIndex];

    const counter = $('#modalCounter');
    if (counter) counter.textContent = `${modalIndex + 1} / ${modalImages.length}`;

    const prev = $('#modalPrev');
    if (prev) prev.style.display = modalIndex > 0 ? '' : 'none';

    const next = $('#modalNext');
    if (next) next.style.display = modalIndex < modalImages.length - 1 ? '' : 'none';
  }

  function modalNavigate(dir) {
    const newIndex = modalIndex + dir;
    if (newIndex >= 0 && newIndex < modalImages.length) {
      modalIndex = newIndex;
      showModalImage();
    }
  }

  function initPhotoModal() {
    const closeBtn = $('#modalClose');
    if (closeBtn) closeBtn.addEventListener('click', (e) => closePhotoModal(e));

    const prevBtn = $('#modalPrev');
    if (prevBtn) prevBtn.addEventListener('click', () => modalNavigate(-1));

    const nextBtn = $('#modalNext');
    if (nextBtn) nextBtn.addEventListener('click', () => modalNavigate(1));

    const modal = $('#photoModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.id === 'modalContainer') {
          closePhotoModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (!modal || !modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closePhotoModal();
      if (e.key === 'ArrowLeft') modalNavigate(-1);
      if (e.key === 'ArrowRight') modalNavigate(1);
    });

    const container = $('#modalContainer');
    if (container) {
      container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
      }, { passive: true });
    }
  }

  function handleSwipe() {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const minSwipe = 50;

    if (Math.abs(diffX) < minSwipe || Math.abs(diffX) < Math.abs(diffY)) return;

    if (diffX > 0) {
      modalNavigate(1);
    } else {
      modalNavigate(-1);
    }
  }

  /* ═══════════════════════════════════════════
     Location Section
     ═══════════════════════════════════════════ */

  function initLocation() {
    const w = CONFIG.wedding;
    const ml = CONFIG.mapLinks;

    if ($('#locationHall')) $('#locationHall').textContent = w.hall;
    if ($('#locationAddress')) $('#locationAddress').textContent = w.address;
    if ($('#locationTel')) $('#locationTel').textContent = w.tel ? `Tel. ${w.tel}` : '';
    if ($('#locationMapImg')) $('#locationMapImg').src = 'images/location/1.jpg';
    if ($('#kakaoMapBtn')) $('#kakaoMapBtn').href = ml.kakao || '#';
    if ($('#naverMapBtn')) $('#naverMapBtn').href = ml.naver || '#';

    const copyBtn = $('#copyAddressBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        copyToClipboard(w.address, '주소가 복사되었습니다');
      });
    }
  }

  /* ═══════════════════════════════════════════
     Account Section
     ═══════════════════════════════════════════ */

  function renderAccounts(accounts, containerId) {
    const container = $(`#${containerId}`);
    if (!container || !accounts) return;

    accounts.forEach((acc) => {
      const item = document.createElement('div');
      item.className = 'account-item';
      item.innerHTML = `
        <div class="account-item__info">
          <div class="account-item__role">${acc.role}</div>
          <div class="account-item__detail">
            <span class="account-item__name">${acc.name || ''}</span>
            ${acc.bank} ${acc.number}
          </div>
        </div>
        <button class="account-item__copy" data-account="${acc.bank} ${acc.number} ${acc.name || ''}">
          복사
        </button>
      `;
      container.appendChild(item);
    });
  }

  function initAccordion(triggerId, panelId) {
    const trigger = $(`#${triggerId}`);
    const panel = $(`#${panelId}`);

    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !expanded);

      if (!expanded) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = '0';
      }
    });
  }

  function initAccounts() {
    // father/mother 계좌 설정이 있으면 우선 사용하고, 없으면 기존 groom/bride fallback
    const fatherAccs = CONFIG.accounts.father || CONFIG.accounts.groom;
    const motherAccs = CONFIG.accounts.mother || CONFIG.accounts.bride;

    renderAccounts(fatherAccs, 'groomAccountList');
    renderAccounts(motherAccs, 'brideAccountList');

    initAccordion('groomAccordion', 'groomAccordionPanel');
    initAccordion('brideAccordion', 'brideAccordionPanel');

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.account-item__copy');
      if (!btn) return;
      const text = btn.dataset.account;
      copyToClipboard(text, '계좌번호가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Footer
     ═══════════════════════════════════════════ */

  function initFooter() {
    const dt = getEventDateTime();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const footerText = $('#footerText');
    if (footerText) {
      footerText.textContent = `${CONFIG.baby.name}'s 1st Birthday — ${year}.${month}.${day}`;
    }
  }

  /* ═══════════════════════════════════════════
     Loading Placeholders
     ═══════════════════════════════════════════ */

  function showLoadingPlaceholders() {
    const galleryGrid = $('#galleryGrid');

    const placeholderHTML = '<div class="loading-placeholder"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>';

    if (galleryGrid) galleryGrid.innerHTML = placeholderHTML;
  }

  /* ═══════════════════════════════════════════
     Scroll Animations
     ═══════════════════════════════════════════ */

  function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -40px 0px'
        }
    );

    $$('.animate-item').forEach((el) => observer.observe(el));

    const mutObs = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains('animate-item')) {
            observer.observe(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('.animate-item').forEach((el) => observer.observe(el));
          }
        });
      });
    });

    mutObs.observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════
     Init
     ═══════════════════════════════════════════ */

  async function init() {
    setMetaTags();
    initCurtain();
    initHero();
    initCountdown();
    initGreeting();
    initCalendar();

    showLoadingPlaceholders();

    initPhotoModal();
    initLocation();
    initAccounts();
    initFooter();
    initScrollAnimations();

    const galleryImages = await loadImagesFromFolder('gallery');
    initGallery(galleryImages);

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
