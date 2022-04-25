# Gateway Email Service

The Gateway Email Service allows the creation of email templates and exposes functions to send them

## Usage

All emails, in both HTML and plain text versions, are pre-rendered at app
startup and should not need to be rendered again.

The email sending functions automatically fetch the pre-rendered templates for
each email when sending.

### Sending an email

To send an email

```
import { sendExampleEmail } from '@/email';

try {
  await sendExampleEmail({ to: 'person@example.com' });
} catch(error) {
  // Handle error
}
```

### Creating a new template

To create a new email template

- Create a copy of an existing folder under `/templates`
- Choose a name and edit/rename the new files
- `yarn storybook`
- Edit the tsx file to produce the desired result
- Edit the text file
- Add / remove props as needed
- Add an export to `/index.ts`
