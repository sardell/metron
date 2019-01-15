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
context('Alerts list: meta alert', () => {

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
    cy.route('POST', '/api/v1/search/search', 'fixture:search.json').as('search-init');

    cy.visit('login');
    cy.get('[name="user"]').type('user');
    cy.get('[name="password"]').type('password');
    cy.contains('LOG IN').click();
  });

  it('should have all the steps for meta alerts workflow', () => {

    cy.route('POST', '/api/v1/search/group', 'fixture:alerts-list/meta-alert/group.json').as('group');
    cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/meta-alert/search.json').as('search');
    cy.route('POST', '/api/v1/metaalert/create', 'fixture:alerts-list/meta-alert/create.json').as('create');

    cy.wait('@search');

    cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/meta-alert/search2.json').as('search2');

    cy.get('[data-qe-id="cell-2"]').eq(0).click();

    cy.wait('@search2');

    cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/meta-alert/search3.json').as('search3');

    cy.get('app-group-by div[data-name="ip_dst_addr"]').click();

    cy.wait('@search3');
    cy.wait('@group');

    cy.get('[data-name="224.0.0.251"] .dash-score').invoke('text').should(t => expect(t.trim()).to.equal('0'));
    cy.get('[data-name="224.0.0.251"] .text-light.severity-padding .title').invoke('text').should(t => expect(t.trim()).to.equal('224.0.0.251'));
    cy.get('[data-name="224.0.0.251"] .text-light.two-line .text-dark').invoke('text').should(t => expect(t.trim()).to.equal('ALERTS'));
    cy.get('[data-name="224.0.0.251"] .text-light.two-line .title').invoke('text').should(t => expect(t.trim()).to.equal('342'));

    cy.get('[data-name="224.0.0.251"] .fa-link').eq(0).click();
    cy.get('.metron-dialog .modal-body').invoke('text').should(t => expect(t.trim()).to.equal('Do you wish to create a meta alert with 342 selected alerts?'));
    cy.get('.metron-dialog').contains('Cancel').click();

    cy.route('POST', '/api/v1/search/group', 'fixture:alerts-list/meta-alert/group2.json').as('group2');
    cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/meta-alert/search4.json').as('search4');

    cy.get('[data-name="224.0.0.251"] .fa-link').eq(0).click();
    cy.get('.metron-dialog .modal-body').invoke('text').should(t => expect(t.trim()).to.equal('Do you wish to create a meta alert with 342 selected alerts?'));

    cy.get('.metron-dialog').contains('OK').click();

    cy.wait('@create');
    cy.wait('@group2');
    cy.wait('@search4');

    cy.get('[data-name="224.0.0.251"]').should('have.length', 0);

    cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/meta-alert/search5.json').as('search5');

    cy.get('app-group-by .ungroup-button').click();

    cy.wait('@search5');

    cy.get('.col-form-label-lg').invoke('text').should(t => expect(t.trim()).to.equal('Alerts (71939)'));
    cy.get('metron-table-pagination span').invoke('text').should(t => expect(t.trim()).to.equal('1 - 25 of 71939'));
    cy.get('table tbody tr').eq(0).find('td').eq(2).find('span').invoke('text').should(t => expect(t.trim()).to.equal('(342)'));
    cy.get('table tbody tr:not(.d-none)').should('have.length', 25);
    cy.get('table tbody tr').should('have.length', 367);
    cy.get('table tbody tr.d-none').should('have.length', 342);

    cy.get('table tbody tr').eq(0).find('.icon-cell.dropdown-cell').click();

    cy.get('table tbody tr:not(.d-none)').should('have.length', 367);
    cy.get('table tbody tr').should('have.length', 367);
    cy.get('table tbody tr.d-none').should('have.length', 0);

    cy.get('app-alerts-list tbody tr input[type="checkbox"]').eq(0).click({ force: true });
    cy.contains('ACTIONS').click();

    cy.route('PATCH', '/api/v1/update/patch', {}).as('patch');

    cy.get('.dropdown-menu').contains('Open').click();

    cy.wait('@patch');

    cy.get('app-alerts-list tbody tr').eq(0).find('td a').eq(2).invoke('text').should(t => expect(t.trim()).to.equal('OPEN'));
    cy.get('app-alerts-list tbody tr').eq(1).find('td a').eq(8).invoke('text').should(t => expect(t.trim()).to.equal('OPEN'));;
    cy.get('app-alerts-list tbody tr').eq(2).find('td a').eq(8).invoke('text').should(t => expect(t.trim()).to.equal('OPEN'));;

    cy.route('POST', '/api/v1/search/findOne', 'fixture:alerts-list/meta-alert/findOne.json').as('findOne');

    cy.get('table tbody tr').eq(0).find('td').eq(5).click();

    cy.wait('@findOne');

    cy.get('app-alert-details .alert-details-title').should('have.length', 342);
    cy.get('app-alert-details .editable-text').click();
    cy.get('app-alert-details input.form-control').type('e2e-meta-alert');

    cy.get('app-alert-details .input-group .fa.fa-times').click();

    cy.get('app-alert-details .editable-text').invoke('text').should(t => expect(t.trim()).to.not.equal('e2e-meta-alert'));

    cy.get('app-alert-details .editable-text').click();
    cy.get('app-alert-details input.form-control').type('e2e-meta-alert');

    cy.get('app-alert-details .fa.fa-check').click();

    cy.get('app-alert-details .editable-text').invoke('text').should(t => expect(t.trim()).to.equal('e2e-meta-alert'));

    cy.get('app-alert-details .close-button').click();

    cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/meta-alert/search-after-rename.json');

    cy.get('app-alerts-list tbody tr input[type="checkbox"]').eq(3).click({ force: true });
    cy.contains('ACTIONS').click();
    cy.get('.dropdown-menu').contains('Add to Alert').click();

    cy.get('app-meta-alerts .form-title').invoke('text').should(t => expect(t.trim()).to.equal('Add to Alert'));
    cy.get('app-meta-alerts .title').invoke('text').should(t => expect(t.trim()).to.equal('SELECT OPEN ALERT'));
    cy.wait(300);
    cy.get('app-meta-alerts .guid-name-container div').eq(0).invoke('text').should(t => expect(t.trim()).to.equal('e2e-meta-alert (342)'));
    cy.get('app-meta-alerts .checkmark').eq(0).click();

    cy.route('POST', '/api/v1/metaalert/add/alert', 'fixture:alerts-list/meta-alert/add-alert.json').as('addAlert');

    cy.get('app-meta-alerts').eq(0).contains('ADD').click();

    cy.route('POST', '/api/v1/metaalert/remove/alert', 'fixture:alerts-list/meta-alert/remove-alert.json').as('addAlert');

    cy.get('app-table-view .fa-chain-broken').eq(1).click();
    cy.get('.metron-dialog .modal-body').invoke('text').should(t => expect(t.trim()).to.equal('Do you wish to remove the alert from the meta alert?'));
    cy.get('.metron-dialog').contains('OK').click();

    cy.get('app-table-view .fa-chain-broken').eq(0).click();
    cy.get('.metron-dialog .modal-body').invoke('text').should(t => expect(t.trim()).to.equal('Do you wish to remove all the alerts from meta alert?'));
    cy.get('.metron-dialog').contains('OK').click();
  });

  it('should create a meta alert from nesting of more than one level', () => {
    cy.wait('@search-init');
    cy.route('POST', '/api/v1/metaalert/create', {});
    cy.route('POST', '/api/v1/search/group', 'fixture:alerts-list/meta-alert/group-by-source-type.json').as('groupBySourceType');
    cy.get('app-group-by div[data-name="source:type"]').click();
    cy.wait('@groupBySourceType');
    cy.route('POST', '/api/v1/search/group', 'fixture:alerts-list/meta-alert/group-by-source-type-and-ip-dst-addr.json').as('groupBySourceTypeAndIp');
    cy.get('app-group-by div[data-name="ip_dst_addr"]').click();
    cy.wait('@groupBySourceTypeAndIp');
    cy.get('.card[data-name="yaf"] .card-header').click();
    cy.get('[data-name="yaf"] table tbody tr').eq(0).find('.fa-link').click();
    cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/meta-alert/search-after-merge.json').as('searchAfterMerge');
    cy.get('.metron-dialog').contains('OK').click();
    cy.get('app-group-by .ungroup-button').click();
    cy.get('.col-form-label-lg').invoke('text').should(t => expect(t.trim()).to.equal('Alerts (2)'));
    cy.get('metron-table-pagination span').invoke('text').should(t => expect(t.trim()).to.equal('1 - 2 of 2'));
    cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/meta-alert/search-after-merge2.json').as('searchAfterMerge2');
    cy.get('app-group-by .ungroup-button').click();
    cy.wait('@searchAfterMerge2');
    cy.get('metron-collapse').eq(3).find('a').click();
    cy.get('metron-collapse').eq(3).find('.list-group').invoke('text').should(t => {
      t = t.trim();
      const facetValues = t.split('\n');
      expect(facetValues[0].trim()).to.equal('metaalert');
      expect(facetValues[1].trim()).to.equal('2');
    });
    const groupByItems = [];
    cy.get('app-group-by .group-by-items .name').each(el => {
      groupByItems.push(el.text().trim());
    }).then(() => {
      expect(groupByItems).to.eql([
        'source:type',
        'ip_dst_addr',
        'enrichm...:country',
        'ip_src_addr',
      ]);
    });
    const countByItems = [];
    cy.get('app-group-by .group-by-items .count').each(el => {
      countByItems.push(el.text().trim());
    }).then(() => {
      expect(countByItems).to.eql([
        '3',
        '10',
        '3',
        '9',
      ]);
    });
    cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/meta-alert/search-for-guid.json');
    cy.get('app-alerts-list .ace_text-input').type('{backspace}', { force: true });
    cy.get('app-alerts-list .ace_text-input').type('guid:4218a368-f19a-4dc6-ad7b-f7d3bf33520f', { force: true });
    cy.get('app-alerts-list .ace_text-input').type('{enter}', { force: true });

    cy.get('.col-form-label-lg').invoke('text').should(t => expect(t.trim()).to.equal('Alerts (1)'));
    cy.get('table tbody tr').eq(0).find('.icon-cell.dropdown-cell').click();
    cy.get('table tbody tr').should('have.length', 3);
    cy.get('table tbody tr').eq(0).find('.icon-cell.dropdown-cell').click();

    cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/meta-alert/search-after-merge2.json');
    cy.get('.btn-search-clear').click();
    cy.get('.col-form-label-lg').invoke('text').should(t => expect(t.trim()).to.equal('Alerts (216458)'));
    cy.get('table tbody tr').eq(0).find('.icon-cell.dropdown-cell').click();

    let guids = [];
    const guidsToCompare = ["cf85cad3-a...1ecd7e51df","foobaaar\n               (341)","04aaa7f4-d...33cca94df4","90aa437d-6...4f8165bbf9","633d8dd5-b...9a399c3e16","5b433b70-1...cb3fb3ad94","011da219-f...b018527007","b65e6278-e...9e82e1e15a","613d6eae-2...da8af4ae52","941a474b-b...2d2b195ac0","6e31dfd0-1...f6a16b8607","f259d5da-5...c80df2e4a0","bdefdbd7-7...9e42bd432d","bf9a6633-3...e74c4659ef","61c46259-e...95d541dabe","ed6b4780-8...2a6c0020d1","9118b426-a...4c6b312a27","9c91a50d-8...059cedb9b8","b3f2a81f-f...64e6c2b9ab"];
    cy.get('table tbody tr td:nth-child(3)').each(el => {
      guids.push(el.text().trim());
    }).then(() => {
      expect(guids.slice(2, 21)).to.eql(guidsToCompare);
    });

    cy.route('POST', '/api/v1/search/search', 'fixture:alerts-list/meta-alert/search-after-remove.json').as('searchAfterRemove');
    cy.route('POST', '/api/v1/search/findOne', {"average":0.0,"max":"-Infinity","metron_alert":[{"iflags":0,"ip_dst_port":5353,"uflags":0,"isn":0,"adapter:geoadapter:begin:ts":"1546977706459","duration":"0.000","parallelenricher:enrich:end:ts":"1546977706462","protocol":"UDP","rpkt":0,"source:type":"yaf","adapter:threatinteladapter:end:ts":"1546977706462","ip_dst_addr":"224.0.0.251","original_string":"2019-01-08 20:01:41.000|2019-01-08 20:01:41.000|   0.000|   0.000| 17|                            192.168.66.1| 5353|                             224.0.0.251| 5353|       0|       0|       0|       0|00000000|00000000|000|000|       1|      68|       0|       0|    0|idle ","adapter:hostfromjsonlistadapter:end:ts":"1546977706459","pkt":1,"ruflags":0,"adapter:geoadapter:end:ts":"1546977706459","roct":0,"tag":0,"ip_src_addr":"192.168.66.1","rtag":0,"timestamp":1546977701000,"app":0,"oct":68,"end_reason":"idle ","parallelenricher:enrich:begin:ts":"1546977706462","risn":0,"end_time":1546977701000,"adapter:hostfromjsonlistadapter:begin:ts":"1546977706459","metaalerts":["4218a368-f19a-4dc6-ad7b-f7d3bf33520f"],"parallelenricher:splitter:begin:ts":"1546977706462","start_time":1546977701000,"riflags":0,"rtt":"0.000","ip_src_port":5353,"parallelenricher:splitter:end:ts":"1546977706462","adapter:threatinteladapter:begin:ts":"1546977706462","guid":"9af4ac68-5c3d-49bf-972f-3d7ee335a956"},{"iflags":0,"ip_dst_port":5353,"uflags":0,"isn":0,"adapter:geoadapter:begin:ts":"1546977674276","duration":"0.000","parallelenricher:enrich:end:ts":"1546977674283","protocol":"UDP","rpkt":0,"source:type":"yaf","adapter:threatinteladapter:end:ts":"1546977674282","ip_dst_addr":"224.0.0.251","original_string":"2019-01-08 20:01:09.000|2019-01-08 20:01:09.000|   0.000|   0.000| 17|                            192.168.66.1| 5353|                             224.0.0.251| 5353|       0|       0|       0|       0|00000000|00000000|000|000|       1|      68|       0|       0|    0|idle ","adapter:hostfromjsonlistadapter:end:ts":"1546977674276","pkt":1,"ruflags":0,"adapter:geoadapter:end:ts":"1546977674276","roct":0,"tag":0,"ip_src_addr":"192.168.66.1","rtag":0,"timestamp":1546977669000,"app":0,"oct":68,"end_reason":"idle ","parallelenricher:enrich:begin:ts":"1546977674281","risn":0,"end_time":1546977669000,"adapter:hostfromjsonlistadapter:begin:ts":"1546977674276","metaalerts":["4218a368-f19a-4dc6-ad7b-f7d3bf33520f"],"parallelenricher:splitter:begin:ts":"1546977674281","start_time":1546977669000,"riflags":0,"rtt":"0.000","ip_src_port":5353,"parallelenricher:splitter:end:ts":"1546977674281","adapter:threatinteladapter:begin:ts":"1546977674281","guid":"cf85cad3-af4a-47a9-ab27-461ecd7e51df"}],"threat:triage:score":0.0,"count":0,"groups":["source:type","ip_dst_addr"],"sum":0.0,"source:type":"metaalert","min":"Infinity","median":"NaN","guid":"4218a368-f19a-4dc6-ad7b-f7d3bf33520f","timestamp":1547206604793,"status":"active"}).as('findOne');
    cy.route('POST', '/api/v1/metaalert/remove/alert', {"timestamp":1547206604793,"document":{"average":0.0,"max":"-Infinity","metron_alert":[{"iflags":0,"ip_dst_port":5353,"uflags":0,"isn":0,"adapter:geoadapter:begin:ts":"1546977706459","duration":"0.000","parallelenricher:enrich:end:ts":"1546977706462","protocol":"UDP","rpkt":0,"source:type":"yaf","adapter:threatinteladapter:end:ts":"1546977706462","ip_dst_addr":"224.0.0.251","original_string":"2019-01-08 20:01:41.000|2019-01-08 20:01:41.000|   0.000|   0.000| 17|                            192.168.66.1| 5353|                             224.0.0.251| 5353|       0|       0|       0|       0|00000000|00000000|000|000|       1|      68|       0|       0|    0|idle ","adapter:hostfromjsonlistadapter:end:ts":"1546977706459","pkt":1,"ruflags":0,"adapter:geoadapter:end:ts":"1546977706459","roct":0,"tag":0,"ip_src_addr":"192.168.66.1","rtag":0,"timestamp":1546977701000,"app":0,"oct":68,"end_reason":"idle ","parallelenricher:enrich:begin:ts":"1546977706462","risn":0,"end_time":1546977701000,"adapter:hostfromjsonlistadapter:begin:ts":"1546977706459","metaalerts":["4218a368-f19a-4dc6-ad7b-f7d3bf33520f"],"parallelenricher:splitter:begin:ts":"1546977706462","start_time":1546977701000,"riflags":0,"rtt":"0.000","ip_src_port":5353,"parallelenricher:splitter:end:ts":"1546977706462","adapter:threatinteladapter:begin:ts":"1546977706462","guid":"9af4ac68-5c3d-49bf-972f-3d7ee335a956"}],"threat:triage:score":0.0,"count":0,"groups":["source:type","ip_dst_addr"],"sum":0.0,"source:type":"metaalert","min":"Infinity","median":"NaN","guid":"4218a368-f19a-4dc6-ad7b-f7d3bf33520f","timestamp":1547206604793,"status":"active"},"guid":"4218a368-f19a-4dc6-ad7b-f7d3bf33520f","sensorType":"metaalert","documentID":"AWg8szh6569OBgGeFahf"}).as('addAlert');

    cy.get('app-table-view .fa-chain-broken').eq(2).click();
    cy.get('.metron-dialog').contains('OK').click();

    cy.wait('@searchAfterRemove', {
      requestTimeout: 600000,
      responseTimeout: 600000,
    }).then(() => {
      let guids = [];
      cy.get('table tbody tr td:nth-child(3)').each(el => {
        guids.push(el.text().trim());
      }).then(() => {
        expect(guids.slice(2, 20)).to.eql(guidsToCompare.slice(1));
      });
    });

    cy.get('app-table-view .fa-chain-broken').eq(0).click();
    cy.get('.metron-dialog').contains('OK').click();
  });
})
