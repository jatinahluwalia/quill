import { trpc } from '@/app/_trpc/client';
import { INFINITE_QUERY_LIMIT } from '@/config/infiniteQuery';
import { useMutation } from '@tanstack/react-query';
import {
  ChangeEvent,
  ReactNode,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

type ChatContext = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

const chatContext = createContext<ChatContext>({
  addMessage: () => {},
  handleInputChange: (_e: ChangeEvent<HTMLTextAreaElement>) => {},
  isLoading: false,
  message: '',
});

interface Props {
  fileid: string;
  children: ReactNode;
}

export const ChatContextProvider = ({ children, fileid }: Props) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const utils = trpc.useUtils();

  const backupMessage = useRef('');

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const res = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({ fileid, message }),
      });
      if (!res.ok) {
        throw new Error('Failed to send message.');
      }
      return res.body;
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage('');

      // step 1
      await utils.getFileMessages.cancel();

      // step 2
      const previousMessages = utils.getFileMessages.getInfiniteData();

      // step 3
      utils.getFileMessages.setInfiniteData(
        { fileId: fileid, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            };
          }
          const newPages = [...old.pages];

          const latestPage = newPages[0]!;

          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            ...latestPage.messages,
          ];

          newPages[0] = latestPage;

          return {
            ...old,
            pages: newPages,
          };
        },
      );
      setIsLoading(true);
      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onSuccess: async (stream) => {
      setIsLoading(false);

      if (!stream) {
        return toast.error('There was a problem sending this message.', {
          description: 'Please refresh this page and tru again.',
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // accumulated response

      let accResponse = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        accResponse += chunkValue;

        utils.getFileMessages.setInfiniteData(
          { fileId: fileid, limit: INFINITE_QUERY_LIMIT },
          (old) => {
            if (!old) {
              return {
                pageParams: [],
                pages: [],
              };
            }

            const isAiResponseCreated = old.pages.some((page) =>
              page.messages.some((message) => message.id === 'ai-response'),
            );

            const updatedPages = old.pages.map((page) => {
              if (page === old.pages[0]) {
                let updatedMessages;

                if (!isAiResponseCreated) {
                  updatedMessages = [
                    {
                      createdAt: new Date().toISOString(),
                      id: 'ai-response',
                      text: accResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ];
                } else {
                  updatedMessages = page.messages.map((message) => {
                    if (message.id === 'ai-response') {
                      return {
                        ...message,
                        text: accResponse,
                      };
                    }

                    return message;
                  });
                }

                return {
                  ...page,
                  messages: updatedMessages,
                };
              }
              return page;
            });

            return { ...old, pages: updatedPages };
          },
        );
      }
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        { fileId: fileid },
        { messages: context?.previousMessages ?? [] },
      );
    },
    onSettled: async () => {
      setIsLoading(false);
      await utils.getFileMessages.invalidate({ fileId: fileid });
    },
  });

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const addMessage = () => {
    sendMessage({ message });
  };

  return (
    <chatContext.Provider
      value={{ addMessage, message, handleInputChange, isLoading }}
    >
      {children}
    </chatContext.Provider>
  );
};

export const useChatContext = () => useContext(chatContext);
