"""Review stills for the television shell; the in-game HDMI feed is rendered by React."""
import bpy
from pathlib import Path
from mathutils import Vector

root=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(root/"art/blender/samsung-u8000f.blend"))
scene=bpy.context.scene
world=bpy.data.worlds.new("TV review ambient")
scene.world=world
world.use_nodes=True
world.node_tree.nodes["Background"].inputs["Color"].default_value=(.16,.17,.20,1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value=.75
for name,camera_pos,light_pos in (
    ("front",(.62,-1.8,.35),(-.5,-.8,.9)),
    ("rear",(.62,1.8,.35),(-.5,.8,.9)),
):
    bpy.ops.object.camera_add(location=camera_pos)
    cam=bpy.context.object
    target=Vector((0,0,0))
    cam.rotation_euler=(target-cam.location).to_track_quat("-Z","Y").to_euler()
    cam.data.type="ORTHO"
    cam.data.ortho_scale=1.22
    scene.camera=cam
    bpy.ops.object.light_add(type="AREA",location=light_pos)
    lamp=bpy.context.object
    lamp.data.energy=36
    lamp.data.shape="DISK"
    lamp.data.size=1.2
    lamp.rotation_euler=(target-lamp.location).to_track_quat("-Z","Y").to_euler()
    scene.render.engine="CYCLES"
    scene.cycles.samples=32
    scene.render.resolution_x=900
    scene.render.resolution_y=650
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format="PNG"
    scene.render.filepath=str(root/f"art/blender/samsung-u8000f-{name}-review.png")
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam,do_unlink=True)
    bpy.data.objects.remove(lamp,do_unlink=True)
