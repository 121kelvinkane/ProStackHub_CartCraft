import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '../../../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  const buf = await req.arrayBuffer();
  const sig = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json({ error: 'No order ID in metadata' }, { status: 400 });
    }

    try {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order || order.status !== 'pending') {
          throw new Error('Order not found or already processed');
        }

        const items = JSON.parse(order.items);

        for (const item of items) {
          const product = await tx.product.findUnique({ where: { id: item.id } });
          if (!product) throw new Error(`Product ${item.id} not found`);
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }
          
          await tx.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } },
          });
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: 'completed' },
        });
      });
      console.log('? Atomic transaction completed successfully! Stock decremented.');
    } catch (error: any) {
      console.error('? Transaction failed:', error.message);
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'failed' },
      });
      return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}