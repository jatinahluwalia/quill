import { appRouter } from "@/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextApiRequest } from "next";

const handler = (req: Request) => {
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });
};

export { handler as GET, handler as POST };
