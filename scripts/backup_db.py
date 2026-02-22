import os
import subprocess
from datetime import datetime
import sys

# Konfig สำหรับการเชื่อมต่อ Supabase (PostgreSQL)
# แนะนำให้ตั้งค่าผ่าน Environment Variables เพื่อความปลอดภัย
DB_URL = os.getenv('SUPABASE_DB_URL')  # รูปแบบ: postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
BACKUP_DIR = 'backups'

def backup_database():
    if not DB_URL:
        print("❌ Error: ไม่พบ SUPABASE_DB_URL ใน Environment Variables")
        sys.exit(1)

    # สร้างโฟลเดอร์สำหรับเก็บ Backup
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)

    # กำหนดชื่อไฟล์ตามเวลาปัจจุบัน
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = os.path.join(BACKUP_DIR, f'supabase_backup_{timestamp}.sql')

    print(f"⏳ เริ่มการสำรองข้อมูลไปยัง {backup_file}...")

    try:
        # ใช้คำสั่ง pg_dump เพื่อสำรองข้อมูล
        # -Fc คือรูปแบบ Custom Format (บีบอัดและยืดหยุ่นกว่า)
        result = subprocess.run(
            ['pg_dump', DB_URL, '-f', backup_file, '-Fc', '--no-owner', '--no-privileges'],
            check=True,
            capture_output=True,
            text=True
        )
        
        print(f"✅ สำรองข้อมูลเสร็จสมบูรณ์: {backup_file}")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ เกิดข้อผิดพลาดในการรัน pg_dump: {e.stderr}")
        sys.exit(1)
    except FileNotFoundError:
        print("❌ Error: ไม่พบคำสั่ง pg_dump กรุณาติดตั้ง PostgreSQL Client (pg_dump) บนเครื่อง")
        sys.exit(1)

if __name__ == "__main__":
    backup_database()
