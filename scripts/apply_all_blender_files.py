import bpy
import bmesh
from mathutils import Vector
import os
import sys
import shutil

# Master authoritative list of stations matching STATION_MONUMENT_DEFS in StationMonuments.tsx
# Format: (id, name, three_x, three_y, three_z, dims_x, dims_y, dims_z, hex_color)
STATIONS_DATA = [
    # 1. PRIMARY ARRIVAL AVENUE (Direct path from Harbor Spawn [93.6, 126] to Village)
    ('TRIGGER_Harbor_Welcome', 'Harbor Pier • Connect Station', 108.89, 3.1, 118.04, 3.5, 3.5, 3.0, '#fbbf24'),
    ('TRIGGER_Project_OneMoreMove', 'One More Move (C++ Engine)', 85.0, 3.0, 116.0, 3.5, 3.5, 3.0, '#f97316'),
    ('TRIGGER_Hall_Certifications', 'Harvard CS50x Certificate', 65.0, 3.0, 95.0, 3.5, 3.5, 3.0, '#ef4444'),
    ('TRIGGER_Project_ButlerOS', 'Butler AI Assistant', 52.0, 3.0, 72.0, 4.0, 4.0, 3.0, '#a855f7'),
    ('TRIGGER_Moonwell_Skills', 'Technical Skills Hub', 38.0, 3.0, 42.0, 4.5, 4.5, 3.5, '#10b981'),
    ('TRIGGER_Leadership_Pavilion', 'Leadership & Mentorship', 35.0, 3.0, 12.0, 3.5, 3.5, 3.0, '#eab308'),
    ('TRIGGER_Village_About', 'About Prasad • Developer Journey', 45.0, 3.0, -4.0, 3.5, 3.5, 3.0, '#f59e0b'),

    # 2. Village & Marketplace Center (Web, AI & Algorithmic Foundations)
    ('TRIGGER_Arena_Algorithms', 'Algorithms & LeetCode Hub', 19.12, 3.0, -27.01, 3.5, 3.5, 3.0, '#f43f5e'),
    ('TRIGGER_Project_Nishtha', 'Nishtha Habit Tracker', 18.0, 3.0, -2.0, 3.5, 3.5, 3.0, '#84cc16'),
    ('TRIGGER_Project_Sadhana', 'Sadhana Habit & Focus App', -9.01, 3.0, -19.83, 3.5, 3.5, 3.0, '#10b981'),
    ('TRIGGER_Project_ExamPlatform', 'AI Exam & Assessment Platform', 6.0, 3.0, -17.5, 3.5, 3.5, 3.0, '#14b8a6'),
    ('TRIGGER_Project_SmartCampus', 'Smart Campus QR System', 98.0, 3.0, 25.0, 3.5, 3.5, 3.0, '#3b82f6'),
    ('TRIGGER_Project_GameStore', 'Game Store Discovery Hub', 81.88, 3.0, -68.15, 3.5, 3.5, 3.0, '#f97316'),
    ('TRIGGER_Project_SchoolWebsite', 'School Community Portal', 56.64, 3.0, -27.05, 3.5, 3.5, 3.0, '#0284c7'),
    ('TRIGGER_Project_Akshayanidhi', 'Akshayanidhi AI Photo Vault', 42.22, 3.0, -16.48, 3.5, 3.5, 3.0, '#9333ea'),
    ('TRIGGER_Project_Vyuham', 'Vyuham Productivity Extension', -5.0, 3.0, 16.89, 3.5, 3.5, 3.0, '#06b6d4'),

    # 3. West & Highland Explorations (Mobile Game, 2D Games, Space Weather)
    ('TRIGGER_Forge_GameDev', 'On The Way Mobile Game', -97.55, 3.0, -5.20, 4.0, 4.0, 3.0, '#ea580c'),
    ('TRIGGER_Project_CMEDetector', 'CME Space Weather System', -78.0, 3.0, -28.0, 3.5, 3.5, 3.0, '#f59e0b'),
    ('TRIGGER_Project_KnightsAdventure', 'Knight Adventure (2D Game)', -58.0, 3.0, -55.04, 4.0, 4.0, 3.0, '#d97706'),

    # 4. Spatial Computing & Augmented Reality Zone
    ('TRIGGER_Project_Sahaj', 'Sahaj Accessibility System', -18.0, 3.0, 58.0, 3.5, 3.5, 3.0, '#8b5cf6'),
    ('TRIGGER_Project_RealmWebAR', 'WebAR 3D Experience', -32.0, 3.0, 22.17, 3.5, 3.5, 3.0, '#06b6d4'),
    ('TRIGGER_Project_TraceMateAR', 'TraceMate Augmented Reality', -72.0, 3.0, 12.0, 3.5, 3.5, 3.0, '#0ea5e9'),

    # 5. Interactive Logic Puzzle & Knowledge Search
    ('TRIGGER_Stonehenge_Puzzle', 'Logic Puzzle & Philosophy', 30.08, 2.49, 52.85, 6.0, 6.0, 3.5, '#d97706'),
    ('TRIGGER_Project_MaraRAG', 'MaraRAG AI Search Engine', 72.0, 3.0, 18.0, 3.5, 3.5, 3.0, '#8b5cf6'),

    # 6. Mountain Pass & High Citadel Overlook
    ('TRIGGER_Project_LifeManager', 'Telegram to Notion Automation', -30.0, 3.0, -80.0, 3.5, 3.5, 3.0, '#7c3aed'),
    ('TRIGGER_Citadel_Contact', 'Contact & Collaboration', -15.0, 3.0, -100.0, 5.0, 5.0, 4.0, '#06b6d4'),
]

