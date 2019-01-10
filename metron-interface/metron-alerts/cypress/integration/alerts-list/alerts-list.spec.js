/// <reference types="Cypress" />
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
context('Alerts list', () => {

  beforeEach(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: '/api/v1/user',
      response: 'user'
    });
    cy.route({
        method: 'POST',
        url: '/api/v1/logout',
        response: []
    });

    cy.route('GET', '/api/v1/global/config', 'fixture:config.json');
    cy.route('POST', '/api/v1/search/search', 'fixture:search.json').as('search');

    cy.visit('login');
    cy.get('[name="user"]').type('user');
    cy.get('[name="password"]').type('password');
    cy.contains('LOG IN').click();
  });

  it('should have all the UI elements', () => {
    cy.route('POST', '/api/v1/search/search', {
      total: 0,
      results: [],
      facetCounts: {}
    });
    cy.get('.col-form-label-lg').invoke('text').should(text => expect(text.trim()).to.equal('Alerts (0)'));
    cy.get('img[src="assets/images/logo.png"]').should('be.visible');
    cy.contains('Searches').should('be.visible');
    cy.get('.btn-search-clear').should('be.visible');
    cy.get('.btn-search').should('have.length', 2);
    cy.get('.save-button').should('be.visible');
    cy.get('.btn.settings').should('be.visible');
    cy.get('.btn.pause-play').should('be.visible');
    cy.get('.fa.fa-cog.configure-table-icon').should('be.visible');

    const options1 = [];
    cy.get('.dropdown-menu .dropdown-item.disabled').each(el => {
      options1.push(el.text().trim());
    }).then(() => {
      expect(options1).to.eql(['Open', 'Dismiss', 'Escalate', 'Resolve', 'Add to Alert']);
    });

    const options2 = [];
    cy.get('app-alerts-list .table th').each(el => {
      options2.push(el.text().trim());
    }).then(() => {
      expect(options2).to.eql(['', 'Score', 'guid', 'timestamp', 'source:type', 'ip_src_addr', 'enrichm...:country',
      'ip_dst_addr', 'host', 'alert_status', '', '', '']);
    });
  });

  it('should have all pagination controls and they should be working', () => {
    cy.wait('@search');
    cy.get('.btn.settings').click();
    cy.route('POST', '/api/v1/search/search', {
      total: 169,
      results: [],
      facetCounts: {}
    });
    cy.get('metron-table-pagination span').invoke('text').should(text => expect(text.trim()).to.equal('1 - 25 of 104593'));
    cy.get('.page-size .preset-cell').contains('100').click();
    cy.get('metron-table-pagination span').invoke('text').should(text => expect(text.trim()).to.equal('1 - 100 of 169'));

    cy.get('metron-table-pagination .fa.fa-chevron-left').should('have.class', 'disabled');
    cy.get('metron-table-pagination .fa.fa-chevron-right').should('not.have.class', 'disabled');

    cy.get('metron-table-pagination .fa.fa-chevron-right').click();
    cy.get('metron-table-pagination span').invoke('text').should(text => expect(text.trim()).to.equal('101 - 169 of 169'));

    cy.get('metron-table-pagination .fa.fa-chevron-left').should('not.have.class', 'disabled');
    cy.get('metron-table-pagination .fa.fa-chevron-right').should('have.class', 'disabled');

    cy.get('metron-table-pagination .fa.fa-chevron-left').click();
    cy.get('metron-table-pagination span').invoke('text').should(text => expect(text.trim()).to.equal('1 - 100 of 169'));
    cy.get('metron-table-pagination .fa.fa-chevron-left').should('have.class', 'disabled');
    cy.get('metron-table-pagination .fa.fa-chevron-right').should('not.have.class', 'disabled');

    cy.get('.btn.settings').click();
    cy.get('.page-size .preset-cell').contains('25').click();
    cy.get('metron-table-pagination span').invoke('text').should(text => expect(text.trim()).to.equal('1 - 25 of 169'));

    cy.get('.btn.settings').click();
  });

  it('should have all settings controls and they should be working', () => {
    cy.wait('@search');
    cy.get('.btn.settings').click();

    const settings = [];
    cy.get('app-configure-rows  form label:not(.switch)').each(el => {
      settings.push(el.text().trim());
    }).then(() => {
      expect(settings).to.eql(['REFRESH RATE', 'ROWS PER PAGE', 'HIDE Resolved Alerts', 'HIDE Dismissed Alerts']);
    });

    const rateOptions = [];
    cy.get('.preset-row.refresh-interval .preset-cell').each(el => {
      rateOptions.push(el.text().trim());
    }).then(() => {
      expect(rateOptions).to.eql(['5s', '10s', '15s', '30s', '1m', '10m', '1h']);
    });

    cy.get('.preset-row.refresh-interval .preset-cell.is-active').invoke('text').should(text => expect(text.trim()).to.equal('1m'));

    cy.get('.refresh-interval .preset-cell').contains('10s').click();
    cy.get('.preset-row.refresh-interval .preset-cell.is-active').invoke('text').should(text => expect(text.trim()).to.equal('10s'));

    cy.get('.refresh-interval .preset-cell').contains('1h').click();
    cy.get('.preset-row.refresh-interval .preset-cell.is-active').invoke('text').should(text => expect(text.trim()).to.equal('1h'));

    const pageSizes = [];
    cy.get('.preset-row.page-size .preset-cell').each(el => {
      pageSizes.push(el.text().trim());
    }).then(() => {
      expect(pageSizes).to.eql(['10', '25', '50', '100', '250', '500', '1000']);
    });

    cy.get('.preset-row.page-size .preset-cell.is-active').invoke('text').should(text => expect(text.trim()).to.equal('25'));

    cy.get('.page-size .preset-cell').contains('50').click();
    cy.get('.preset-row.page-size .preset-cell.is-active').invoke('text').should(text => expect(text.trim()).to.equal('50'));

    cy.get('.page-size .preset-cell').contains('100').click();
    cy.get('.preset-row.page-size .preset-cell.is-active').invoke('text').should(text => expect(text.trim()).to.equal('100'));

    cy.get('.page-size .preset-cell').contains('25').click();
    cy.get('.preset-row.page-size .preset-cell.is-active').invoke('text').should(text => expect(text.trim()).to.equal('25'));

    cy.get('.btn.settings').click();
  });

  it('play pause should start polling and stop polling', () => {
    cy.get('.btn.pause-play i').should('have.class', 'fa-pause');
    cy.get('.btn.pause-play').click();
    cy.get('.btn.pause-play i').should('have.class', 'fa-play');
    cy.get('.btn.pause-play').click();
    cy.get('.btn.pause-play i').should('have.class', 'fa-pause');
  });

  it('should select columns from table configuration', () => {
    cy.route('POST', '/api/v1/search/column/metadata', 'fixture:alerts-list/column-metadata.json')
      .as('metadata');
    cy.get('app-alerts-list .fa.fa-cog.configure-table-icon').click();

    cy.wait('@metadata');

    const selectedColumns = [];
    cy.get('app-configure-table input[type="checkbox"]:checked').each(el => {
      selectedColumns.push(el.attr('id').replace(/select-deselect-/, ''));
    }).then(() => {
      expect(selectedColumns).to.eql(['score', 'guid', 'timestamp', 'source:type', 'ip_src_addr', 'enrichments:geo:ip_dst_addr:country',
      'ip_dst_addr', 'host', 'alert_status']);
    });

    cy.get('app-configure-table input[type="checkbox"][id=\"select-deselect-guid\"]').click({ force: true });
    cy.get('app-configure-table input[type="checkbox"][id=\"select-deselect-id\"]').click({ force: true });

    const selectedColumns2 = [];
    cy.get('app-configure-table input[type="checkbox"]:checked').each(el => {
      selectedColumns2.push(el.attr('id').replace(/select-deselect-/, ''));
    }).then(() => {
      expect(selectedColumns2).to.eql(['score', 'timestamp', 'source:type', 'ip_src_addr', 'enrichments:geo:ip_dst_addr:country',
      'ip_dst_addr', 'host', 'alert_status', 'id']);
    });

    cy.get('app-configure-table').contains('SAVE').click();
  });

  it('should have all time-range controls', () => {
    cy.get('app-time-range button.btn-search').click();

    const ranges = [];
    cy.get('app-time-range .title').each(el => {
      ranges.push(el.text().trim());
    }).then(() => {
      expect(ranges).to.eql(['Time Range', 'Quick Ranges']);
    });

    const timeRanges = [];
    cy.get('app-time-range .quick-ranges span').each(el => {
      timeRanges.push(el.text().trim());
    }).then(() => {
      expect(timeRanges).to.eql(['Last 7 days', 'Last 30 days', 'Last 60 days', 'Last 90 days', 'Last 6 months', 'Last 1 year', 'Last 2 years', 'Last 5 years',
      'Yesterday', 'Day before yesterday', 'This day last week', 'Previous week', 'Previous month', 'Previous year', 'All time',
      'Today', 'Today so far', 'This week', 'This week so far', 'This month', 'This year',
      'Last 5 minutes', 'Last 15 minutes', 'Last 30 minutes', 'Last 1 hour', 'Last 3 hours', 'Last 6 hours', 'Last 12 hours', 'Last 24 hours']);
    });

    const valueForManualTimeRange = [];
    cy.get('app-time-range input.form-control').each(el => {
      valueForManualTimeRange.push(el.val().trim());
    }).then(() => {
      expect(valueForManualTimeRange).to.eql(['now', 'now']);
    });

    cy.get('app-time-range').contains('APPLY').should('be.visible');

    cy.get('app-time-range .time-range-text').invoke('text').should(text => expect(text.trim()).to.equal('All time'));
    cy.get('app-time-range button.btn-search').click();
  });

  it('should have all time range values populated - 1', () => {
    cy.on('uncaught:exception', () => false);
    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-7-days').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 7 days');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-30-days').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 30 days');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-60-days').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 60 days');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-90-days').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 90 days');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-1-year').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 1 year');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-2-years').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 2 years');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-5-years').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 5 years');
    });
  });

  it('should have all time range values populated - 2', () => {
    cy.on('uncaught:exception', () => false);
    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#yesterday').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Yesterday');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#day-before-yesterday').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Day before yesterday');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#this-day-last-week').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('This day last week');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#previous-week').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Previous week');
    });
  });

  it('should have all time range values populated - 3', () => {
    cy.on('uncaught:exception', () => false);
    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#today').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Today');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#this-week').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('This week');
    });
  });

  it('should have all time range values populated - 4', () => {
    cy.on('uncaught:exception', () => false);
    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-5-minutes').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 5 minutes');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-15-minutes').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 15 minutes');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-30-minutes').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 30 minutes');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-1-hour').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 1 hour');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-3-hours').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 3 hours');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-6-hours').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 6 hours');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-12-hours').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 12 hours');
    });

    cy.get('app-time-range button.btn-search').click();
    cy.wait(300);
    cy.get('#last-24-hours').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(text => {
      expect(text.trim()).to.equal('Last 24 hours');
    });
  });

  it('should disable date picker when timestamp is present in search', () => {
    cy.get('.btn-search-clear').click();
    cy.get('app-alerts-list .ace_scroller').click();

    cy.route('POST', '/api/v1/search/search', {
      total: 1,
      results: [],
      facetCounts: {}
    });

    cy.get('.col-form-label-lg').invoke('text').should(t => expect(t.trim()).to.equal('Alerts (104593)'));

    cy.get('app-alerts-list .ace_text-input')
      .type('{backspace}', { force: true })
      .type('timestamp:1505325740512', { force: true })
      .type('{enter}', { force: true });

    cy.get('.col-form-label-lg').invoke('text').should(t => expect(t.trim()).to.equal('Alerts (1)'));
    cy.get('app-time-range button.btn.btn-search[disabled=""]').should('have.length', 1);

    cy.route('POST', '/api/v1/search/search', 'fixture:search.json');

    cy.get('.btn-search-clear').click();

    cy.get('.col-form-label-lg').invoke('text').should(t => expect(t.trim()).to.equal('Alerts (104593)'));

    cy.get('app-time-range button.btn.btn-search[disabled=""]').should('have.length', 0);

    cy.route('POST', '/api/v1/search/search', {
      total: 25,
      results: [],
      facetCounts: {}
    });

    cy.get('table tr:not(.d-none) td a').contains('bro').eq(0).click();

    cy.get('.ace_line').invoke('text').should(t => expect(t.trim()).to.equal('source:type:bro'));
    cy.get('.col-form-label-lg').invoke('text').should(t => expect(t.trim()).to.equal('Alerts (25)'));
    cy.get('app-time-range button.btn.btn-search[disabled=""]').should('have.length', 0);

    cy.route('POST', '/api/v1/search/search', 'fixture:search.json');

    cy.get('.btn-search-clear').click();
    cy.get('.col-form-label-lg').invoke('text').should(t => expect(t.trim()).to.equal('Alerts (104593)'));
  });

  it('should have now included when to date is empty', () => {
    cy.get('app-time-range button.btn-search').click();
    cy.get('app-time-range .calendar').eq(0).click();
    cy.get('.pika-select.pika-select-hour').eq(0).select('23').wait(50);
    cy.get('.pika-select.pika-select-minute').eq(0).select('29').wait(50);
    cy.get('.pika-select.pika-select-second').eq(0).select('35').wait(50);
    cy.get('.pika-select.pika-select-year').eq(0).select('2017').wait(50);
    cy.get('.pika-select.pika-select-month').eq(0).select('September').wait(50);
    cy.get('.pika-table').eq(0).contains('13').click();

    cy.get('app-time-range').contains('APPLY').click();
    cy.get('app-time-range button span').eq(0).invoke('text').should(t => expect(t.trim()).to.equal('Date Range'));
    cy.get('app-time-range button span').eq(1).invoke('text').should(t => expect(t.trim()).to.equal('2017-09-13 23:29:35 to now'));

    cy.get('.btn-search-clear').click();
  });
})
