require('dotenv').config();

const express = require('express');
const Stripe = require('stripe');

const app = express();
const PORT = process.env.PORT || 4242;
const PUBLIC_SITE_URL = (process.env.PUBLIC_SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Server-side catalog: the browser cannot change these prices.
const PRODUCTS = {
  'Life Tee': { price: 32.00 },
  'Night Hoodie': { price: 54.00 },
  'Dreams Sweatpants': { price: 48.00 },
  'Logo Cap': { price: 28.00 },
  'Reset Tee': { price: 32.00 }
};

app.disable('x-powered-by');
app.use(express.static(__dirname));

app.post('/api/create-checkout-session', express.json(), async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured on this server yet.' });
    }

    const cart = Array.isArray(req.body.cart) ? req.body.cart : [];
    if (!cart.length) return res.status(400).json({ error: 'Your cart is empty.' });

    const line_items = cart.map(item => {
      const product = PRODUCTS[item.name];
      const quantity = Number.isInteger(item.quantity) ? item.quantity : 1;

      if (!product || quantity < 1 || quantity > 20) {
        throw new Error('Invalid product or quantity.');
      }

      return {
        quantity,
        price_data: {
          currency: 'usd',
          product_data: { name: item.name },
          unit_amount: Math.round(product.price * 100)
        }
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_creation: 'always',
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['US'] },
      success_url: `${PUBLIC_SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PUBLIC_SITE_URL}/index.html?checkout=cancelled`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Could not start checkout.' });
  }
});

// Used by success.html to verify that the Stripe Checkout session really paid.
app.get('/api/checkout-session', async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ error: 'Stripe is not configured.' });
    const sessionId = String(req.query.session_id || '');
    if (!sessionId || !sessionId.startsWith('cs_')) {
      return res.status(400).json({ error: 'Invalid checkout session.' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json({
      id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email || null,
      amount_total: session.amount_total,
      currency: session.currency
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not verify checkout session.' });
  }
});

// Stripe requires the raw request body for webhook signature verification.
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send('Stripe webhook is not configured.');
  }

  let event;
  try {
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('PAID ORDER:', session.id, session.customer_details?.email || 'no email');
    // Add fulfillment, inventory, database, or order-email logic here when ready.
  }

  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`Two Band 4 Life running on port ${PORT}`);
});
