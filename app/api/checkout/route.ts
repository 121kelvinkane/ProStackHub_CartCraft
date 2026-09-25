import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '../../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    console.log('? Step 1: Starting checkout...');
    const body = await req.json();
    const { items } = body;
    console.log('? Step 2: Items received:', items);

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    console.log('? Step 3: Connecting to DB...');
    await prisma.$connect();

    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    console.log('? Step 4: Total amount:', totalAmount);
    
    console.log('? Step 5: Creating order in DB...');
    const order = await prisma.order.create({
      data: {
        totalAmount,
        status: 'pending',
        items: JSON.stringify(items),
      }
    });
    console.log('? Step 6: Order created:', order.id);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log('? Step 7: Base URL:', baseUrl);

    console.log('? Step 8: Creating Stripe session...');
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
    console.log('? Step 9: Stripe session created:', session.id);

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('?? CHECKOUT CRASHED ??');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    return NextResponse.json({ 
      error: 'Checkout failed', 
      details: error.message 
    }, { status: 500 });
  }
}