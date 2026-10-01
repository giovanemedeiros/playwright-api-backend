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

test.describe('API Login - Serverest', () => {

  // ---- [US01] [API Login] Login com usuário administrador e obtenção de token de autenticação ----
  test('Should login successfully and return authorization token', async ({ request }) => {

    // Get incremental number and create user via API
    const userNumber = getNextUserNumber();
    const randomUser = `testqap5v${userNumber}`;
    const randomEmail = `testqap5v${userNumber}@email.com`;

    // Create user via API
    const userRegister = await request.post('https://serverest.dev/usuarios', {
      data: {
        nome: randomUser,
        email: randomEmail,
        password: 'teste',
        administrador: 'true'
      }
    });

    // Assertion of HTTP status code (201 Created)
    expect(userRegister.status()).toBe(201);

    // Parsing response body to JSON
    const responseBody = await userRegister.json();

    // Valid the message returned by API
    expect(responseBody.message).toBe('Cadastro realizado com sucesso');

    // Valid the _id generated and not empty
    expect(responseBody._id).toBeDefined();

    // Login with valid credentials
    const userLogin = await request.post('https://serverest.dev/login', {
      data: {
        email: randomEmail,
        password: 'teste'
      }
    });

    // Assertion of HTTP status code (200 OK)
    expect(userLogin.status()).toBe(200);

    // Parsing response body to JSON
    const loginResponseBody = await userLogin.json();

    // Valid the message returned by API
    expect(loginResponseBody.message).toBe('Login realizado com sucesso');

    // Valid pattern of authorization token generated 
    expect(loginResponseBody.authorization).toMatch(/^Bearer/);
  });

  // ---- [US02] [API Login] Bloquear autenticação com e-mail ou senha inválidos ----
  test('Should not login with invalid credentials', async ({ request }) => {

    // Get incremental number and create user via API
    const userNumber = getNextUserNumber();
    const randomUser = `testqap5v${userNumber}`;
    const randomEmail = `testqap5v${userNumber}@email.com`;

    // Create user via API
    const userRegister = await request.post('https://serverest.dev/usuarios', {
      data: {
        nome: randomUser,
        email: randomEmail,
        password: 'teste',
        administrador: 'true'
      }
    });

    // Assertion of HTTP status code (201 Created)
    expect(userRegister.status()).toBe(201);

    // Parsing response body to JSON
    const responseBody = await userRegister.json();

    // Valid the message returned by API
    expect(responseBody.message).toBe('Cadastro realizado com sucesso');

    // Valid the _id generated and not empty
    expect(responseBody._id).toBeDefined();

    // Login with valid credentials
    const userLogin = await request.post('https://serverest.dev/login', {
      data: {
        email: randomEmail,
        password: 'testeInvalido'
      }
    });

    // Assertion of HTTP status code (401 Unauthorized)
    expect(userLogin.status()).toBe(401);

    // Parsing response body to JSON
    const loginResponseBody = await userLogin.json();

    // Valid the message returned by API
    expect(loginResponseBody.message).toBe('Email e/ou senha inválidos');
  });

  // ---- [US03] [API Login] Validar validação de campos obrigatórios vazios ----
  test('Should not login with empty required fields', async ({ request }) => {

    // Login with empty required fields
    const userLogin = await request.post('https://serverest.dev/login', {
      data: {
        email: '',
        password: ''
      }
    });

    // Assertion of HTTP status code (400 Bad Request)
    expect(userLogin.status()).toBe(400);

    // Parsing response body to JSON
    const loginResponseBody = await userLogin.json();

    expect(loginResponseBody.email).toBe('email não pode ficar em branco');
    expect(loginResponseBody.password).toBe('password não pode ficar em branco');


  });

});
