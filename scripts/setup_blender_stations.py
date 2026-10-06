import bpy
from mathutils import Vector
import os

blend_path = r"PORTFOLIO_ISLAND_PROJECT_PACKAGE\01_Blender_Project\Island_World_Master.blend"
print(f"Loading blend file: {blend_path}")

# Station definitions
# (id, name, three_x, three_z, ground_z, dims_x, dims_y, dims_z, (r, g, b, a))
STATIONS_DATA = [
  ('TRIGGER_Harbor_Welcome', 'Harbor Welcome', 107.0, 125.0, 3.06, 3.5, 3.5, 3.0, (0.98, 0.75, 0.14, 0.7)),
  ('TRIGGER_Project_CMEDetector', 'CME Space Weather Sun Dial', 85.0, 118.0, 3.0, 3.5, 3.5, 3.0, (0.96, 0.62, 0.07, 0.7)),
  ('TRIGGER_Hall_Certifications', 'Harvard CS50x Hall', 65.0, 95.0, 3.0, 3.5, 3.5, 3.0, (0.94, 0.27, 0.27, 0.7)),
  ('TRIGGER_Village_About', 'Village Journey', 45.0, -4.0, 3.0, 3.5, 3.5, 3.0, (0.96, 0.62, 0.07, 0.7)),
  ('TRIGGER_Leadership_Pavilion', 'Leadership Pavilion', 35.0, 12.0, 3.0, 3.5, 3.5, 3.0, (0.92, 0.70, 0.03, 0.7)),
  ('TRIGGER_Arena_Algorithms', 'Algorithmic Arena', 18.0, -30.0, 3.0, 3.5, 3.5, 3.0, (0.96, 0.25, 0.37, 0.7)),
  ('TRIGGER_Project_ExamPlatform', 'AI Exam Platform Plinth', 6.0, -17.5, 3.0, 3.5, 3.5, 3.0, (0.08, 0.72, 0.65, 0.7)),
  ('TRIGGER_Project_SmartCampus', 'Smart Campus QR Registry', 22.0, -6.0, 3.0, 3.5, 3.5, 3.0, (0.23, 0.51, 0.96, 0.7)),
  ('TRIGGER_Project_GameStore', 'Game Discovery Arcade', 58.0, 8.0, 3.0, 3.5, 3.5, 3.0, (0.98, 0.45, 0.09, 0.7)),
  ('TRIGGER_Project_SchoolWebsite', 'Girls School Civic Hall', 48.0, -22.0, 3.0, 3.5, 3.5, 3.0, (0.01, 0.52, 0.78, 0.7)),
  ('TRIGGER_Project_Akshayanidhi', 'Akshayanidhi Media Archive', 46.0, -19.0, 3.0, 3.5, 3.5, 3.0, (0.58, 0.20, 0.92, 0.7)),
  ('TRIGGER_Project_Sadhana', 'Sadhana Habit PWA Plinth', -12.0, -12.0, 3.0, 3.5, 3.5, 3.0, (0.06, 0.73, 0.51, 0.7)),
  ('TRIGGER_Project_Vyuham', 'Vyuham Chrome Ext Plinth', -5.0, 8.0, 3.0, 3.5, 3.5, 3.0, (0.02, 0.71, 0.83, 0.7)),
  ('TRIGGER_Project_Nishtha', 'Nishtha Gamified RPG Bazaar', 98.0, 25.0, 3.0, 3.5, 3.5, 3.0, (0.52, 0.80, 0.09, 0.7)),
  ('TRIGGER_Forge_GameDev', 'On The Way Forge', -102.0, -11.5, 3.0, 4.0, 4.0, 3.0, (0.92, 0.35, 0.05, 0.7)),
  ('TRIGGER_Project_OneMoreMove', 'One More Move Keep', -78.0, -28.0, 3.0, 3.5, 3.5, 3.0, (0.98, 0.45, 0.09, 0.7)),
  ('TRIGGER_Project_KnightsAdventure', 'Knight Adventure Windmill', -58.0, -58.0, 3.0, 4.0, 4.0, 3.0, (0.85, 0.47, 0.02, 0.7)),
  ('TRIGGER_Project_Sahaj', 'Sahaj Accessibility Shrine', -18.0, 58.0, 3.0, 3.5, 3.5, 3.0, (0.55, 0.36, 0.96, 0.7)),
  ('TRIGGER_Moonwell_Skills', 'Mana Well Skills Grove', -48.0, 34.0, 3.6, 4.5, 4.5, 3.5, (0.06, 0.73, 0.51, 0.7)),
  ('TRIGGER_Project_RealmWebAR', 'WebAR Beacon', -32.0, 20.0, 3.0, 3.5, 3.5, 3.0, (0.02, 0.71, 0.83, 0.7)),
  ('TRIGGER_Project_TraceMateAR', 'TraceMate Pro Studio', -72.0, 12.0, 3.0, 3.5, 3.5, 3.0, (0.05, 0.65, 0.91, 0.7)),
  ('TRIGGER_Stonehenge_Puzzle', 'Stonehenge Rune Puzzle', 35.0, 58.0, 3.0, 6.0, 6.0, 3.5, (0.85, 0.47, 0.02, 0.7)),
  ('TRIGGER_Project_MaraRAG', 'MaraRAG Library', 72.0, 18.0, 3.0, 3.5, 3.5, 3.0, (0.55, 0.36, 0.96, 0.7)),
  ('TRIGGER_Project_LifeManager', 'Telegram-to-Notion OS', 0.0, -92.0, 3.0, 3.5, 3.5, 3.0, (0.49, 0.23, 0.93, 0.7)),
  ('TRIGGER_Project_ButlerOS', 'Butler OS Spire', -30.0, -80.0, 3.0, 4.0, 4.0, 3.0, (0.66, 0.33, 0.97, 0.7)),
  ('TRIGGER_Citadel_Contact', 'Citadel Summit Contact', -15.0, -100.0, 3.0, 5.0, 5.0, 4.0, (0.02, 0.71, 0.83, 0.7))
]

