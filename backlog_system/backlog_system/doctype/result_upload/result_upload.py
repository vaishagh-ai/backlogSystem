# Copyright (c) 2026, Administrator and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class ResultUpload(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		batch: DF.Data
		branch: DF.Data
		processed: DF.Check
		result_pdf: DF.Attach
		semester: DF.Int
	# end: auto-generated types

	pass
