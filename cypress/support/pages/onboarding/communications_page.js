class CommunicationsPage {
  static URL = '/consents/communication';

  static CONSENT = {
    SUBSCRIPTIONS: 'Subscriptions, membership and contributions',
    JOBS: 'Jobs',
    HOLIDAYS: 'Holidays & Vacations',
    EVENTS: 'Events & Masterclasses',
    OFFERS: 'Offers',
  };

  getCheckboxes() {
    return cy.get('[type="checkbox"]');
  }

  getOptinCheckboxes() {
    return this.getCheckboxes().not('[name*="_optout"]');
  }
}

module.exports = CommunicationsPage;
