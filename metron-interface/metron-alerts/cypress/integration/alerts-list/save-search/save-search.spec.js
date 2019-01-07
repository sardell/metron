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

context('Alerts list: save search', () => {

  beforeEach(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: '/api/v1/user',
      response: 'user'
    });
    cy.route({
      method: 'POST',
      url: 'logout',
      response: []
    });

    cy.route('GET', '/api/v1/global/config', 'fixture:config.json');
    cy.route('POST', 'search', 'fixture:search.json');

    cy.visit('login');
    cy.get('[name="user"]').type('user');
    cy.get('[name="password"]').type('password');
    cy.contains('LOG IN').click();
  });

  it('should display all the default values for saved searches', () => {
    cy.contains('Searches').click();
    cy.get('app-saved-searches .form-title').should('have.text', ' Searches ');
    cy.get('[data-name="recent-searches"] li').should('have.length', 0);
    cy.get('[data-name="saved-searches"] li').should('have.length', 0);
    cy.get('[data-name="recent-searches"] i').should('have.text', ' No Recent Searches  ');
    cy.get('[data-name="saved-searches"] i').should('have.text', ' No Saved Searches  ');
  });

  it('should have all save search controls and they save search should be working', () => {
    cy.get('.save-button').click();
    cy.get('app-save-search #name').type('e2e-1');
    cy.get('app-save-search button[type="submit"]').click();

    cy.contains('Searches').click();
    cy.get('[data-name="saved-searches"] li').should('have.text', '\n      e2e-1\n      \n       \n    ');
  });

  it('should delete search items from search box', () => {
    cy.get('.btn-search-clear').click();
    cy.get('.ace_line').should('have.text', '*');
    cy.get('.col-form-label-lg').should('have.text', ' Alerts (104593) ');
    cy.contains('table tr td a', 'FR').click();
    cy.get('.ace_line').should('have.text', 'enrichments:geo:ip_dst_addr:country:FR');

    cy.get('.ace_keyword').trigger('mouseover');
    cy.get('.ace_value i').click();
    cy.get('.ace_line').should('have.text', '*');
  });

  it('should delete first search items from search box having multiple search fields', () => {
    const force = { force: true }; // force -> true bcoz it's hidden

    cy.get('.btn-search-clear').click();
    cy.get('.ace_line').should('have.text', '*');
    cy.get('.col-form-label-lg').should('have.text', ' Alerts (104593) ');

    cy.contains('table tr td a', 'FR').click();
    cy.get('.ace_line').should('have.text', 'enrichments:geo:ip_dst_addr:country:FR');

    cy.contains('table tr td a[data-qe-id="cell-2"]', 'bro').click();
    cy.get('.ace_line').should('have.text', 'enrichments:geo:ip_dst_addr:country:FR AND source:type:bro');

    cy.get('.ace_keyword').eq(0).trigger('mouseover');
    cy.get('.ace_value').eq(0).find('i').click();
    cy.get('.ace_line').should('have.text', 'source:type:bro');

    cy.get('.ace_keyword').eq(0).trigger('mouseover');
    cy.get('.ace_value').eq(0).find('i').click();
    cy.get('.ace_line').should('have.text', '*');
  });

  it('manually entering search queries to search box and pressing enter key should search', () => {
    const force = { force: true }; // force -> true bcoz it's hidden
    cy.get('app-alerts-list .ace_text-input').clear(force);

    cy.route({
      method: 'POST',
      url: 'search',
      response: 'fixture:alerts-list/save-search/search-US.json',
    });

    cy.get('app-alerts-list .ace_text-input')
      .type('enrichments:geo:ip_dst_addr:country:US', force)
      .type('{enter}', force);

    cy.get('.col-form-label-lg').should('have.text', ' Alerts (6) ');
    cy.get('metron-table-pagination span').should('have.text', ' 1 - 6 of 6 ');

    cy.get('app-alerts-list .ace_text-input').clear(force);

    cy.route({
      method: 'POST',
      url: 'search',
      response: 'fixture:alerts-list/save-search/search-RU.json',
    });

    cy.get('app-alerts-list .ace_text-input')
      .type('enrichments:geo:ip_dst_addr:country:RU', force)
      .type('{enter}', force);

    cy.get('.col-form-label-lg').should('have.text', ' Alerts (2) ');
    cy.get('metron-table-pagination span').should('have.text', ' 1 - 2 of 2 ');

  });
})
