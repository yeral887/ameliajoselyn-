// ============================================================
// Interacciones del sitio
// ============================================================
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Sobre de entrada ---------- */
  var envelope = document.getElementById('envelope');
  var envScreen = document.getElementById('envelope-screen');
  var body = document.body;

  envelope.addEventListener('click', function () {
    if (envelope.classList.contains('open')) return;
    envelope.classList.add('open');
    setTimeout(function () {
      envScreen.classList.add('hidden');
      body.classList.remove('locked');
      revealOnScroll();
    }, 1200);
    bgMusic.play().then(function(){ setMusicIcon(true); }).catch(function(){});
  });

  /* ---------- Cuenta regresiva ---------- */
  var target = new Date(CONFIG.fechaEvento);
  function tick() {
    var now = new Date();
    var diff = target - now;
    if (diff < 0) diff = 0;
    var d = Math.floor(diff / (1000 * 60 * 60 * 24));
    var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var m = Math.floor((diff / (1000 * 60)) % 60);
    var s = Math.floor((diff / 1000) % 60);
    document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
    document.getElementById('cd-min').textContent = String(m).padStart(2, '0');
    document.getElementById('cd-sec').textContent = String(s).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Reveal de secciones al hacer scroll ---------- */
  function revealOnScroll() {
    var items = document.querySelectorAll('.reveal');
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('in');
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- Mesa de regalos (si hay URL configurada) ---------- */
  if (CONFIG.mesaDeRegalosUrl) {
    var giftLink = document.getElementById('giftLink');
    giftLink.href = CONFIG.mesaDeRegalosUrl;
    giftLink.style.display = 'inline-block';
  }

  /* ---------- Modal de registro ---------- */
  var rsvpOverlay = document.getElementById('rsvpOverlay');
  var rNombre = document.getElementById('rNombre');

  document.getElementById('rsvpTrigger').addEventListener('click', function () {
    rsvpOverlay.classList.add('open');
  });
  document.getElementById('rsvpClose').addEventListener('click', function () {
    rsvpOverlay.classList.remove('open');
  });
  rsvpOverlay.addEventListener('click', function (e) {
    if (e.target === rsvpOverlay) rsvpOverlay.classList.remove('open');
  });

  document.getElementById('rsvpForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var nombre = rNombre.value.trim();
    var msg = document.getElementById('rMsg').value;

    var registro = {
      id: generarId(),
      nombre: nombre,
      pasesAsignados: '',
      estado: 'pendiente',
      mensaje: msg,
      fecha: new Date().toISOString()
    };

    guardarLocal(registro);
    enviarARegistro(registro);

    document.getElementById('rsvpForm').style.display = 'none';
    document.getElementById('rsvpGraciasNombre').textContent = '¡Gracias por confirmar, ' + nombre + '!';
    document.getElementById('rsvpGracias').style.display = 'block';
  });

  document.getElementById('rsvpGraciasCerrar').addEventListener('click', function () {
    rsvpOverlay.classList.remove('open');
    document.getElementById('rsvpForm').reset();
    document.getElementById('rsvpForm').style.display = '';
    document.getElementById('rsvpGracias').style.display = 'none';
  });

  function generarId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- Guardar registro (respaldo local) ---------- */
  function guardarLocal(registro) {
    try {
      var actuales = JSON.parse(localStorage.getItem('rsvpResponses') || '[]');
      actuales.push(registro);
      localStorage.setItem('rsvpResponses', JSON.stringify(actuales));
    } catch (err) { /* almacenamiento no disponible, se ignora */ }
  }

  /* ---------- Enviar registro a Google Sheets (si está configurado) ---------- */
  function sheetsListo() {
    return CONFIG.googleSheets && CONFIG.googleSheets.scriptUrl;
  }

  function enviarARegistro(registro) {
    if (!sheetsListo()) return;
    fetch(CONFIG.googleSheets.scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'crear',
        id: registro.id,
        nombre: registro.nombre,
        estado: 'pendiente',
        mensaje: registro.mensaje,
        fecha: registro.fecha
      })
    }).catch(function (err) { console.warn('No se pudo conectar con Google Sheets:', err); });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Música ---------- */
  var musicBtn = document.getElementById('musicBtn');
  var musicIcon = document.getElementById('musicIcon');
  var bgMusic = document.getElementById('bgMusic');
  var playingIcon = '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>';
  var pausedIcon = '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>';
  function setMusicIcon(isPlaying){ musicIcon.innerHTML = isPlaying ? pausedIcon : playingIcon; }
  musicBtn.addEventListener('click', function () {
    if (bgMusic.paused) { bgMusic.play().catch(function(){}); setMusicIcon(true); }
    else { bgMusic.pause(); setMusicIcon(false); }
  });

  /* ---------- Burbujas rosas con brillo (decorativas, no tapan texto) ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    var wrap = document.getElementById('bubblesLayer');

    for (var i = 0; i < 12; i++) {
      var b = document.createElement('div');
      b.className = 'bubble plain';
      var size = 10 + Math.random() * 22;
      b.style.width = size + 'px';
      b.style.height = size + 'px';
      b.style.left = (Math.random() * 96) + '%';
      b.style.animationDuration = (14 + Math.random() * 14) + 's';
      b.style.animationDelay = (Math.random() * 18) + 's';
      wrap.appendChild(b);
    }

    // Brillos / sparkles
    for (var k = 0; k < 14; k++) {
      var s = document.createElement('div');
      s.className = 'sparkle';
      s.style.left = (Math.random() * 100) + '%';
      s.style.top = (Math.random() * 100) + '%';
      s.style.animationDuration = (2 + Math.random() * 3) + 's';
      s.style.animationDelay = (Math.random() * 5) + 's';
      s.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.2 8.8L23 11l-8.8 2.2L12 22l-2.2-8.8L1 11l8.8-2.2z"/></svg>';
      wrap.appendChild(s);
    }
  }

  // Si el sobre ya estaba abierto (o sin JS de bloqueo), revela secciones igual
  if (!body.classList.contains('locked')) revealOnScroll();
});
