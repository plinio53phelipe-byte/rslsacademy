(async () => {
  let cfg;
  try {
    const res = await fetch('/api/config');
    cfg = await res.json();
  } catch { return; }

  const page = document.documentElement.dataset.page;

  function set(sel, val) {
    if (!val) return;
    document.querySelectorAll(sel).forEach(el => { el.innerHTML = val; });
  }

  // WhatsApp links
  const wa = cfg.whatsapp;
  if (wa?.number) {
    const base = 'https://wa.me/' + wa.number + '?text=';
    document.querySelectorAll('[data-wa]').forEach(el => {
      const key = el.dataset.wa;
      const msg = wa.messages?.[key];
      if (msg) el.href = base + encodeURIComponent(msg);
    });
  }

  // Plans — grupo
  const g = cfg.plans?.grupo;
  if (g) {
    set('[data-plan-grupo-tag]', g.tag);
    set('[data-plan-grupo-name]', g.name);
    set('[data-plan-grupo-desc]', g.description);
    set('[data-plan-grupo-freq]', g.frequency);
    set('[data-plan-grupo-cta]', g.ctaLabel);
    if (g.price) set('[data-plan-grupo-price]', 'R$' + g.price);
    if (g.material) set('[data-plan-grupo-material]', '+ R$' + g.material + ' taxa única de material didático');
  }

  // Per-page texts
  const pageData = cfg[page];
  if (pageData) {
    set('[data-hero-title]', pageData.heroTitle);
    set('[data-hero-subtitle]', pageData.heroSubtitle);
    set('[data-cta-title]', pageData.ctaTitle);
    set('[data-cta-subtitle]', pageData.ctaSubtitle);

    // VIP plans per page (ingles/frances/italiano sub-pages)
    if (pageData.vips?.length) {
      pageData.vips.forEach((vip, i) => {
        set(`[data-vip-name="${i}"]`, vip.name);
        set(`[data-vip-freq="${i}"]`, vip.freq);
        if (vip.price) set(`[data-vip-price="${i}"]`, 'R$' + vip.price + '/mês');
        if (vip.material) set(`[data-vip-material="${i}"]`, '+ R$' + vip.material + ' taxa única de material');
        set(`[data-vip-cta="${i}"]`, vip.ctaLabel);
      });
    }
  }

  // Index-specific sections
  if (page === 'index') {
    const idx = cfg.index || {};

    // Pain section
    if (idx.pain) {
      set('[data-pain-title]', idx.pain.title);
      set('[data-pain-desc]', idx.pain.desc);
      (idx.pain.cards || []).forEach((card, i) => {
        set(`[data-pain-card-title="${i}"]`, card.title);
        set(`[data-pain-card-desc="${i}"]`, card.desc);
      });
    }

    // Method section
    if (idx.method) {
      set('[data-method-desc]', idx.method.desc);
      (idx.method.cards || []).forEach((card, i) => {
        set(`[data-method-card-title="${i}"]`, card.title);
        set(`[data-method-card-desc="${i}"]`, card.desc);
      });
    }

    // Schedule section
    if (idx.schedule) {
      set('[data-schedule-title]', idx.schedule.title);
      set('[data-schedule-desc]', idx.schedule.desc);
      (idx.schedule.slots || []).forEach((slot, i) => {
        set(`[data-schedule-time="${i}"]`, slot.time);
        set(`[data-schedule-label="${i}"]`, slot.label);
      });
    }

    // Testimonials header
    set('[data-testimonials-title]', idx.testimonialsTitle);
    set('[data-testimonials-desc]', idx.testimonialsDesc);
  }

  if (page === 'index' && cfg.index?.stats) {
    cfg.index.stats.forEach((s, i) => {
      if (s.value) {
        document.querySelectorAll(`[data-stat-value="${i}"]`).forEach(el => {
          el.innerHTML = s.value;
          el.removeAttribute('data-count');
        });
      }
      set(`[data-stat-label="${i}"]`, s.label);
    });

    // VIP prices per language panel on index
    const map = { ingles: 'en', frances: 'fr', italiano: 'it' };
    Object.entries(map).forEach(([lang, abbr]) => {
      (cfg[lang]?.vips || []).forEach((vip, i) => {
        if (vip.price) set(`[data-vip-${abbr}-price="${i}"]`, 'R$' + vip.price);
      });
    });
  }

  // Testimonials carousel replacement
  if (cfg.testimonials?.length) {
    const track = document.getElementById('tcardTrack');
    if (track) {
      track.innerHTML = cfg.testimonials.map(url =>
        `<div class="testimonial-card"><img src="${url}" alt="Depoimento de aluno" class="testimonial-img" loading="lazy"></div>`
      ).join('');
      if (typeof initCarousel === 'function') initCarousel();
    }
  }
})();
