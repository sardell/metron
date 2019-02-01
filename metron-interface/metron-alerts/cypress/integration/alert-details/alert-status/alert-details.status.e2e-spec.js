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
// import { customMatchers } from '../../matchers/custom-matchers';

describe('Test spec for metron details page', function() {

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

      cy.route({
          method: 'GET',
          url: '/api/v1/pcap?state=*',
          response: []
      }).as('runningJobs');

      cy.visit('login');
      cy.get('[name="user"]').type('user');
      cy.get('[name="password"]').type('password');
      cy.contains('LOG IN').click();
    });

  // Commented out due to a currently opened bug when trying to change status
  it('should change alert statuses', () => {
    cy.fixture('alert-details/alert-status/findOne.json').as('findOne');
    cy.fixture('alert-details/alert-status/patch.json').as('patch');
    cy.route('POST', '**/api/v1/search/findOne', '@findOne').as('findOneResponse');
    cy.route('PATCH', '**/api/v1/update/patch', '@patch').as('patchResponse');
    cy.route('POST', '**/api/v1/alerts/ui/escalate', []);
    cy.get('@findOne').then((res) => {
      res.alert_status = "NEW"
    });
    cy.get('[data-qe-id="row-3"] td:nth-of-type(11)').click();
    cy.wait('@findOneResponse');

    cy.get('[data-name="open"]').click();
    cy.get('[data-qe-id="alert_status_value"]').scrollIntoView().should('contain', 'OPEN')

    cy.get('[data-name="dismiss"]').click();
    cy.get('[data-qe-id="alert_status_value"]').should('contain', 'DISMISS')

    cy.get('[data-name="escalate"]').click();
    cy.get('[data-qe-id="alert_status_value"]').should('contain', 'ESCALATE')

    cy.get('[data-name="resolve"]').click();
    cy.get('[data-qe-id="alert_status_value"]').should('contain', 'RESOLVE')
  });

  it('should add comments for table view', () => {
    const comment1 = 'This is a sample comment';
    const comment2 = 'Yet another comment';
    const userNameAndTimestamp = '- user - a few seconds ago';
    cy.fixture('alert-details/alert-status/update-add-comment.json').as('addCommentResponse');
    cy.get('@addCommentResponse').then((res) => {
      res.document.comments = [{ "comment": comment1, "username": "user", "timestamp": 1548159968723 }]
    });

    cy.route('POST', '**/api/v1/update/add/comment', '@addCommentResponse').as('addComment');
    cy.route('POST', '**/api/v1/search/findOne', 'fixture:alert-details/alert-status/findOne.json').as('findOne');

    cy.get('[data-qe-id="row-2"] td:nth-of-type(9)').click();
    cy.wait('@findOne');
    cy.get('app-alert-details .fa.fa-comment').click();

    // add comment1
    cy.get('app-alert-details textarea').type(comment1);
    cy.get('[data-qe-id="add-comment-button"]').click();
    cy.get('[data-qe-id="comment"]').first().should('contain', comment1);
    cy.get('[data-qe-id="username-timestamp"]').first().should('contain', userNameAndTimestamp);
    cy.wait('@addComment');

    // add comment2 (commented out until PR #1307 is merged: https://github.com/apache/metron/pull/1307)
    // cy.get('@addCommentResponse').then((res) => {
    //   res.document.comments = [
    //     { "comment": comment1, "username": "user", "timestamp": 1548159968723 },
    //     { "comment": comment2, "username": "user", "timestamp": 1548159968723 }
    //   ]
    // });
    // cy.get('app-alert-details textarea').clear().type(comment2);
    // cy.get('[data-qe-id="add-comment-button"]').click();
    // cy.get('[data-qe-id="comment"]').first().should('contain', comment2);
    // cy.get('[data-qe-id="username-timestamp"]').first().should('contain', userNameAndTimestamp);
    // cy.wait('@addComment');

    // cancel comment deletion
    cy.get('[data-qe-id="delete-comment"]').invoke('show').first().click({force:true});
    cy.get('[data-qe-id="modal-cancel"]').click();

    // delete comment2 (commented out until PR #1307 is merged: https://github.com/apache/metron/pull/1307)
    // cy.get('[data-qe-id="delete-comment"]').invoke('show').first().click({force:true});
    // cy.get('[data-qe-id="comment"]').first().should('contain', comment1);
    // cy.get('[data-qe-id="username-timestamp"]').first().should('contain', userNameAndTimestamp);

    // delete comment1
    cy.get('[data-qe-id="delete-comment"]').invoke('show').first().click({force:true});
    cy.get('[data-qe-id="modal-confirm"]').click();
    cy.get('[data-qe-id="comment"]').should('not.exist');
    cy.get('.close-button').click();
  });

  it('should add comments for tree view', () => {
    let comment1 = 'This is a sample comment';
    let userNameAndTimestamp = '- user - a few seconds ago';

    cy.fixture('alert-details/alert-status/update-add-comment.json').as('addCommentResponse');
    cy.route('POST', '**/api/v1/search/search', 'fixture:alerts-list/tree-view/search-group-yaf.json').as('singleGroupPage1');
    cy.route('POST', '/api/v1/search/group', 'fixture:alerts-list/tree-view/search-group.json').as('searchGroup');
    cy.route('POST', '**/api/v1/update/add/comment', '@addCommentResponse').as('addComment');
    cy.route('POST', '**/api/v1/search/findOne', 'fixture:alert-details/alert-status/findOne.json').as('findOne');

    cy.get('@addCommentResponse').then((res) => {
      res.document.comments = [{ "comment": comment1, "username": "user", "timestamp": 1548159968723 }]
    });

    cy.get('app-group-by div[data-name="source:type"]').click();
    cy.get('[data-name="alerts_ui_e2e"]').click();
    cy.wait(['@searchGroup','@singleGroupPage1']);
    cy.get('app-tree-view tbody tr:first-of-type td:first-of-type').click();
    cy.wait('@findOne');
    cy.get('app-alert-details .fa.fa-comment').click();

    // add comment
    cy.get('app-alert-details textarea').type(comment1);
    cy.get('[data-qe-id="add-comment-button"]').click();
    cy.get('[data-qe-id="comment"]').first().should('contain', comment1);
    cy.get('[data-qe-id="username-timestamp"]').first().should('contain', userNameAndTimestamp);
    cy.wait('@addComment');

    // delete comment
    cy.get('[data-qe-id="delete-comment"]').invoke('show').first().click({force:true});
    cy.get('[data-qe-id="modal-confirm"]').click();
    cy.get('[data-qe-id="comment"]').should('not.exist');
    cy.get('.close-button').click();

  });

});