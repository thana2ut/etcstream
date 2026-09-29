"""Run with Blender 5.2 --background --python art/blender/build_studio_room.py.
Authored geometry from the user's eight references; no external assets.
All input coordinates are web XYZ (Y up); converted to Blender Z up.
"""
import bpy, json, math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
L = json.loads((ROOT / 'game/training/studio-room-layout.data.json').read_text())
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
root = bpy.data.collections.new('STUDIO_ROOM_01')
scene.collection.children.link(root)
cols = {}
for name in ['ARCHITECTURE','FURNITURE','LIGHT_FIXTURES','PLACEHOLDER_EQUIPMENT','DECOR','COLLISION_REFERENCE']:
    cols[name] = bpy.data.collections.new(name)
    root.children.link(cols[name])
def xyz(p): return (p[0], -p[2], p[1])
def material(name, color, rough=.7, metal=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Roughness'].default_value=rough; bs.inputs['Metallic'].default_value=metal
    return m
wall=material('studio_wall_black',(.035,.039,.043),.93)
floor=material('studio_floor_dark',(.075,.078,.080),.82)
ceiling=material('ceiling_black',(.018,.021,.025),.9)
wood=material('table_wood',(.63,.40,.20),.55)
metal=material('metal_black',(.018,.022,.027),.38,.65)
green=material('greenscreen_green',(.018,.48,.045),.9)
gear=material('equipment_placeholder_dark',(.025,.030,.036),.65)
lamp=material('light_fixture_black',(.022,.025,.030),.42,.4)
silver=material('case_hardware',(.30,.33,.35),.35,.8)
white=material('light_diffuser',(.88,.91,.95),.55)
bs=white.node_tree.nodes.get('Principled BSDF'); bs.inputs['Emission Color'].default_value=(1,.93,.82,1); bs.inputs['Emission Strength'].default_value=.7
screen=material('monitor_glass',(.012,.022,.027),.3)
def finish(o,name,mat,col):
    o.name=name
    for c in list(o.users_collection): c.objects.unlink(o)
    cols[col].objects.link(o)
    if mat: o.data.materials.append(mat)
    return o
def box(name,p,size,mat,col='DECOR',bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=xyz(p)); o=bpy.context.object
    o.dimensions=(size[0],size[2],size[1]); bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    finish(o,name,mat,col)
    if bevel:
        mod=o.modifiers.new('Small manufactured edge','BEVEL'); mod.width=bevel; mod.segments=2
        bpy.ops.object.modifier_apply(modifier=mod.name)
        o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o
def cyl(name,p,r,depth,mat,col='DECOR',vertices=20):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=xyz(p))
    return finish(bpy.context.object,name,mat,col)
def rod(name,a,b,r=.015,mat=metal,col='DECOR'):
    av,bv=Vector(xyz(a)),Vector(xyz(b)); o=cyl(name,(0,0,0),r,(bv-av).length,mat,col,12)
    o.location=(av+bv)/2; o.rotation_euler=(bv-av).to_track_quat('Z','Y').to_euler(); return o
def empty(name,p,col='PLACEHOLDER_EQUIPMENT'):
    o=bpy.data.objects.new(name,None); cols[col].objects.link(o); o.location=xyz(p); o.empty_display_size=.12; return o
W,D,H=L['room'].values()
box('floor',[0,-.08,0],[W+.2,.16,D+.2],floor,'ARCHITECTURE')
box('ceiling',[0,H+.05,0],[W,.1,D],ceiling,'ARCHITECTURE')
for x in [-W/2-.05,W/2+.05]: box('side_wall',[x,H/2,0],[.1,H,D],wall,'ARCHITECTURE')
for z in [-D/2-.05,D/2+.05]: box('end_wall',[0,H/2,z],[W,H,.1],wall,'ARCHITECTURE')
for x in [-W/2+.08,W/2-.08]:
    for z in [-2.7,-1.65,-.6,.45,1.5,2.55]:
        for y in [.6,1.55,2.5]: box('acoustic_panel',[x,y,z],[.045,.88,.79],wall,'ARCHITECTURE',.006)
    for y in [.3,1.05,2.75]:
        for dy in [-.045,.045]: rod('wall_cable_tray',[x,y+dy,-D/2+.12],[x,y+dy,D/2-.12],.012,silver)
