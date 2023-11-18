import { Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useChatContext } from './ChatContext';
import { useRef } from 'react';

interface Props {
  isDisabled?: boolean;
}
const ChatInput = ({ isDisabled }: Props) => {
  const { addMessage, handleInputChange, isLoading, message } =
    useChatContext();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex w-full grow flex-col p-4">
            <div className="relative">
              <Textarea
                placeholder="Enter your question..."
                rows={1}
                maxRows={4}
                onChange={handleInputChange}
                value={message}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addMessage();

                    textareaRef.current?.focus();
                  }
                }}
                autoFocus
                className="scrollbar-thumb-blue scrollbar-track-blue-lighter scrollbar-thumb-rounded scrollbar-w-2 resize-none py-3 pr-12 text-base"
              />
              <Button
                aria-label="send message"
                className="absolute bottom-1.5 right-[8px]"
                disabled={isLoading || isDisabled}
                onClick={() => {
                  addMessage();
                  textareaRef.current?.focus();
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
