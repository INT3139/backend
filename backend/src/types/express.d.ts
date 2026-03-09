import { AuthUser } from './index'
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser; userId?: string; requestId?: string
    }
  }
}