# 1. Create or get collection
col_name = "Station_Triggers_3D"
target_col = bpy.data.collections.get(col_name)
if not target_col:
    target_col = bpy.data.collections.new(col_name)
    bpy.context.scene.collection.children.link(target_col)
else:
    if target_col.name not in [c.name for c in bpy.context.scene.collection.children]:
        try:
            bpy.context.scene.collection.children.link(target_col)
        except Exception:
            pass

# Ensure collection is visible
target_col.hide_viewport = False
target_col.hide_render = False

# Ensure active in view layers
for vl in bpy.context.scene.view_layers:
    for lc in vl.layer_collection.children:
        if lc.collection.name == col_name or lc.name == col_name:
            lc.exclude = False
            lc.hide_viewport = False

# 2. Remove old duplicate trigger objects across all collections to avoid conflicts
old_triggers = [o for o in bpy.data.objects if o.name.startswith("TRIGGER_")]
for o in old_triggers:
    bpy.data.objects.remove(o, do_unlink=True)

# Also remove old 'Triggers' collection if present
old_col = bpy.data.collections.get("Triggers")
if old_col:
    bpy.data.collections.remove(old_col)

# 3. Create all 26 station 3D cubes resting perfectly on the ground
created_objects = []

for sid, sname, three_x, three_z, ground_z, dims_x, dims_y, dims_z, color in STATIONS_DATA:
    # Blender Coordinates:
    # X_blend = ThreeJS_X
    # Y_blend = -ThreeJS_Z
    # Z_blend = ground_z + dims_z / 2 (base sits exactly at ground_z)
    bx = three_x
    by = -three_z
    bz = ground_z + dims_z / 2.0
    
    # Create cube mesh
    mesh = bpy.data.meshes.new(f"{sid}_Mesh")
    obj = bpy.data.objects.new(sid, mesh)
    target_col.objects.link(obj)
    
    # Generate cube geometry
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bm.to_mesh(mesh)
    bm.free()
    
    # Scale and translate
    obj.scale = (dims_x, dims_y, dims_z)
    obj.location = (bx, by, bz)
    
    # Make visible and easily selectable
    obj.hide_viewport = False
    obj.hide_render = False
    obj.show_name = True # Shows name tag directly in Blender 3D viewport!
    obj.show_wire = True # Outlines cube edges in Blender
    obj.display_type = 'SOLID'
    
    # Create vibrant viewport material
    mat_name = f"Mat_{sid}"
    mat = bpy.data.materials.get(mat_name)
    if not mat:
        mat = bpy.data.materials.new(mat_name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (color[0], color[1], color[2], 1.0)
            if "Roughness" in bsdf.inputs:
                bsdf.inputs["Roughness"].default_value = 0.2
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = (color[0], color[1], color[2], 1.0)
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = 1.5
    
    mat.diffuse_color = color # Solid mode viewport color
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
        
    created_objects.append(obj)
    print(f"Created {sid} ({sname}): Base Z={ground_z:.2f}, Center Z={bz:.2f}, Pos=({bx:.1f}, {by:.1f}, {bz:.2f})")

print(f"Successfully configured all {len(created_objects)} station trigger cubes in Blender!")

# 4. Save the Master Blend File
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print("Saved blend file successfully!")

# Also save a timestamped backup
backup_path = r"PORTFOLIO_ISLAND_PROJECT_PACKAGE\01_Blender_Project\Island_World_Master_STATIONS_CONFIGURED.blend"
bpy.ops.wm.save_as_mainfile(filepath=backup_path)
print(f"Saved backup at {backup_path}")
