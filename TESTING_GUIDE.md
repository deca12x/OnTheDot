# OnTheDot Testing Guide

## Contract Integration Complete! ✅

All three contract functions have been integrated with ethers.js:

1. ✅ **deposit()** - Integrated in signup form
2. ✅ **hasDeposited()** - Integrated in /redeem page
3. ✅ **redeem()** - Integrated in /redeem page

## Implementation Summary

### Contract Configuration (`src/lib/contract.ts`)

- **Contract Address**: `0xd2BF62cCA0b8330c50ee87342C4aAcc3664E4D43`
- **RPC URL**: `https://testnet-passet-hub-eth-rpc.polkadot.io`
- **Chain ID**: 420420422
- **Block Explorer**: https://blockscout-passet-hub.parity-testnet.parity.io

### Page 1: Main Page (/) - Registration Flow

**Flow:**
1. **Page 1a** - Shows Civic login button if not authenticated
2. **Page 1b** - Shows registration form after authentication
3. **Page 1c** - Shows confirmation after successful deposit

**Implementation** (`src/app/page.tsx`):
- Form submission calls `makeDeposit()` from contract library
- Waits for transaction receipt
- **Only saves to storage.json AFTER tx receipt is received** (atomic operation)
- Shows transaction hash on confirmation screen
- Button text: "Complete Registration & Pay 1 PAS Deposit"

### Page 2: Redeem Page (/redeem) - Redemption Flow

**Flow:**
1. User taps NFC sticker → redirected to `/redeem`
2. Checks if user is authenticated (Civic)
3. Checks if user's EOA address has deposited using `hasDeposited()`
4. If yes, automatically calls `redeem()` function
5. Shows confirmation screen with transaction receipt

**Implementation** (`src/app/redeem/page.tsx`):
- Checks on-chain deposit status using `checkHasDeposited(walletAddress)`
- Verifies against depositors list in smart contract
- Auto-initiates redemption if deposit found
- Shows transaction hash on success screen

## Testing Instructions

### Prerequisites

1. **Install MetaMask** (or compatible Web3 wallet)
2. **Add Polkadot Hub TestNet** to MetaMask:
   - Network Name: Polkadot Hub TestNet
   - RPC URL: https://testnet-passet-hub-eth-rpc.polkadot.io
   - Chain ID: 420420422
   - Currency Symbol: PAS
   - Block Explorer: https://blockscout-passet-hub.parity-testnet.parity.io

3. **Get Testnet Tokens**:
   - Go to: https://faucet.polkadot.io/
   - Request PAS tokens for your wallet address

### Test 1: Deposit Function

**Steps:**
1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Click "Connect" to authenticate with Civic

4. Fill out the registration form

5. Click "Complete Registration & Pay 1 PAS Deposit"

6. **MetaMask will pop up** asking you to:
   - Confirm you're on Polkadot Hub TestNet (Chain ID: 420420422)
   - Approve the transaction (1 PAS + gas)

7. Wait for transaction confirmation

8. **Expected Result:**
   - See confirmation screen (Page 1c)
   - Transaction hash displayed
   - Data saved to `storage.json` (check root directory)
   - Can click tx hash to view on BlockScout

**Verify on BlockScout:**
```
https://blockscout-passet-hub.parity-testnet.parity.io/address/0xd2BF62cCA0b8330c50ee87342C4aAcc3664E4D43
```
- Should see your deposit transaction
- Check "Read Contract" → `hasDeposited(your_address)` → should return `true`

### Test 2: hasDeposited Function

**Steps:**
1. After completing Test 1, open a **new incognito window**

2. Navigate to http://localhost:3000/redeem

3. Connect with the **same wallet** you used for deposit

4. **Expected Result:**
   - Page automatically detects your deposit
   - Shows "Redeeming your deposit..." loading screen
   - This proves `hasDeposited()` is working correctly

**Verify Manually:**
You can also test the read function directly:
```typescript
// In browser console:
const { checkHasDeposited } = await import('/src/lib/contract.ts');
await checkHasDeposited('YOUR_WALLET_ADDRESS');
// Should return: true
```

### Test 3: Redeem Function

**Steps:**
1. Continue from Test 2 (or navigate to `/redeem` after depositing)

2. Page will auto-call the redeem function

3. **MetaMask will pop up** asking you to confirm the redeem transaction

4. Approve the transaction

5. Wait for confirmation

6. **Expected Result:**
   - See success screen: "Deposit Successfully Redeemed! 🎉"
   - Transaction hash displayed
   - 1 PAS returned to your wallet (minus gas fees)

