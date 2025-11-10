// __tests__/builders/CarrinhoBuilder.js
// Data Builder fluente para montar carrinhos flexíveis e legíveis

import { Carrinho } from '../../src/domain/Carrinho.js';
import { Item } from '../../src/domain/Item.js';
import { UserMother } from './UserMother.js';

export class CarrinhoBuilder {
  constructor() {
    this._user = UserMother.umUsuarioPadrao();
    this._itens = [new Item('Item Padrão', 100)];
  }

  comUser(user) {
    this._user = user;
    return this;
  }

  comItens(itens) {
    // aceita lista de Item ou pares [nome, preco]
    this._itens = itens.map(it => it instanceof Item ? it : new Item(it[0], it[1]));
    return this;
  }

  vazio() {
    this._itens = [];
    return this;
  }

  build() {
    return new Carrinho(this._user, this._itens);
  }
}
