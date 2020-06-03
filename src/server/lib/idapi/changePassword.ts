import {
  idapiFetch,
  APIAddClientAccessToken,
  APIGetOptions,
  APIPostOptions,
} from '@/server/lib/APIFetch';
import { ApiRoutes } from '@/shared/model/Routes';
import { stringify } from 'querystring';

export async function validate(
  token: string,
  ip: string,
): Promise<string | undefined> {
  const options = APIGetOptions();

  const params = {
    token,
  };

  const qs = stringify(params);

  const result = await idapiFetch(
    `${ApiRoutes.CHANGE_PASSWORD_TOKEN_VALIDATION}?${qs}`,
    APIAddClientAccessToken(options, ip),
  );
  return result.user?.primaryEmailAddress;
}

export async function change(password: string, token: string, ip: string) {
  const options = APIPostOptions({
    password,
    token,
  });

  const result = await idapiFetch(
    ApiRoutes.CHANGE_PASSWORD,
    APIAddClientAccessToken(options, ip),
  );

  console.log(result);

  return result;
}
