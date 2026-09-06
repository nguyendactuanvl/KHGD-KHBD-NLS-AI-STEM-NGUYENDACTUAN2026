import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';

export const TestPDF = () => {
  const ref = useRef<HTMLDivElement>(null);
  const handleExport = () => {
    html2pdf().from(ref.current).save('test.pdf');
  };
  return <div ref={ref} onClick={handleExport}>Test</div>;
}
