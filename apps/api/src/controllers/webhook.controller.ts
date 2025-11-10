import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.model';
import Invoice from '../models/Invoice.model';
import { sendOrderConfirmation } from '../utils/email';
import { AppError } from '../middleware/errorHandler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export const handleStripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sig = req.headers['stripe-signature'];

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send('Webhook signature missing');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(failedPayment);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: error.message });
  }
};

const handlePaymentSuccess = async (paymentIntent: Stripe.PaymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    console.error('Order ID not found in payment intent metadata');
    return;
  }

  const order = await Order.findById(orderId).populate('userId');

  if (!order) {
    console.error('Order not found:', orderId);
    return;
  }

  order.paymentStatus = 'paid';
  order.orderStatus = 'processing';
  await order.save();

  // Create invoice automatically
  try {
    const invoiceItems = order.items.map((item) => ({
      name: item.title,
      quantity: item.quantity,
      price: item.price,
    }));

    await Invoice.create({
      user: order.userId,
      orderId: order._id,
      amount: order.total,
      items: invoiceItems,
      status: 'paid',
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
    });
    console.log('✅ Invoice created for order:', orderId);
  } catch (error) {
    console.error('Error creating invoice:', error);
  }

  // Send confirmation email
  if (order.userId && typeof order.userId === 'object' && 'email' in order.userId) {
    try {
      await sendOrderConfirmation(
        (order.userId as any).email,
        order._id.toString(),
        order.total
      );
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  }
};

const handlePaymentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    return;
  }

  const order = await Order.findById(orderId);

  if (order) {
    order.paymentStatus = 'failed';
    await order.save();
  }
};

