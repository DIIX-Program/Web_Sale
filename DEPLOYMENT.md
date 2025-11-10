# Deployment Guide

This guide explains how to deploy the Web Sale e-commerce platform.

## Prerequisites

- MongoDB Atlas account (or self-hosted MongoDB)
- Stripe account
- Cloudinary account (optional, for image uploads)
- SendGrid account (optional, for email notifications)
- Domain name (optional)
- VPS/Cloud hosting (for backend) or use serverless options

## Backend Deployment

### Option 1: Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the root directory to `apps/api`
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables (see `.env.example`)
7. Deploy

### Option 2: Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Add a new service from GitHub repo
4. Set the root directory to `apps/api`
5. Add environment variables
6. Deploy

### Option 3: DigitalOcean App Platform

1. Create a new app on DigitalOcean
2. Connect your GitHub repository
3. Select the `apps/api` directory
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

### Option 4: Docker

```bash
# Build image
docker build -t web-sale-api ./apps/api

# Run container
docker run -p 4000:4000 --env-file apps/api/.env web-sale-api
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set the root directory to `apps/frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
5. Deploy

### Option 2: Netlify

1. Create a new site on Netlify
2. Connect your GitHub repository
3. Set build command: `cd apps/frontend && npm install && npm run build`
4. Set publish directory: `apps/frontend/.next`
5. Add environment variables
6. Deploy

### Option 3: Docker

```bash
# Build image
docker build -t web-sale-frontend ./apps/frontend

# Run container
docker run -p 3000:3000 --env-file apps/frontend/.env.local web-sale-frontend
```

## Database Setup

### MongoDB Atlas

1. Create a free cluster on MongoDB Atlas
2. Create a database user
3. Whitelist your deployment IP addresses
4. Get the connection string
5. Update `MONGO_URI` in backend environment variables

### Self-hosted MongoDB

1. Install MongoDB on your server
2. Configure authentication
3. Update `MONGO_URI` in backend environment variables

## Environment Variables

### Backend (.env)

```env
PORT=4000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/web-sale
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SENDGRID_API_KEY=SG.xxxxx
FRONTEND_URL=https://your-domain.com
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

## Stripe Webhook Setup

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://api.your-domain.com/api/v1/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook secret
5. Add to backend environment variables as `STRIPE_WEBHOOK_SECRET`

## SSL Certificate

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Using Cloudflare

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption
4. Set SSL mode to "Full"

## Docker Compose (Full Stack)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Monitoring

### Health Checks

- Backend: `https://api.your-domain.com/health`
- Frontend: `https://your-domain.com`

### Logs

- Backend: Check your hosting platform's logs
- Frontend: Check Vercel/Netlify logs

## Backup Strategy

### Database Backup

```bash
# MongoDB Atlas automatically backs up your database
# For self-hosted, use mongodump:

mongodump --uri="mongodb://user:password@host:27017/web-sale" --out=/backup
```

### Environment Variables Backup

- Store environment variables in a password manager
- Use secrets management services (AWS Secrets Manager, HashiCorp Vault)

## Troubleshooting

### Backend not connecting to database

- Check `MONGO_URI` is correct
- Verify IP whitelist in MongoDB Atlas
- Check network connectivity

### Frontend can't connect to backend

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Verify backend is running and accessible

### Stripe webhooks not working

- Verify webhook URL is correct
- Check webhook secret is set correctly
- Verify SSL certificate is valid
- Check webhook logs in Stripe dashboard

## Security Checklist

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Regularly update dependencies
- [ ] Monitor for security vulnerabilities
- [ ] Set up backup strategy

## Support

For issues and questions, please open an issue on GitHub.

