// ============================================================
// CONFIGURACIÓN RÁPIDA — edita aquí sin tocar el resto del código
// ============================================================
const CONFIG = {
  // Número de WhatsApp donde llegarán los registros (con código de país, sin +, sin espacios)
  // Ejemplo: 521XXXXXXXXXX
  whatsappNumero: "5217121707120",

  // Fecha y hora objetivo de la cuenta regresiva (formato AAAA-MM-DDTHH:MM:SS)
  fechaEvento: "2026-11-27T18:50:00",

  // Contraseña para entrar al panel de administración (admin.html). Cámbiala.
  adminPassword: "amelia2026",

  // ============================================================
  // GOOGLE SHEETS — guarda los registros y pases (ver INSTRUCCIONES-ADMIN.md)
  // ------------------------------------------------------------
  // Mientras "scriptUrl" esté vacío, los registros solo se guardan
  // en el navegador (localStorage): sirve para probar, pero cada quien vería
  // solo lo que registró en su propio celular.
  // ============================================================
  googleSheets: {
    scriptUrl: "https://script.google.com/macros/s/AKfycbzVkVQNAmt5ojJVedS1LC68C2ODmf-vr1gFyD_VYlajNlteP6doFOpIlKsO63YuHtfr/exec", // Pega aquí la URL de tu Google Apps Script (ver INSTRUCCIONES-ADMIN.md)
  },

  // Link de la mesa de regalos (Amazon, Liverpool, Sears, etc). Déjalo vacío ("") si todavía no lo tienes:
  // mientras esté vacío, no se muestra ningún botón.
  mesaDeRegalosUrl: "https://mesaderegalos.liverpool.com.mx/milistaderegalos/60020359",
};
