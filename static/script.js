// Sidebar and Page Navigation
function go(el, pageId) {
    // Update Sidebar UI
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    el.classList.add('active');

    // Update Header Title
    const label = el.querySelector('.nav-label').innerText;
    document.getElementById('current-page-title').innerText = label;

    // Change Page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');

    // Trigger page-specific loads if needed
    if (pageId === 'home') loadStats();
    if (pageId === 'todo') loadTodo();
    if (pageId === 'commitments') loadCommitments();
    if (pageId === 'digest') loadDigest();
    if (pageId === 'upload') loadMeetings();
    if (pageId === 'issues') loadIssues();
    if (pageId === 'profile') loadProfile();
}

function goPage(pageId) {
    const tab = Array.from(document.querySelectorAll('.nav-tab')).find(t =>
        t.getAttribute('onclick').includes(`'${pageId}'`)
    );
    if (tab) go(tab, pageId);
}

function goTodo(urgency) {
    goPage('todo');
    // If urgency filter is needed, could be implemented here
}

function drillDown(label, key) {
    // For now, redirect to relevant pages
    if (key === 'new_items' || key === 'new_commitments') goPage('commitments');
    else if (key === 'became_overdue') goPage('todo');
    else goPage('home');
}

// Data Fetching and UI Updates
async function loadStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();

        // Update Hero Stats
        document.querySelector('.hqs-num.red').innerText = data.critical_count || 0;
        document.querySelector('.hqs-num.amber').innerText = data.overdue_count || 0;
        document.querySelector('.hqs-num.blue').innerText = data.total_open || 0;
        document.querySelector('.hqs-num.green').innerText = (data.on_time_rate || 0) + '%';

        // Update Summary Counts in Cards
        const hc = document.getElementById('hero-critical-count');
        if (hc) hc.innerText = data.critical_count || 0;

        const hr = document.getElementById('hero-resolved-count');
        if (hr) hr.innerText = data.resolved_this_week || 0;

        // Update Date
        const now = new Date();
        document.getElementById('home-date-day').innerText = now.getDate();
        document.getElementById('home-date-full').innerText = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', weekday: 'long' });

        // Load Urgent items into the mini-list
        loadUrgentMini();

    } catch (e) { console.error("Stats load failed", e); }
}

async function loadUrgentMini() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        const container = document.getElementById('hero-urgent-list');
        if (!container) return;

        // We actually want /api/issues to get specific urgent items
        const resIssues = await fetch('/api/issues');
        const issues = await resIssues.json();

        const urgent = issues.filter(i => i.weight > 7).slice(0, 3);
        if (urgent.length === 0) {
            container.innerHTML = '<div class="mini-item">No urgent items today.</div>';
            return;
        }

        container.innerHTML = urgent.map(i => `
            <div class="mini-item">
                <div class="mini-title">${i.title || i.issue_type}</div>
                <div class="mini-meta">${i.ward_name} · ${i.status}</div>
            </div>
        `).join('');
    } catch (e) { console.error("Urgent mini load failed", e); }
}

async function loadProfile() {
    try {
        const res = await fetch('/api/profile');
        const data = await res.json();

        // Update Global UI
        const name = data.full_name || 'Shri Rajendra Kumar Verma';
        document.getElementById('top-user-name').innerText = name;
        document.getElementById('top-user-sub').innerText = `${data.designation || 'MLA'} · ${data.ward_name || 'Ward 42'}`;

        // Generate initials for avatar
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('sidebar-avatar').innerText = initials || '??';

        document.getElementById('hero-user-name').innerText = data.full_name || 'Shri Rajendra Kumar Verma';
        document.getElementById('hero-user-meta').innerText = `${data.designation} · ${data.ward_name} · ${data.party}`;

        // Fill Form
        document.getElementById('prof-name').value = data.full_name || '';
        document.getElementById('prof-party').value = data.party || '';
        document.getElementById('prof-designation').value = data.designation || 'MLA';
        document.getElementById('prof-term').value = data.term_start || '';
        document.getElementById('prof-email').value = data.email || '';
        document.getElementById('prof-contact').value = data.office_contact || '';
        document.getElementById('prof-ward-name').value = data.ward_name || '';
        document.getElementById('prof-state').value = data.state || '';
        document.getElementById('prof-district').value = data.district || '';
        document.getElementById('prof-wards-covered').value = data.total_wards || '';
        document.getElementById('prof-population').value = data.population || '';
        document.getElementById('prof-voters').value = data.voters || '';
        document.getElementById('prof-address').value = data.office_address || '';
        document.getElementById('prof-jd-day').value = data.jd_day || 'Monday';
        document.getElementById('prof-jd-time').value = data.jd_time || '';
        document.getElementById('prof-pa-name').value = data.pa_name || '';
        document.getElementById('prof-pa-contact').value = data.pa_contact || '';
        document.getElementById('prof-manager-name').value = data.manager_name || '';
        document.getElementById('prof-manager-contact').value = data.manager_contact || '';

    } catch (e) { console.error("Profile load failed", e); }
}

async function saveProfile() {
    const payload = {
        full_name: document.getElementById('prof-name').value,
        party: document.getElementById('prof-party').value,
        designation: document.getElementById('prof-designation').value,
        term_start: document.getElementById('prof-term').value,
        email: document.getElementById('prof-email').value,
        office_contact: document.getElementById('prof-contact').value,
        ward_name: document.getElementById('prof-ward-name').value,
        state: document.getElementById('prof-state').value,
        district: document.getElementById('prof-district').value,
        total_wards: document.getElementById('prof-wards-covered').value,
        population: document.getElementById('prof-population').value,
        voters: document.getElementById('prof-voters').value,
        office_address: document.getElementById('prof-address').value,
        jd_day: document.getElementById('prof-jd-day').value,
        jd_time: document.getElementById('prof-jd-time').value,
        pa_name: document.getElementById('prof-pa-name').value,
        pa_contact: document.getElementById('prof-pa-contact').value,
        manager_name: document.getElementById('prof-manager-name').value,
        manager_contact: document.getElementById('prof-manager-contact').value
    };

    const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        document.getElementById('prof-confirm').style.display = 'block';
        setTimeout(() => { document.getElementById('prof-confirm').style.display = 'none'; }, 3000);
        loadProfile();
    }
}

