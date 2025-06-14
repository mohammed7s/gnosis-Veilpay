import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Example route to get all users (if you have a User model)
// app.get('/users', async (req: Request, res: Response) => {
//   const users = await prisma.user.findMany();
//   res.json(users);
// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
