document.getElementById('runButton').addEventListener('click', runMontecarlo);

function runMontecarlo() {
  const params = readInputs();
  const ctx = setupCanvas();
  drawAxes(ctx);

  drawConstraints(ctx, params);
  const best = simulateMontecarlo(ctx, params);

  highlightBestPoint(ctx, best, params.scale);
  displayResult(best);
}

function readInputs() {
  return {
    horasCorte: getValue('horasCorte'),
    horasCostura: getValue('horasCostura'),
    camisaCorte: getValue('camisaCorte'),
    camisaCostura: getValue('camisaCostura'),
    camisaPrecio: getValue('camisaPrecio'),
    chaquetaCorte: getValue('chaquetaCorte'),
    chaquetaCostura: getValue('chaquetaCostura'),
    chaquetaPrecio: getValue('chaquetaPrecio'),
    scale: 40,
    offsetX: 50,
    offsetY: 450
  };
}

function getValue(id) {
  return parseFloat(document.getElementById(id).value);
}

function setupCanvas() {
  const canvas = document.getElementById('grafico');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

function drawAxes(ctx) {
  const { width: w, height: h } = ctx.canvas;
  const offsetX = 50, offsetY = h - 50;

  ctx.beginPath();
  ctx.moveTo(offsetX, offsetY);
  ctx.lineTo(w - 20, offsetY); // eje X
  ctx.lineTo(w - 30, offsetY - 10);
  ctx.moveTo(w - 20, offsetY);
  ctx.lineTo(w - 30, offsetY + 10);

  ctx.moveTo(offsetX, offsetY);
  ctx.lineTo(offsetX, 20); // eje Y
  ctx.lineTo(offsetX - 10, 30);
  ctx.moveTo(offsetX, 20);
  ctx.lineTo(offsetX + 10, 30);

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawConstraints(ctx, p) {
  const { offsetX, offsetY, scale } = p;

  // Línea de corte
  ctx.strokeStyle = 'blue';
  ctx.beginPath();
  ctx.moveTo(offsetX, offsetY - (p.horasCorte / p.chaquetaCorte) * scale);
  ctx.lineTo(offsetX + (p.horasCorte / p.camisaCorte) * scale, offsetY);
  ctx.stroke();

  // Línea de costura
  ctx.strokeStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(offsetX, offsetY - (p.horasCostura / p.chaquetaCostura) * scale);
  ctx.lineTo(offsetX + (p.horasCostura / p.camisaCostura) * scale, offsetY);
  ctx.stroke();
}

function simulateMontecarlo(ctx, p) {
  const n = 5000;
  let best = { z: -Infinity, x: 0, y: 0 };

  for (let i = 0; i < n; i++) {
    const x = Math.random() * (p.horasCorte / p.camisaCorte);
    const y = Math.random() * (p.horasCostura / p.chaquetaCostura);

    const corte = p.camisaCorte * x + p.chaquetaCorte * y;
    const costura = p.camisaCostura * x + p.chaquetaCostura * y;

    if (corte <= p.horasCorte && costura <= p.horasCostura) {
      const z = p.camisaPrecio * x + p.chaquetaPrecio * y;

      ctx.fillStyle = 'rgba(0,200,0,0.25)';
      ctx.fillRect(p.offsetX + x * p.scale, p.offsetY - y * p.scale, 2, 2);

      if (z > best.z) best = { z, x, y };
    }
  }

  // Región factible (polígono visual)
  ctx.fillStyle = 'rgba(0,255,0,0.1)';
  ctx.beginPath();
  ctx.moveTo(p.offsetX, p.offsetY);
  ctx.lineTo(p.offsetX + (p.horasCorte / p.camisaCorte) * p.scale, p.offsetY);
  ctx.lineTo(p.offsetX, p.offsetY - (p.horasCostura / p.chaquetaCostura) * p.scale);
  ctx.closePath();
  ctx.fill();

  return best;
}

function highlightBestPoint(ctx, best, scale) {
  const offsetX = 50, offsetY = 450;
  ctx.beginPath();
  ctx.arc(offsetX + best.x * scale, offsetY - best.y * scale, 6, 0, 2 * Math.PI);
  ctx.fillStyle = 'orange';
  ctx.fill();
}

function displayResult(best) {
  const res = document.getElementById('resultado');
  res.innerHTML = `
    <strong>Zmax:</strong> ${best.z.toFixed(2)}<br>
    Camisas: ${best.x.toFixed(2)}<br>
    Chaquetas: ${best.y.toFixed(2)}
  `;
}
