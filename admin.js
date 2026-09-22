document.addEventListener('DOMContentLoaded', function () {

  var loginScreen = document.getElementById('loginScreen');
  var dashboard = document.getElementById('dashboard');
  var loginError = document.getElementById('loginError');

  function mostrarDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
    cargarTodo();
  }

  if (sessionStorage.getItem('adminLoggedIn') === 'yes') {
    mostrarDashboard();
  }

  document.getElementById('loginBtn').addEventListener('click', intentarLogin);
  document.getElementById('loginPassword').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') intentarLogin();
  });

  function intentarLogin() {
    var val = document.getElementById('loginPassword').value;
    if (val === CONFIG.adminPassword) {
      sessionStorage.setItem('adminLoggedIn', 'yes');
      loginError.style.display = 'none';
      mostrarDashboard();
    } else {
      loginError.style.display = 'block';
    }
  }

  document.getElementById('logoutBtn').addEventListener('click', function () {
    sessionStorage.removeItem('adminLoggedIn');
    location.reload();
  });

  document.getElementById('refreshBtn').addEventListener('click', cargarTodo);

  function cargarTodo() {
    obtenerRegistros(function (registros) {
      pintarResumen(registros);
      pintarTabla(registros);
    });
  }

  function sheetsListo() {
    return CONFIG.googleSheets && CONFIG.googleSheets.scriptUrl;
  }

  /* ---------- Obtener registros: Google Sheets si está configurado, si no localStorage ---------- */
  function obtenerRegistros(callback) {
    var warning = document.getElementById('sheetsWarning');
    if (sheetsListo()) {
      fetch(CONFIG.googleSheets.scriptUrl + '?action=listar').then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.error) { throw new Error(data.error); }
          warning.style.display = 'none';
          callback(data.registros || []);
        })
        .catch(function () {
          warning.style.display = 'block';
          callback(leerLocal());
        });
    } else {
      warning.style.display = 'block';
      callback(leerLocal());
    }
  }

  function leerLocal() {
    try { return JSON.parse(localStorage.getItem('rsvpResponses') || '[]'); }
    catch (e) { return []; }
  }

  function guardarLocal(lista) {
    try { localStorage.setItem('rsvpResponses', JSON.stringify(lista)); } catch (e) {}
  }

  /* ---------- Tarjetas resumen ---------- */
  function pintarResumen(registros) {
    var pendientes = registros.filter(function (r) { return r.estado !== 'asignado'; }).length;
    var asignados = registros.filter(function (r) { return r.estado === 'asignado'; });
    var personasAsignadas = asignados.reduce(function (sum, r) { return sum + (parseInt(r.pasesAsignados, 10) || 0); }, 0);

    document.getElementById('cardRegistros').textContent = registros.length;
    document.getElementById('cardPendientes').textContent = pendientes;
    document.getElementById('cardAsignados').textContent = asignados.length;
    document.getElementById('cardPersonasAsignadas').textContent = personasAsignadas;
  }

  /* ---------- Tabla de registros + asignación ---------- */
  function pintarTabla(registros) {
    var tbody = document.querySelector('#tablaRegistros tbody');
    tbody.innerHTML = '';

    registros
      .slice()
      .sort(function (a, b) { return new Date(b.fecha || 0) - new Date(a.fecha || 0); })
      .forEach(function (r) {
        var asignado = r.estado === 'asignado';
        var fecha = r.fecha ? new Date(r.fecha).toLocaleString('es-MX') : '';
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + escapeHtml(r.nombre || '') + '</td>' +
          '<td>' + escapeHtml(r.mensaje || '') + '</td>' +
          '<td>' + fecha + '</td>' +
          '<td><input type="number" min="0" class="admin-input-pases" value="' + (asignado ? r.pasesAsignados : '') + '" style="width:64px;"></td>' +
          '<td><span class="admin-status ' + (asignado ? 'ok' : 'pending') + '">' + (asignado ? 'Asignado' : 'Pendiente') + '</span></td>' +
          '<td><button class="admin-copy-btn admin-guardar-btn">Guardar</button> ' +
          (asignado ? '<button class="admin-copy-btn admin-boleto-btn" style="background:#c9a24b;">Boleto</button> ' : '') +
          '<button class="admin-copy-btn admin-borrar-btn" style="background:#c0392b;">Borrar</button></td>';

        tr.querySelector('.admin-guardar-btn').addEventListener('click', function () {
          var input = tr.querySelector('.admin-input-pases');
          var pases = parseInt(input.value, 10);
          if (isNaN(pases) || pases < 0) { alert('Escribe un número válido de pases.'); return; }
          asignarPases(r, pases, tr);
        });

        var boletoBtn = tr.querySelector('.admin-boleto-btn');
        if (boletoBtn) {
          boletoBtn.addEventListener('click', function () {
            generarBoleto(r.nombre, r.pasesAsignados);
          });
        }

        tr.querySelector('.admin-borrar-btn').addEventListener('click', function () {
          if (!confirm('¿Seguro que quieres borrar el registro de "' + r.nombre + '"? No se puede deshacer.')) return;
          borrarRegistro(r, tr);
        });

        tbody.appendChild(tr);
      });
  }

  /* ---------- Asignar pases a un registro ---------- */
  function asignarPases(registro, pases, tr) {
    var btn = tr.querySelector('.admin-guardar-btn');
    btn.disabled = true;
    btn.textContent = 'Guardando…';

    if (sheetsListo()) {
      fetch(CONFIG.googleSheets.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'asignar', id: registro.id, pasesAsignados: pases, estado: 'asignado' })
      })
        .catch(function (err) {
          alert('No se pudo conectar con Google Sheets. Revisa scriptUrl en config.js.\n' + err);
        })
        .finally(function () {
          setTimeout(cargarTodo, 600);
        });
    } else {
      var lista = leerLocal();
      lista = lista.map(function (item) {
        if (item.id === registro.id) {
          item.pasesAsignados = pases;
          item.estado = 'asignado';
        }
        return item;
      });
      guardarLocal(lista);
      cargarTodo();
    }
  }

  /* ---------- Borrar un registro ---------- */
  function borrarRegistro(registro, tr) {
    var btn = tr.querySelector('.admin-borrar-btn');
    btn.disabled = true;
    btn.textContent = 'Borrando…';

    if (sheetsListo()) {
      fetch(CONFIG.googleSheets.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'eliminar', id: registro.id })
      })
        .catch(function (err) {
          alert('No se pudo conectar con Google Sheets. Revisa scriptUrl en config.js.\n' + err);
        })
        .finally(function () {
          setTimeout(cargarTodo, 600);
        });
    } else {
      var lista = leerLocal().filter(function (item) { return item.id !== registro.id; });
      guardarLocal(lista);
      cargarTodo();
    }
  }

  /* ---------- Generar boleto como imagen (canvas) ---------- */
  function generarBoleto(nombre, pases) {
    var w = 700, h = 420;
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');

    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#fdf1f4');
    grad.addColorStop(1, '#fbe4ea');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#c9a24b';
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, w - 44, h - 44);

    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(w * 0.62, 22);
    ctx.lineTo(w * 0.62, h - 22);
    ctx.strokeStyle = '#c9a24b';
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#8a2b45';
    ctx.textAlign = 'left';
    ctx.font = '600 16px Georgia, serif';
    ctx.fillText('MIS XV AÑOS', 55, 75);

    ctx.font = 'italic 44px Georgia, serif';
    ctx.fillText('Amelia', 55, 130);

    ctx.fillStyle = '#4a3a3f';
    ctx.font = '15px Georgia, serif';
    var fecha = new Date(CONFIG.fechaEvento);
    var fechaTxt = fecha.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    ctx.fillText(fechaTxt.charAt(0).toUpperCase() + fechaTxt.slice(1), 55, 175);

    ctx.font = '600 17px Georgia, serif';
    ctx.fillText('Invitado(a):', 55, 240);
    ctx.font = '20px Georgia, serif';
    ctx.fillText(nombre, 55, 270);

    var cx = w * 0.81, cy = h / 2;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8a2b45';
    ctx.font = '600 15px Georgia, serif';
    ctx.fillText('PASE VÁLIDO PARA', cx, cy - 55);

    ctx.font = 'bold 70px Georgia, serif';
    ctx.fillStyle = '#c9a24b';
    ctx.fillText(String(pases), cx, cy + 20);

    ctx.font = '16px Georgia, serif';
    ctx.fillStyle = '#4a3a3f';
    ctx.fillText(parseInt(pases, 10) === 1 ? 'PERSONA' : 'PERSONAS', cx, cy + 45);

    var link = document.createElement('a');
    link.download = 'boleto-xv-amelia-' + nombre.trim().replace(/\s+/g, '-').toLowerCase() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
});