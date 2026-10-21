"""Build the selected Thai 85-inch UA85U8000FKXXT body for the existing studio stand.

Only the display is authored here: no feet or floor stand. Blender X is width,
-Y is the viewer-facing screen, Z is up. The origin is the display centre.
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

def material(name, color, metallic=0, roughness=.5):
    m=bpy.data.materials.new(name)
    m.diffuse_color=(*color,1)
    m.use_nodes=True
    bs=m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value=(*color,1)
    bs.inputs["Metallic"].default_value=metallic
    bs.inputs["Roughness"].default_value=roughness
    return m

edge=material("thin graphite bezel",(.015,.017,.021),.32,.39)
glass=material("dark reflective display glass",(.008,.011,.020),.09,.14)
back=material("moulded charcoal rear",(.028,.031,.035),.08,.79)
brushed=material("lower chin brushed black",(.040,.042,.046),.35,.47)
metal=material("HDMI jack rim",(.37,.39,.42),.75,.31)
hole=material("HDMI receptacle interior",(.002,.003,.005),0,.89)
white=material("rear and front silk lettering",(.73,.75,.77),0,.68)

def box(name, center, size, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=center)
    o=bpy.context.object; o.name=name; o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(mat)
    if bevel:
        mod=o.modifiers.new("soft manufactured edge","BEVEL")
        mod.width=bevel; mod.segments=4
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return o

def legend(name,value,center,size,front=True):
    bpy.ops.object.text_add(location=center,rotation=(math.pi/2 if front else -math.pi/2,0,0))
    o=bpy.context.object; o.name=name; o.data.body=value; o.data.size=size
    if not front:
        facing=o.rotation_euler.to_quaternion()
        o.rotation_mode="QUATERNION"
        o.rotation_quaternion=Quaternion((0,1,0),math.pi) @ facing
    o.data.align_x="CENTER"; o.data.align_y="CENTER"
    o.data.materials.append(white)
    bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target="MESH")

# Official local 85-inch drawing: 1889.9 × 1083.5 × 77 mm without retail feet.
# Uniformly display at 1 m wide to retain the established room footprint; the production stand is generic.
HEIGHT=1083.5/1889.9
FRONT=-.017
REAR=FRONT+77/1889.9
chassis=box("slim U8000F outer chassis",(0,FRONT+.011,0),(1.00,.022,HEIGHT),edge,.005)
chassis["game_target_sku"]="UA85U8000FKXXT"
chassis["real_dimensions_m"]=[1.8899,1.0835,.077]
chassis["display_scale"]=1/1.8899
chassis["reference_status"]="OWNER_SELECTED_GAME_VARIANT / PARTIAL_REFERENCE"
box("seamless front glass",(0,FRONT-.0003,.003),(.979,.002,.5507),glass,.002)
box("lower bezel",(0,FRONT-.001,-HEIGHT/2+.008),(.994,.003,.016),brushed,.002)
legend("SAMSUNG lower bezel wordmark","SAMSUNG",(0,FRONT-.003,-HEIGHT/2+.008),.008)
box("lower electronics enclosure",(0,(REAR+.005)/2,-.065),(.75,REAR-.005,.405),back,.010)
for i in range(28):
    box("rear horizontal moulded rib",(0,.0058,-HEIGHT/2+.022+i*(HEIGHT-.045)/27),(.96,.001,.0018),back)
for x in (-.4/1.8899/2,.4/1.8899/2):
    for z in (-.3/1.8899/2,.3/1.8899/2):
        box("VESA 400 x 300 mounting well",(x,REAR+.0008,z),(.008,.001,.008),hole,.002)
box("stand attachment plate",(0,REAR+.003,-.17),(.18,.006,.09),metal,.004)
legend("rear product mark","SAMSUNG  UA85U8000FKXXT",(0,REAR+.001,-.012),.012,front=False)

# Three discrete Type-A HDMI inputs down the right side of the rear electronics
# enclosure. Anchor positions map directly to training-room port markers.
for number,z in enumerate((-.095,-.16,-.225),1):
    x=.315
    # X/Y service spacing remains the training layout; exact SKU port coordinates are not surveyed.
    box(f"HDMI {number} steel socket",(x,REAR+.001,z),(.021,.002,.009),metal,.001)
    box(f"HDMI {number} dark aperture",(x,REAR+.0025,z),(.017,.001,.006),hole,.001)
    box(f"HDMI {number} contact tongue",(x,REAR+.0032,z-.001),(.012,.001,.001),metal)
    legend(f"HDMI {number} label",f"HDMI {number}",(x,REAR+.0037,z+.012),.006,front=False)
    anchor=bpy.data.objects.new(f"PORT_HDMI_{number}",None)
    bpy.context.collection.objects.link(anchor)
    anchor.location=(x,REAR+.006,z)
    anchor["position_evidence"]="training service position; approximate, not measured SKU coordinates"
    anchor["connector"]="HDMI Type-A"
    anchor["direction"]="INPUT"
    anchor["port_id"]=f"HDMI_{number}"

bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/"art/blender/samsung-u8000f.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT/"samsung-u8000f.glb"),export_format="GLB",export_extras=True,
    export_animations=False,export_cameras=False,export_lights=False)
print("SAMSUNG_U8000F",(OUT/"samsung-u8000f.glb").stat().st_size)
