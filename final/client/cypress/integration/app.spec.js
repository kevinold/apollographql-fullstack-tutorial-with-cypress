/// <reference types="cypress" />
import { random } from 'lodash'
import { hasQuery, aliasQuery, aliasMutation} from "../utils/graphql-test-utils"

const apiGraphQL = `${Cypress.env("apiUrl")}/graphql`;

context('Apollo Fullstack Tests', () => {
  beforeEach(() => {
    cy.intercept('POST', apiGraphQL, (req) => {
      // Queries
      aliasQuery(req, "GetLaunchList")
      aliasQuery(req, "LaunchDetails")
      aliasQuery(req, "GetMyTrips")

      // Mutations
      aliasMutation(req, "Login")
      aliasMutation(req, "BookTrips")
    });

    cy.visit('/')
    cy.login(`testinguser${random(0,34523526214523452345)}@example.com`)
    cy.wait("@gqlLoginMutation").then(resp => {
      expect(resp.response.body.data.login.id).to.exist
      expect(resp.response.body.data.login.token).to.exist
    })
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
      if (hasQuery(req, "GetLaunchList")) {
        req.alias = "gqlGetLaunchListQuery";
        req.reply((res) => {
          res.body.data.launches.hasMore = false
          res.body.data.launches.launches = res.body.data.launches.launches.slice(5)
        })
      }
    });

    // Must visit after cy.intercept
    cy.visit('/')

    cy.wait("@gqlGetLaunchListQuery").then(({ response: { body } }) => {
      expect(body.data.launches.hasMore).to.be.false
      expect(body.data.launches.launches.length).to.be.lte(20)
    })

    cy.getBySelLike("launch-list-tile").its("length").should("be.gte", 1)
    cy.getBySelLike("launch-list-tile").its("length").should("be.lt", 20)

    cy.getBySelLike("launches-load-more-button").should("not.exist")
  })

  it('should book a trip on a launch', () => {
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

    cy.wait("@gqlBookTripsMutation").then(resp => {
      expect(resp.response.body.data.bookTrips.success).to.be.true
    })

    cy.getBySel("empty-message").should("exist")
    
    cy.getBySel("menu-home").click()

    cy.getBySelLike("launch-list-tile").first().click()

    cy.getBySel("action-button")
      .should("have.text", "Cancel This Trip")

    cy.getBySel("menu-profile").click()

    cy.wait("@gqlGetMyTripsQuery")

    cy.getBySelLike("launch-list-tile").its("length").should("be.gte", 1)
  })
})
