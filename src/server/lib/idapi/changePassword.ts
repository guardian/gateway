import {
  idapiFetch,
  APIAddClientAccessToken,
  APIGetOptions,
  APIPostOptions,
  IDAPIError,
} from '@/server/lib/APIFetch';
import { ApiRoutes } from '@/shared/model/Routes';
import { stringify } from 'querystring';
import {
  IdapiErrorMessages,
  ChangePasswordErrors,
} from '@/shared/model/Errors';

const handleError = ({ error, status = 500 }: IDAPIError) => {
  if (error.status === 'error' && error.errors?.length) {
    const err = error.errors[0];
    const { message } = err;

    switch (message) {
      case IdapiErrorMessages.INVALID_TOKEN:
        throw { message: ChangePasswordErrors.INVALID_TOKEN, status };
      case IdapiErrorMessages.BREACHED_PASSWORD:
        throw { message: ChangePasswordErrors.COMMON_PASSWORD, status };
      default:
        break;
    }
  }

  throw { message: ChangePasswordErrors.GENERIC, status: status };
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
    validateBreached: true,
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
