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

  // ---- [US01] [API Usuarios] Cadastrar novo usuário com dados válidos (Status 201 Created) ----
  test('Should create user successfully', async ({ request }) => {

    // Get incremental number and create user via API
    const userNumber = getNextUserNumber();
    const randomUser = `testqap5v${userNumber}`;
    const randomEmail = `testqap5v${userNumber}@email.com`;

    // Create user via API
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

  // ---- [US02] [API Usuarios] Bloquear cadastro com e-mail duplicado (Status 400 Bad Request) ----
  test('Should block user creation with duplicate email', async ({ request }) => {

    // Get incremental number and create user via API
    const userNumber = getNextUserNumber();
    const randomUser = `testqap5v${userNumber}`;
    const randomEmail = `testqap5v${userNumber}@email.com`;

    // Create user via API
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

    // Create user via API with duplicate email
    const response2 = await request.post('https://serverest.dev/usuarios', {
      data: {
        nome: randomUser,
        email: randomEmail,
        password: 'teste',
        administrador: 'true'
      }
    });

    // Assertion of HTTP status code (400 Bad Request)
    expect(response2.status()).toBe(400);

    const responseBody2 = await response2.json();

    // Valid the duplicate email error message
    expect(responseBody2.message).toBe('Este email já está sendo usado');
  });

  // ---- [US03] [API Usuarios] Consultar lista de usuários e buscar por ID específico (Status 200 OK) ----
  test('Should search for specific user by ID successfully', async ({ request }) => {

    // Get incremental number and create user via API
    const userNumber = getNextUserNumber();
    const randomUser = `testqap5v${userNumber}`;
    const randomEmail = `testqap5v${userNumber}@email.com`;

    // Create user via API
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

    // Get specific user by ID
    const userResponse = await request.get(`https://serverest.dev/usuarios/${responseBody._id}`);
    expect(userResponse.status()).toBe(200);

    // Parsing response body to JSON
    const user = await userResponse.json();

    expect(user.nome).toBe(randomUser);
    expect(user.email).toBe(randomEmail);
    expect(user._id).toBe(responseBody._id);
  });

  // ---- [US04] [API Usuarios] Atualizar dados de um usuário existente (Status 200 OK) ----
  test('Should update user with valid data successfully', async ({ request }) => {

    // Get incremental number and create user via API
    const userNumber = getNextUserNumber();
    const randomUser = `testqap5v${userNumber}`;
    const randomEmail = `testqap5v${userNumber}@email.com`;

    // Create user via API
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

    const randomUserUpdate = randomUser + "-update";
    // Update user via API
    const response2 = await request.put(`https://serverest.dev/usuarios/${responseBody._id}`, {
      data: {
        nome: randomUserUpdate,
        email: randomEmail,
        password: 'teste',
        administrador: 'true'
      }
    });

    // Assertion of HTTP status code (200 OK)
    expect(response2.status()).toBe(200);

    const responseBody2 = await response2.json();

    // Valid the message returned by API
    expect(responseBody2.message).toBe('Registro alterado com sucesso');

    // Valid the _id generated and not empty
    expect(responseBody._id).toBeDefined();
    });


  // ---- [US05] [API Usuarios] Excluir usuário cadastrado (Status 200 OK) ----
  test('Should delete user with valid data successfully', async ({ request }) => {

    // Get incremental number and create user via API
    const userNumber = getNextUserNumber();
    const randomUser = `testqap5v${userNumber}`;
    const randomEmail = `testqap5v${userNumber}@email.com`;

    // Create user via API
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

    // Delete user via API
    const response2 = await request.delete(`https://serverest.dev/usuarios/${responseBody._id}`);
    expect(response2.status()).toBe(200);

    const responseBody2 = await response2.json();

    // Valid the message returned by API
    expect(responseBody2.message).toBe('Registro excluído com sucesso');

    });

});