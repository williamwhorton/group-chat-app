describe('Authentication E2E Tests', () => {
  it('user can login with valid credentials', () => {
    cy.visit('/auth/login')

    // Verify login page elements
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains('button', /login/i).should('be.visible')

    // Fill in login form (use test credentials - adjust based on your setup)
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')

    // Submit form
    cy.contains('button', /login/i).click()

    // Verify redirect to channels page
    cy.url().should('include', '/channels')
    cy.contains('h1', 'Channels').should('be.visible')
  })

  it('displays error message with invalid credentials', () => {
    cy.visit('/auth/login')

    cy.get('input[type="email"]').type('invalid@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.contains('button', /login/i).click()

    // Error message should appear
    cy.contains(/invalid|error|failed/i).should('be.visible')

    // Should not redirect
    cy.url().should('include', '/auth/login')
  })

  it('shows sign up link', () => {
    cy.visit('/auth/login')

    cy.contains('a', /sign up/i)
      .should('be.visible')
      .should('have.attr', 'href', '/auth/sign-up')
  })
})
