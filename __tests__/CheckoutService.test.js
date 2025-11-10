// __tests__/CheckoutService.test.js
// Testes seguindo AAA, usando Builders (Mother + Builder) e Doubles (Stubs e Mocks)

import { CheckoutService } from '../src/services/CheckoutService.js';
import { Item } from '../src/domain/Item.js';
import { UserMother } from './builders/UserMother.js';
import { CarrinhoBuilder } from './builders/CarrinhoBuilder.js';

describe('CheckoutService', () => {

  // Etapa 4: Stub (Verificação de Estado) — pagamento falha
  describe('quando o pagamento falha', () => {
    test('deve retornar null e não salvar pedido nem enviar e-mail', async () => {
      const carrinho = new CarrinhoBuilder()
        .comItens([['Alpha', 120], ['Bravo', 80]])
        .build();

      // Stub do Gateway: força falha
      const gatewayStub = {
        cobrar: jest.fn().mockResolvedValue({ success: false })
      };

      // Dummies/Mocks que não devem ser chamados
      const repoDummy = { salvar: jest.fn() };
      const emailDummy = { enviarEmail: jest.fn() };

      const svc = new CheckoutService(gatewayStub, repoDummy, emailDummy);

      const pedido = await svc.processarPedido(carrinho, { numero: '4111 1111 1111 1111' });

      expect(pedido).toBeNull();
      expect(repoDummy.salvar).not.toHaveBeenCalled();
      expect(emailDummy.enviarEmail).not.toHaveBeenCalled();
      expect(gatewayStub.cobrar).toHaveBeenCalled(); // verificação mínima da chamada
    });
  });

  // Etapa 5: Mock (Verificação de Comportamento) — sucesso Premium
  describe('quando um cliente Premium finaliza a compra', () => {
    test('deve aplicar 10% de desconto, salvar o pedido e enviar e-mail', async () => {
      const userPremium = UserMother.umUsuarioPremium();
      const carrinho = new CarrinhoBuilder()
        .comUser(userPremium)
        .comItens([['Curso', 120], ['Livro', 80]]) // total 200
        .build();

      // valor com desconto esperado: 180
      const gatewayStub = {
        cobrar: jest.fn().mockResolvedValue({ success: true })
      };
      const repoStub = {
        salvar: jest.fn().mockImplementation(async (pedido) => ({ ...pedido, id: 'PED-123' }))
      };
      const emailMock = {
        enviarEmail: jest.fn().mockResolvedValue(true)
      };

      const svc = new CheckoutService(gatewayStub, repoStub, emailMock);
      const pedido = await svc.processarPedido(carrinho, { numero: '5555 4444 3333 2222' });

      // Verificação de comportamento
      expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, expect.any(Object));
      expect(repoStub.salvar).toHaveBeenCalledTimes(1);
      expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
      expect(emailMock.enviarEmail).toHaveBeenCalledWith(
        'premium@email.com',
        'Seu Pedido foi Aprovado!',
        expect.stringContaining('PED-123')
      );

      // Verificação de estado: retorno não nulo e com id
      expect(pedido).not.toBeNull();
      expect(pedido.id).toBe('PED-123');
    });
  });
});
