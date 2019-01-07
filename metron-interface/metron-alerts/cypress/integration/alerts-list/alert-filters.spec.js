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
context('Alerts list: alert filters', () => {

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
    cy.route('POST', 'search', 'fixture:search.json');

    cy.visit('login');
    cy.get('[name="user"]').type('user');
    cy.get('[name="password"]').type('password');
    cy.contains('LOG IN').click();
  });

  it('should display facets data', () => {
    cy.get('app-alert-filters .title').should('have.text', ' Filters');

    const facetValues = [
      'enrichm...:country   3',
      'ip_dst_addr   10',
      'ip_src_addr   8',
      'source:type   3'
    ];
    cy.get('app-alert-filters metron-collapse .collapsed').each((el, i) => {
      expect(el.text().trim()).to.equal(facetValues[i]);
    });
  });

  it('should search when facet is selected', () => {
    cy.get('metron-collapse').eq(1).find('a').click();
    cy.get('metron-collapse').eq(1).find('.collapse').should('have.class', 'show');

    cy.route('POST', 'search', 'fixture:alerts-list/alert-filters/search.json');

    cy.get('metron-collapse').eq(1).find('li[title="95.163.121.204"]').click();
    cy.get('.col-form-label-lg').should('have.text', ' Alerts (2) ');
  });
})
