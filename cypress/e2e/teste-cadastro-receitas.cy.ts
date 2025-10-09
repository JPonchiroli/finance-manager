/// <reference types="cypress" />

describe("Fluxo de cadastro de nova receita", () => {
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

    it("Deve acessar a página de receitas e cadastrar uma nova receita", () => {
        // 1️⃣ Clica no link “Receitas” no Header
        cy.contains("Receitas").click();

        // 2️⃣ Garante que está na página correta
        cy.url().should("include", "/receitas");
        cy.contains("Nova Receita").should("be.visible");

        // 3️⃣ Preenche o formulário
        cy.get('input[name="description"]').type("Teste Receita Cypress");
        cy.get('input[name="amount"]').type("987.65");

        const today = new Date().toISOString().split("T")[0];
        cy.get('input[name="date"]').clear().type(today);

        cy.get('select[name="category"]').select("Salário");

        // 4️⃣ Envia o formulário
        cy.contains("Registrar Receita").click();

        // 5️⃣ Valida o sucesso
        cy.contains("Receita registrada com sucesso!", { timeout: 6000 }).should("be.visible");

        // 6️⃣ (Opcional) Verifica se o formulário foi resetado
        cy.get('input[name="description"]').should("have.value", "");
        cy.get('input[name="amount"]').should("have.value", "");
    });
});
