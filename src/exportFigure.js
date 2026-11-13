function slugify(text) {
  const slug = String(text || 'figure')
    .replace(/[^\w\s.-]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  return slug || 'figure';
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function paintOnWhite(source) {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0);
  return canvas;
}

function canvasBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not export the figure'));
    }, type, quality);
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function concatBytes(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
}

function jpegToPdf(jpeg, pxW, pxH) {
  const landscape = pxW >= pxH;
  const pageW = landscape ? 792 : 612;
  const pageH = landscape ? 612 : 792;
  const margin = 36;
  const scale = Math.min((pageW - margin * 2) / pxW, (pageH - margin * 2) / pxH);
  const imgW = pxW * scale;
  const imgH = pxH * scale;
  const x = (pageW - imgW) / 2;
  const y = (pageH - imgH) / 2;
  const content = `q\n${imgW.toFixed(2)} 0 0 ${imgH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ\n`;
  const encoder = new TextEncoder();
  const header = encoder.encode('%PDF-1.4\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>\nendobj\n`,
    `4 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`,
  ];
  const parts = [header];
  const offsets = [0];
  let cursor = header.length;
  objects.forEach((body, index) => {
    offsets[index + 1] = cursor;
    const bytes = encoder.encode(body);
    parts.push(bytes);
    cursor += bytes.length;
  });
  const imageHead = encoder.encode(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pxW} /Height ${pxH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  );
  const imageTail = encoder.encode('\nendstream\nendobj\n');
  offsets[5] = cursor;
  parts.push(imageHead, jpeg, imageTail);
  cursor += imageHead.length + jpeg.length + imageTail.length;
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i += 1) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${cursor}\n%%EOF\n`;
  parts.push(encoder.encode(xref));
  return concatBytes(parts);
}

export async function exportFigure(source, format, title) {
  if (!source || !source.width || !source.height) {
    throw new Error('The figure is not ready to export');
  }
  const name = slugify(title);
  const painted = paintOnWhite(source);
  if (format === 'png') {
    downloadBlob(await canvasBlob(painted, 'image/png'), `${name}.png`);
    return;
  }
  if (format === 'jpeg') {
    downloadBlob(await canvasBlob(painted, 'image/jpeg', 0.92), `${name}.jpeg`);
    return;
  }
  if (format === 'svg') {
    const href = await blobToDataUrl(await canvasBlob(painted, 'image/png'));
    const { width, height } = painted;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n<rect width="100%" height="100%" fill="#ffffff"/>\n<image width="${width}" height="${height}" href="${href}"/>\n</svg>\n`;
    downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${name}.svg`);
    return;
  }
  if (format === 'pdf') {
    const jpeg = new Uint8Array(await (await canvasBlob(painted, 'image/jpeg', 0.92)).arrayBuffer());
    const pdf = jpegToPdf(jpeg, painted.width, painted.height);
    downloadBlob(new Blob([pdf], { type: 'application/pdf' }), `${name}.pdf`);
  }
}
