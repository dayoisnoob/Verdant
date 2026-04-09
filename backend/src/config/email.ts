import Mailgen from 'mailgen';
import { Resend } from 'resend';
import { logger } from './logger.ts';
import { env } from './env.ts';

export interface SendMail {
  firstName: string;
  email: string;
}

const resend = new Resend(env.RESEND_API);

type EmailType =
  | 'verification'
  | 'forgotPassword'
  | 'changePassword'
  | 'accountDeletion'
  | 'orderCreation';

interface EmailConfig {
  subject: string;
  intro: string | string[];
  instructions?: string;
  buttonText?: string;
  buttonColor?: string;
  outro?: string;
}

const mailGenerator = new Mailgen({
  theme: 'cerberus',
  product: {
    name: 'Verdant',
    link: env.FRONTEND_URL!,
    copyright: `© ${new Date().getFullYear()} Verdant Ltd.`,
  },
});

export const sendMail = async (
  user: SendMail,
  link: string,
  type: EmailType = 'verification'
): Promise<void> => {
  const emailConfig: Record<EmailType, EmailConfig> = {
    verification: {
      subject: 'Welcome to Verdant! 🌱 Verify your email',
      intro:
        'Welcome to Verdant! We are thrilled to have you on board. Just one last step before you can start shopping for farm-fresh produce.',
      instructions:
        'Click the secure button below to verify your email address. This link will expire in 1 hour.',
      buttonText: 'Verify Email Address',
      buttonColor: '#2D6A4F',
    },
    forgotPassword: {
      subject: 'Reset your Verdant password',
      intro:
        'We received a request to reset the password for your Verdant account.',
      instructions:
        'Click the button below to safely choose a new password. This link expires in 1 hour and can only be used once.',
      buttonText: 'Reset My Password',
      buttonColor: '#2D6A4F',
      outro:
        'If you did not request a password reset, you can safely ignore this email. Your account remains secure.',
    },
    changePassword: {
      subject: 'Security Alert: Your password was changed',
      intro: [
        'Your Verdant account password was successfully updated.',
        'You can now use your new password to log in to your account.',
      ],
      instructions:
        'If you did not make this change, please secure your account immediately.',
      buttonText: 'Contact Support',
      buttonColor: '#EF4444',
    },
    accountDeletion: {
      subject: 'Your account has been securely deleted',
      intro: [
        'Your Verdant account has been permanently deleted.',
        'All your personal data has been securely wiped from our active systems. Note: Your past order history has been retained strictly for legal and accounting purposes.',
      ],
      outro:
        "We're sorry to see you go. If you change your mind, we'd love to welcome you back anytime.",
    },
    orderCreation: {
      subject: "Order confirmed — we're on it 🚜",
      intro: [
        'Your order has been confirmed and is currently being prepared!',
        'Our partner farmers are getting your produce ready. We will ensure everything is packed securely and picked at peak freshness.',
      ],
      instructions:
        'You will receive another update as soon as your order leaves the farm.',
      buttonText: 'Track Order',
      buttonColor: '#2D6A4F',
    },
  };

  const config = emailConfig[type];

  if (!config) {
    logger.error(`Invalid email type ${type}`);
    return;
  }

  const action = config.buttonText
    ? {
        instructions: config.instructions ?? '',
        button: {
          color: config.buttonColor || '#2D6A4F',
          text: config.buttonText,
          link,
        },
      }
    : undefined;

  const email = {
    body: {
      name: user.firstName,
      intro: config.intro,
      ...(action && { action }),
      outro:
        config.outro ||
        'Have questions about your harvest? Just reply to this email—our support team is always here to help.',
    },
  };

  const emailBody = mailGenerator.generate(email);
  const emailText = mailGenerator.generatePlaintext(email);

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [user.email],
    subject: config.subject,
    html: emailBody,
    text: emailText,
  });

  logger.info({ email: user.email, type }, 'Email sent successfully');
};
