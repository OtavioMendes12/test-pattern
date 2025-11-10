// __tests__/builders/UserMother.js
// Object Mother para usuários simples e estáveis

import { User } from '../../src/domain/User.js';

export class UserMother {
  static umUsuarioPadrao() {
    return new User('u-001', 'Usuario Padrao', 'padrao@email.com', 'PADRAO');
  }

  static umUsuarioPremium() {
    return new User('u-999', 'Cliente Premium', 'premium@email.com', 'PREMIUM');
  }
}
