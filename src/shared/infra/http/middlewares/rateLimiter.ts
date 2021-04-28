import { Request, Response, NextFunction } from 'express';
import redis from 'redis';
import { RateLimiterRedis, IRateLimiterStoreOptions } from 'rate-limiter-flexible';

import AppError from '@shared/errors/AppError';

// interface IRedisClient implements IRateLimiterStoreOptions {
//     Object: {
//         host: string,
//         port: number,
//         password: string
//     }
// }


const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASS || undefined
});

const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'redisLimit',
    points: 5,
    duration: 1,

})

export default async function rateLimiter(
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> {
    try {
        await limiter.consume(request.ip);

        return next();
    } catch {
        throw new AppError('Too many requests', 429);
    }
}