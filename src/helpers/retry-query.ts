import { Logger } from '@nestjs/common';

const logger = new Logger('RetryHelper');

export async function retryQuery(
  operation: () => Promise<void>,
  retries: number,
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await operation();
      return;
    } catch (error) {
      if (attempt < retries) {
        logger.warn(`Attempt ${attempt} failed. Retry`);
      } else {
        logger.error(`Attempt ${attempt} failed`);
        throw error;
      }
    }
  }
}
