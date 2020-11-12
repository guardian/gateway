class NewslettersPage {
  static URL = '/consents/newsletters';

  getCheckboxes() {
    return cy.get('[type="checkbox"]');
  }
}

module.exports = NewslettersPage;
