import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { classToClass } from 'class-transformer';

import ListProviderAppointmentsService from '@modules/appointments/services/ListProviderAppointmentsService';

export default class ProviderAppointmentController {
    public async index(request: Request, response: Response): Promise<Response> {
        const provider_id = request.user.id;
        const { day, month, year } = request.query;

        const listProviderAppointments = container.resolve(ListProviderAppointmentsService);

        const appointments = await listProviderAppointments.execute({
            day: Number(day),
            year: Number(year),
            month: Number(month),
            provider_id,

        });

        console.log(appointments)


        return response.json(classToClass(appointments));

    }
}
