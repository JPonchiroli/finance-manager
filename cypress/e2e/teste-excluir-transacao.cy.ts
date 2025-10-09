describe("Fluxo de exclusão de transação", () => {
    beforeEach(() => {
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

    it("Deve excluir uma transação existente", () => {

        cy.contains("Transações").click();
        cy.url().should("include", "/transacoes");

        // Seleciona a primeira linha da tabela
        cy.get("table tbody tr")
            .first()
            .within(() => {
                // Clica no botão Excluir
                cy.contains("Excluir").click();
            });

        // Confirma o alerta do browser
        cy.on("window:confirm", () => true);

        // Opcional: valida mensagem toast
        cy.get("body").contains("Transação excluída com sucesso!");
    });
});
