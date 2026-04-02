export function skipUnlessVersion(requiredVersion) {
  const current = process.env.API_VERSION;
  if (current && current !== requiredVersion) {
    return true;
  }
  return false;
}
