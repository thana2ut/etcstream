"""Render one close view of the studio floor LED panel from the saved Blender source."""
import bpy
from pathlib import Path
from mathutils import Vector

root = Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(root / 'art/blender/studio-room-01.blend'))
scene = bpy.context.scene
camera = bpy.data.cameras.new('lamp_review')
object_camera = bpy.data.objects.new('lamp_review', camera)
scene.collection.objects.link(object_camera)
object_camera.location = (5.1, 0.15, 1.7)
target = Vector((3.6, 3.7, 1.18))
object_camera.rotation_euler = (target - object_camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.lens = 29
scene.camera = object_camera
scene.cycles.samples = 24
scene.render.resolution_x = 720
scene.render.resolution_y = 900
scene.render.filepath = str(root / 'art/blender/studio-lamp-review.png')
bpy.ops.render.render(write_still=True)
