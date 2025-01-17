import { startOfHour, isBefore, getHours, format } from 'date-fns';
import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Appointment from '../infra/typeorm/entities/Appointment';
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';

import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';

import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider'

interface IRequest {
  provider_id: string;
  user_id: string;
  date: Date;
}

@injectable()
class CreateAppointmentService {
  constructor(
    @inject('AppointmentsRepository')
    private appointmentsRepository: IAppointmentsRepository,

    @inject('NotificationRepository')
    private notificationRepository: INotificationsRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) { }

  public async execute({
    date,
    provider_id,
    user_id,
  }: IRequest): Promise<Appointment> {
    const appointmentDate = startOfHour(date);

    const correctedHour = new Date();

    correctedHour.setHours(correctedHour.getHours() - 3)



    if (isBefore(appointmentDate, correctedHour)) {
      throw new AppError("You can't create an appointment on a paste date");
    }

    const findAppointmentInSameDate = await this.appointmentsRepository.findByDate(
      appointmentDate,
      provider_id,
    );

    // console.log(findAppointmentInSameDate)

    if (user_id === provider_id) {
      throw new AppError('You cannot register an appointment with you');
    }

    if (getHours(appointmentDate) < 8 || getHours(appointmentDate) > 17) {
      throw new AppError('You can only create appointments between 8am and 5pm')
    }

    if (findAppointmentInSameDate) {
      throw new AppError('This appointment is already booked', 400);
    }

    const appointment = this.appointmentsRepository.create({
      provider_id,
      user_id,
      date: appointmentDate,
    });

    const dateFormated = format(appointmentDate, "dd/MM/yyyy 'às' HH:mm'h'")

    await this.notificationRepository.create({
      recipient_id: provider_id,
      content: `Novo agendamento para o dia: ${dateFormated}`
    });

    await this.cacheProvider.invalidate(
      `provider-appointments:${provider_id}:${format(appointmentDate, 'yyyy-M-d')}`
    )

    return appointment;
  }
}

export default CreateAppointmentService;
