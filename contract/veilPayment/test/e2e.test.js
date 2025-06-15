import {
    AccountWalletWithPrivateKey,
    AztecAddress,
    computeAuthWitMessageHash,
    computeMessageSecretHash,
    createPXEClient,
    ExtendedNote,
    Fr,
    Note,
    PXE,
    TxHash,
    waitForPXE,
  } from "@aztec/aztec.js";