"""Render exported GLBs for geometry and orientation review, not Blender source scenes."""
import bpy
import sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
name = sys.argv[sys.argv.index("--") + 1]
views = {
    "sennheiser-xs1": ((.26, -.43, .19), (0, 0, .03)),
    "yamaha-hs5": ((.75, 1.55, 1.0), (0, 0, .45)),
    "magewell-capture": ((.13, -.19, .12), (0, 0, .008)),
}
eye, target = views[name]
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(ROOT / "public/models/equipment" / f"{name}.glb"))

world = bpy.context.scene.world
world.color = (.12, .14, .18)
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (.14, .16, .19, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = .8

bpy.ops.object.camera_add(location=eye)
camera = bpy.context.object
camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()
camera.data.type = "ORTHO"
camera.data.ortho_scale = {"sennheiser-xs1": .35, "yamaha-hs5": 1.22, "magewell-capture": .15}[name]
bpy.context.scene.camera = camera
for location, energy, size in [((-1, -1, 2), 550, 2.0), ((1, 1, 1.6), 400, 1.4)]:
    bpy.ops.object.light_add(type="AREA", location=location)
    lamp = bpy.context.object
    lamp.data.energy = energy
    lamp.data.shape = "DISK"
    lamp.data.size = size
    lamp.rotation_euler = (Vector(target) - lamp.location).to_track_quat("-Z", "Y").to_euler()

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 24
scene.render.resolution_x = 960
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = str(ROOT / "art/blender" / f"{name}-runtime-review.png")
bpy.ops.render.render(write_still=True)
