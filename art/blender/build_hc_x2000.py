"""Run with Blender 5.2 --background --python art/blender/build_hc_x2000.py.
Panasonic HC-X2000 on a fluid-head tripod, authored from art/reference/hc-x2000 (70-74).
Those references are side/front 3/4 studio shots; the REAR panel (HDMI / SDI OUT) is not
visible, so the video-output anchor position is UNVERIFIED.
Blender: +Y = lens direction (exports to web -Z), Z up, origin = floor under the tripod centre.
The camera body is modelled at DISPLAY scale (CAM_SCALE x real) so labels read in first person.
"""
import bpy, json, math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
CAM_SCALE = 1.6          # body/lens/handle enlarged for readability; tripod at real height
HEAD_Z = 1.22            # top of the tripod head (m)

bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for block in (bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.cameras, bpy.data.lights):
    for item in list(block): block.remove(item)
scene = bpy.context.scene
root = bpy.data.collections.new('HC_X2000'); scene.collection.children.link(root)

def mat(name, color, rough=.5, metal=0.):
    m = bpy.data.materials.new(name); m.use_nodes = True
    bs = m.node_tree.nodes['Principled BSDF']; bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = metal
    return m
body_m = mat('cam_body_black', (.018, .019, .021), .55)
rubber = mat('cam_rubber', (.01, .01, .011), .85)
red = mat('cam_red_ring', (.55, .03, .03), .4)
glass = mat('cam_lens_glass', (.02, .05, .04), .05, .2)
alu = mat('tripod_alu_black', (.02, .02, .022), .35, .7)
ink = mat('cam_print_white', (.9, .9, .9), .6)
lcd = mat('cam_lcd', (.01, .012, .015), .15)
led = mat('cam_led_panel', (.85, .85, .8), .3)

def link(o, m=None):
    for c in list(o.users_collection): c.objects.unlink(o)
    root.objects.link(o)
    if m: o.data.materials.append(m)
    return o

def box(name, c, s, m, bevel=0.):
    bpy.ops.mesh.primitive_cube_add(size=1, location=c); o = bpy.context.object; o.name = name
    o.dimensions = s; bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = o.modifiers.new('b', 'BEVEL'); mod.width = bevel; mod.segments = 3
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return link(o, m)

def cyl(name, c, r, depth, m, axis='Y', verts=32, r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=c)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r2, depth=depth, location=c)
    o = bpy.context.object; o.name = name
    if axis == 'Y': o.rotation_euler.x = -math.pi / 2
    if axis == 'X': o.rotation_euler.y = math.pi / 2
    return link(o, m)

def rod(name, a, b, r, m):
    a, b = Vector(a), Vector(b); o = cyl(name, (a + b) / 2, r, (b - a).length, m, axis='Z', verts=12)
    o.rotation_euler = (b - a).to_track_quat('Z', 'Y').to_euler(); return o

def text(body, c, size, rot, m=ink):
    bpy.ops.object.text_add(location=c); o = bpy.context.object
    o.data.body = body; o.data.size = size; o.data.align_x = 'CENTER'; o.data.align_y = 'CENTER'
    o.data.extrude = 0; o.data.resolution_u = 2; o.rotation_euler = rot
    bpy.ops.object.convert(target='MESH'); return link(o, m)

# ---------------- Tripod (real height) ----------------
spread = .42
feet = [(spread * math.cos(a), spread * math.sin(a)) for a in (math.radians(90), math.radians(210), math.radians(330))]
for i, (x, y) in enumerate(feet):
    top = Vector((x * .12, y * .12, HEAD_Z - .2))
    for off in (-.018, .018):   # twin-tube legs
        n = Vector((-y, x, 0)).normalized() * off
        rod(f'tripod_leg_{i}', (x + n.x, y + n.y, .06), top + n, .011, alu)
    for t in (.3, .55, .8):     # leg locks
        p = Vector((x, y, .06)).lerp(top, t)
        box(f'tripod_lock_{i}', p, (.05, .05, .045), rubber, .006)
    box(f'tripod_foot_{i}', (x, y, .025), (.07, .07, .05), rubber, .01)
    rod(f'tripod_spreader_{i}', (0, 0, .17), (x * .85, y * .85, .17), .007, alu)
cyl('tripod_centre_hub', (0, 0, .17), .03, .04, alu, axis='Z')
rod('tripod_centre_column', (0, 0, .17), (0, 0, HEAD_Z - .2), .016, alu)
cyl('tripod_bowl', (0, 0, HEAD_Z - .18), .07, .06, alu, axis='Z')
cyl('tripod_bowl_ring', (0, 0, HEAD_Z - .145), .072, .012, red, axis='Z')
box('fluid_head', (0, 0, HEAD_Z - .09), (.11, .12, .12), alu, .015)
cyl('fluid_head_knob', (.065, 0, HEAD_Z - .09), .03, .02, rubber, axis='X')
box('quick_plate', (0, 0, HEAD_Z - .015), (.09, .2, .03), alu, .004)
rod('pan_bar', (0, -.07, HEAD_Z - .08), (.28, -.45, HEAD_Z - .2), .012, alu)
rod('pan_bar_grip', (.2, -.34, HEAD_Z - .16), (.28, -.45, HEAD_Z - .2), .02, rubber)
cyl('pan_bar_ring', Vector((.19, -.325, HEAD_Z - .155)), .022, .012, red, axis='Z').rotation_euler = (Vector((.28, -.45, -.12)).to_track_quat('Z', 'Y').to_euler())

