"""Run with Blender 5.2 --background --python art/blender/build_pmx402d.py.
YAMAHA PMX-402D-USB powered mixer, authored from art/reference/pmx402d (77-85).
Top panel from photo 79 (straight-down view), rear panel from photo 80. Built at DISPLAY
scale (S x estimated real size) so every jack is readable and pluggable in first person.
Blender: -Y = operator front (faders), +Y = rear (jack strip / rear panel), Z up.
Origin = bottom centre. Writes port anchors (web metres, Y up, rear = -Z) to
game/training/pmx402d-ports.json for the gameplay layer.
"""
import bpy, json, math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
S = 2.5                                  # display scale
W, D, H = .30, .30, .11                  # estimated real size (UNVERIFIED): from photo proportions
TOP = H * S

bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for block in (bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.cameras, bpy.data.lights):
    for item in list(block): block.remove(item)
scene = bpy.context.scene
root = bpy.data.collections.new('PMX402D'); scene.collection.children.link(root)

def mat(name, color, rough=.5, metal=0.):
    m = bpy.data.materials.new(name); m.use_nodes = True
    bs = m.node_tree.nodes['Principled BSDF']; bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = metal
    return m
M = {k: mat('pmx_' + k, *v) for k, v in {
    'panel': ((.03, .07, .28), .45), 'side': ((.02, .02, .022), .7), 'ink': ((.92, .92, .92), .6),
    'hole': ((.005, .005, .006), .9), 'nickel': ((.7, .7, .68), .25, .9), 'xlr': ((.03, .03, .03), .6),
    'red': ((.8, .08, .05), .4), 'white': ((.9, .9, .9), .45), 'blue': ((.08, .25, .75), .4), 'yellow': ((.95, .8, .05), .4),
    'grey': ((.55, .56, .58), .5), 'btn': ((.55, .15, .25), .5), 'lcd': ((.02, .02, .03), .2), 'slot': ((.12, .12, .12), .6),
    'fwhite': ((.95, .95, .95), .4), 'fblue': ((.1, .35, .6), .4), 'fred': ((.85, .1, .08), .4),
    'ledr': ((1, .1, .1), .3), 'ledy': ((1, .85, .1), .3), 'ledg': ((.1, .9, .2), .3), 'rca_w': ((.9, .9, .9), .4), 'rca_r': ((.8, .05, .05), .4),
}.items()}

def link(o, m=None):
    for c in list(o.users_collection): c.objects.unlink(o)
    root.objects.link(o)
    if m: o.data.materials.append(M[m])
    return o
def box(c, s, m, bevel=0.):
    bpy.ops.mesh.primitive_cube_add(size=1, location=c); o = bpy.context.object
    o.dimensions = s; bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = o.modifiers.new('b', 'BEVEL'); mod.width = bevel; mod.segments = 2; bpy.ops.object.modifier_apply(modifier=mod.name)
    return link(o, m)
def cyl(c, r, depth, m, axis='Z', verts=20):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=c); o = bpy.context.object
    if axis == 'Y': o.rotation_euler.x = math.pi / 2
    return link(o, m)
TEXTS = []
def text(body, c, size, rot=(0, 0, 0)):
    bpy.ops.object.text_add(location=c); o = bpy.context.object
    o.data.body = body; o.data.size = size; o.data.align_x = 'CENTER'; o.data.align_y = 'CENTER'
    o.data.extrude = 0; o.data.resolution_u = 2; o.rotation_euler = rot
    bpy.ops.object.convert(target='MESH'); TEXTS.append(link(o)); return o

PORTS = {}
def port(pid, label, loc, connector, direction):
    a = bpy.data.objects.new('PORT_' + pid, None); root.objects.link(a); a.location = loc
    PORTS[pid] = {'label': label, 'connector': connector, 'direction': direction, 'web': [round(loc[0], 4), round(loc[2], 4), round(-loc[1], 4)]}

# ---------------- Top panel (photo 79: panel spans px x 45..965, y 485..1415) ----------------
def tx(px): return (px - 505) / 920 * W * S
def ty(py): return -(py - 950) / 930 * D * S
Z = TOP + .001
box((0, 0, TOP / 2), (W * S, D * S, TOP), 'panel', .01)
for x in (-W * S / 2 - .012, W * S / 2 + .012):     # black end cheeks
    box((x, 0, TOP / 2 + .005), (.035, D * S + .02, TOP + .02), 'side', .012)
