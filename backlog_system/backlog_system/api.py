"""Backlog System API - re-exports from main api for Faculty Dashboard."""
# Faculty Dashboard calls backlog_system.backlog_system.api - this module.
# The full implementation lives in backlog_system.api
from backlog_system.api import (
    get_dashboard_metrics,
    parse_result_pdf,
    get_result_csv,
    insert_student_results,
    parse_table_4_1_pdf,
    parse_table_4_2_pdf,
    parse_table_4_2_1_pdf,
)

__all__ = [
    "get_dashboard_metrics",
    "parse_result_pdf",
    "get_result_csv",
    "insert_student_results",
    "parse_table_4_1_pdf",
    "parse_table_4_2_pdf",
    "parse_table_4_2_1_pdf",
    "save_students",
    "download_csv",
]

import json
import io
import csv
import frappe


@frappe.whitelist()
def save_students(data):

    students = json.loads(data)

    for s in students:

        if frappe.db.exists("Student Record", s["register_no"]):
            continue

        doc = frappe.get_doc({
            "doctype": "Student Record",
            "register_no": s["register_no"],
            "total_subjects": s["total_subjects"],
            "total_fails": s["total_fails"],
            "status": s["status"]
        })

        doc.insert(ignore_permissions=True)

    return "Saved Successfully"


@frappe.whitelist()
def download_csv(data):

    students = json.loads(data)

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Register No", "Total Subjects", "Total Fails", "Status"])

    for s in students:
        writer.writerow([
            s["register_no"],
            s["total_subjects"],
            s["total_fails"],
            s["status"]
        ])

    frappe.response.filename = "result_preview.csv"
    frappe.response.filecontent = output.getvalue()
    frappe.response.type = "download"
