import { Request } from 'express';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';

const fourZeroZeroRenderer = (res: ResponseWithRequestState) =>
	renderer('/error', {
		pageTitle: 'Unexpected Error',
		requestState: res.locals,
	});

export const fourZeroZeroMiddleware = (
	_: Request,
	res: ResponseWithRequestState,
) => {
	const html = fourZeroZeroRenderer(res);
	res.type('html').status(400).send(html);
};
