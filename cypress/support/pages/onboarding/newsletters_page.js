class NewslettersPage {
  static URL = '/consents/newsletters';
  static NEWSLETTERS = {
    TODAY_UK: 'Guardian Today: UK',
    LONG_READ: 'The Long Read',
    GREEN_LIGHT: 'Green Light',
    BOOKMARKS: 'Bookmarks',
  };

  getCheckboxes() {
    return cy.get('[type="checkbox"]');
  }
}

module.exports = NewslettersPage;
