import { container } from 'tsyringe';

import uploadConfig from '@config/upload';

import IStorageProvider from './models/IStorageProvider';
import DIskStorageProvider from './implementations/DIskStorageProvider';
import S3StorageProvider from './implementations/S3StorageProvider';

const providers = {
    diskStorage: DIskStorageProvider,
    S3Storage: S3StorageProvider
};



container.registerSingleton<IStorageProvider>(
    'StorageProvider',
    providers[uploadConfig.driver],
);
