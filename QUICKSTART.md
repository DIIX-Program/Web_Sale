# Quick Start Guide

This guide will help you get the Web Sale e-commerce platform up and running quickly.

## Prerequisites

- Node.js 20+ installed
- MongoDB running (local or Atlas)
- npm or yarn package manager

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd web-sale

# Install root dependencies
npm install

# Install backend dependencies
cd apps/api
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Setup Environment Variables

### Backend Environment

Create `apps/api/.env`:

```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/web-sale
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

**Note:** For MongoDB Atlas, use:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/web-sale
```

### Frontend Environment

Create `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

## Step 3: Start MongoDB

### Local MongoDB

```bash
# If MongoDB is installed locally, start it:
mongod
```

### MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Copy the connection string to `MONGO_URI`

## Step 4: Seed the Database

```bash
cd apps/api
npm run seed
```

This will create:
- Admin user: `admin@example.com` / `admin123`
- Test user: `test@example.com` / `test123`
- Sample products
- Sample coupons

## Step 5: Start Development Servers

### Option 1: Start Both Together

From the root directory:

```bash
npm run dev
```

### Option 2: Start Separately

Terminal 1 - Backend:
```bash
cd apps/api
npm run dev
```

Terminal 2 - Frontend:
```bash
cd apps/frontend
npm run dev
```

## Step 6: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Health Check:** http://localhost:4000/health

## Step 7: Test the Application

1. **Browse Products:**
   - Visit http://localhost:3000
   - Browse featured products
   - Click on a product to view details

2. **Create Account:**
   - Click "Login" → "Create account"
   - Register a new user

3. **Add to Cart:**
   - Browse products
   - Click "Add to Cart" on any product
   - View cart by clicking the cart icon

4. **Admin Dashboard:**
   - Login with admin credentials: `admin@example.com` / `admin123`
   - Visit http://localhost:3000/admin
   - View dashboard stats and manage products

## Optional: Stripe Integration

To enable payments:

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test API keys from the dashboard
3. Add to backend `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
4. Add to frontend `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   ```

## Optional: Cloudinary Integration

To enable image uploads:

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloudinary URL from the dashboard
3. Add to backend `.env`:
   ```env
   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## Troubleshooting

### MongoDB Connection Error

- Check if MongoDB is running
- Verify `MONGO_URI` is correct
- For Atlas, check IP whitelist

### Port Already in Use

- Change `PORT` in backend `.env`
- Update `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Module Not Found

- Run `npm install` in the specific app directory
- Delete `node_modules` and `package-lock.json`, then reinstall

### Build Errors

- Clear Next.js cache: `rm -rf apps/frontend/.next`
- Clear node modules: `rm -rf node_modules apps/*/node_modules`
- Reinstall: `npm install`

## Next Steps

- Read the [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions
- Explore the API documentation in `apps/api/README.md`
- Customize the theme in `apps/frontend/tailwind.config.js`

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs in the terminal
3. Check the browser console for frontend errors
4. Open an issue on GitHub

Happy coding! 🚀

