export function getApiVersion() {
  return process.env.API_VERSION ?? null;
}

export function isApiVersion(version) {
  return getApiVersion() === version;
}

export function skipUnlessVersion(requiredVersion) {
  const current = getApiVersion();
  if (current && current !== requiredVersion) {
    return true;
  }
  return false;
}
