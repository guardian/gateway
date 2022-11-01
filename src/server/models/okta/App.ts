import { z } from 'zod';

// https://developer.okta.com/docs/reference/api/apps/#application-properties
export const appResponseSchema = z.object({
  id: z.string(),
  label: z.string(),
  settings: z.object({
    oauthClient: z.object({
      redirect_uris: z.array(z.string()),
    }),
  }),
});
export type AppResponse = z.infer<typeof appResponseSchema>;
