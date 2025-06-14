# Backend

## Setup the DB Base

1. Copy `.env.example` to `.env` and fill in the required environment variables.
2. Install the dependencies:

```bash
yarn install
```

## Run the backend

Start the backend server:

```bash
yarn dev
```

## Build & Run the backend

To build the backend for production and run it:

```bash
yarn build
yarn start
```

## DB commands

PostgreSQL hosted on Railway and using Prisma as ORM.

### Generate Prisma Client

```bash
yarn prisma generate
```

### Create a new Migrate(Push) to the database

```bash
yarn prisma migrate dev
```

### Start the prisma studio

```bash
yarn prisma studio
```
