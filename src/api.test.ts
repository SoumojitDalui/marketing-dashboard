import { describe, expect, it } from 'vitest';
import { ApiError, formatApiError } from './api';

describe('formatApiError', () => {
  it('includes the structured API error code and message', () => {
    expect(formatApiError(new ApiError('WINDOW_TOO_SMALL', 'The date range must be at least 7 days.')))
      .toBe('WINDOW_TOO_SMALL — The date range must be at least 7 days.');
  });
});
