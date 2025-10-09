/// <reference types="cypress" />

describe("Fluxo de atualização de transação", () => {
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

    it("Deve editar e atualizar uma transação existente", () => {

        cy.contains("Transações").click();
        cy.url().should("include", "/transacoes");
        cy.contains("Minhas Transações", { timeout: 20000 }).should("be.visible");

        // 2️⃣ Garante que há pelo menos uma linha
        cy.get("table tbody tr").should("exist");

        // 3️⃣ Clica no botão Editar da primeira linha
        cy.get("table tbody tr")
            .first()
            .within(() => {
                cy.contains("Editar").click();
            });

        cy.get("table tbody tr")
            .first()
            .within(() => {
                cy.get('input[type="text"]').first().clear().type("Transação Atualizada Cypress");
                cy.get('input[type="number"]').clear({ force: true }).type("555.55");
            });

        // 5️⃣ Salva a edição
        cy.get("table tbody tr")
            .first()
            .within(() => {
                cy.contains("Salvar").click();
            });

        // 6️⃣ Verifica mensagem de sucesso
        cy.contains("Transação atualizada com sucesso!", { timeout: 6000 }).should("be.visible");

        // 7️⃣ (Opcional) Verifica se a tabela mostra o novo valor
        cy.get("table tbody tr")
            .first()
            .within(() => {
                cy.contains("Transação Atualizada Cypress").should("exist");
            });
    });
});
