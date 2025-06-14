import { createPXEClient, waitForPXE } from "@aztec/aztec.js";

// start the PXE client locally with the Testnet node URL
// `aztec start --port 8080 --pxe --pxe.nodeUrl=http://localhost:8080/`
export const { PXE_URL = "http://localhost:8080" } = process.env;

async function connect() {
  const pxe = await createPXEClient(PXE_URL);

  const { l1ChainId } = await pxe.getNodeInfo();
  console.log(`Connected to chain ${l1ChainId}`);

  const accounts = await pxe.getRegisteredAccounts();
  console.log(
    `User accounts:\n${accounts
      .map((a: { address: string }) => a.address)
      .join("\n")}`
  );
}

connect()
  .then(() => console.log("PXE client connected successfully"))
  .catch((error) => {
    console.error("Failed to connect to PXE client:", error);
    process.exit(1);
  });
