// Cypress support file
// Custom commands and utility functions for E2E tests

// Login command
Cypress.Commands.add('loginAs', (email: string, password: string) => {
  cy.visit('/auth/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button').contains(/login/i).click()
  cy.url().should('include', '/channels')
})

// Create channel command
Cypress.Commands.add('createChannel', (name: string, description?: string) => {
  cy.get('button')
    .contains(/new channel|create channel/i)
    .click()
  cy.get('input[id="name"]').type(name)
  if (description) {
    cy.get('textarea[id="description"]').type(description)
  }
  cy.get('button')
    .contains(/create channel/i)
    .click()
})

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(email: string, password: string): Chainable<void>
      createChannel(name: string, description?: string): Chainable<void>
    }
  }
}

export {}
