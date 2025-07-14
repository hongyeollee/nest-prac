import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { EmailService } from "./mail.service";

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: "smtp.naver.com",
          port: 587,
          secure: false,
          auth: {
            user: process.env.USER_EMAIL, //send email address
            pass: process.env.EMAIL_PASS, //send email password
          },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
  controllers: [],
})
export class EmailModule {}
