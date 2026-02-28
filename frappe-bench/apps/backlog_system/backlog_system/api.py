import frappe
import json
import re

def derive_batch(register_no):
    """Derives Admission Year and Batch from a register number."""
    if not register_no:
        return None, None
    reg_str = str(register_no)
    numbers = str(re.sub(r'\D', '', reg_str))
    if len(numbers) >= 2:
        try:
            first_two = str(numbers[0]) + str(numbers[1])
            admission_year = 2000 + int(first_two)
            batch = f"{admission_year}-{admission_year + 4}"
            return batch, admission_year
        except Exception:
            return None, None
    return None, None

def convert_grade_to_status(grade):
    """Grade 'F' is Fail, anything else is Pass."""
    if not grade:
        return None
    if grade.strip().upper() == "F":
        return "Fail"
    return "Pass"

def process_student_result(doc, method):
    batch, admission_year = derive_batch(doc.register_no)
    if batch and admission_year:
        doc.batch = batch
        doc.admission_year = admission_year
    status = convert_grade_to_status(doc.grade)
    if status:
        doc.status = status

@frappe.whitelist()
def get_branches():
    """Returns all unique branch names stored in Student Result records."""
    rows = frappe.db.sql(
        "SELECT DISTINCT branch FROM `tabStudent Result` WHERE branch IS NOT NULL AND branch != '' ORDER BY branch",
        as_dict=True
    )
    return [r.branch for r in rows]

@frappe.whitelist()
def test_ping():
    return "Pong"

@frappe.whitelist()
def upload_results(csv_data: str, semester: str, exam_year: str):
    import csv
    from io import StringIO

    f = StringIO(csv_data)
    reader = csv.DictReader(f)

    count = 0
    for row in reader:
        keys = list(row.keys())
        reg_key = next((k for k in keys if "register" in k.lower()), None)
        branch_key = next((k for k in keys if "branch" in k.lower() or "department" in k.lower()), None)
        course_key = next((k for k in keys if "course" in k.lower()), None)
        grade_key = next((k for k in keys if "grade" in k.lower()), None)

        if not reg_key: reg_key = "Register No"
        if not branch_key: branch_key = "Branch"
        if not course_key: course_key = "Course Code"
        if not grade_key: grade_key = "Grade"

        if not row.get(reg_key):
            continue

        doc = frappe.get_doc({
            "doctype": "Student Result",
            "register_no": row.get(reg_key),
            "branch": row.get(branch_key),
            "course_code": row.get(course_key),
            "grade": row.get(grade_key),
            "semester": semester,
            "exam_year": exam_year
        })
        doc.insert(ignore_permissions=True)
        count += 1

    frappe.db.commit()
    return {"status": "success", "inserted": count}

class StudentData:
    def __init__(self):
        self.semesters = set()
        self.has_fail = False

def calculate_batch_metrics(department):
    filters = {}
    # Rule: Department filtering must occur BEFORE any calculation
    if department and department != "All":
        filters["branch"] = department

    results = frappe.get_all("Student Result",
        filters=filters,
        fields=["register_no", "batch", "semester", "status"]
    )

    # Group by Batch explicitly so batches don't mix
    batches = {}
    for r in results:
        b = str(r.batch) if r.batch else ""
        if not b: continue
        if b not in batches:
            batches[b] = {}

        reg = str(r.register_no) if r.register_no else ""
        if not reg: continue

        if reg not in batches[b]:
            batches[b][reg] = StudentData()

        batches[b][reg].semesters.add(str(r.semester))
        if str(r.status) == "Fail":
            batches[b][reg].has_fail = True

    table_data = []

    for batch_name in sorted(list(batches.keys()), reverse=True):
        students = batches[batch_name]

        # Rule: Cohort Size = unique students in that batch
        cohort_size = len(students)
        if cohort_size == 0:
            continue

        all_sems_in_batch = set()
        for s in students.values():
            all_sems_in_batch.update(s.semesters)

        uploaded_sems_count = len(all_sems_in_batch)

        # Rule: Final only if exactly 8 unique semesters
        is_final = (uploaded_sems_count == 8)

        no_backlog_count = 0
        for s in students.values():
            # Rule: Any Fail = excluded
            if s.has_fail:
                continue
            # Rule: Missing semester data != Pass
            student_sem_count = len(s.semesters)
            if is_final:
                if student_sem_count != 8:
                    continue
            else:
                if student_sem_count != uploaded_sems_count:
                    continue
            no_backlog_count += 1

        si = float(no_backlog_count) / float(cohort_size) if cohort_size > 0 else 0.0

        table_data.append({
            "batch": batch_name,
            "uploaded_semesters": uploaded_sems_count,
            "cohort_size": cohort_size,
            "no_backlog": no_backlog_count,
            "success_index": round(si, 2),
            "status": "Final" if is_final else "Provisional"
        })

    return table_data

def calculate_average_si(table_data):
    final_batches = [b for b in table_data if b.get("status") == "Final"]
    if len(final_batches) >= 3:
        target_batches = [final_batches[0], final_batches[1], final_batches[2]]
    elif len(table_data) >= 3:
        target_batches = [table_data[0], table_data[1], table_data[2]]
    else:
        target_batches = list(table_data)

    if not target_batches:
        return 0.0

    avg_si = sum(float(b.get("success_index", 0.0)) for b in target_batches) / float(len(target_batches))
    return round(avg_si, 2)

def calculate_success_rate(avg_si):
    return round(25.0 * avg_si, 2)

@frappe.whitelist()
def get_table_421(department: str):
    table_data = calculate_batch_metrics(department)
    avg_si = calculate_average_si(table_data)
    success_rate = calculate_success_rate(avg_si)

    return {
        "table": table_data,
        "avg_si": avg_si,
        "success_rate": success_rate
    }
