# Copyright (c) 2026, Administrator and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class AcademicProgression(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		batch: DF.Data | None
		final_year: DF.Int
		first_year: DF.Int
		second_year: DF.Int
		third_year: DF.Int
	# end: auto-generated types

	pass
