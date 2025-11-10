import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('📧 Email would be sent (SendGrid not configured):');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    return;
  }

  try {
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
        name: process.env.SENDGRID_FROM_NAME || 'Web Sale',
      },
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

export const sendOrderConfirmation = async (
  email: string,
  orderId: string,
  orderTotal: number
): Promise<void> => {
  const html = `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order!</p>
    <p>Order ID: ${orderId}</p>
    <p>Total: $${orderTotal.toFixed(2)}</p>
    <p>We'll send you another email when your order ships.</p>
  `;

  await sendEmail(email, 'Order Confirmation', html);
};

export const sendPasswordReset = async (
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const html = `
    <h1>Password Reset</h1>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 1 hour.</p>
  `;

  await sendEmail(email, 'Password Reset', html);
};

