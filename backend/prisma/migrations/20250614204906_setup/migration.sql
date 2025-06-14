-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "escrowAddress" TEXT,
    "key" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_escrowAddress_key" ON "User"("escrowAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_key_key" ON "User"("key");
