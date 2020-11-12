class YourDataPage {
  static URL = '/consents/data';

  getCheckboxes() {
    return cy.get('[type="checkbox"]');
  }
}

module.exports = YourDataPage;
