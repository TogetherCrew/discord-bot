export function handleBigInts(obj: any, seen = new WeakSet()): any {
  if (typeof obj === 'bigint') {
    return obj.toString(); // Convert BigInt to a string
  } else if (Array.isArray(obj)) {
    return obj.map((item) => handleBigInts(item, seen)); // Process arrays element-wise
  } else if (typeof obj === 'object' && obj !== null) {
    if (seen.has(obj)) {
      // If we've seen this object before, don't process it again
      return;
    }
    seen.add(obj); // Mark this object as seen

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = handleBigInts(value, seen); // Recursively process nested objects
    }
    return result;
  }
  return obj; // Return the value unchanged if it's neither an object nor a BigInt
}

export function removeCircularReferences<T>(obj: T): T {
  const seenObjects = new WeakMap<object, boolean>();

  function detect(obj: any, parent: any): void {
    // Explicitly check that obj is not null or undefined
    if (obj !== null && obj !== undefined && typeof obj === 'object') {
      if (seenObjects.has(obj)) {
        return;
      }
      seenObjects.set(obj, true);

      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (parent === obj[key]) {
            obj[key] = '[Circular]';
          } else {
            detect(obj[key], obj);
          }
        }
      });
    }
  }

  detect(obj, null);
  return obj;
}
