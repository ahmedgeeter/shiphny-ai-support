import sqlite3
conn = sqlite3.connect('shippny.db')
query = "SELECT s.tracking_number, c.email, c.full_name, c.phone FROM shipments s JOIN customers c ON s.customer_id = c.id WHERE s.tracking_number LIKE '%SHP-ZX-6759%';"
cursor = conn.cursor()
cursor.execute(query)
rows = cursor.fetchall()
for row in rows:
    print(row)
