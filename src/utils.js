export function mergedeep(current, updates) {
  for (let key of Object.keys(updates)) {
    if (
      !Object.prototype.hasOwnProperty.call(current, key) ||
      typeof updates[key] !== "object"
    )
      current[key] = updates[key];
    else mergedeep(current[key], updates[key]);
  }
  return current;
}