box((0, ty(683), Z), (W * S * .93, .004, .002), 'ink')   # jack strip divider

def jack635(pid, label, px, py, direction, m='nickel'):
    x, y = tx(px), ty(py)
    cyl((x, y, Z + .004), .016, .008, m); cyl((x, y, Z + .006), .009, .006, 'hole')
    port(pid, label, (x, y, Z + .012), '6.35mm', direction)
def xlr_f(pid, label, px, py):
    x, y = tx(px), ty(py)
    cyl((x, y, Z + .003), .03, .006, 'xlr', verts=28); cyl((x, y, Z + .005), .023, .004, 'hole', verts=28)
    for a in (90, 210, 330):
        cyl((x + .01 * math.cos(math.radians(a)), y + .01 * math.sin(math.radians(a)), Z + .007), .0035, .003, 'xlr', verts=8)
    port(pid, label, (x, y, Z + .012), 'XLR', 'INPUT')
def rca(pid, label, px, py, m):
    x, y = tx(px), ty(py)
    cyl((x, y, Z + .006), .016, .012, m); cyl((x, y, Z + .012), .006, .004, 'hole')
    port(pid, label, (x, y, Z + .016), 'RCA', 'OUTPUT')

for i, px in enumerate((200, 282, 365, 445)):
    n = i + 1
    text(f'CH{n}', (tx(px), ty(515), Z), .018)
    xlr_f(f'CH{n}_MIC', f'Mixer CH{n} MIC IN (XLR)', px, 552)
    text('MIC', (tx(px - 25), ty(597), Z), .01)
    jack635(f'CH{n}_LINE', f'Mixer CH{n} LINE IN (6.35 mm)', px, 628, 'INPUT')
    text('LINE', (tx(px - 30), ty(648), Z), .01)
jack635('MAIN_OUT_L', 'Mixer MAIN OUT L (6.35 mm)', 528, 530, 'OUTPUT')
jack635('MAIN_OUT_R', 'Mixer MAIN OUT R (6.35 mm)', 580, 530, 'OUTPUT')
jack635('AUX_IN', 'Mixer AUX IN (6.35 mm)', 528, 580, 'INPUT')
jack635('AUX_SEND', 'Mixer AUX SEND OUT (6.35 mm)', 580, 580, 'OUTPUT')
rca('REC_L', 'Mixer REC L (RCA)', 537, 630, 'rca_w'); rca('REC_R', 'Mixer REC R (RCA)', 578, 630, 'rca_r')
for label, py in (('MAIN OUT', 530), ('AUX', 580), ('REC', 630)):
    text(label, (tx(620), ty(py), Z), .009, (0, 0, math.pi / 2))
text('YAMAHA', (tx(700), ty(518), Z), .03)
text('4 CHANNEL STEREO MIXER', (tx(700), ty(538), Z), .008)
text('PMX-402D-USB', (tx(700), ty(549), Z), .012)
box((tx(700), ty(580), Z), (tx(755) - tx(648), .03, .002), 'lcd')
for k, px in enumerate((662, 690, 718, 745)):
    box((tx(px), ty(618), Z + .004), (.03, .025, .008), 'grey', .003)
box((tx(797), ty(518), Z + .002), (.03, .04, .004), 'slot'); cyl((tx(797), ty(518), Z + .004), .001, .001, 'hole')
port('USB', 'Mixer USB-A (media)', (tx(797), ty(518), Z + .01), 'USB-A', 'INPUT')
box((tx(808), ty(610), Z + .002), (.012, .07, .004), 'slot')
text('SD/MMC CARD', (tx(785), ty(610), Z), .008, (0, 0, math.pi / 2))

def knob(px, py, cap):
    x, y = tx(px), ty(py)
    cyl((x, y, Z + .012), .019, .024, 'grey', verts=18); cyl((x, y, Z + .026), .015, .006, cap, verts=18)
    box((x, y + .008, Z + .03), (.003, .014, .002), 'white')
