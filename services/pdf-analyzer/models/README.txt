# Place trained YOLO model weights here (.pt files)
#
# Expected filename:  floorplan_symbols.pt
# Override via env:   SYMBOL_MODEL_PATH=/app/models/your_model.pt
#
# Training dataset: สัญลักษณ์ทางสถาปัตยกรรม (ไทย)
#   Classes:  toilet, urinal, door, door_swing, window,
#             stair, column, elevator, fire_exit, sink
#
# Model files are excluded from git (.gitignore: *.pt)
# Download / mount via Docker volume in production.
