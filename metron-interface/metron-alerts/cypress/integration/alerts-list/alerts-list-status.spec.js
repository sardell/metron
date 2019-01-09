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
context('Alerts list: status', () => {

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

  it('should change alert status for multiple alerts to OPEN', () => {
    [0,1,2].map(i => {
      cy.get('app-alerts-list tbody tr input[type="checkbox"]').eq(i).click({ force: true });
    });

    cy.route('PATCH', '/api/v1/update/patch', {});

    cy.contains('ACTIONS').click();

    ['New', 'OPEN', 'OPEN'].map((status, i) => {
      cy.get('app-alerts-list tbody tr:not(.d-none)').eq(i).find('td').eq(i === 0 ? 3 : 9).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });

    cy.get('.dropdown-menu span').contains('Open').click();

    ['OPEN', 'OPEN', 'OPEN'].map((status, i) => {
      cy.get('app-alerts-list tbody tr:not(.d-none)').eq(i).find('td').eq(i === 0 ? 3 : 9).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });
  });

  it('should change alert status for multiple alerts to DISMISS', () => {
    [3,4,5].map(i => {
      cy.get('app-alerts-list tbody tr input[type="checkbox"]').eq(i).click({ force: true });
    });

    cy.route('PATCH', '/api/v1/update/patch', {});

    cy.contains('ACTIONS').click();

    ['NEW', 'NEW', 'NEW'].map((status, i) => {
      cy.get('app-alerts-list tbody tr:not(.d-none)').eq(i + 3).find('td').eq(9).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });

    cy.get('.dropdown-menu span').contains('Dismiss').click();

    ['DISMISS', 'DISMISS', 'DISMISS'].map((status, i) => {
      cy.get('app-alerts-list tbody tr:not(.d-none)').eq(i + 3).find('td').eq(9).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });
  });

  it('should change alert status for multiple alerts to ESCALATE', () => {
    [6,7,8].map(i => {
      cy.get('app-alerts-list tbody tr input[type="checkbox"]').eq(i).click({ force: true });
    });

    cy.route('PATCH', '/api/v1/update/patch', {});

    cy.contains('ACTIONS').click();

    ['NEW', 'NEW', 'NEW'].map((status, i) => {
      cy.get('app-alerts-list tbody tr:not(.d-none)').eq(i + 6).find('td').eq(9).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });

    cy.get('.dropdown-menu span').contains('Escalate').click();

    ['ESCALATE', 'ESCALATE', 'ESCALATE'].map((status, i) => {
      cy.get('app-alerts-list tbody tr:not(.d-none)').eq(i + 6).find('td').eq(9).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });
  });

  it('should change alert status for multiple alerts to RESOLVE', () => {
    [9,10,11].map(i => {
      cy.get('app-alerts-list tbody tr input[type="checkbox"]').eq(i).click({ force: true });
    });

    cy.route('PATCH', '/api/v1/update/patch', {});

    cy.contains('ACTIONS').click();

    ['NEW', 'NEW', 'NEW'].map((status, i) => {
      cy.get('app-alerts-list tbody tr:not(.d-none)').eq(i + 9).find('td').eq(9).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });

    cy.get('.dropdown-menu span').contains('Resolve').click();

    ['RESOLVE', 'RESOLVE', 'RESOLVE'].map((status, i) => {
      cy.get('app-alerts-list tbody tr:not(.d-none)').eq(i + 9).find('td').eq(9).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });
  });

  it('should change alert status for multiple alerts to OPEN in tree view', () => {

    cy.route('POST', '/api/v1/search/group',  'fixture:alerts-list/alert-status/group.json');
    cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/alert-status/search.json');
    cy.route('PATCH', '/api/v1/update/patch', {});

    cy.get('app-group-by div[data-name="source:type"]').click();
    cy.get('app-group-by div[data-name="enrichments:geo:ip_dst_addr:country"]').click();

    cy.wait(1000);

    cy.get('.card[data-name="yaf"] .card-header').click();
    cy.get('.card[data-name="yaf"] tr[data-name="US"]').click();
    cy.get('.card[data-name="yaf"] tr[data-name="RU"]').click();
    cy.get('.card[data-name="yaf"] tr[data-name="FR"]').click();

    cy.wait(1000);

    // 1.

    [1, 2, 3].map(i => {
      cy.get('app-tree-view tbody tr').eq(i).find('input[type="checkbox"]').click({ force: true });
    });

    ['NEW', 'NEW', 'NEW'].map((status, i) => {
      cy.get('app-alerts-list tbody tr').eq(i + 1).find('td').eq(8).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });

    cy.contains('ACTIONS').click();
    cy.get('.dropdown-menu span').contains('Open').click();

    cy.wait(300);

    ['OPEN', 'OPEN', 'OPEN'].map((status, i) => {
      cy.get('app-alerts-list tbody tr').eq(i + 1).find('td').eq(8).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });

    // 2.

    [4, 5].map(i => {
      cy.get('app-tree-view tbody tr').eq(i).find('input[type="checkbox"]').click({ force: true });
    });

    ['NEW', 'NEW'].map((status, i) => {
      cy.get('app-alerts-list tbody tr').eq(i + 4).find('td').eq(8).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });

    cy.contains('ACTIONS').click();
    cy.get('.dropdown-menu span').contains('Dismiss').click();

    cy.wait(300);

    ['DISMISS', 'DISMISS'].map((status, i) => {
      cy.get('app-alerts-list tbody tr').eq(i + 4).find('td').eq(8).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });

    // 3.

    [8, 9].map(i => {
      cy.get('app-tree-view tbody tr').eq(i).find('input[type="checkbox"]').click({ force: true });
    });

    ['NEW', 'NEW'].map((status, i) => {
      cy.get('app-alerts-list tbody tr').eq(i + 8).find('td').eq(8).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });

    cy.contains('ACTIONS').click();
    cy.get('.dropdown-menu span').contains('Escalate').click();

    cy.wait(300);

    ['ESCALATE', 'ESCALATE'].map((status, i) => {
      cy.get('app-alerts-list tbody tr').eq(i + 8).find('td').eq(8).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });

    // 4.

    [10, 11, 12].map(i => {
      cy.get('app-tree-view tbody tr').eq(i).find('input[type="checkbox"]').click({ force: true });
    });

    ['NEW', 'NEW', 'NEW'].map((status, i) => {
      cy.get('app-alerts-list tbody tr').eq(i + 10).find('td').eq(8).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });

    cy.contains('ACTIONS').click();
    cy.get('.dropdown-menu span').contains('Resolve').click();

    cy.wait(300);

    ['RESOLVE', 'RESOLVE', 'RESOLVE'].map((status, i) => {
      cy.get('app-alerts-list tbody tr').eq(i + 10).find('td').eq(8).invoke('text').should((text) => {
        expect(text.trim()).to.equal(status);
      });
    });
  });
})