# ---------------- Camera body (display scale) ----------------
S = CAM_SCALE
def P(x, y, z): return (x * S, y * S, HEAD_Z + z * S)
box('cam_body', P(0, 0, .065), (.1 * S, .2 * S, .1 * S), body_m, .01 * S)
cyl('cam_lens_barrel', P(0, .13, .07), .036 * S, .09 * S, body_m)
cyl('cam_lens_red_ring', P(0, .09, .07), .038 * S, .008 * S, red)
for k, yy in enumerate((.115, .15)):
    cyl(f'cam_lens_grip_{k}', P(0, yy, .07), .039 * S, .014 * S, rubber, verts=40)
box('cam_lens_hood', P(0, .205, .07), (.1 * S, .06 * S, .085 * S), rubber, .008 * S)
box('cam_lens_hood_cut', P(0, .236, .07), (.09 * S, .002 * S, .075 * S), glass)
cyl('cam_lens_front', P(0, .19, .07), .03 * S, .004 * S, glass)
box('cam_battery', P(0, -.12, .06), (.07 * S, .04 * S, .075 * S), body_m, .006 * S)
cyl('cam_evf', P(-.02, -.12, .115), .018 * S, .05 * S, body_m)
cyl('cam_eyecup', P(-.02, -.155, .115), .026 * S, .025 * S, rubber, r2=.02 * S)
# top handle + XLR audio unit
rod('cam_handle_rear', P(0, -.07, .115), P(0, -.07, .165), .008 * S, body_m)
rod('cam_handle_front', P(0, .06, .115), P(0, .06, .165), .008 * S, body_m)
rod('cam_handle_top', P(0, -.08, .168), P(0, .07, .168), .01 * S, body_m)
box('cam_xlr_unit', P(0, .1, .17), (.075 * S, .05 * S, .035 * S), body_m, .004 * S)
box('cam_led_light', P(0, .128, .17), (.055 * S, .004 * S, .02 * S), led)
cyl('cam_mic_holder', P(-.025, .1, .2), .014 * S, .03 * S, rubber)
# Closed LCD lid on the operator's left (-X); Panasonic / 4K branding is printed on it (photos 70-74).
box('cam_lcd_lid', P(-.054, -.01, .07), (.008 * S, .12 * S, .065 * S), body_m, .003 * S)
# printed branding on the right side (faces +X)
LEFT = (math.pi / 2, 0, -math.pi / 2)
text('Panasonic', P(-.0585, .015, .075), .012 * S, LEFT)
text('4K', P(-.0585, -.04, .075), .018 * S, LEFT)
text('HC-X2000', P(-.0585, -.01, .052), .007 * S, LEFT)

# Rear video output anchor (UNVERIFIED: rear panel not in references).
a = bpy.data.objects.new('PORT_VIDEO_OUT', None); root.objects.link(a)
a.location = P(.03, -.105, .05); a['port_id'] = 'VIDEO_OUT'; a['connector'] = 'HDMI Type-A (UNVERIFIED)'; a['direction'] = 'OUTPUT'

# ---------------- Save / export / review ----------------
out = ROOT / 'public/models/equipment'; out.mkdir(parents=True, exist_ok=True)
scene.world.color = (.08, .08, .085)
for loc, e in [((1.2, -1, 2), 120), ((-1.5, .6, 1.8), 90)]:
    d = bpy.data.lights.new('key', 'AREA'); d.energy = e; d.size = 1.5
    o = bpy.data.objects.new('key', d); scene.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, 1)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
for name, loc, tgt in [('side', (-2.4, .3, 1.3), (0, .1, 1.1)), ('three_quarter', (-1.6, 1.8, 1.6), (0, 0, 1.0))]:
    c = bpy.data.cameras.new(name); c.lens = 50; o = bpy.data.objects.new('review_' + name, c); scene.collection.objects.link(o)
    o.location = loc; o.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'art/blender/hc-x2000.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in root.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out / 'hc-x2000.glb'), export_format='GLB', use_selection=True, export_extras=True,
                          export_animations=False, export_cameras=False, export_lights=False)
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in root.objects if o.type == 'MESH')
port = a.matrix_world.translation
report = {'model': 'Panasonic HC-X2000 on fluid-head tripod', 'blender': bpy.app.version_string, 'camera_display_scale': CAM_SCALE,
          'head_height_m': HEAD_Z, 'triangles': tris, 'glb_bytes': (out / 'hc-x2000.glb').stat().st_size,
          'video_out_web_m': [round(port.x, 4), round(port.z, 4), round(-port.y, 4)],
          'verified': ['overall look, lens hood, red lens ring, top handle with XLR unit, LCD, EVF (photos 70-74)'],
          'unverified': ['rear panel / HDMI or SDI OUT position', 'exact dimensions (built from photo proportions)', 'tripod model'],
          'references': 'art/reference/hc-x2000 (70-74)'}
(ROOT / 'art/blender/hc-x2000-manifest.json').write_text(json.dumps(report, indent=2))
print('HCX_REPORT', json.dumps(report))
for o in scene.objects:
    if o.type == 'CAMERA':
        scene.camera = o; scene.render.engine = 'BLENDER_EEVEE'; scene.render.resolution_x = 900; scene.render.resolution_y = 900
        scene.render.filepath = str(ROOT / f'art/blender/reviews/hc-x2000/{o.name}.png'); bpy.ops.render.render(write_still=True)
