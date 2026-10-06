"""Build the silver HP 15.6-inch laptop shown in art/reference/hp-laptop.

Run with Blender 5.2:
  blender --background --python art/blender/build_hp_laptop.py

The seven user-supplied views define the visible form: silver wedge chassis, full keyboard
with numpad, offset touchpad, thin black display bezel, webcam bar, HP marks and the ports on
both sides. The exact commercial SKU and factory dimensions were not supplied, so the physical
size uses the common 15.6-inch envelope visible in the references (358 x 242 mm).
"""
import bpy, json, math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
REF = ROOT / "art/reference/hp-laptop/1-รูปภาพ-1.jpg"
OUT = ROOT / "public/models/equipment"
REVIEWS = ROOT / "art/blender/reviews/hp-laptop"
OUT.mkdir(parents=True, exist_ok=True)
REVIEWS.mkdir(parents=True, exist_ok=True)

W, D, BASE_H, LID_H = .358, .242, .019, .218

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for block in (bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.cameras, bpy.data.lights):
    for item in list(block): block.remove(item)

scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.length_unit = "METERS"
root = bpy.data.collections.new("HP_LAPTOP_15")
scene.collection.children.link(root)
cols = {}
for name in ["CHASSIS", "DISPLAY", "KEYBOARD", "PORTS", "BRANDING", "COLLISION_REFERENCE"]:
    cols[name] = bpy.data.collections.new("HP_LAPTOP_" + name)
    root.children.link(cols[name])

