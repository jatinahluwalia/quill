import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: {
    fileid: string;
  };
}

const Page = async ({ params: { fileid } }: Props) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`);

  const file = await db.file.findFirst({
    where: { id: fileid, userId: user.id },
  });

  if (!file) notFound();

  return <div>Page</div>;
};

export default Page;