for x in [-3,-1.5,0,1.5,3]: rod('ceiling_rail',[x,H-.1,-D/2+.12],[x,H-.1,D/2-.12],.025)
for z in [-2.7,-1.35,0,1.35,2.7]: rod('ceiling_crossbar',[-W/2+.12,H-.12,z],[W/2-.12,H-.12,z],.025)
for x in range(-4,5): box('floor_joint',[x,.001,0],[.006,.002,D],metal)
for z in range(-3,4): box('floor_joint',[0,.001,z],[W,.002,.006],metal)
# Cyclorama profile: floor, quarter-circle radius .35, vertical wall.
profile=[(-2.35,.012),(-2.75,.012)]
for i in range(13):
    t=i*math.pi/24; profile.append((-2.75-.35*math.sin(t),.362-.35*math.cos(t)))
profile.append((-3.1,2.95))
verts=[xyz((x,y,z)) for x in [-3.15,3.15] for z,y in profile]; n=len(profile)
mesh=bpy.data.meshes.new('cyclorama_mesh'); mesh.from_pydata(verts,[],[(i,i+1,n+i+1,n+i) for i in range(n-1)]); mesh.update()
o=bpy.data.objects.new('greenscreen_cyclorama',mesh); cols['ARCHITECTURE'].objects.link(o); o.data.materials.append(green)
for p in mesh.polygons: p.use_smooth=True
# Furniture
x,y,z=L['table']; cyl('round_table_top',[x,y-.025,z],L['tableRadius'],.05,wood,'FURNITURE',64)
cyl('round_table_column',[x,.36,z],.065,.70,metal,'FURNITURE'); cyl('round_table_base',[x,.035,z],.40,.07,metal,'FURNITURE',40)
for i,(x,y,z) in enumerate(L['sideTables']):
    sw,_,sd=L['sideTableSize']
    box(f'equipment_table_{i+1}',[x,y-.025,z],[sw,.05,sd],wood,'FURNITURE',.012)
    box('lower_shelf',[x,.14,z],[sw-.05,.035,sd-.07],metal,'FURNITURE')
    for dx in [-sw/2+.06,sw/2-.06]:
        for dz in [-sd/2+.08,sd/2-.08]: box('table_leg',[x+dx,.38,z+dz],[.035,.76,.035],metal,'FURNITURE')
    for dz in [-.72,0,.72]:
        box('road_case',[x,.34,z+dz],[.48,.35,.43],gear,'PLACEHOLDER_EQUIPMENT',.016)
        for dy in [.18,.49]: box('case_trim',[x,dy,z+dz],[.49,.016,.44],silver)
        box('case_handle',[x+(.246 if x<0 else -.246),.35,z+dz],[.015,.045,.12],silver)
# Monitor stand is environmental; active screen is separate web equipment.
x,y,z=L['monitor']; empty('display_monitor_main',[x,y,z])
rod('monitor_column',[x,.1,z],[x,1.4,z],.045,col='FURNITURE')
for dx in [-.32,.32]:
    rod('monitor_base',[x+dx,.07,z-.28],[x+dx,.07,z+.28],.025,col='FURNITURE')
    for dz in [-.28,.28]: cyl('monitor_caster',[x+dx,.045,z+dz],.04,.055,gear,'FURNITURE')
rod('monitor_crossbar',[x-.32,.1,z],[x+.32,.1,z],.02,col='FURNITURE')
# TV placeholder editable in source but excluded from export to avoid duplicate active display.
tv=box('display_monitor_preview',[x,y,z],[1.0,.62,.08],gear,'PLACEHOLDER_EQUIPMENT',.015); tv['web_exclude']=True
x,y,z=L['speaker']; box('speaker_main',[x,y,z],[.32,.48,.36],gear,'PLACEHOLDER_EQUIPMENT',.025)
for y2,r in [(y-.07,.105),(y+.13,.055)]:
    o=cyl('speaker_driver',[x,y2,z+.19],r,.02,metal); o.rotation_euler.x=math.pi/2
