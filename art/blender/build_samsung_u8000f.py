"""Build the Samsung 43-inch U8000F television body for the existing studio stand.

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

# A 43-inch 16:9 picture is about 0.95 m wide. The display is mounted on the
# pre-existing production stand, so the retail feet are intentionally absent.
box("slim U8000F outer chassis",(0,.011,0),(1.00,.046,.588),edge,.008)
box("seamless front glass",(0,-.013,.003),(.979,.003,.552),glass,.003)
box("one centimetre lower bezel",(0,-.014,-.277),(.994,.004,.027),brushed,.002)
legend("SAMSUNG lower bezel wordmark","SAMSUNG",(0,-.017,-.279),.011)
box("lower electronics enclosure",(0,.046,-.078),(.75,.061,.39),back,.019)
box("rear panel texture seam",(0,.078,-.078),(.69,.001,.32),edge,.009)
box("VESA upper mount boss",(0,.078,.102),(.18,.013,.12),back,.006)
box("stand attachment plate",(0,.085,-.17),(.18,.025,.09),metal,.006)
legend("rear product mark","SAMSUNG  UA43U8000FKXXT",(0,.079,-.012),.017,front=False)

# Three discrete Type-A HDMI inputs down the right side of the rear electronics
# enclosure. Anchor positions map directly to training-room port markers.
for number,z in enumerate((-.095,-.16,-.225),1):
    x=.315
    box(f"HDMI {number} steel socket",(x,.080,z),(.034,.006,.016),metal,.002)
    box(f"HDMI {number} dark aperture",(x,.084,z),(.028,.003,.010),hole,.001)
    box(f"HDMI {number} contact tongue",(x,.086,z-.002),(.021,.001,.002),metal)
    legend(f"HDMI {number} label",f"HDMI {number}",(x,.087,z+.017),.008,front=False)
    anchor=bpy.data.objects.new(f"PORT_HDMI_{number}",None)
    bpy.context.collection.objects.link(anchor)
    anchor.location=(x,.09,z)
    anchor["connector"]="HDMI Type-A"
    anchor["direction"]="INPUT"
    anchor["port_id"]=f"HDMI_{number}"

bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/"art/blender/samsung-u8000f.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT/"samsung-u8000f.glb"),export_format="GLB",export_extras=True,
    export_animations=False,export_cameras=False,export_lights=False)
print("SAMSUNG_U8000F",(OUT/"samsung-u8000f.glb").stat().st_size)
