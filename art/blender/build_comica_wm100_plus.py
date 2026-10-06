"""Build room-scale COMICA WM100 PLUS RX and TX models from supplied views.

Three separate units share one TX asset. Origin is bottom centre; Blender Z is up.
The model is enlarged for legibility in the training room, not a dimensional CAD copy.
"""
import bpy
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/models/equipment"
OUT.mkdir(parents=True, exist_ok=True)

def reset():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

def material(name, color, metal=0, rough=.6, glow=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value = (*color, 1)
    bs.inputs["Metallic"].default_value = metal
    bs.inputs["Roughness"].default_value = rough
    if glow:
        bs.inputs["Emission Color"].default_value = (*color, 1)
        bs.inputs["Emission Strength"].default_value = glow
    return m

black = material("matte textured charcoal shell", (.025,.027,.032), .08, .83)
panel = material("recessed face panel", (.012,.014,.018), .04, .67)
edge = material("case edge rubber", (.057,.06,.066), .08, .8)
metal = material("socket metal", (.42,.44,.44), .72, .29)
gold = material("warm display frame", (.64,.45,.17), .55, .42)
lcd = material("LCD pale grey-blue", (.52,.58,.60), .06, .62)
ink = material("LCD dark legends", (.045,.06,.07), 0, .9)
white = material("printed white", (.82,.83,.83), 0, .75)
green = material("RF green indicator", (.05,.8,.14), 0, .32, .7)
red = material("mute red indicator", (.8,.045,.035), 0, .4)

def cube(name, at, dims, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=at)
    o = bpy.context.object; o.name = name; o.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    if bevel:
        mod=o.modifiers.new("rounded manufactured edge","BEVEL")
        mod.width=bevel; mod.segments=3
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return o

def cyl(name, at, radius, depth, mat, vertices=20):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=at)
    bpy.context.object.name=name
    bpy.context.object.data.materials.append(mat)
    return bpy.context.object

def text(name, body, at, size, mat=white, rotation=(math.pi/2,0,0)):
    bpy.ops.object.text_add(location=at, rotation=rotation)
    o=bpy.context.object; o.name=name; o.data.body=body; o.data.size=size
    o.data.align_x="CENTER"; o.data.align_y="CENTER"
    o.data.materials.append(mat)
    bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target="MESH")

def build(kind):
    reset()
    rx = kind == "rx"
    w,h,d = (.170,.270,.070) if rx else (.155,.255,.065)
    # Front is Blender -Y, which becomes +Z in the web viewer.
    cube("rounded main enclosure",(0,0,h/2),(w,d,h),black,.012)
    cube("front inset",(0,-d/2-.0005,h*.52),(w*.87,.002,h*.78),panel,.009)
    for side in (-1,1):
        cube("grippy side rail",(side*(w/2-.006),0,h*.50),(.012,d*.96,h*.91),edge,.004)
    cube("battery door seam",(0,d/2+.0003,h*.24),(w*.73,.001,h*.37),edge,.002)
    cube("rear belt clip",(0,d/2+.005,h*.59),(w*.40,.012,h*.54),black,.007)
    cube("upper front control island",(0,-d/2-.002,h*.48),(w*.75,.003,h*.17),edge,.007)
    cube("LCD gold frame",(0,-d/2-.003,h*.70),(w*.66,.003,h*.20),gold,.005)
    cube("LCD screen",(0,-d/2-.005,h*.70),(w*.59,.001,h*.17),lcd,.003)
    text("LCD frequency", "CH 8   512.5MHz",(0,-d/2-.0058,h*.70),.009,ink)
    text("LCD group", "GROUP A     RF",(0,-d/2-.0058,h*.745),.0065,ink)
    text("COMICA wordmark","COMICA",(0,-d/2-.003,h*.16),.017)
    for x,mark in ((-w*.23,"<"),(0,"SET"),(w*.23,">")):
        cube("front control button",(x,-d/2-.004,h*.48),(.022,.003,.019),black,.003)
        text("button legend",mark,(x,-d/2-.006,h*.48),.008)
    # Two bright RF/AF bars and central mute indicator.
    for x in (-.016,.016):
        cube("green signal lamp",(x,-d/2-.003,h*.93),(.007,.003,.018),green,.001)
    cube("mute indicator",(0,-d/2-.003,h*.93),(.009,.002,.015),red,.001)
    # Long rubber aerial at the left with a thick strain relief.
    cyl("antenna base",(-w*.32,0,h+.006),.012,.018,edge)
    cyl("vertical whip antenna",(-w*.32,0,h+.087),.0035,.15,black)
    cyl("antenna rounded cap",(-w*.32,0,h+.164),.005,.012,edge)
    # 3.5 mm locking jack with a readable metallic collar.
    px=w*.23
    cyl("3.5 mm jack outer",(px,0,h+.001),.013,.005,metal)
    cyl("3.5 mm jack black well",(px,0,h+.004),.008,.001,black)
    cyl("3.5 mm jack opening",(px,0,h+.0047),.0032,.0005,panel)
    text("port label", "AUDIO OUT" if rx else "MIC IN", (px, -d*.32,h+.002), .006, white, (0,0,0))
    if rx:
        cyl("second receiver antenna base",(w*.39,0,h+.006),.011,.018,edge)
        cyl("second receiver antenna",(w*.39,0,h+.087),.0035,.15,black)
        cyl("second antenna cap",(w*.39,0,h+.164),.005,.012,edge)
    else:
        cyl("transmitter power button",(w*.39,0,h+.003),.012,.005,edge)
    anchor=bpy.data.objects.new("PORT_AUDIO_OUT" if rx else "PORT_MIC_IN",None)
    bpy.context.collection.objects.link(anchor)
    anchor.location=(px,0,h+.005)
    anchor["connector"]="3.5 mm TRS"
    anchor["direction"]="OUTPUT" if rx else "INPUT"
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/f"art/blender/comica-wm100-plus-{kind}.blend"))
    bpy.ops.export_scene.gltf(filepath=str(OUT/f"comica-wm100-plus-{kind}.glb"),export_format="GLB",export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
    print("COMICA",kind,(OUT/f"comica-wm100-plus-{kind}.glb").stat().st_size)

for kind in ("rx","tx"):
    build(kind)
