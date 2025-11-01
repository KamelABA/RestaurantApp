# Menu Magique - Launch Guide

This project contains multiple applications for a restaurant management system. Here's how to launch all of them.

## Applications Overview

1. **Admin Dashboard** (`Admin-dash/`) - Admin interface for restaurant management
2. **Cashier App** (`Caissier/`) - Cashier interface for order processing
3. **Client App** (`Client/`) - Customer-facing menu application
4. **Cashier App F/B** (`cashier-app/`) - Alternative cashier app with frontend/backend structure
5. **Laravel Backend** (`laravel/`) - PHP Laravel API backend

## Quick Launch Options

### Option 1: Batch File (Windows)
```bash
launch-all.bat
```

### Option 2: PowerShell Script (Windows)
```powershell
.\launch-all.ps1
```

### Option 3: Manual Launch

If you prefer to launch applications manually, use these commands:

#### Admin Dashboard
```bash
cd Admin-dash
npm run dev
```
**URL:** http://localhost:5173

#### Cashier App
```bash
cd Caissier
npm run dev
```
**URL:** http://localhost:5174

#### Client App
```bash
cd Client
npm run dev
```
**URL:** http://localhost:5175

#### Cashier App (Frontend/Backend)
```bash
cd cashier-app
npm run dev
```
**URL:** http://localhost:5176

#### Laravel Backend
```bash
cd laravel
php artisan serve
```
**URL:** http://localhost:8000

## Prerequisites

Before launching, make sure you have:

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **PHP** (v8.2 or higher)
4. **Composer** (for Laravel dependencies)

## Installation

If you haven't installed dependencies yet, run these commands:

```bash
# Install dependencies for all React apps
cd Admin-dash && npm install && cd ..
cd Caissier && npm install && cd ..
cd Client && npm install && cd ..
cd cashier-app && npm install && cd ..

# Install Laravel dependencies
cd laravel && composer install && cd ..
```

## Port Configuration

The applications are configured to run on different ports:
- Admin Dashboard: 5173
- Cashier App: 5174
- Client App: 5175
- Cashier F/B: 5176
- Laravel API: 8000

If any of these ports are already in use, the applications will automatically use the next available port.

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error, the application will automatically try the next available port. Check the terminal output for the actual URL.

### Dependencies Not Found
If you get module not found errors, make sure to run `npm install` in each application directory.

### Laravel Issues
For Laravel-specific issues:
1. Make sure you have PHP installed
2. Run `composer install` in the laravel directory
3. Copy `.env.example` to `.env` and configure your database
4. Run `php artisan key:generate`
5. Run `php artisan migrate`

## Development Workflow

1. Launch all applications using one of the quick launch options
2. Each application will open in a separate terminal window
3. Make changes to your code
4. Applications will automatically reload with hot module replacement
5. Access the applications using the URLs provided in the terminal output

## Stopping Applications

To stop all applications:
1. Close each terminal window
2. Or press `Ctrl+C` in each terminal window
3. Or use `taskkill` to stop all Node.js processes: `taskkill /f /im node.exe`
