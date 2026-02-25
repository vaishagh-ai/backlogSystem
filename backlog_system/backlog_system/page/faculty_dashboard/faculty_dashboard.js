frappe.pages['faculty-dashboard'].on_page_load = function(wrapper) {
  var page = frappe.ui.make_app_page({
    parent: wrapper,
    title: 'Faculty Dashboard',
    single_column: true
  });

  const html = `
<div class="faculty-dashboard">
  <div class="page-header" style="background: #1e3a5f; color: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
    <h2 style="margin: 0;">Faculty Command Center</h2>
    <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">B.Tech. Computer Science & Engineering · NBA Accreditation Portal</p>
    <div style="margin-top: 1rem;">
      <label>Department: </label>
      <select id="department-filter" class="form-control" style="display: inline-block; width: 250px;">
        <option value="">All Departments</option>
        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
        <option value="Electronics & Communication">Electronics & Communication</option>
        <option value="Electrical & Electronics">Electrical & Electronics</option>
        <option value="Mechanical">Mechanical</option>
      </select>
      <span style="margin-left: 1rem; background: #2d4a6f; padding: 0.5rem 1rem; border-radius: 4px;">Sanctioned Intake: <strong id="sanctioned-intake">60</strong></span>
    </div>
  </div>

  <div class="row">
    <div class="col-sm-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Enrollment Strength (3-YR AVG)</h5>
          <p class="card-value" id="enrollment-avg" style="font-size: 1.5rem;">0 (112%)</p>
          <small class="text-success" id="enrollment-status">Above NBA threshold · Score 20/20</small>
        </div>
      </div>
    </div>
    <div class="col-sm-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Academic Success Index</h5>
          <p class="card-value" id="success-index" style="font-size: 1.5rem;">0</p>
          <small>2018-2024 cohorts · Without backlog</small>
        </div>
      </div>
    </div>
    <div class="col-sm-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">NBA Success Rate</h5>
          <p class="card-value text-success" id="nba-rate" style="font-size: 1.5rem;">8.5%</p>
          <small>25 × Avg Success Index</small>
        </div>
      </div>
    </div>
  </div>

  <div class="card mt-4">
    <div class="card-body">
      <h5>Upload Result PDFs</h5>
      <p>Drag & drop or click to upload semester results, grade sheets, or NBA documents. Data will be converted to CSV for preview.</p>
      <div class="row">
        <div class="col-md-3">
          <select class="form-control" id="batch">
            <option value="">Select Batch</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-control" id="semester">
            <option value="">Select Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>
        </div>
        <div class="col-md-4">
          <div id="pdf-upload-area" class="upload-area" style="border: 2px dashed #ddd; padding: 1rem; min-height: 40px;"></div>
          <button class="btn btn-primary mt-2" id="process-pdf">Process PDF</button>
        </div>
      </div>
    </div>
  </div>

  <div class="card mt-4">
    <div class="card-body">
      <h5>Upload NBA Table PDFs (Table 4.1, 4.2, 4.2.1)</h5>
      <p class="text-muted">Upload estimation/enrollment, progression, or success rate PDFs to populate dashboard tables.</p>
      <div class="row">
        <div class="col-md-4">
          <div id="table-4-1-upload" class="upload-area" style="border: 1px dashed #ccc; padding: 0.5rem; min-height: 36px;"></div>
          <button class="btn btn-outline-primary btn-sm mt-1" id="parse-table-4-1">Parse Table 4.1 (Enrollment)</button>
        </div>
        <div class="col-md-4">
          <div id="table-4-2-upload" class="upload-area" style="border: 1px dashed #ccc; padding: 0.5rem; min-height: 36px;"></div>
          <button class="btn btn-outline-primary btn-sm mt-1" id="parse-table-4-2">Parse Table 4.2 (Progression)</button>
        </div>
        <div class="col-md-4">
          <div id="table-4-2-1-upload" class="upload-area" style="border: 1px dashed #ccc; padding: 0.5rem; min-height: 36px;"></div>
          <button class="btn btn-outline-primary btn-sm mt-1" id="parse-table-4-2-1">Parse Table 4.2.1 (Success Rate)</button>
        </div>
      </div>
    </div>
  </div>

  <div id="preview-section" class="card mt-4" style="display: none;">
    <div class="card-body">
      <h5>Preview Extracted Data (CSV)</h5>
      <p class="text-muted">Review the data below before saving. Click "Download CSV" to export or "Confirm & Upload" to store in database.</p>
      <div id="preview-table" class="table-responsive" style="max-height: 300px; overflow-y: auto;"></div>
      <div class="mt-2">
        <button class="btn btn-outline-primary" id="download-csv">Download CSV</button>
        <button class="btn btn-success" id="confirm-upload">Confirm & Upload to Database</button>
      </div>
    </div>
  </div>

  <div class="card mt-4">
    <div class="card-body">
      <h5>Cohort Strength & Lateral Entry Analysis</h5>
      <p class="text-muted">First-year enrollment (N1) and lateral entry (N2) trends over the past 8 years</p>
      <div id="cohort-table"></div>
    </div>
  </div>

  <div class="card mt-4">
    <div class="card-body">
      <h5>Graduation Success Index</h5>
      <p class="text-muted">Students graduating without any backlog - Success Index (SI) = Graduated / Admitted</p>
      <div id="graduation-table"></div>
      <div class="mt-2">
        <strong>Average Success Index: </strong><span id="avg-si">0.34</span> &nbsp;
        <strong>NBA Success Rate: </strong><span id="nba-rate-summary" class="text-success">8.5%</span>
      </div>
    </div>
  </div>

  <div class="card mt-4">
    <div class="card-body">
      <h5>Academic Progression Tracker</h5>
      <p class="text-muted">Students progressing without backlog through each year of study</p>
      <div id="progression-table"></div>
    </div>
  </div>
</div>`;

  // Use page.main - make_app_page provides the main content container
  $(page.main).html(html);

  let current_file = null;
  let extracted_data = null;
  let table_4_1_file = null;
  let table_4_2_file = null;
  let table_4_2_1_file = null;

  // NBA Table uploaders - use wrapper to render inline (no popup on load)
  new frappe.ui.FileUploader({ wrapper: $('#table-4-1-upload')[0], folder: 'Home', restrictions: { allowed_file_types: ['.pdf'] }, on_success: (f) => { table_4_1_file = f; } });
  new frappe.ui.FileUploader({ wrapper: $('#table-4-2-upload')[0], folder: 'Home', restrictions: { allowed_file_types: ['.pdf'] }, on_success: (f) => { table_4_2_file = f; } });
  new frappe.ui.FileUploader({ wrapper: $('#table-4-2-1-upload')[0], folder: 'Home', restrictions: { allowed_file_types: ['.pdf'] }, on_success: (f) => { table_4_2_1_file = f; } });

  const dept = () => $('#department-filter').val() || 'Computer Science & Engineering';
  $('#parse-table-4-1').click(() => {
    if (!table_4_1_file) { frappe.msgprint(__('Upload Table 4.1 PDF first.')); return; }
    frappe.call({ method: 'backlog_system.backlog_system.api.parse_table_4_1_pdf', args: { file_url: table_4_1_file.file_url, department: dept() }, callback: (r) => { if (r.message) frappe.msgprint(r.message.message || 'Done'); loadDashboardMetrics(); } });
  });
  $('#parse-table-4-2').click(() => {
    if (!table_4_2_file) { frappe.msgprint(__('Upload Table 4.2 PDF first.')); return; }
    frappe.call({ method: 'backlog_system.backlog_system.api.parse_table_4_2_pdf', args: { file_url: table_4_2_file.file_url, department: dept() }, callback: (r) => { if (r.message) frappe.msgprint(r.message.message || 'Done'); loadDashboardMetrics(); } });
  });
  $('#parse-table-4-2-1').click(() => {
    if (!table_4_2_1_file) { frappe.msgprint(__('Upload Table 4.2.1 PDF first.')); return; }
    frappe.call({ method: 'backlog_system.backlog_system.api.parse_table_4_2_1_pdf', args: { file_url: table_4_2_1_file.file_url, department: dept() }, callback: (r) => { if (r.message) frappe.msgprint(r.message.message || 'Done'); loadDashboardMetrics(); } });
  });

  // Initialize file uploader for S3 Result - use wrapper to render inline (no popup on load)
  new frappe.ui.FileUploader({
    wrapper: $('#pdf-upload-area')[0],
    folder: 'Home',
    restrictions: { allowed_file_types: ['.pdf'] },
    on_success: (file_doc) => {
      current_file = file_doc;
      frappe.msgprint(__('PDF uploaded: ') + file_doc.file_name);
    }
  });

  $('#process-pdf').click(() => {
    if (!current_file) {
      frappe.msgprint(__('Please upload a PDF first.'));
      return;
    }
    const batch = $('#batch').val();
    const semester = $('#semester').val();
    if (!batch || !semester) {
      frappe.msgprint(__('Please select batch and semester.'));
      return;
    }

    frappe.call({
      method: 'backlog_system.backlog_system.api.parse_result_pdf',
      args: {
        file_url: current_file.file_url,
        batch: batch,
        semester: semester
      },
      callback: (r) => {
        if (r.message) {
          extracted_data = r.message;
          showPreview(extracted_data);
        }
      },
      error: (err) => {
        console.error(err);
        frappe.msgprint(__('Error processing PDF. Check console.'));
      }
    });
  });

  function showPreview(data) {
    if (!data || !data.results) return;
    const results = data.results;
    let tableHtml = '<table class="table table-bordered table-sm"><thead><tr><th>Register No</th><th>Branch</th><th>Courses (Code: Grade)</th></tr></thead><tbody>';
    results.slice(0, 20).forEach(item => {
      const courses = (item.courses || []).map(c => `${c.course_code}(${c.grade})`).join(', ');
      tableHtml += `<tr><td>${item.register_no}</td><td>${item.branch || '-'}</td><td>${courses}</td></tr>`;
    });
    if (results.length > 20) {
      tableHtml += `<tr><td colspan="3">... and ${results.length - 20} more rows</td></tr>`;
    }
    tableHtml += '</tbody></table>';
    $('#preview-table').html(tableHtml);
    $('#preview-section').show();
  }

  $('#download-csv').click(() => {
    if (!extracted_data || !extracted_data.results) return;
    frappe.call({
      method: 'backlog_system.backlog_system.api.get_result_csv',
      args: { data: JSON.stringify(extracted_data.results) },
      callback: (r) => {
        if (r.message && r.message.csv) {
          const blob = new Blob([r.message.csv], { type: 'text/csv' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'result_preview.csv';
          a.click();
        }
      }
    });
  });

  $('#confirm-upload').click(() => {
    if (!extracted_data || !extracted_data.results) return;
    const batch = $('#batch').val();
    const semester = $('#semester').val();
    frappe.call({
      method: 'backlog_system.backlog_system.api.insert_student_results',
      args: {
        data: JSON.stringify(extracted_data.results),
        batch: batch,
        semester: semester
      },
      callback: (r) => {
        if (r.message) {
          frappe.msgprint(__('Uploaded {0} records. Errors: {1}', [r.message.success, (r.message.errors || []).length]));
          loadDashboardMetrics();
          $('#preview-section').hide();
          extracted_data = null;
        }
      }
    });
  });

  $('#department-filter').on('change', () => loadDashboardMetrics());

  function loadDashboardMetrics() {
    const department = $('#department-filter').val() || '';
    frappe.call({
      method: 'backlog_system.backlog_system.api.get_dashboard_metrics',
      args: { department: department },
      callback: (r) => {
        if (r.message) {
          const m = r.message;
          $('#enrollment-avg').text((m.enrollment_avg || 0) + ' (' + (m.enrollment_percent || 0) + '%)');
          $('#success-index').text(m.success_index || 0);
          $('#nba-rate').text((m.nba_rate || 0) + '%');
          $('#nba-rate-summary').text((m.nba_rate || 0) + '%');
          $('#avg-si').text(m.success_index || 0);
          if (m.sanctioned_intake) $('#sanctioned-intake').text(m.sanctioned_intake);
          renderCohortTable(m.cohort_data || []);
          renderGraduationTable(m.graduation_data || []);
          renderProgressionTable(m.progression_data || []);
        }
      }
    });
  }

  function renderCohortTable(data) {
    if (!data.length) {
      $('#cohort-table').html('<p class="text-muted">No cohort data. Upload Table 4.1 PDF or enter Enrollment Data.</p>');
      return;
    }
    let html = '<table class="table table-bordered"><thead><tr><th>Academic Year</th><th>First Year Strength</th><th>Lateral Entries</th><th>Total Cohort</th><th>Growth Trend</th></tr></thead><tbody>';
    data.forEach((row, i) => {
      const n1 = row.first_year_admitted ?? row.n1 ?? 0;
      const n2 = row.lateral_entry ?? row.n2 ?? 0;
      const total = row.total_admitted ?? (n1 + n2);
      let trend = row.growth_trend || '-';
      html += `<tr><td>${row.academic_year || row.name}</td><td>${n1}</td><td>${n2}</td><td>${total}</td><td>${trend}</td></tr>`;
    });
    html += '</tbody></table>';
    $('#cohort-table').html(html);
  }

  function renderGraduationTable(data) {
    if (!data.length) {
      $('#graduation-table').html('<p class="text-muted">No graduation data. Upload Table 4.2.1 PDF.</p>');
      return;
    }
    let html = '<table class="table table-bordered"><thead><tr><th>Batch</th><th>Cohort Size</th><th>Graduated (No Backlog)</th><th>Success Index</th><th>Performance</th></tr></thead><tbody>';
    data.forEach(row => {
      const si = row.success_index || 0;
      let perf = 'Moderate';
      if (si >= 0.5) perf = 'Excellent';
      else if (si < 0.3) perf = 'Needs Improvement';
      const perfClass = si >= 0.5 ? 'success' : (si < 0.3 ? 'danger' : 'warning');
      html += `<tr><td>${row.batch || ''}</td><td>${row.cohort_size || 0}</td><td>${row.graduated || 0}</td><td>${si}</td><td><span class="badge badge-${perfClass}">${perf}</span></td></tr>`;
    });
    html += '</tbody></table>';
    $('#graduation-table').html(html);
  }

  function renderProgressionTable(data) {
    if (!data.length) {
      $('#progression-table').html('<p class="text-muted">No progression data. Upload Table 4.2 PDF.</p>');
      return;
    }
    let html = '<table class="table table-bordered"><thead><tr><th>Batch</th><th>First Year</th><th>Second Year</th><th>Third Year</th><th>Final Year</th><th>Retention Trend</th></tr></thead><tbody>';
    data.forEach(row => {
      const trend = row.retention_trend || '-';
      html += `<tr><td>${row.batch || ''}</td><td>${row.first_year ?? '-'}</td><td>${row.second_year ?? '-'}</td><td>${row.third_year ?? '-'}</td><td>${row.final_year ?? '-'}</td><td>${trend}</td></tr>`;
    });
    html += '</tbody></table>';
    $('#progression-table').html(html);
  }

  loadDashboardMetrics();
};
