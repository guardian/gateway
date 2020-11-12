class CommunicationsPage {
  static URL = '/consents/communication';

  getCheckboxes() {
    return cy.get('[type="checkbox"]');
  }

  getOptinCheckboxes() {
    return this.getCheckboxes().not('[name*="_optout"]');
  }
}

module.exports = CommunicationsPage;
