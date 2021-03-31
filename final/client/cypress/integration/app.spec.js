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
    cy.wait("@gqlIsUserLoggedInQuery")
  })

  it('load the primary launches page', () => {
    cy.getBySel("apollo-loading").should('exist')
    cy.wait("@gqlGetLaunchListQuery")
    cy.getBySel("apollo-loading").should('not.exist')
    cy.get("h2").should("have.text", "Space Explorer")

    cy.getBySelLike("launch-list-item").its("length").should("be.gte", 1)
  })

  it('paginate the launches page', () => {
    cy.wait("@gqlGetLaunchListQuery")

    cy.getBySelLike("launches-load-more-button").click()
    cy.getBySel("apollo-loading").should('exist')

    cy.wait("@gqlGetLaunchListQuery")
    cy.getBySel("apollo-loading").should('not.exist')

    cy.getBySelLike("launch-list-item").its("length").should("be.gte", 20)
  })

  it('should not display the load more button on the launches page', () => {
    cy.intercept("POST", `${Cypress.env('apiUrl')}/graphql`, (req) => {
      const { body } = req
      console.log('in cy intercept override')
      if (hasQueryOrMutation(req, "GetLaunchList")) {
        req.alias = "gqlGetLaunchListQuery";
        req.reply((res) => {
          console.log('res', res)
          //res.response.body.data.launches.hasMore = false
          res.send("")
        })
      }
    });
    cy.wait("@gqlGetLaunchListQuery")

    cy.getBySelLike("launch-list-item").its("length").should("be.gte", 1)
    cy.getBySelLike("launch-list-item").its("length").should("be.gte", 10)

    cy.getBySelLike("launches-load-more-button").should("not.exist")
  })
})
