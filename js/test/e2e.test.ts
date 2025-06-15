import { 
    AccountWalletWithSecretKey, 
    AztecAddress, 
    Fr, 
    PXE, 
    SponsoredFeePaymentMethod,
    Note,
    ExtendedNote,
    computeSecretHash,
    createPXEClient,
    Contract
} from "@aztec/aztec.js";  // Changed from @aztec/accounts
import { getDeployedTestAccountsWallets } from '@aztec/accounts/testing';
import { TokenContract } from '@aztec/noir-contracts.js/Token';
import { VeilPaymentContract } from '../src/artifacts/VeilPayment.js';


// ... rest of the test file remains the same ...
const PXE_URL = "http://localhost:8080";

describe('VeilPayment Contract Test', () => {
    let depositer: AccountWalletWithSecretKey;
    let issuer: AccountWalletWithSecretKey;
    let veilPayment: VeilPaymentContract;
    let fpc: SponsoredFeePaymentMethod;
    let pxe: PXE;
    let token: TokenContract;

    beforeAll(async () => {
        console.log('🚀 Setting up test environment...');
        pxe = createPXEClient(PXE_URL);
        [depositer, issuer] = await getDeployedTestAccountsWallets(pxe);
        console.log('📝 Test accounts initialized:', {
            depositer: depositer.getAddress().toString(),
            issuer: issuer.getAddress().toString()
        });

        fpc = new SponsoredFeePaymentMethod(await getDeployedSponsoredFPCAddress(pxe));
        console.log('💸 Fee Payment Contract initialized');
        
        // Deploy token contract
        console.log('🪙 Deploying token contract...');
        const tokenContract = await Contract.deploy(depositer, TokenContract.artifact, [
            depositer.getAddress(),
            'TestToken',
            'TTK',
            18
        ]).send().deployed();
        token = await TokenContract.at(tokenContract.address, depositer);
        console.log('✅ Token contract deployed at:', token.address.toString());
        
        // Deploy VeilPayment contract
        console.log('🔒 Deploying VeilPayment contract...');
        veilPayment = await VeilPaymentContract.deploy(depositer, depositer.getAddress(), issuer.getAddress())
            .send()
            .deployed();
        console.log('✅ VeilPayment contract deployed at:', veilPayment.address.toString());
    });

    it('should allow deposit', async () => {
        console.log('\n💰 Testing deposit functionality...');
        const amount = 100n;
        const secret = Fr.random();
        const secretHash = computeSecretHash(secret);
        console.log('📊 Test values:', { amount: amount.toString(), secretHash: secretHash.toString() });

        // Mint tokens to depositer
        console.log('🪙 Minting tokens to depositer...');
        await token.methods.mint_to_private(
            depositer.getAddress(), // from
            depositer.getAddress(), // to
            amount                  // amount
        ).send().wait();
        console.log('✅ Tokens minted successfully');

        // Check initial balances
        const initialBalPriv = await token.methods.balance_of_private(depositer.getAddress()).simulate();
        const initialBalPub = await token.methods.balance_of_public(depositer.getAddress()).simulate();
        console.log('📊 Initial balances:', {
            private: initialBalPriv.toString(),
            public: initialBalPub.toString()
        });
        
        // Add the note to depositer's wallet
        console.log('📝 Adding note to depositer wallet...');
        const note = new Note([new Fr(amount), secretHash]);
        await depositer.addNote(
            new ExtendedNote(
                note,
                depositer.getAddress(),
                token.address,
                TokenContract.storage.pending_shields.slot,
                TokenContract.notes.TransparentNote.id,
                Fr.random()
            )
        );
        console.log('✅ Note added successfully');

        // Redeem the shield
        console.log('🔄 Redeeming shield...');
        await token.methods.redeem_shield(depositer.getAddress(), amount, secret).send().wait();
        console.log('✅ Shield redeemed successfully');

        // Deposit to VeilPayment
        console.log('💸 Depositing to VeilPayment contract...');
        await veilPayment.withWallet(depositer)
            .methods
            .public_dispatch(new Fr(1)) // deposit selector
            .send()
            .wait();
        console.log('✅ Deposit successful');

        // Check final balances
        const finalBalPriv = await token.methods.balance_of_private(depositer.getAddress()).simulate();
        const finalBalPub = await token.methods.balance_of_public(depositer.getAddress()).simulate();
        const veilPaymentBal = await token.methods.balance_of_public(veilPayment.address).simulate();
        console.log('📊 Final balances:', {
            depositerPrivate: finalBalPriv.toString(),
            depositerPublic: finalBalPub.toString(),
            veilPaymentPublic: veilPaymentBal.toString()
        });

        // Verify balances
        expect(finalBalPriv).toBe(initialBalPriv - amount);
        expect(veilPaymentBal).toBe(amount);
    });

    it('should allow withdrawal', async () => {
        console.log('\n💵 Testing withdrawal functionality...');
        const amount = 50n;
        console.log('📊 Withdrawal amount:', amount.toString());
        
        console.log('💸 Initiating withdrawal...');
        await veilPayment.withWallet(depositer)
            .methods
            .public_dispatch(new Fr(2)) // withdraw selector
            .send()
            .wait();
        console.log('✅ Withdrawal successful');
    });

    it('should handle clawback', async () => {
        console.log('\n🔄 Testing clawback functionality...');
        const amount = 30n;
        const nonce = Fr.random();
        console.log('📊 Clawback values:', { 
            amount: amount.toString(), 
            nonce: nonce.toString() 
        });
        
        // Initiate clawback
        console.log('🚀 Initiating clawback...');
        await veilPayment.withWallet(issuer)
            .methods
            .public_dispatch(new Fr(3)) // initialiateClawback selector
            .send()
            .wait();
        console.log('✅ Clawback initiated');

        // Wait for clawback delay
        console.log('⏳ Waiting for clawback delay (3 minutes)...');
        await new Promise(resolve => setTimeout(resolve, 180000));
        console.log('✅ Clawback delay completed');

        // Claim clawback
        console.log('🎯 Claiming clawback...');
        await veilPayment.withWallet(depositer)
            .methods
            .public_dispatch(new Fr(4)) // claimClawback selector
            .send()
            .wait();
        console.log('✅ Clawback claimed successfully');
    });
});

// Helper function for FPC address
async function getDeployedSponsoredFPCAddress(pxe: PXE): Promise<AztecAddress> {
    return AztecAddress.fromString("0x0000000000000000000000000000000000000000000000000000000000000000");
}