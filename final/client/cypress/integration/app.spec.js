/// <reference types="cypress" />

context('Apollo Fullstack Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('.action-email')
      .type('fake@email.com').should('have.value', 'fake@email.com')
  })

  it('', () => {
  })
})
