import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '../../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    await prisma.$connect();

    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    
    const order = await prisma.order.create({
      data: {
        totalAmount,
        status: 'pending',
        items: JSON.stringify(items),
      }
    });

    // Automatically use Vercel's built-in URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${baseUrl}/cart?success=true`,
      cancel_url: `${baseUrl}/cart?canceled=true`,
      metadata: {
        orderId: order.id,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('💥 CHECKOUT CRASHED 💥', error.message);
    return NextResponse.json({ 
      error: 'Checkout failed', 
      details: error.message 
    }, { status: 500 });
  }
}