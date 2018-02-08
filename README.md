# Inversify Stereotype Decorators

_experiment/wip_

## Usage

Install the package as well as it's peer dependencies
```bash
npm install --save inversify-stereotype-decorators inversify reflect-metadata
```

Create an IoC container and the stereotype decorators
```typescript
// inversify.config.ts

import 'reflect-metadata';
import { Container } from 'inversify';
import { getStereotypes } from 'inversify-stereotype-decorators';

export const container = new Container();
export const { service, store, constant, autowire } = getStereotypes(container);
```

Use your new goodies!
```typescript
import * as React from 'react';
import { service, store, autowire } from './inversify.config.ts';

@store
class TodoStore {
  todos = ['hello'];
}

@service
class TodoService {

  @autowire
  private todoStore: TodoStore;

  async createTodo(title: string) {
    const todo = await someApiCall(title);
    this.todoStore.todos.push(todo);
  }
}

class TodoList extends React.Component {

  @autowire
  private todoStore: TodoStore;

  render() {
    return (
      <div>
        {this.todoStore.todos.map((todo) => <span>{todo}</span>)}
      </div>
    );
  }
}
```
