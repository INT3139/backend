import { queryOne, query } from "@/configs/db";
import { redis } from "@/configs/redis";
import { issueTokenPair, verifyToken } from "./jwt";
import { AuthUser } from "@/types";

const REFRESH_PREFIX = 'refresh:'; // key: refresh:{userId}:{token_hash}

