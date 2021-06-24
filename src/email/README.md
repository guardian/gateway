# Gateway Email Service

The Gateway Email Service allows the creation of email templates and exposes functions to send them

## Usage

### Sending an email

To send an email

```
import { sendExampleEmail } from '@/email';

await sendExampleEmail({
  to: 'person@example.com',
  subject: 'Subject',
});
```

### Creating a new template

To create a new email template

- Create a copy of the `example` folder under `/templates`
- Choose a name and edit/rename the new files
- `yarn storybook`
- Edit the tsx file to produce the desired result
- Edit the text file
- Add / remove props as needed
- Add an export to `/index.ts`
