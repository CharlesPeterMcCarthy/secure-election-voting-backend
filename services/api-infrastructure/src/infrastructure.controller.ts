import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext
} from '../../api-shared-modules/src';

export class InfrastructureController {

	public health: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		try {
			return ResponseBuilder.ok({ msg: 'ok' });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
