import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { config } from '../config';
import { TemplateService, WelcomeEmailData } from './template.service';

@Injectable()
export class EmailService {
  private readonly resend: Resend | null;
  private readonly templateService: TemplateService;

  constructor() {
    this.templateService = new TemplateService();
    if (config.resend.apiKey) {
      this.resend = new Resend(config.resend.apiKey);
    } else {
      this.resend = null;
      console.warn('RESEND_API_KEY not configured. Email functionality will be disabled.');
    }
  }

  async sendWelcomeEmail(email: string, name: string, options?: Partial<WelcomeEmailData>): Promise<void> {
    if (!this.resend) {
      console.warn('Cannot send email: Resend not configured');
      return;
    }

    try {
      const emailData: WelcomeEmailData = {
        name,
        companyName: 'Sistema de Gestão Corporativa',
        systemUrl: process.env.FRONTEND_URL || '#',
        supportEmail: config.resend.emailFrom!,
        ...options,
      };

      const htmlContent = this.templateService.renderWelcomeEmail(emailData);
      const subject = this.templateService.renderWelcomeSubject({
        name,
        companyName: emailData.companyName,
      });

      const response = await this.resend.emails.send({
        from: config.resend.emailFrom!,
        to: [email],
        subject,
        html: htmlContent,
      });

      // Verificar se houve erro na resposta
      if (response.error) {
        throw new Error(`Resend API Error: ${response.error.message} - ${response.error.name}`);
      }

      console.log(`Welcome email sent successfully to ${email}. Message ID: ${response.data.id}`);
    } catch (error) {
      console.error(`Failed to send welcome email to ${email}:`, error);
      // Não relançar o erro para não bloquear o registro do usuário
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      console.warn('Cannot send email: Resend not configured');
      return;
    }

    try {
      const response = await this.resend.emails.send({
        from: config.resend.emailFrom!,
        to: [to],
        subject,
        html,
      });

      // Verificar se houve erro na resposta
      if (response.error) {
        throw new Error(`Resend API Error: ${response.error.message} - ${response.error.name}`);
      }

      console.log(`Email sent successfully to ${to}. Message ID: ${response.data.id}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}
