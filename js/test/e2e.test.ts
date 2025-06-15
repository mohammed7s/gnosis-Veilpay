import { 
    AccountWalletWithSecretKey, 
    AztecAddress, 
    Fr, 
    PXE, 
    SponsoredFeePaymentMethod,
    Note,
    ExtendedNote,
    computeSecretHash
} from "@aztec/accounts";
import { createPXEClient } from "@aztec/pxe";
import { getDeployedTestAccountsWallets } from '@aztec/accounts/testing';
import { TokenContract } from '@aztec/noir-contracts.js/Token';
import { VeilPaymentContract } from '../src/artifacts';

const PXE_URL = "http://localhost:8080";

describe('VeilPayment Contract Test', () => {
    let depositer: AccountWalletWithSecretKey;
    let issuer: AccountWalletWithSecretKey;
    let recipient: AccountWalletWithSecretKey;
    let veilPayment: VeilPaymentContract;
    let fpc: SponsoredFeePaymentMethod;
    let pxe: PXE;
    let token: TokenContract;

    beforeAll(async () => {
        pxe = createPXEClient(PXE_URL);
        [depositer, issuer, recipient] = await getDeployedTestAccountsWallets(pxe);
        fpc = new SponsoredFeePaymentMethod(await getDeployedSponsoredFPCAddress(pxe));
        
        // Deploy token contract
        token = await TokenContract.deploy(depositer, 'TestToken', 'TTK', 18).send().deployed();
        
        // Deploy VeilPayment contract
        veilPayment = await VeilPaymentContract.deploy(depositer, depositer.getAddress(), issuer.getAddress())
            .send()
            .deployed();
    });

    // ... rest of the test cases remain the same ...
});

// Helper function for FPC address
async function getDeployedSponsoredFPCAddress(pxe: PXE): Promise<AztecAddress> {
    return AztecAddress.fromString("0x0000000000000000000000000000000000000000");
}