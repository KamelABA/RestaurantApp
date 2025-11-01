# Cashier Application

A modern TypeScript React application for restaurant cashier management with Laravel backend.

## Features

- **Table Management**: Assign tables to customers, track occupancy status
- **Order Management**: Create, modify, and cancel orders
- **Payment Processing**: Handle payments with multiple methods (cash, card, mobile)
- **Real-time Notifications**: Get notified of new orders, modifications, and cancellations
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication

### Backend (Laravel)
- **Laravel 11** with PHP 8.2+
- **MySQL/PostgreSQL** database
- **RESTful API** endpoints
- **Eloquent ORM** for database operations

## Project Structure

```
cashier-app/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # Reusable UI components
│   │   │   └── CashierInterface.tsx
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── package.json
└── backend/                # Laravel backend (to be created)
    ├── app/
    ├── database/
    ├── routes/
    └── composer.json
```

## Getting Started

### Frontend Development

1. Navigate to the frontend directory:
   ```bash
   cd cashier-app/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3001`

### Backend Development

1. Navigate to the backend directory:
   ```bash
   cd cashier-app/backend
   ```

2. Install dependencies:
   ```bash
   composer install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Generate application key:
   ```bash
   php artisan key:generate
   ```

5. Configure your database in `.env`

6. Run migrations:
   ```bash
   php artisan migrate
   ```

7. Start the development server:
   ```bash
   php artisan serve
   ```

## API Endpoints

The application expects the following Laravel API endpoints:

### Tables
- `GET /api/tables` - Get all tables
- `PUT /api/tables/{id}/assign` - Assign table to customer

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}/confirm` - Confirm order
- `DELETE /api/orders/{id}` - Cancel order

### Payments
- `POST /api/payments` - Process payment

### Notifications
- `GET /api/notifications` - Get all notifications

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend (.env)
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cashier_app
DB_USERNAME=root
DB_PASSWORD=

CORS_ALLOWED_ORIGINS=http://localhost:3001
```

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
