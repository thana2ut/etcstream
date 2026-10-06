"""Reference based XS 1 for studio-full only. Blender X runs from XLR base to grille."""
import bpy
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/models/equipment"
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

def material(name, color, metallic=0, roughness=.5):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value = (*color, 1)
    bs.inputs["Metallic"].default_value = metallic
    bs.inputs["Roughness"].default_value = roughness
    return m

body = material("XS1 satin black body", (.016,.017,.018), .38, .43)
grille = material("woven charcoal grille", (.008,.009,.010), .05, .93)
mesh_dark = material("dark grille depth", (.007,.008,.009), .2, .88)
ring = material("grille retaining ring", (.024,.025,.026), .4, .36)
metal = material("XLR pin metal", (.53,.56,.57), .82, .26)
label = material("printed white lettering", (.73,.74,.72), 0, .7)

def lathe(name, profile, mat, count=48):
    verts = [(x, r*math.cos(2*math.pi*j/count), .027+r*math.sin(2*math.pi*j/count)) for x,r in profile for j in range(count)]
    faces = []
    for i in range(len(profile)-1):
        for j in range(count):
            a=i*count+j; b=i*count+(j+1)%count
            faces.append((a,b,b+count,a+count))
    faces.extend([tuple(reversed(tuple(range(count)))), tuple((len(profile)-1)*count+j for j in range(count))])
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    o=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(mat)
    for poly in mesh.polygons: poly.use_smooth=True
    return o

def cube(name, at, size, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=at)
    o=bpy.context.object; o.name=name; o.dimensions=size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    if bevel:
        mod=o.modifiers.new("soft edge","BEVEL"); mod.width=bevel; mod.segments=3
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return o

def text(name, value, at, size, mat=label):
    bpy.ops.object.text_add(location=at)
    o=bpy.context.object; o.name=name; o.data.body=value; o.data.size=size
    o.data.align_x="CENTER"; o.data.align_y="CENTER"
    o.data.materials.append(mat)
    bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target="MESH")
    return o

# Approximate photo proportions: 212 mm long, rounded 50 mm grille.
lathe("tapered handheld barrel", [(-.106,.010),(-.103,.011),(-.065,.0115),(-.025,.013),(.018,.016),(.041,.019),(.047,.020)], body)
lathe("base edge", [(-.106,.0105),(-.104,.011),(-.103,.011)], ring)
head_profile = [(.041,.019),(.049,.023),(.059,.025),(.087,.025),(.093,.0238),(.098,.0205),(.102,.015),(.105,.008),(.106,.001)]
lathe("grille backing", head_profile, mesh_dark)
lathe("lower grille collar", [(.042,.020),(.046,.021),(.049,.021)], ring)
lathe("centre grille band", [(.070,.0256),(.073,.0256)], ring)

# Crossed fine wires give the close woven appearance of the supplied image.
def wire(name, points, radius=.00022):
    curve=bpy.data.curves.new(name,"CURVE"); curve.dimensions="3D"
    curve.bevel_depth=radius; curve.bevel_resolution=1
    spline=curve.splines.new("POLY"); spline.points.add(len(points)-1)
    for p,co in zip(spline.points,points): p.co=(*co,1)
    o=bpy.data.objects.new(name,curve); bpy.context.collection.objects.link(o)
    o.data.materials.append(grille)

def head_radius(x):
    for (x0,r0),(x1,r1) in zip(head_profile,head_profile[1:]):
        if x <= x1: return r0+(r1-r0)*(x-x0)/(x1-x0)
    return head_profile[-1][1]

for turn in range(32):
    for direction in (-1,1):
        points=[]
        for step in range(69):
            x=.048+step*.00084
            r=head_radius(x)+.00024
            a=2*math.pi*turn/32+direction*step*.105
            points.append((x, r*math.cos(a), .027+r*math.sin(a)))
        wire("woven grille diagonal",points)

# The woven shell is one renderable mesh even though its strands were authored separately.
strands=[o for o in bpy.data.objects if o.name.startswith("woven grille diagonal")]
bpy.ops.object.select_all(action="DESELECT")
for o in strands: o.select_set(True)
bpy.context.view_layer.objects.active=strands[0]
bpy.ops.object.convert(target="MESH")
bpy.ops.object.join()
bpy.context.object.name="woven grille shell"

cube("recessed power switch track", (-.032,0,.0391), (.029,.013,.0013), mesh_dark, .003)
cube("slide switch", (-.039,0,.0402), (.010,.010,.0018), ring, .0015)
for i in range(7):
    cube("switch grip line", (-.043+i*.0012,0,.04118),(.00035,.007,.00012),body)
text("XS1 marking","XS1",(-.003,0,.0418),.003)
text("SENNHEISER marking","SENNHEISER",(-.070,0,.0388),.0024)
text("brand mark","S",(-.095,0,.0388),.0045)

# Three visible male XLR pins and a socket cavity at the cable end.
lathe("XLR output cavity", [(-.107,.008),(-.106,.008),(-.105,.008)], mesh_dark)
for y,z in ((-.003,.025),(.003,.025),(0,.030)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=.00065, depth=.0025, location=(-.107,y,z), rotation=(0,math.pi/2,0))
    bpy.context.object.name="XLR 3-pin output contact"
    bpy.context.object.data.materials.append(metal)

anchor=bpy.data.objects.new("PORT_XLR_OUTPUT",None)
bpy.context.collection.objects.link(anchor)
anchor.location=(-.108,0,.027)
anchor["connector"]="XLR 3-pin male"
anchor["direction"]="OUTPUT"

bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/"art/blender/sennheiser-xs1.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT/"sennheiser-xs1.glb"),export_format="GLB",export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
print("XS1_MODEL",(OUT/"sennheiser-xs1.glb").stat().st_size)
