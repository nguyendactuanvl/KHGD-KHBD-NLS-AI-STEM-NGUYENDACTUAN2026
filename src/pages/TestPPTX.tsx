import { useEffect } from "react";
import pptxgen from "pptxgenjs";
import { printElement } from '../lib/print';

export function TestPPTX() {
  useEffect(() => {
    try {
      console.log("Testing pptxgen");
      const pres = new pptxgen();
      console.log("Success", pres);
    } catch(e) {
      console.error("PPTX Error:", e);
    }
  }, []);
  return <div>Test</div>;
}
