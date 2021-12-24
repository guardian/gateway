import fs from 'fs';
import csrf from 'csurf';
import {
  readUserType,
  UserType,
  sendAccountExistsEmail,
  sendAccountWithoutPasswordExistsEmail,
} from '@/server/lib/idapi/user';
import { EmailType } from '@/shared/model/EmailType';
import { default as request } from 'supertest';
import { getEmailStateFromResponse } from './utils/extractCookies';

// We need to mock the fs read for webpack-assets.json before the server starts.
jest.mock('fs');
(fs.existsSync as jest.Mock).mockReturnValue(true);
(fs.readFileSync as jest.Mock).mockReturnValue(
  '{"main": {"js": "mocked"}, "vendors": {"js": "mocked"}, "runtime": {"js": "mocked"}}',
);

// Setup other mocked libraries and functions.
jest.mock('csurf');
jest.mock('aws-sdk');
jest.mock('@/server/lib/idapi/user');
jest.mock('@/server/lib/idapi/guest');
jest.mock('@/server/lib/trackMetric');

(csrf as jest.Mock).mockReturnValue(
  jest.fn((req, res, next) => {
    // eslint-disable-next-line functional/immutable-data
    req.csrfToken = jest.fn().mockReturnValue('');
    next();
  }),
);
// End Setup

// Start the application server.
import { default as server } from '@/server/index';
import { trackMetric } from '@/server/lib/trackMetric';

describe('Registration POST endpoint', function () {
  it('redirects to email sent page when UserType == NEW', (done) => {
    // Set the user type to NEW
    (readUserType as jest.Mock).mockResolvedValue(UserType.NEW);
    // Make Assertions
    const result = request(server)
      .post('/register')
      .type('application/x-www-form-urlencoded')
      .send({ ref: '', refViewId: '', email: 'test@test.com' });

    result
      .expect(
        'location',
        '/register/email-sent?returnUrl=https%3A%2F%2Fm.code.dev-theguardian.com',
      )
      .expect(303)
      .then((res) => {
        // Check that the encrypted email information is correct.
        const decryptedCookie = getEmailStateFromResponse(res);
        const { email, emailType } = decryptedCookie;
        expect(email).toEqual('test@test.com');
        expect(emailType).toEqual(EmailType.ACCOUNT_VERIFICATION);
        done();
      });
  });

  it('sends the account exists email and redirects to the email sent page when UserType.CURRENT', (done) => {
    // Set the user type to NEW
    (readUserType as jest.Mock).mockResolvedValue(UserType.CURRENT);
    // Make Assertions
    const result = request(server)
      .post('/register')
      .type('application/x-www-form-urlencoded')
      .send({ ref: '', refViewId: '', email: 'test@test.com' });

    result
      .expect(
        'location',
        '/register/email-sent?returnUrl=https%3A%2F%2Fm.code.dev-theguardian.com',
      )
      .expect(303)
      .then((res) => {
        // Check that the correct type of email was sent.
        expect(sendAccountExistsEmail).toHaveBeenCalled();

        // Check that the encrypted email information is correct.
        const decryptedCookie = getEmailStateFromResponse(res);
        const { email, emailType } = decryptedCookie;
        expect(email).toEqual('test@test.com');
        expect(emailType).toEqual(EmailType.ACCOUNT_EXISTS);
        done();
      });
  });

  it('sends the account exists without password email and redirects to the email sent page when UserType.GUEST', (done) => {
    // Set the user type to NEW
    (readUserType as jest.Mock).mockResolvedValue(UserType.GUEST);
    // Make Assertions
    const result = request(server)
      .post('/register')
      .type('application/x-www-form-urlencoded')
      .send({ ref: '', refViewId: '', email: 'test@test.com' });

    result
      .expect(
        'location',
        '/register/email-sent?returnUrl=https%3A%2F%2Fm.code.dev-theguardian.com',
      )
      .expect(303)
      .then((res) => {
        // Check that the correct type of email was sent.
        expect(sendAccountWithoutPasswordExistsEmail).toHaveBeenCalled();

        expect(trackMetric).toHaveBeenCalledWith('Register::Success');

        // Check that the encrypted email information is correct.
        const decryptedCookie = getEmailStateFromResponse(res);
        const { email, emailType } = decryptedCookie;
        expect(email).toEqual('test@test.com');
        expect(emailType).toEqual(EmailType.ACCOUNT_WITHOUT_PASSWORD_EXISTS);
        done();
      });
  });
});

it('throws an error if an invalid UserType is provided', (done) => {
  // Set the user type to an invalid value
  (readUserType as jest.Mock).mockResolvedValue('invalid');
  // Make Assertions
  const result = request(server)
    .post('/register')
    .type('application/x-www-form-urlencoded')
    .send({ ref: '', refViewId: '', email: 'test@test.com' });

  result.expect(500).then((res) => {
    // Check that the default error message is rendered.
    expect(res.text).toContain(
      'Sorry, something went wrong. Please try again.',
    );
    // Check that the email is rendered from the pageData
    expect(res.text).toContain('test@test.com');
    done();
  });
});

afterAll(() => {
  server.close();
});
