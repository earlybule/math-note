/* dsh-tex.js — a small self-contained LaTeX-subset renderer (no external fonts).
 * Supports the subset needed for textbook proofs: greek, operators, fractions,
 * roots, sub/superscripts, big operators with limits, matrices/cases, accents,
 * \left\right delimiters, \text, spacing. */
(function (global) {
  'use strict';

  var SYM = {
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε',
    zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ',
    lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ',
    tau: 'τ', upsilon: 'υ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
    Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π',
    Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
    times: '×', div: '÷', cdot: '·', pm: '±', mp: '∓', ast: '∗',
    le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', equiv: '≡',
    approx: '≈', sim: '∼', cong: '≅', simeq: '≃', propto: '∝',
    in: '∈', notin: '∉', ni: '∋', subset: '⊂', subseteq: '⊆', supset: '⊃',
    supseteq: '⊇', cup: '∪', cap: '∩', setminus: '∖', emptyset: '∅', varnothing: '∅',
    forall: '∀', exists: '∃', nexists: '∄', neg: '¬', land: '∧', lor: '∨',
    to: '→', rightarrow: '→', longrightarrow: '⟶', leftarrow: '←', gets: '←',
    leftrightarrow: '↔', Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔',
    Longrightarrow: '⟹', Longleftarrow: '⟸', Longleftrightarrow: '⟺',
    uparrow: '↑', downarrow: '↓', Uparrow: '⇑', Downarrow: '⇓',
    implies: '⟹', iff: '⟺', mapsto: '↦', longmapsto: '⟼',
    infty: '∞', partial: '∂', nabla: '∇', prime: '′', circ: '∘', bullet: '•',
    cdots: '⋯', ldots: '…', dots: '…', vdots: '⋮', ddots: '⋱', dotsb: '⋯',
    angle: '∠', perp: '⊥', parallel: '∥', therefore: '∴', because: '∵',
    oplus: '⊕', ominus: '⊖', otimes: '⊗', oslash: '⊘', odot: '⊙',
    square: '□', Box: '□', blacksquare: '■', triangle: '△', bigtriangleup: '△',
    diamond: '⋄', star: '⋆', checkmark: '✓', qed: '□',
    mid: '∣', nmid: '∤', divides: '∣', setminus2: '∖',
    lbrace: '{', rbrace: '}', lbrack: '[', rbrack: ']',
    S: '§', P: '¶',
    '|': '‖',                          // \| is the double-bar norm delimiter
    Vert: '‖', vert: '|', backslash: '∖',
    sharp: '♯', flat: '♭', natural: '♮',
    colon: ' : ',   // backslash-colon: punctuation colon with thin spaces
    ldots2: '…', dotsi: '⋯', dotsm: '⋯', dotso: '…',
    lhd: '⊲', rhd: '⊳', unlhd: '⊴', unrhd: '⊵',
    triangleq: '≜', coloneqq: '≔', eqqcolon: '≕',
    lVert2: '‖', rVert2: '‖',
    langle: '⟨', rangle: '⟩', lceil: '⌈', rceil: '⌉', lfloor: '⌊', rfloor: '⌋',
    lVert: '‖', rVert: '‖', lvert: '|', rvert: '|', lVert2: '‖', rVert2: '‖',
    hbar: 'ℏ', ell: 'ℓ', Re: 'ℜ', Im: 'ℑ', aleph: 'ℵ', wp: '℘',
    quad: '\u2003', qquad: '\u2003\u2003', ',': '\u2009', ';': '\u2005',
    '!': '', ' ': ' ', '\\': '\n', '{': '{', '}': '}', '%': '%', '&': '&', '#': '#',
    _: '_', '$': '$'
  };

  // large operators: display limits go above/below
  var BIGOP = {
    sum: '∑', prod: '∏', coprod: '∐', int: '∫', iint: '∬', iiint: '∭', iiiint: '⨌',
    oint: '∮', oiint: '∯', oiiint: '∰',
    bigcup: '⋃', bigcap: '⋂', bigoplus: '⊕', bigotimes: '⊗', bigvee: '⋁', bigwedge: '⋀'
  };
  var NAMED_OP = ['lim', 'limsup', 'liminf', 'max', 'min', 'sup', 'inf', 'det', 'dim',
    'ker', 'im', 'rank', 'tr', 'deg', 'gcd', 'lcm', 'exp', 'ln', 'log', 'sin', 'cos',
    'tan', 'cot', 'sec', 'csc', 'arcsin', 'arccos', 'arctan', 'sinh', 'cosh', 'tanh',
    'sgn', 'diag', 'span', 'Hom', 'End', 'tr'];
  var FUNC = { sin: 1, cos: 1, tan: 1, cot: 1, sec: 1, csc: 1, arcsin: 1, arccos: 1, arctan: 1,
    sinh: 1, cosh: 1, tanh: 1, ln: 1, log: 1, exp: 1, lim: 1, limsup: 1, liminf: 1, max: 1, min: 1,
    sup: 1, inf: 1, det: 1, dim: 1, ker: 1, gcd: 1, lcm: 1, deg: 1, sgn: 1 };
  var ACCENT = {
    hat: '^', widehat: '^', tilde: '~', widetilde: '~', bar: '‾', overline: '‾',
    vec: '→', dot: '.', ddot: '..', check: 'ˇ', breve: '˘'
  };
  var DELIM = {
    '(': '(', ')': ')', '[': '[', ']': ']', '\\{': '{', '\\}': '}', '{': '{', '}': '}',
    '|': '|', '\\|': '‖', '\\lvert': '|', '\\rvert': '|', '\\lVert': '‖', '\\rVert': '‖',
    '.': '', '\\langle': '⟨', '\\rangle': '⟩', '\\lfloor': '⌊', '\\rfloor': '⌋',
    '\\lceil': '⌈', '\\rceil': '⌉'
  };
  var MATRIX_ENV = {
    matrix: { open: '', close: '', lines: false, align: 'c' },
    pmatrix: { open: '(', close: ')', lines: false, align: 'c' },
    bmatrix: { open: '[', close: ']', lines: false, align: 'c' },
    vmatrix: { open: '|', close: '|', lines: false, align: 'c' },
    Vmatrix: { open: '‖', close: '‖', lines: false, align: 'c' },
    cases: { open: '{', close: '', lines: false, align: 'l' },
    aligned: { open: '', close: '', lines: false, align: 'r' },
    array: { open: '', close: '', lines: false, align: 'c' }
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------------- tokenizer ---------------- */
  function tokenize(src) {
    var t = [], i = 0, n = src.length;
    function isLetter(c) { return /[a-zA-Z]/.test(c); }
    while (i < n) {
      var c = src[i];
      if (c === '\\') {
        var j = i + 1;
        if (j >= n) { t.push({ type: 'ord', v: '\\' }); break; }
        if (isLetter(src[j])) {
          while (j < n && isLetter(src[j])) j++;
          t.push({ type: 'cmd', v: src.slice(i + 1, j) });
          i = j;
        } else {
          t.push({ type: 'cmd', v: src[j] });
          i = j + 1;
        }
      } else if (c === '{') { t.push({ type: 'open' }); i++; }
      else if (c === '}') { t.push({ type: 'close' }); i++; }
      else if (c === '^') { t.push({ type: 'sup' }); i++; }
      else if (c === '_') { t.push({ type: 'sub' }); i++; }
      else if (c === '&') { t.push({ type: 'amp' }); i++; }
      else if (c === ' ') { i++; }
      else if (c === '~') { t.push({ type: 'ord', v: '\u00a0' }); i++; }
      else {
        // numbers stay together, single letters separate
        if (/[0-9.]/.test(c)) {
          var k = i; while (k < n && /[0-9.]/.test(src[k])) k++;
          t.push({ type: 'ord', v: src.slice(i, k) }); i = k;
        } else {
          t.push({ type: 'ord', v: c }); i++;
        }
      }
    }
    return t;
  }

  /* ---------------- parser -> HTML ---------------- */
  function Parser(tokens) { this.t = tokens; this.i = 0; }
  Parser.prototype.peek = function () { return this.t[this.i]; };
  Parser.prototype.next = function () { return this.t[this.i++]; };

  // read one "atom" argument: {..} group or a single token
  Parser.prototype.arg = function () {
    var tk = this.peek();
    if (!tk) return { html: '', tex: '' };
    if (tk.type === 'open') {
      this.i++;
      var inner = this.parseGroup('close');
      return inner;
    }
    if (tk.type === 'cmd') { this.i++; return this.command(tk.v); }
    this.i++;
    if (tk.type === 'ord') return { html: esc(tk.v), tex: tk.v };
    return { html: '', tex: '' };
  };

  Parser.prototype.parseGroup = function (stopType) {
    var out = '';
    while (this.i < this.t.length) {
      var tk = this.t[this.i];
      if (stopType && tk.type === stopType) { this.i++; break; }
      if (tk.type === 'close') { this.i++; break; }
      out += this.atom();
    }
    return { html: out, tex: '' };
  };

  Parser.prototype.scriptArg = function () {
    var tk = this.peek();
    if (!tk) return { html: '' };
    if (tk.type === 'open') { this.i++; return this.parseGroup('close'); }
    if (tk.type === 'cmd') { this.i++; return this.command(tk.v); }
    this.i++;
    if (tk.type === 'ord') return { html: esc(tk.v) };
    if (tk.type === 'sup') { this.i--; return { html: '' }; }
    return { html: '' };
  };

  Parser.prototype.atom = function () {
    var tk = this.next();
    if (tk.type === 'ord') return esc(tk.v);
    if (tk.type === 'open') { this.i--; var g = this.arg(); return g.html; }
    if (tk.type === 'cmd') return this.command(tk.v).html;
    if (tk.type === 'sup' || tk.type === 'sub') return '';
    if (tk.type === 'amp') return '';
    if (tk.type === 'close') return '';
    return '';
  };

  Parser.prototype.command = function (name) {
    // user macros could go here
    if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
      var a = this.arg(), b = this.arg();
      return { html: '<span class="tx-frac"><span class="tx-num">' + a.html +
        '</span><span class="tx-den">' + b.html + '</span></span>' };
    }
    if (name === 'binom' || name === 'dbinom') {
      var a2 = this.arg(), b2 = this.arg();
      return { html: '<span class="tx-frac tx-binom"><span class="tx-num">' + a2.html +
        '</span><span class="tx-den">' + b2.html + '</span></span>' };
    }
    if (name === 'sqrt') {
      // optional index
      var idx = null;
      if (this.peek() && this.peek().type === 'open') {
        // could be \sqrt[n]{x}
        var save = this.i;
        this.i++;
        var inner = this.parseGroup('close');
        if (this.peek() && this.peek().type === 'open') idx = inner; else this.i = save;
      }
      var body = this.arg();
      return { html: '<span class="tx-sqrt">' + (idx ? '<span class="tx-root">' + idx.html + '</span>' : '') +
        '<span class="tx-radical">√</span><span class="tx-radicand">' + body.html + '</span></span>' };
    }
    if (name === 'text' || name === 'mathrm' || name === 'textrm' || name === 'operatorname') {
      var raw = this.rawGroup();
      return { html: '<span class="tx-text">' + esc(raw) + '</span>' };
    }
    if (name === 'mathbf' || name === 'boldsymbol' || name === 'bm' || name === 'bold') {
      var a3 = this.arg();
      return { html: '<span class="tx-bf">' + a3.html + '</span>' };
    }
    if (name === 'mathbb' || name === 'mathcal' || name === 'mathfrak') {
      var a4 = this.arg();
      return { html: '<span class="tx-cal">' + a4.html + '</span>' };
    }
    if (name === 'left' || name === 'right') {
      var d = this.delimArg();
      if (name === 'right') return { html: '<span class="tx-delim">' + esc(d) + '</span>' };
      return { html: '<span class="tx-delim">' + esc(d) + '</span>' };
    }
    if (name === 'big' || name === 'Big' || name === 'bigg' || name === 'Bigg' ||
        name === 'bigl' || name === 'Bigl' || name === 'biggl' || name === 'Biggl') {
      var d2 = this.delimArg();
      return { html: '<span class="tx-delim tx-big">' + esc(d2) + '</span>' };
    }
    if (ACCENT[name]) {
      var ab = this.arg();
      return { html: '<span class="tx-accent"><span class="tx-accent-mk">' + esc(ACCENT[name]) +
        '</span>' + ab.html + '</span>' };
    }
    if (name === 'varlimsup' || name === 'varliminf') {
      // lim 上/下加一横：limsup 用上划线，liminf 用下划线
      var barInner = '<span class="tx-' + (name === 'varliminf' ? 'underline' : 'overline') +
        '">lim</span>' + (name === 'varliminf' ? ' inf' : ' sup');
      return { html: '<span class="tx-op tx-varop">' + barInner + '</span>' };
    }
    if (name === 'not') {
      // \not 后紧跟一个符号：优先用现成的「否定版」字符，否则叠加组合斜线 U+0338
      var NOTMAP = {
        '=': '≠', '∈': '∉', '∋': '∌', '⊂': '⊄', '⊃': '⊅', '⊆': '⊈', '⊇': '⊉',
        '→': '↛', '←': '↚', '↔': '↮', '⇒': '⇏', '<': '≮', '>': '≯',
        '≤': '≰', '≥': '≱', '∼': '≁', '≡': '≢', '≈': '≉', '∣': '∤', '∥': '∦'
      };
      var nt = this.peek(), tgt = '';
      if (nt && nt.type === 'cmd') { this.i++; tgt = SYM[nt.v] !== undefined ? SYM[nt.v] : ('\\' + nt.v); }
      else if (nt && nt.type === 'ord') { this.i++; tgt = nt.v || ''; }
      return { html: '<span class="tx-sym">' + esc(NOTMAP[tgt] || (tgt ? tgt + '\u0338' : '/')) + '</span>' };
    }
    if (name === 'pmod' || name === 'bmod') {
      var pm = this.arg();
      return { html: '<span class="tx-opname">(mod&nbsp;</span>' + pm.html +
        '<span class="tx-opname">)</span>' };
    }
    if (name === 'mod') {
      return { html: '<span class="tx-opname">mod</span>' };
    }
    if (name === 'overline') {
      var ob = this.arg();
      return { html: '<span class="tx-overline">' + ob.html + '</span>' };
    }
    if (name === 'underline') {
      var ub = this.arg();
      return { html: '<span class="tx-underline">' + ub.html + '</span>' };
    }
    if (name === 'begin') {
      return this.environment();
    }
    if (BIGOP[name]) {
      return { html: '<span class="tx-bigop">' + BIGOP[name] + '</span>' };
    }
    if (NAMED_OP.indexOf(name) >= 0 && !FUNC[name]) {
      return { html: '<span class="tx-opname">' + esc(name) + '</span>' };
    }
    if (FUNC[name]) {
      return { html: '<span class="tx-op">' + esc(name) + '</span>' };
    }
    if (SYM[name] !== undefined) {
      return { html: '<span class="tx-sym">' + esc(SYM[name]) + '</span>' };
    }
    if (name === 'limits' || name === 'nolimits' || name === 'displaystyle' ||
        name === 'textstyle' || name === 'quad' || name === 'qquad') return { html: '' };
    // unknown command: show its name plainly (keeps content honest and visible)
    return { html: '<span class="tx-unknown">\\' + esc(name) + '</span>' };
  };

  Parser.prototype.delimArg = function () {
    var tk = this.peek();
    if (!tk) return '';
    if (tk.type === 'ord') { this.i++; return tk.v; }
    if (tk.type === 'cmd') {
      this.i++;
      if (tk.v === '{') return '{';
      if (tk.v === '}') return '}';
      if (tk.v === '|') return '‖';
      if (tk.v === 'lvert' || tk.v === 'rvert') return '|';
      if (tk.v === 'lVert' || tk.v === 'rVert') return '‖';
      if (tk.v === 'langle') return '⟨';
      if (tk.v === 'rangle') return '⟩';
      if (tk.v === 'lfloor') return '⌊';
      if (tk.v === 'rfloor') return '⌋';
      if (tk.v === 'lceil') return '⌈';
      if (tk.v === 'rceil') return '⌉';
      return SYM[tk.v] || tk.v;
    }
    if (tk.type === 'open') { this.i++; return '{'; }
    this.i++;
    return '';
  };

  // for \text{...}: take raw characters until the matching close
  Parser.prototype.rawGroup = function () {
    var tk = this.peek();
    if (!tk || tk.type !== 'open') return '';
    var depth = 0, out = '';
    while (this.i < this.t.length) {
      var t2 = this.next();
      if (t2.type === 'open') { depth++; if (depth === 1) continue; out += '{'; }
      else if (t2.type === 'close') { depth--; if (depth === 0) break; out += '}'; }
      else if (t2.type === 'cmd') out += '\\' + t2.v;
      else if (t2.type === 'ord') out += t2.v;
      else if (t2.type === 'sup') out += '^';
      else if (t2.type === 'sub') out += '_';
      else if (t2.type === 'amp') out += '&';
    }
    return out;
  };

  Parser.prototype.environment = function () {
    var envName = this.rawGroup().replace(/^\*/, '');
    var spec = MATRIX_ENV[envName] || MATRIX_ENV.matrix;
    var cols = null;
    if (envName === 'array') {
      var cs = this.rawGroup();
      cols = cs.split('').filter(function (c) { return /[lcr]/.test(c); });
    }
    // rows[r][c]; '&' moves to the next column, '\\' starts a new row
    var rows = [[]];
    var r = 0;
    function pushCell(html) {
      if (!rows[r]) rows[r] = [];
      if (rows[r].length === 0) rows[r].push('');
      rows[r][rows[r].length - 1] += html;
    }
    while (this.i < this.t.length) {
      var tk = this.peek();
      if (tk.type === 'cmd' && tk.v === 'end') {
        this.i++;
        this.rawGroup(); // consume env name
        break;
      }
      if (tk.type === 'amp') {
        this.i++;
        rows[r].push('');            // next column in the SAME row
        continue;
      }
      if (tk.type === 'cmd' && (tk.v === '\\' || tk.v === 'cr' || tk.v === 'newline')) {
        this.i++;
        rows.push([]);               // next row
        r++;
        continue;
      }
      var piece;
      if (tk.type === 'open') { this.i++; piece = this.parseGroup('close').html; }
      else if (tk.type === 'cmd') { this.i++; piece = this.command(tk.v).html; }
      else { this.i++; piece = esc(tk.v || ''); }
      pushCell(piece);
    }
    var body = rows.map(function (cells) {
      return '<tr>' + cells.map(function (c, ci) {
        var al = spec.align === 'l' ? 'left' : (spec.align === 'r' ? 'right' : 'center');
        if (cols && cols[ci]) al = cols[ci] === 'l' ? 'left' : (cols[ci] === 'r' ? 'right' : 'center');
        return '<td style="text-align:' + al + '">' + (c || '') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return { html: '<span class="tx-matrix"><span class="tx-mopen">' + esc(spec.open) +
      '</span><table class="tx-mtab">' + body + '</table><span class="tx-mclose">' +
      esc(spec.close) + '</span></span>' };
  };

  /* ---------------- top level: attach scripts, handle \over ---------------- */
  function parseTex(src, display) {
    var p = new Parser(tokenize(src));
    var out = '';
    while (p.i < p.t.length) {
      var tk = p.peek();
      var base = '';
      if (tk.type === 'open') { p.i++; base = p.parseGroup('close').html; }
      else if (tk.type === 'cmd') { p.i++; base = p.command(tk.v).html; }
      else if (tk.type === 'sup' || tk.type === 'sub') { base = ''; }
      else if (tk.type === 'close') { p.i++; continue; }
      else { p.i++; base = esc(tk.v || ''); }

      var sup = null, sub = null;
      for (;;) {
        var nx = p.peek();
        if (nx && nx.type === 'sup') {
          p.i++;
          var s = p.scriptArg();
          sup = s.html;
        } else if (nx && nx.type === 'sub') {
          p.i++;
          var b = p.scriptArg();
          sub = b.html;
        } else break;
      }
      if (sup !== null || sub !== null) {
        var isBig = /tx-bigop|tx-op\b/.test(base) || /tx-bigop/.test(base);
        base = '<span class="tx-script' + (isBig || display ? ' tx-limits' : '') + '">' + base +
          (sup !== null ? '<span class="tx-sup">' + sup + '</span>' : '') +
          (sub !== null ? '<span class="tx-sub">' + sub + '</span>' : '') + '</span>';
      }
      out += base;
    }
    return out;
  }

  /* ---------------- simple environments/commands pre-pass ---------------- */
  function preprocess(src) {
    return String(src)
      // 行间距写法 \\[10pt]：先归成换行 \\（否则 \\ 后面的 [ 会被当成 \[ 显示定界符）
      .replace(/\\\\\[[^\]]*\]/g, '\\\\')
      .replace(/\\\[/g, '\u0001').replace(/\\\]/g, '\u0002')
      .replace(/\\\(/g, '\u0003').replace(/\\\)/g, '\u0004')
      .replace(/\\displaystyle/g, '')
      .replace(/\\limits/g, '')
      .replace(/\\nonumber/g, '')
      .replace(/\\tag\{[^}]*\}/g, '')
      .replace(/\\label\{[^}]*\}/g, '');
  }

  function render(src, el, display) {
    var html = parseTex(preprocess(src), !!display);
    el.innerHTML = html;
    el.classList.add('tx');
    if (display) el.classList.add('tx-display');
    return el;
  }

  global.DshTeX = { render: render, toHTML: function (s, d) { return parseTex(preprocess(s), !!d); } };

  // auto-render: elements with class "tex" whose text is the source
  function autoRender(root) {
    var nodes = (root || document).querySelectorAll('.tex:not([data-tex-done])');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var src = el.getAttribute('data-tex');
      if (src === null) { src = el.textContent; }
      render(src, el, el.classList.contains('tex-display'));
      el.setAttribute('data-tex-done', '1');
    }
  }
  global.DshTeX.autoRender = autoRender;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { autoRender(); });
  } else { autoRender(); }
})(typeof window !== 'undefined' ? window : this);
