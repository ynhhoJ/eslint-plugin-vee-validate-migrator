export function hasVariableFieldAndValueSlot(variables: unknown) {
  let hasFieldSlot = false;
  let hasValueSlot = false;

  // @ts-expect-error to-do later
  variables.forEach((variable) => {
    if (variable.id.name === 'field') {
      hasFieldSlot = true;
    }

    if (variable.id.name === 'value') {
      hasValueSlot = true;
    }
  });

  return { hasFieldSlot, hasValueSlot };
}