x,y,z=L['anchors']['microphone']; empty('microphone_table_main',[x,y,z])
cyl('microphone_base',[x,y+.015,z],.07,.025,metal); rod('microphone_stem',[x,y,z],[x,y+.19,z],.009)
rod('microphone_capsule',[x,y+.18,z],[x,y+.29,z-.07],.025,gear)
empty('camera_position_01',L['cameras'][0])
for i,(x,y,z) in enumerate(L['lights']):
    empty(f'anchor_studio_light_{i+1}',[x,y,z])
    box('studio_light_body',[x,y,z],[.43,.12,.3],lamp,'LIGHT_FIXTURES',.012)
    box('studio_light_diffuser',[x,y-.067,z],[.38,.015,.25],white,'LIGHT_FIXTURES')
    if i<3: rod('light_hanger',[x,y,z],[x,2.9,z],.02,col='LIGHT_FIXTURES')
    else:
        rod('light_stand',[x,.05,z],[x,y,z],.018,col='LIGHT_FIXTURES')
        for a in [0,2.1,4.2]: rod('light_stand_leg',[x,.4,z],[x+.23*math.cos(a),.02,z+.23*math.sin(a)],.014,col='LIGHT_FIXTURES')
box('studio_door_main',[-2.95,1.08,D/2-.015],[.88,2.16,.055],metal,'ARCHITECTURE',.01)
box('door_window',[-2.95,1.5,D/2-.05],[.13,.5,.025],screen)
box('door_handle',[-2.64,1,D/2-.1],[.14,.025,.04],silver)
for name,p in L['anchors'].items(): empty('anchor_'+name,p)
# Proxy references stay out of export; runtime uses matching simple Rapier shapes.
for name,p,size in [('floor',[0,-.08,0],[W,.16,D]),('table',[L['table'][0],.375,L['table'][2]],[L['tableRadius']*2,.75,L['tableRadius']*2])]:
    o=box('collision_'+name,p,size,None,'COLLISION_REFERENCE'); o.hide_render=True; o.display_type='WIRE'
cols['COLLISION_REFERENCE'].hide_viewport=True
# Save an editable lit source with eight review cameras.
scene.world.color=(.18,.18,.18)
for i,p in enumerate(L['lights']):
    d=bpy.data.lights.new('preview_softbox','AREA'); d.energy=160 if i<3 else 110; d.shape='DISK'; d.size=1.3
    o=bpy.data.objects.new('preview_softbox',d); scene.collection.objects.link(o); o.location=xyz(p)
    target=Vector(xyz([0,.6,-.8])); o.rotation_euler=(target-o.location).to_track_quat('-Z','Y').to_euler()
views=[('entrance',[-2.9,1.65,2.65],[0,1,-1]),('front_left',[-3.7,1.8,-2.6],[0,1,.3]),('front_right',[3.7,1.8,-2.6],[0,1,.3]),('rear_left',[-3.7,1.9,2.7],[0,1,-.7]),('rear_right',[3.7,1.9,2.7],[0,1,-.7]),('table_close',[0,1.6,1.0],[0,.9,-.55]),('side_tables',[0,2.2,2.7],[3.5,.8,-.1]),('first_person',[-2.9,1.65,2.65],[0,1,-.55])]
for name,p,target in views:
    d=bpy.data.cameras.new(name); d.lens=22; o=bpy.data.objects.new('review_'+name,d); scene.collection.objects.link(o)
    o.location=xyz(p); o.rotation_euler=(Vector(xyz(target))-o.location).to_track_quat('-Z','Y').to_euler()
    if name=='entrance': scene.camera=o
scene.render.engine='CYCLES'; scene.cycles.samples=16
scene.render.resolution_x=1000; scene.render.resolution_y=700; scene.render.resolution_percentage=100
out=ROOT/'public/models/environment'; out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/blender/studio-room-01.blend'))
bpy.ops.object.select_all(action='DESELECT')
exported=[]
for c in cols.values():
    if c.name=='COLLISION_REFERENCE': continue
    for o in c.objects:
        if not o.get('web_exclude'): o.select_set(True); exported.append(o)
bpy.ops.export_scene.gltf(filepath=str(out/'studio-room-01.glb'),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False)
triangles=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in exported if o.type=='MESH')
report={'blender':bpy.app.version_string,'objects':len(exported),'triangles':triangles,'glb_bytes':(out/'studio-room-01.glb').stat().st_size,'materials':len(bpy.data.materials),'textures':0,'source':'Procedurally authored in Blender using the eight user-provided room references','placeholder_equipment':'Unbranded; interactive camera, switcher and monitor remain web components','coordinates':'Shared studio-room-layout.data.json; web Y-up mapped to Blender Z-up'}
(ROOT/'art/blender/studio-room-01-manifest.json').write_text(json.dumps(report,indent=2))
print('STUDIO_REPORT',json.dumps(report))

