/// <reference types="cypress" />

const hasQueryOrMutation = (req, queryName) => 
(req.body.hasOwnProperty("operationName") && req.body.operationName === (queryName)) ||
(req.body.hasOwnProperty("query") && req.body.query.includes(queryName))

context('Apollo Fullstack Tests', () => {
  beforeEach(() => {

    cy.intercept("POST", `${Cypress.env('apiUrl')}/graphql`, (req) => {
      const { body } = req
      if (hasQueryOrMutation(req, "Login")) {
        req.alias = "gqlIsUserLoggedInQuery";
      }

      if (hasQueryOrMutation(req, "GetLaunchList")) {
        req.alias = "gqlGetLaunchListQuery";
      }
    });

    cy.visit('/')
    cy.login("fake@email.com")
  })

  it('logs in and loads the space explorer page', () => {
    cy.wait(["@gqlIsUserLoggedInQuery", "@gqlGetLaunchListQuery"])
    cy.get("h2").should("have.text", "Space Explorer")

    cy.getBySelLike("launch-list-item").its("length").should("be.gte", 1)
  })
})
