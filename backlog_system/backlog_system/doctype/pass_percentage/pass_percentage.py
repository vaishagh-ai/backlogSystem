# Copyright (c) 2026, Administrator and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class PassPercentage(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		academic_year: DF.Data
		avg_pass_percentage: DF.Float
		nba_score: DF.Int
		pass_percentage: DF.Float
		total_appeared: DF.Int
		total_passed: DF.Int
	# end: auto-generated types

	pass
