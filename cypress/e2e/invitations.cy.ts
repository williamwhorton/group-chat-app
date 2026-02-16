describe('Channel Invitations', () => {
  const ownerEmail = `owner-${Date.now()}@example.com`
  const recipientEmail = `recipient-${Date.now()}@example.com`
  const channelName = `Invite Test Channel ${Date.now()}`

  before(() => {
    // Sign up owner
    cy.visit('/signup')
    cy.get('input[type="email"]').type(ownerEmail)
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/channels')

    // Create channel
    cy.get('button').contains('Create Channel').click()
    cy.get('input[placeholder="Channel Name"]').type(channelName)
    cy.get('button[type="submit"]').click()
    cy.contains(channelName).click()
  })

  it('allows owner to create and revoke invitations', () => {
    cy.contains('button', 'Invite').click()
    cy.get('input[placeholder="user@example.com"]').type(recipientEmail)
    cy.get('button').contains('Invite').click()

    cy.contains('Invitation Link:').should('be.visible')
    cy.get('input[readOnly]')
      .invoke('val')
      .then((inviteUrl) => {
        expect(inviteUrl).to.contain('/invite/')
      })

    cy.contains(recipientEmail).should('be.visible')

    // Revoke
    cy.get('button').contains('Revoke').click()
    cy.contains(recipientEmail).should('not.exist')
  })

  it('allows recipient to join via link', () => {
    // Owner creates a fresh invite
    cy.contains('button', 'Invite').click()
    cy.get('input[placeholder="user@example.com"]').type(recipientEmail)
    cy.get('button').contains('Invite').click()

    let inviteUrl: string
    cy.get('input[readOnly]')
      .invoke('val')
      .then((val) => {
        inviteUrl = val as string

        // Logout owner
        cy.get('button').contains('Sign Out').click()

        // Sign up recipient
        cy.visit('/signup')
        cy.get('input[type="email"]').type(recipientEmail)
        cy.get('input[type="password"]').type('password123')
        cy.get('button[type="submit"]').click()
        cy.url().should('include', '/channels')

        // Visit invite link
        cy.visit(inviteUrl)
        cy.contains(channelName).should('be.visible')
        cy.get('button').contains('Join Channel').click()

        // Should be redirected to channel
        cy.url().should('match', /\/channels\/[0-9a-f-]+/)
        cy.contains(channelName).should('be.visible')
      })
  })
})
