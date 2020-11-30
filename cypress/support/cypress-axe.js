const terminalLog = (violations) => {
  cy.task(
    'log',
    `${violations.length} accessibility violation${
      violations.length === 1 ? '' : 's'
    } ${violations.length === 1 ? 'was' : 'were'} detected`,
  );
  // pluck specific keys to keep the table readable
  const violationData = violations.map(
    ({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.length,
    }),
  );

  cy.task('table', violationData);
};

// for use on page reloads after axction taken
const injectAndCheckAxe = () => {
  cy.injectAxe();
  cy.checkA11y(null, null, terminalLog);
};

module.exports = {
  terminalLog,
  injectAndCheckAxe,
};
