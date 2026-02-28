frappe.pages['faculty_dashboard'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Faculty Dashboard',
        single_column: true
    });

    page.main.append(frappe.render_template('faculty_dashboard', {}));

    // Load dynamic branch options, then load analytics
    load_branches();

    function load_branches() {
        frappe.call({
            method: "backlog_system.api.get_branches",
            callback: function (r) {
                let branches = r.message || [];
                let formDept = $(wrapper).find('#form-dept');
                let filterDept = $(wrapper).find('#filter-dept');

                // Repopulate form upload dropdown
                formDept.empty();
                if (branches.length === 0) {
                    formDept.append('<option value="">-- No data yet --</option>');
                } else {
                    branches.forEach(b => formDept.append(`<option value="${b}">${b}</option>`));
                }

                // Repopulate filter dropdown
                filterDept.empty();
                filterDept.append('<option value="All">All Departments</option>');
                branches.forEach(b => filterDept.append(`<option value="${b}">${b}</option>`));

                load_analytics("All");
            }
        });
    }

    // File upload handler
    $(wrapper).find('#upload-form').on('submit', function (e) {
        e.preventDefault();
        let dept = $(wrapper).find('#form-dept').val();
        let sem = $(wrapper).find('#form-sem').val();
        let year = $(wrapper).find('#form-year').val();
        let file_input = $(wrapper).find('#form-file')[0];

        if (!file_input.files.length) {
            frappe.msgprint("Please select a file to upload.");
            return;
        }

        let file = file_input.files[0];
        let reader = new FileReader();

        reader.onload = function (evt) {
            let csvData = evt.target.result;
            frappe.call({
                method: "backlog_system.api.upload_results",
                args: {
                    csv_data: csvData,
                    semester: sem,
                    exam_year: year
                },
                callback: function (r) {
                    if (r.message && r.message.status === 'success') {
                        frappe.msgprint(`Successfully inserted ${r.message.inserted} records.`);
                        $(wrapper).find('#form-file').val('');
                        load_branches(); // refresh branches and analytics
                    }
                }
            });
        };
        reader.onerror = function () { frappe.msgprint("Error reading file"); };
        reader.readAsText(file);
    });

    // Department filter change
    $(wrapper).find('#filter-dept').on('change', function () {
        load_analytics($(this).val());
    });

    function load_analytics(department) {
        frappe.call({
            method: "backlog_system.api.get_table_421",
            args: { department: department },
            callback: function (r) {
                if (r.message) {
                    render_table(r.message);
                }
            }
        });
    }

    // Export to PDF handler (UI only)
    $(wrapper).find('#btn-export-pdf').on('click', function () {
        frappe.msgprint("<b>Export to PDF</b> feature is currently in development.<br><br><i>UI-only placeholder.</i>");
    });

    function render_table(data) {
        let tbody = $(wrapper).find('#table-body');
        tbody.empty();

        let statusContainer = $(wrapper).find('#status-container');
        let bannerProv = $(wrapper).find('#banner-provisional');
        let bannerFinal = $(wrapper).find('#banner-final');
        let badgeSems = $(wrapper).find('#badge-sems');

        if (!data.table || data.table.length === 0) {
            tbody.append('<tr><td colspan="6" class="text-muted py-4 text-center">No data available for selected department.</td></tr>');
            $(wrapper).find('#avg-si').text("0.00");
            $(wrapper).find('#success-rate').text("0.00");
            statusContainer.hide();
            return;
        }

        let maxUploadedSems = 0;

        data.table.forEach(row => {
            if (row.uploaded_semesters > maxUploadedSems) {
                maxUploadedSems = row.uploaded_semesters;
            }

            let row_class = row.status === 'Final' ? 'row-final' : 'row-prov';
            let html = `<tr class="${row_class}">
                <td class="text-left font-weight-bold">${row.batch}</td>
                <td><span class="badge ${row.uploaded_semesters === 8 ? 'badge-success' : 'badge-secondary'}">${row.uploaded_semesters} / 8</span></td>
                <td>${row.cohort_size}</td>
                <td>${row.no_backlog}</td>
                <td>${row.success_index}</td>
                <td><span class="badge ${row.status === 'Final' ? 'badge-success' : 'badge-warning'}">${row.status}</span></td>
            </tr>`;
            tbody.append(html);
        });

        // Banner Logic
        statusContainer.show();
        badgeSems.text(maxUploadedSems);
        if (maxUploadedSems === 8) {
            bannerProv.hide();
            bannerFinal.show();
        } else {
            bannerProv.show();
            bannerFinal.hide();
        }

        $(wrapper).find('#avg-si').text(data.avg_si.toFixed(2));
        $(wrapper).find('#success-rate').text(data.success_rate.toFixed(2));
    }
}
