import { attachment } from "allure-js-commons";

const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

const INDENT = "      ";

function colorForStatus(status) {
  if (status >= 200 && status < 300) return COLORS.green;
  if (status >= 400 && status < 500) return COLORS.yellow;
  return COLORS.red;
}

export const stepLogger = {
  async request(method, url, data) {
    const methodStr = `${COLORS.cyan}${method.toUpperCase()}${COLORS.reset}`;
    const urlStr = `${url}`;
    let line = `${INDENT}  → ${methodStr} ${urlStr}`;

    if (data && typeof data === "object") {
      const summary = Object.entries(data)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      line += ` ${COLORS.dim}(${summary})${COLORS.reset}`;
    }

    console.log(line);
    await attachment(
      `Request: ${method.toUpperCase()} ${url}`,
      JSON.stringify({ method: method.toUpperCase(), url, body: data }, null, 2),
      "application/json",
    );
  },

  async response(status, modelName) {
    const color = colorForStatus(status);
    let line = `${INDENT}  ← ${color}${status}${COLORS.reset}`;

    if (modelName) {
      line += ` ${COLORS.dim}${modelName}${COLORS.reset}`;
    }

    console.log(line);
    await attachment(
      `Response: ${status}`,
      JSON.stringify({ status, model: modelName }, null, 2),
      "application/json",
    );
  },

  async error(status, errorMessages) {
    const color = colorForStatus(status);
    const msgs = Array.isArray(errorMessages)
      ? errorMessages.join("; ")
      : errorMessages;
    console.log(
      `${INDENT}  ← ${color}${status}${COLORS.reset} ${COLORS.dim}${msgs}${COLORS.reset}`,
    );
    await attachment(
      `Error: ${status}`,
      JSON.stringify({ status, messages: errorMessages }, null, 2),
      "application/json",
    );
  },

  step(message) {
    console.log(`${INDENT}  ● ${message}`);
  },
};
