import { PDFOptions, PaperFormat } from 'puppeteer';

export interface TemplateData {
  title: string;
  customerName: string;
  date: string;
  invoiceNumber: string;
}

export interface CustomPdfOptions {
  format?: PaperFormat;
  printBackground?: boolean;
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}