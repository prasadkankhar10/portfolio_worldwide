import bpy
import bmesh
from mathutils import Vector
import os
import sys

STATIONS_DATA = [
  ('TRIGGER_Harbor_Welcome', 'Harbor Welcome', 107.0, 125.0, 3.06, 3.5, 3.5, 3.0, (1.0, 0.8, 0.0, 0.8)),
  ('TRIGGER_Project_CMEDetector', 'CME Space Weather Sun Dial', 85.0, 118.0, 3.0, 3.5, 3.5, 3.0, (1.0, 0.5, 0.0, 0.8)),
  ('TRIGGER_Hall_Certifications', 'Harvard CS50x Hall', 65.0, 95.0, 3.0, 3.5, 3.5, 3.0, (1.0, 0.2, 0.2, 0.8)),
  ('TRIGGER_Village_About', 'Village Journey', 45.0, -4.0, 3.0, 3.5, 3.5, 3.0, (1.0, 0.6, 0.0, 0.8)),
  ('TRIGGER_Leadership_Pavilion', 'Leadership Pavilion', 35.0, 12.0, 3.0, 3.5, 3.5, 3.0, (1.0, 0.7, 0.0, 0.8)),
  ('TRIGGER_Arena_Algorithms', 'Algorithmic Arena', 18.0, -30.0, 3.0, 3.5, 3.5, 3.0, (1.0, 0.2, 0.4, 0.8)),
  ('TRIGGER_Project_ExamPlatform', 'AI Exam Platform Plinth', 6.0, -17.5, 3.0, 3.5, 3.5, 3.0, (0.0, 0.9, 0.8, 0.8)),
  ('TRIGGER_Project_SmartCampus', 'Smart Campus QR Registry', 22.0, -6.0, 3.0, 3.5, 3.5, 3.0, (0.2, 0.6, 1.0, 0.8)),
  ('TRIGGER_Project_GameStore', 'Game Discovery Arcade', 58.0, 8.0, 3.0, 3.5, 3.5, 3.0, (1.0, 0.4, 0.1, 0.8)),
  ('TRIGGER_Project_SchoolWebsite', 'Girls School Civic Hall', 48.0, -22.0, 3.0, 3.5, 3.5, 3.0, (0.0, 0.6, 1.0, 0.8)),
  ('TRIGGER_Project_Akshayanidhi', 'Akshayanidhi Media Archive', 46.0, -19.0, 3.0, 3.5, 3.5, 3.0, (0.7, 0.2, 1.0, 0.8)),
  ('TRIGGER_Project_Sadhana', 'Sadhana Habit PWA Plinth', -12.0, -12.0, 3.0, 3.5, 3.5, 3.0, (0.1, 0.9, 0.5, 0.8)),
  ('TRIGGER_Project_Vyuham', 'Vyuham Chrome Ext Plinth', -5.0, 8.0, 3.0, 3.5, 3.5, 3.0, (0.0, 0.8, 0.9, 0.8)),
  ('TRIGGER_Project_Nishtha', 'Nishtha Gamified RPG Bazaar', 98.0, 25.0, 3.0, 3.5, 3.5, 3.0, (0.6, 0.9, 0.1, 0.8)),
  ('TRIGGER_Forge_GameDev', 'On The Way Forge', -102.0, -11.5, 3.0, 4.0, 4.0, 3.0, (1.0, 0.35, 0.05, 0.8)),
  ('TRIGGER_Project_OneMoreMove', 'One More Move Keep', -78.0, -28.0, 3.0, 3.5, 3.5, 3.0, (1.0, 0.5, 0.1, 0.8)),
  ('TRIGGER_Project_KnightsAdventure', 'Knight Adventure Windmill', -58.0, -58.0, 3.0, 4.0, 4.0, 3.0, (0.9, 0.5, 0.0, 0.8)),
  ('TRIGGER_Project_Sahaj', 'Sahaj Accessibility Shrine', -18.0, 58.0, 3.0, 3.5, 3.5, 3.0, (0.6, 0.4, 1.0, 0.8)),
  ('TRIGGER_Moonwell_Skills', 'Mana Well Skills Grove', -48.0, 34.0, 3.6, 4.5, 4.5, 3.5, (0.1, 0.9, 0.5, 0.8)),
  ('TRIGGER_Project_RealmWebAR', 'WebAR Beacon', -32.0, 20.0, 3.0, 3.5, 3.5, 3.0, (0.0, 0.8, 1.0, 0.8)),
  ('TRIGGER_Project_TraceMateAR', 'TraceMate Pro Studio', -72.0, 12.0, 3.0, 3.5, 3.5, 3.0, (0.1, 0.7, 1.0, 0.8)),
  ('TRIGGER_Stonehenge_Puzzle', 'Stonehenge Rune Puzzle', 35.0, 58.0, 3.0, 6.0, 6.0, 3.5, (0.9, 0.5, 0.0, 0.8)),
  ('TRIGGER_Project_MaraRAG', 'MaraRAG Library', 72.0, 18.0, 3.0, 3.5, 3.5, 3.0, (0.6, 0.4, 1.0, 0.8)),
  ('TRIGGER_Project_LifeManager', 'Telegram-to-Notion OS', 0.0, -92.0, 3.0, 3.5, 3.5, 3.0, (0.5, 0.2, 1.0, 0.8)),
  ('TRIGGER_Project_ButlerOS', 'Butler OS Spire', -30.0, -80.0, 3.0, 4.0, 4.0, 3.0, (0.7, 0.3, 1.0, 0.8)),
  ('TRIGGER_Citadel_Contact', 'Citadel Summit Contact', -15.0, -100.0, 3.0, 5.0, 5.0, 4.0, (0.0, 0.8, 1.0, 0.8))
]

