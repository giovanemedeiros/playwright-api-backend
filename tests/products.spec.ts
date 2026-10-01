import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Helper Function to generate unique incremental IDs
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

test.describe('API Products - Serverest', () => {

  // ---- [US01] [API Produtos] Cadastrar produto com sucesso sendo administrador ----
  test('Should create a product successfully with admin user', async ({ request }) => {

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

      const loginResponse = await request.post('https://serverest.dev/login', {
        data: {
          email: randomEmail,
          password: 'teste'
        }
      });

      // Assertion of HTTP status code (200 OK)
      expect(loginResponse.status()).toBe(200);

      // Parsing response body to JSON
      const loginResponseBody = await loginResponse.json();

      // Valid the message returned by API
      expect(loginResponseBody.message).toBe('Login realizado com sucesso');

      // Valid pattern of authorization token generated 
      expect(loginResponseBody.authorization).toMatch(/^Bearer/);

      // Valid the _id generated and not empty
      expect(responseBody._id).toBeDefined();

      // Get authorization token
      const token = loginResponseBody.authorization;

      // Create product via API
      const productRegister = await request.post('https://serverest.dev/produtos', {
        headers: {
          'Authorization': `${token}`
        },
        data: {
          nome: `Produto QA ${userNumber}`,
          preco: 100,
          descricao: 'Descricao do produto',
          quantidade: 50
        }
      });

      // Assertion of HTTP status code (201 Created)
      expect(productRegister.status()).toBe(201);
      
      // Parsing response body to JSON
      const productResponseBody = await productRegister.json();

      // Valid the message returned by API
      expect(productResponseBody.message).toBe('Cadastro realizado com sucesso');

      // Valid the _id generated and not empty
      expect(productResponseBody._id).toBeDefined();
  });

  // ---- [US02] [API Produtos] Bloquear cadastro de produto para usuário não administrador ----
  test('Should not create a product with regular non-admin user', async ({ request }) => {

      const userNumber = getNextUserNumber();
      const randomUser = `testqap5v${userNumber}`;
      const randomEmail = `testqap5v${userNumber}@email.com`;

      // Create user via API
      const userRegister = await request.post('https://serverest.dev/usuarios', {
        data: {
          nome: randomUser,
          email: randomEmail,
          password: 'teste',
          administrador: 'false'
        }
      });

      // Assertion of HTTP status code (201 Created)
      expect(userRegister.status()).toBe(201);

      // Parsing response body to JSON
      const responseBody = await userRegister.json();

      // Valid the message returned by API
      expect(responseBody.message).toBe('Cadastro realizado com sucesso');

      const loginResponse = await request.post('https://serverest.dev/login', {
        data: {
          email: randomEmail,
          password: 'teste'
        }
      });

      // Assertion of HTTP status code (200 OK)
      expect(loginResponse.status()).toBe(200);

      // Parsing response body to JSON
      const loginResponseBody = await loginResponse.json();

      // Valid the message returned by API
      expect(loginResponseBody.message).toBe('Login realizado com sucesso');

      // Valid pattern of authorization token generated 
      expect(loginResponseBody.authorization).toMatch(/^Bearer/);

      // Valid the _id generated and not empty
      expect(responseBody._id).toBeDefined();

      // Get authorization token
      const token = loginResponseBody.authorization;

      // Create product via API
      const productRegister = await request.post('https://serverest.dev/produtos', {
        headers: {
          'Authorization': `${token}`
        },
        data: {
          nome: `Produto QA ${userNumber}`,
          preco: 100,
          descricao: 'Descricao do produto',
          quantidade: 50
        }
      });

      // Assertion of HTTP status code (403 Forbiden)
      expect(productRegister.status()).toBe(403); 

      // Parsing response body to JSON
      const productResponseBody = await productRegister.json();
      
      // Valid the error message
      expect(productResponseBody.message).toBe('Rota exclusiva para administradores');
  });

  // ---- [US03] [API Produtos] Bloquear cadastro de produto com nome duplicado ----
  test('Should not create a product with duplicated name', async ({ request }) => {

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

      const loginResponse = await request.post('https://serverest.dev/login', {
        data: {
          email: randomEmail,
          password: 'teste'
        }
      });

      // Assertion of HTTP status code (200 OK)
      expect(loginResponse.status()).toBe(200);

      // Parsing response body to JSON
      const loginResponseBody = await loginResponse.json();

      // Valid the message returned by API
      expect(loginResponseBody.message).toBe('Login realizado com sucesso');

      // Valid pattern of authorization token generated 
      expect(loginResponseBody.authorization).toMatch(/^Bearer/);

      // Define payload for product registration (used twice)
      const productPayload = {
        nome: `Produto QA ${userNumber}`,
        preco: 100,
        descricao: 'Descricao do produto',
        quantidade: 50
      };

      const token = loginResponseBody.authorization;
      const productRegister = await request.post('https://serverest.dev/produtos', {
        headers: {
          'Authorization': `${token}`
        },
        data: productPayload
      });

      // Assertion of HTTP status code (201 Created)
      expect(productRegister.status()).toBe(201);
      
      // Parsing response body to JSON
      const productResponseBody = await productRegister.json();

      // Valid the message returned by API
      expect(productResponseBody.message).toBe('Cadastro realizado com sucesso');

      // Valid the _id generated and not empty
      expect(productResponseBody._id).toBeDefined();

      const productRegister2 = await request.post('https://serverest.dev/produtos', {
        headers: {
          'Authorization': `${token}`
        },
        data: productPayload
      });

      // Assertion of HTTP status code (400 Bad Request)
      expect(productRegister2.status()).toBe(400);
      
      // Parsing response body to JSON
      const productResponseBody2 = await productRegister2.json();

      // Valid the message returned by API
      expect(productResponseBody2.message).toBe('Já existe produto com esse nome');

  });

  // ---- [US04] [API Produtos] Listar produtos e consultar por _id ----
  test('Should list registered products successfully', async ({ request }) => {

      const userNumber = getNextUserNumber();
      const randomUser = `testqap5v${userNumber}`;
      const randomEmail = `testqap5v${userNumber}@email.com`;
      const productName = `Produto QA ${userNumber}`;

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

      // Login to get token
      const loginResponse = await request.post('https://serverest.dev/login', {
        data: {
          email: randomEmail,
          password: 'teste'
        }
      });

      // Assertion of HTTP status code (200 OK)
      expect(loginResponse.status()).toBe(200);

      // Parsing response body to JSON
      const loginResponseBody = await loginResponse.json();
      const token = loginResponseBody.authorization;

      // Register product
      const productRegister = await request.post('https://serverest.dev/produtos', {
        headers: {
          'Authorization': `${token}`
        },
        data: {
          nome: productName,
          preco: 100,
          descricao: 'Descricao do produto',
          quantidade: 50
        }
      });

      // Assertion of HTTP status code (201 Created)
      expect(productRegister.status()).toBe(201);
      
      const productResponseBody = await productRegister.json();
      const productId = productResponseBody._id;
      expect(productId).toBeDefined();

      // 1. List all products
      const listProducts = await request.get('https://serverest.dev/produtos');
      expect(listProducts.status()).toBe(200);

      const listProductBody = await listProducts.json();
      expect(listProductBody.quantidade).toBeGreaterThan(0);
      expect(Array.isArray(listProductBody.produtos)).toBe(true);

      // 2. Search specific product by ID
      const searchById = await request.get(`https://serverest.dev/produtos/${productId}`);
      expect(searchById.status()).toBe(200);

      const searchByIdBody = await searchById.json();
      expect(searchByIdBody._id).toBe(productId);
      expect(searchByIdBody.nome).toBe(productName);
      expect(searchByIdBody.preco).toBe(100);
      expect(searchByIdBody.descricao).toBe('Descricao do produto');
      expect(searchByIdBody.quantidade).toBe(50);
  });

  // ---- [US05] [API Produtos] Atualizar dados de produto existente ----
  test('Should update product details successfully with admin user', async ({ request }) => {

      const userNumber = getNextUserNumber();
      const randomUser = `testqap5v${userNumber}`;
      const randomEmail = `testqap5v${userNumber}@email.com`;
      const productName = `Produto QA ${userNumber}`;

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

      // Login to get token
      const loginResponse = await request.post('https://serverest.dev/login', {
        data: {
          email: randomEmail,
          password: 'teste'
        }
      });

      // Assertion of HTTP status code (200 OK)
      expect(loginResponse.status()).toBe(200);

      // Parsing response body to JSON
      const loginResponseBody = await loginResponse.json();
      const token = loginResponseBody.authorization;

      // Register product
      const productRegister = await request.post('https://serverest.dev/produtos', {
        headers: {
          'Authorization': `${token}`
        },
        data: {
          nome: productName,
          preco: 100,
          descricao: 'Descricao do produto',
          quantidade: 50
        }
      });

      // Assertion of HTTP status code (201 Created)
      expect(productRegister.status()).toBe(201);

      // Parsing response body to JSON
      const productRegisterBody = await productRegister.json();
      const productId = productRegisterBody._id;
      expect(productId).toBeDefined();

      const productUpdate = await request.put(`https://serverest.dev/produtos/${productId}`, {
        headers: {
          'Authorization': `${token}`
        },
        data: {
          nome: productName + ' atualizado',
          preco: 200,
          descricao: 'Descricao do produto atualizado',
          quantidade: 100
        }
      });

      // Assertion of HTTP status code (200 OK)
      expect(productUpdate.status()).toBe(200);

      // Parsing response body to JSON
      const productUpdateBody = await productUpdate.json();

      // Valid the message returned by API
      expect(productUpdateBody.message).toBe('Registro alterado com sucesso');

      // Valid the _id generated and not empty
      const updateValidation = await request.get(`https://serverest.dev/produtos/${productId}`);

      // Assertion of HTTP status code (200 OK)
      expect(updateValidation.status()).toBe(200);

      // Parsing response body to JSON
      const updateValidationBody = await updateValidation.json();

      // Validation of product updated
      expect(updateValidationBody).toMatchObject({
        _id: productId,
        nome: productName + ' atualizado',
        preco: 200,
        descricao: 'Descricao do produto atualizado',
        quantidade: 100
      });

  });

  // ---- [US06] [API Produtos] Excluir produto do catálogo ----
  test('Should delete a product successfully with admin user', async ({ request }) => {

      const userNumber = getNextUserNumber();
      const randomUser = `testqap5v${userNumber}`;
      const randomEmail = `testqap5v${userNumber}@email.com`;
      const productName = `Produto QA ${userNumber}`;

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

      // Login to get token
      const loginResponse = await request.post('https://serverest.dev/login', {
        data: {
          email: randomEmail,
          password: 'teste'
        }
      });

      // Assertion of HTTP status code (200 OK)
      expect(loginResponse.status()).toBe(200);

      // Parsing response body to JSON
      const loginResponseBody = await loginResponse.json();
      const token = loginResponseBody.authorization;

      // Register product
      const productRegister = await request.post('https://serverest.dev/produtos', {
        headers: {
          'Authorization': `${token}`
        },
        data: {
          nome: productName,
          preco: 100,
          descricao: 'Descricao do produto',
          quantidade: 50
        }
      });

      // Assertion of HTTP status code (201 Created)
      expect(productRegister.status()).toBe(201);

      // Parsing response body to JSON
      const productRegisterBody = await productRegister.json();
      const productId = productRegisterBody._id;
      expect(productId).toBeDefined();

      const productDelete = await request.delete(`https://serverest.dev/produtos/${productId}`, {
        headers: {
          'Authorization': `${token}`
        }
      });

      // Assertion of HTTP status code (200 OK)
      expect(productDelete.status()).toBe(200);

      // Parsing response body to JSON
      const productDeleteBody = await productDelete.json();

      // Valid the message returned by API
      expect(productDeleteBody.message).toBe('Registro excluído com sucesso');

  });

});
