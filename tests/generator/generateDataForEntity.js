import RandExp from 'randexp';

export const generateDataForEntity = model => {
  const generatedData = {};

  for (const field in model) {
    const fieldType = model[field].type;
    const fieldRules = model[field];

    if (fieldRules.default !== undefined) {
      generatedData[field] = fieldRules.default;
      continue;
    }

    if (fieldType === 'string') {
      if (fieldRules.regex) {
        generatedData[field] = new RandExp(fieldRules.regex).gen();
      } else {
        generatedData[field] = Math.random().toString(36).substring(7);
      }
    } else if (fieldType === 'number') {
      const min = fieldRules.min || 0;
      const max = fieldRules.max || 100;
      generatedData[field] = Math.floor(Math.random() * (max - min + 1)) + min;
    } else if (fieldType === 'boolean') {
      generatedData[field] = Math.random() < 0.5;
    }
  }
  return generatedData;
};
