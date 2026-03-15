import Mailgen from 'mailgen';
import { Resend } from 'resend';
import { logger } from '../config/pino.ts';
import type { SendMail } from '../types/types.ts';
import { env } from '../config/env.ts';

const resend = new Resend(env.RESEND_API);

type EmailType =
  | 'verification'
  | 'forgotPassword'
  | 'changePassword'
  | 'accountDeletion'
  | 'orderCreation';

interface EmailConfig {
  intro: string;
  instructions: string;
  buttonText?: string;
  subject: string;
}

const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Verdant',
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
      intro: 'Welcome to Verdant! One last step before you can start shopping.',
      instructions:
        'Click the button below to verify your email address. This link expires in 1 hour.',
      buttonText: 'Verify My Email',
      subject: 'Verify your Verdant account',
    },
    forgotPassword: {
      intro:
        'We received a request to reset the password for your Verdant account.',
      instructions:
        'Click the button below to choose a new password. This link expires in 1 hour and can only be used once.',
      buttonText: 'Reset My Password',
      subject: 'Reset your Verdant password',
    },
    changePassword: {
      intro: 'Your Verdant account password was successfully changed.',
      instructions: 'If this was not you, please contact support',
      subject: 'Your password has been changed',
    },
    accountDeletion: {
      intro: 'Your Verdant account has been permanently deleted.',
      instructions:
        "All your personal data has been removed. Your order history has been retained for legal and accounting purposes. If you didn't request this, please contact our support team immediately.",
      subject: 'Your account has been deleted',
    },
    orderCreation: {
      intro: 'Your order has been confirmed and is being prepared.',
      instructions:
        "Our farmers are already picking your produce. You'll receive another email once your order is on its way.",
      subject: "Order confirmed — we're on it",
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

  await resend.emails.send({
    from: 'Verdant <onboarding@resend.dev>',
    to: [user.email],
    subject: config.subject,
    html: emailBody,
    text: emailText,
  });

  logger.info({ email: user.email, type }, 'Email sent successfully');
};
