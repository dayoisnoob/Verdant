import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';
import { logger } from '../config/pino.ts';
import type { SendMail } from '../types/types.ts';

type EmailType = 'verification' | 'forgotPassword' | 'changePassword';

interface EmailConfig {
  intro: string;
  instructions: string;
  buttonText?: string;
  subject: string;
}

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: +process.env.EMAIL_PORT!,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Nova Store',
    link: process.env.FRONTEND_URL!,
  },
});

export const sendMail = async (
  user: SendMail,
  link: string,
  type: EmailType = 'verification'
): Promise<void> => {
  const emailConfig: Record<EmailType, EmailConfig> = {
    verification: {
      intro: "Welcome to Nova Store! We're very excited to have you on board.",
      instructions: 'Please click the button below to verify your email',
      buttonText: 'Verify Email',
      subject: 'Email verification',
    },
    forgotPassword: {
      intro: 'We received a request to reset your password',
      instructions: 'Please click the button below to reset your password',
      buttonText: 'Reset Password',
      subject: 'Reset Your Password',
    },
    changePassword: {
      intro: 'Your password was changed',
      instructions: 'If this was not you, please contact support',
      subject: 'Password was changed',
    },
  };

  const config = emailConfig[type];

  if (!config) {
    logger.error(`Invalid email type ${type}`);
    return;
  }

  const button = config.buttonText
    ? {
        color: '#22BC66',
        text: config.buttonText ?? '',
        link,
      }
    : undefined;

  const email = {
    body: {
      name: user.firstName,
      intro: config.intro,
      ...(button && {
        action: {
          instructions: config.instructions,
          button,
        },
      }),
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  const emailBody = mailGenerator.generate(email);
  const emailText = mailGenerator.generatePlaintext(email);

  try {
    await transport.sendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: config.subject,
      html: emailBody,
      text: emailText,
    });
    logger.info({ email: user.email, type }, 'Email sent successfully');
  } catch (error) {
    logger.error({ error, email: user.email, type }, 'Failed to send email');
  }
};
