/**
 * ================================================================
 * SINDROME GAMES — Auth System (Front-end Simulation)
 * ================================================================
 *
 * ARQUITETURA:
 *   - localStorage como "banco de dados" local para simulação.
 *   - Chave "sg_users" → Array JSON com os usuários cadastrados.
 *   - Chave "sg_session" → Objeto do usuário logado (sem senha).
 *   - Formulários são renderizados dinamicamente via JS a partir
 *     de schemas declarativos, evitando duplicação de HTML.
 *
 * FLUXO:
 *   1. checkSession() → sessão ativa? → welcomeSequence → redirect
 *   2. Se não → renderiza formulário de Login
 *   3. switchMode() → troca form com animação de slide
 *   4. submit → valida → localStorage → overlay → redirect
 *
 * PALETA: Monocromático estrito (#000 → #fff), zero cores vibrantes.
 * ================================================================
 */

'use strict';

// ================================================================
// SVG ICONS — Templates reutilizáveis (strings)
// ================================================================
const ICONS = {
  mail:     `<svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 7 10-7"/></svg>`,
  lock:     `<svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="3"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  user:     `<svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  shield:   `<svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  eyeOn:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  okCircle: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg>`,
  xCircle:  `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
};


// ================================================================
// FORM SCHEMAS — Definem campos de cada modo (login / register)
// Um único schema controla tudo que o JS renderiza.
// ================================================================
const SCHEMAS = {
  login: {
    fields: [
      { id: 'loginEmail',    type: 'email',    label: 'E-mail', icon: 'mail', auto: 'email' },
      { id: 'loginPassword', type: 'password', label: 'Senha',  icon: 'lock', auto: 'current-password', toggle: true },
    ],
    options: true,       // "Lembrar de mim" + "Esqueceu a senha?"
    btnId:   'btnLogin',
    btnText: 'Entrar',
  },
  register: {
    fields: [
      { id: 'regName',     type: 'text',     label: 'Nome de usuário', icon: 'user',   auto: 'name' },
      { id: 'regEmail',    type: 'email',    label: 'E-mail',          icon: 'mail',   auto: 'email' },
      { id: 'regPassword', type: 'password', label: 'Senha',           icon: 'lock',   auto: 'new-password', toggle: true, strength: true },
      { id: 'regConfirm',  type: 'password', label: 'Confirmar senha', icon: 'shield', auto: 'new-password', toggle: true },
    ],
    options: false,
    btnId:   'btnRegister',
    btnText: 'Criar Conta',
  },
};


// ================================================================
// DATABASE — Simulação de persistência com localStorage
// ================================================================
const DB = {
  /** Chaves do localStorage */
  UK: 'sg_users',
  SK: 'sg_session',

  /** Retorna array de usuários cadastrados */
  users() {
    try { return JSON.parse(localStorage.getItem(this.UK)) || []; }
    catch { return []; }
  },

  /** Salva lista de usuários */
  save(list) {
    localStorage.setItem(this.UK, JSON.stringify(list));
  },

  /** Busca usuário por e-mail (case-insensitive) */
  find(email) {
    return this.users().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  /**
   * Registra novo usuário.
   * Verifica duplicidade de e-mail antes de inserir.
   * ⚠️ Senha armazenada em texto claro — APENAS para demonstração.
   */
  register(name, email, pw) {
    if (this.find(email)) {
      return { ok: false, msg: 'Este e-mail já está cadastrado.' };
    }

    const list = this.users();
    const user = {
      id:        crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
      name:      name.trim(),
      email:     email.toLowerCase().trim(),
      password:  pw,
      createdAt: new Date().toISOString(),
    };

    list.push(user);
    this.save(list);
    return { ok: true, msg: 'Conta criada!', user };
  },

  /**
   * Valida credenciais contra o localStorage.
   * Retorna sucesso + dados do usuário, ou mensagem de erro.
   */
  login(email, pw) {
    const user = this.find(email);
    if (!user) return { ok: false, msg: 'Nenhuma conta encontrada com este e-mail.' };
    if (user.password !== pw) return { ok: false, msg: 'Senha incorreta. Tente novamente.' };
    return { ok: true, msg: 'Login realizado!', user };
  },

  /** Cria sessão persistente (dados sem senha) */
  createSession(user) {
    localStorage.setItem(this.SK, JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      isLoggedIn: true,
      loginAt: new Date().toISOString(),
    }));
  },

  /** Checa se existe sessão ativa */
  session() {
    try {
      const s = JSON.parse(localStorage.getItem(this.SK));
      return s && s.isLoggedIn ? s : null;
    } catch { return null; }
  },

  /** Encerra sessão */
  clearSession() {
    localStorage.removeItem(this.SK);
  },
};


// ================================================================
// VALIDATORS — Validação de campos
// ================================================================
const V = {
  email(v) {
    if (!v.trim()) return 'O e-mail é obrigatório.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Insira um e-mail válido.';
  },

  password(v) {
    if (!v) return 'A senha é obrigatória.';
    return v.length < 6 ? 'Mínimo de 6 caracteres.' : '';
  },

  name(v) {
    if (!v.trim()) return 'O nome é obrigatório.';
    return v.trim().length < 2 ? 'Mínimo de 2 caracteres.' : '';
  },

  confirm(v, original) {
    if (!v) return 'Confirme sua senha.';
    return v !== original ? 'As senhas não coincidem.' : '';
  },

  /**
   * Calcula força da senha (0–4).
   * Escala monocromática no medidor: cinza escuro → branco.
   */
  strength(p) {
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  },
};


// ================================================================
// UI ENGINE — Renderização dinâmica & animações
// ================================================================
const UI = {
  mode: 'login',
  switching: false,

  /** Shortcut para getElementById */
  $(id) { return document.getElementById(id); },

  /**
   * Renderiza o formulário inteiro baseado no schema do modo ativo.
   * Um único <form> no HTML — campos são gerados via DOM API.
   */
  renderForm(mode) {
    const schema = SCHEMAS[mode];
    const form   = this.$('formArea');
    form.innerHTML = '';

    // ── Gera cada campo ──
    schema.fields.forEach((f, i) => {
      const group = document.createElement('div');
      group.className = 'field';
      group.dataset.idx = i;

      let html = '';
      html += `<input type="${f.type}" class="input" id="${f.id}" name="${f.id}" placeholder=" " autocomplete="${f.auto}" required>`;
      html += `<label class="float-label" for="${f.id}">${f.label}</label>`;
      html += ICONS[f.icon];

      if (f.toggle) {
        html += `<button type="button" class="pw-toggle" data-target="${f.id}" aria-label="Mostrar senha">${ICONS.eyeOn}</button>`;
      }

      html += `<span class="field-err" id="${f.id}Err" role="alert"></span>`;
      group.innerHTML = html;
      form.appendChild(group);

      // Medidor de força da senha (apenas no campo marcado)
      if (f.strength) {
        const meter = document.createElement('div');
        meter.className = 'pw-str';
        meter.id = 'pwStr';
        meter.dataset.idx = i;
        meter.innerHTML = `
          <div class="str-bars">
            <div class="str-bar" id="sb1"></div>
            <div class="str-bar" id="sb2"></div>
            <div class="str-bar" id="sb3"></div>
            <div class="str-bar" id="sb4"></div>
          </div>
          <span class="str-text" id="strText">Força da senha</span>`;
        form.appendChild(meter);
      }
    });

    // ── Opções (login only) ──
    if (schema.options) {
      const opts = document.createElement('div');
      opts.className = 'options';
      opts.dataset.idx = schema.fields.length;
      opts.innerHTML = `
        <label class="chk-group">
          <input type="checkbox" class="chk" id="remember">
          <span class="chk-label">Lembrar de mim</span>
        </label>
        <a href="#" class="link" id="forgotLink">Esqueceu a senha?</a>`;
      form.appendChild(opts);
    }

    // ── Botão CTA ──
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = 'cta';
    btn.id = schema.btnId;
    btn.dataset.idx = schema.fields.length + (schema.options ? 1 : 0);
    btn.innerHTML = `<span class="btn-text">${schema.btnText}</span><span class="btn-spin"></span>`;
    form.appendChild(btn);

    // Bind de eventos internos
    this.bindFieldEvents(mode);
  },

  /**
   * Vincula eventos aos campos recém-renderizados:
   * - Password toggle (mostrar/ocultar)
   * - Strength meter (atualização em tempo real)
   * - Limpar erros ao digitar
   * - Link "Esqueceu a senha?"
   */
  bindFieldEvents(mode) {
    const form = this.$('formArea');

    // Password toggle
    form.querySelectorAll('.pw-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const inp = this.$(btn.dataset.target);
        const show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        btn.innerHTML = show ? ICONS.eyeOff : ICONS.eyeOn;
      });
    });

    // Limpar erro ao digitar
    form.querySelectorAll('.input').forEach(inp => {
      inp.addEventListener('input', () => this.clearErr(inp.id));
    });

    // Strength meter (apenas no registro)
    if (mode === 'register') {
      const pwInput = this.$('regPassword');
      if (pwInput) {
        pwInput.addEventListener('input', () => {
          this.updateStrength(V.strength(pwInput.value));
        });
      }
    }

    // Forgot link
    const forgot = this.$('forgotLink');
    if (forgot) {
      forgot.addEventListener('click', (e) => {
        e.preventDefault();
        toast('Em breve!', 'ok');
      });
    }
  },

  /**
   * Stagger animation — revela campos um a um com delay progressivo.
   */
  staggerIn() {
    const els = this.$('formArea').querySelectorAll('[data-idx]');
    els.forEach(el => {
      const i = parseInt(el.dataset.idx, 10);
      setTimeout(() => el.classList.add('--in'), 150 + i * 80);
    });
  },

  /**
   * Troca de modo (login ↔ register) com animação de slide.
   * 1. Anima saída do form atual
   * 2. Re-renderiza com novo schema
   * 3. Anima entrada do novo form
   */
  switchMode(to) {
    if (this.mode === to || this.switching) return;
    this.switching = true;

    const form    = this.$('formArea');
    const goRight = to === 'register';

    // Atualiza tabs
    this.$('tabLogin').classList.toggle('--on', !goRight);
    this.$('tabRegister').classList.toggle('--on', goRight);
    this.$('tabLogin').setAttribute('aria-selected', String(!goRight));
    this.$('tabRegister').setAttribute('aria-selected', String(goRight));
    this.$('pill').classList.toggle('--right', goRight);

    // Anima saída
    form.classList.add(goRight ? '--exit-left' : '--exit-right');

    setTimeout(() => {
      // Limpa animação de saída, renderiza novo form
      form.classList.remove('--exit-left', '--exit-right');
      this.mode = to;
      this.renderForm(to);

      // Anima entrada
      form.classList.add(goRight ? '--enter-right' : '--enter-left');
      this.staggerIn();

      setTimeout(() => {
        form.classList.remove('--enter-right', '--enter-left');
        this.switching = false;
      }, 450);
    }, 350);
  },

  /** Exibe erro inline em um campo */
  showErr(id, msg) {
    const grp = this.$(id)?.closest('.field');
    const err = this.$(id + 'Err');
    if (grp) grp.classList.add('--err');
    if (err) { err.textContent = msg; err.classList.add('--on'); }
  },

  /** Limpa erro de um campo */
  clearErr(id) {
    const grp = this.$(id)?.closest('.field');
    const err = this.$(id + 'Err');
    if (grp) grp.classList.remove('--err');
    if (err) { err.textContent = ''; err.classList.remove('--on'); }
  },

  /** Limpa todos os erros */
  clearAll() {
    document.querySelectorAll('.field.--err').forEach(g => g.classList.remove('--err'));
    document.querySelectorAll('.field-err.--on').forEach(e => { e.classList.remove('--on'); e.textContent = ''; });
  },

  /** Toggle de loading no botão CTA */
  btnLoad(id, on) {
    const b = this.$(id);
    if (b) { b.classList.toggle('--load', on); b.disabled = on; }
  },

  /**
   * Atualiza barras do medidor de senha.
   * Escala monocromática: #555 → #888 → #bbb → #fff
   */
  updateStrength(score) {
    const colors = ['#555', '#888', '#bbb', '#fff'];
    const labels = ['Muito fraca', 'Fraca', 'Boa', 'Forte'];
    const bars   = [this.$('sb1'), this.$('sb2'), this.$('sb3'), this.$('sb4')];
    const text   = this.$('strText');

    if (!bars[0] || !text) return;

    bars.forEach((b, i) => {
      b.style.background = i < score ? colors[Math.min(score - 1, 3)] : '';
    });
    text.textContent = score > 0 ? labels[Math.min(score - 1, 3)] : 'Força da senha';
    text.style.color = score > 0 ? colors[Math.min(score - 1, 3)] : '';
  },

  /**
   * Overlay de boas-vindas com barra de progresso animada.
   * Duração: 2.5s com easing quadrático → resolve Promise.
   */
  welcome(name) {
    return new Promise(resolve => {
      this.$('wcName').textContent = name;
      const ov = this.$('overlay');
      ov.setAttribute('aria-hidden', 'false');
      ov.classList.add('--on');

      const dur  = 2500;
      const t0   = performance.now();
      const fill = this.$('progFill');
      const pct  = this.$('progPct');

      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - (1 - p) ** 2; // ease-out quadrático
        const v = Math.round(e * 100);
        fill.style.width = v + '%';
        pct.textContent  = v + '%';
        p < 1 ? requestAnimationFrame(tick) : setTimeout(resolve, 300);
      };

      requestAnimationFrame(tick);
    });
  },

  /**
   * Gera partículas flutuantes (brancas/cinza) no fundo.
   * Quantidade adaptada: 14 mobile / 28 desktop.
   */
  particles() {
    const bg = this.$('bgLayer');
    const n  = window.innerWidth < 768 ? 14 : 28;

    for (let i = 0; i < n; i++) {
      const d = document.createElement('div');
      d.className = 'particle';
      d.style.left              = `${Math.random() * 100}%`;
      d.style.animationDuration = `${8 + Math.random() * 12}s`;
      d.style.animationDelay    = `${Math.random() * 10}s`;
      const s = `${1 + Math.random() * 2}px`;
      d.style.width  = s;
      d.style.height = s;
      bg.appendChild(d);
    }
  },

  /**
   * Intro stagger — card → header → campos (via staggerIn).
   */
  playIntro() {
    setTimeout(() => this.$('card').classList.add('--in'),    200);
    setTimeout(() => this.$('header').classList.add('--in'),  500);
    setTimeout(() => this.staggerIn(),                        700);
  },
};


// ================================================================
// TOAST NOTIFICATIONS
// ================================================================
function toast(msg, type = 'ok') {
  const container = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = (type === 'ok' ? ICONS.okCircle : ICONS.xCircle) + `<span>${msg}</span>`;
  container.appendChild(el);

  // Trigger reflow para animação
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('--on')));

  // Auto-remove após 3.5s
  setTimeout(() => {
    el.classList.remove('--on');
    setTimeout(() => el.remove(), 400);
  }, 3500);
}


// ================================================================
// UTILITÁRIO — Delay baseado em Promise
// ================================================================
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}


// ================================================================
// APP CONTROLLER — Orquestrador principal
// ================================================================
const App = {
  init() {
    // Gera partículas de fundo
    UI.particles();

    // 1. Sessão ativa? → Overlay de boas-vindas → Redirect
    const session = DB.session();
    if (session) {
      UI.welcome(session.name).then(() => {
        window.location.href = 'https://www.youtube.com/@SindromeGames';
      });
      return;
    }

    // 2. Sem sessão → Renderiza login e inicia animações
    UI.renderForm('login');
    UI.playIntro();
    this.bind();
  },

  /** Vincula eventos globais (tabs + submit) */
  bind() {
    // Tab switching
    UI.$('tabLogin').addEventListener('click', () => UI.switchMode('login'));
    UI.$('tabRegister').addEventListener('click', () => UI.switchMode('register'));

    // Form submit (delegado — funciona após re-render dinâmico)
    UI.$('formArea').addEventListener('submit', (e) => {
      e.preventDefault();
      UI.mode === 'login' ? this.doLogin() : this.doRegister();
    });
  },

  /**
   * Fluxo de LOGIN:
   * 1. Valida campos
   * 2. Simula loading (1.2s)
   * 3. Consulta localStorage
   * 4. Sucesso → cria sessão → overlay → redirect
   */
  async doLogin() {
    UI.clearAll();
    const email = UI.$('loginEmail').value;
    const pw    = UI.$('loginPassword').value;
    let hasErr  = false;

    const eErr = V.email(email);
    if (eErr) { UI.showErr('loginEmail', eErr); hasErr = true; }

    const pErr = V.password(pw);
    if (pErr) { UI.showErr('loginPassword', pErr); hasErr = true; }

    if (hasErr) return;

    UI.btnLoad('btnLogin', true);
    await sleep(1200);

    const res = DB.login(email, pw);
    if (!res.ok) {
      UI.btnLoad('btnLogin', false);
      toast(res.msg, 'err');
      res.msg.includes('e-mail')
        ? UI.showErr('loginEmail', res.msg)
        : UI.showErr('loginPassword', res.msg);
      return;
    }

    DB.createSession(res.user);
    UI.btnLoad('btnLogin', false);
    toast('Login realizado com sucesso!', 'ok');
    await sleep(600);
    await UI.welcome(res.user.name);
    window.location.href = 'https://www.youtube.com/@SindromeGames';
  },

  /**
   * Fluxo de REGISTRO:
   * 1. Valida todos os campos
   * 2. Simula loading (1.5s)
   * 3. Salva no localStorage
   * 4. Auto-login → overlay → redirect
   */
  async doRegister() {
    UI.clearAll();
    const name  = UI.$('regName').value;
    const email = UI.$('regEmail').value;
    const pw    = UI.$('regPassword').value;
    const conf  = UI.$('regConfirm').value;
    let hasErr  = false;

    const nErr = V.name(name);
    if (nErr) { UI.showErr('regName', nErr); hasErr = true; }

    const eErr = V.email(email);
    if (eErr) { UI.showErr('regEmail', eErr); hasErr = true; }

    const pErr = V.password(pw);
    if (pErr) { UI.showErr('regPassword', pErr); hasErr = true; }

    const cErr = V.confirm(conf, pw);
    if (cErr) { UI.showErr('regConfirm', cErr); hasErr = true; }

    if (hasErr) return;

    UI.btnLoad('btnRegister', true);
    await sleep(1500);

    const res = DB.register(name, email, pw);
    if (!res.ok) {
      UI.btnLoad('btnRegister', false);
      toast(res.msg, 'err');
      UI.showErr('regEmail', res.msg);
      return;
    }

    DB.createSession(res.user);
    UI.btnLoad('btnRegister', false);
    toast('Conta criada com sucesso!', 'ok');
    await sleep(600);
    await UI.welcome(res.user.name);
    window.location.href = 'https://www.youtube.com/@SindromeGames';
  },
};


// ================================================================
// BOOT — Inicializa quando o DOM estiver pronto
// ================================================================
document.addEventListener('DOMContentLoaded', () => App.init());
