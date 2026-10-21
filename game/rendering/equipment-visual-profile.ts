import {MODEL_GEOMETRY} from '../training/sim/model-geometry';
import {SELECTED_PRODUCT_GEOMETRY} from './selected-product-geometry';
/** Presentation-only resolver. Never changes the simulator registry or its generic / verified identity. */
export function equipmentVisualGeometry(modelId?:string) {
  return modelId ? MODEL_GEOMETRY[modelId]??SELECTED_PRODUCT_GEOMETRY[modelId] : undefined;
}
