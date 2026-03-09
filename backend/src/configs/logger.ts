import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env } from './env';

const fmt = winston.format;

export const logger = winston.createLogger({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: fmt.combine(
        fmt.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
            alias: 'time'
        }),
        fmt.errors({ stack: true }),
        fmt.splat(),
        fmt.json()
    ),
    transports: [
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d'
        }),
        new DailyRotateFile({
            filename: 'logs/%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        }),
        new winston.transports.Console({
            format: fmt.combine(
                fmt.colorize(),
                fmt.printf(({ level, message, time, stack }) => {
                    return `${time} [${level}]: ${stack || message}`;
                })
            ),
            silent: env.NODE_ENV === 'test'
        })
    ]
})

export const httpLogStream = {
    write: (message: string) => {
        logger.http(message.trim());
    }
}