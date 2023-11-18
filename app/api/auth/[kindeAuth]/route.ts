import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest, { params }: any) => {
  const endpoint = params.kindeAuth;
  return handleAuth(request, endpoint) as Promise<NextResponse>;
};
