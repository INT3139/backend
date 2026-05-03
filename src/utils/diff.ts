export interface DiffResult {
  from: any;
  to: any;
}

export type DiffSet = Record<string, DiffResult>;

/**
 * Calculates the difference between two objects.
 * Returns a DiffSet if there are changes, or null otherwise.
 */
export function calculateDiff(oldVal: any, newVal: any): DiffSet | null {
  if (!oldVal || !newVal) return null;
  const diff: DiffSet = {};
  let hasChange = false;

  const allKeys = new Set([...Object.keys(oldVal), ...Object.keys(newVal)]);
  for (const key of allKeys) {
    // Basic comparison using JSON.stringify for simplicity and consistency with existing logic
    if (JSON.stringify(oldVal[key]) !== JSON.stringify(newVal[key])) {
      diff[key] = {
        from: oldVal[key],
        to: newVal[key]
      };
      hasChange = true;
    }
  }
  return hasChange ? diff : null;
}
