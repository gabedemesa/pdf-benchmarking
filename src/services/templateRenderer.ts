import { promises as fs } from 'fs';
import Handlebars from 'handlebars';
import { TemplateData } from '../types';

export class TemplateRenderer {
  async render(templatePath: string, data: TemplateData | {}): Promise<string> {
    try {
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(templateContent);
      return template(data);
    } catch (error) {
      throw new Error(`Template rendering failed: ${(error as Error).message}`);
    }
  }
}