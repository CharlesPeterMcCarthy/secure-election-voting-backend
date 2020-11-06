import {
	ResponseBuilder,
	ErrorCode,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	Candidate
} from '../../api-shared-modules/src';
import { ElectionItem } from '../../api-shared-modules/src/models/core/Election';
import { CreateCandidateRequest, UpdateCandidateRequest } from './candidate.interfaces';

export class CandidateController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getCandidateById: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.candidateId || !event.pathParameters.electionId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const candidateId: string = event.pathParameters.candidateId;
		const electionId: string = event.pathParameters.electionId;

		try {
			const candidate: Candidate = await this.unitOfWork.Candidates.get(candidateId, electionId);

			return ResponseBuilder.ok({ candidate });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Candidate not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllCandidates: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		// let lastEvaluatedKey: LastEvaluatedKey;
		// if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		try {
			const result: { candidates: Candidate[]; lastEvaluatedKey: Partial<ElectionItem> } =
				await this.unitOfWork.Candidates.getAll();
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Candidates');

			return ResponseBuilder.ok({ ...result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllCandidatesByElection: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.electionId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters - Election ID is missing');

		// let lastEvaluatedKey: LastEvaluatedKey;
		// if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		const electionId: string = event.pathParameters.electionId;

		try {
			const result: { candidates: Candidate[]; lastEvaluatedKey: Partial<ElectionItem> } =
				await this.unitOfWork.Candidates.getAllByElection(electionId);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Candidates');

			return ResponseBuilder.ok({ ...result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public createCandidate: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: CreateCandidateRequest = JSON.parse(event.body);

		if (!data.electionId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election ID is missing');
		if (!data.firstName) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Candidate first name is missing');
		if (!data.lastName) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Candidate last name is missing');
		if (!data.party) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Candidate political party is missing');

		const partialCandidate: Partial<Candidate> = {
			...data
		};

		try {
			const candidate: Candidate = await this.unitOfWork.Candidates.create(partialCandidate);

			return ResponseBuilder.ok({ candidate });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public updateCandidate: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: UpdateCandidateRequest = JSON.parse(event.body);

		if (!data.electionId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election ID is missing');
		if (!data.firstName) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Candidate first name is missing');
		if (!data.lastName) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Candidate last name is missing');
		if (!data.party) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Candidate political party is missing');

		const updatedCandidate: Candidate = data;

		try {
			const candidate: Candidate = await this.unitOfWork.Candidates.update(updatedCandidate);

			return ResponseBuilder.ok({ candidate });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public deleteCandidate: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.candidateId || !event.pathParameters.electionId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const candidateId: string = event.pathParameters.candidateId;
		const electionId: string = event.pathParameters.electionId;

		try {
			const candidate: Candidate = await this.unitOfWork.Candidates.delete(candidateId, electionId);

			return ResponseBuilder.ok({ candidate });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
