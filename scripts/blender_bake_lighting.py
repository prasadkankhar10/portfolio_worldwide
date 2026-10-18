import bpy
import bmesh
from mathutils import Vector
import os
import sys
import shutil

print("=== Starting Blender Global Illumination & Baked Lighting Automation ===")

MODEL_PATH = os.path.abspath(r"public/models/threejs_game_assets/island_world_complete.glb")
BACKUP_PATH = os.path.abspath(r"public/models/threejs_game_assets/island_world_complete.glb.bak")
BLEND_MASTER_PATH = os.path.abspath(r"PORTFOLIO_ISLAND_PROJECT_PACKAGE\01_Blender_Project\Island_World_Master.blend")

if not os.path.exists(BACKUP_PATH):
    if os.path.exists(MODEL_PATH):
        print(f"Creating safety backup: {BACKUP_PATH}")
        shutil.copy2(MODEL_PATH, BACKUP_PATH)
    else:
        print(f"ERROR: Model file not found at {MODEL_PATH}")
        sys.exit(1)

# Reset blender session and load from clean backup
bpy.ops.wm.read_factory_settings(use_empty=True)
print(f"Importing clean GLB: {BACKUP_PATH}")
bpy.ops.import_scene.gltf(filepath=BACKUP_PATH)

objects = [o for o in bpy.data.objects if o.type == 'MESH']
print(f"Total mesh objects to process: {len(objects)}")

# Keywords for objects that should receive full brightness (emissives, magic crystals, runes, water)
EMISSIVE_KEYWORDS = [
    'crystal', 'rune', 'vortex', 'orbs', 'water', 'shield', 'glow',
    'lamp', 'window', 'magic', 'relic', 'portal', 'trigger_', 'col_'
]

def is_emissive_or_special(obj):
    name = obj.name.lower()
    for kw in EMISSIVE_KEYWORDS:
        if kw in name:
            return True
    for mat in obj.data.materials:
        if mat:
            mname = mat.name.lower()
            for kw in EMISSIVE_KEYWORDS:
                if kw in mname:
                    return True
    return False

processed_count = 0
special_count = 0