function toggleTrace() {
    const content = document.getElementById('trace-content');
    const arrow = document.querySelector('.trace-arrow');
    if (content.style.display === 'none') {
        content.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
}

async function loadIssues() {
    try {
        const res = await fetch('/api/issues');
        const data = await res.json();
        const container = document.getElementById('recent-complaints-list');
        if (!container) return;

        container.innerHTML = data.slice(0, 10).map(i => `
            <div class="issue-item">
                <div>
                    <div style="font-weight:600">${i.title || i.issue_type}</div>
                    <div style="font-size:12px; color:var(--ink-light)">${i.citizen_name} · ${i.ward_name} · ${new Date(i.created_at).toLocaleDateString()}</div>
                </div>
                <div class="badge ${i.weight > 7 ? 'red' : 'blue'}">${i.status}</div>
            </div>
        `).join('');
    } catch (e) { console.error("Issues load failed", e); }
}

async function loadTodo() {
    try {
        const res = await fetch('/api/issues');
        const data = await res.json();
        const container = document.getElementById('page-todo');
        if (!container) return;

        // Sort by weight
        const sorted = data.sort((a, b) => b.weight - a.weight);

        const stats = {
            total: sorted.length,
            critical: sorted.filter(i => i.weight > 8).length
        };

        document.getElementById('todo-stats-summary').innerText = `${stats.total} pending · ${stats.critical} critical`;

        const listHtml = sorted.map(i => `
            <div class="issue-item" style="margin-bottom:12px">
                <div style="flex-grow:1">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px">
                        <span class="badge ${i.weight > 8 ? 'red' : (i.weight > 5 ? 'amber' : 'blue')}">Weight: ${i.weight}</span>
                        <span style="font-weight:600">${i.title || i.issue_type}</span>
                    </div>
                    <div style="font-size:12px; color:var(--ink-light)">${i.ward_name} · Added ${new Date(i.created_at).toLocaleDateString()}</div>
                </div>
                <button class="icon-btn" onclick="alert('Analysis feature coming soon')">Action</button>
            </div>
        `).join('');

        const existingList = container.querySelector('.issue-list') || document.createElement('div');
        existingList.className = 'issue-list';
        existingList.style.marginTop = '24px';
        existingList.innerHTML = listHtml;

        // Remove the "Loading..." placeholder if it exists
        const placeholder = container.querySelector('div[style*="font-size:11px"]');
        if (placeholder) placeholder.remove();

        if (!container.querySelector('.issue-list')) {
            container.appendChild(existingList);
        }
    } catch (e) { console.error("Todo load failed", e); }
}

// Strategic Insights (AI Analysis)
async function sendSuggestionsFollowup() {
    const query = document.getElementById('sug-chat-input').value;
    if (!query) return;

    // For now, just re-run suggestions with the query as it appends/refines in the backend logic
    document.getElementById('sug-query').value = query;
    generateSuggestions(false);
    document.getElementById('sug-chat-input').value = '';
}

async function generateSuggestions(auto = false) {
    const query = document.getElementById('sug-query').value;
    const btn = document.getElementById(auto ? 'sug-auto-btn' : 'sug-gen-btn');
    const results = document.getElementById('sug-results');
    const traceContainer = document.getElementById('sug-trace-container');
    const traceContent = document.getElementById('trace-content');

    btn.disabled = true;
    btn.innerText = 'Analyzing...';
    results.style.display = 'none';
    traceContainer.style.display = 'block';
    traceContent.innerHTML = '<div class="trace-entry"><div class="trace-entry-step">Initializing Agent</div>Connecting to local knowledge base...</div>';

    try {
        const endpoint = auto ? '/api/suggestions/generate' : '/api/suggestions/query';
        const body = auto ? {} : { query };

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        // Populate Trace
        traceContent.innerHTML = data.trace.map(t => `
            <div class="trace-entry">
                <div class="trace-entry-step">${t.step}</div>
                ${t.thought}
            </div>
        `).join('');

        // Populate Results
        results.innerHTML = data.suggestions.map(s => `
            <div class="issue-item" style="flex-direction:column; align-items:flex-start; gap:12px">
                <div style="font-weight:700; font-size:16px; color:var(--ink)">${s.title}</div>
                <div style="font-size:14px; color:var(--ink-light); line-height:1.6">${s.content}</div>
                <div style="display:flex; gap:8px">
                    <span class="badge ai">Confidence: ${Math.round(s.confidence * 100)}%</span>
                    <span class="badge blue">${s.category}</span>
                </div>
            </div>
        `).join('');

        results.style.display = 'flex';
        document.getElementById('sug-followup-area').style.display = 'block';

    } catch (e) {
        console.error("Analysis failed", e);
        traceContent.innerHTML += '<div class="trace-entry" style="border-color:red">Error during analysis.</div>';
    } finally {
        btn.disabled = false;
        btn.innerText = auto ? 'Analyze on Own (Auto-Think)' : 'Analyze Focused Query';
    }
}

// Global UI Helper
function showToast(msg) {
    // Basic alert for now, could be a pretty toast
    alert(msg);
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadStats();
});
