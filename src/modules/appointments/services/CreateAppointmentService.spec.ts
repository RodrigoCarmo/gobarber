import AppError from '@shared/errors/AppError';

import FakeNotificationRepository from '@modules/notifications/repositories/fakes/FakeNotificationRepository'
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import CreateAppointmentService from './CreateAppointmentService';

let fakeAppointmentsRepository: FakeAppointmentsRepository;
let createAppointmentRepository: CreateAppointmentService;
let fakeNotificationRepository: FakeNotificationRepository
let fakeCacheProvider: FakeCacheProvider;

describe('CreateAppointment', () => {
  beforeEach(() => {
    fakeAppointmentsRepository = new FakeAppointmentsRepository();
    fakeNotificationRepository = new FakeNotificationRepository();
    fakeCacheProvider = new FakeCacheProvider();
    createAppointmentRepository = new CreateAppointmentService(
      fakeAppointmentsRepository,
      fakeNotificationRepository,
      fakeCacheProvider
    );

  });

  it('should be able to create a new appointment', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2021, 1, 20, 12).getTime();
    });

    const appointment = await createAppointmentRepository.execute({
      date: new Date(2021, 1, 20, 13),
      provider_id: '123123',
      user_id: '123124',
    });

    expect(appointment).toHaveProperty('id');
    expect(appointment.provider_id).toBe('123123');
  });

  it('should not be able to create two appointments on the same time', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 11, 3, 10).getTime();
    });

    const appointmentDate = new Date(2021, 1, 20, 13);

    await createAppointmentRepository.execute({
      date: appointmentDate,
      user_id: 'user-id',
      provider_id: 'provider-id',
    });

    await expect(
      createAppointmentRepository.execute({
        date: appointmentDate,
        user_id: 'user-id',
        provider_id: 'provider-id',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointments on a past date', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    await expect(
      createAppointmentRepository.execute({
        date: new Date(2020, 4, 10, 11),
        provider_id: '123123',
        user_id: '123123',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment with same user as provider', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    await expect(
      createAppointmentRepository.execute({
        date: new Date(2021, 1, 20, 13),
        provider_id: '123123',
        user_id: '123123',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment outside before 8am and after 5pm', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2021, 1, 20, 13).getTime();
    });

    await expect(
      createAppointmentRepository.execute({
        date: new Date(2021, 1, 20, 7),
        provider_id: 'provider-id',
        user_id: 'user-id',
      })).rejects.toBeInstanceOf(AppError);

    await expect(
      createAppointmentRepository.execute({
        date: new Date(2021, 1, 20, 18),
        provider_id: 'provider-id',
        user_id: 'user-id',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
