class PageYourData {
  static URL = '/verify-email';
  static CONTENT = {
    PAGE_TITLE: 'Your data',
  };

  goto(token) {
    cy.visit(PageYourData.URL + '/' + token);
  }
}

module.exports = PageYourData;