LEGACY_STATION_MAP = {
    'COL_Station_Harbor_Welcome': (108.89, -118.04, 3.1),
    'Station_Harbor_Welcome': (108.89, -118.04, 3.1),
    'COL_Station_Village_About': (45.0, 4.0, 3.0),
    'Station_Village_About': (45.0, 4.0, 3.0),
    'COL_Station_Moonwell_Skills': (38.0, -42.0, 3.0),
    'Station_Moonwell_Skills': (38.0, -42.0, 3.0),
    'COL_Station_Forge_GameDev': (-97.55, 5.20, 3.0),
    'Station_Forge_GameDev': (-97.55, 5.20, 3.0),
    'COL_Station_Project_ExamPlatform': (6.0, 17.5, 3.0),
    'Station_Project_ExamPlatform': (6.0, 17.5, 3.0),
    'COL_Station_Project_Sadhana': (-9.01, 19.83, 3.0),
    'Station_Project_Sadhana': (-9.01, 19.83, 3.0),
    'COL_Station_Project_Vyuham': (-5.0, -16.89, 3.0),
    'Station_Project_Vyuham': (-5.0, -16.89, 3.0),
}

def hex_to_rgb(hex_code):
    h = hex_code.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4))

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
            if lc.name == col_name or lc.collection.name == col_name:
                lc.exclude = False
                lc.hide_viewport = False
                
    # Remove old triggers
    old_triggers = [o for o in bpy.data.objects if o.name.startswith("TRIGGER_")]
    for o in old_triggers:
        mesh_data = o.data
        bpy.data.objects.remove(o, do_unlink=True)
        if mesh_data and mesh_data.users == 0:
            bpy.data.meshes.remove(mesh_data)
        
    old_col = bpy.data.collections.get("Triggers")
    if old_col:
        bpy.data.collections.remove(old_col)
        
    created = []
    for sid, sname, three_x, three_y, three_z, dims_x, dims_y, dims_z, hex_c in STATIONS_DATA:
        bx = three_x
        by = -three_z
        bz = three_y + dims_z / 2.0
        rgb = hex_to_rgb(hex_c)
        rgba = (rgb[0], rgb[1], rgb[2], 0.8)
        
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
        
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        obj.select_set(False)
        
        obj.hide_viewport = False
        obj.hide_render = False
        obj.show_name = True
        obj.show_wire = True
        obj.display_type = 'TEXTURED'
        
        mat_name = f"Mat_{sid}"
        mat = bpy.data.materials.get(mat_name)
        if not mat:
            mat = bpy.data.materials.new(mat_name)
            mat.use_nodes = True
            bsdf = mat.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                bsdf.inputs["Base Color"].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
                if "Emission Color" in bsdf.inputs:
                    bsdf.inputs["Emission Color"].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
                if "Emission Strength" in bsdf.inputs:
                    bsdf.inputs["Emission Strength"].default_value = 2.0
        
        mat.diffuse_color = rgba
        if obj.data.materials:
            obj.data.materials[0] = mat
        else:
            obj.data.materials.append(mat)
            
        created.append(obj)

    # Reposition legacy station objects
    for legacy_name, (lx, ly, lz) in LEGACY_STATION_MAP.items():
        leg_obj = bpy.data.objects.get(legacy_name)
        if leg_obj:
            leg_obj.location = (lx, ly, lz)
        
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
    r"C:\Users\prasa\OneDrive\Desktop\learn\blender\portfolio\PORTFOLIO_ISLAND_PROJECT_PACKAGE\01_Blender_Project\Island_World_Master.blend",
    r"C:\Users\prasa\OneDrive\Desktop\learn\blender\portfolio\PORTFOLIO_ISLAND_PROJECT_PACKAGE\01_Blender_Project\before_nutre_with_light_to_anti.blend",
    r"C:\Users\prasa\OneDrive\Desktop\learn\blender\portfolio\from packes\mean file\with ref\before_nutre_with_light_to_anti.blend"
]

for f in files_to_update:
    try:
        setup_file(f)
    except Exception as e:
        print(f"Error on {f}: {e}")
