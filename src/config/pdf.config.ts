import { CustomPdfOptions } from '../types';

export const defaultPdfOptions: CustomPdfOptions = {
  format: 'a4',
  printBackground: true,
  margin: {
    top: '20px',
    right: '20px',
    bottom: '20px',
    left: '20px'
  }
};