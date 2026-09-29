"""Render the eight saved review cameras; no runtime or gameplay assertions."""
import bpy
from pathlib import Path
root=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(root/'art/blender/studio-room-01.blend'))
scene=bpy.context.scene
scene.cycles.samples=8
scene.render.resolution_x=800
scene.render.resolution_y=560
out=root/'art/blender/reviews'
out.mkdir(exist_ok=True)
for camera in [o for o in scene.objects if o.type=='CAMERA']:
    scene.camera=camera
    scene.render.filepath=str(out/(camera.name+'.png'))
    bpy.ops.render.render(write_still=True)
