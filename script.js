let currentTool = 'brush';
let brushSize = 10;
let color = '#000000';
let layers = [];
let activeLayer;

function createCanvas(width = 800, height = 600, transparent = false) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.zIndex = layers.length;
  canvas.classList.add('drawing-layer');
  const ctx = canvas.getContext('2d');
  if (!transparent) ctx.fillStyle = '#ffffff', ctx.fillRect(0, 0, width, height);
  canvas.addEventListener('mousedown', startDraw);
  document.getElementById('canvasContainer').appendChild(canvas);
  layers.push(canvas);
  activeLayer = canvas;
}

function setTool(tool) {
  currentTool = tool;
}

function startDraw(e) {
  const ctx = activeLayer.getContext('2d');
  const rect = activeLayer.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (currentTool === 'brush') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  } else if (currentTool === 'eraser') {
    ctx.clearRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
  } else if (currentTool === 'bucket') {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, activeLayer.width, activeLayer.height);
  } else if (currentTool === 'eraseBucket') {
    ctx.clearRect(0, 0, activeLayer.width, activeLayer.height);
  }
}

document.getElementById('brushSize').oninput = e => brushSize = parseInt(e.target.value);
document.getElementById('colorPicker').oninput = e => color = e.target.value;
document.getElementById('hexInput').onchange = e => color = e.target.value;

document.getElementById('importImage').onchange = e => {
  const file = e.target.files[0];
  const img = new Image();
  img.onload = () => activeLayer.getContext('2d').drawImage(img, 0, 0);
  img.src = URL.createObjectURL(file);
};

function addLayer() {
  createCanvas(activeLayer?.width || 800, activeLayer?.height || 600, document.getElementById('transparentBg').checked);
}

function downloadImage() {
  const format = document.getElementById('formatSelect').value;
  const mergedCanvas = document.createElement('canvas');
  mergedCanvas.width = activeLayer.width;
  mergedCanvas.height = activeLayer.height;
  const ctx = mergedCanvas.getContext('2d');

  layers.forEach(layer => ctx.drawImage(layer, 0, 0));

  const mime = {
    png: 'image/png',
    jpg: 'image/jpeg',
    svg: 'image/svg+xml',
    pdf: 'application/pdf'
  }[format];

  const link = document.createElement('a');
  link.download = `drawing.${format}`;
  link.href = mergedCanvas.toDataURL(mime);
  link.click();
}

// Initial canvas
createCanvas();

let scale = 1;
let originX = 0;
let originY = 0;
let isPanning = false;
let startX, startY;

activeLayer.addEventListener('wheel', e => {
  e.preventDefault();
  const zoomIntensity = 0.1;
  const delta = e.deltaY < 0 ? 1 + zoomIntensity : 1 - zoomIntensity;
  scale *= delta;
  drawZoom();
});

activeLayer.addEventListener('mousedown', e => {
  isPanning = true;
  startX = e.clientX - originX;
  startY = e.clientY - originY;
});

window.addEventListener('mouseup', () => isPanning = false);

window.addEventListener('mousemove', e => {
  if (!isPanning) return;
  originX = e.clientX - startX;
  originY = e.clientY - startY;
  drawZoom();
});

function drawZoom() {
  activeLayer.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
  activeLayer.style.transformOrigin = '0 0';
}