def button(px, py): box((tx(px), ty(py), Z + .005), (.045, .03, .01), 'btn', .003)
def fader(px, cap, label):
    x = tx(px); box((x, (ty(1110) + ty(1290)) / 2, Z), (.008, ty(1110) - ty(1290), .002), 'hole')
    box((x, ty(1250), Z + .014), (.06, .045, .028), cap, .004)
    text(label, (x, ty(1078), Z), .014)
for i, px in enumerate((185, 270, 357, 442)):
    text(str(i + 1), (tx(px), ty(715), Z), .016)
    for py, cap, lab in ((750, 'red', 'TRIM'), (815, 'white', 'HI'), (875, 'white', 'LOW'), (935, 'blue', 'SEND'), (995, 'yellow', 'PAN')):
        knob(px, py, cap); text(lab, (tx(px + 42), ty(py - 20), Z), .008)
    button(px + 15, 1045); text('PFL', (tx(px - 22), ty(1045), Z), .008)
    fader(px, 'fwhite', str(i + 1))
button(548, 750); text('SEND/EFF', (tx(548), ty(733), Z), .008)
knob(550, 797, 'blue'); knob(550, 850, 'blue')
box((tx(657), ty(797), Z), (.06, .05, .002), 'lcd'); text('16 DSP', (tx(657), ty(747), Z), .02)
for px in (637, 681): cyl((tx(px), ty(872), Z + .004), .012, .008, 'side')
text('GRAPHIC EQUALIZER', (tx(618), ty(898), Z), .011)
for px, hz in zip((548, 583, 618, 653, 688), ('70Hz', '200Hz', '1KHz', '5KHz', '12KHz')):
    box((tx(px), ty(975), Z), (.005, ty(920) - ty(1030), .002), 'hole'); box((tx(px), ty(975), Z + .008), (.022, .012, .014), 'grey', .002)
    text(hz, (tx(px), ty(1040), Z), .007)
for k, m in enumerate(('ledr', 'ledy', 'ledg', 'ledg', 'ledg')):
    for px in (757, 792): cyl((tx(px), ty(752 + k * 22), Z + .002), .006, .004, m, verts=10)
button(780, 900); text('PHANTOM', (tx(780), ty(920), Z), .008)
knob(785, 985, 'red'); text('PHONE LEVEL', (tx(785), ty(948), Z), .008)
button(783, 1040)
jack635('PHONES', 'Mixer PHONES (6.35 mm)', 785, 1128, 'OUTPUT')
text('PHONES', (tx(785), ty(1070), Z), .012)
fader(545, 'fblue', 'EFFECT'); fader(630, 'fred', 'L'); fader(718, 'fred', 'R')
text('MAIN', (tx(674), ty(1078), Z), .014)
ctrl = bpy.data.objects.new('CTRL_MAIN_FADER', None); root.objects.link(ctrl); ctrl.location = (tx(674), ty(1250), Z + .05)

# ---------------- Rear panel (photo 80: px x 45..990, rear panel bottom at py 1110) ----------------
RY = D * S / 2 + .001
def rx(px): return -(px - 517) / 945 * W * S
def rz(py): return (1110 - py) / 945 * W * S
R = (math.pi / 2, 0, math.pi)             # text facing +Y (readable from behind)
text('SPEAKER OUTPUT', (rx(340), RY, rz(822)), .016, R); text('2 x 350W', (rx(340), RY, rz(1088)), .016, R)
text('MAIN OUT', (rx(543), RY, rz(825)), .014, R); text('POWER', (rx(118), RY, rz(822)), .014, R)
box((rx(113), RY + .004, rz(880)), (.07, .008, .05), 'side', .004); box((rx(113), RY + .01, rz(880)), (.05, .006, .035), 'hole')
port('POWER', 'Mixer POWER switch', (rx(113), RY + .02, rz(880)), 'Switch', 'CONTROL')
box((rx(118), RY + .004, rz(1025)), (.1, .008, .07), 'side', .004); box((rx(118), RY + .01, rz(1030)), (.055, .006, .04), 'hole')
port('AC_IN', 'Mixer AC INPUT 220-240V (IEC)', (rx(118), RY + .02, rz(1030)), 'IEC', 'INPUT')
def rear_round(pid, label, px, py, r, connector, direction, m='xlr', tag=''):
    x, z = rx(px), rz(py)
    cyl((x, RY + .004, z), r, .008, m, axis='Y', verts=24); cyl((x, RY + .008, z), r * .62, .006, 'hole', axis='Y', verts=24)
    port(pid, label, (x, RY + .02, z), connector, direction)
    text(tag, (x, RY, z + r + .018), .011, R)
