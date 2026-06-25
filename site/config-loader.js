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

  // Index-specific
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
