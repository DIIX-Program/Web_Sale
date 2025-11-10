# Web Sale API

Backend API for the Web Sale e-commerce platform.

## Features

- RESTful API with Express.js
- MongoDB with Mongoose
- JWT authentication
- Stripe payment integration
- Cloudinary image upload
- SendGrid email notifications
- Role-based access control
- Rate limiting
- Error handling

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot` - Request password reset
- `POST /api/v1/auth/reset` - Reset password
- `GET /api/v1/auth/me` - Get current user

### Products
- `GET /api/v1/products` - Get products (with filters, pagination)
- `GET /api/v1/products/:id` - Get product by ID
- `GET /api/v1/products/slug/:slug` - Get product by slug
- `GET /api/v1/products/:id/related` - Get related products
- `GET /api/v1/products/categories` - Get all categories

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/my-orders` - Get user's orders
- `GET /api/v1/orders/:id` - Get order by ID

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update profile
- `POST /api/v1/users/me/addresses` - Add address

### Coupons
- `GET /api/v1/coupons/validate` - Validate coupon code

### Admin
- `GET /api/v1/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/v1/admin/dashboard/revenue` - Get revenue chart data
- `GET /api/v1/admin/products` - Get all products (admin)
- `POST /api/v1/admin/products` - Create product
- `PUT /api/v1/admin/products/:id` - Update product
- `DELETE /api/v1/admin/products/:id` - Delete product
- `GET /api/v1/admin/orders` - Get all orders
- `PUT /api/v1/admin/orders/:id/status` - Update order status
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/coupons` - Get all coupons
- `POST /api/v1/admin/coupons` - Create coupon

### Webhooks
- `POST /api/v1/webhooks/stripe` - Stripe webhook handler

## Environment Variables

See `.env.example` for required environment variables.

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Seed database
npm run seed
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Docker

```bash
# Build image
docker build -t web-sale-api .

# Run container
docker run -p 4000:4000 --env-file .env web-sale-api
```

