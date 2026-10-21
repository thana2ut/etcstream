import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { load, SCENARIOS, projectRoot } from './helpers/solver.mjs';

test('Hold-E immediately opens the orbit/zoom viewer for equipment in all 25 missions and Free Practice', () => {
  const { inspectSubject } = load('../game/content/inspect-info.ts');
  const Canvas = () => null, OrbitControls = () => null, CableInspector = () => null;
  const DeviceVisual = () => null;
  let state, scenario;
  const source = fs.readFileSync(`${projectRoot}/components/game/equipment-inspector.tsx`, 'utf8');
  const compiled = { exports: {} };
  vm.runInNewContext(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText, {
    exports: compiled.exports,
    require: (name) => {
      if(name==='react/jsx-runtime') return load(name);
      if(name==='react') return {useEffect:()=>{}};
      if(name==='@react-three/fiber') return {Canvas};
      if(name==='@react-three/drei') return {Bounds:()=>null,Center:()=>null,OrbitControls};
      if(name.endsWith('/training-store')) return {useTrainingStore:selector=>selector(state)};
      if(name.endsWith('/hdmi-training')) return {...load('../game/training/hdmi-training.ts'),scenarioOf:()=>scenario};
      if(name.endsWith('/sim/engine')) return load('../game/training/sim/engine.ts');
      if(name.endsWith('/inspect-info')) return {inspectSubject};
      if(name.endsWith('/device-visual')) return {DeviceVisual};
      if(name.endsWith('/cable-model')) return {CableInspector};
      return {};
    },
  });
  function nodes(node) {
    if(!node || typeof node!=='object') return [];
    if(Array.isArray(node)) return node.flatMap(nodes);
    return [node,...nodes(node.props?.children)];
  }
  const missions=Object.values(SCENARIOS).filter(s=>s.stage);
  assert.equal(missions.length,25);
  for(const current of [...missions,SCENARIOS['studio-full']]) {
    scenario=current;
    for(const device of current.devices) {
      state={inspecting:device.id,setInspecting:()=>{}};
      const tree=nodes(compiled.exports.EquipmentInspector());
      assert.ok(tree.some(n=>n.type===Canvas), `${current.id}/${device.id}: requires extra click`);
      const orbit=tree.find(n=>n.type===OrbitControls);
      assert.ok(orbit && orbit.props.enableZoom!==false && orbit.props.enableRotate!==false);
      assert.ok(tree.some(n=>n.props?.className==='inspector-overlay' && String(n.props['aria-modal'])==='true'));
    }
    state={inspecting:`@cable:${current.cables[0].id}`,setInspecting:()=>{}};
    assert.ok(nodes(compiled.exports.EquipmentInspector()).some(n=>n.type===CableInspector));
  }
});
