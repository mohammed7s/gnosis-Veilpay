import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
config();
const prisma = new PrismaClient();
import { User } from "@prisma/client";

// Add a db function to create a new user in the database accepting their user address, escrow contract address, and secret key. This function will be used in the /create route. If user not found, it will create a new user. If user found, it will update the existing user with the new escrow contract address and secret key.
export async function createOrUpdateUser(
  userAddress: string,
  escrowContractAddress: string,
  secretKey: string
): Promise<User> {
  return await prisma.user.upsert({
    where: { id: userAddress },
    update: {
      escrowAddress: escrowContractAddress,
      key: secretKey,
    },
    create: {
      id: userAddress,
      escrowAddress: escrowContractAddress,
      key: secretKey,
    },
  });
}

// Get a user info by their address, used in the /charge-authorization route to check if the user exists and has a secret key and escrow contract address.
export async function getUserByAddress(
  userAddress: string
): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id: userAddress },
  });
}
