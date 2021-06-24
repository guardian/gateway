import { Router, Request, Response } from 'express';
import { Example, ExamplePlainText } from '@/email/templates/Example';
import { render } from 'mjml-react';
import { sendEmail } from '@/email';

const router = Router();

router.get('/inline-render-email', (_, res: Response) => {
  const email = Example({ name: 'Jane' });
  const { html } = render(email);

  return res.type('html').sendEmail(html);
});

// pre render the email at app start
const email = Example({ name: 'Jane' });
const { html } = render(email);

router.get('/pre-render-email', (_, res: Response) => {
  return res.type('html').sendEmail(html);
});

router.get('/send-example-email?:to', async (req: Request, res: Response) => {
  const { to } = req.query;

  if (typeof to !== 'string') {
    return res.sendStatus(422);
  }

  try {
    await sendEmail(
      html,
      ExamplePlainText({ name: 'Jane' }),
      'Sign In | The Guardian',
      to,
    );
  } catch (error) {
    if (error.statusCode) {
      return res.sendStatus(error.statusCode);
    }
    return res.sendStatus(500);
  }

  return res.sendStatus(200);
});

export default router;
