/// <reference types="cypress" />

context('Apollo Fullstack Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.login()
  })

  it('logs in and loads the space explorer page', () => {
    cy.get("h2").should("have.text", "Space Explorer")
  })
})
