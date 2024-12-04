import puppeteer, { Browser, Page, PDFOptions } from "puppeteer";
import { defaultPdfOptions } from "../config/pdf.config";
import { Readable, Writable } from "stream";
import fs, { WriteStream } from "fs";

export class PdfGenerator {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch();

      // Open a single reusable tab
      const pages = await this.browser.pages();
      this.page = pages[0] || (await this.browser.newPage());
    }
  }

  async generatePdf(html: string, outputPath: string, i: number, options: PDFOptions = defaultPdfOptions): Promise<void> {
    if (!this.browser || !this.page) {
      throw new Error("Browser or page is not initialized. Call `initBrowser()` first.");
    }

      // Set the HTML content
      await this.page.setContent(html);

      // Generate the PDF stream
      const pdfStream = await this.page.createPDFStream({
        path: outputPath,
        format: options.format,
        printBackground: options.printBackground,
        margin: options.margin,
      });
      const nodeReadable = Readable.fromWeb(pdfStream);

      // const writeStream = fs.createWriteStream(`${outputPath}-${i}.pdf`); // Uncomment to write to a file
      const writeStream = new Writable({
        write(_, __, callback) {
          callback();
        }
      });
    
    // Pipe to null to consume the stream
    nodeReadable.pipe(writeStream);

    // Ensure the stream is fully consumed
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => {

      if (i % 1000 === 0) {
        console.log(`PDF generated`, i);
      }
        return resolve();
      });
      writeStream.on('error', reject);
    });
  } 
  
  

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}