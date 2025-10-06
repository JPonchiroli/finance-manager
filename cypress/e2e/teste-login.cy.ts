describe('Login Page - Finance Manager', () => {
  it('Deve efetuar login com e-mail e senha válidos', () => {

    cy.visit('https://finance-manager-lilac.vercel.app/login');

    cy.contains('Acesse sua conta').should('be.visible');

    cy.get('input#email')
      .should('be.visible')
      .type('pedronhenrique29@gmail.com');

    cy.get('input#password')
      .should('be.visible')
      .type('Pedro4321');

    cy.get('button[type="submit"]').click();

    cy.contains('Login realizado com sucesso!', { timeout: 10000 }).should('be.visible');

    cy.url({ timeout: 15000 }).should('include', '/dashboard');
  });
});
