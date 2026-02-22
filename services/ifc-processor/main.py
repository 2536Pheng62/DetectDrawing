from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import ifcopenshell
import ifcopenshell.geom
from ifctester import ids, reporter
import tempfile
import os
import math
import json

app = FastAPI(title="ARC IFC Processor", description="Microservice for extracting foundation parameters and validating rules using IfcOpenShell and IfcTester.")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ifc-processor"}

@app.post("/validate-rules")
async def validate_rules(file: UploadFile = File(...)):
    """
    รับไฟล์ IFC และตรวจสอบกฎหมายด้วย IfcTester (IDS)
    ตัวอย่างนี้ใช้กฎกระทรวงวัสดุ พ.ศ. 2566 (mr2566_materials.ids)
    """
    if not file.filename.lower().endswith('.ifc'):
        raise HTTPException(status_code=400, detail="File must be an .ifc file")

    # Save uploaded IFC file to a temporary location
    fd_ifc, temp_ifc_path = tempfile.mkstemp(suffix='.ifc')
    try:
        with os.fdopen(fd_ifc, 'wb') as f:
            content = await file.read()
            f.write(content)
        
        # Load IFC model
        try:
            my_ifc = ifcopenshell.open(temp_ifc_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse IFC file: {str(e)}")

        # Load IDS rules (กฎกระทรวง พ.ศ. 2566)
        ids_path = os.path.join(os.path.dirname(__file__), "rules", "mr2566_materials.ids")
        if not os.path.exists(ids_path):
            raise HTTPException(status_code=500, detail="IDS rules file not found on server")
            
        my_ids = ids.open(ids_path)

        # Validate IFC against IDS
        my_ids.validate(my_ifc)

        # Generate JSON Report
        # IfcTester reporter can output to dictionary
        report_dict = reporter.Json(my_ids).report()
        
        # Parse the JSON string returned by reporter.Json().report() into a dict
        # Use json.dumps with default=str to handle non-serializable objects like Restriction
        report_dict = json.loads(json.dumps(report_dict, default=str))

        return JSONResponse(content={
            "project_name": my_ifc.by_type("IfcProject")[0].Name if my_ifc.by_type("IfcProject") else "Unknown",
            "validation_results": report_dict
        })

    finally:
        # Clean up temp file
        if os.path.exists(temp_ifc_path):
            os.remove(temp_ifc_path)

@app.post("/extract-foundation")
async def extract_foundation(file: UploadFile = File(...)):
    """
    รับไฟล์ IFC และสกัดข้อมูลฐานราก (IfcFooting) และเสาเข็ม (IfcPile)
    รวมถึงการคำนวณเรขาคณิตเบื้องต้น (กว้าง, ยาว, หนา, ความยาวเสาเข็ม)
    """
    if not file.filename.lower().endswith('.ifc'):
        raise HTTPException(status_code=400, detail="File must be an .ifc file")

    # Save uploaded file to a temporary location
    fd, temp_path = tempfile.mkstemp(suffix='.ifc')
    try:
        with os.fdopen(fd, 'wb') as f:
            content = await file.read()
            f.write(content)
        
        # Load IFC model
        try:
            model = ifcopenshell.open(temp_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse IFC file: {str(e)}")

        # Initialize geometry settings (OpenCASCADE)
        settings = ifcopenshell.geom.settings()
        settings.set(settings.USE_PYTHON_OPENCASCADE, True)

        results = {
            "project_name": model.by_type("IfcProject")[0].Name if model.by_type("IfcProject") else "Unknown",
            "foundations": [],
            "piles": []
        }

        # 1. Extract Foundations (IfcFooting)
        footings = model.by_type("IfcFooting")
        for footing in footings:
            footing_data = {
                "id": footing.GlobalId,
                "name": footing.Name or "Unnamed Footing",
                "type": footing.PredefinedType if hasattr(footing, 'PredefinedType') else "UNKNOWN",
                "dimensions": extract_bounding_box(footing, settings)
            }
            results["foundations"].append(footing_data)

        # 2. Extract Piles (IfcPile)
        piles = model.by_type("IfcPile")
        for pile in piles:
            pile_data = {
                "id": pile.GlobalId,
                "name": pile.Name or "Unnamed Pile",
                "type": pile.PredefinedType if hasattr(pile, 'PredefinedType') else "UNKNOWN",
                "dimensions": extract_bounding_box(pile, settings)
            }
            results["piles"].append(pile_data)

        return JSONResponse(content=results)

    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

def extract_bounding_box(element, settings):
    """
    ใช้ OpenCASCADE คำนวณ Bounding Box ของ Object เพื่อหา กว้าง, ยาว, หนา (ความสูง)
    """
    try:
        # Create geometry
        shape = ifcopenshell.geom.create_shape(settings, element)
        
        # Get bounding box from OpenCASCADE TopoDS_Shape
        # Note: This is a simplified AABB (Axis-Aligned Bounding Box) extraction
        # For exact dimensions of rotated elements, OBB (Oriented Bounding Box) is needed
        verts = shape.geometry.verts
        
        if not verts or len(verts) < 3:
            return None
            
        # verts is a flat tuple of (x,y,z, x,y,z, ...)
        xs = [verts[i] for i in range(0, len(verts), 3)]
        ys = [verts[i+1] for i in range(0, len(verts), 3)]
        zs = [verts[i+2] for i in range(0, len(verts), 3)]
        
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        min_z, max_z = min(zs), max(zs)
        
        width = abs(max_x - min_x)
        length = abs(max_y - min_y)
        height = abs(max_z - min_z) # Thickness for footing, Length for pile
        
        return {
            "width_m": round(width, 3),
            "length_m": round(length, 3),
            "height_m": round(height, 3) # ความหนาฐานราก หรือ ความยาวเสาเข็ม
        }
    except Exception as e:
        print(f"Error extracting geometry for {element.GlobalId}: {e}")
        return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
