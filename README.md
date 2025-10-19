<img width="1360" height="255" alt="Image" src="https://github.com/user-attachments/assets/f6a5a4fe-6a44-4493-9d36-aa592e37e529" />

**On The Dot**

🌐 https://www.onthedot.live/ 🌐

Hackathon project for ETHRome 2025 - it’s a way to seamlessly set up deposits for in-person sessions, using NFC chips.

Polkadot Hub TestNet - contract:
https://github.com/deca12x/OnTheDot-contracts

Tech Stack:

- Nextjs webapp (make contract calls from frontend, simple, not secured, optimised for mobile view)
- Contract deployed on Polkadot Hub TestNet (Polkadot parachain that is EVM) https://docs.polkadot.com/develop/smart-contracts/connect-to-polkadot/
- Privy Auth (embedded wallet) https://www.privy.io/
- Storage is on a file called storage.json and on the contract (no db)
- Polkadot Hardhat framework https://docs.polkadot.com/develop/smart-contracts/dev-environments/hardhat/

Polkadot Bounty Details:

Smart Contract dApp Development on PAsset Hub testnet - $3400

**Objective**: Encourage the creation of innovative smart contracts using Solidity, deployed natively on Polkadot. You can check our [Idea Pool](https://www.morekudos.com/explore/certified-open-contributions-level-smart-contract) for inspiration for the projects.

In this edition of ETHRome, we would like to emphasise the use of precompiles in the PVM environment. [You can check more about precompiles and PVM](https://docs.polkadot.com/develop/smart-contracts/precompiles/). Polkadot architecture opens **a new type of smart contracts** - using the same Solidity you can communicate with other rollups ( and bridges too ) - with [XCM precompile](https://docs.polkadot.com/develop/smart-contracts/precompiles/xcm-precompile/).

**Prize Pool**: 3,400 USDC

- Base: 3 Prizes ( equal amounts )
- Bonus: +$25 for X post with tags
- Bonus: +$25 for developer feedback - performance of the app, cost, ease of deployment, etc - 50-150 words
- Raffle: 100 DOT for all feedback submissions

**✅ Submission checklist**

1. Working Deployment

- Link to the MVP deployment at PAsset Hub testnet on subscan
- Smart contracts deployed need to be original
- Core features must be functional
- Including a MVP frontend is necessary

2. Product value

- Described user experience and potential impact within the Polkadot ecosystem
- Use of precompiles will grant bonus points during judging

3. Project Documentation

- Project description ( max 100 words )
- Setup instructions
- It is encouraged to pitch the project to the judges. The pitch should take 5 min max. Please use this time wisely, as the judges have probably gone over the documentation and/or the video, so please provide context and extra information

Flow:

1. When the user signs up to an event (workshop / bootcamp / presentation / meetup / happy hour) they pay a small deposit.
2. When the user enters the venue on the day, they find an NFC chip - they tap the chip to seamlessly redeem their deposit.

Technical Flow of Page 1 “Join Event Form”

1. User goes to page 1 (main domain)
2. Login with Privy Auth
3. Fill in form
   1. Name
   2. GitHub / GitLab / dev portfolio link
   3. Have you used Substrate or Polkadot before? (Yes / No)
   4. Which of these have you used?
      ☐ ink! ☐ EVM / Solidity ☐ PolkaVM ☐ XCM ☐ Polkadot.js API
      How familiar are you with precompiles on Polkadot? (1-5 scale)
   5. pay 1 DOT deposit (actual payment to our smart contract via function deposit)
4. Submit form (atomic, need deposit tx receipt, then save to db) - Store user info on DB
5. Confirmation screen (shows a visual of a phone tapping a sticker, which says “Tap chip at the venue to redeem deposit”)

Technical Flow of Page 2 “Redeem Deposit”

1. When user taps chip, it goes to the URL (main domain /redeem)
2. Reads the user’s wallet address, then checks on contract - if user’s wallet address is in list of EOA addresses who paid deposit
3. If the address is in the list, returns deposit to EOA address
4. Confirmation screen “Deposit Redeemed”

Smart contract:

1. store global list of people who paid (empty at contract deployment)
2. store admin wallet address (input in constructor)
3. function deposit()
   - sends 1 DOT to smart contract
   - adds user’s EOA address to global list of people who paid
4. function redeem()
   - if user in global list of people who paid AND time is < 19th Oct 2025 at 13:00, then
     - removes user from global list of people who paid
     - sends 1 DOT to user
   - else send all funds in contract to admin wallet address

Page 1 UI (base domain):

- If user is not authenticated, this page shows only one button - “Log in”
- If user is authenticated AND user EOA Address is not in JSON Storage, this page shows the form with questions and a “Confirm and Send Deposit” button. Clicking the button displays the confirmation page with text “
  1. Name
  2. GitHub / GitLab / dev portfolio link
  3. Have you used Substrate or Polkadot before? (Yes / No)
  4. Which of these have you used?
     ☐ ink! ☐ EVM / Solidity ☐ PolkaVM ☐ XCM ☐ Polkadot.js API
     How familiar are you with precompiles on Polkadot? (1-5 scale)
  5. pay 1 DOT deposit (actual payment to our smart contract via function deposit)
- Else, show confirmation page - just text saying “Tap chip at the venue to redeem deposit”

Page 2 UI (base domain /redeem):

- If user is not authenticated, this page shows only one button - “Log in”
- If user is authenticated AND user EOA Address is not in JSON Storage, this page shows confirmation page - just text saying “No deposit to withdraw”
- If user is authenticated AND user EOA Address is in JSON Storage, this page shows a blank page with just text saying “Redeeming your deposit”… then once we receive tx receipt, change the text to “Deposit Successfully redeemed” and link to block explorer.

JSON Storage:

All these things are stored in a json object in a file (only after the user has successfully paid deposit)

1. Name
2. GitHub / GitLab / dev portfolio link
3. Have you used Substrate or Polkadot before? (Yes / No)
4. Which of these have you used?
   ☐ ink! ☐ EVM / Solidity ☐ PolkaVM ☐ XCM ☐ Polkadot.js API
   How familiar are you with precompiles on Polkadot? (1-5 scale)
5. EOA Address

Contract Storage:

1. EOA Addresses
2. Admin EOA Address