**Verify on BlockScout:**
```
https://blockscout-passet-hub.parity-testnet.parity.io/address/0xd2BF62cCA0b8330c50ee87342C4aAcc3664E4D43
```
- Should see your redeem transaction
- Check "Read Contract" → `hasDeposited(your_address)` → should return `false`
- Contract balance should be reduced by 1 PAS

### Test 4: Before Deadline Verification

**Steps:**
1. Try to access `/redeem` again after redeeming

2. **Expected Result:**
   - Shows "No Deposit to Withdraw" error screen
   - Confirms you've already redeemed

### Full User Flow Test

**Test the complete flow as a user would experience it:**

1. **Registration:**
   - Visit homepage
   - Connect wallet with Civic Auth
   - Fill form
   - Pay 1 PAS deposit
   - See confirmation

2. **At Event:**
   - Tap NFC sticker (simulated by visiting `/redeem`)
   - Wallet prompts to sign transaction
   - Receive 1 PAS back
   - See welcome message

## Troubleshooting

### "Wrong network" error
**Solution:** Switch MetaMask to Polkadot Hub TestNet (Chain ID: 420420422)

### "Insufficient funds" error
**Solution:** Get more PAS from the faucet: https://faucet.polkadot.io/

### "Transaction rejected" error
**Solution:** User cancelled the transaction in MetaMask. Try again.

### "Must send exactly 1 DOT" error
**Solution:** This shouldn't happen as we fetch the amount from contract. Check contract connection.

### "No deposit found" error
**Solution:** User hasn't made a deposit yet. Direct them to register first.

## Checking Contract State

### Via BlockScout (Browser)

1. Go to: https://blockscout-passet-hub.parity-testnet.parity.io/address/0xd2BF62cCA0b8330c50ee87342C4aAcc3664E4D43

2. Click "Read Contract" tab

3. Check these values:
   - `admin()` → Should be your deployer address
   - `DEPOSIT_AMOUNT()` → Should be 1000000000000000000 (1 PAS)
   - `REDEMPTION_DEADLINE()` → Unix timestamp
   - `hasDeposited(address)` → true/false for any address
   - `depositors(0)` → First depositor address

### Via Contract Library (Code)

```typescript
import { getContractInfo, checkHasDeposited } from '@/lib/contract';

// Get contract details
const info = await getContractInfo();
console.log('Admin:', info.admin);
console.log('Deposit Amount:', info.depositAmount, 'PAS');
console.log('Deadline:', info.deadlineDate);

// Check if address deposited
const hasDeposited = await checkHasDeposited('0x...');
console.log('Has deposited:', hasDeposited);
```

## Expected Gas Costs

**Approximate gas costs on Polkadot Hub TestNet:**
- **deposit()**: ~50,000-100,000 gas
- **redeem()**: ~50,000-100,000 gas
- **hasDeposited()**: Free (read-only)

## Files Modified

### New Files Created:
- `src/lib/contract.ts` - Contract integration library with ethers.js

### Files Modified:
- `src/app/page.tsx` - Added real deposit function
- `src/app/redeem/page.tsx` - Added hasDeposited check and redeem function
- `package.json` - Added ethers.js dependency

## Next Steps

After successful testing:

1. **Deploy to production** with the same contract address
2. **Set up NFC stickers** to redirect to `/redeem`
3. **Monitor transactions** on BlockScout
4. **After event deadline**, admin can call `redeem()` to withdraw unclaimed deposits

## Contract Functions Reference

### Write Functions (Require Gas)

```typescript
// Make a deposit (sends 1 PAS)
const result = await makeDeposit();
// Returns: { success: true, txHash: '0x...', receipt: {...} }

// Redeem deposit (before deadline)
const result = await redeemDeposit();
// Returns: { success: true, txHash: '0x...', receipt: {...} }
```

### Read Functions (Free)

```typescript
// Check if user has deposited
const hasDeposited = await checkHasDeposited(userAddress);
// Returns: boolean

// Get contract information
const info = await getContractInfo();
// Returns: { admin, depositAmount, deadline, deadlineDate }
```

## Support

If you encounter any issues during testing:

1. Check the browser console for error messages
2. Verify you're on the correct network (Chain ID: 420420422)
3. Ensure you have enough PAS tokens
4. Check the contract on BlockScout to verify state
5. Try with a fresh wallet address if issues persist

## Success Criteria

✅ **Deposit Function Works**: User can make a 1 PAS deposit and see tx confirmation
✅ **hasDeposited Works**: /redeem page correctly identifies depositors
✅ **Redeem Function Works**: User can redeem before deadline and get PAS back
✅ **Atomic Storage**: Data only saves to storage.json after successful deposit
✅ **Transaction Links**: All tx hashes link to BlockScout correctly
