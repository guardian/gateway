import { getMvtId } from '@/server/lib/getMvtId';
import { Configuration } from '@/server/models/Configuration';
import { Request } from 'express';

const fakeRequest = (name: string, value: number | string) => ({
  cookies: {
    [name]: value,
  },
});

const fakeConfig = (stage = 'DEV') => ({
  stage,
});

describe('getMvtId', () => {
  describe('when the GU_mvt_id cookie is set', () => {
    it('returns the value of the GU_mvt_id cookie', () => {
      const request = fakeRequest('GU_mvt_id', 331) as unknown as Request;
      const config = fakeConfig() as unknown as Configuration;
      const expected = 331;
      const output = getMvtId(request, config);
      expect(output).toBe(expected);
    });
    it('returns 0 if the value cannot be cast as a number', () => {
      const request = fakeRequest(
        'GU_mvt_id',
        'ThisCannotBeCastAsANumber',
      ) as unknown as Request;
      const config = fakeConfig() as unknown as Configuration;
      const expected = 0;
      const output = getMvtId(request, config);
      expect(output).toBe(expected);
    });
  });
  describe('when the GU_mvt_id_local cookie is set', () => {
    describe('and the stage is DEV', () => {
      it('returns the value of the GU_mvt_id_local cookie', () => {
        const request = fakeRequest(
          'GU_mvt_id_local',
          330,
        ) as unknown as Request;
        const config = fakeConfig() as unknown as Configuration;
        const expected = 330;
        const output = getMvtId(request, config);
        expect(output).toBe(expected);
      });
      it('returns 0 if the cookie value cannot be interpreted as a number', () => {
        const request = fakeRequest(
          'GU_mvt_id_local',
          'ThisCannotBeCastAsANumber',
        ) as unknown as Request;
        const config = fakeConfig() as unknown as Configuration;
        const expected = 0;
        const output = getMvtId(request, config);
        expect(output).toBe(expected);
      });
    });
    describe('and the stage is not DEV', () => {
      it('returns 0', () => {
        const request = fakeRequest(
          'GU_mvt_id_local',
          330,
        ) as unknown as Request;
        const config = fakeConfig('CODE') as unknown as Configuration;
        const expected = 0;
        const output = getMvtId(request, config);
        expect(output).toBe(expected);
      });
    });
  });
  describe('when no MVT cookies are set', () => {
    it('returns 0', () => {
      const request = fakeRequest(
        'GU_RANDOM',
        'unrelated cookie',
      ) as unknown as Request;
      const config = fakeConfig() as unknown as Configuration;
      const expected = 0;
      const output = getMvtId(request, config);
      expect(output).toBe(expected);
    });
  });
});