def mat(name, color, rough=.5, metal=0., emission=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    bs = m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value = (*color, 1)
    bs.inputs["Roughness"].default_value = rough
    bs.inputs["Metallic"].default_value = metal
    if emission:
        bs.inputs["Emission Color"].default_value = (*emission, 1)
        bs.inputs["Emission Strength"].default_value = .35
    return m

silver = mat("hp_brushed_silver", (.68, .70, .72), .32, .78)
silver_dark = mat("hp_hinge_silver", (.38, .40, .43), .3, .85)
black = mat("hp_key_black", (.018, .020, .024), .66)
bezel = mat("hp_display_bezel_black", (.009, .010, .013), .32)
legend = mat("hp_key_legend_white", (.78, .80, .82), .55)
port_void = mat("hp_port_void", (.002, .003, .004), .92)
port_metal = mat("hp_port_metal", (.35, .37, .40), .25, .82)
rubber = mat("hp_rubber", (.012, .013, .014), .92)
camera_glass = mat("hp_webcam_glass", (.004, .007, .010), .15, .1)
led = mat("hp_status_led", (.35, .72, .95), .25, .2, (.35, .72, .95))

def link(o, name, material, collection):
    o.name = name
    for c in list(o.users_collection): c.objects.unlink(o)
    cols[collection].objects.link(o)
    if material: o.data.materials.append(material)
    return o

def box(name, center, size, material, collection, bevel=0., parent=None, rotation=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    o = bpy.context.object; o.dimensions = size
    if rotation: o.rotation_euler = rotation
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    link(o, name, material, collection)
    if bevel:
        mod = o.modifiers.new("soft manufactured edge", "BEVEL")
        mod.width = bevel; mod.segments = 3
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if parent: o.parent = parent
    return o

def cyl(name, center, radius, depth, material, collection, axis="Z", verts=24, parent=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=center)
    o = bpy.context.object
    if axis == "X": o.rotation_euler.y = math.pi / 2
    elif axis == "Y": o.rotation_euler.x = math.pi / 2
    link(o, name, material, collection)
    if parent: o.parent = parent
    return o

def text_mesh(name, body, center, size, material, parent=None):
    bpy.ops.object.text_add(location=center)
    o = bpy.context.object; o.data.body = body; o.data.size = size
    o.data.align_x = "CENTER"; o.data.align_y = "CENTER"; o.data.extrude = 0
    o.data.resolution_u = 2
    bpy.ops.object.convert(target="MESH")
    link(o, name, material, "KEYBOARD")
    if parent: o.parent = parent
    return o

def join_objects(objects, name):
    if not objects: return None
    bpy.ops.object.select_all(action="DESELECT")
    for o in objects: o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join(); objects[0].name = name
    return objects[0]

# --- Base enclosure and deck -------------------------------------------------
box("hp_base_lower_wedge", (0, 0, .007), (W, D, .014), silver, "CHASSIS", .004)
box("hp_keyboard_deck", (0, -.002, .016), (W - .005, D - .007, .006), silver, "CHASSIS", .003)
box("hp_front_lip", (0, -D / 2 + .004, .010), (W - .035, .006, .005), silver_dark, "CHASSIS", .002)
box("hp_rear_vent", (0, D / 2 - .018, .020), (W - .065, .012, .003), black, "CHASSIS", .001)

for x in (-W / 2 + .028, W / 2 - .028):
    for y in (-D / 2 + .018, D / 2 - .024):
        box("hp_rubber_foot", (x, y, -.001), (.032, .009, .003), rubber, "CHASSIS", .001)

# Offset trackpad matches the references (centred under the main keyboard, left of numpad).
box("hp_touchpad_recess", (-.038, -.076, .0201), (.116, .070, .0012), silver_dark, "CHASSIS", .002)
box("hp_touchpad_surface", (-.038, -.076, .0208), (.113, .067, .0008), silver, "CHASSIS", .002)

# --- Full-size chiclet keyboard ---------------------------------------------
keycaps, legends = [], []
rows = [
    ["esc","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","prt","del","home","end","pg"],
    ["`","1","2","3","4","5","6","7","8","9","0","-","=","back","num","/","*","-"],
    ["tab","Q","W","E","R","T","Y","U","I","O","P","[","]","\\","7","8","9","+"],
    ["caps","A","S","D","F","G","H","J","K","L",";","'","enter","","4","5","6","+"],
    ["shift","Z","X","C","V","B","N","M",",",".","/","shift","↑","","1","2","3","enter"],
    ["ctrl","fn","win","alt","","space","","alt","ctrl","←","↓","→","","","0","0",".","enter"],
]
x0, dx = -.161, .0180
ys = [.083, .0625, .0415, .0205, -.0005, -.0215]
for ri, labels in enumerate(rows):
    for ci, label_text in enumerate(labels):
        if not label_text: continue
        x, y = x0 + ci * dx, ys[ri]
        w = .0162
        if label_text in ("back", "tab", "caps", "enter", "shift", "space"): w = .0170
        keycaps.append(box("hp_key", (x, y, .0230), (w, .0170, .0038), black, "KEYBOARD", .0012))
        display = {"back":"←", "enter":"↵", "shift":"⇧", "space":"", "win":"⊞", "caps":"caps", "ctrl":"ctrl"}.get(label_text, label_text)
        if display:
            legends.append(text_mesh("hp_key_legend", display, (x, y, .0250), .0042 if len(display) <= 2 else .0030, legend))
join_objects(keycaps, "hp_keyboard_keycaps")
join_objects(legends, "hp_keyboard_legends")
box("hp_power_button", (.159, .102, .023), (.015, .009, .003), black, "KEYBOARD", .002)
cyl("hp_power_icon", (.159, .102, .025), .0022, .0006, legend, "KEYBOARD", verts=16)

# --- Hinges and display assembly --------------------------------------------
for x in (-.132, .132): cyl("hp_display_hinge", (x, .105, .026), .009, .055, silver_dark, "DISPLAY", axis="X", verts=32)

display_root = bpy.data.objects.new("hp_display_hinge_pivot", None)
cols["DISPLAY"].objects.link(display_root)
display_root.location = (0, .105, .026)
display_root.rotation_euler.x = math.radians(-12)

box("hp_display_lid", (0, 0, LID_H / 2), (.352, .009, LID_H), silver, "DISPLAY", .006, display_root)
box("hp_display_bezel", (0, -.0054, .112), (.342, .004, .204), bezel, "DISPLAY", .004, display_root)

# Screen plane, UV-cropped to the display area in the supplied front reference.
sw, sh, zc = .326, .174, .116
verts = [(-sw/2, -.008, zc-sh/2), (sw/2, -.008, zc-sh/2), (sw/2, -.008, zc+sh/2), (-sw/2, -.008, zc+sh/2)]
mesh = bpy.data.meshes.new("hp_screen_mesh")
mesh.from_pydata(verts, [], [(0, 1, 2, 3)]); mesh.update()
uv = mesh.uv_layers.new(name="UVMap")
coords = [(0.105, .400), (.897, .400), (.897, .854), (0.105, .854)]
for poly in mesh.polygons:
    for li, vi in zip(poly.loop_indices, poly.vertices): uv.data[li].uv = coords[vi]
screen_mat = bpy.data.materials.new("hp_screen_windows_reference"); screen_mat.use_nodes = True
nodes = screen_mat.node_tree.nodes; links = screen_mat.node_tree.links
for n in list(nodes): nodes.remove(n)
out = nodes.new("ShaderNodeOutputMaterial"); bs = nodes.new("ShaderNodeBsdfPrincipled")
img = nodes.new("ShaderNodeTexImage"); img.image = bpy.data.images.load(str(REF)); img.interpolation = "Linear"
bs.inputs["Roughness"].default_value = .28; bs.inputs["Metallic"].default_value = .05
bs.inputs["Emission Strength"].default_value = .3
links.new(img.outputs["Color"], bs.inputs["Base Color"]); links.new(img.outputs["Color"], bs.inputs["Emission Color"]); links.new(bs.outputs["BSDF"], out.inputs["Surface"])
screen = bpy.data.objects.new("hp_display_screen", mesh); cols["DISPLAY"].objects.link(screen); mesh.materials.append(screen_mat); screen.parent = display_root

box("hp_webcam_bar", (0, -.008, .207), (.047, .002, .009), camera_glass, "DISPLAY", .003, display_root)
cyl("hp_webcam_lens", (0, -.0092, .207), .0024, .001, camera_glass, "DISPLAY", axis="Y", verts=20, parent=display_root)
cyl("hp_webcam_status", (-.009, -.0092, .207), .0009, .001, led, "DISPLAY", axis="Y", verts=12, parent=display_root)
box("hp_bottom_bezel", (0, -.008, .021), (.336, .002, .022), bezel, "DISPLAY", .001, display_root)

# Stylised HP marks on front chin and rear lid, built as geometry so they remain crisp in GLB.
def hp_mark(prefix, y, z, scale, parent):
    parts=[]
    for i, (x, zz, length) in enumerate([(-.010, .004, .022), (-.003, 0, .030), (.005, 0, .030), (.012, -.004, .022)]):
        parts.append(box(prefix+str(i), (x*scale, y, z+zz*scale), (.0035*scale, .0012, length*scale), silver, "BRANDING", .0004, parent, (0, math.radians(-18), 0)))
    return parts
hp_mark("hp_chin_logo_", -.0092, .019, .55, display_root)
hp_mark("hp_lid_logo_", .0053, .108, 1.35, display_root)
box("hp_lid_antenna_line", (0, .0052, .202), (.265, .001, .0015), silver_dark, "BRANDING", .0005, display_root)

# --- Ports visible in the side references -----------------------------------
# Left side: security slot, RJ45 and USB-A.
left_x = -W/2 - .0005
box("hp_kensington_slot", (left_x, .083, .012), (.0015, .012, .005), port_void, "PORTS", .001)
box("hp_rj45_port", (left_x, .048, .011), (.0015, .022, .010), port_void, "PORTS", .001)
box("hp_rj45_metal", (left_x-.0003, .048, .011), (.001, .025, .012), port_metal, "PORTS", .001)
box("hp_usb_a_left", (left_x, .006, .011), (.0015, .016, .006), port_void, "PORTS", .001)

# Right side: SD slot, combo audio, HDMI, USB-A, two USB-C, indicator and barrel power.
right_x = W/2 + .0005
box("hp_sd_card_slot", (right_x, -.076, .012), (.0015, .020, .0025), port_void, "PORTS", .0006)
cyl("hp_audio_combo_jack", (right_x, -.047, .012), .0032, .0015, port_void, "PORTS", axis="X", verts=20)
box("hp_hdmi_port", (right_x, -.018, .011), (.0015, .017, .007), port_void, "PORTS", .001)
box("hp_usb_a_right", (right_x, .013, .011), (.0015, .016, .006), port_void, "PORTS", .001)
for name, xyz in (("PORT_USB_A_LEFT", (left_x, .006, .011)), ("PORT_USB_A_RIGHT", (right_x, .013, .011))):
    anchor = bpy.data.objects.new(name, None)
    cols["PORTS"].objects.link(anchor)
    anchor.location = xyz
    anchor["connector"] = "USB Type-A"
    anchor["direction"] = "INPUT"
for y in (.044, .072): box("hp_usb_c_port", (right_x, y, .011), (.0015, .011, .004), port_void, "PORTS", .0015)
cyl("hp_power_led", (right_x, .090, .011), .0012, .0015, led, "PORTS", axis="X", verts=12)
cyl("hp_barrel_power", (right_x, .105, .011), .0040, .0015, port_void, "PORTS", axis="X", verts=20)

# Simplified collision reference, excluded from runtime GLB.
collision = box("collision_hp_laptop", (0, 0, .012), (W, D, .024), None, "COLLISION_REFERENCE")
collision.display_type = "WIRE"; collision.hide_render = True
cols["COLLISION_REFERENCE"].hide_viewport = True

# --- Review scene ------------------------------------------------------------
scene.world.color = (.012, .014, .018)
floor_mat = mat("review_floor", (.10, .11, .12), .65)
box("review_floor", (0, 0, -.008), (1.4, 1.4, .01), floor_mat, "COLLISION_REFERENCE")
for name, loc, energy, size in [
    ("key", (-.55, -.5, .75), 65, .6), ("fill", (.55, -.15, .45), 32, .5), ("rim", (0, .6, .65), 48, .45)]:
    data=bpy.data.lights.new(name, "AREA"); data.energy=energy; data.shape="DISK"; data.size=size
    o=bpy.data.objects.new(name, data); scene.collection.objects.link(o); o.location=loc
    o.rotation_euler=(Vector((0,0,.08))-o.location).to_track_quat("-Z","Y").to_euler()

views=[
    ("front", (0,-.70,.30), (0,0,.10), 52),
    ("front_left", (-.52,-.55,.34), (0,0,.09), 55),
    ("front_right", (.52,-.55,.34), (0,0,.09), 55),
    ("left_ports", (-.48,-.03,.12), (0,0,.03), 65),
    ("right_ports", (.48,-.03,.12), (0,0,.03), 65),
    ("rear", (0,.68,.30), (0,.08,.12), 55),
    ("top", (0,-.10,.85), (0,0,.02), 58),
]
for name, loc, target, lens in views:
    data=bpy.data.cameras.new("review_"+name); data.lens=lens
    o=bpy.data.objects.new("review_"+name,data); scene.collection.objects.link(o); o.location=loc
    o.rotation_euler=(Vector(target)-o.location).to_track_quat("-Z","Y").to_euler()
    if name=="front_left": scene.camera=o

scene.render.engine="BLENDER_EEVEE"
scene.render.resolution_x=900; scene.render.resolution_y=700; scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.view_settings.look = "AgX - Medium High Contrast"
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / "art/blender/hp-laptop.blend"))

