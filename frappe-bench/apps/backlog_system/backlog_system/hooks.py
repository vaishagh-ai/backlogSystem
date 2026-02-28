# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "backlog_system"
app_title = "Backlog System"
app_publisher = "Admin"
app_description = "Student Backlog Management"
app_email = "admin@example.com"
app_license = "MIT"

doc_events = {
    "Student Result": {
        "before_save": "backlog_system.api.process_student_result"
    }
}

page_js = {"faculty_dashboard": "public/js/faculty_dashboard.js"}
