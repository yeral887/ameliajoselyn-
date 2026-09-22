# Cómo dejar todo funcionando

## Cómo funciona (registro libre)
1. Mandas **el mismo link** de la invitación a todas las familias que quieras invitar.
2. Cada quien entra, toca "Registrarme", pone su nombre y cuántas personas les gustaría llevar en total.
3. Tú entras al panel (`admin.html`), ves todos los registros, y le pones a cada quien cuántos pases le autorizas.
4. La familia regresa a la invitación, busca su nombre en el buscador y ve: "¡Tienes 3 pases confirmados!" o "Aún en revisión" si todavía no lo revisas.

Es un solo link para todos — no hay links personalizados por invitado.

## 1. Tu número de WhatsApp
Ya está puesto en `config.js` (`whatsappNumero`). Si necesitas cambiarlo, edítalo ahí directamente (con código de país, sin `+` ni espacios, ej. `5215512345678`).

## 2. Mesa de regalos
Ya está puesto tu link de Liverpool en `config.js` (`mesaDeRegalosUrl`). El botón "Ver mesa de regalos" aparece solo porque ya tiene un valor.

## 3. Conectar Google Sheets (para guardar y ver los registros desde cualquier dispositivo)

Los datos se guardan en una hoja de Google Sheets. Para conectarla se usa **Google Apps Script**, que ya viene listo en el archivo `google-apps-script.gs` — solo hay que pegarlo.

### Paso 1 — Crea la hoja
1. Ve a [sheets.google.com](https://sheets.google.com) y crea una hoja nueva.
2. Ponle de nombre a la pestaña de abajo **Registros** (doble clic en "Hoja 1").
3. En la fila 1 escribe estos encabezados, uno por columna (A a G):
   `id | nombre | pasesSolicitados | pasesAsignados | estado | mensaje | fecha`

### Paso 2 — Pega el código
1. En la misma hoja, ve a **Extensiones → Apps Script**.
2. Borra todo lo que haya en el editor y pega el contenido completo del archivo `google-apps-script.gs` (que va junto a este documento).
3. Guarda (ícono del disquete o Ctrl+S).

### Paso 3 — Publica el script como app web
1. Arriba a la derecha, dale **Implementar → Nueva implementación**.
2. En "Seleccionar tipo", elige **Aplicación web**.
3. En "Quién puede acceder", elige **Cualquier usuario**.
4. Dale **Implementar**. Te va a pedir autorizar permisos (es tu propia hoja, dale "Permitir" aunque salga la advertencia de "app no verificada").
5. Copia la **URL de la aplicación web** que te da (termina en `/exec`).

### Paso 4 — Pega la URL en config.js
Abre `config.js` y llena:
```js
googleSheets: {
  scriptUrl: "https://script.google.com/macros/s/AKfycb.../exec", // la URL del paso 3
},
```

Listo. Desde ese momento:
- Cada registro nuevo se guarda como fila en tu hoja de Google Sheets.
- Cuando en el panel le asignas pases a alguien, se actualiza esa misma fila.
- Cuando un invitado busca su nombre, el sistema consulta directamente la hoja y le muestra su resultado.

### Si actualizas el código del script
Cada vez que cambies algo en `google-apps-script.gs` dentro del editor de Apps Script, tienes que volver a implementarlo: **Implementar → Administrar implementaciones → ícono de lápiz → Nueva versión → Implementar**. La URL no cambia.

### Para comprobar que quedó bien conectado
Abre `admin.html`, entra con tu contraseña, y si el aviso amarillo de "Todavía no conectas Google Sheets" ya no aparece, quedó bien. Si sigue apareciendo, revisa que copiaste bien la `scriptUrl` completa (incluyendo `/exec` al final), que la implementación es de tipo "Aplicación web" con acceso "Cualquier usuario", y que la hoja se llama exactamente `Registros` con los encabezados correctos.

## 4. Entrar al panel de administración
Abre `admin.html` (junto a `index.html`) e ingresa la contraseña que está en `config.js` en `adminPassword` (por defecto `amelia2026`, cámbiala por la que quieras).

Ahí vas a ver:
- Cuántas familias se han registrado, cuántas están pendientes de que les asignes pases, y cuántas personas en total ya tienen pase.
- Una tabla con cada registro: nombre, cuántos pidieron, su mensaje, la fecha, y un cuadro para escribir cuántos pases le das — con botón "Guardar". Si algo falla al guardar, ahora sí te va a salir una alerta explicando por qué.

## 5. Publicar la invitación
Puedes subir esta carpeta (tal cual) a cualquier hosting gratuito de sitios estáticos, por ejemplo:
- **Netlify Drop** (netlify.com/drop): arrastras la carpeta y te da un link al instante.
- **GitHub Pages** o **Vercel**, si ya los usas.

Ese link publicado (ej. `https://mis-xv-amelia.netlify.app/`) es el mismo que le mandas a todas las familias.
