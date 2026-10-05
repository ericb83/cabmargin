# Load Profit

A trucking load profitability calculator built with ASP.NET Core Web API and React.

## Tech Stack

- **Backend**: ASP.NET Core 10 Web API (C#)
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: SQL Server (LocalDB for development)
- **ORM**: Entity Framework Core
- **Authentication**: ASP.NET Core Identity + JWT
- **Styling**: Tailwind CSS

## Features

- Calculate load profitability with detailed cost breakdown
- Factor in fuel costs, deadhead miles, tolls, maintenance, and insurance
- View profit margin and rate per mile
- Optional user authentication to save calculations
- Load history for authenticated users

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20.19+](https://nodejs.org/) (or 22.12+)
- [SQL Server LocalDB](https://docs.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb) (included with Visual Studio)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/LoadProfit.API
   ```

2. Run the API (this will automatically apply migrations):
   ```bash
   dotnet run --launch-profile https
   ```

   The API will be available at `https://localhost:7001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Stripe subscriptions

Premium checkout uses Stripe test mode. Keys stay in user secrets, not in `appsettings.json`.

1. In the [Stripe Dashboard](https://dashboard.stripe.com/test/products) (test mode), create a product named Load Profit Premium with two recurring prices:
   - Monthly: $9.99
   - Annual: $79.99
2. Copy each price ID (`price_...`).
3. From `backend/LoadProfit.API`, store the keys:

   ```bash
   dotnet user-secrets set "Stripe:SecretKey" "sk_test_..."
   dotnet user-secrets set "Stripe:PublishableKey" "pk_test_..."
   dotnet user-secrets set "Stripe:MonthlyPriceId" "price_..."
   dotnet user-secrets set "Stripe:AnnualPriceId" "price_..."
   ```

4. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and forward webhooks while the API is running:

   ```bash
   stripe listen --forward-to http://localhost:5000/api/subscription/webhook
   ```

5. Copy the webhook signing secret the CLI prints and save it:

   ```bash
   dotnet user-secrets set "Stripe:WebhookSecret" "whsec_..."
   ```

6. In the Stripe Dashboard, open Settings → Billing → Customer portal and save the default configuration so subscribers can update cards and cancel.

Checkout sends the user to Stripe, then `/subscription/success` confirms the session and marks the account Premium through the end of the Stripe billing period. Renewals, cancellations, and failed payments are applied from webhooks. Canceling keeps Premium until the period ends. The pricing page opens the Stripe Customer Portal for card updates, invoices, and cancellation.

Use test card `4242 4242 4242 4242` with any future expiry and any CVC.

## API Endpoints

### Public Endpoints
- `POST /api/calculate` - Calculate load profitability

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Protected Endpoints (require authentication)
- `GET /api/loads` - Get user's saved loads
- `POST /api/loads` - Save a load calculation
- `DELETE /api/loads/{id}` - Delete a saved load

### Subscription Endpoints
- `GET /api/subscription/pricing` - Public price IDs and whether Stripe is configured
- `GET /api/subscription/status` - Current user's plan
- `POST /api/subscription/create-checkout` - Start a Stripe Checkout session
- `POST /api/subscription/confirm` - Activate Premium after Checkout returns
- `POST /api/subscription/portal` - Open the Stripe Customer Portal
- `POST /api/subscription/cancel` - Cancel at the end of the current period
- `POST /api/subscription/webhook` - Stripe webhook receiver

## Profit Calculation Formula

```
Total Miles = Distance + Deadhead Miles
Fuel Cost = (Total Miles / MPG) × Fuel Price
Operating Costs = (Total Miles × Maintenance/Mile) + (Total Miles × Insurance/Mile) + Tolls + Other
Total Costs = Fuel Cost + Operating Costs
Net Profit = Load Rate - Total Costs
Profit Margin = (Net Profit / Load Rate) × 100
Rate Per Mile = Load Rate / Distance
```

## Project Structure

```
loadprofit/
├── backend/
│   ├── LoadProfit.API/
│   │   ├── Controllers/      # API endpoints
│   │   ├── Data/             # EF Core DbContext
│   │   ├── Models/           # Entity models
│   │   ├── Services/         # Business logic
│   │   └── Program.cs        # App configuration
│   └── LoadProfit.API.sln
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # Auth context
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   └── types/            # TypeScript types
│   └── package.json
└── README.md
```

## Development Notes

- The backend uses SQL Server LocalDB which is automatically created on first run
- JWT tokens expire after 60 minutes (configurable in appsettings.json)
- CORS is configured to allow requests from localhost:5173 and localhost:3000
- The frontend proxies API requests to the backend during development

