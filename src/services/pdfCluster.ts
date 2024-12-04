import { Cluster } from "puppeteer-cluster";
import { Page, PDFOptions } from "puppeteer";
import { TemplateRenderer } from "./templateRenderer";
import path from "path";
import { TemplateData } from "../types";
import { formatDate } from "../utils/dateFormatter";
import { generateInvoiceNumber } from "../utils/invoiceNumberGenerator";
import os from "os";

const NUM_PDFS_TO_GENERATE = 100_000; // Change this number for your own testing

// Options for PDF generation
const defaultPdfOptions: PDFOptions = {
  format: "A4",
};

// Initialize Puppeteer Cluster
async function initCluster() {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE, // Use one page context per worker
    maxConcurrency: os.cpus().length, // Adjust based on system capacity
    puppeteerOptions: {
      headless: true,
    },
    timeout: 60000, // Timeout per task
    retryLimit: 3, // Retry failed tasks
    monitor: true
  });

  return cluster;
}

// Define the PDF generation task
async function generatePdfTask(
  { page, data }: { page: Page; data: { html: string; index: number} }
) {
  const { html, index } = data;

  await page.setContent(html);
  await page.createPDFStream({...defaultPdfOptions, path: "pdf-" + index + ".pdf"});
  // await page.pdf({...defaultPdfOptions, path: "pdf-" + index + ".pdf"}); // TODO: See if we can cut down the page height so it only renders 1 page
}

// Main function to process multiple PDFs
async function processPdfs(html: string) {

  const cluster = await initCluster();

  // Define the task for the cluster
  await cluster.task(generatePdfTask);

  // Queue tasks
  for (let i = 0; i < NUM_PDFS_TO_GENERATE; i++) {
    cluster.queue({ html, index: i });
  }

  cluster.on("taskerror", (err, { index }) => {
    console.error(`Task error: ${err.message}, index: ${index}`);
  });
  
  // Wait for all tasks to complete
  await cluster.idle();
  await cluster.close();
}

// Example Usage
(async () => {
    const templateRenderer = new TemplateRenderer();
    const data: TemplateData = {
        title: 'Sample Invoice',
        customerName: 'John Doe',
        date: formatDate(),
        invoiceNumber: generateInvoiceNumber()
      };
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'invoice.hbs');
    const html = await templateRenderer.render(templatePath, data);


    const start = performance.now();
    await processPdfs(html);
    const end = performance.now();
    console.log(`${NUM_PDFS_TO_GENERATE} PDFs generated!`, end - start);

})();


//  npx ts-node src/services/pdfCluster.ts
