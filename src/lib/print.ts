// @ts-ignore
import html2pdf from 'html2pdf.js';

const colorCache = new Map<string, string>();

const getRgbaFromColor = (colorStr: string) => {
  if (colorCache.has(colorStr)) return colorCache.get(colorStr)!;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return colorStr;
    ctx.fillStyle = colorStr;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
    colorCache.set(colorStr, rgba);
    return rgba;
  } catch (e) {
    return colorStr;
  }
};

export const printElement = (element: HTMLElement | null, title: string = "Tai_lieu") => {
  if (!element) return;
  
  const clone = element.cloneNode(true) as HTMLElement;
  
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '800px';
  container.style.background = 'white';
  
  container.appendChild(clone);
  document.body.appendChild(container);

  const cleanOklch = (el: HTMLElement) => {
    if (el.nodeType !== Node.ELEMENT_NODE) return;
    
    const computed = window.getComputedStyle(el);
    const props = [
      'color', 'backgroundColor', 'borderColor', 
      'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
      'textDecorationColor', 'outlineColor', 'fill', 'stroke'
    ];
    
    props.forEach(prop => {
      const val = computed[prop as any];
      if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('color('))) {
        el.style[prop as any] = getRgbaFromColor(val);
      }
    });

    Array.from(el.children).forEach(child => cleanOklch(child as HTMLElement));
  };

  try {
    cleanOklch(clone);
  } catch (e) {
    console.error("Error cleaning colors:", e);
  }
  
  const opt = {
    margin:       10,
    filename:     `${title}.pdf`,
    image:        { type: 'jpeg' as const, quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(clone).save().then(() => {
    document.body.removeChild(container);
  }).catch((err: any) => {
    console.error("PDF generation failed:", err);
    document.body.removeChild(container);
  });
};
