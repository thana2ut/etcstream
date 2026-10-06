"""Reference-based Yamaha HS5 for Studio Room 01.

Blender X = cabinet width, Y = depth (front -Y), Z = up. The origin is the
bottom centre. Dimensions are enlarged for the training room; ports are
exported as glTF anchors so their interactive locations stay aligned.
"""
import bpy
import math
from pathlib import Path
from mathutils import Quaternion

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/models/equipment"
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

W, H, D = .54, .90, .43
FRONT, REAR = -D/2, D/2

def material(name, color, metal=0, rough=.55, emission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value = (*color, 1)
    bs.inputs["Metallic"].default_value = metal
    bs.inputs["Roughness"].default_value = rough
    if emission:
        bs.inputs["Emission Color"].default_value = (*color, 1)
        bs.inputs["Emission Strength"].default_value = emission
    return m

cabinet = material("black satin painted enclosure",(.023,.025,.027),.08,.76)
baffle = material("textured charcoal front baffle",(.012,.013,.015),.05,.86)
panel = material("rear black steel amplifier panel",(.019,.02,.022),.45,.52)
rubber = material("soft driver surround",(.009,.01,.012),0,.93)
cone = material("warm white woofer cone",(.69,.70,.68),.03,.79)
cone_shade = material("woofer cone inner shading",(.51,.53,.53),.03,.78)
dust = material("woofer dust cap",(.22,.23,.23),.05,.66)
metal = material("brushed screw and socket metal",(.37,.39,.39),.8,.31)
silver = material("printed rear white",(.78,.79,.78),0,.77)
red = material("status blue white lens",(.52,.74,.95),0,.32,.35)
void = material("dark acoustic port and jack",(.002,.003,.004),0,.95)

def box(name, centre, size, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=centre)
    o=bpy.context.object; o.name=name; o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(mat)
    if bevel:
        mod=o.modifiers.new("case radius","BEVEL")
        mod.width=bevel; mod.segments=5
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return o

def cylinder(name, centre, radius, depth, mat, axis="Y", vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=centre)
    o=bpy.context.object; o.name=name
    if axis=="Y": o.rotation_euler.x=math.pi/2
    o.data.materials.append(mat)
    return o

def torus(name, centre, major, minor, mat, axis="Y"):
    bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=10,location=centre,
        major_radius=major,minor_radius=minor)
    o=bpy.context.object; o.name=name
    if axis=="Y": o.rotation_euler.x=math.pi/2
    o.data.materials.append(mat)
    return o

def legend(name, words, centre, size, mat=silver, rear=True):
    bpy.ops.object.text_add(location=centre,rotation=(math.pi/2 if not rear else -math.pi/2,0,0))
    o=bpy.context.object; o.name=name; o.data.body=words; o.data.size=size
    if rear:
        facing=o.rotation_euler.to_quaternion()
        o.rotation_mode="QUATERNION"
        o.rotation_quaternion=Quaternion((0,1,0),math.pi) @ facing
    o.data.align_x="CENTER"; o.data.align_y="CENTER"
    o.data.materials.append(mat)
    bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target="MESH")

# Enclosure and front face. Front details stand slightly proud of the baffle.
box("HS5 rounded black cabinet",(0,0,H/2),(W,D,H),cabinet,.018)
box("inset front baffle",(0,FRONT-.003,H/2),(W-.038,.007,H-.038),baffle,.013)
front=FRONT-.009
for z,outer in ((.38,.166),(.705,.082)):
    cylinder("driver mounting well",(0,front+.001,z),outer,.004,void)
    torus("rubber driver gasket",(0,front-.004,z),outer-.012,.011,rubber)
    for angle in range(4):
        a=angle*math.pi/2+math.pi/4
        cylinder("driver screw",((outer-.016)*math.cos(a),front-.006,z+(outer-.016)*math.sin(a)),.004,.002,metal,vertices=12)
# White five-inch woofer: annular rolled edge, shallow sloped cone and dust cap.
torus("white woofer roll",(0,front-.006,.38),.125,.018,cone_shade)
cylinder("white woofer diaphragm",(0,front-.006,.38),.119,.004,cone)
torus("woofer inner bevel",(0,front-.008,.38),.068,.008,cone_shade)
cylinder("woofer central dust cap",(0,front-.010,.38),.061,.005,dust)
# Dark dome tweeter and its shallow waveguide.
torus("tweeter waveguide",(0,front-.007,.705),.058,.016,rubber)
cylinder("tweeter soft dome",(0,front-.010,.705),.029,.007,void)
cylinder("front bass reflex port",(.154,front-.002,.705),.026,.004,void)
torus("front port lip",(.154,front-.006,.705),.027,.004,rubber)
legend("YAMAHA front logo","YAMAHA",(0,front-.004,.095),.029,rear=False)
cylinder("power indicator",(0,front-.007,.058),.006,.003,red,vertices=20)

