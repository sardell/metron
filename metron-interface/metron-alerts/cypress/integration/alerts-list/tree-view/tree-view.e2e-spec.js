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

describe('Test spec for tree view', function() {

    beforeEach(function () {
      cy.server();
      cy.route('GET', '/assets/app-config.json', {
        'apiRoot': '/api/v1',
        'loginPath': '/login'
      }).as('appConfig');
      cy.route({
        method: 'GET',
        url: '/api/v1/user',
        response: 'user'
      }).as('user');
      cy.route({
        method: 'POST',
        url: '/api/v1/logout',
        response: []
      });
      cy.route('GET', '/api/v1/global/config', 'fixture:config.json');
      cy.route('POST', 'search', 'fixture:search.json').as('search');
      cy.route('POST', '/api/v1/search/group', 'fixture:alerts-list/tree-view/search-group.json').as('searchGroup');

      cy.visit('login');
      cy.wait(['@appConfig', '@user']).then(() => {
        cy.get('[name="user"]').type('user');
        cy.get('[name="password"]').type('password');
        cy.contains('LOG IN').click();
      });
    });

    function dragAndDropDragula(draggedItem, target) {
      cy.get(`app-group-by div[data-name="${draggedItem}"]`)
        .trigger("mousedown", { which: 1 });
      cy.get(`app-group-by div[data-name="${target}"]`)
        .trigger("mousemove")
        .trigger("mouseup");
    }

    it('should have all group by elements', () => {
      let groupByItems = {
        'source:type': '2',
        'ip_dst_addr': '10',
        'enrichm...:country': '3',
        'ip_src_addr': '8'
      };

      cy.get('.col-form-label-lg').should('contain','Alerts (104593)');
      cy.get('app-group-by .group-by-items').should('have.length', Object.keys(groupByItems).length);
      cy.get('app-group-by .group-by-items .name').each((key, index) => {
        expect(key).to.contain(Object.keys(groupByItems)[index]);
      });
      cy.get('app-group-by .group-by-items .count').each((val, index) => {
        expect(val).to.contain(Object.values(groupByItems)[index])
      });
    });


    it('drag and drop should change group order', () => {
      cy.get('app-group-by div[data-name="source:type"]').click();
      cy.route('POST', '/api/v1/search/group', 'fixture:alerts-list/tree-view/search-group-subgroup.json').as('subgroup');
      cy.get('app-group-by div[data-name="enrichments:geo:ip_dst_addr:country"]').click();
      cy.get('[data-name="alerts_ui_e2e"] [data-qe-id="group-score"]').contains('0');
      cy.get('[data-name="alerts_ui_e2e"] [data-qe-id="group-name"]').contains('alerts_ui_e2e');
      cy.get('[data-name="alerts_ui_e2e"] [data-qe-id="group-total"]').contains('1,476');

      // force: true must be used because polling sometimes refreshes the view, which replaces the
      // element that cypress found in the DOM with a new element
      cy.get('[data-name="alerts_ui_e2e"]').click( { force: true } );
      cy.wait('@subgroup').then(() => {
        cy.get('[data-name="US"] [data-qe-id="subgroup-score"]').contains('0');
        cy.get('[data-name="US"] [data-qe-id="subgroup-name-total"]').contains('US (91)');

        cy.get('[data-name="RU"] [data-qe-id="subgroup-score"]').contains('0');
        cy.get('[data-name="RU"] [data-qe-id="subgroup-name-total"]').contains('RU (72)');

        cy.get('[data-name="FR"] [data-qe-id="subgroup-score"]').contains('0');
        cy.get('[data-name="FR"] [data-qe-id="subgroup-name-total"]').contains('FR (203)');
      });

      cy.route('POST', '/api/v1/search/search', 'fixture:search.json').as('reorder');
      cy.route('POST', '/api/v1/search/group', 'fixture:alerts-list/tree-view/search-group-enrichments.json');
      dragAndDropDragula('source:type', 'ip_src_addr');

      cy.wait('@reorder').then(() => {
        cy.get('[data-name="US"] [data-qe-id="group-score"]').contains('590');
        cy.get('[data-name="US"] [data-qe-id="group-name"]').contains('US');
        cy.get('[data-name="US"] [data-qe-id="group-total"]').contains('346');

        cy.get('[data-name="RU"] [data-qe-id="group-score"]').contains('540');
        cy.get('[data-name="RU"] [data-qe-id="group-name"]').contains('RU');
        cy.get('[data-name="RU"] [data-qe-id="group-total"]').contains('544');

        cy.get('[data-name="FR"] [data-qe-id="group-score"]').contains('999');
        cy.get('[data-name="FR"] [data-qe-id="group-name"]').contains('FR');
        cy.get('[data-name="FR"] [data-qe-id="group-total"]').contains('636');
        cy.get('[data-name="US"]').click();

        cy.get('[data-name="alerts_ui_e2e"] [data-qe-id="subgroup-score"]').contains('0');
        cy.get('[data-name="alerts_ui_e2e"] [data-qe-id="subgroup-name-total"]').contains('alerts_ui_e2e (91)');

        cy.get('[data-name="snort"] [data-qe-id="subgroup-score"]').contains('590');
        cy.get('[data-name="snort"] [data-qe-id="subgroup-name-total"]').contains('snort (59)');

        cy.get('[data-name="bro"] [data-qe-id="subgroup-score"]').contains('0');
        cy.get('[data-name="bro"] [data-qe-id="subgroup-name-total"]').contains('bro (196)');
      });
    });

    it('should have group details for single group by', () => {
      cy.get('app-group-by div[data-name="source:type"]').click();
      cy.wait(['@search','@searchGroup']).then(() => {
        cy.get('app-group-by .group-by-items.active .name').should((active) => {
          expect(active).to.contain('source:type').to.have.lengthOf(1);
        }, 'only source type group should be selected');
        cy.route('POST', '**/api/v1/search/search', 'fixture:alerts-list/tree-view/search-group-yaf.json').as('s1');


        cy.get('[data-name="alerts_ui_e2e"]').click();

        cy.wait('@s1').then(() => {
          cy.get('tr:first-of-type [data-name="guid"]').contains('68cba12e-0...ab95a9b8d7');
          cy.get('tr:first-of-type [data-name="timestamp"]').contains('2019-01-14 16:42:55');
          cy.get('tr:first-of-type [data-name="source:type"]').contains('alerts_ui_e2e');
          cy.get('tr:first-of-type [data-name="ip_src_addr"]').contains('192.168.66.121');
          cy.get('tr:first-of-type [data-name="ip_dst_addr"]').contains('192.168.66.1');
          cy.get('tr:first-of-type [data-name="enrichments:geo:ip_dst_addr:country"]').contains('US');
          cy.get('tr:first-of-type [data-name="alert_status"]').contains('NEW');
        });

        cy.route('POST', '**/api/v1/search/search', 'fixture:alerts-list/tree-view/search-group-yaf-page2.json').as('singleGroupPage2');
        cy.get('metron-table-pagination .fa-chevron-right').click();
        cy.wait('@singleGroupPage2').then(() => {
          cy.get('tr:first-of-type [data-name="guid"]').contains('9bcd672e-1...505f82f549');
          cy.get('tr:first-of-type [data-name="timestamp"]').contains('2019-01-14 16:44:49');
          cy.get('tr:first-of-type [data-name="source:type"]').contains('alerts_ui_e2e');
          cy.get('tr:first-of-type [data-name="ip_src_addr"]').contains('204.152.254.221');
          cy.get('tr:first-of-type [data-name="ip_dst_addr"]').contains('192.168.138.158');
          cy.get('tr:first-of-type [data-name="enrichments:geo:ip_dst_addr:country"]').contains('US');
          cy.get('tr:first-of-type [data-name="alert_status"]').contains('NEW');
        });

        cy.get('app-group-by div[data-name="source:type"]').click();
        cy.get('app-group-by .group-by-items.active .name').should('have.length', 0);
      })

    });

  it('should have group details for multiple group by', () => {

    let usGroupIds = ['69a78f77-0...f1fd3b6c0b', '124feed5-1...26350cc97b', '684aa6a5-4...a8cc39809a', '3171c989-d...223d891a54', 'ae5815b0-c...f2544ac68f'];
    let frGroupIds = ['1d37e485-e...658807893f', 'd616fcc8-6...d2995003e1', '593bc02b-7...b9492dec85', '3f2b9dba-6...53b59399b7', 'f4b0f661-8...e5e29aa9e2'];
    const activeGroups = ['source:type', 'ip_dst_addr', 'enrichm...:country'];

    cy.route('POST', '/api/v1/search/group', 'fixture:alerts-list/tree-view/search-src-dst-enrichments.json').as('multiGroupBy');

    cy.get('app-group-by div[data-name="source:type"]').click();
    cy.get('app-group-by div[data-name="ip_dst_addr"]').click();
    cy.get('app-group-by div[data-name="enrichments:geo:ip_dst_addr:country"]').click();

    cy.wait('@multiGroupBy');

    cy.wait(1000).then(() => {
      cy.get('app-group-by .group-by-items.active .name').should('have.length', 3).each((active, index) => {
        expect(active).to.contain(activeGroups[index]);
      });

      // Top Level Group Values should be present for alerts_ui_e2e
      cy.get('[data-name="alerts_ui_e2e"] .dash-score').contains('0');
      cy.get('[data-name="alerts_ui_e2e"] .text-light.severity-padding .title').contains('alerts_ui_e2e');
      cy.get('[data-name="alerts_ui_e2e"] .text-light.two-line .text-dark').contains('ALERTS');
      cy.get('[data-name="alerts_ui_e2e"] .text-light.two-line .title').contains('1,476');

      cy.route('POST', '/api/v1/search/group', 'fixture:alerts-list/tree-view/search-src-dst-enrichments.json').as('multiTopLevelSearch');
      cy.get('[data-name="alerts_ui_e2e"]').click();

      cy.get('[data-name="alerts_ui_e2e"] [data-name="204.152.254.221"] [data-qe-id="subgroup-score"]').invoke('text').should(t => expect(t.trim()).to.equal('0'));
      cy.get('[data-name="alerts_ui_e2e"] [data-name="204.152.254.221"] [data-qe-id="subgroup-name-total"]').invoke('text').should(t => expect(t.trim()).to.equal('204.152.254.221 (47)'));

      cy.get('[data-name="alerts_ui_e2e"] [data-name="204.152.254.221"]').click();
      cy.get('[data-name="alerts_ui_e2e"] [data-name="204.152.254.221"] + [data-name="US"] [data-qe-id="subgroup-score"]').invoke('text').should(t => expect(t.trim()).to.equal('0'));
      cy.get('[data-name="alerts_ui_e2e"] [data-name="204.152.254.221"] + [data-name="US"] [data-qe-id="subgroup-name-total"]').invoke('text').should(t => expect(t.trim()).to.equal('US (47)'));

      cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/tree-view/search-subgroup.json').as('multiSecondLevelSearch');
      cy.get('[data-name="alerts_ui_e2e"] [data-name="204.152.254.221"] + [data-name="US"]').click();
      cy.get('[data-name="alerts_ui_e2e"] [data-qe-id="USSubGroupResults"] [data-name="guid"]').should('have.length', 5).each((alert, index) => {
        expect(alert).to.contain(usGroupIds[index]);
      });
      cy.get('[data-name="alerts_ui_e2e"] [data-name="62.75.195.236"] [data-qe-id="subgroup-score"]').invoke('text').should(t => expect(t.trim()).to.equal('0'));
      cy.get('[data-name="alerts_ui_e2e"] [data-name="62.75.195.236"] [data-qe-id="subgroup-name-total"]').invoke('text').should(t => expect(t.trim()).to.equal('62.75.195.236 (197)'));

      cy.get('[data-name="alerts_ui_e2e"] [data-name="62.75.195.236"]').click();

      cy.get('[data-name="alerts_ui_e2e"] [data-name="62.75.195.236"] + [data-name="FR"] [data-qe-id="subgroup-score"]').invoke('text').should(t => expect(t.trim()).to.equal('0'));
      cy.get('[data-name="alerts_ui_e2e"] [data-name="62.75.195.236"] + [data-name="FR"] [data-qe-id="subgroup-name-total"]').invoke('text').should(t => expect(t.trim()).to.equal('FR (197)'));

      cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/tree-view/search-subgroup-FR.json').as('multiSecondLevelResults');
      cy.get('[data-name="alerts_ui_e2e"] [data-name="62.75.195.236"] + [data-name="FR"]').click();
      cy.get('[data-name="alerts_ui_e2e"] [data-qe-id="FRSubGroupResults"] [data-name="guid"]').should('have.length', 5).each((alert, index) => {
        expect(alert).to.contain(frGroupIds[index]);
      });
    });
  });

  it('should have search working for group details for multiple sub groups', () => {

    cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/tree-view/search-multi-subgroups.json').as('multiSubgroupInputSearch');
    cy.get('app-alerts-list .ace_text-input').type('enrichments:geo:ip_dst_addr:country:FR', { force: true });
    cy.get('[data-name="search"]').click();

    cy.get('.col-form-label-lg').invoke('text').should(t => expect(t.trim()).to.equal('Alerts (636)'));

    cy.route('POST', '/api/v1/search/group', 'fixture:alerts-list/tree-view/search-group-multi-subgroups.json').as('multiSubgroupTopLevelSearch');
    cy.get('app-group-by div[data-name="source:type"]').click();
    cy.get('app-group-by div[data-name="enrichments:geo:ip_dst_addr:country"]').click();

    cy.wait(1000).then(() => {
      cy.get('[data-name="alerts_ui_e2e"]').click();
      cy.get('[data-name="alerts_ui_e2e"] [data-name="FR"] [data-qe-id="subgroup-score"]').invoke('text').should(t => expect(t.trim()).to.equal('0'));
      cy.get('[data-name="alerts_ui_e2e"] [data-name="FR"] [data-qe-id="subgroup-name-total"]').invoke('text').should(t => expect(t.trim()).to.equal('FR (203)'));

      cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/tree-view/search-multi-subgroups-results.json').as('multiSubgroupSecondLevelSearch');
      cy.get('[data-name="alerts_ui_e2e"] [data-name="FR"]').click();
      cy.get('[data-name="alerts_ui_e2e"] [data-name="enrichments:geo:ip_dst_addr:country"]').each(cell => {
        expect(cell).to.contain('FR');
      });
    });
  });
});