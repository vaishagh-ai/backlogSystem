# Copyright (c) 2026, Administrator and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class StudentRecord(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from backlog_system.backlog_system.doctype.student_subject.student_subject import StudentSubject
		from frappe.types import DF

		batch: DF.Data | None
		branch: DF.Data | None
		register_no: DF.Data
		semester: DF.Int
		status: DF.Literal["PASS", "FAIL", "DROPPED"]
		subjects: DF.Table[StudentSubject]
		total_fails: DF.Int
		total_subjects: DF.Int
	# end: auto-generated types

	pass
