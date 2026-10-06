"""Render front and rear checks of the Yamaha HS5 asset."""
import bpy
from pathlib import Path
from mathutils import Vector

root=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(root/"art/blender/yamaha-hs5.blend"))
scene=bpy.context.scene
world=bpy.data.worlds.new("review studio ambient")
scene.world=world
world.use_nodes=True
world.node_tree.nodes["Background"].inputs["Color"].default_value=(.16,.17,.19,1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value=.7
for name,camera_pos,light_pos in (
    ("front",(.72,-1.55,.78),(-.55,-.8,1.45)),
    ("rear",(.60,1.55,.78),(-.5,.8,1.42)),
):
    bpy.ops.object.camera_add(location=camera_pos)
    cam=bpy.context.object
    target=Vector((0,0,.45))
    cam.rotation_euler=(target-cam.location).to_track_quat("-Z","Y").to_euler()
    cam.data.type="ORTHO"
    cam.data.ortho_scale=1.22
    scene.camera=cam
    bpy.ops.object.light_add(type="AREA",location=light_pos)
    lamp=bpy.context.object
    lamp.data.energy=48
    lamp.data.shape="DISK"
    lamp.data.size=1.1
    lamp.rotation_euler=(target-lamp.location).to_track_quat("-Z","Y").to_euler()
    scene.render.engine="CYCLES"
    scene.cycles.samples=40
    scene.render.resolution_x=720
    scene.render.resolution_y=900
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format="PNG"
    scene.render.filepath=str(root/f"art/blender/yamaha-hs5-{name}-review.png")
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam,do_unlink=True)
    bpy.data.objects.remove(lamp,do_unlink=True)
