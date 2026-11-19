import { z } from 'zod';

/** what every clip takes: its shape, the panel colour behind the phone, and its length (s) */
export const clipSchema = z.object({
  variant: z.enum(['wide', 'tall', 'square', 'phone']).describe('Shape: wide 2:1 (desktop), tall 4:5 (phones and features), square'),
  background: z.string().describe('Panel colour behind the phone'),
  duration: z.number().min(1).max(60).step(0.1).describe('Length of the clip (s)'),
});
export type ClipProps = z.infer<typeof clipSchema>;
