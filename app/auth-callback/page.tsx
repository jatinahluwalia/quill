"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";

const Page = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const { data, isLoading } = trpc.authcallback.useQuery(undefined, {
    onSuccess({ success }) {
      if (success) {
        router.push(origin ? `/${origin}` : "/dashboard");
      }
      console.log("success");
    },
    onError(err) {
      if (err.data?.code === "UNAUTHORIZED") {
        router.push("/sign-in");
      }
      console.log(err);
    },
  });

  return (
    <div className="mt-24 flex w-full justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="text-xl font-semibold">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default Page;
