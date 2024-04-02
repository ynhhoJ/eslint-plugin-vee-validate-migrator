import { Rule } from "eslint";

function hasVariableFieldAndValueSlot(variables: unknown) {
  let hasFieldSlot = false;
  let hasValueSlot = false;

  // @ts-expect-error todo
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

function addValidationProviderSlots(context: Rule.RuleContext, node: Rule.Node) {
  // @ts-expect-error todo
  const { startTag } = node;

  context.report({
    loc: startTag.loc,
    message: 'Add "field" & "value" slot',
    fix: (fixer: Rule.RuleFixer) => fixer.insertTextAfterRange([startTag.range[0], startTag.range[0] + '<ValidationProvider'.length + 1], 'v-slot="{ field, value }" ')
  });
}

function updateValidationProviderSlotsIfNeeded(context: Rule.RuleContext, node: Rule.Node) {
  // @ts-expect-error todo
  const { variables } = node;

  if (variables.length === 0) {
    addValidationProviderSlots(context, node);

    return;
  }

  const { hasFieldSlot,  hasValueSlot } = hasVariableFieldAndValueSlot(variables);

  if (!hasFieldSlot && !hasValueSlot) {
    const lastVariable = variables[variables.length - 1];

    context.report({
      loc: lastVariable.id.loc,
      message: 'Add "field" & "value" slot',
      fix: (fixer: Rule.RuleFixer) => fixer.insertTextAfterRange(lastVariable.id.range, ", field, value")
    });
  } else if (!hasFieldSlot) {
    const lastVariable = variables[variables.length - 1];

    context.report({
      loc: lastVariable.id.loc,
      message: 'Add "field" slot',
      fix: (fixer: Rule.RuleFixer) => fixer.insertTextAfterRange(lastVariable.id.range, ", field")
    });
  } else if (!hasValueSlot) {
    const lastVariable = variables[variables.length - 1];

    context.report({
      loc: lastVariable.id.loc,
      message: 'Add "value" slot',
      fix: (fixer: Rule.RuleFixer) => fixer.insertTextAfterRange(lastVariable.id.range, ", value")
    });
  }
}

// @ts-expect-error todo
function findModelAttribute(currentNode) {
  let i,
    currentChild,
    result;

  // @ts-expect-error todo
  const hasCurrentNodeModel = currentNode?.startTag?.attributes?.find((attribute) => {
    const { name } = attribute.key;

    if (typeof name === 'string') {
      return false;
    }

    if (name.name !== 'model') {
      return false;
    }

    return true;
  });

  if (hasCurrentNodeModel) {
    return hasCurrentNodeModel;
  } else {
    // Use a for loop instead of forEach to avoid nested functions
    // Otherwise "return" will not work properly
    for (i = 0; i < currentNode?.children?.length; i += 1) {
      currentChild = currentNode.children[i];

      // Search in the current child
      result = findModelAttribute(currentChild);

      // Return the result if the node has been found
      if (result !== false) {
        return result;
      }
    }

    // The node has not been found and we have no more options
    return false;
  }
}

function moveVModelToField(context: Rule.RuleContext, node: Rule.Node) {
  const vModel = findModelAttribute(node);

  if (!vModel) {
    return;
  }

  const expressionName = vModel.value.expression.name;

  context.report({
    loc: vModel.loc,
    message: 'Rename "v-model" in "model-value"',
    fix: (fixer: Rule.RuleFixer) => [
      fixer.replaceTextRange(vModel.range, ':model-value="value"\nv-bind="field"'),
      // @ts-expect-error todo
      fixer.insertTextAfterRange(node.startTag.attributes[0].range, `\nv-model="${expressionName}"`)
    ]
  });
}

function validationProvider(context: Rule.RuleContext, node: any) {
  const startTag = {
    ...node.startTag,
    range: [node.startTag.range[0], node.startTag.range[0] + '<ValidationProvider'.length],
    loc: {
      start: node.startTag.loc.start,
      end: {
        ...node.startTag.loc.start,
        column: node.startTag.loc.start.column + '<ValidationProvider'.length
      },
    }
  };

  context.report({
    loc: {
      start: node.startTag.loc.start,
      end: {
        ...node.startTag.loc.start,
        column: node.startTag.loc.start.column + 'ValidationProvider'.length
      },
    },
    message: 'Replace "ValidationProvider" with "<Field"',
    fix: fixer => fixer.replaceText(startTag, '<Field'),
  });

  context.report({
    loc: node.endTag.loc,
    message: 'Replace end tag "ValidationProvider" with "Field"',
    fix: fixer => fixer.replaceText(node.endTag, '</Field>'),
  });

  updateValidationProviderSlotsIfNeeded(context, node);
  moveVModelToField(context, node);
}

const rule: Rule.RuleModule = {
  meta: {
    fixable: 'code',
  },
  create: function (context) {
    return context.parserServices.defineTemplateBodyVisitor({
      // @ts-expect-error todo
      VElement(node) {
        if (node.rawName && node.rawName === 'ValidationObserver') {
          // console.log(node);
          const startTag = {
            ...node.startTag,
            range: [node.startTag.range[0], node.startTag.range[0] + '<ValidationObserver'.length],
            loc: {
              start: node.startTag.loc.start,
              end: {
                ...node.startTag.loc.start,
                column: node.startTag.loc.start.column + '<ValidationObserver'.length
              },
            }
          };

          context.report({
            loc: {
              start: node.startTag.loc.start,
              end: {
                ...node.startTag.loc.start,
                column: node.startTag.loc.start.column + 'ValidationObserver'.length
              },
            },
            message: 'Replace "ValidationObserver" with "<Form"',
            fix: fixer => fixer.replaceText(startTag, '<Form'),
          });

          context.report({
            loc: node.endTag.loc,
            message: 'Replace end tag "ValidationObserver" with "Form"',
            fix: fixer => fixer.replaceText(node.endTag, '</Form>'),
          });

          const { variables } = node;

          // @ts-expect-error todo
          variables.forEach((variable) => {
            if (variable.id.name !== 'invalid') {
              return;
            }

            context.report({
              loc: variable.id.loc,
              message: 'Replace end tag "invalid" with "meta"',
              fix: fixer => fixer.replaceTextRange(variable.id.range, 'meta'),
            });
          });
        }

        if (node.rawName && node.rawName === 'ValidationProvider') {
          validationProvider(context, node);
        }
      },
    });
  }
};

export = rule;
