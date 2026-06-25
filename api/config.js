import { put, list } from '@vercel/blob';

const CONFIG_KEY = 'rsl-config.json';
const PASSWORD = process.env.ADMIN_PASSWORD || 'rsl2024admin';

const DEFAULT_CONFIG = {
  whatsapp: {
    number: '5516997566254',
    messages: {
      nav: 'Olá, quero saber mais sobre as aulas!',
      experimental: 'Olá, quero fazer uma aula experimental na RSL Academy!',
      grupo: 'Olá, quero entrar em uma turma da RSL Academy!',
      frances: 'Olá, quero começar a aprender francês na RSL Academy!',
      italiano: 'Olá, quero começar a aprender italiano na RSL Academy!'
    }
  },
  plans: {
    grupo: {
      tag: 'Grupos · Inglês',
      name: 'Aulas em grupo',
      description: 'Aprenda em turma ativa, interagindo com outros alunos em situações reais. Disponível em 3 horários por dia, de segunda a quinta-feira.',
      frequency: '4× por semana · Indicado para quem quer aprender em grupo',
      price: '417',
      material: '187',
      ctaLabel: 'Quero entrar em uma turma'
    }
  },
  index: {
    heroTitle: 'Conheça os planos na RSL Academy',
    heroSubtitle: 'Escolha o idioma e a gente te conta sobre as turmas, os horários e como começar.',
    ctaTitle: 'Pronto para começar?',
    ctaSubtitle: 'Fale com a gente e descubra qual plano é ideal para você.',
    stats: [
      { value: '+200', label: 'Alunos formados' },
      { value: '4×', label: 'Por semana' },
      { value: '3', label: 'Horários por dia' },
      { value: '3', label: 'Idiomas' }
    ]
  },
  ingles: {
    heroTitle: 'Três horários por dia, de segunda à quinta. Você escolhe o que melhor encaixa na sua rotina.',
    heroSubtitle: 'O plano Dynamic Immersive oferece aulas ao vivo em três horários por dia. Você pode adaptar sua participação conforme a disponibilidade de cada dia.',
    ctaTitle: 'Pronto para decolar?',
    ctaSubtitle: 'Fale com a gente e comece sua primeira aula ainda essa semana.',
    vips: [
      { name: '2× por semana', freq: '8 aulas/mês', price: '577', material: '187', ctaLabel: 'Quero esse plano' },
      { name: '3× por semana', freq: '12 aulas/mês', price: '837', material: '187', ctaLabel: 'Quero esse plano' },
      { name: '4× por semana', freq: '16 aulas/mês', price: '1.137', material: '187', ctaLabel: 'Quero esse plano' },
      { name: '5× por semana', freq: '20 aulas/mês', price: '1.437', material: '187', ctaLabel: 'Quero esse plano' }
    ]
  },
  frances: {
    heroTitle: 'Aprenda francês de verdade',
    heroSubtitle: 'Aulas individuais ao vivo com professor dedicado. Você aprende no seu ritmo, com atenção exclusiva e temas que fazem sentido pra você.',
    ctaTitle: 'Pronto pra começar em francês?',
    ctaSubtitle: 'Fala com a gente pelo WhatsApp. A gente te conta sobre horários, professores e como começar.',
    vips: [
      { name: '2× por semana', freq: '8 aulas/mês', price: '657', material: '187', ctaLabel: 'Quero esse plano' },
      { name: '3× por semana', freq: '12 aulas/mês', price: '897', material: '187', ctaLabel: 'Quero esse plano' },
      { name: '4× por semana', freq: '16 aulas/mês', price: '1.157', material: '187', ctaLabel: 'Quero esse plano' },
      { name: '5× por semana', freq: '20 aulas/mês', price: '1.437', material: '187', ctaLabel: 'Quero esse plano' }
    ]
  },
  italiano: {
    heroTitle: 'Aprenda italiano de verdade',
    heroSubtitle: 'Aulas individuais ao vivo com professor dedicado. Arte, cultura e conversação real desde a primeira aula.',
    ctaTitle: 'Pronto pra começar em italiano?',
    ctaSubtitle: 'Fala com a gente pelo WhatsApp. A gente te conta sobre horários, professores e como começar.',
    vips: [
      { name: '2× por semana', freq: '8 aulas/mês', price: '657', material: '187', ctaLabel: 'Quero esse plano' },
      { name: '3× por semana', freq: '12 aulas/mês', price: '897', material: '187', ctaLabel: 'Quero esse plano' },
      { name: '4× por semana', freq: '16 aulas/mês', price: '1.157', material: '187', ctaLabel: 'Quero esse plano' },
      { name: '5× por semana', freq: '20 aulas/mês', price: '1.437', material: '187', ctaLabel: 'Quero esse plano' }
    ]
  },
  testimonials: []
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: CONFIG_KEY });
      if (!blobs.length) return res.status(200).json(DEFAULT_CONFIG);
      const response = await fetch(blobs[0].url);
      const saved = await response.json();
      const merged = deepMerge(DEFAULT_CONFIG, saved);
      return res.status(200).json(merged);
    } catch {
      return res.status(200).json(DEFAULT_CONFIG);
    }
  }

  if (req.method === 'POST') {
    const { password, ...config } = req.body;
    if (password !== PASSWORD) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    try {
      await put(CONFIG_KEY, JSON.stringify(config), {
        access: 'public',
        allowOverwrite: true,
        addRandomSuffix: false
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
