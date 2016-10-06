"use strict";

// Simple AST node visitor builder.
let visitor = {
  build: function(functions) {
    function visit(node) {
      return functions[node.type].apply(null, arguments);
    }

    function visitNop() { }

    function visitExpression(node) {
      let extraArgs = Array.prototype.slice.call(arguments, 1);

      visit.apply(null, [node.expression].concat(extraArgs));
    }

    function visitChildren(property) {
      return function(node) {
        let extraArgs = Array.prototype.slice.call(arguments, 1);

        node[property].forEach(child => {
          visit.apply(null, [child].concat(extraArgs));
        });
      };
    }

    const DEFAULT_FUNCTIONS = {
      grammar: function(node) {
        let extraArgs = Array.prototype.slice.call(arguments, 1);

        if (node.initializer) {
          visit.apply(null, [node.initializer].concat(extraArgs));
        }

        node.rules.forEach(rule => {
          visit.apply(null, [rule].concat(extraArgs));
        });
      },

      initializer: visitNop,
      rule: visitExpression,
      named: visitExpression,
      choice: visitChildren("alternatives"),
      action: visitExpression,
      sequence: visitChildren("elements"),
      labeled: visitExpression,
      text: visitExpression,
      simple_and: visitExpression,
      simple_not: visitExpression,
      optional: visitExpression,
      zero_or_more: visitExpression,
      one_or_more: visitExpression,
      group: visitExpression,
      semantic_and: visitNop,
      semantic_not: visitNop,
      rule_ref: visitNop,
      literal: visitNop,
      class: visitNop,
      any: visitNop
    };

    Object.keys(DEFAULT_FUNCTIONS).forEach(type => {
      if (!functions.hasOwnProperty(type)) {
        functions[type] = DEFAULT_FUNCTIONS[type];
      }
    });

    return visit;
  }
};

module.exports = visitor;
