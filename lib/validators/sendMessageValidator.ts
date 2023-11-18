import { z } from 'zod';

export const sendMessageValidator = z.object({
  fileid: z.string(),
  message: z.string(),
});
