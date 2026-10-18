import bpy
import bmesh
from mathutils import Vector
import os
import sys
import shutil

print("=== Starting Blender Tree Ambient Occlusion & Baked Lighting Pipeline ===")

TREES_GLB = os.path.abspath(r"public/models/threejs_game_assets/trees.glb")
TREES_BAK = os.path.abspath(r"public/models/threejs_game_assets/trees.glb.bak")

if not os.path.exists(TREES_GLB):
    print(f"ERROR: trees.glb not found at {TREES_GLB}")
    sys.exit(1)

# Safety backup
if not os.path.exists(TREES_BAK):
    print(f"Creating safety backup: {TREES_BAK}")
    shutil.copy2(TREES_GLB, TREES_BAK)
else:
    print(f"Safety backup already exists: {TREES_BAK}")

bpy.ops.wm.read_factory_settings(use_empty=True)
print(f"Importing {TREES_BAK}")
bpy.ops.import_scene.gltf(filepath=TREES_BAK)

tree_objects = [o for o in bpy.data.objects if o.type == 'MESH']
print(f"Found {len(tree_objects)} tree prototypes: {[o.name for o in tree_objects]}")

for obj in tree_objects:
    mesh = obj.data
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    
    col_attr = mesh.color_attributes.get("Col")
    if not col_attr:
        col_attr = mesh.color_attributes.new(name="Col", type='BYTE_COLOR', domain='CORNER')
    mesh.color_attributes.active_color = col_attr
    
    try:
        bpy.ops.object.mode_set(mode='VERTEX_PAINT')
        bpy.ops.paint.vertex_color_dirt(
            blur_strength=1.0,
            blur_iterations=2,
            clean_angle=1.85,
            dirt_angle=0.95,
            dirt_only=False,
            normalize=True
        )
        bpy.ops.object.mode_set(mode='OBJECT')
    except Exception as e:
        print(f"Notice: Dirt operator skipped for {obj.name}: {e}")
        try:
            bpy.ops.object.mode_set(mode='OBJECT')
        except Exception:
            pass

    # Soften contact shadows and add subtle foliage bounce
    for poly in mesh.polygons:
        nz = poly.normal.z
        if nz < -0.1:
            bounce = min(1.0, -nz * 0.35)
            tint_r = 1.02 + 0.08 * bounce
            tint_g = 1.00 + 0.05 * bounce
            tint_b = 0.94
        else:
            sky = min(1.0, max(0.0, nz) * 0.25)
            tint_r = 0.98 + 0.02 * sky
            tint_g = 0.99 + 0.01 * sky
            tint_b = 1.00 + 0.06 * sky

        for loop_idx in poly.loop_indices:
            c = col_attr.data[loop_idx]
            raw_ao = (c.color[0] + c.color[1] + c.color[2]) / 3.0
            # Remap: floor of 0.62 so leaf undersides stay lush and legible
            ao = 0.62 + 0.38 * raw_ao
            c.color = (
                max(0.0, min(1.0, ao * tint_r)),
                max(0.0, min(1.0, ao * tint_g)),
                max(0.0, min(1.0, ao * tint_b)),
                1.0
            )

    obj.select_set(False)

print("Exporting baked trees.glb with active vertex color attributes...")
bpy.ops.export_scene.gltf(
    filepath=TREES_GLB,
    export_format='GLB',
    export_attributes=True,
    export_vertex_color='ACTIVE',
    export_apply=False,
    export_lights=False
)

size_kb = os.path.getsize(TREES_GLB) / 1024
print(f"Successfully exported {TREES_GLB} ({size_kb:.1f} KB)")
print("=== Tree Bake Finished Successfully ===")
