/// <reference types="cypress" />

describe('MANAGMe App E2E — kompletny scenariusz', () => {
  before(() => {
    cy.visit('/');
    cy.get('input[placeholder="Twój login"]').type('admin');
    cy.get('input[placeholder="********"]').type('admin123');
    cy.contains('Zaloguj się').click();
    cy.contains('Projekty', { timeout: 10000 }).should('be.visible');
  });

  it('tworzy projekt, historyjkę i zadanie, zmienia status, edytuje i usuwa', () => {
  
    cy.get('input[placeholder="Nazwa projektu"]').type('Projekt Testowy');
    cy.get('textarea[placeholder="Opis projektu"]').type('Opis Testowy');
    cy.contains('Projekty').parents('.card-body').within(() => {
      cy.contains('Dodaj').click();
    });
    cy.contains('Projekt Testowy', { timeout: 10000 }).should('exist');

    cy.contains('Wybierz aktywny projekt').parents('.card-body').within(() => {
      cy.get('select').select('Projekt Testowy');
    });

    cy.contains('Historyjki dla:').parents('.card-body').within(() => {
      cy.get('input[placeholder="Nazwa historyjki"]').type('Historia Testowa');
      cy.get('textarea[placeholder="Opis historyjki"]').type('Opis historii');
      cy.contains('Dodaj').click();
    });
    cy.contains('Historia Testowa', { timeout: 5000 }).should('exist');

    cy.contains('Zadania (Kanban)').parents('.card-body').within(() => {
      cy.get('input[placeholder="Nazwa zadania"]').type('Zadanie Testowe');
      cy.get('textarea[placeholder="Opis zadania"]').type('Opis zadania');
      cy.get('input[placeholder="Przewidywany czas (h)"]').type('2');
      cy.get('select').first().select('Historia Testowa');
      cy.contains('Dodaj').click();
    });
    cy.contains('Zadanie Testowe', { timeout: 5000 }).should('exist');

cy.contains('Zadanie Testowe').parents('li').within(() => {
  cy.get('select').select('Anna Nowak (developer)');
  cy.contains('Zakończ').click();
});

   // cy.contains('DONE', { timeout: 5000 })
  //.parents('.card') // lub '.card-body' – sprawdź, co dokładnie opakowuje kolumnę DONE
  //.within(() => {
   // cy.contains('Zadanie Testowe', { timeout: 5000 }).should('exist');
 // });

    cy.contains('Zadanie Testowe').parents('li').within(() => cy.contains('Edytuj').click());
    cy.get('input[placeholder="Nazwa zadania"]').clear().type('Zadanie Edytowane');
    cy.contains('Zaktualizuj').click();
    cy.contains('Zadanie Edytowane').should('exist');
    cy.contains('Zadanie Edytowane').parents('li').within(() => cy.contains('Usuń').click());
    cy.contains('Zadanie Edytowane').should('not.exist');

    // historyjka
    cy.contains('Historia Testowa').parents('li').within(() => cy.contains('Edytuj').click());
    cy.get('input[placeholder="Nazwa historyjki"]').clear().type('Historia Edytowana');
    cy.contains('Zaktualizuj').click();
    cy.contains('Historia Edytowana').should('exist');
    cy.contains('Historia Edytowana').parents('li').within(() => cy.contains('Usuń').click());
    cy.contains('Historia Edytowana').should('not.exist');

    // projekt
    cy.contains('Projekt Testowy').parents('li').within(() => cy.contains('Edytuj').click());
    cy.get('input[placeholder="Nazwa projektu"]').clear().type('Projekt Edytowany');
    cy.contains('Zaktualizuj').click();
    cy.contains('Projekt Edytowany').should('exist');
    cy.contains('Projekt Edytowany').parents('li').within(() => cy.contains('Usuń').click());
    cy.contains('Projekt Edytowany').should('not.exist');
  });
});
