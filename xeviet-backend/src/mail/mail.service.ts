import { Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  async sendOtpEmail(to: string, otp: string, expiresMinutes: number) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: "Chợ Xe - Mã xác thực OTP",
        template: "./otp", // trỏ tới templates/otp.hbs
        context: {
          appName: "Chợ Xe",
          otp,
          expiresMinutes,
        },
      });
    } catch (err) {
      this.logger.error(`Gửi OTP thất bại cho ${to}`, err as Error);
    }
  }
}
