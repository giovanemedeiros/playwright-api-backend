import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Helper Function
function getNextUserNumber() {
  const filePath = path.resolve('counter.json');
  let currentNumber = 1;

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    currentNumber = JSON.parse(data).count || 1;
  }

  // Writes the next number (+1) to counter.json file
  fs.writeFileSync(filePath, JSON.stringify({ count: currentNumber + 1 }, null, 2));
  return currentNumber;
}

test.describe('API CRUD - Serverest', () => {

    // ---- [US01] [CRUD] Validar criação de usuário ----
    test('Should create user successfully', async ({ request }) => {

    // Get incremental number and create user via API
    const userNumber = getNextUserNumber();
    const randomUser = `testqap5v${userNumber}`;
    const randomEmail = `testqap5v${userNumber}@email.com`;

    const response = await request.post('https://serverest.dev/usuarios', {
        data: {
        nome: randomUser,
        email: randomEmail,
        password: 'teste',
        administrador: 'true'
        }
    });

    // Assertion of HTTP status code (201 Created)
    expect(response.status()).toBe(201);

    const responseBody = await response.json();

    // Valid the message returned by API
    expect(responseBody.message).toBe('Cadastro realizado com sucesso');

    // Valid the _id generated and not empty
    expect(responseBody._id).toBeDefined();
    
  });

});