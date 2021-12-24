import fs from 'fs';
import csrf from 'csurf';
import { readUserType, UserType } from '@/server/lib/idapi/user';
import { extractCookies } from './utils/extractCookies';
import { decrypt } from '@/server/lib/crypto';
import { EmailType } from '@/shared/model/EmailType';
import { default as request } from 'supertest';

// Setup mocked libraries and functions.
jest.mock('fs');
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
(fs.existsSync as jest.Mock).mockReturnValue(true);
(fs.readFileSync as jest.Mock).mockReturnValue(
  '{"main": {"js": "mocked"}, "vendors": {"js": "mocked"}, "runtime": {"js": "mocked"}}',
);
// End Setup

// Start the application server.
import { default as server } from '@/server/index';

const getEmailStateFromResponse = (res: request.Response) => {
  const cookies = extractCookies(res.headers);
  const { GU_GATEWAY_STATE } = cookies;
  const decryptedCookie = JSON.parse(
    decrypt(decodeURIComponent(GU_GATEWAY_STATE.value)),
  );
  return decryptedCookie;
};

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

  it.skip('sends the account exists email and redirects to the email sent page when UserType.CURRENT', (done) => {
    // TODO
  });

  it.skip('sends the account exists without password email and redirects to the email sent page when UserType.GUEST', (done) => {
    // TODO
  });
});

afterAll(() => {
  server.close();
});
