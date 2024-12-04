import path from 'path';
import { TemplateRenderer } from './services/templateRenderer';
import { PdfGenerator } from './services/pdfGenerator';
import { TemplateData } from './types';
import { formatDate } from './utils/dateFormatter';
import { generateInvoiceNumber } from './utils/invoiceNumberGenerator';
import { performance } from 'perf_hooks';

async function main(): Promise<void> {
  try {
    // Initialize services
    const templateRenderer = new TemplateRenderer();
    const pdfGenerator = new PdfGenerator();

    // Sample data
    const data: TemplateData = {
      title: 'Sample Invoice',
      customerName: 'John Doe',
      date: formatDate(),
      invoiceNumber: generateInvoiceNumber()
    };
    
    // Render template
    const templatePath = path.join(__dirname, '..', 'templates', 'invoice.hbs');
    const html = await templateRenderer.render(templatePath, data);
    
    // Generate PDF
    const outputPath = path.join(__dirname, '..', 'output.pdf');
    await pdfGenerator.initBrowser();
    const now = performance.now();

    for (let i = 0; i < 1; i++) {
      await pdfGenerator.generatePdf(html, outputPath, i);
    };
    const end = performance.now();

    console.log('PDF generated successfully at:', outputPath, end - now);
    process.exit(0);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

main();