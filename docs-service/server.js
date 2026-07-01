const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-dist');

const app = express();
const PORT = process.env.PORT || 3003;

const swaggerAssets = swaggerUi.getAbsoluteFSPath();

app.use('/swagger-assets', express.static(swaggerAssets));

const SERVICES = [
  { id: 'usuarios',   name: 'Usuarios',   url: '/api/docs/usuarios-json' },
  { id: 'vehiculos',  name: 'Vehículos',  url: '/api/docs/vehiculos-json' },
  { id: 'reservas',   name: 'Reservas',   url: '/api/docs/reservas-json' },
  { id: 'zonas',      name: 'Zonas',      url: '/api/swagger/zonas/api-docs' },
];

app.get('/', (_req, res) => {
  const tabs = SERVICES.map((s, i) =>
    `<button class="tab${i === 0 ? ' active' : ''}" onclick="loadSpec('${s.url}', this)">${s.name}</button>`
  ).join('\n      ');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Gateway - Documentación</title>
  <link rel="stylesheet" href="/api/docs/swagger-assets/swagger-ui.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
    .topbar { background: #1a1a2e; color: white; padding: 16px 24px; }
    .topbar h1 { font-size: 20px; font-weight: 600; }
    .tabs { display: flex; background: #16213e; padding: 0 24px; gap: 2px; }
    .tab { background: #0f3460; color: #aaa; border: none; padding: 12px 24px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; border-radius: 8px 8px 0 0; }
    .tab:hover { background: #1a5276; color: #fff; }
    .tab.active { background: #fff; color: #1a1a2e; }
    #swagger-ui { background: #fff; min-height: calc(100vh - 110px); }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div class="topbar">
    <h1>API Gateway - Documentación</h1>
  </div>
  <div class="tabs">
    ${tabs}
  </div>
  <div id="swagger-ui"></div>
  <script src="/api/docs/swagger-assets/swagger-ui-bundle.js"></script>
  <script>
    function loadSpec(url, btn) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      if (btn) btn.classList.add('active');
      document.getElementById('swagger-ui').innerHTML = '';
      SwaggerUIBundle({
        url: url,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    }
    loadSpec('${SERVICES[0].url}', document.querySelector('.tab'));
  </script>
</body>
</html>`;
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Docs service running on port ${PORT}`);
});
