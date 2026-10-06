"""Build the reference-based Magewell USB Capture HDMI Gen 2 model.

Blender X is the long axis, -X is HDMI IN, +X is USB 3.0. The origin is
the bottom centre. Dimensions are visual estimates from the supplied images.
"""
import bpy
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/models/equipment"
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

def mat(name, color, metal=0, rough=.5):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value = (*color, 1)
    bs.inputs["Metallic"].default_value = metal
    bs.inputs["Roughness"].default_value = rough
    return m

silver = mat("satin anodized aluminium", (.68,.69,.68), .65, .38)
edge = mat("polished rim", (.83,.84,.82), .8, .27)
socket = mat("socket shadow", (.025,.027,.03), 0, .85)
steel = mat("connector steel", (.38,.40,.41), .75, .3)
blue = mat("USB 3 blue tongue", (.045,.18,.60), 0, .6)
ink = mat("dark printed lettering", (.12,.13,.14), 0, .85)
white = mat("indicator lens", (.84,.87,.83), 0, .3)

def cube(name, at, size, material, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=at)
    o = bpy.context.object
    o.name = name
    o.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    if bevel:
        mod = o.modifiers.new("manufactured radius", "BEVEL")
        mod.width = bevel
        mod.segments = 5
        bpy.ops.object.modifier_apply(modifier=mod.name)
    # Keep the broad metal faces planar; smoothing every polygon made the chassis look inflated.
    for p in o.data.polygons: p.use_smooth = False
    return o

def print_text(name, value, at, size, rotate=0):
    bpy.ops.object.text_add(location=at)
    o = bpy.context.object
    o.name = name
    o.data.body = value
    o.data.size = size
    o.data.align_x = "CENTER"
    o.data.align_y = "CENTER"
    o.rotation_euler.z = rotate
    o.data.materials.append(ink)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target="MESH")
    return o

# 96 × 42 × 16 mm, fitted to the proportions of the user's front and top views.
cube("rounded silver aluminium housing", (0,0,.0075), (.096,.042,.015), silver, .002)
cube("thin bright upper edge", (0,0,.0145), (.0954,.0414,.001), edge, .0003)
cube("satin top face", (0,0,.0151), (.0948,.0408,.0004), silver, .00015)

# Recessed connector faces sit at the actual ends of the case.
cube("HDMI IN inset", (-.0481,0,.0075), (.00035,.016,.0065), socket, .001)
cube("HDMI metal surround", (-.04835,0,.0075), (.00025,.014,.0054), steel, .0007)
cube("HDMI dark receptacle", (-.04854,0,.0075), (.00018,.0115,.0035), socket, .00055)
cube("HDMI inner tongue", (-.0487,0,.00725), (.00012,.009,.00075), steel, .0002)
cube("USB 3.0 inset", (.0481,0,.0075), (.00035,.014,.007), socket, .0008)
cube("USB Type-A steel rim", (.04835,0,.0075), (.00025,.0125,.0058), steel, .0006)
cube("USB Type-A cavity", (.04853,0,.0075), (.00016,.0105,.0044), socket, .00035)
cube("USB 3.0 blue tongue", (.04866,0,.00665), (.00015,.009,.001), blue, .00015)
for y in (-.0035,-.0012,.0012,.0035):
    cube("USB contact", (.04875,y,.00725), (.00011,.00055,.00022), steel)

print_text("USB Capture HDMI legend", "USB Capture HDMI", (0,.001,.01541), .005)
print_text("MAGEWELL logo", "MAGEWELL", (0,-.0052,.01542), .0028)
for y in (-.0085,-.003):
    cube("logo rule", (-.024 if y == -.0085 else .024,y,.01543), (.008,.00022,.0001), ink)
print_text("HDMI IN end legend", "HDMI IN", (-.038,0,.01543), .0022, math.pi/2)
print_text("USB icon legend", "USB 3.0", (.039,0,.01543), .0021, -math.pi/2)

for y, name in ((-.012,"STATUS"),(.012,"POWER")):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=.00085, location=(.035,y,.01543))
    bpy.context.object.name = name + " indicator lens"
    bpy.context.object.data.materials.append(white)
    print_text(name + " legend", name, (.040,y,.01545), .0014, -math.pi/2)

# Empty anchors are exported as glTF nodes for alignment and automated checking.
for name, x, connector, direction in (("PORT_HDMI_IN",-.0488,"HDMI Type-A","INPUT"),("PORT_USB_3_0",.0488,"USB 3.0 Type-A","OUTPUT")):
    o = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(o)
    o.location = (x,0,.0075)
    o["connector"] = connector
    o["direction"] = direction

bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / "art/blender/magewell-capture.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT / "magewell-capture.glb"), export_format="GLB", export_extras=True, export_animations=False, export_cameras=False, export_lights=False)
print("MAGEWELL_MODEL", json.dumps({"bytes": (OUT / "magewell-capture.glb").stat().st_size, "objects": len(bpy.data.objects)}))
