# Next.js + Civic Auth Template

This is a template for building web3 applications with Next.js and Civic Auth authentication.

## Features

- Next.js 15 with App Router
- Civic Auth authentication with Web3 support
- TypeScript support
- Tailwind CSS for styling
- Protected routes with middleware
- Embedded wallet support
- Multi-chain compatibility (Mantle Mainnet & Testnet)
- Modern UI components with Lucide React icons

## Getting Started

### Prerequisites

Before starting, you need a Civic Auth Client ID:

1. Visit [https://auth.civic.com](https://auth.civic.com)
2. Sign up or log in to your account
3. Create a new application to obtain your Client ID
4. Copy the Client ID for use in this integration

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd templateNextCivic
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` and add your Civic Auth Client ID:

   ```
   NEXT_PUBLIC_CIVIC_CLIENT_ID=your_civic_client_id_here
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication

This template uses Civic Auth for authentication with the following features:

### Supported Login Methods

- Email
- Google OAuth
- Wallet connection (Web3)

### Web3 Features

- **Embedded Wallets**: Automatically create Web3 wallets for users
- **Multi-chain Support**: Supports Mantle Mainnet and Testnet
- **Wallet Integration**: Compatible with existing wallets

### Authentication Flow

1. Users visit the login page (`/login`)
2. They can sign in using email, Google, or wallet
3. Once authenticated, they're redirected to the dashboard
4. Protected routes automatically redirect unauthenticated users to login

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── clans/             # Protected clan pages
│   │   └── [clanId]/      # Dynamic clan page
│   ├── login/             # Login page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home/dashboard page
├── components/            # Reusable React components
│   ├── providers/         # Auth and query providers
│   └── ConnectButton.tsx  # Login/logout button
├── lib/                   # Utility functions and data
│   ├── data.ts           # Sample clan data
│   └── types.ts          # TypeScript type definitions
└── middleware.ts          # Route protection middleware
```

## Key Components

### CivicAuthProvider

Located in `src/components/providers/index.tsx`, this wraps the entire app with:

- Civic Auth authentication
- React Query for data fetching
- Wagmi for Web3 functionality
- NuqsAdapter for URL state management

### Middleware

Located in `src/middleware.ts`, provides:

- Route protection for authenticated pages
- Public path configuration
- Automatic redirects for unauthenticated users

### ConnectButton

A reusable component that handles login/logout functionality with loading states.

## Configuration

### Civic Auth Settings

The Civic Auth provider is configured with:

- **Theme**: Light mode with custom accent color
- **Logo**: Custom logo from public assets
- **Login Methods**: Email, Google, and Wallet
- **Web3**: Enabled with Mantle chain support

### Protected Routes

The following routes require authentication:

- `/` (dashboard)
- `/clans/*` (all clan pages)

### Public Routes

These routes are accessible without authentication:

- `/login`
- `/api/*`
- Static assets (`/_next/*`, `/favicon.ico`)

## Customization

### Adding New Chains

To add support for additional blockchain networks, update the chain configuration in `src/components/providers/index.tsx`:

```typescript
const newChain = defineChain({
  id: 1, // Chain ID
  name: "Ethereum Mainnet",
  network: "ethereum",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://eth.rpc.url"] },
  },
});
```

### Modifying Authentication Options

Update the login methods in the Civic Auth configuration:

```typescript
loginMethods: ["email", "google", "wallet", "phone"]; // Add or remove methods
```

### Styling

The template uses Tailwind CSS. Modify styles in:

- `src/app/globals.css` for global styles
- Individual components for component-specific styles
- `tailwind.config.js` for theme customization

## Environment Variables

| Variable                      | Description               | Required |
| ----------------------------- | ------------------------- | -------- |
| `NEXT_PUBLIC_CIVIC_CLIENT_ID` | Your Civic Auth Client ID | Yes      |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

To learn more about the technologies used in this template:

- [Next.js Documentation](https://nextjs.org/docs)
- [Civic Auth Documentation](https://docs.civic.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Wagmi Documentation](https://wagmi.sh)

## Troubleshooting

### Common Issues

1. **Authentication not working**: Ensure your Civic Client ID is correctly set in `.env.local`
2. **Middleware not protecting routes**: Verify `middleware.ts` is in the `src/` directory
3. **Web3 features not working**: Check that you're using `@civic/auth-web3` package
4. **Import errors**: Ensure the `@/*` path mapping points to `./src/*` in `tsconfig.json`

### Getting Help

- Check the [Civic Auth Documentation](https://docs.civic.com)
- Visit the Civic community forums
- Review the example implementation in this template

## License

This template is provided as-is for educational and development purposes.
