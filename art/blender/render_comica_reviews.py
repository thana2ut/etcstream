"""Render front three-quarter review stills of the authored COMICA units."""
import bpy
import math
from pathlib import Path
from mathutils import Vector

root = Path(__file__).resolve().parents[2]
for kind in ("rx", "tx"):
    bpy.ops.wm.open_mainfile(filepath=str(root / f"art/blender/comica-wm100-plus-{kind}.blend"))
    scene = bpy.context.scene
    world = bpy.data.worlds.new("review neutral")
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (.19,.20,.22,1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = .6
    bpy.ops.object.camera_add(location=(.32,-.55,.32))
    cam = bpy.context.object
    target = Vector((0,0,.18))
    cam.rotation_euler = (target-cam.location).to_track_quat("-Z","Y").to_euler()
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = .57
    scene.camera = cam
    for pos,power,size in [((-.3,-.25,.6),12,.4),((.25,.1,.45),7,.4)]:
        bpy.ops.object.light_add(type="AREA",location=pos)
        light=bpy.context.object
        light.data.energy=power
        light.data.shape="DISK"
        light.data.size=size
        light.rotation_euler=(target-light.location).to_track_quat("-Z","Y").to_euler()
    scene.render.engine="CYCLES"
    scene.cycles.samples=32
    scene.render.resolution_x=700
    scene.render.resolution_y=700
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format="PNG"
    scene.render.film_transparent=False
    out=root/f"art/blender/comica-wm100-plus-{kind}-review.png"
    scene.render.filepath=str(out)
    bpy.ops.render.render(write_still=True)
    print("COMICA_REVIEW",str(out))
