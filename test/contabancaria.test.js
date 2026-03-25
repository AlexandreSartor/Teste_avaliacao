// test/contabancaria.test.js
const Contabancaria = require("../src/contaBancaria");

describe("contabancaria", () => {
  let contaBancaria;
  let conta;

  beforeEach(() => {
    conta = {
      id: 1,
      titular: "Alexandre",
      saldo: 1000,
      limite: 500,
      status: "ativa",
      atualizadaEm: new Date(),
    };
    contaBancaria = new Contabancaria(conta);
  });

  describe("obter informações", () => {
    test("retorna saldo corretamente", () => {
      expect(contaBancaria.obterSaldo()).toBe(1000);
    });

    test("retorna titular corretamente", () => {
      expect(contaBancaria.obterTitular()).toBe("Alexandre");
    });

    test("retorna status corretamente", () => {
      expect(contaBancaria.obterStatus()).toBe("ativa");
      expect(contaBancaria.estaAtiva()).toBe(true);
    });

    test("retorna limite corretamente", () => {
      expect(contaBancaria.obterLimite()).toBe(500);
    });
  });

  describe("depósito", () => {
    test("deposita valor válido", () => {
      expect(contaBancaria.depositar(200)).toBe(true);
      expect(contaBancaria.obterSaldo()).toBe(1200);
    });

    test("não deposita valor inválido", () => {
      expect(contaBancaria.depositar(0)).toBe(false);
      expect(contaBancaria.depositar(-100)).toBe(false);
    });
  });

  describe("saque", () => {
    test("saca valor dentro do limite", () => {
      expect(contaBancaria.sacar(1200)).toBe(true);
      expect(contaBancaria.obterSaldo()).toBe(-200);
    });

    test("não saca valor acima do disponível", () => {
      expect(contaBancaria.sacar(2000)).toBe(false);
    });

    test("não saca valor inválido", () => {
      expect(contaBancaria.sacar(0)).toBe(false);
      expect(contaBancaria.sacar(-100)).toBe(false);
    });
  });

  describe("alterar titular", () => {
    test("altera titular corretamente", () => {
      expect(contaBancaria.alterarTitular("Maria")).toBe(true);
      expect(contaBancaria.obterTitular()).toBe("Maria");
    });

    test("não altera para titular inválido", () => {
      expect(contaBancaria.alterarTitular("")).toBe(false);
      expect(contaBancaria.alterarTitular(null)).toBe(false);
    });
  });

  describe("status da conta", () => {
    test("bloqueia e ativa a conta", () => {
      expect(contaBancaria.bloquearConta()).toBe(true);
      expect(contaBancaria.obterStatus()).toBe("bloqueada");
      expect(contaBancaria.ativarConta()).toBe(true);
      expect(contaBancaria.obterStatus()).toBe("ativa");
    });

    test("não altera status quando já está no mesmo", () => {
      expect(contaBancaria.ativarConta()).toBe(false);
      contaBancaria.bloquearConta();
      expect(contaBancaria.bloquearConta()).toBe(false);
    });
  });

  describe("encerramento e reset", () => {
    test("não encerra conta com saldo", () => {
      expect(contaBancaria.encerrarConta()).toBe(false);
    });

    test("encerra conta com saldo zero e reseta conta", () => {
      contaBancaria.sacar(1000); // deixa saldo zero
      expect(contaBancaria.encerrarConta()).toBe(true);
      expect(contaBancaria.obterStatus()).toBe("encerrada");

      contaBancaria.resetarConta();
      expect(contaBancaria.obterSaldo()).toBe(0);
      expect(contaBancaria.obterLimite()).toBe(0);
      expect(contaBancaria.obterStatus()).toBe("ativa");
    });
  });

  describe("transferência e limite", () => {
    let contaDestino;

    beforeEach(() => {
      contaDestino = new Contabancaria({
        id: 2,
        titular: "Maria",
        saldo: 500,
        limite: 200,
        status: "ativa",
        atualizadaEm: new Date(),
      });
    });

    test("ajusta limite corretamente", () => {
      expect(contaBancaria.ajustarLimite(800)).toBe(true);
      expect(contaBancaria.obterLimite()).toBe(800);
      expect(contaBancaria.ajustarLimite(-100)).toBe(false);
    });

    test("realiza transferência entre contas", () => {
      expect(contaBancaria.transferir(200, contaDestino)).toBe(true);
      expect(contaBancaria.obterSaldo()).toBe(800);
      expect(contaDestino.obterSaldo()).toBe(700);
    });

    test("não transfere valor maior que disponível", () => {
      expect(contaBancaria.transferir(2000, contaDestino)).toBe(false);
    });
  });

  describe("validações e resumo", () => {
    test("valida conta corretamente", () => {
      expect(contaBancaria.validarConta()).toBe(true);
      conta.id = null;
      expect(contaBancaria.validarConta()).toBe(false);
    });

    test("gera resumo da conta", () => {
      const resumo = contaBancaria.gerarResumo();
      expect(resumo).toHaveProperty("titular", "Alexandre");
      expect(resumo).toHaveProperty("saldo", 1000);
      expect(resumo).toHaveProperty("limite", 500);
      expect(resumo).toHaveProperty("disponivel", 1500);
      expect(resumo).toHaveProperty("status", "ativa");
    });

    test("detecta saldo negativo", () => {
      contaBancaria.sacar(1200);
      expect(contaBancaria.saldoNegativo()).toBe(true);
    });

    test("aplica tarifa corretamente", () => {
      expect(contaBancaria.aplicarTarifa(100)).toBe(true);
      expect(contaBancaria.obterSaldo()).toBe(900);
      expect(contaBancaria.aplicarTarifa(-50)).toBe(false);
    });
  });
});