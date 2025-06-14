// contract interaction related functions
import {
  AztecAddress,
  Contract,
  createPXEClient,
  loadContractArtifact,
  waitForPXE,
} from "@aztec/aztec.js";
import { PXE_URL } from "./pxeClient";
import { getInitialTestAccountsWallets } from "@aztec/accounts/src/testing";
import { writeFileSync } from "fs";

const TokenContractArtifact = loadContractArtifact(
  "../contracts/token/target/token-Token.json"
);
const EscrowContractArtifact = loadContractArtifact(
  "../contracts/escrow/target/escrow-Escrow.json" // Adjust the path as necessary
);

export async function deployTokenContract() {
  const pxe = createPXEClient(PXE_URL);
  await waitForPXE(pxe);

  const [ownerWallet] = await getInitialTestAccountsWallets(pxe);
  const ownerAddress = ownerWallet.getAddress();

  const token = await Contract.deploy(ownerWallet, TokenContractArtifact, [
    ownerAddress,
    "TokenName",
    "TKN",
    18,
  ])
    .send()
    .deployed();

  console.log(`Token deployed at ${token.address.toString()}`);

  const addresses = { token: token.address.toString() };
  return addresses;
}

export async function deployEscrowContract(
  depositor: string,
  issuer: string,
  key: string
) {
  const pxe = createPXEClient(PXE_URL);
  await waitForPXE(pxe);

  const [ownerWallet] = await getInitialTestAccountsWallets(pxe);

  const token = await Contract.deploy(ownerWallet, EscrowContractArtifact, [
    depositor,
    issuer,
    key,
  ])
    .send()
    .deployed();

  console.log(`Token deployed at ${token.address.toString()}`);

  const addresses = { token: token.address.toString() };
  return addresses;
}

export const tokenAddress = "";

export async function getEscrowBalance(escrowAddress: string) {
  const pxe = createPXEClient(PXE_URL);
  await waitForPXE(pxe);

  const [wallet] = await getInitialTestAccountsWallets(pxe);

  const escrowContract = await Contract.at(
    AztecAddress.fromString(tokenAddress), // Ensure the address is the token address
    TokenContractArtifact,
    wallet
  );
  const balance = await escrowContract.methods
    .balance_of_private(escrowAddress)
    .simulate();

  console.log(`Balance of ${escrowAddress}: ${balance}`);
  return balance;
}

// Transfer tokens privately - https://docs.aztec.network/developers/tutorials/codealong/js_tutorials/simple_dapp/contract_interaction#transferring-private-tokens

// Mint Tokens - https://docs.aztec.network/developers/tutorials/codealong/js_tutorials/simple_dapp/contract_interaction#mint-tokens
