'use client';

import React from 'react';
import Messages from '../chat/Messages';
import ChatInput from './ChatInput';
import { trpc } from '@/app/_trpc/client';
import { ChevronLeft, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';
import { ChatContextProvider } from './ChatContext';

interface Props {
  fileid: string;
}

const ChatWrapper = ({ fileid }: Props) => {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    {
      fileid,
    },
    {
      refetchInterval: (data) => {
        return data?.status === 'SUCCESS' || data?.status === 'FAILED'
          ? false
          : 500;
      },
    },
  );

  if (isLoading) {
    return (
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <h3 className="text-xl font-semibold">Loading...</h3>
            <p className="text-sm text-zinc-500">
              {"We're preparing your PDF..."}
            </p>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );
  }

  if (data?.status === 'PROCESSING') {
    return (
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <h3 className="text-xl font-semibold">Processing PDF...</h3>
            <p className="text-sm text-zinc-500">{"This won't take long."}</p>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );
  }

  if (data?.status === 'FAILED') {
    return (
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="text-xl font-semibold">Too many pages in PDF...</h3>
            <p className="text-sm text-zinc-500">
              Your <span className="font-medium">Free</span> plan supports upto
              5 pages per PDF
            </p>
            <Link
              href={'/dashboard'}
              className={cn(
                buttonVariants({
                  variant: 'secondary',
                  className: 'mt-4',
                }),
              )}
            >
              <ChevronLeft className="mr-1.5 h-3 w-3" /> Back
            </Link>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );
  }
  return (
    <ChatContextProvider fileid={fileid}>
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 flex flex-1 flex-col justify-between">
          <Messages fileId={fileid} />
        </div>

        <ChatInput />
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapper;
