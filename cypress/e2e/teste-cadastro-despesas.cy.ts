/// <reference types="cypress" />
describe("Fluxo de cadastro de nova despesa", () => {
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

    it("Deve acessar a página de despesas e cadastrar uma nova despesa", () => {
        // 1️⃣ Acessa a página de Despesas pelo link no Header
        cy.contains("Despesas").click();

        // 2️⃣ Garante que está na página correta
        cy.url().should("include", "/despesas");
        cy.contains("Nova Despesa").should("be.visible");

        // 3️⃣ Preenche o formulário
        cy.get('input[name="description"]').type("Teste de Despesa Cypress");
        cy.get('input[name="amount"]').type("123.45");

        // Data de hoje (no formato YYYY-MM-DD)
        const today = new Date().toISOString().split("T")[0];
        cy.get('input[name="date"]').clear().type(today);

        cy.get('select[name="category"]').select("Alimentação");
        cy.get('input[type="radio"][value="Pago"]').check();

        // 4️⃣ Envia o formulário
        cy.contains("Registrar Despesa").click();

        // 5️⃣ Valida o sucesso
        cy.contains("Despesa registrada com sucesso!").should("be.visible");

        // 6️⃣ (Opcional) Verifica se o formulário foi resetado
        cy.get('input[name="description"]').should("have.value", "");
        cy.get('input[name="amount"]').should("have.value", "");
    });
});
