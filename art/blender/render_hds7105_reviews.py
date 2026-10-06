"""Render the saved HDS7105 review cameras for comparison with art/reference/hds7105."""
import bpy
from pathlib import Path
root = Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(root / 'art/blender/hds7105.blend'))
scene = bpy.context.scene
out = root / 'art/blender/reviews/hds7105'
out.mkdir(parents=True, exist_ok=True)
for camera in [o for o in scene.objects if o.type == 'CAMERA']:
    scene.camera = camera
    scene.render.filepath = str(out / (camera.name + '.png'))
    bpy.ops.render.render(write_still=True)
