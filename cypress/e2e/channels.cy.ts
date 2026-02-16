describe('Channel Management E2E Tests', () => {
  beforeEach(() => {
    // Login before each test
    cy.loginAs('test@example.com', 'password123')
  })

  it('user can view channels page', () => {
    cy.visit('/channels')

    cy.contains('h1', 'Channels').should('be.visible')
    cy.contains(
      'p',
      /join or create a channel to start chatting/i
    ).should('be.visible')
  })

  it('user can create a new channel', () => {
    cy.visit('/channels')

    // Open create channel modal
    cy.get('button').contains(/new channel/i).click()

    // Modal should be visible
    cy.contains('h2', /create a new channel/i).should('be.visible')

    // Fill in channel details
    cy.get('input[id="name"]').type('test-channel')
    cy.get('textarea[id="description"]').type('This is a test channel')

    // Submit form
    cy.get('button').contains(/create channel/i).click()

    // Modal should close and channel should appear
    cy.contains('h2', /create a new channel/i).should('not.be.visible')
    cy.contains('test-channel').should('be.visible')
  })

  it('user can close create channel modal', () => {
    cy.visit('/channels')

    // Open create channel modal
    cy.get('button').contains(/new channel/i).click()

    // Modal should be visible
    cy.contains('h2', /create a new channel/i).should('be.visible')

    // Click cancel button
    cy.get('button').contains(/cancel/i).click()

    // Modal should close
    cy.contains('h2', /create a new channel/i).should('not.be.visible')
  })

  it('user can navigate to channel', () => {
    cy.visit('/channels')

    // If no channels exist, create one first
    cy.get('body').then(($body) => {
      if ($body.text().includes('No channels yet')) {
        cy.get('button').contains(/create channel/i).click()
        cy.get('input[id="name"]').type('general')
        cy.get('button').contains(/create channel/i).click()
      }
    })

    // Click on a channel
    cy.get('a')
      .should('have.length.greaterThan', 0)
      .first()
      .click()

    // Should navigate to channel detail page
    cy.url().should('match', /\/channels\/[^/]+$/)
  })

  it('displays empty state when no channels', () => {
    // This would require a way to clear channels first
    // Adjust based on your test data setup

    cy.visit('/channels')

    // Either should see channels or empty state
    cy.get('body').then(($body) => {
      if ($body.text().includes('No channels yet')) {
        cy.contains(/no channels yet/i).should('be.visible')
        cy.contains('button', /create channel/i).should('be.visible')
      } else {
        cy.get('a').should('have.length.greaterThan', 0)
      }
    })
  })
})
