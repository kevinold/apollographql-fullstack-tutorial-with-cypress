/// <reference types="cypress" />

const hasQueryOrMutation = (req, queryName) => 
(req.body.hasOwnProperty("operationName") && req.body.operationName === (queryName)) ||
(req.body.hasOwnProperty("query") && req.body.query.includes(queryName))

const apiGraphQL = `${Cypress.env("apiUrl")}/graphql`;

context('Apollo Fullstack Tests', () => {
  beforeEach(() => {
    cy.intercept('POST', apiGraphQL, (req) => {
      const { body } = req
      if (hasQueryOrMutation(req, "Login")) {
        req.alias = "gqlIsUserLoggedInQuery";
      }

      if (hasQueryOrMutation(req, "GetLaunchList")) {
        req.alias = "gqlGetLaunchListQuery";
      }

      if (hasQueryOrMutation(req, "LaunchDetails")) {
        req.alias = "gqlLaunchDetailsQuery";
      }

      if (hasQueryOrMutation(req, "BookTrips")) {
        req.alias = "gqlBookTripsMutation";
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

    cy.getBySelLike("launch-list-tile").its("length").should("be.gte", 1)
  })

  it('paginate the launches page', () => {
    cy.wait("@gqlGetLaunchListQuery")

    cy.getBySelLike("launches-load-more-button").click()
    cy.getBySel("apollo-loading").should('exist')

    cy.wait("@gqlGetLaunchListQuery")
    cy.getBySel("apollo-loading").should('not.exist')

    cy.getBySelLike("launch-list-tile").its("length").should("be.gte", 20)
  })

  it('should not display the load more button on the launches page', () => {
    cy.intercept('POST', apiGraphQL, (req) => {
      const { body } = req
      if (hasQueryOrMutation(req, "GetLaunchList")) {
        req.alias = "gqlGetLaunchListQuery";
        req.continue((res) => {
          res.body.data.launches.hasMore = false
          res.body.data.launches.launches = res.body.data.launches.launches.slice(5)
        })
      }
    });

    // Must visit after cy.intercept
    cy.visit('/')

    cy.wait("@gqlGetLaunchListQuery")

    cy.getBySelLike("launch-list-tile").its("length").should("be.gte", 1)
    cy.getBySelLike("launch-list-tile").its("length").should("be.lt", 20)

    cy.getBySelLike("launches-load-more-button").should("not.exist")
  })

  it.only('should book a trip on a launch', () => {
    cy.wait("@gqlGetLaunchListQuery")

    cy.getBySelLike("launch-list-tile").first().click()

    cy.wait("@gqlLaunchDetailsQuery")

    cy.getBySel("launch-detail-card").should("exist")

    cy.getBySel("action-button")
      .should("have.text", "Add to Cart")
      .click()
      .should("have.text", "Remove from Cart")

    cy.getBySel("menu-cart").click()

    cy.getBySelLike("launch-list-tile").its("length").should("be.gte", 1)

    cy.getBySel("book-button").click()

    cy.wait("@gqlBookTripsMutation")

    cy.getBySel("empty-message").should("exist")
    
    cy.getBySel("menu-home").click()

    cy.getBySelLike("launch-list-tile").first().click()

    cy.getBySel("action-button")
      .should("have.text", "Cancel Trip")
  })
})
