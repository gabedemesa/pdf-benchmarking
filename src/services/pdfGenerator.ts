import puppeteer, { Browser, PDFOptions } from 'puppeteer';
import { CustomPdfOptions } from '../types';
import { defaultPdfOptions } from '../config/pdf.config';
import fs from 'fs';
import { Writable } from 'stream';
export class PdfGenerator {
  private browser: Browser | null = null;

  async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async generatePdf(
    html: string,
    outputPath: string,
    index: number,
    options: CustomPdfOptions = defaultPdfOptions
  ): Promise<void> {
    if (!this.browser) {
      throw new Error('Browser instance is not initialized. Call `initBrowser()` first.');
    }
    let page;
    try {
      page = await this.browser.newPage();
      await page.setContent(html);

      const pdfOptions: PDFOptions = {
        path: outputPath,
        format: options.format,
        printBackground: options.printBackground,
        margin: options.margin,
      };

      const pdfStream = await page.createPDFStream(pdfOptions);
      
      const writable = new Writable({
        write(_, __, callback) { 
          callback(); // Do nothing with the chunks (discard)

        }
      });
      pdfStream.pipe(writable);

      // Ensure the stream is fully consumed
      await new Promise((resolve, reject) => {
        writable.on('finish', () => {

          console.log('PDF Generated', index)
          return resolve('Done');
        });
        writable.on('error', reject);
      });

    } catch (error) {
      throw new Error(`PDF generation failed: ${(error as Error).message}`);
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}