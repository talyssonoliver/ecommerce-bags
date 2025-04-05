// A simple in-memory rate limiter for API routes
// Note: In production, use a more robust solution like Redis-based rate limiting

import { NextRequest } from 'next/server';

// Use a single Map for storing all rate limit data
const ratelimitMap = new Map();

export const rateLimit = async (
  request: NextRequest,
  limit: number,
  timeframe: string
) => {
  // Call cleanup function on each request to prevent memory leaks
  cleanupRateLimits();
  
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  const timeValue = parseInt(timeframe.split(' ')[0]);
  const timeUnit = timeframe.split(' ')[1].toLowerCase();
  
  let milliseconds = 0;
  
  switch (timeUnit) {
    case 'second':
    case 'seconds':
      milliseconds = timeValue * 1000;
      break;
    case 'minute':
    case 'minutes':
      milliseconds = timeValue * 60 * 1000;
      break;
    case 'hour':
    case 'hours':
      milliseconds = timeValue * 60 * 60 * 1000;
      break;
    case 'day':
    case 'days':
      milliseconds = timeValue * 24 * 60 * 60 * 1000;
      break;
    default:
      milliseconds = 60 * 1000; // Default to 1 minute
  }
  
  const tokenKey = `${ip}:${request.nextUrl.pathname}`;
  const timestamp = Date.now();
  
  // Get the existing data for this token or initialize if not exists
  const data = ratelimitMap.get(tokenKey) || { 
    timestamp: 0, 
    count: 0,
    reset: timestamp + milliseconds
  };
  
  // Reset rate limit if the time has expired
  if (timestamp - data.timestamp > milliseconds) {
    ratelimitMap.set(tokenKey, {
      timestamp: timestamp,
      count: 1,
      reset: timestamp + milliseconds
    });
    return { success: true, limit, remaining: limit - 1 };
  }
  
  // Check if rate limit is reached
  if (data.count >= limit) {
    return { success: false, limit, remaining: 0 };
  }
  
  // Increment request count
  data.count += 1;
  ratelimitMap.set(tokenKey, data);
  
  return { 
    success: true,
    limit,
    remaining: limit - data.count
  };
};

// Cleanup function to prevent memory leaks
function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, data] of ratelimitMap.entries()) {
    if (now > data.reset) {
      ratelimitMap.delete(key);
    }
  }
}