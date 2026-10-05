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

test.describe('API Carts - Serverest', () => {

  // ---- [US01] [API Carrinhos] Cadastrar carrinho com sucesso ----
  test('Should create a cart successfully', async ({ request }) => {
    
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

    const productRegister = await request.post('https://serverest.dev/produtos', {
      headers: { Authorization: loginResponseBody.authorization },
      data: {
        nome: `Produto Carrinho QA ${userNumber}`,
        preco: 100,
        descricao: 'Mouse',
        quantidade: 10
      }
    });
    const productBody = await productRegister.json();
    const productId = productBody._id;

    // Add product to cart
    const createCart = await request.post('https://serverest.dev/carrinhos', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      },
      data: {
        produtos: [
          {
            "idProduto": productId,
            "quantidade": 1
          }
        ]
      }
    });

    expect(createCart.status()).toBe(201);
    
    const cartResponseBody = await createCart.json();

    expect(cartResponseBody.message).toBe('Cadastro realizado com sucesso');
    expect(cartResponseBody._id).toBeDefined();
    
  });

  // ---- [US02] [API Carrinhos] Bloquear cadastro de mais de um carrinho para o mesmo usuário ----
  test('Should not allow user to have more than one active cart', async ({ request }) => {

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

    const productRegister = await request.post('https://serverest.dev/produtos', {
      headers: { Authorization: loginResponseBody.authorization },
      data: {
        nome: `Produto Carrinho QA ${userNumber}`,
        preco: 100,
        descricao: 'Mouse',
        quantidade: 10
      }
    });
    const productBody = await productRegister.json();
    const productId = productBody._id;

    // Add product to cart - First time
    const createCart = await request.post('https://serverest.dev/carrinhos', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      },
      data: {
        produtos: [
          {
            "idProduto": productId,
            "quantidade": 1
          }
        ]
      }
    });

    expect(createCart.status()).toBe(201);
    
    const cartResponseBody = await createCart.json();

    expect(cartResponseBody.message).toBe('Cadastro realizado com sucesso');
    expect(cartResponseBody._id).toBeDefined();

    // Add product to cart - Second time
    const createCartSecond = await request.post('https://serverest.dev/carrinhos', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      },
      data: {
        produtos: [
          {
            "idProduto": productId,
            "quantidade": 1
          }
        ]
      }
    });

    expect(createCartSecond.status()).toBe(400);
    
    const cartResponseBodySecond = await createCartSecond.json();

    expect(cartResponseBodySecond.message).toBe('Não é permitido ter mais de 1 carrinho');

  });

  // ---- [US03] [API Carrinhos] Listar carrinhos e consultar por _id ----
  test('Should list carts and search cart by ID successfully', async ({ request }) => {

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

    const productRegister = await request.post('https://serverest.dev/produtos', {
      headers: { Authorization: loginResponseBody.authorization },
      data: {
        nome: `Produto Carrinho QA ${userNumber}`,
        preco: 100,
        descricao: 'Mouse',
        quantidade: 10
      }
    });
    const productBody = await productRegister.json();
    const productId = productBody._id;

    // Add product to cart
    const createCart = await request.post('https://serverest.dev/carrinhos', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      },
      data: {
        produtos: [
          {
            "idProduto": productId,
            "quantidade": 1
          }
        ]
      }
    });

    expect(createCart.status()).toBe(201);
    
    const firstCartResponseBody = await createCart.json();

    expect(firstCartResponseBody.message).toBe('Cadastro realizado com sucesso');
    expect(firstCartResponseBody._id).toBeDefined();

    const getCarts = await request.get('https://serverest.dev/carrinhos', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      }
    });

    expect(getCarts.status()).toBe(200);
    
    const cartsResponseBody = await getCarts.json();

    expect(cartsResponseBody.quantidade).toBeGreaterThan(0);
    expect(Array.isArray(cartsResponseBody.carrinhos)).toBe(true);

    const getCartById = await request.get(`https://serverest.dev/carrinhos/${firstCartResponseBody._id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      }
    });

    expect(getCartById.status()).toBe(200);
    
    const secondCartResponseBody = await getCartById.json();

    expect(secondCartResponseBody._id).toBe(firstCartResponseBody._id);
    expect(secondCartResponseBody.precoTotal).toBeDefined();
    expect(secondCartResponseBody.produtos).toBeDefined();

  });

  // ---- [US04] [API Carrinhos] Concluir compra e abater estoque ----
  test('Should complete purchase and delete cart successfully', async ({ request }) => {

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

    const productRegister = await request.post('https://serverest.dev/produtos', {
      headers: { Authorization: loginResponseBody.authorization },
      data: {
        nome: `Produto Carrinho QA ${userNumber}`,
        preco: 100,
        descricao: 'Mouse',
        quantidade: 10
      }
    });
    const productBody = await productRegister.json();
    const productId = productBody._id;

    // Add product to cart
    const createCart = await request.post('https://serverest.dev/carrinhos', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      },
      data: {
        produtos: [
          {
            "idProduto": productId,
            "quantidade": 1
          }
        ]
      }
    });

    expect(createCart.status()).toBe(201);
    
    const cartResponseBody = await createCart.json();

    expect(cartResponseBody.message).toBe('Cadastro realizado com sucesso');
    expect(cartResponseBody._id).toBeDefined();

    const completePurchase = await request.delete(`https://serverest.dev/carrinhos/concluir-compra`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      }
    });

    expect(completePurchase.status()).toBe(200);
    
    const completePurchaseResponseBody = await completePurchase.json();

    expect(completePurchaseResponseBody.message).toBe('Registro excluído com sucesso');

    const getCartById = await request.get(`https://serverest.dev/carrinhos/${cartResponseBody._id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      }
    });

    expect(getCartById.status()).toBe(400);
    
    const cartResponseBodyById = await getCartById.json();

    expect(cartResponseBodyById.message).toBe('Carrinho não encontrado');

    // Verify that product stock has decreased
    const getProductById = await request.get(`https://serverest.dev/produtos/${productId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      }
    });

    expect(getProductById.status()).toBe(200);
    
    const productResponseBodyById = await getProductById.json();

    expect(productResponseBodyById.quantidade).toBe(9);

  });

  // ---- [US05] [API Carrinhos] Cancelar compra e reabastecer estoque ----
  test('Should cancel purchase and restore product stock successfully', async ({ request }) => {

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

    const productRegister = await request.post('https://serverest.dev/produtos', {
      headers: { Authorization: loginResponseBody.authorization },
      data: {
        nome: `Produto Carrinho QA ${userNumber}`,
        preco: 100,
        descricao: 'Mouse',
        quantidade: 10
      }
    });
    const productBody = await productRegister.json();
    const productId = productBody._id;

    // Add product to cart
    const createCart = await request.post('https://serverest.dev/carrinhos', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      },
      data: {
        produtos: [
          {
            "idProduto": productId,
            "quantidade": 1
          }
        ]
      }
    });

    expect(createCart.status()).toBe(201);
    
    const cartResponseBody = await createCart.json();

    expect(cartResponseBody.message).toBe('Cadastro realizado com sucesso');
    expect(cartResponseBody._id).toBeDefined();

    const completePurchase = await request.delete(`https://serverest.dev/carrinhos/cancelar-compra`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      }
    });

    expect(completePurchase.status()).toBe(200);
    
    const completePurchaseResponseBody = await completePurchase.json();

    expect(completePurchaseResponseBody.message).toBe('Registro excluído com sucesso. Estoque dos produtos reabastecido');

    const getCartById = await request.get(`https://serverest.dev/carrinhos/${cartResponseBody._id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      }
    });

    expect(getCartById.status()).toBe(400);

    const cartResponseBodyById = await getCartById.json();
    expect(cartResponseBodyById.message).toBe('Carrinho não encontrado');

    // Verify that product stock has restored
    const getProductById = await request.get(`https://serverest.dev/produtos/${productId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': loginResponseBody.authorization
      }
    });

    expect(getProductById.status()).toBe(200);
    
    const productResponseBodyById = await getProductById.json();

    expect(productResponseBodyById.quantidade).toBe(10);

  });

});