def setup_file(filepath):
    if not os.path.exists(filepath):
        print(f"Skipping non-existent: {filepath}")
        return
    
    print(f"\n==========================================")
    print(f"Processing: {filepath}")
    bpy.ops.wm.open_mainfile(filepath=filepath)
    
    # 1. Collection: Station_Triggers_3D
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
                
    target_col.hide_viewport = False
    target_col.hide_render = False
    
    # Enable in view layers
    for vl in bpy.context.scene.view_layers:
        for lc in vl.layer_collection.children:
            if lc.name == col_name:
                lc.exclude = False
                lc.hide_viewport = False
                
    # Remove old triggers
    old_triggers = [o for o in bpy.data.objects if o.name.startswith("TRIGGER_")]
    for o in old_triggers:
        bpy.data.objects.remove(o, do_unlink=True)
        
    old_col = bpy.data.collections.get("Triggers")
    if old_col:
        bpy.data.collections.remove(old_col)
        
    created = []
    for sid, sname, three_x, three_z, ground_z, dims_x, dims_y, dims_z, color in STATIONS_DATA:
        bx = three_x
        by = -three_z
        bz = ground_z + dims_z / 2.0
        
        mesh = bpy.data.meshes.new(f"{sid}_Mesh")
        obj = bpy.data.objects.new(sid, mesh)
        target_col.objects.link(obj)
        
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        bm.to_mesh(mesh)
        bm.free()
        mesh.update()
        
        obj.scale = (dims_x, dims_y, dims_z)
        obj.location = (bx, by, bz)
        
        # Apply transformation so bounding box and dimensions are baked into vertices!
        # This guarantees 100% visibility in any shading mode and any CAD/Blender viewer
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        obj.select_set(False)
        
        obj.hide_viewport = False
        obj.hide_render = False
        obj.show_name = True
        obj.show_wire = True
        obj.display_type = 'TEXTURED'
        
        # Create ultra-visible glowing shader material
        mat_name = f"Mat_{sid}"
        mat = bpy.data.materials.get(mat_name)
        if not mat:
            mat = bpy.data.materials.new(mat_name)
            mat.use_nodes = True
            bsdf = mat.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                bsdf.inputs["Base Color"].default_value = color
                if "Emission Color" in bsdf.inputs:
                    bsdf.inputs["Emission Color"].default_value = (color[0], color[1], color[2], 1.0)
                if "Emission Strength" in bsdf.inputs:
                    bsdf.inputs["Emission Strength"].default_value = 2.0
        
        mat.diffuse_color = color
        if obj.data.materials:
            obj.data.materials[0] = mat
        else:
            obj.data.materials.append(mat)
            
        created.append(obj)
        
    # Set viewport overlays on all screens
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                for space in area.spaces:
                    if space.type == 'VIEW_3D':
                        space.overlay.show_overlays = True
                        space.overlay.show_extras = True
                        space.overlay.show_relationship_lines = True
                        
    # Set the first station as active and selected
    first_obj = bpy.data.objects.get('TRIGGER_Harbor_Welcome')
    if first_obj:
        bpy.context.view_layer.objects.active = first_obj
        first_obj.select_set(True)
        
    bpy.ops.wm.save_as_mainfile(filepath=filepath)
    print(f"Successfully updated and saved: {filepath} with {len(created)} stations!")

files_to_update = [
    r"PORTFOLIO_ISLAND_PROJECT_PACKAGE\01_Blender_Project\Island_World_Master.blend",
    r"PORTFOLIO_ISLAND_PROJECT_PACKAGE\01_Blender_Project\before_nutre_with_light_to_anti.blend",
    r"C:\Users\prasa\OneDrive\Desktop\learn\blender\portfolio\from packes\mean file\with ref\before_nutre_with_light_to_anti.blend"
]

for f in files_to_update:
    try:
        setup_file(f)
    except Exception as e:
        print(f"Error on {f}: {e}")
