import {
  idapiFetch,
  APIAddClientAccessToken,
  APIGetOptions,
  APIPostOptions,
} from '@/server/lib/APIFetch';
import { ApiRoutes } from '@/shared/model/Routes';
import { stringify } from 'querystring';
import {
  IdapiErrorMessages,
  ChangePasswordErrors,
} from '@/shared/model/Errors';

const handleError = (response: any) => {
  if (response.status === 'error' && response.errors?.length) {
    const error = response.errors[0];
    const { message } = error;

    switch (message) {
      case IdapiErrorMessages.INVALID_TOKEN:
        throw ChangePasswordErrors.INVALID_TOKEN;
      default:
        break;
    }
  }

  throw ChangePasswordErrors.GENERIC;
};

export async function validate(
  token: string,
  ip: string,
): Promise<string | undefined> {
  const options = APIGetOptions();

  const params = {
    token,
  };

  const qs = stringify(params);

  try {
    const result = await idapiFetch(
      `${ApiRoutes.CHANGE_PASSWORD_TOKEN_VALIDATION}?${qs}`,
      APIAddClientAccessToken(options, ip),
    );
    return result.user?.primaryEmailAddress;
  } catch (error) {
    handleError(error);
  }
}

export async function change(password: string, token: string, ip: string) {
  const options = APIPostOptions({
    password,
    token,
  });

  try {
    const result = await idapiFetch(
      ApiRoutes.CHANGE_PASSWORD,
      APIAddClientAccessToken(options, ip),
    );
    return result.cookies;
  } catch (error) {
    handleError(error);
  }
}
