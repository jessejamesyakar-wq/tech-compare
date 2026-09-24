export interface TimestampValidationResult {
  valid: boolean;
  observedAt: string;
  retrievedAt: string;
  trustedExecutionTime: string;
  formattedUtc: string;
  formattedLocalOffset: string;
  clockSkewSeconds: number;
  errorCode?: string;
  errorMessage?: string;
}

export function validateEvidenceTimestamps(
  observedAtInput: string,
  retrievedAtInput: string = new Date().toISOString(),
  trustedExecutionInstant: Date = new Date(),
  maxAllowedSkewSeconds: number = 300 // 5 minutes
): TimestampValidationResult {
  const obsDate = new Date(observedAtInput);
  const retDate = new Date(retrievedAtInput);

  if (isNaN(obsDate.getTime())) {
    return {
      valid: false,
      observedAt: observedAtInput,
      retrievedAt: retrievedAtInput,
      trustedExecutionTime: trustedExecutionInstant.toISOString(),
      formattedUtc: '',
      formattedLocalOffset: '',
      clockSkewSeconds: 0,
      errorCode: 'INVALID_TIMESTAMP_FORMAT',
      errorMessage: `Observed timestamp ${observedAtInput} is not a valid ISO date.`
    };
  }

  // 1. Detect LOCAL_AS_UTC_BUG
  // If observedAt has 'Z' suffix but matches Turkey local wall-clock time (UTC+3) instead of true UTC
  const obsStr = observedAtInput;
  const isZ = obsStr.endsWith('Z');

  // True UTC formatting
  const formattedUtc = obsDate.toISOString();

  // Local offset formatting (+03:00)
  const turkeyTime = new Date(obsDate.getTime() + 3 * 3600 * 1000);
  const localIsoNoZ = turkeyTime.toISOString().replace('Z', '');
  const formattedLocalOffset = `${localIsoNoZ}+03:00`;

  const obsHour = obsDate.getUTCHours();
  const localWallClockHour = turkeyTime.getUTCHours();

  const clockSkewMs = obsDate.getTime() - trustedExecutionInstant.getTime();
  const clockSkewSeconds = Math.round(clockSkewMs / 1000);

  if (isZ && Math.abs(clockSkewSeconds - 3 * 3600) <= 30) {
    // Wall-clock time was suffixed with Z (local time 22:45 mislabeled as 22:45Z instead of 19:45Z)
    return {
      valid: false,
      observedAt: observedAtInput,
      retrievedAt: retrievedAtInput,
      trustedExecutionTime: trustedExecutionInstant.toISOString(),
      formattedUtc,
      formattedLocalOffset,
      clockSkewSeconds,
      errorCode: 'LOCAL_AS_UTC_DEFECT',
      errorMessage: `Timestamp ${observedAtInput} relabeled local wall-clock time with UTC 'Z' suffix.`
    };
  }

  // 2. Future Timestamp & Clock Skew Guard
  if (clockSkewSeconds > maxAllowedSkewSeconds) {
    return {
      valid: false,
      observedAt: observedAtInput,
      retrievedAt: retrievedAtInput,
      trustedExecutionTime: trustedExecutionInstant.toISOString(),
      formattedUtc,
      formattedLocalOffset,
      clockSkewSeconds,
      errorCode: 'FUTURE_TIMESTAMP_INVALID',
      errorMessage: `Evidence timestamp ${observedAtInput} exceeds trusted execution time by ${clockSkewSeconds}s (max allowed ${maxAllowedSkewSeconds}s).`
    };
  }

  return {
    valid: true,
    observedAt: obsDate.toISOString(),
    retrievedAt: retDate.toISOString(),
    trustedExecutionTime: trustedExecutionInstant.toISOString(),
    formattedUtc,
    formattedLocalOffset,
    clockSkewSeconds
  };
}
