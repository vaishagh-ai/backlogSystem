# Copyright (c) 2026, Administrator and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class EnrollmentData(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		academic_year: DF.Data | None
		avg_ratio: DF.Float
		enrollment_ratio: DF.Float
		n1: DF.Int
		n2: DF.Int
		n3: DF.Int
		nba_score: DF.Int
		sanctioned_intake: DF.Int
		total_admitted: DF.Int
	# end: auto-generated types

	pass