rear_round('SPK_A_R', 'Mixer SPEAKER RIGHT.A (speakON)', 258, 918, .042, 'speakON', 'OUTPUT', tag='RIGHT.A')
rear_round('SPK_A_L', 'Mixer SPEAKER LEFT.A (speakON)', 415, 918, .042, 'speakON', 'OUTPUT', tag='LEFT.A')
rear_round('SPK_B_R', 'Mixer SPEAKER RIGHT.B (6.35 mm)', 258, 1030, .024, '6.35mm', 'OUTPUT', 'nickel', tag='RIGHT.B')
rear_round('SPK_B_L', 'Mixer SPEAKER LEFT.B (6.35 mm)', 415, 1030, .024, '6.35mm', 'OUTPUT', 'nickel', tag='LEFT.B')
rear_round('XLR_OUT_L', 'Mixer MAIN OUT LEFT (XLR)', 540, 918, .038, 'XLR', 'OUTPUT', tag='LEFT')
rear_round('XLR_OUT_R', 'Mixer MAIN OUT RIGHT (XLR)', 540, 1025, .038, 'XLR', 'OUTPUT', tag='RIGHT')
cyl((rx(750), RY + .003, rz(975)), .1, .006, 'side', axis='Y', verts=32)
for r in (.08, .055, .03): cyl((rx(750), RY + .005, rz(975)), r, .004, 'hole' if r != .055 else 'panel', axis='Y', verts=32)

# Join print into one mesh.
bpy.ops.object.select_all(action='DESELECT')
for o in TEXTS: o.select_set(True)
bpy.context.view_layer.objects.active = TEXTS[0]; bpy.ops.object.join()
bpy.context.object.name = 'pmx_print'; bpy.context.object.data.materials.clear(); bpy.context.object.data.materials.append(M['ink'])

# ---------------- Export ----------------
out = ROOT / 'public/models/equipment'; out.mkdir(parents=True, exist_ok=True)
scene.world.color = (.1, .1, .11)
for loc, e in [((0, -1.5, 2), 150), ((1.5, 1.5, 1.5), 90)]:
    d = bpy.data.lights.new('key', 'AREA'); d.energy = e; d.size = 1.5
    o = bpy.data.objects.new('key', d); scene.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, .2)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
for name, loc, tgt in [('top', (0, -.0001, 2.2), (0, 0, 0)), ('rear', (-.3, 1.6, .5), (0, .3, .15))]:
    c = bpy.data.cameras.new(name); c.lens = 50; o = bpy.data.objects.new('review_' + name, c); scene.collection.objects.link(o)
    o.location = loc; o.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'art/blender/pmx402d.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in root.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out / 'pmx402d.glb'), export_format='GLB', use_selection=True, export_animations=False, export_cameras=False, export_lights=False)
c = ctrl.location
data = {'model': 'YAMAHA PMX-402D-USB', 'display_scale': S, 'size_web_m': [round(W * S, 3), round(TOP, 3), round(D * S, 3)],
        'estimated_real_size_m': [W, D, H], 'real_size_verified': False, 'main_fader_web': [round(c.x, 4), round(c.z, 4), round(-c.y, 4)], 'ports': PORTS}
(ROOT / 'game/training/pmx402d-ports.json').write_text(json.dumps(data, indent=2))
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in root.objects if o.type == 'MESH')
print('PMX_REPORT', len(PORTS), 'ports', tris, 'tris', (out / 'pmx402d.glb').stat().st_size, 'bytes')
(ROOT / 'art/blender/reviews/pmx402d').mkdir(parents=True, exist_ok=True)
scene.render.engine = 'BLENDER_EEVEE'; scene.render.resolution_x = 1000; scene.render.resolution_y = 1000
for o in scene.objects:
    if o.type == 'CAMERA':
        scene.camera = o; scene.render.filepath = str(ROOT / f'art/blender/reviews/pmx402d/{o.name}.png'); bpy.ops.render.render(write_still=True)
