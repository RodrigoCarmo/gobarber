import { Request, Response } from 'express';

import { container } from 'tsyringe';

import ListProviderDayAvailabilityService from '@modules/appointments/services/ListProviderDayAvailabilityService';

export default class ProviderDayAvailabilityController {
    public async index(request: Request, response: Response): Promise<Response> {
        const { provider_id } = request.params;
        const { day, month, year } = request.query;

        const listProviderDayAvailability = container.resolve(ListProviderDayAvailabilityService);

        const providerDayAvailability = await listProviderDayAvailability.execute({
            provider_id,
            day: Number(day),
            year: Number(year),
            month: Number(month),
        });

        return response.json(providerDayAvailability);
    }
}