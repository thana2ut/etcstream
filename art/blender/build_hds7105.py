"""Run with Blender 5.2 --background --python art/blender/build_hds7105.py.
DeviceWell HDS7105 (USB-C STREAM revision) authored from art/reference/hds7105.
Authority: photos 5-8 (the real unit). Photo 1 is used only for port order/spacing.
Photos 2-4 show other revisions (USB 3.0 / HDS7105P with T-bar) and are NOT modelled.
Units: millimetres in this file, scaled to metres. Blender: X = width, -Y = operator
front, +Y = rear (ports), Z up. Origin = bottom centre. glTF export maps to web Y-up.
"""
import bpy, bmesh, json, math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
MM = .001
W, D = 236.0, 105.0                 # official spec 236 x 105 x 47 mm
BODY_TOP, PLATE_TOP, KEY_TOP = 42.0, 45.0, 47.5   # split of 47 mm height: UNVERIFIED
REAR = D / 2

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for block in (bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.cameras, bpy.data.lights):
    for item in list(block): block.remove(item)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
root = bpy.data.collections.new('HDS7105')
scene.collection.children.link(root)
cols = {}
for name in ['CHASSIS', 'CONTROL_SURFACE', 'REAR_PORTS', 'LABELS', 'PORT_ANCHORS']:
    cols[name] = bpy.data.collections.new('HDS7105_' + name)
    root.children.link(cols[name])

def material(name, color, rough=.6, metal=0.):
    m = bpy.data.materials.new(name); m.diffuse_color = (*color, 1); m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = metal
    return m
red = material('hds_chassis_red', (.62, .035, .03), .55)
plate = material('hds_top_plate_black', (.028, .03, .033), .88)
skirt = material('hds_key_skirt_light', (.62, .64, .64), .5)
cap = material('hds_key_face_dark', (.05, .052, .055), .8)
ink = material('hds_print_white', (.9, .9, .88), .6)
shell = material('hds_connector_shell', (.55, .56, .57), .3, .9)
hole = material('hds_connector_void', (.008, .008, .009), .9)
insul = material('hds_usb_tongue_white', (.85, .85, .82), .5)
jack = {'green': material('hds_jack_green', (.05, .45, .12), .45),
        'orange': material('hds_jack_orange', (.8, .45, .05), .45),
        'pink': material('hds_jack_pink', (.75, .3, .5), .45)}
rubber = material('hds_rubber_foot', (.02, .02, .02), .9)
led = material('hds_rj45_led', (.75, .8, .1), .4)

def finish(o, name, mat, col):
    o.name = name
    for c in list(o.users_collection): c.objects.unlink(o)
    cols[col].objects.link(o)
    if mat: o.data.materials.append(mat)
    return o

def box(name, c, s, mat, col, bevel=0.):
    bpy.ops.mesh.primitive_cube_add(size=1, location=tuple(v * MM for v in c)); o = bpy.context.object
    o.dimensions = tuple(v * MM for v in s); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    finish(o, name, mat, col)
    if bevel:
        mod = o.modifiers.new('bevel', 'BEVEL'); mod.width = bevel * MM; mod.segments = 2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return o

def cyl(name, c, r, depth, mat, col, axis='Y', verts=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r * MM, depth=depth * MM, location=tuple(v * MM for v in c))
    o = bpy.context.object
    if axis == 'Y': o.rotation_euler.x = math.pi / 2
    return finish(o, name, mat, col)

