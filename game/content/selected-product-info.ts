import * as targets from './selected-product-targets.json';
export function selectedGameProduct(modelId?:string) {
  const id=modelId?targets.profiles[modelId as keyof typeof targets.profiles]:undefined;
  return id?{id,...targets.products[id as keyof typeof targets.products]}:undefined;
}