# Rear amplifier panel from the supplied straight-on reference.
front_objects={o.name for o in bpy.data.objects}
box("recessed rear amplifier panel",(0,REAR+.002,H/2),(.432,.008,.724),panel,.011)
rear=REAR+.008
legend("YAMAHA rear mark","YAMAHA",(-.062,rear+.002,.755),.026)
legend("rear model legend","POWERED SPEAKER SYSTEM  HS5",(.088,rear+.002,.755),.010)
for x,z in ((-.18,.77),(.18,.77),(-.18,.15),(.18,.15),(-.18,.51),(.18,.51)):
    cylinder("rear panel screw",(x,rear+.002,z),.008,.003,metal,vertices=16)
# Round rear bass reflex tube with a dark inset and thick flared rim.
cylinder("rear reflex tube",(-.048,rear+.002,.655),.065,.004,void)
torus("rear reflex flare",(-.048,rear+.006,.655),.068,.010,rubber)
# LEVEL, ROOM CONTROL and HIGH TRIM treatment.
cylinder("level knob pedestal",(.137,rear+.008,.684),.038,.012,rubber)
cylinder("level rotary knob",(.137,rear+.019,.684),.027,.014,cabinet)
for k in range(14):
    a=k*2*math.pi/14
    box("knob grip flute",(.137+.026*math.cos(a),rear+.028,.684+.026*math.sin(a)),(.003,.002,.003),metal)
legend("level marking","LEVEL",(.137,rear+.001,.736),.012)
for z,name in ((.443,"ROOM CONTROL"),(.378,"HIGH TRIM")):
    box("rear EQ slider rail",(.137,rear+.010,z),(.078,.006,.018),void,.002)
    box("rear EQ slider",(.125,rear+.016,z),(.014,.006,.024),metal,.002)
    legend(name+" marking",name,(.122,rear+.002,z+.028),.011)
# XLR female and balanced 6.35 mm TRS input, one above the other.
PORT_XLR=(.138,REAR+.017,.558)
PORT_TRS=(.138,REAR+.017,.478)
for centre,label_text,rad in ((PORT_XLR,"INPUT 1 XLR",.030),(PORT_TRS,"INPUT 2 TRS",.020)):
    x,y,z=centre
    cylinder(label_text+" flange",(x,REAR+.008,z),rad+.005,.007,metal)
    cylinder(label_text+" socket",(x,REAR+.014,z),rad-.004,.003,void)
    legend(label_text+" legend",label_text,(x,REAR+.010,z+.039),.009)
for x,z in ((.128,.567),(.151,.567),(.139,.546)):
    cylinder("XLR three contact well",(x,REAR+.017,z),.003,.001,metal,vertices=12)
cylinder("TRS inner sleeve",(.138,REAR+.018,.478),.008,.002,metal)
cylinder("TRS black bore",(.138,REAR+.019,.478),.005,.002,void)

box("power rocker bezel",(.130,REAR+.010,.275),(.067,.008,.048),rubber,.004)
box("power rocker",(.130,REAR+.016,.275),(.053,.005,.036),panel,.003)
legend("power rocker label","POWER",(.13,REAR+.009,.313),.011)
box("IEC mains socket",(.130,REAR+.010,.175),(.070,.008,.068),rubber,.004)
box("IEC dark receptacle",(.130,REAR+.015,.175),(.046,.003,.042),void,.003)
legend("mains label","AC IN",(.13,REAR+.009,.220),.011)

for name,point,connector in (("PORT_XLR_INPUT",PORT_XLR,"XLR balanced"),("PORT_TRS_INPUT",PORT_TRS,"6.35 mm TRS balanced")):
    o=bpy.data.objects.new(name,None)
    bpy.context.collection.objects.link(o)
    o.location=point
    o["connector"]=connector
    o["direction"]="INPUT"

# From behind, the reference has the reflex port on the left and inputs on
# the right. Mirror the rear assembly in cabinet space, keeping text readable.
for o in bpy.data.objects:
    if o.name not in front_objects:
        o.location.x=-o.location.x

bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/"art/blender/yamaha-hs5.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT/"yamaha-hs5.glb"),export_format="GLB",export_extras=True,
    export_animations=False,export_cameras=False,export_lights=False)
print("HS5_MODEL",(OUT/"yamaha-hs5.glb").stat().st_size)
