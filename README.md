# Two Band 4 Life — Stripe Checkout Storefront

This package contains the complete storefront and Express/Stripe Checkout server.

## Files

- `index.html` — storefront
- `styles.css` — design
- `script.js` — cart and checkout button
- `server.js` — secure server-side Stripe Checkout creation + webhook verification
- `success.html` — verifies the Stripe Checkout session before showing payment confirmation
- `.env.example` — environment-variable template
- `.gitignore` — keeps secrets and dependencies out of Git
- `package.json` — Node dependencies and start command

## Product catalog

- Life Tee — $32
- Night Hoodie — $54
- Dreams Sweatpants — $48
- Logo Cap — $28
- Reset Tee — $32

## Run locally

1. Install Node.js.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Put an authorized business owner's Stripe **test** secret key in `.env`.
6. Set `PUBLIC_SITE_URL=http://localhost:4242`.
7. Run `npm start`.
8. Open `http://localhost:4242`.

Never put Stripe secret keys in `index.html` or `script.js`, and never commit `.env`.

## Deploy

Deploy the folder as a Node/Express web service. Set these environment variables in the hosting provider:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PUBLIC_SITE_URL` — your HTTPS website URL

Start command: `npm start`

## Stripe webhook

Create a Stripe webhook pointing to:

`https://YOUR-DOMAIN/api/stripe-webhook`

Subscribe to `checkout.session.completed`. Put the resulting webhook signing secret in `STRIPE_WEBHOOK_SECRET`.

## Going live

Test the entire checkout flow first with Stripe test mode. Only an authorized adult/business owner should switch the Stripe account and deployment to live keys after confirming the store's products, shipping, refunds, taxes, fulfillment, and required business information are ready.

The product artwork in this starter is placeholder CSS art. Replace it with photos of the actual products before selling them.

Store contact shown on the storefront: prokinggggod@gmail.com.
