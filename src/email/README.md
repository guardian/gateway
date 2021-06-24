# Gateway Email Service

The Gateway Email Service allows the creation of email templates and exposes a function to send them

## Usage

### Sending an email

To send an email

```
import { sendEmail } from '@/email';

sendEmail('resetPassword');
```

### Creating a new template

To create a new email template

- Add a file `YourTemplate.tsx` to `/templates`
