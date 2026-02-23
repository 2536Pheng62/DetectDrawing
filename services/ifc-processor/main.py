"""
ARC IFC Processor v2
----------------------
Microservice for extracting building parameters and validating IDS rules
using IfcOpenShell and IfcTester.

Endpoints:
  GET  /health              – liveness + library versions
  POST /extract-foundation  – IfcFooting + IfcPile with AABB geometry + Psets
  POST /validate-rules      – validate IFC against IDS (built-in or uploaded)
  POST /building-summary    – quick element counts / spaces / materials (no geometry)
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.util.element
import ifcopenshell.util.unit
from ifctester import ids, reporter
import tempfile
import os
import json
import traceback
from typing import Optional

app = FastAPI(
    title="ARC IFC Processor",
    version="2.0.0",
    description="Microservice for extracting foundation parameters and validating rules using IfcOpenShell and IfcTester.",
)


# ─────────────────────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _save_upload(upload: UploadFile, suffix: str) -> str:
    """Write UploadFile content to a temp file, return path. Caller must delete."""
    fd, path = tempfile.mkstemp(suffix=suffix)
    content = upload.file.read()
    with os.fdopen(fd, 'wb') as f:
        f.write(content)
    return path


def _geom_settings():
    """Return IfcOpenShell geometry settings (no pythonocc required)."""
    s = ifcopenshell.geom.settings()
    s.set(s.USE_WORLD_COORDS, True)
    return s


def _bounding_box(element, settings) -> Optional[dict]:
    """Compute AABB in metres using IfcOpenShell native geometry backend."""
    try:
        shape = ifcopenshell.geom.create_shape(settings, element)
        verts = shape.geometry.verts  # flat: x0,y0,z0,x1,y1,z1,...
        if not verts or len(verts) < 3:
            return None
        xs = verts[0::3]
        ys = verts[1::3]
        zs = verts[2::3]
        return {
            "width_m":  round(abs(max(xs) - min(xs)), 4),
            "length_m": round(abs(max(ys) - min(ys)), 4),
            "height_m": round(abs(max(zs) - min(zs)), 4),
        }
    except Exception as exc:
        return {"error": str(exc)}


def _element_props(element) -> dict:
    """Flatten all Pset properties into a single dict."""
    result = {}
    try:
        for pset_name, props in ifcopenshell.util.element.get_psets(element).items():
            for k, v in props.items():
                result[f"{pset_name}.{k}"] = v
    except Exception:
        pass
    return result


def _material_name(element) -> Optional[str]:
    """Return the first assigned material name, or None."""
    try:
        mats = ifcopenshell.util.element.get_materials(element)
        if mats:
            return mats[0].Name
    except Exception:
        pass
    return None

# ─────────────────────────────────────────────────────────────────────────────
#  Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ifc-processor",
        "ifcopenshell_version": ifcopenshell.version,
    }


@app.post("/extract-foundation")
async def extract_foundation(file: UploadFile = File(...)):
    """
    สกัดข้อมูลฐานราก (IfcFooting) และเสาเข็ม (IfcPile)
    รวม AABB geometry (กว้าง/ยาว/หนา), Pset properties, วัสดุ
    ใช้ IfcOpenShell native geometry — ไม่ต้องการ pythonocc
    """
    if not file.filename.lower().endswith('.ifc'):
        raise HTTPException(status_code=400, detail="File must be an .ifc file")

    temp_path = _save_upload(file, '.ifc')
    try:
        try:
            model = ifcopenshell.open(temp_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse IFC file: {e}")

        settings = _geom_settings()
        project_name = "Unknown"
        projects = model.by_type("IfcProject")
        if projects:
            project_name = projects[0].Name or "Unknown"

        unit_scale = ifcopenshell.util.unit.calculate_unit_scale(model)

        foundations = []
        for footing in model.by_type("IfcFooting"):
            foundations.append({
                "id": footing.GlobalId,
                "name": footing.Name or "Unnamed Footing",
                "type": getattr(footing, 'PredefinedType', None) or "UNKNOWN",
                "material": _material_name(footing),
                "properties": _element_props(footing),
                "dimensions": _bounding_box(footing, settings),
            })

        piles = []
        for pile in model.by_type("IfcPile"):
            piles.append({
                "id": pile.GlobalId,
                "name": pile.Name or "Unnamed Pile",
                "type": getattr(pile, 'PredefinedType', None) or "UNKNOWN",
                "material": _material_name(pile),
                "properties": _element_props(pile),
                "dimensions": _bounding_box(pile, settings),
            })

        return JSONResponse(content={
            "project_name": project_name,
            "unit_scale_to_metres": unit_scale,
            "foundation_count": len(foundations),
            "pile_count": len(piles),
            "foundations": foundations,
            "piles": piles,
        })

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/validate-rules")
async def validate_rules(
    file: UploadFile = File(...),
    ids_file: Optional[UploadFile] = File(default=None),
):
    """
    ตรวจสอบ IFC ตาม IDS rules\n
    - **file**: ไฟล์ IFC ที่ต้องการตรวจสอบ\n
    - **ids_file** (optional): ไฟล์ IDS กำหนดเอง (.ids/.xml)
      ถ้าไม่ส่งจะใช้ **mr2566_materials.ids** (กฎกระทรวงวัสดุ พ.ศ. 2566) ที่ built-in
    """
    if not file.filename.lower().endswith('.ifc'):
        raise HTTPException(status_code=400, detail="IFC file must have .ifc extension")

    temp_ifc = _save_upload(file, '.ifc')
    temp_ids_path = None
    try:
        try:
            model = ifcopenshell.open(temp_ifc)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse IFC file: {e}")

        # Resolve IDS
        if ids_file is not None:
            fname = ids_file.filename or ''
            if not (fname.lower().endswith('.ids') or fname.lower().endswith('.xml')):
                raise HTTPException(status_code=400, detail="IDS file must have .ids or .xml extension")
            temp_ids_path = _save_upload(ids_file, '.ids')
            ids_path = temp_ids_path
            ids_label = ids_file.filename
        else:
            ids_path = os.path.join(os.path.dirname(__file__), "rules", "mr2566_materials.ids")
            ids_label = "mr2566_materials.ids (กฎกระทรวงวัสดุ พ.ศ. 2566)"
            if not os.path.exists(ids_path):
                raise HTTPException(status_code=500, detail="Built-in IDS rules file not found on server")

        try:
            my_ids = ids.open(ids_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse IDS file: {e}")

        my_ids.validate(model)
        raw_report = reporter.Json(my_ids).report()
        report_dict = json.loads(json.dumps(raw_report, default=str))

        project_name = "Unknown"
        projects = model.by_type("IfcProject")
        if projects:
            project_name = projects[0].Name or "Unknown"

        specs = report_dict.get("specifications", [])
        total_pass = sum(1 for s in specs if s.get("status") is True)
        total_fail = sum(1 for s in specs if s.get("status") is False)

        return JSONResponse(content={
            "project_name": project_name,
            "ids_file_used": ids_label,
            "status": total_fail == 0,
            "passed_requirements": total_pass,
            "failed_requirements": total_fail,
            "details": [
                {
                    "name": s.get("name", "Unnamed"),
                    "description": s.get("description", ""),
                    "status": s.get("status"),
                }
                for s in specs
            ],
            "validation_results": report_dict,
        })

    finally:
        if os.path.exists(temp_ifc):
            os.remove(temp_ifc)
        if temp_ids_path and os.path.exists(temp_ids_path):
            os.remove(temp_ids_path)


@app.post("/building-summary")
async def building_summary(file: UploadFile = File(...)):
    """
    สรุปภาพรวม Building Elements โดยไม่ประมวลผล Geometry
    เร็วกว่า /extract-foundation มาก เหมาะสำหรับ quick preview\n
    ส่งคืน: จำนวน elements แต่ละประเภท, ชั้น (IfcBuildingStorey),
    ห้อง (IfcSpace) พร้อมพื้นที่, วัสดุทั้งหมด, IFC schema version
    """
    if not file.filename.lower().endswith('.ifc'):
        raise HTTPException(status_code=400, detail="File must be an .ifc file")

    temp_path = _save_upload(file, '.ifc')
    try:
        try:
            model = ifcopenshell.open(temp_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse IFC file: {e}")

        # Project info
        project_name = "Unknown"
        projects = model.by_type("IfcProject")
        if projects:
            project_name = projects[0].Name or "Unknown"

        site_name = None
        sites = model.by_type("IfcSite")
        if sites:
            site_name = sites[0].Name

        building_name = None
        buildings = model.by_type("IfcBuilding")
        if buildings:
            building_name = buildings[0].Name

        # Storeys
        storeys = []
        for storey in model.by_type("IfcBuildingStorey"):
            elevation = getattr(storey, 'Elevation', None)
            storeys.append({
                "name": storey.Name or "Unnamed",
                "elevation_m": round(float(elevation), 3) if elevation is not None else None,
            })

        # Element counts
        ELEMENT_TYPES = [
            "IfcWall", "IfcWallStandardCase",
            "IfcColumn", "IfcBeam", "IfcSlab",
            "IfcDoor", "IfcWindow",
            "IfcStair", "IfcRamp",
            "IfcFooting", "IfcPile",
            "IfcSpace", "IfcZone",
            "IfcRoof", "IfcCovering",
            "IfcOpeningElement",
        ]
        element_counts = {
            t: len(model.by_type(t))
            for t in ELEMENT_TYPES
            if len(model.by_type(t)) > 0
        }

        # Materials
        materials = sorted({
            mat.Name
            for mat in model.by_type("IfcMaterial")
            if mat.Name
        })

        # Spaces with area
        spaces = []
        for space in model.by_type("IfcSpace"):
            psets = ifcopenshell.util.element.get_psets(space)
            area = (
                psets.get("Qto_SpaceBaseQuantities", {}).get("NetFloorArea")
                or psets.get("Pset_SpaceCommon", {}).get("NetFloorArea")
            )
            spaces.append({
                "name": space.Name or "Unnamed",
                "long_name": getattr(space, 'LongName', None),
                "net_floor_area_m2": round(float(area), 2) if area else None,
            })

        total_floor_area = sum(
            s["net_floor_area_m2"] for s in spaces if s["net_floor_area_m2"] is not None
        )

        return JSONResponse(content={
            "project_name": project_name,
            "site_name": site_name,
            "building_name": building_name,
            "schema": model.schema,
            "storey_count": len(storeys),
            "storeys": storeys,
            "element_counts": element_counts,
            "materials": materials,
            "space_count": len(spaces),
            "spaces": spaces,
            "total_floor_area_m2": round(total_floor_area, 2),
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=traceback.format_exc())
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
