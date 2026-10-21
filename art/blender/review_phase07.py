"""Render the exported runtime buffers and authored GLBs; never opens/modifies the user's live Blender scene."""
import bpy, json, math, sys
from pathlib import Path
from mathutils import Vector
from mathutils import Matrix

ROOT=Path(__file__).resolve().parents[2]
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
def option(name,default): return next((a.split('=',1)[1] for a in args if a.startswith(name+'=')),default)
OUT=ROOT/option('--output','art/qa/phase07'); OUT.mkdir(parents=True,exist_ok=True)
data=json.loads((ROOT/option('--source','art/qa/phase07/runtime-geometry-review.json')).read_text(encoding='utf-8'))
turnaround='--turnaround' in args
only=[a for a in args if not a.startswith('--')]
rendered=0
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=640; scene.render.resolution_y=480; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.film_transparent=False
scene.world.color=(.12,.12,.12)
scene.render.image_settings.color_mode='RGB'
scene.view_settings.view_transform='AgX'
materials={}
def material(color,finish):
    key=(color,finish)
    if key in materials: return materials[key]
    def linear(c):
        c=c/255
        return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
    m=bpy.data.materials.new(str(key)); m.diffuse_color=(*[linear(int(color[i:i+2],16)) for i in (1,3,5)],1); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=m.diffuse_color
    bs.inputs['Metallic'].default_value=.45 if finish in ('metal','grille') else .08
    bs.inputs['Roughness'].default_value=.7 if finish in ('rubber','grille') else .52
    materials[key]=m; return m
def reset():
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def frame_and_render(name,reverse=False):
    objects=[o for o in scene.objects if o.type=='MESH' and not o.get('qa_floor')]
    points=[o.matrix_world @ Vector(v) for o in objects for v in o.bound_box]
    lo=Vector([min(v[i] for v in points) for i in range(3)]); hi=Vector([max(v[i] for v in points) for i in range(3)])
    center=(lo+hi)/2; extent=max(hi-lo); extent=max(extent,.05)
    for o in list(scene.objects):
        if o.type in ('CAMERA','LIGHT') or o.get('qa_floor'): bpy.data.objects.remove(o,do_unlink=True)
    bpy.ops.mesh.primitive_plane_add(size=extent*10,location=(center.x,center.y,lo.z-extent*.012))
    bpy.context.object['qa_floor']=True
    bpy.context.object.data.materials.append(material('#414b5b','plastic'))
    bpy.ops.object.camera_add(location=center+Vector((extent*1.2,extent*(1.6 if reverse else -1.6),extent*1.05)))
    camera=bpy.context.object; camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler(); camera.data.type='ORTHO'; camera.data.ortho_scale=extent*1.6; camera.data.clip_start=extent*.001; scene.camera=camera
    for at,power,size in [((2,-3,4),500,3),((-3,-1,2),350,2),((1,3,3),650,2)]:
        bpy.ops.object.light_add(type='AREA',location=center+Vector(at)*extent)
        light=bpy.context.object; light.data.energy=power*extent*extent; light.data.shape='DISK'; light.data.size=size*extent; light.rotation_euler=(center-light.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(OUT/(name+('-rear' if reverse else '')+'.png')); bpy.ops.render.render(write_still=True)
for asset in data['assets']:
    if only and asset['id'] not in only: continue
    reset()
    if asset.get('native'): bpy.ops.import_scene.gltf(filepath=str(ROOT/asset['native']))
    for i,spec in enumerate([] if asset.get('native') else asset['meshes']):
        a=spec['positions']; verts=[(a[i],-a[i+2],a[i+1]) for i in range(0,len(a),3)]
        indices=spec['indices'] or list(range(len(verts))); faces=[tuple(indices[i:i+3]) for i in range(0,len(indices),3)]
        mesh=bpy.data.meshes.new(asset['id']+str(i)); mesh.from_pydata(verts,[],faces); mesh.update()
        obj=bpy.data.objects.new(mesh.name,mesh); scene.collection.objects.link(obj); obj.data.materials.append(material(spec['color'],spec['finish']))
        if spec.get('normals'):
            n=spec['normals']; normals=[(n[i],-n[i+2],n[i+1]) for i in range(0,len(n),3)]
            mesh.normals_split_custom_set_from_vertices(normals)
    for instance in asset.get('nativeInstances',[]):
        before=set(scene.objects)
        bpy.ops.import_scene.gltf(filepath=str(ROOT/instance['path']))
        created=set(scene.objects)-before
        x,y,z=instance['position']
        transform=Matrix.Translation(Vector((x,-z,y))) @ Matrix.Rotation(instance.get('yaw',0),4,'Z') @ Matrix.Scale(instance.get('scale',1),4)
        for obj in created:
            if obj.parent not in created: obj.matrix_world=transform @ obj.matrix_world
    frame_and_render(asset['id']); rendered+=1
    if turnaround: frame_and_render(asset['id'],True); rendered+=1
for asset in ['samsung-u8000f','comica-wm100-plus-rx','comica-wm100-plus-tx','magewell-capture','yamaha-hs5','sennheiser-xs1','pmx402d','hds7105','hp-laptop','hc-x2000']:
    if '--no-native' in args: continue
    if only and asset not in only: continue
    reset(); bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/models/equipment'/(asset+'.glb')))
    frame_and_render(asset); rendered+=1
    if turnaround: frame_and_render(asset,True); rendered+=1
print('PHASE07_REVIEW_COMPLETE',rendered)
