import rateLimit from 'express-rate-limit'

const options = {
    standardHeaders: true, 
    legacyHeaders: false
}

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, error: { message: 'Too many login attempts' } },
    ...options
})
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { success: false, error: { message: 'Too many requests' } },
    ...options
})
export const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { success: false, error: { message: 'Upload rate limit exceeded' } },
    ...options
})
