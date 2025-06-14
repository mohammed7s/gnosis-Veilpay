import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.post("/create", (req: Request, res: Response) => {
  // 1. Generate a new secret key for the user
  // 2. Deploy the escrow contract if required for the user with this secret key
  // 3. Create a new user in the database with the user -> secret key mapping and user -> escrow contract address mapping
  // 4. Return the escrow contract address to the user along with the key
  res.send("Hello World!");
});

// The user deposits the funds into the escrow contract

app.post("/charge-authorization", (req: Request, res: Response) => {
  // 1. Get the user's address from the request
  // 2. Get the user's escrow contract address from the database
  // 3. Check the balance of the user's escrow contract
  // 4. Check if we have user's secret key in the database
  // 5. All approved, return boolean true for authorization
  // 6. If not approved, return boolean false for authorization

  res.send("Hello World!");

  // 7. Start a charge transaction in the backend
});

// Example route to get all users (if you have a User model)
// app.get('/users', async (req: Request, res: Response) => {
//   const users = await prisma.user.findMany();
//   res.json(users);
// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