for obj in objects:
    mesh = obj.data
    
    # Ensure active view layer object for vertex paint ops
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    
    # Ensure Color Attribute 'Col' exists and is active
    col_attr = mesh.color_attributes.get("Col")
    if not col_attr:
        col_attr = mesh.color_attributes.new(name="Col", type='BYTE_COLOR', domain='CORNER')
    mesh.color_attributes.active_color = col_attr
    
    if is_emissive_or_special(obj):
        # Set full pure white (1.0, 1.0, 1.0, 1.0) so no occlusion dims glowing objects
        for d in col_attr.data:
            d.color = (1.0, 1.0, 1.0, 1.0)
        special_count += 1
        obj.select_set(False)
        continue
    
    # Calculate geometric contact ambient occlusion & crevice dirt
    try:
        bpy.ops.object.mode_set(mode='VERTEX_PAINT')
        bpy.ops.paint.vertex_color_dirt(
            blur_strength=1.0,
            blur_iterations=2,
            clean_angle=1.85, # ~106 deg
            dirt_angle=0.95,  # ~54 deg
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

    # Read baked occlusion and apply normal-based Global Illumination (Sky moonlight + Earth warm bounce)
    matrix_world = obj.matrix_world
    rot_mat = matrix_world.to_3x3()
    
    # Store corner colors with GI bounce adjustment
    for poly in mesh.polygons:
        # Calculate world normal of face
        world_normal = (rot_mat @ poly.normal).normalized()
        nz = world_normal.z
        
        # Sky vs Ground bounce factors
        if nz < -0.05:
            # Underside facing ground: warm bounce reflection from earth/stone
            bounce = min(1.0, -nz * 0.40)
            tint_r = 1.00 + 0.12 * bounce
            tint_g = 0.98 + 0.06 * bounce
            tint_b = 0.90 + 0.02 * bounce
        else:
            # Top facing sky/moon: soft lunar fill
            sky = min(1.0, max(0.0, nz) * 0.25)
            tint_r = 0.97 + 0.03 * sky
            tint_g = 0.98 + 0.02 * sky
            tint_b = 1.00 + 0.08 * sky
            
        for loop_idx in poly.loop_indices:
            c = col_attr.data[loop_idx]
            raw_ao = (c.color[0] + c.color[1] + c.color[2]) / 3.0
            
            # Remap AO so crevices are rich & deep without going pitch black: floor of 0.58
            ao = 0.58 + 0.42 * raw_ao
            
            r_out = max(0.0, min(1.0, ao * tint_r))
            g_out = max(0.0, min(1.0, ao * tint_g))
            b_out = max(0.0, min(1.0, ao * tint_b))
            
            c.color = (r_out, g_out, b_out, 1.0)
            
    processed_count += 1
    obj.select_set(False)

print(f"Bake complete! Processed {processed_count} meshes with GI bounce + {special_count} special emissive meshes.")

# Export GLB with export_vertex_color='ACTIVE'
print(f"Exporting optimized baked GLB to: {MODEL_PATH}")
bpy.ops.export_scene.gltf(
    filepath=MODEL_PATH,
    export_format='GLB',
    export_attributes=True,
    export_vertex_color='ACTIVE',
    export_apply=False,
    export_lights=False
)

size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
print(f"Successfully exported {MODEL_PATH} ({size_mb:.2f} MB)")

# Also bake into master blend file if present
if os.path.exists(BLEND_MASTER_PATH):
    print(f"\nSynchronizing baked vertex lighting into master blend: {BLEND_MASTER_PATH}")
    try:
        bpy.ops.wm.open_mainfile(filepath=BLEND_MASTER_PATH)
        blend_meshes = [o for o in bpy.data.objects if o.type == 'MESH']
        for o in blend_meshes:
            mesh = o.data
            bpy.context.view_layer.objects.active = o
            o.select_set(True)
            col_attr = mesh.color_attributes.get("Col")
            if not col_attr:
                col_attr = mesh.color_attributes.new(name="Col", type='BYTE_COLOR', domain='CORNER')
            mesh.color_attributes.active_color = col_attr
            if is_emissive_or_special(o):
                for d in col_attr.data:
                    d.color = (1.0, 1.0, 1.0, 1.0)
                o.select_set(False)
                continue
            try:
                bpy.ops.object.mode_set(mode='VERTEX_PAINT')
                bpy.ops.paint.vertex_color_dirt(blur_strength=1.0, blur_iterations=2, clean_angle=1.85, dirt_angle=0.95, dirt_only=False, normalize=True)
                bpy.ops.object.mode_set(mode='OBJECT')
            except Exception:
                try:
                    bpy.ops.object.mode_set(mode='OBJECT')
                except Exception:
                    pass
            matrix_world = o.matrix_world
            rot_mat = matrix_world.to_3x3()
            for poly in mesh.polygons:
                world_normal = (rot_mat @ poly.normal).normalized()
                nz = world_normal.z
                if nz < -0.05:
                    bounce = min(1.0, -nz * 0.40)
                    tint_r = 1.00 + 0.12 * bounce
                    tint_g = 0.98 + 0.06 * bounce
                    tint_b = 0.90 + 0.02 * bounce
                else:
                    sky = min(1.0, max(0.0, nz) * 0.25)
                    tint_r = 0.97 + 0.03 * sky
                    tint_g = 0.98 + 0.02 * sky
                    tint_b = 1.00 + 0.08 * sky
                for loop_idx in poly.loop_indices:
                    c = col_attr.data[loop_idx]
                    raw_ao = (c.color[0] + c.color[1] + c.color[2]) / 3.0
                    ao = 0.58 + 0.42 * raw_ao
                    c.color = (max(0.0, min(1.0, ao * tint_r)), max(0.0, min(1.0, ao * tint_g)), max(0.0, min(1.0, ao * tint_b)), 1.0)
            o.select_set(False)
        bpy.ops.wm.save_as_mainfile(filepath=BLEND_MASTER_PATH)
        print("Master blend file successfully updated with baked vertex lighting!")
    except Exception as e:
        print(f"Notice: Failed to update master blend file: {e}")

print("=== Blender Lighting Bake Finished Successfully ===")
