import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailAuthentication(
    email: string,
    tempPassword: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      from: process.env.USER_EMAIL,
      to: email,
      subject: "임시비밀번호 입니다.",
      html: `<h1>임시 비밀번호는 ${tempPassword}입니다.<h1>`,
    });
  }
}
