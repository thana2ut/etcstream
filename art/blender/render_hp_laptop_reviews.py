"""Render all saved HP laptop review cameras with Blender 5.2."""
import bpy
from pathlib import Path
root=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(root/"art/blender/hp-laptop.blend"))
scene=bpy.context.scene
out=root/"art/blender/reviews/hp-laptop"; out.mkdir(parents=True,exist_ok=True)
for camera in [o for o in scene.objects if o.type=="CAMERA" and o.name.startswith("review_")]:
    scene.camera=camera; scene.render.filepath=str(out/(camera.name+".png")); bpy.ops.render.render(write_still=True)
