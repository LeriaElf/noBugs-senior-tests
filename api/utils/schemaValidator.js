import Ajv from "ajv";
import { create } from "chai-json-schema-ajv";
import { responseSchemaMap } from "../schemas/responseSchemas.js";

const ajv = new Ajv({ allErrors: true, verbose: true });

export const chaiJsonSchema = create({ ajv, verbose: true });

export function validateResponseSchema(modelClassName, data) {
  const schema = responseSchemaMap[modelClassName];
  if (!schema) {
    return;
  }

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    const errors = validate.errors
      .map((e) => `  ${e.instancePath || "/"} ${e.message}`)
      .join("\n");

    throw new Error(
      `Response schema validation failed for ${modelClassName}:\n${errors}`,
    );
  }
}