def rear_prism(name, cx, cz, outline, depth, mat, proud=.3):
    """Extrude a 2D outline (a = viewer-right from behind, b = up) out of the rear face."""
    bm = bmesh.new()
    y0, y1 = (REAR - depth) * MM, (REAR + proud) * MM
    back = [bm.verts.new(((cx - a) * MM, y0, (cz + b) * MM)) for a, b in outline]
    front = [bm.verts.new(((cx - a) * MM, y1, (cz + b) * MM)) for a, b in outline]
    bm.faces.new(front); bm.faces.new(list(reversed(back)))
    n = len(outline)
    for i in range(n): bm.faces.new([back[i], back[(i + 1) % n], front[(i + 1) % n], front[i]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(name); bm.to_mesh(mesh); bm.free()
    o = bpy.data.objects.new(name, mesh); cols['REAR_PORTS'].objects.link(o); mesh.materials.append(mat)
    return o

def scaled(outline, k): return [(a * k, b * k) for a, b in outline]

TEXT = []
def text(body, c, size, face='top', align='CENTER'):
    bpy.ops.object.text_add(location=tuple(v * MM for v in c)); o = bpy.context.object
    o.data.body = body; o.data.size = size * MM; o.data.align_x = align; o.data.align_y = 'CENTER'
    o.data.extrude = 0; o.data.resolution_u = 2; o.data.fill_mode = 'FRONT'
    if face == 'rear': o.rotation_euler = (math.pi / 2, 0, math.pi)
    bpy.ops.object.convert(target='MESH')
    TEXT.append((face, o)); return o

# ---------------- Chassis (photos 5-8). Side/bottom shape UNVERIFIED: straight box assumed.
box('hds7105_chassis_red', (0, 0, BODY_TOP / 2), (W - 1, D - 1, BODY_TOP), red, 'CHASSIS', 1.2)
box('hds7105_top_plate', (0, 0, (BODY_TOP + PLATE_TOP) / 2), (W, D, PLATE_TOP - BODY_TOP), plate, 'CHASSIS', .8)
for x in (-W / 2 + 14, W / 2 - 14):
    for y in (-D / 2 + 12, D / 2 - 12):
        cyl('hds7105_foot', (x, y, -.8), 5, 1.6, rubber, 'CHASSIS', axis='Z', verts=16)

# ---------------- Control surface. Pixel coords from photo 5 (near top-down).
def tx(px): return (px - 5) * .1611 - W / 2
def ty(py): return D / 2 - (py - 290) * .1611

def key(label, px, py, w, d, text_size=1.9, glyph=None):
    x, y = tx(px), ty(py)
    h = KEY_TOP - PLATE_TOP
    name = 'hds7105_key_' + (label or glyph).lower().replace('+', 'plus').replace('-', 'minus').replace(' ', '_')
    box(name + '_skirt', (x, y, PLATE_TOP + (h - .7) / 2), (w, d, h - .7), skirt, 'CONTROL_SURFACE', .5)
    box(name + '_face', (x, y, KEY_TOP - .35), (w - 1.4, d - 1.4, .7), cap, 'CONTROL_SURFACE', .3)
    if label and text_size: text(label, (x, y, KEY_TOP + .02), text_size)
    if glyph:
        r = 1.5; pts = {'up': [(0, r), (-r, -r), (r, -r)], 'down': [(0, -r), (r, r), (-r, r)],
                        'left': [(-r, 0), (r, r), (r, -r)], 'right': [(r, 0), (-r, -r), (-r, r)]}[glyph]
        bm = bmesh.new(); bm.faces.new([bm.verts.new(((x + a) * MM, (y + b) * MM, (KEY_TOP + .03) * MM)) for a, b in pts])
        mesh = bpy.data.meshes.new('glyph'); bm.to_mesh(mesh); bm.free()
        g = bpy.data.objects.new('glyph', mesh); cols['LABELS'].objects.link(g); TEXT.append(('top', g))

SMALL, MID, BIG = (12.4, 6.0), (12.4, 8.6), (18.8, 12.6)
for i, px in enumerate([220, 318, 415, 508, 604, 698, 792, 882]): key(f'F{i+1}', px, 487, *SMALL)
for sub, px in [('RESO', 222), ('SOURCE', 320), ('MUTE', 415)]: text(sub, (tx(px), ty(458), PLATE_TOP + .02), 1.5)
key('FTB', 1046, 473, *SMALL)
for row, labels in [(565, ['AFV', 'CH1', 'VOL-', 'VOL+']), (648, ['MIX', 'CH2', 'VOL-', 'VOL+'])]:
    for px, lab in zip([215, 315, 413, 510], labels): key(lab, px, row, *MID)
# Transition keys 2,3,5,6 carry wipe icons in the photo; icons are simplified to blank faces.
for row, labels in [(555, ['MIX', None, None]), (635, ['FADE', None, None])]:
    for j, (px, lab) in enumerate(zip([700, 793, 886], labels)): key(lab or f'wipe_{row}_{j}', px, row, *MID, text_size=1.9 if lab else 0)
key('PIP', 1050, 548, *MID); key('STILL', 1053, 625, *MID)
for g, px, py in [('up', 1225, 470), ('left', 1142, 547), ('right', 1313, 543), ('down', 1237, 620)]: key(None, px, py, 10.4, 6.4, glyph=g)
key('MENU', 1230, 545, 10.4, 6.4, 1.5)
for row in (745, 855):
    for px, lab in zip([240, 403, 564, 721, 877], ['1', '2', '3', '4', 'BAR']): key(lab, px, row, *BIG, 3.4 if lab != 'BAR' else 2.6)
for i, px in enumerate([1060, 1192, 1325]): key(f'RATE{i+1}', px, 717, 12.0, 7.2, 1.5)
key('CUT', 1085, 832, 18.4, 12.0, 2.6); key('AUTO', 1312, 825, 18.4, 12.0, 2.6)

# Printed frames and lines (white, 0.4 mm).
def frame(x0, y0, x1, y1):
    X0, X1, Y0, Y1 = tx(x0), tx(x1), ty(y0), ty(y1); z = PLATE_TOP + .02
    for c, s in [(((X0 + X1) / 2, Y0, z), (X1 - X0, .4, .05)), (((X0 + X1) / 2, Y1, z), (X1 - X0, .4, .05)),
                 ((X0, (Y0 + Y1) / 2, z), (.4, Y0 - Y1, .05)), ((X1, (Y0 + Y1) / 2, z), (.4, Y0 - Y1, .05))]:
        TEXT.append(('top', box('print_line', c, s, None, 'LABELS')))
def hline(x0, x1, py):
    TEXT.append(('top', box('print_line', ((tx(x0) + tx(x1)) / 2, ty(py), PLATE_TOP + .02), (tx(x1) - tx(x0), .4, .05), None, 'LABELS')))
frame(172, 522, 562, 688); frame(655, 514, 938, 672); frame(1003, 512, 1100, 662)
def gap_label(body, px, py, size):
    box('print_gap', (tx(px), ty(py), PLATE_TOP + .035), (len(body) * size * .72 + 1.5, size * 1.1, .04), plate, 'LABELS')
    text(body, (tx(px), ty(py), PLATE_TOP + .08), size)
hline(190, 925, 790); hline(190, 930, 915)
gap_label('AUDIO', 368, 522, 1.5); gap_label('TRANSITIONS', 796, 514, 1.4); gap_label('FUNCTION', 1051, 512, 1.2)
gap_label('PGM', 565, 790, 2.0); gap_label('PVW', 568, 915, 2.0)
text('HDS7105', (tx(70), ty(347), PLATE_TOP + .02), 5.4, align='LEFT')
text('MICRO HD VIDEO SWITCHER', (tx(70), ty(383), PLATE_TOP + .02), 2.4, align='LEFT')
text('DeviceWell', (tx(1415), ty(347), PLATE_TOP + .02), 4.2, align='RIGHT')

# ---------------- Rear ports. u = mm from the rear-left edge as seen from behind (= +X end).
# Spacing measured on photos 7/8 (connector widths as scale) and fitted to photo 1's overall span.
LOW, HIGH, LABEL_Z = 11.0, 26.5, 3.4
def ux(u): return W / 2 - u
HDMI = [(-7.5, 2.25), (7.5, 2.25), (7.5, -.6), (5.6, -2.25), (-5.6, -2.25), (-7.5, -.6)]
DP = [(-8, 2.9), (8, 2.9), (8, -1.7), (6.8, -2.9), (-8, -2.9)]     # chamfer side UNVERIFIED
DSUB = [(-8.5, 4), (8.5, 4), (7.3, -4), (-7.3, -4)]
PORTS = []   # (id, label, u, z, connector, direction)
def port(pid, label, u, z, connector, direction, label_z=LABEL_Z):
    PORTS.append({'id': pid, 'label': label, 'connector': connector, 'direction': direction, 'u': u, 'z': z})
    a = bpy.data.objects.new('PORT_' + pid, None); cols['PORT_ANCHORS'].objects.link(a)
    a.location = (ux(u) * MM, (REAR + 2) * MM, z * MM); a.empty_display_size = .006
    a['port_id'] = pid; a['connector'] = connector; a['direction'] = direction; a['label'] = label
    if label_z is not None and label: text(label, (ux(u), REAR + .35, label_z), 1.7, face='rear')

def hdmi(pid, label, u, direction, label_z=LABEL_Z):
    x = ux(u); rear_prism(f'hds7105_{pid.lower()}_shell', x, LOW, scaled(HDMI, 1.08), 1, shell)
    rear_prism(f'hds7105_{pid.lower()}_void', x, LOW, HDMI, 4, hole, .32)
    box(f'hds7105_{pid.lower()}_tongue', (x, REAR - .5, LOW + .3), (10.5, 1, 1.2), shell, 'REAR_PORTS')
    port(pid, label, u, LOW, 'HDMI Type-A', direction, label_z)

# RJ45 CONTROL
x = ux(22.4); box('hds7105_rj45_shield', (x, REAR, LOW + 1.5), (16, 1, 13.5), shell, 'REAR_PORTS')
box('hds7105_rj45_void', (x, REAR + .1, LOW + 1.2), (12, 1.2, 10.5), hole, 'REAR_PORTS')
for dx in (-5.2, 5.2): box('hds7105_rj45_led', (x + dx, REAR + .7, LOW - 4.3), (2.4, .2, 1.4), led, 'REAR_PORTS')
port('CONTROL', 'CONTROL', 22.4, LOW + 1.5, 'RJ45', 'BIDIRECTIONAL')
# 3.5 mm jacks: LINE OUT (green), LINE IN (orange), MIC IN 2/1 (pink)
for pid, lab, u, colr, direction in [('LINE_OUT', 'OUT', 36.9, 'green', 'OUTPUT'), ('LINE_IN', 'IN', 45.9, 'orange', 'INPUT'),
                                      ('MIC_IN_2', '2', 54.8, 'pink', 'INPUT'), ('MIC_IN_1', '1', 63.4, 'pink', 'INPUT')]:
    cyl(f'hds7105_{pid.lower()}_ring', (ux(u), REAR + .4, LOW), 3.3, 1.2, jack[colr], 'REAR_PORTS')
    cyl(f'hds7105_{pid.lower()}_void', (ux(u), REAR + .6, LOW), 1.8, 1.2, hole, 'REAR_PORTS')
    port(pid, lab, u, LOW, '3.5mm TRS', direction, LOW - 5.2)
text('LINE', (ux(41.4), REAR + .35, LABEL_Z), 1.7, face='rear'); text('MIC IN', (ux(59.1), REAR + .35, LABEL_Z), 1.7, face='rear')
# USB-C STREAM (UVC output)
x = ux(73.8); rear_prism('hds7105_stream_shell', x, LOW, [(-4.3, 1.4), (4.3, 1.4), (4.3, -1.4), (-4.3, -1.4)], 1, shell)
box('hds7105_stream_void', (x, REAR + .1, LOW), (7.4, 1.2, 1.9), hole, 'REAR_PORTS')
port('STREAM', 'STREAM', 73.8, LOW, 'USB-C', 'OUTPUT')
# HDMI row
hdmi('PGM', 'PGM', 89.3, 'OUTPUT'); hdmi('MULTIVIEW', 'MULTIVIEW', 109.4, 'OUTPUT')
for pid, u in [('IN4', 129.6), ('IN3', 148.7), ('IN2', 167.5), ('IN1', 185.3)]: hdmi(pid, pid, u, 'INPUT', None if pid == 'IN1' else LABEL_Z)  # IN1 label is shared with DP below
x = ux(202.2); rear_prism('hds7105_dp_shell', x, LOW, scaled(DP, 1.04), 1, shell); rear_prism('hds7105_dp_void', x, LOW, DP, 4, hole, .32)
port('DP_IN1', 'DP', 202.2, LOW, 'DisplayPort', 'INPUT', None)
text('DP', (ux(202.2), REAR + .35, LOW + 5.5), 1.7, face='rear'); text('IN1', (ux(193.7), REAR + .35, LABEL_Z), 1.7, face='rear')
# DC 12V barrel
cyl('hds7105_dc_ring', (ux(215.0), REAR + .3, LOW), 4.0, 1, shell, 'REAR_PORTS'); cyl('hds7105_dc_void', (ux(215.0), REAR + .5, LOW), 3.0, 1, hole, 'REAR_PORTS')
port('DC_12V', 'DC 12V', 215.0, LOW, 'DC barrel', 'INPUT')
# Upper row: TALLY (DB15, 3 rows = HD15 layout per photo 7), DCB x2 (USB-A), POWER rocker
x = ux(63.1); rear_prism('hds7105_tally_shell', x, HIGH, scaled(DSUB, 1.15), 1.2, shell); rear_prism('hds7105_tally_face', x, HIGH, DSUB, 2, hole, .35)
for dx in (-12.5, 12.5): cyl('hds7105_tally_standoff', (x + dx, REAR + 1, HIGH), 1.6, 2, shell, 'REAR_PORTS', verts=6)
port('TALLY', 'TALLY', 63.1, HIGH, 'DB15', 'BIDIRECTIONAL', HIGH - 7)
for pid, u in [('DCB_1', 90.6), ('DCB_2', 110.9)]:
    x = ux(u); box(f'hds7105_{pid.lower()}_shell', (x, REAR, HIGH), (12.5, 1, 5), shell, 'REAR_PORTS')
    box(f'hds7105_{pid.lower()}_void', (x, REAR + .1, HIGH), (11.2, 1.2, 3.8), hole, 'REAR_PORTS')
    box(f'hds7105_{pid.lower()}_tongue', (x, REAR + .2, HIGH + .9), (10.4, 1.2, 1.4), insul, 'REAR_PORTS')
    port(pid, 'DCB', u, HIGH, 'USB-A', 'BIDIRECTIONAL', None)
text('DCB', (ux(100.8), REAR + .35, HIGH - 5.6), 1.7, face='rear')
x = ux(201.4); box('hds7105_power_bezel', (x, REAR + .3, HIGH), (13, 1.4, 10), hole, 'REAR_PORTS', .4)
box('hds7105_power_rocker', (x, REAR + .9, HIGH), (10.4, 1.4, 7.4), red, 'REAR_PORTS', .5)
port('POWER', 'POWER', 201.4, HIGH, 'Rocker switch', 'CONTROL', None)
text('POWER', (x, REAR + .35, HIGH + 7.2), 1.7, face='rear')

# Join all printing into two meshes to keep the GLB light.
for face in ('top', 'rear'):
    objs = [o for f, o in TEXT if f == face]
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        for c in list(o.users_collection): c.objects.unlink(o)
        cols['LABELS'].objects.link(o); o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]; bpy.ops.object.join()
    o = bpy.context.object; o.name = f'hds7105_print_{face}'; o.data.materials.clear(); o.data.materials.append(ink)

# ---------------- Review rig (not exported)
scene.world.color = (.05, .05, .055); scene.view_settings.view_transform = 'Standard'
for loc, energy in [((-.25, -.3, .45), 9), ((.3, .35, .4), 7), ((-.35, .1, .3), 4)]:
    d = bpy.data.lights.new('review_light', 'AREA'); d.energy = energy; d.size = .4
    o = bpy.data.objects.new('review_light', d); scene.collection.objects.link(o); o.location = loc
    o.rotation_euler = (-Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
views = [('top', (0, -.0001, .5), (0, 0, 0), 'ORTHO', .26), ('rear', (0, .5, .022), (0, 0, .022), 'ORTHO', .245),
         ('front_45', (-.22, -.26, .24), (0, 0, .02), 'PERSP', 0), ('rear_45', (.24, .26, .17), (0, 0, .02), 'PERSP', 0),
         ('rear_ports_close', (.05, .19, .06), (.03, .05, .018), 'PERSP', 0)]
for name, loc, target, kind, ortho in views:
    d = bpy.data.cameras.new(name); d.type = kind; d.lens = 50
    if ortho: d.ortho_scale = ortho
    d.clip_start = .005
    o = bpy.data.objects.new('review_' + name, d); scene.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
scene.render.engine = 'CYCLES'; scene.cycles.samples = 24
scene.render.resolution_x = 1400; scene.render.resolution_y = 800

out = ROOT / 'public/models/equipment'; out.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'art/blender/hds7105.blend'))
bpy.ops.object.select_all(action='DESELECT')
exported = [o for c in cols.values() for o in c.objects]
for o in exported: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out / 'hds7105.glb'), export_format='GLB', use_selection=True, export_extras=True,
                          export_animations=False, export_cameras=False, export_lights=False)
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in exported if o.type == 'MESH')
def web(p): return [round(p[0] * MM, 5), round(p[2] * MM, 5), round(-p[1] * MM, 5)]
report = {
    'model': 'DeviceWell HDS7105 (USB-C STREAM revision)', 'blender': bpy.app.version_string,
    'dimensions_mm': {'width': W, 'depth': D, 'height_total': KEY_TOP, 'source': 'Published spec 236 x 105 x 47 mm'},
    'origin': 'bottom centre; web +Z = operator front, web -Z = rear port panel',
    'objects': len(exported), 'triangles': tris, 'glb_bytes': (out / 'hds7105.glb').stat().st_size, 'textures': 0,
    'ports': [{**{k: v for k, v in p.items() if k not in ('u', 'z')}, 'anchor': 'PORT_' + p['id'],
               'web_position_m': web((ux(p['u']), REAR + 2, p['z']))} for p in PORTS],
    'verified': ['rear port order and labels (photos 7, 8)', 'top-panel key set, labels and grouping (photos 5, 6)',
                 'overall size (published spec)', 'no T-bar on this revision (photos 5, 6)'],
    'unverified': ['side profile and top-plate overhang (no side photo)', 'split of 47 mm into body/plate/key height',
                   'exact port spacing (+/- 2 mm, measured from photos)', 'DP connector chamfer side',
                   'bottom and rubber feet', 'transition wipe icons simplified to blank keys'],
    'references': 'art/reference/hds7105 (5-8 authoritative; 1 port order only; 2-4 other revisions)',
}
(ROOT / 'art/blender/hds7105-manifest.json').write_text(json.dumps(report, indent=2))
print('HDS7105_REPORT', json.dumps({k: report[k] for k in ('objects', 'triangles', 'glb_bytes')}))
