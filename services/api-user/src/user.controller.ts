import {
	ApiContext,
	ApiEvent,
	ApiHandler,
	ApiResponse,
	ErrorCode,
	LastEvaluatedKey,
	ResponseBuilder,
	UnitOfWork,
	User,
	UserItem,
	UserType
} from '../../api-shared-modules/src';
import { CreateVoterRequest, UpdateVoterRequest } from './user.interfaces';

export class UserController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getUser: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.userId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const userId: string = event.pathParameters.userId;

		try {
			const result: User = await this.unitOfWork.Users.getById(userId);

			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve User');

			return ResponseBuilder.ok({ user: result });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'User not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllVoters: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		let lastEvaluatedKey: LastEvaluatedKey;
		if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		try {
			const result: { users: User[]; lastEvaluatedKey: Partial<UserItem> } =
				await this.unitOfWork.Users.getAllByUserType(UserType.VOTER, lastEvaluatedKey);

			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Voters');

			return ResponseBuilder.ok({ voters: result.users, lastEvaluatedKey: result.lastEvaluatedKey });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public createUser: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: CreateVoterRequest = JSON.parse(event.body);

		if (!data.firstName) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'First name is missing');
		if (!data.lastName) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Last name is missing');
		if (!data.email) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Email address is missing');
		if (!data.userType) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'User type is missing');
		// Check if value in UserType enum

		try {
			const result: User = await this.unitOfWork.Users.create(data);

			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to create User account');

			return ResponseBuilder.ok({ user: result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public updateUser: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: UpdateVoterRequest = JSON.parse(event.body);

		if (!data.firstName) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'First name is missing');
		if (!data.lastName) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Last name is missing');
		if (!data.email) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Email address is missing');
		if (!data.userType) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'User type is missing');

		try {
			const result: User = await this.unitOfWork.Users.create(data);

			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to update User account');

			return ResponseBuilder.ok({ user: result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public deleteUser: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.userId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const userId: string = event.pathParameters.userId;

		try {
			const result: User = await this.unitOfWork.Users.delete(userId);

			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to delete User account');

			return ResponseBuilder.ok({ user: result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