# Export only the model. Review floor, lights, cameras and collision proxies remain in .blend.
bpy.ops.object.select_all(action="DESELECT")
exported=[]
for key in ["CHASSIS", "DISPLAY", "KEYBOARD", "PORTS", "BRANDING"]:
    for o in cols[key].objects:
        o.select_set(True); exported.append(o)
bpy.ops.export_scene.gltf(filepath=str(OUT / "hp-laptop.glb"), export_format="GLB", use_selection=True, export_extras=True, export_animations=False, export_cameras=False, export_lights=False)

triangles=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in exported if o.type=="MESH")
manifest={
    "asset":"Silver HP 15.6-inch laptop from seven user-provided views",
    "blender":bpy.app.version_string,
    "dimensions_m":[W,D,BASE_H],
    "open_angle_degrees":102,
    "objects":len(exported),
    "triangles":triangles,
    "glb_bytes":(OUT/"hp-laptop.glb").stat().st_size,
    "materials":len([m for m in bpy.data.materials if m.name.startswith("hp_")]),
    "references":[p.name for p in sorted((ROOT/"art/reference/hp-laptop").glob("*.jpg"))],
    "verified_visuals":["silver wedge chassis","full keyboard with numpad","offset touchpad","thin black bezel","webcam bar","HP marks","left and right port groups"],
    "limitation":"Exact HP SKU and official dimensions were not supplied; size uses a representative 15.6-inch chassis envelope."
}
(ROOT/"art/blender/hp-laptop-manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
print("HP_LAPTOP_REPORT",json.dumps(manifest,ensure_ascii=False))
