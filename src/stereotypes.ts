import { injectable, interfaces, Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';

export type Identifier<T> = string | symbol | interfaces.Newable<T> | interfaces.Abstract<T>;

export function getStereoTypes(container: any) {
  return {
    store: getStore(container),
    service: getService(container),
    constant: getConstant(container),
    autowire: getAutowire(container),
  };
}

function getInstance(container: Container) {
  return function instance<T>(identifier: Identifier<any>, target: T) {
    const result = injectable()(target);
    container.bind<T>(identifier).to(result);
    return result;
  }
}

function getSingleton(container: Container) {
  return function singleton<T>(identifier: Identifier<any>, target: T) {
    const result = injectable()(target);
    container.bind<T>(identifier).to(result).inSingletonScope();
    return result;
  }
}

function getConstant(container: Container) {
  return function constant(identifier: Identifier<any>, target: any) {
    container.bind(identifier).toConstantValue(target);
    return target;
  }
}

function getService(container: Container) {
  return function service<T extends Function>(target: T): T {
    return getInstance(container)(target, target);
  }
}

function getStore(container: Container) {
  return function store<T extends Function>(target: T): T {
    return getSingleton(container)(target, target);
  }
}

function getAutowire(container: Container) {
  // overloads to support `@autowire(identifier)` and `@autowire`
  function autowire(target: Object, key: string): void;
  function autowire(identifier: Identifier<any>): PropertyDecorator;
  function autowire(targetOrIdent: Object | Identifier<any>, key?: string): PropertyDecorator | any {
    const { lazyInject } = getDecorators(container);
    if (key !== undefined) {
      // if we have a key, then we were called as a decorator
      // so we will infer the identifier from the design type
      const type = Reflect.getMetadata('design:type', targetOrIdent, key);
      return lazyInject(type)(targetOrIdent, key);
    }
    // otherwise we have been called like a function and target is the identifier we should use
    return (target: Object, property: string) => {
      return lazyInject(targetOrIdent as Identifier<any>)(target, property);
    }
  }
  return autowire;
}
