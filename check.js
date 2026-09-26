



/* ========================================
   TaskHub Admin Panel
   å®Œæ•´ç‹¬ç«‹ç‰ˆæœ¬
   ======================================== */


/* ========================================
   Supabase
   ======================================== */

const SUPABASE_URL =
    "https://ddviqbyvyqgehuvbcobb.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_K3fsBawDXYUZy_eCa3lrrQ_crUgjQJL";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );



/* ========================================
   é¡µé¢åˆå§‹åŒ–
   ======================================== */

function updateSettingsLabels() {

    const isAdmin =
        currentAdminRole === "admin";

    const zh =
        I18N.get() === "zh";

    const label =
        document.getElementById(
            "contactLinkLabelText"
        );

    const hint =
        document.getElementById(
            "settingsHintText"
        );

    const sub =
        document.getElementById(
            "settingsSubText"
        );

    if (!label || !hint || !sub) {

        return;

    }

    if (isAdmin) {

        label.textContent =
            zh ? "ðŸ’¬ è”ç³»å®¢æœé“¾æŽ¥" : "ðŸ’¬ Contact Support Link";

        hint.textContent =
            zh
                ? "ä¿®æ”¹åŽï¼Œé¦–é¡µ / ä»»åŠ¡å¤§åŽ… / ä»ªè¡¨ç›˜å³ä¸‹è§’çš„è”ç³»å®¢æœæŒ‰é’®å°†è‡ªåŠ¨ä½¿ç”¨æ–°é“¾æŽ¥ã€‚"
                : "After saving, the support button on the homepage / task hall / dashboard will use this link.";

        sub.textContent =
            zh
                ? "ç®¡ç†å…¨ç«™é€šç”¨é…ç½®ï¼Œä¿å­˜åŽå¯¹æ‰€æœ‰é¡µé¢å³æ—¶ç”Ÿæ•ˆ"
                : "Manage global settings. Changes apply to all pages immediately.";

    } else {

        label.textContent =
            zh ? "ðŸ’¬ å›¢é˜Ÿå®¢æœé“¾æŽ¥" : "ðŸ’¬ Team Support Link";

        hint.textContent =
            zh
                ? "è®¾ç½®åŽï¼Œä½ åä¸‹æ‰€æœ‰ç”¨æˆ·çš„è”ç³»å®¢æœæŒ‰é’®å°†ä½¿ç”¨æ­¤é“¾æŽ¥ï¼›æœªç»‘å®šç”¨æˆ·ä»ä½¿ç”¨å…¨ç«™é“¾æŽ¥ã€‚"
                : "After saving, all users under your team will see this support link; unbound users still use the global link.";

        sub.textContent =
            zh
                ? "ç®¡ç†ä½ åä¸‹ç”¨æˆ·çš„è”ç³»å®¢æœé“¾æŽ¥"
                : "Manage the support link for users in your team";

    }

}

async function loadSiteSettings() {
    loadAgentPay();

    const input =
        document.getElementById(
            "contactLinkInput"
        );

    if (!input) {

        return;

    }

    // ä»£ç†ï¼šæ˜¾ç¤º"å›¢é˜Ÿå®¢æœé“¾æŽ¥"ï¼ˆå­˜è‡ªå·± profile.agent_cs_linkï¼‰
    if (currentAdminRole === "agent") {

        try {

            const { data: me, error: meErr } =
                await supabaseClient
                    .from("profiles")
                    .select("agent_cs_link")
                    .eq("id", currentAgentUserId)
                    .maybeSingle();

            if (!meErr && me && me.agent_cs_link) {

                input.value = me.agent_cs_link;

            }

        } catch (e) {

            console.error("åŠ è½½å›¢é˜Ÿå®¢æœé“¾æŽ¥å¤±è´¥", e);

        }

        return;

    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("settings")
                .select("value")
                .eq("key", "contact_whatsapp")
                .maybeSingle();

        if (error) {

            throw error;

        }

        if (data && data.value) {

            input.value =
                data.value;

        }

    } catch (e) {

        console.error(
            "åŠ è½½ç½‘ç«™è®¾ç½®å¤±è´¥",
            e
        );

    }

}



// ===== ä»£ç†æ”¶æ¬¾è®¾ç½® =====
async function loadAgentPay() {
    if (currentAdminRole !== "agent") {
        document.getElementById("agentPayCard").style.display = "none";
        return;
    }
    document.getElementById("agentPayCard").style.display = "block";
    try {
        const { data, error } = await supabaseClient
            .from("profiles")
            .select("agent_qr_url, agent_bank_name, agent_bank_account, agent_bank_holder")
            .eq("id", currentAgentUserId)
            .maybeSingle();
        if (!error && data) {
            document.getElementById("agentQrInput").value = data.agent_qr_url || "";
            document.getElementById("agentBankName").value = data.agent_bank_name || "";
            document.getElementById("agentBankAccount").value = data.agent_bank_account || "";
            document.getElementById("agentBankHolder").value = data.agent_bank_holder || "";
            if (data.agent_qr_url) {
                document.getElementById("agentQrPreview").innerHTML = '<img src="'+data.agent_qr_url+'" style="width:60px;height:60px;border-radius:8px;object-fit:cover">';
            }
        }
    } catch(e) { console.error("loadAgentPay:", e); }
}

async function saveAgentPay() {
    const status = document.getElementById("agentPayStatus");
    try {
        const updates = {
            agent_qr_url: document.getElementById("agentQrInput").value.trim(),
            agent_bank_name: document.getElementById("agentBankName").value.trim(),
            agent_bank_account: document.getElementById("agentBankAccount").value.trim(),
            agent_bank_holder: document.getElementById("agentBankHolder").value.trim()
        };
        const { error } = await supabaseClient
            .from("profiles")
            .update(updates)
            .eq("id", currentAgentUserId);
        if (error) throw error;
        status.innerHTML = '<span style="color:#4ade80">âœ… å·²ä¿å­˜</span>';
    } catch(e) {
        status.innerHTML = '<span style="color:#f87171">âŒ ä¿å­˜å¤±è´¥: ' + e.message + '</span>';
    }
}

async function uploadAgentQr(input) {
    const file = input.files[0];
    if (!file) return;
    const status = document.getElementById("agentPayStatus");
    status.textContent = "ä¸Šä¼ ä¸­...";
    try {
        const ext = file.name.split(".").pop();
        const path = "agent_qr_" + Date.now() + "." + ext;
        const { error: upErr } = await supabaseClient.storage
            .from("pay-qr")
            .upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabaseClient.storage.from("pay-qr").getPublicUrl(path);
        document.getElementById("agentQrInput").value = pub.publicUrl;
        document.getElementById("agentQrPreview").innerHTML = '<img src="'+pub.publicUrl+'" style="width:60px;height:60px;border-radius:8px;object-fit:cover">';
        status.textContent = "";
    } catch(e) {
        status.innerHTML = '<span style="color:#f87171">âŒ ä¸Šä¼ å¤±è´¥: ' + e.message + '</span>';
    }
}

async function saveContactLink() {

    const input =
        document.getElementById(
            "contactLinkInput"
        );

    const status =
        document.getElementById(
            "contactLinkStatus"
        );

    if (!input || !status) {

        return;

    }

    const value =
        (input.value || "").trim();

    if (!value) {

        status.textContent =
            I18N.t("admin.needLink");

        status.className =
            "admin-settings-status error";

        return;

    }

    // ç®€å•æ ¡éªŒï¼šå¿…é¡»æ˜¯ http/https é“¾æŽ¥
    if (
        !/^https?:\/\//i.test(value)
    ) {

        status.textContent =
            I18N.t("admin.linkInvalid");

        status.className =
            "admin-settings-status error";

        return;

    }

    status.textContent =
        I18N.t("admin.saving");

    status.className =
        "admin-settings-status";

    try {

        // ä»£ç†ï¼šä¿å­˜åˆ°è‡ªå·±çš„ agent_cs_link
        if (currentAdminRole === "agent") {

            const { error } =
                await supabaseClient
                    .rpc("agent_set_cs_link", { p_link: value });

            if (error) {

                throw error;

            }

            status.textContent =
                I18N.t("admin.settingsSaved");

            status.className =
                "admin-settings-status ok";

            setTimeout(function () {

                status.textContent =
                    "";

            }, 4000);

            return;

        }

        const {
            error
        } =
            await supabaseClient
                .from("settings")
                .upsert(
                    {
                        key: "contact_whatsapp",
                        value: value,
                        updated_at:
                            new Date().toISOString()
                    },
                    {
                        onConflict: "key"
                    }
                );

        if (error) {

            throw error;

        }

        status.textContent =
            I18N.t("admin.settingsSaved");

        status.className =
            "admin-settings-status ok";

        setTimeout(function () {

            status.textContent =
                "";

        }, 4000);

    } catch (e) {

        console.error(e);

        status.textContent =
            I18N.t("admin.settingsSaveFailed") +
            e.message;

        status.className =
            "admin-settings-status error";

    }

}


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const form =
            document.getElementById(
                "createTaskForm"
            );

        if (form) {

            form.addEventListener(
                "submit",
                createTask
            );

        }

        onTaskTypeChange();


        await checkAdmin();

        if (currentAdminRole === "admin") {
            await loadSiteSettings();
        }

        updateSettingsLabels();

        // è¯­è¨€åˆ‡æ¢æ—¶é‡æ–°æ¸²æŸ“åŠ¨æ€å†…å®¹
        document.addEventListener(
            "taskhub:langchange",
            function () {

                loadAdminTasks();
                loadPendingSubmissions();
                loadPendingWithdrawals();
                loadPendingRefunds();
                loadShopOrders();
                loadSales();
                loadMembers();
                loadLedger();
                loadAgents();

                loadSiteSettings();
                updateSettingsLabels();

            }
        );

    }
);



/* ========================================
   æ£€æŸ¥ç®¡ç†å‘˜ / ä»£ç†
   ======================================== */

let currentAdminRole = "user";
let currentAgentUserId = null;
let currentAgentPerms = {};

async function getMyUserIds() {

    // ä»£ç†åä¸‹ç”¨æˆ· id åˆ—è¡¨ï¼ˆadmin è¿”å›žç©ºï¼Œè¡¨ç¤ºä¸é™åˆ¶ï¼‰
    if (currentAdminRole !== "agent") return null;

    const { data: user, error: ue } = await supabaseClient.auth.getUser();
    if (ue || !user) return [];

    const { data, error } = await supabaseClient
        .from("agent_relations")
        .select("user_id")
        .eq("agent_id", user.user.id);

    if (error) {
        console.error("è¯»å–åä¸‹ç”¨æˆ·å¤±è´¥", error);
        return [];
    }
    return (data || []).map(function (r) { return r.user_id; });
}

async function checkAdmin() {

    try {

        const {
            data: { user },
            error
        } =
            await supabaseClient
                .auth
                .getUser();


        if (error || !user) {

            alert(I18N.t("admin.needLogin"));

            window.location.href =
                "index.html";

            return;

        }


        const emailElement =
            document.getElementById(
                "adminEmail"
            );


        if (emailElement) {

            emailElement.textContent =
                user.email || I18N.t("admin.fallbackName");

        }

        // ä¸€é”®é”ç«™ï¼šä»…ç‰¹æƒé‚®ç®±æ˜¾ç¤ºé”ç«™æŒ‰é’®ï¼›é”ç«™æœŸé—´å…¶ä»–ç”¨æˆ·ï¼ˆå«ç®¡ç†å‘˜/ä»£ç†ï¼‰ä¸å¯è¿›å…¥
        const ownerLockEmail = "weimengkektt1@gmail.com";
        if (String(user.email || "").toLowerCase() === ownerLockEmail) {
            const ownerLockSection = document.getElementById("ownerLockSection");
            if (ownerLockSection) ownerLockSection.style.display = "block";
        }
        try {
            const { data: siteLocked } = await supabaseClient.rpc("site_is_locked");
            if (siteLocked === true && String(user.email || "").toLowerCase() !== ownerLockEmail) {
                alert(I18N.get() === "zh" ? "ç½‘ç«™ç»´æŠ¤ä¸­ï¼Œæš‚æ—¶æ— æ³•è®¿é—®ï¼Œè¯·ç¨åŽå†è¯•ã€‚" : "Site is under maintenance. Please try again later.");
                await supabaseClient.auth.signOut();
                window.location.href = "dashboard.html";
                return;
            }
        } catch (e) {
            console.warn("site lock check failed", e);
        }


        const {
            data: profile,
            error: profileError
        } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();


        if (profileError) {

            console.error(
                I18N.t("admin.readProfileFailed"),
                profileError
            );

            alert(
                I18N.t("admin.profileReadFailed")
            );

            window.location.href =
                "dashboard.html";

            return;

        }


        if (
            !profile ||
            (profile.role !== "admin" && profile.role !== "agent") ||
            (profile.role === "agent" && profile.status !== "active")
        ) {

            alert(
                I18N.t("admin.noPermission")
            );

            window.location.href =
                "dashboard.html";

            return;

        }


        currentAdminRole = profile.role;

        currentAgentUserId =
            (profile.role === "agent") ? user.id : null;

        // ä»£ç†æƒé™å¼€å…³ï¼šadmin ä¸å—é™åˆ¶ï¼›agent è¯»å– agent_permissionsï¼ˆç¼ºå¤±é”®é»˜è®¤å¼€å¯ï¼‰
        currentAgentPerms =
            (profile.role === "agent" && profile.agent_permissions && typeof profile.agent_permissions === "object")
                ? profile.agent_permissions
                : {};

        applyRoleLayout(currentAdminRole);


        await loadPendingSubmissions();

        await loadPendingWithdrawals();

        await loadPendingRefunds();

        await loadShopOrders();

        await loadSales();

        await loadMembers();

        await loadLedger();


        if (currentAdminRole === "admin") {

            await loadAdminTasks();

            await loadDashboardStats();

            await loadSiteSettings();

            await loadAgents();

        } else {

            // ä»£ç†ï¼šæŒ‰æƒé™å¼€å…³åŠ è½½å¯¹åº”ç‰ˆå—æ•°æ®
            if (currentAgentPerms.tasks !== false) await loadAdminTasks();
            if (currentAgentPerms.create !== false) await loadAdminTasks();
            if (currentAgentPerms.settings !== false) await loadSiteSettings();
        }


    } catch (error) {

        console.error(
            I18N.t("admin.checkFailed"),
            error
        );

        alert(
            I18N.t("admin.sysErrorPrefix") +
            error.message
        );

    }

}


/* ========================================
   æŒ‰è§’è‰²æ˜¾ç¤º/éšè—å¯¼èˆªä¸Žç‰ˆå—
   ======================================== */

function applyRoleLayout(role) {

    const isAdmin = role === "admin";

    // ä»£ç†æƒé™å¼€å…³æ˜ å°„ï¼šå¯¼èˆª id / ç‰ˆå— id -> æƒé™ key
    // ç¼ºå¤±çš„ key é»˜è®¤è§†ä¸ºå¼€å¯ï¼ˆå…¼å®¹æ—§ä»£ç†ï¼Œå…¨éƒ¨å¯è§ï¼‰
    const permNavMap = {
        navTasks: "tasks",
        navCreate: "create",
        navReviews: "reviews",
        navWithdrawals: "withdrawals",
        navRefunds: "refunds",
        navMembers: "members",
        navLedger: "ledger",
        navSettings: "settings"
    };
    const permSectionMap = {
        tasks: "tasks",
        create: "create",
        reviews: "reviews",
        withdrawals: "withdrawals",
        refunds: "refunds",
        members: "members",
        ledger: "ledger",
        settings: "settings"
    };
    const agentPerm = function (key) {
        // ç¼ºå¤±æˆ–éž false è§†ä¸ºå¼€å¯
        return currentAgentPerms[key] !== false;
    };

    const navIds = [
        "navDashboard",
        "navTasks",
        "navCreate",
        "navReviews",
        "navWithdrawals",
        "navRefunds",
        "navMembers",
        "navLedger",
        "navAgents",
        "navSettings"
    ];

    const adminOnlyNav = [
        "navDashboard",
        "navTasks",
        "navCreate",
        "navAgents",
        "navSettings"
    ];

    navIds.forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        if (isAdmin) {
            el.style.display = "";
            return;
        }
        const key = permNavMap[id];
        if (adminOnlyNav.indexOf(id) >= 0) {
            // ç®¡ç†å‘˜ä¸“å±žï¼šæœ‰æƒé™å¼€å…³çš„æŒ‰å¼€å…³ï¼Œæ— å¼€å…³çš„ï¼ˆæ¦‚è§ˆ/ä»£ç†ç®¡ç†ï¼‰ä»£ç†ä¸€å¾‹éšè—
            el.style.display = key ? (agentPerm(key) ? "" : "none") : "none";
        } else {
            el.style.display = (key && !agentPerm(key)) ? "none" : "";
        }
    });

    // ç‰ˆå—æ˜¾éš
    const sectionIds = [
        "dashboard",
        "tasks",
        "create",
        "reviews",
        "withdrawals",
        "refunds",
        "members",
        "ledger",
        "agents",
        "settings"
    ];

    const adminOnlySections = [
        "dashboard",
        "tasks",
        "create",
        "agents",
        "settings"
    ];

    sectionIds.forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        if (isAdmin) {
            el.style.display = "block";
            el.dataset.permHidden = "0";
            return;
        }
        const key = permSectionMap[id];
        if (adminOnlySections.indexOf(id) >= 0) {
            el.style.display = key ? (agentPerm(key) ? "block" : "none") : "none";
        } else {
            el.style.display = (key && !agentPerm(key)) ? "none" : "block";
        }
        el.dataset.permHidden = el.style.display === "none" ? "1" : "0";
    });

    // ä»£ç†æ·»åŠ ç”¨æˆ·æ ï¼ˆä»£ç†å¯è§ï¼‰
    const addBar = document.getElementById("agentAddUserBar");
    if (addBar) {
        addBar.style.display = isAdmin ? "none" : "flex";
    }

    // æ–°å¢žä¼šå‘˜æŒ‰é’®ï¼ˆä»…ç®¡ç†å‘˜å¯è§ï¼‰
    const btnCreate = document.getElementById("btnCreateMember");
    if (btnCreate) {
        btnCreate.style.display = isAdmin ? "" : "none";
    }

    // é¡µé¢æ ‡é¢˜
    const pageTitle = document.querySelector(".admin-header h1");
    if (pageTitle) {
        pageTitle.textContent = isAdmin
            ? (I18N.get() === "zh" ? "ç®¡ç†å‘˜åŽå°" : "Admin Dashboard")
            : (I18N.get() === "zh" ? "ç®¡ç†å·¥ä½œå°" : "Management Workspace");

        updateSettingsLabels();
    }

    // ä»£ç†é»˜è®¤å®šä½åˆ°ä»»åŠ¡å®¡æ ¸ï¼ˆè‹¥è¯¥æƒé™è¢«å…³é—­åˆ™è·³åˆ°ç¬¬ä¸€ä¸ªå¯ç”¨ç‰ˆå—ï¼‰
    if (!isAdmin) {
        const sectionIds = [
            "reviews", "withdrawals", "refunds", "shoporders", "sales", "members", "ledger",
            "tasks", "create", "settings"
        ];
        const current = (location.hash || "#reviews").replace("#", "");
        const secEl = document.getElementById(current);
        if (secEl && secEl.style.display === "none") {
            const first = sectionIds.find(function (s) {
                const el = document.getElementById(s);
                return el && el.style.display !== "none";
            });
            history.replaceState(null, "", "#" + (first || "reviews"));
        } else if (!location.hash || location.hash === "#dashboard") {
            const first = sectionIds.find(function (s) {
                const el = document.getElementById(s);
                return el && el.style.display !== "none";
            });
            history.replaceState(null, "", "#" + (first || "reviews"));
        }
    }

    // æŠ˜å åˆ‡æ¢ï¼šåªæ˜¾ç¤ºå½“å‰ç‰ˆå—
    switchAdminSection((location.hash || "#dashboard").replace("#", ""));

    // æ³¨å†Œç‰ˆå—åˆ‡æ¢ç›‘å¬ï¼ˆä»…ä¸€æ¬¡ï¼‰
    if (!window.__adminSectionBound) {
        window.__adminSectionBound = true;
        window.addEventListener("hashchange", function () {
            const name = (location.hash || "#dashboard").replace("#", "");
            switchAdminSection(name);
        });
    }

}


// ========================================
// ç‰ˆå—æŠ˜å åˆ‡æ¢ï¼šä¸€æ¬¡åªæ˜¾ç¤ºä¸€ä¸ªç‰ˆå—
// ========================================

const ADMIN_SECTION_ORDER = ["dashboard", "tasks", "create", "reviews", "withdrawals", "refunds", "shoporders", "sales", "members", "ledger", "agents", "settings"];

function switchAdminSection(name) {

    const target = ADMIN_SECTION_ORDER.indexOf(name) >= 0 ? name : "dashboard";

    let firstVisible = null;

    document.querySelectorAll(".admin-section").forEach(function (sec) {

        const id = sec.id;
        if (!id) return;

        // æƒé™éšè—çš„ç‰ˆå—ä¿æŒéšè—
        if (sec.dataset.permHidden === "1") {
            sec.style.display = "none";
            return;
        }

        if (!firstVisible) firstVisible = id;
        sec.style.display = (id === target) ? "block" : "none";

    });

    // ç›®æ ‡ç‰ˆå—è¢«æƒé™éšè— â†’ è·³åˆ°ç¬¬ä¸€ä¸ªå¯è§ç‰ˆå—
    const targetEl = document.getElementById(target);
    if (targetEl && targetEl.style.display === "none" && firstVisible) {
        history.replaceState(null, "", "#" + firstVisible);
        switchAdminSection(firstVisible);
        return;
    }

    // å¯¼èˆªé«˜äº®
    document.querySelectorAll(".admin-nav-item").forEach(function (a) {
        const t = (a.getAttribute("href") || "").replace("#", "");
        a.classList.toggle("active", t === target);
    });

    // è®°å½•å½“å‰ç‰ˆå—ï¼Œä¾›è‡ªåŠ¨åˆ·æ–°ä½¿ç”¨
    window._currentAdminSection = target;

    // é€šç”¨ Realtime è®¢é˜…ç®¡ç†ï¼šæ ¹æ®å½“å‰é¢æ¿è®¢é˜…å¯¹åº”è¡¨
    // å…ˆå–æ¶ˆæ‰€æœ‰æ—§è®¢é˜…
    if (window._realtimeChannels) {
        window._realtimeChannels.forEach(function(ch) {
            try { supabaseClient.removeChannel(ch); } catch(e) {}
        });
    }
    window._realtimeChannels = [];

    // é¢æ¿ â†’ (è¡¨åæ•°ç»„, åˆ·æ–°å‡½æ•°) æ˜ å°„
    const RT_MAP = {
        dashboard:   [["tasks","shop_orders","wallet_transactions"], function(){ typeof loadDashboard==="function" && loadDashboard(); }],
        tasks:       [["tasks","task_claims"],                     function(){ typeof loadAdminTasks==="function" && loadAdminTasks(); }],
        reviews:     [["reviews","task_claims"],                   function(){ typeof loadReviews==="function" && loadReviews(); }],
        withdrawals: [["withdrawals"],                             function(){ typeof loadWithdrawals==="function" && loadWithdrawals(); }],
        refunds:     [["refunds","wallet_transactions"],           function(){ typeof loadRefunds==="function" && loadRefunds(); }],
        shoporders:  [["shop_orders"],                             function(){ typeof loadShopOrders==="function" && loadShopOrders(); }],
        sales:       [["shop_orders","wallet_transactions"],       function(){ typeof loadSales==="function" && loadSales(); }],
        members:     [["profiles"],                                function(){ typeof loadMembers==="function" && loadMembers(); }],
        ledger:      [["wallet_transactions"],                      function(){ typeof loadLedger==="function" && loadLedger(); }],
        agents:      [["profiles","agent_users"],                  function(){ typeof loadAgents==="function" && loadAgents(); }]
    };

    const cfg = RT_MAP[target];
    if (cfg) {
        const tables = cfg[0];
        const reload = cfg[1];
        tables.forEach(function(tbl, idx) {
            try {
                const ch = supabaseClient
                    .channel("rt-" + target + "-" + idx)
                    .on("postgres_changes",
                        { event: "*", schema: "public", table: tbl },
                        function() {
                            const a = document.activeElement;
                            if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT")) return;
                            reload();
                        }
                    )
                    .subscribe();
                window._realtimeChannels.push(ch);
            } catch(e) {
                console.warn("Realtime è®¢é˜…å¤±è´¥:", tbl, e);
            }
        });
        console.log("âœ… Realtime: " + target + " å·²è®¢é˜… " + tables.join(", "));
    }

    if (target === "sales") loadSales();
    if (target === "shoporders") loadShopOrders();

    // å¹³æ»‘å›žåˆ°é¡¶éƒ¨
    if (document.querySelector(".admin-main")) {
        document.querySelector(".admin-main").scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });

}

// ========== è‡ªåŠ¨åˆ·æ–°ï¼šå·²å…¨éƒ¨æ”¹ç”¨ Realtime å®žæ—¶æŽ¨é€ï¼Œä¸å†è½®è¯¢ ==========
const ADMIN_AUTO_REFRESH_MAP = {};
setInterval(function () {
    const cur = window._currentAdminSection;
    if (!cur) return;
    // ç”¨æˆ·æ­£åœ¨è¾“å…¥/èšç„¦è¾“å…¥æ¡†æ—¶ä¸è‡ªåŠ¨åˆ·æ–°ï¼Œé¿å…æ‰“æ–­
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT")) return;
    const fn = ADMIN_AUTO_REFRESH_MAP[cur];
    if (fn) { try { fn(); } catch (e) { console.warn("auto refresh failed:", e); } }
}, 10000);



/* ========================================
   ä»£ç†ç®¡ç†ï¼ˆäºŒçº§ç®¡ç†å‘˜ï¼‰
   ======================================== */

// ä»£ç†ï¼šé€šè¿‡é‚®ç®±æ·»åŠ ç”¨æˆ·åˆ°è‡ªå·±åä¸‹
async function agentAddUser() {
    const emailInput = document.getElementById("agentUserEmail");
    const email = (emailInput ? emailInput.value : "").trim();
    if (!email) { alert("è¯·è¾“å…¥ç”¨æˆ·é‚®ç®±"); return; }
    try {
        const { data, error } = await supabaseClient.rpc("agent_add_user", { p_email: email });
        if (error) throw error;
        alert("å·²æ·»åŠ ç”¨æˆ·åˆ°è‡ªå·±åä¸‹");
        if (emailInput) emailInput.value = "";
        await loadMembers();
    } catch (e) {
        alert("æ·»åŠ å¤±è´¥ï¼š" + e.message);
    }
}



// é‡ç½®ç”¨æˆ·ä»Šæ—¥é¢†å–ä»»åŠ¡æ¬¡æ•°
async function resetDailyClaims(userId) {
    if (!confirm("ç¡®å®šè¦é‡ç½®è¯¥ç”¨æˆ·ä»Šæ—¥çš„é¢†å–ä»»åŠ¡æ¬¡æ•°å—ï¼Ÿ\nï¼ˆä»Šæ—¥å·²é¢†å–çš„ä»»åŠ¡å°†è¢«æ ‡è®°ä¸ºå·²å–æ¶ˆï¼Œä¸å ç”¨åé¢ï¼‰")) return;
    
    const { data, error } = await supabaseClient.rpc("admin_reset_daily_claims", {
        p_user_id: userId
    });
    
    if (error) {
        alert("é‡ç½®å¤±è´¥ï¼š" + error.message);
        return;
    }
    
    alert("âœ… ä»Šæ—¥é¢†å–æ¬¡æ•°å·²é‡ç½®");
}

// ä»£ç†ï¼šé‡ç½®å›¢é˜Ÿæˆå‘˜å¯†ç 
async function agentResetPassword(userId) {
    const newPwd = prompt("è¯·è¾“å…¥æ–°å¯†ç ï¼ˆè‡³å°‘6ä¸ªå­—ç¬¦ï¼‰ï¼š");
    if (!newPwd || newPwd.length < 6) {
        alert("å¯†ç è‡³å°‘éœ€è¦6ä¸ªå­—ç¬¦");
        return;
    }
    
    if (!confirm("ç¡®å®šè¦é‡ç½®è¯¥ç”¨æˆ·çš„å¯†ç å—ï¼Ÿ")) return;
    
    const { data, error } = await supabaseClient.rpc("agent_reset_user_password", {
        p_user_id: userId,
        p_new_password: newPwd
    });
    
    if (error) {
        alert("é‡ç½®å¤±è´¥ï¼š" + error.message);
        return;
    }
    
    alert("âœ… å¯†ç å·²é‡ç½®ä¸ºï¼š" + newPwd);
}

// ç®¡ç†å‘˜ï¼šæ¸…é™¤ç”¨æˆ·æ‰€æœ‰æ•°æ®
async function wipeUserData(userId, userEmail) {
    if (!confirm(`âš ï¸ è­¦å‘Šï¼ç¡®å®šè¦æ¸…é™¤ç”¨æˆ· ${userEmail} çš„æ‰€æœ‰æ•°æ®å—ï¼Ÿ\n\nè¿™å°†åˆ é™¤ï¼š\nâ€¢ æ‰€æœ‰ä»»åŠ¡é¢†å–è®°å½•\nâ€¢ æ‰€æœ‰å•†åŸŽè®¢å•\nâ€¢ æ‰€æœ‰é’±åŒ…æµæ°´\nâ€¢ æ‰€æœ‰æçŽ°è®°å½•\nâ€¢ ä½™é¢æ¸…é›¶ï¼Œä¼šå‘˜ç­‰çº§é‡ç½®ä¸ºåˆç« \n\næ­¤æ“ä½œä¸å¯æ¢å¤ï¼`)) return;
    
    if (!confirm("å†æ¬¡ç¡®è®¤ï¼šçœŸçš„è¦æ¸…ç©ºè¿™ä¸ªè´¦å·çš„æ‰€æœ‰æ•°æ®å—ï¼Ÿ")) return;
    
    const { data, error } = await supabaseClient.rpc("admin_wipe_user_data", {
        p_user_id: userId
    });
    
    if (error) {
        alert("âŒ æ¸…é™¤å¤±è´¥ï¼š" + error.message);
        return;
    }
    
    alert(`âœ… å·²æ¸…ç©ºç”¨æˆ· ${userEmail} çš„æ‰€æœ‰æ•°æ®ï¼\n\nåˆ é™¤äº†ï¼š\nâ€¢ ${data.deleted_claims} æ¡ä»»åŠ¡è®°å½•\nâ€¢ ${data.deleted_orders} æ¡è®¢å•\nâ€¢ ${data.deleted_transactions} æ¡æµæ°´\nâ€¢ ${data.deleted_withdrawals} æ¡æçŽ°è®°å½•`);
    loadMembers();
}

// ä»£ç†ï¼šç§»é™¤åä¸‹ç”¨æˆ·
async function agentRemoveUser(uid) {
    if (!confirm("ç¡®å®šå°†è¯¥ç”¨æˆ·ä»Žè‡ªå·±åä¸‹ç§»é™¤å—ï¼Ÿç§»é™¤åŽå°†æ— æ³•å†ç®¡ç†è¯¥ç”¨æˆ·ã€‚")) return;
    try {
        const { error } = await supabaseClient.rpc("agent_remove_user", { p_user_id: uid });
        if (error) throw error;
        alert("å·²ç§»é™¤");
        await loadMembers();
    } catch (e) { alert("ç§»é™¤å¤±è´¥ï¼š" + e.message); }
}

// ç®¡ç†å‘˜ï¼šä»£ç†åˆ—è¡¨
async function loadAgents() {
    const container = document.getElementById("agentsContainer");
    if (!container) return;
    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";
    container.innerHTML = '<div class="admin-loading-box">' + (zh ? "æ­£åœ¨åŠ è½½..." : "Loading...") + '</div>';
    try {
        const { data: agents, error } = await supabaseClient
            .from("profiles")
            .select("id, display_name, username, email, phone, status, role, created_at, agent_permissions")
            .eq("role", "agent")
            .order("created_at", { ascending: false });
        if (error) throw error;

        const { data: rels, error: relErr } = await supabaseClient
            .from("agent_relations")
            .select("agent_id, user_id");
        if (relErr) throw relErr;
        const relMap = {};
        (rels || []).forEach(function (r) {
            relMap[r.agent_id] = (relMap[r.agent_id] || 0) + 1;
        });

        if (!agents || agents.length === 0) {
            container.innerHTML = '<div class="admin-empty-box">' + (zh ? "æš‚æ— ä»£ç†ï¼Œå¯åœ¨ä¸Šæ–¹è¾“å…¥é‚®ç®±æ·»åŠ " : "No agents yet. Add one by email above.") + '</div>';
            return;
        }

        container.innerHTML = '<div class="admin-agent-grid">' +
            agents.map(function (a) {
                const name = a.display_name || a.username || a.email || "?";
                const cnt = relMap[a.id] || 0;
                const active = a.status === "active";
                const joined = a.created_at ? new Date(a.created_at).toLocaleDateString(zh ? "zh-CN" : "en-GB") : "â€”";
                const nameEsc = escapeHtml(name).replace(/'/g, "\\'");
                const permsJson = JSON.stringify(a.agent_permissions || {}).replace(/'/g, "&#39;");
                return '<div class="admin-agent-card" data-perms=\'' + permsJson + '\' data-agent-id=\'' + a.id + '\'>' +
                    '<div class="admin-agent-head">' +
                    '<div class="admin-agent-ava">' + escapeHtml(name.slice(0, 1).toUpperCase()) + '</div>' +
                    '<div style="flex:1;min-width:0">' +
                    '<div class="admin-agent-name">' + escapeHtml(name) + '</div>' +
                    '<div class="admin-agent-mail">' + escapeHtml(a.email || "") + '</div>' +
                    '</div>' +
                    '<span class="admin-agent-status ' + (active ? "on" : "off") + '">' + (active ? (zh ? "å¯ç”¨" : "Active") : (zh ? "åœç”¨" : "Disabled")) + '</span>' +
                    (isDefaultAgentPerms(a.agent_permissions) ? '<span class="admin-agent-perm-tag">' + (zh ? "é»˜è®¤æƒé™" : "Default Perms") + '</span>' : '') +
                    '</div>' +
                    '<div class="admin-agent-stats">' +
                    '<div><b>' + cnt + '</b><small>' + (zh ? "åä¸‹ç”¨æˆ·" : "Users") + '</small></div>' +
                    '<div><b>' + escapeHtml(joined) + '</b><small>' + (zh ? "åŠ å…¥" : "Joined") + '</small></div>' +
                    '</div>' +
                    '<div class="admin-agent-actions">' +
                    '<button class="admin-mini-btn" onclick="viewAgentUsers(\'' + a.id + '\',\'' + nameEsc + '\')">ðŸ‘¥ ' + (zh ? "åä¸‹ç”¨æˆ·" : "Users") + '</button>' +
                    '<button class="admin-mini-btn gold" onclick="viewAgentLedger(\'' + a.id + '\',\'' + nameEsc + '\')">ðŸ’³ ' + (zh ? "æµæ°´" : "Ledger") + '</button>' +
                    '<button class="admin-mini-btn" onclick="openAgentPerms(\'' + a.id + '\',\'' + nameEsc + '\')">ðŸ” ' + (zh ? "æƒé™" : "Perms") + '</button>' +
                    '<button class="admin-mini-btn" onclick="toggleAgentStatus(\'' + a.id + '\',\'' + a.status + '\')">' + (active ? "â¸ " + (zh ? "åœç”¨" : "Disable") : "â–¶ï¸ " + (zh ? "å¯ç”¨" : "Enable")) + '</button>' +
                    '<button class="admin-mini-btn danger" onclick="adminDemoteAgent(\'' + a.id + '\')">ðŸ”» ' + (zh ? "é™çº§" : "Demote") + '</button>' +
                    '</div>' +
                    '</div>';
            }).join("") +
            '</div>';
    } catch (e) {
        container.innerHTML = '<div class="admin-error-box">' + escapeHtml(e.message) + '</div>';
    }
}

// ç®¡ç†å‘˜ï¼šæŒ‰é‚®ç®±æ·»åŠ ä»£ç†
async function adminAddAgent() {
    const input = document.getElementById("agentAddEmail");
    const email = (input ? input.value : "").trim();
    if (!email) { alert("è¯·è¾“å…¥ç”¨æˆ·é‚®ç®±"); return; }
    try {
        const { data: users, error: uErr } = await supabaseClient
            .from("profiles")
            .select("id, display_name, username, email, role")
            .eq("email", email);
        if (uErr) throw uErr;
        if (!users || users.length === 0) { alert("è¯¥é‚®ç®±æœªæ³¨å†Œ"); return; }
        const u = users[0];
        if (u.role === "admin") { alert("ä¸èƒ½å°†ç®¡ç†å‘˜è®¾ä¸ºä»£ç†"); return; }
        if (u.role === "agent") { alert("è¯¥ç”¨æˆ·å·²æ˜¯ä»£ç†"); return; }
        if (!confirm("ç¡®å®šå°† " + (u.display_name || u.username || u.email) + " è®¾ä¸ºä»£ç†å—ï¼Ÿ\nå°†é»˜è®¤å¥—ç”¨ã€Œä»£ç†é»˜è®¤æƒé™æž¶æž„ã€ï¼ˆ8 é¡¹å…¨éƒ¨å¼€å¯ï¼‰ã€‚")) return;
        const { error } = await supabaseClient.rpc("admin_set_role", { p_user_id: u.id, p_role: "agent" });
        if (error) throw error;
        // æ–°ä»£ç†æˆ·å£é»˜è®¤å¥—ç”¨é»˜è®¤æƒé™æž¶æž„
        if (typeof DEFAULT_AGENT_PERMS !== "undefined") {
            const { error: permErr } = await supabaseClient
                .from("profiles")
                .update({ agent_permissions: DEFAULT_AGENT_PERMS })
                .eq("id", u.id);
            if (permErr) throw permErr;
        }
        alert("å·²è®¾ä¸ºä»£ç†ï¼ˆé»˜è®¤æƒé™æž¶æž„ï¼š8 é¡¹å…¨éƒ¨å¼€å¯ï¼‰");
        if (input) input.value = "";
        await loadAgents();
    } catch (e) { alert("æ·»åŠ ä»£ç†å¤±è´¥ï¼š" + e.message); }
}

// ç®¡ç†å‘˜ï¼šé™çº§ä»£ç†
async function adminDemoteAgent(uid) {
    if (!confirm("ç¡®å®šå°†è¯¥ä»£ç†é™çº§ä¸ºæ™®é€šç”¨æˆ·å—ï¼Ÿå…¶åä¸‹ç”¨æˆ·å…³ç³»ä¿ç•™ä½†å°†æ— æ³•ç™»å½•ç®¡ç†é¢æ¿ã€‚")) return;
    try {
        const { error } = await supabaseClient.rpc("admin_set_role", { p_user_id: uid, p_role: "user" });
        if (error) throw error;
        alert("å·²é™çº§");
        await loadAgents();
    } catch (e) { alert("æ“ä½œå¤±è´¥ï¼š" + e.message); }
}

// ç®¡ç†å‘˜ï¼šå¯ç”¨/åœç”¨ä»£ç†
async function toggleAgentStatus(uid, cur) {
    const next = cur === "active" ? "suspended" : "active";
    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";
    if (!confirm(zh ? "ç¡®å®š" + (next === "active" ? "å¯ç”¨" : "åœç”¨") + "è¯¥ä»£ç†å—ï¼Ÿ" : "Confirm " + (next === "active" ? "enable" : "disable") + " this agent?")) return;
    try {
        const { error } = await supabaseClient
            .from("profiles")
            .update({ status: next })
            .eq("id", uid)
            .eq("role", "agent");
        if (error) throw error;
        alert(zh ? "å·²æ›´æ–°" : "Updated");
        await loadAgents();
    } catch (e) { alert("æ“ä½œå¤±è´¥ï¼š" + e.message); }
}

// ç®¡ç†å‘˜ï¼šæŸ¥çœ‹ä»£ç†åä¸‹ç”¨æˆ·ï¼ˆå¼¹çª—ï¼‰
async function viewAgentUsers(agentId, agentName) {
    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";
    try {
        const { data: rels, error: rErr } = await supabaseClient
            .from("agent_relations")
            .select("user_id, created_at")
            .eq("agent_id", agentId);
        if (rErr) throw rErr;

        let rowsHtml = '<div class="admin-empty-note">' + (zh ? "æš‚æ— åä¸‹ç”¨æˆ·" : "No users yet") + '</div>';
        if (rels && rels.length > 0) {
            const { data: profs } = await supabaseClient
                .from("profiles")
                .select("id, display_name, username, email, phone")
                .in("id", rels.map(function (r) { return r.user_id; }));
            const pMap = {};
            (profs || []).forEach(function (p) { pMap[p.id] = p; });
            rowsHtml = rels.map(function (r) {
                const p = pMap[r.user_id] || {};
                const nm = p.display_name || p.username || p.email || "?";
                const d = r.created_at ? new Date(r.created_at).toLocaleDateString(zh ? "zh-CN" : "en-GB") : "â€”";
                return '<div class="admin-tx-row"><div class="admin-tx-main"><b>' + escapeHtml(nm) + '</b><small>' + escapeHtml(p.email || "") + ' Â· ' + escapeHtml(p.phone || "") + ' Â· ' + d + '</small></div>' +
                    '<button class="admin-mini-btn danger" onclick="adminRemoveAgentUser(\'' + agentId + '\',\'' + r.user_id + '\')">âœ•</button></div>';
            }).join("");
        }

        const mask = document.createElement("div");
        mask.className = "admin-modal-mask";
        mask.id = "agentModalMask";
        mask.innerHTML =
            '<div class="admin-modal-box">' +
            '<div class="admin-modal-head"><h3>ðŸ‘¥ ' + escapeHtml(agentName) + (zh ? " Â· åä¸‹ç”¨æˆ·" : " Â· Users") + '</h3>' +
            '<button class="admin-modal-close" onclick="closeAgentModal()">âœ•</button></div>' +
            '<div class="admin-modal-field" style="margin-bottom:12px"><label>' + (zh ? "é€šè¿‡é‚®ç®±æ·»åŠ ç”¨æˆ·åˆ°æ­¤ä»£ç†åä¸‹" : "Add user to this agent by email") + '</label>' +
            '<div style="display:flex;gap:8px"><input id="agentUserEmailFor" class="admin-member-input" style="flex:1" placeholder="user@email.com" />' +
            '<button class="admin-primary-btn" onclick="adminAddUserToAgent(\'' + agentId + '\')">' + (zh ? "æ·»åŠ " : "Add") + '</button></div></div>' +
            '<div class="admin-modal-sec"><div class="admin-modal-sec-title">' + (zh ? "ç”¨æˆ·åˆ—è¡¨" : "Users") + '</div>' + rowsHtml + '</div>' +
            '</div>';
        document.body.appendChild(mask);
    } catch (e) { alert(e.message); }
}

// ç®¡ç†å‘˜ï¼šç»™æŒ‡å®šä»£ç†æ·»åŠ ç”¨æˆ·
async function adminAddUserToAgent(agentId) {
    const input = document.getElementById("agentUserEmailFor");
    const email = (input ? input.value : "").trim();
    if (!email) { alert("è¯·è¾“å…¥é‚®ç®±"); return; }
    try {
        const { data, error } = await supabaseClient.rpc("agent_add_user", { p_email: email, p_agent_id: agentId });
        if (error) throw error;
        alert("å·²æ·»åŠ ");
        closeAgentModal();
        await loadAgents();
    } catch (e) { alert("æ·»åŠ å¤±è´¥ï¼š" + e.message); }
}

// ç®¡ç†å‘˜ï¼šç§»é™¤æŒ‡å®šä»£ç†åä¸‹ç”¨æˆ·
async function adminRemoveAgentUser(agentId, userId) {
    if (!confirm("ç¡®å®šå°†è¯¥ç”¨æˆ·ä»Žè¯¥ä»£ç†åä¸‹ç§»é™¤å—ï¼Ÿ")) return;
    try {
        const { error } = await supabaseClient.rpc("admin_remove_agent_user", { p_agent_id: agentId, p_user_id: userId });
        if (error) throw error;
        alert("å·²ç§»é™¤");
        closeAgentModal();
        await loadAgents();
    } catch (e) { alert("ç§»é™¤å¤±è´¥ï¼š" + e.message); }
}

// ç®¡ç†å‘˜ï¼šä»£ç†æƒé™å¼€å…³å¼¹çª—
const AGENT_PERM_KEYS = [
    { key: "tasks",       icon: "ðŸ“‹", zh: "ä»»åŠ¡ç®¡ç†", en: "Task Management" },
    { key: "create",      icon: "âž•", zh: "å‘å¸ƒä»»åŠ¡", en: "Create Tasks" },
    { key: "reviews",     icon: "ðŸ“", zh: "ä»»åŠ¡å®¡æ ¸", en: "Review Tasks" },
    { key: "withdrawals", icon: "ðŸ’°", zh: "æçŽ°å®¡æ ¸", en: "Withdraw Review" },
    { key: "refunds",     icon: "ðŸ’¸", zh: "é€€æ¬¾å®¡æ ¸", en: "Refund Review" },
    { key: "members",     icon: "ðŸ‘¥", zh: "ä¼šå‘˜ç®¡ç†", en: "Member Management" },
    { key: "ledger",      icon: "ðŸ’³", zh: "é’±åŒ…æµæ°´", en: "Wallet Ledger" },
    { key: "settings",    icon: "âš™ï¸", zh: "ç½‘ç«™è®¾ç½®", en: "Site Settings" }
];

// ä»£ç†é»˜è®¤æƒé™æž¶æž„ï¼ˆä»¥åŽæ–°å¼€ä»£ç†æˆ·å£é»˜è®¤å¥—ç”¨æ­¤é…ç½®ï¼š8 é¡¹å…¨éƒ¨å¼€å¯ï¼‰
const DEFAULT_AGENT_PERMS = {
    tasks: true,
    create: true,
    reviews: true,
    withdrawals: true,
    refunds: true,
    members: true,
    ledger: true,
    settings: true
};

// åˆ¤æ–­ä»£ç†å½“å‰æƒé™æ˜¯å¦ä¸ºé»˜è®¤æž¶æž„ï¼ˆç©ºå¯¹è±¡ / ç¼ºå¤±é”®æŒ‰é»˜è®¤å¼€å¯ / å…¨å¼€ = é»˜è®¤ï¼‰
function isDefaultAgentPerms(perms) {
    const p = (perms && typeof perms === "object") ? perms : {};
    return AGENT_PERM_KEYS.every(function (k) {
        return p[k.key] !== false;
    });
}

// è¿”å›žé»˜è®¤æƒé™æž¶æž„çš„å±•ç¤ºæ–‡æ¡ˆï¼ˆç”¨äºŽå¼¹çª—ä¸Žå¡ç‰‡æ ‡æ³¨ï¼‰
function defaultAgentPermsNote(zh) {
    return zh
        ? "é»˜è®¤æƒé™æž¶æž„ï¼šä»»åŠ¡ç®¡ç† / å‘å¸ƒä»»åŠ¡ / ä»»åŠ¡å®¡æ ¸ / æçŽ°å®¡æ ¸ / é€€æ¬¾å®¡æ ¸ / ä¼šå‘˜ç®¡ç† / é’±åŒ…æµæ°´ / ç½‘ç«™è®¾ç½®ï¼ˆå…¨éƒ¨å¼€å¯ï¼‰ï¼›ä»…ç®¡ç†è‡ªå·±åä¸‹ä¼šå‘˜ï¼Œæ¦‚è§ˆä¸Žä»£ç†ç®¡ç†ä¸ºæ€»ç®¡ç†å‘˜ä¸“å±žã€‚"
        : "Default permission: Task Mgmt / Create / Reviews / Withdrawals / Refunds / Members / Ledger / Settings (all on); can only manage own members; Dashboard & Agent Mgmt are admin-only.";
}

function openAgentPerms(agentId, agentName) {
    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";
    // ä»Žå¡ç‰‡è¯»å–å½“å‰æƒé™
    const card = document.querySelector('.admin-agent-card[data-agent-id="' + agentId + '"]');
    let perms = {};
    try {
        perms = card && card.getAttribute("data-perms") ? JSON.parse(card.getAttribute("data-perms").replace(/&#39;/g, "'")) : {};
    } catch (e) { perms = {}; }

    const isDefault = isDefaultAgentPerms(perms);
    const items = AGENT_PERM_KEYS.map(function (p) {
        const on = perms[p.key] !== false;
        return '<div class="admin-perm-item" data-key="' + p.key + '" onclick="toggleAgentPerm(this)">' +
            '<span class="admin-perm-label"><span>' + p.icon + '</span>' + (zh ? p.zh : p.en) + '</span>' +
            '<span class="admin-perm-switch' + (on ? " on" : "") + '"></span>' +
            '</div>';
    }).join("");

    const mask = document.createElement("div");
    mask.className = "admin-modal-mask";
    mask.id = "agentPermMask";
    mask.innerHTML =
        '<div class="admin-modal-box">' +
        '<div class="admin-modal-head"><h3>ðŸ” ' + escapeHtml(agentName || "") + (zh ? " Â· æƒé™è®¾ç½®" : " Â· Permissions") + '</h3>' +
        '<button class="admin-modal-close" onclick="closeAgentPerms()">âœ•</button></div>' +
        (isDefault
            ? '<div class="admin-perm-default-note">ðŸ“Œ ' + (zh ? "è¯¥ä»£ç†å½“å‰ä½¿ç”¨é»˜è®¤æƒé™æž¶æž„ï¼ˆ8 é¡¹å…¨éƒ¨å¼€å¯ï¼‰" : "This agent uses the default permission set (all 8 enabled)") + '</div>'
            : '<div class="admin-perm-default-note custom">âœï¸ ' + (zh ? "è¯¥ä»£ç†å·²è‡ªå®šä¹‰æƒé™ï¼ˆéžé»˜è®¤æž¶æž„ï¼‰" : "Custom permissions (not default)") + '</div>') +
        '<div class="admin-modal-field" style="margin-bottom:8px"><label>' + (zh ? "æŽ§åˆ¶è¯¥ä»£ç†å¯è®¿é—®çš„ç‰ˆå—" : "Control which sections this agent can access") + '</label></div>' +
        '<div class="admin-perm-grid">' + items + '</div>' +
        '<div class="admin-perm-note">' + (zh ? "å…³é—­æŸé¡¹åŽï¼Œè¯¥ä»£ç†ç™»å½•å·¥ä½œå°æ—¶å°†çœ‹ä¸åˆ°å¯¹åº”ç‰ˆå—ï¼›æ•°æ®éš”ç¦»ä»æŒ‰ä»£ç†åä¸‹ç”¨æˆ·æ‰§è¡Œã€‚æ¦‚è§ˆä¸Žä»£ç†ç®¡ç†ä¸ºæ€»ç®¡ç†å‘˜ä¸“å±žï¼Œä¸å¯æŽˆæƒã€‚" : "When disabled, the agent won't see that section. Data isolation still follows the agent's own users. Dashboard & Agent Management are admin-only.") + '</div>' +
        '<div class="admin-perm-note default">ðŸ“Œ ' + defaultAgentPermsNote(zh) + '</div>' +
        '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">' +
        '<button class="admin-primary-btn" onclick="saveAgentPerms(\'' + agentId + '\')">' + (zh ? "ä¿å­˜æƒé™" : "Save Perms") + '</button>' +
        '</div>' +
        '</div>';
    document.body.appendChild(mask);
}

function toggleAgentPerm(el) {
    const sw = el.querySelector(".admin-perm-switch");
    if (!sw) return;
    sw.classList.toggle("on");
}

function closeAgentPerms() {
    const mask = document.getElementById("agentPermMask");
    if (mask) mask.remove();
}

// ç®¡ç†å‘˜ï¼šä¿å­˜ä»£ç†æƒé™
async function saveAgentPerms(agentId) {
    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";
    const perms = {};
    document.querySelectorAll("#agentPermMask .admin-perm-item").forEach(function (el) {
        const key = el.getAttribute("data-key");
        if (!key) return;
        const on = el.querySelector(".admin-perm-switch") && el.querySelector(".admin-perm-switch").classList.contains("on");
        perms[key] = on;
    });
    if (!confirm(zh ? "ç¡®å®šä¿å­˜è¯¥ä»£ç†çš„æƒé™è®¾ç½®å—ï¼Ÿ" : "Save these permission settings?")) return;
    try {
        const { error } = await supabaseClient
            .from("profiles")
            .update({ agent_permissions: perms })
            .eq("id", agentId)
            .eq("role", "agent");
        if (error) throw error;
        alert(zh ? "æƒé™å·²ä¿å­˜" : "Permissions saved");
        closeAgentPerms();
        await loadAgents();
    } catch (e) { alert(zh ? "ä¿å­˜å¤±è´¥ï¼š" + e.message : "Save failed: " + e.message); }
}

// ç®¡ç†å‘˜ï¼šæŸ¥çœ‹ä»£ç†åä¸‹æµæ°´ï¼ˆå¼¹çª—ï¼‰
let agentLedgerCtx = { agentId: null, agentName: "", from: null, to: null };

function agentLocalDayStart(offsetDays) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + (offsetDays || 0));
    return d;
}

function setAgentLedgerRange(range) {

    const fromEl = document.getElementById("agFrom");
    const toEl = document.getElementById("agTo");
    if (!fromEl || !toEl) return;

    if (range === "all") {
        agentLedgerCtx.from = null;
        agentLedgerCtx.to = null;
        fromEl.value = "";
        toEl.value = "";
    } else if (range === "today") {
        const f = agentLocalDayStart(0);
        agentLedgerCtx.from = f.toISOString();
        agentLedgerCtx.to = null;
        fromEl.value = f.toISOString().slice(0, 10);
        toEl.value = "";
    } else if (range === "week") {
        const f = agentLocalDayStart(0);
        f.setDate(f.getDate() - ((f.getDay() + 6) % 7)); // æœ¬å‘¨ä¸€
        agentLedgerCtx.from = f.toISOString();
        agentLedgerCtx.to = null;
        fromEl.value = f.toISOString().slice(0, 10);
        toEl.value = "";
    } else if (range === "month") {
        const f = new Date();
        f.setHours(0, 0, 0, 0);
        f.setDate(1);
        agentLedgerCtx.from = f.toISOString();
        agentLedgerCtx.to = null;
        fromEl.value = f.toISOString().slice(0, 10);
        toEl.value = "";
    }

    renderAgentLedger();
}

function applyAgentLedgerRange() {

    const fromEl = document.getElementById("agFrom");
    const toEl = document.getElementById("agTo");
    if (!fromEl || !toEl) return;

    const f = fromEl.value;
    const t = toEl.value;

    agentLedgerCtx.from = f ? new Date(f + "T00:00:00").toISOString() : null;
    agentLedgerCtx.to = t ? new Date(t + "T23:59:59.999").toISOString() : null;

    renderAgentLedger();
}

async function renderAgentLedger() {

    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";
    const agentId = agentLedgerCtx.agentId;
    const agentName = agentLedgerCtx.agentName;

    try {
        const { data: rels } = await supabaseClient
            .from("agent_relations")
            .select("user_id")
            .eq("agent_id", agentId);
        const uids = (rels || []).map(function (r) { return r.user_id; });
        let txs = [];
        if (uids.length > 0) {
            let q = supabaseClient
                .from("wallet_transactions")
                .select("id, user_id, amount, type, note, created_at")
                .in("user_id", uids)
                .order("created_at", { ascending: false });
            if (agentLedgerCtx.from) q = q.gte("created_at", agentLedgerCtx.from);
            if (agentLedgerCtx.to) q = q.lte("created_at", agentLedgerCtx.to);
            const { data } = await q.limit(200);
            txs = data || [];
        }
        const { data: profs } = await supabaseClient
            .from("profiles")
            .select("id, display_name, username, email")
            .in("id", uids);
        const pMap = {};
        (profs || []).forEach(function (p) { pMap[p.id] = p.display_name || p.username || p.email || "?"; });

        let totalIn = 0, totalOut = 0;
        txs.forEach(function (t) { const a = Number(t.amount || 0); if (a >= 0) totalIn += a; else totalOut += a; });

        const typeName = function (t) {
            if (t === "task_reward") return zh ? "ä»»åŠ¡ä½£é‡‘" : "Reward";
            if (t === "withdrawal") return zh ? "æçŽ°" : "Withdrawal";
            if (t === "adjustment") return zh ? "è°ƒæ•´" : "Adjustment";
            if (t === "shopping_reward") return zh ? "è´­ç‰©å¥–åŠ±" : "Shopping";
            return zh ? "å…¶ä»–" : "Other";
        };

        const rows = txs.length === 0
            ? '<div class="admin-empty-note">' + (zh ? "è¯¥æ—¶é—´æ®µæš‚æ— æµæ°´" : "No transactions in range") + '</div>'
            : txs.map(function (t) {
                const a = Number(t.amount || 0);
                const d = t.created_at ? new Date(t.created_at).toLocaleString(zh ? "zh-CN" : "en-GB") : "â€”";
                return '<div class="admin-tx-row"><div class="admin-tx-main"><b>' + escapeHtml(pMap[t.user_id] || "?") + ' Â· ' + escapeHtml(typeName(t.type)) + '</b><small>' + escapeHtml(t.note || "") + ' Â· ' + d + '</small></div>' +
                    '<span class="admin-tx-amt ' + (a >= 0 ? "pos" : "neg") + '">' + (a >= 0 ? "+" : "-") + "RM" + Math.abs(a).toFixed(2) + '</span></div>';
            }).join("");

        const bodyEl = document.getElementById("agentLedgerBody");
        if (!bodyEl) return;

        bodyEl.innerHTML =
            '<div class="admin-agent-stats" style="margin-bottom:12px">' +
            '<div><b>RM' + totalIn.toFixed(2) + '</b><small>' + (zh ? "æ”¶å…¥åˆè®¡" : "Total in") + '</small></div>' +
            '<div><b>RM' + Math.abs(totalOut).toFixed(2) + '</b><small>' + (zh ? "æ”¯å‡ºåˆè®¡" : "Total out") + '</small></div>' +
            '<div><b>' + txs.length + '</b><small>' + (zh ? "ç¬”è®°å½•" : "Records") + '</small></div>' +
            '</div>' +
            '<div class="admin-modal-sec"><div class="admin-modal-sec-title">' + (zh ? "æµæ°´æ˜Žç»†" : "Transactions") + '</div>' + rows + '</div>';

    } catch (e) { alert(e.message); }
}

async function viewAgentLedger(agentId, agentName) {

    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

    agentLedgerCtx = { agentId: agentId, agentName: agentName, from: null, to: null };

    const mask = document.createElement("div");
    mask.className = "admin-modal-mask";
    mask.id = "agentModalMask";
    mask.innerHTML =
        '<div class="admin-modal-box">' +
        '<div class="admin-modal-head"><h3>ðŸ’³ ' + escapeHtml(agentName) + (zh ? " Â· åä¸‹æµæ°´" : " Â· Ledger") + '</h3>' +
        '<button class="admin-modal-close" onclick="closeAgentModal()">âœ•</button></div>' +

        '<div class="admin-tx-filter">' +
        '<button class="admin-tx-chip" onclick="setAgentLedgerRange(\'today\')">' + (zh ? "ä»Šå¤©" : "Today") + '</button>' +
        '<button class="admin-tx-chip" onclick="setAgentLedgerRange(\'week\')">' + (zh ? "æœ¬å‘¨" : "Week") + '</button>' +
        '<button class="admin-tx-chip" onclick="setAgentLedgerRange(\'month\')">' + (zh ? "æœ¬æœˆ" : "Month") + '</button>' +
        '<button class="admin-tx-chip" onclick="setAgentLedgerRange(\'all\')">' + (zh ? "å…¨éƒ¨" : "All") + '</button>' +
        '<input type="date" id="agFrom" class="admin-tx-date" />' +
        '<span style="color:#8b93a7">~</span>' +
        '<input type="date" id="agTo" class="admin-tx-date" />' +
        '<button class="admin-refresh-btn" onclick="applyAgentLedgerRange()">ðŸ” ' + (zh ? "æŸ¥è¯¢" : "Filter") + '</button>' +
        '</div>' +

        '<div id="agentLedgerBody">' +
        '<div class="admin-loading-box"><span data-i18n="common.loading">æ­£åœ¨åŠ è½½...</span></div>' +
        '</div>' +
        '</div>';

    document.body.appendChild(mask);
    await renderAgentLedger();
}

function closeAgentModal() {
    const mask = document.getElementById("agentModalMask");
    if (mask) mask.remove();
}


/* ========================================
   ä¼šå‘˜ç®¡ç†
   ======================================== */

async function loadMembers() {

    const container = document.getElementById("membersContainer");
    if (!container) return;

    const searchInput = document.getElementById("memberSearch");
    const levelFilter = document.getElementById("memberLevelFilter");
    const roleFilter = document.getElementById("memberRoleFilter");
    const kw = (searchInput ? searchInput.value : "") || "";
    const lv = (levelFilter ? levelFilter.value : "") || "";
    const rl = (roleFilter ? roleFilter.value : "") || "";

    container.innerHTML =
        '<div class="admin-loading-box"><span data-i18n="common.loading">æ­£åœ¨åŠ è½½...</span></div>';

    const myIds =
        await getMyUserIds();

    let membersQuery =
        supabaseClient
        .from("profiles")
        .select("id, username, display_name, email, phone, balance, membership_level, invite_code, invited_by, created_at, role")
        .order("created_at", { ascending: false });

    if (Array.isArray(myIds) && myIds.length > 0) {
        membersQuery = membersQuery.in("id", myIds);
    }

    const { data: members, error } =
        await membersQuery;

    if (error) {
        container.innerHTML = '<div class="admin-loading-box">' + I18N.t("admin.memberEditFailed") + error.message + '</div>';
        return;
    }

    if (!members || members.length === 0) {
        container.innerHTML = '<div class="admin-loading-box"><span data-i18n="admin.membersEmpty">æš‚æ— ä¼šå‘˜æ•°æ®</span></div>';
        return;
    }

    let list = members;

    if (kw) {
        const k = kw.toLowerCase();
        list = list.filter(function (m) {
            return (m.display_name || "").toLowerCase().indexOf(k) >= 0 ||
                   (m.username || "").toLowerCase().indexOf(k) >= 0 ||
                   (m.email || "").toLowerCase().indexOf(k) >= 0 ||
                   (m.phone || "").toLowerCase().indexOf(k) >= 0;
        });
    }

    if (lv) list = list.filter(function (m) { return m.membership_level === lv; });
    if (rl) list = list.filter(function (m) { return m.role === rl; });

    const { data: allInvites } =
        await supabaseClient
        .from("profiles")
        .select("invited_by");

    const id2name = {};
    members.forEach(function (m) {
        id2name[m.id] = m.display_name || m.username || m.email || "?";
    });

    const invCount = {};
    (allInvites || []).forEach(function (r) {
        if (r.invited_by) invCount[r.invited_by] = (invCount[r.invited_by] || 0) + 1;
    });

    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

    const levelNames = {
        basic: I18N.t("member.basic"),
        silver: I18N.t("member.silver"),
        gold: I18N.t("member.gold"),
        platinum: I18N.t("member.platinum"),
        diamond: I18N.t("member.diamond"),
        radiant: I18N.t("member.radiant")
    };

    if (list.length === 0) {
        container.innerHTML = '<div class="admin-empty-box">' + (zh ? "æ²¡æœ‰ç¬¦åˆæ¡ä»¶çš„ç”¨æˆ·" : "No matching users") + '</div>';
        return;
    }

    const rows = list.map(function (m) {

        const levelOpts = ["basic", "silver", "gold", "platinum", "diamond", "radiant"].map(function (l) {
            return '<option value="' + l + '"' + (m.membership_level === l ? " selected" : "") + '>' + levelNames[l] + '</option>';
        }).join("");

        const inviter = m.invited_by ? (id2name[m.invited_by] || "?") : "â€”";
        const name = m.display_name || "â€”";
        const avatar = name.slice(0, 1).toUpperCase();
        const isAdmin = m.role === "admin";

        return (
            '<div class="admin-member-card" data-uid="' + m.id + '">' +

            '<div class="admin-member-main">' +
            '<div class="admin-member-avatar">' + avatar + '</div>' +
            '<div class="admin-member-info">' +
            '<strong class="admin-member-name">' + name +
            '<span class="admin-badge ' + (isAdmin ? "admin-badge-admin" : "admin-badge-user") + '">' +
            (isAdmin ? "ADMIN" : "USER") + '</span></strong>' +
            '<span class="admin-member-mail">' + (m.email || "") + '</span>' +
            '<span class="admin-member-mail">' + (m.phone || "") + (m.username ? " Â· @" + m.username : "") + '</span>' +
            '</div>' +
            '</div>' +

            '<div class="admin-member-cell">' +
            '<select class="admin-member-select" data-field="membership_level" data-uid="' + m.id + '">' + levelOpts + '</select>' +
            '</div>' +

            '<div class="admin-member-cell">' +
            '<input class="admin-member-input" data-field="balance" data-uid="' + m.id + '" value="' + Number(m.balance || 0) + '" />' +
            '</div>' +

            '<div class="admin-member-cell admin-member-invite">' +
            '<code>' + (m.invite_code || "â€”") + '</code>' +
            '<small>' + I18N.t("admin.invitesCount").replace("{n}", String(invCount[m.id] || 0)) + '</small>' +
            '</div>' +

            '<div class="admin-member-cell">' + inviter + '</div>' +

            '<div class="admin-member-cell">' + fmtMemberDate(m.created_at) + '</div>' +

            '<div class="admin-member-cell">' +
            '<div class="admin-member-actions">' +
            '<button class="admin-mini-btn" onclick="openMemberDetail(\'' + m.id + '\')">ðŸ‘ ' + (zh ? "è¯¦æƒ…" : "Detail") + '</button>' +
            '<button class="admin-mini-btn gold" onclick="adjustBalance(\'' + m.id + '\')">âš–ï¸ ' + (zh ? "è°ƒè´¦" : "Adjust") + '</button>' +
            '<button class="admin-mini-btn" style="background:#3b82f6;color:white" onclick="resetDailyClaims(\'' + m.id + '\')">ðŸ”„ ' + (zh ? "é‡ç½®ä»Šæ—¥æ¬¡æ•°" : "Reset Daily") + '</button>' +
            '<button class="admin-mini-btn" style="background:#dc2626;color:white" onclick="wipeUserData(\'' + m.id + '\', \'' + m.email + '\')">ðŸ§¹ ' + (zh ? "æ¸…é™¤æ•°æ®" : "Wipe Data") + '</button>' +
            (currentAdminRole === "admin" && m.id !== currentAgentUserId
                ? '<button class="admin-mini-btn danger" onclick="adminDeleteMember(\'' + m.id + '\')">ðŸ—‘ ' + (zh ? "åˆ é™¤" : "Delete") + '</button>'
                : '') +
            (currentAdminRole === "agent" && m.id !== currentAgentUserId
                ? '<button class="admin-mini-btn danger" onclick="agentRemoveUser(\'' + m.id + '\')">âœ• ' + (zh ? "ç§»é™¤" : "Remove") + '</button>'
                  + '<button class="admin-mini-btn" onclick="agentResetPassword(\'' + m.id + '\')">ðŸ”‘ ' + (zh ? "é‡ç½®å¯†ç " : "Reset Pwd") + '</button>'
                : '') +
            '<button class="admin-member-save" onclick="saveMember(this)" data-uid="' + m.id + '">' + I18N.t("admin.saveMember") + '</button>' +
            '</div>' +
            '</div>' +

            '</div>'
        );

    }).join("");

    container.innerHTML =
        '<div class="admin-member-table">' +
        '<div class="admin-member-head">' +
        '<span data-i18n="admin.colUser">ç”¨æˆ·</span>' +
        '<span data-i18n="admin.colLevel">ç­‰çº§</span>' +
        '<span data-i18n="admin.colBalance">ä½™é¢</span>' +
        '<span data-i18n="admin.colInvite">é‚€è¯·ç </span>' +
        '<span data-i18n="admin.colInvitedBy">é‚€è¯·äºº</span>' +
        '<span data-i18n="admin.colJoined">æ³¨å†Œæ—¶é—´</span>' +
        '<span data-i18n="admin.colActions">æ“ä½œ</span>' +
        '</div>' +
        rows +
        '</div>';

}

/* ========================================
   Dashboard ç»Ÿè®¡å¢žå¼º
   ======================================== */

async function loadDashboardStats() {

    try {

        const { count: users } =
            await supabaseClient
            .from("profiles")
            .select("id", { count: "exact" });

        setStat("statUsers", users || 0);

        const malayDate =
            new Date(Date.now() + 8 * 3600 * 1000)
            .toISOString().slice(0, 10);

        const dayStartUTC =
            new Date(malayDate + "T00:00:00Z")
            .getTime() - 8 * 3600 * 1000;

        const { count: newUsers } =
            await supabaseClient
            .from("profiles")
            .select("id", { count: "exact" })
            .gte("created_at", new Date(dayStartUTC).toISOString());

        setStat("statNewUsers", newUsers || 0);

        const { count: pendingReviews } =
            await supabaseClient
            .from("task_claims")
            .select("id", { count: "exact" })
            .eq("status", "submitted");

        setStat("statPendingReviews", pendingReviews || 0);

        try {
            const { data: pendW } = await supabaseClient.rpc("admin_get_pending_withdrawals");
            setStat("statPendingWithdrawals", (pendW && pendW.length) || 0);
        } catch (e) {
            setStat("statPendingWithdrawals", 0);
        }

        const { data: txs } =
            await supabaseClient
            .from("wallet_transactions")
            .select("amount, type");

        let totalIn = 0, totalRewards = 0;
        (txs || []).forEach(function (t) {
            const a = Number(t.amount || 0);
            if (a > 0) totalIn += a;
            if (t.type === "task_reward") totalRewards += a;
        });

        setStat("statTotalFlow", "RM" + totalIn.toFixed(2));
        setStat("statTotalRewards", "RM" + totalRewards.toFixed(2));

        // ä»Šæ—¥é”€å”®é¢å’Œå®Œæˆè®¢å•
        try {
            const { data: todayOrders } = await supabaseClient
                .from("shop_orders")
                .select("total")
                .eq("status", "completed")
                .gte("reviewed_at", new Date(dayStartUTC).toISOString());
            const todaySales = (todayOrders || []).reduce((sum, o) => sum + Number(o.total || 0), 0);
            setStat("statTodaySales", "RM" + todaySales.toFixed(2));
            setStat("statTodayOrders", (todayOrders || []).length);
        } catch (e) {
            setStat("statTodaySales", "RM0.00");
            setStat("statTodayOrders", 0);
        }

    } catch (e) {
        console.error("dashboard stats failed", e);
    }

    // æœ€è¿‘æ³¨å†Œ
    try {

        const box = document.getElementById("recentMembersBox");
        if (!box) return;

        const { data: recent } =
            await supabaseClient
            .from("profiles")
            .select("display_name, username, email, phone, created_at, role, membership_level")
            .order("created_at", { ascending: false })
            .limit(5);

        if (!recent || recent.length === 0) {
            box.innerHTML = '<div class="admin-empty-note">' + (typeof I18N !== "undefined" && I18N.get() === "zh" ? "æš‚æ— ç”¨æˆ·" : "No users yet") + '</div>';
            return;
        }

        const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

        box.innerHTML = recent.map(function (m) {
            const nm = m.display_name || m.username || m.email || "?";
            const isAdmin = m.role === "admin";
            return '<div class="admin-recent-item">' +
                '<span class="ledger-ava" style="flex:none">' + nm.slice(0, 1).toUpperCase() + '</span>' +
                '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + nm + ' Â· ' + (m.email || "") + '</span>' +
                '<span class="admin-badge ' + (isAdmin ? "admin-badge-admin" : "admin-badge-user") + '" style="flex:none">' + (isAdmin ? "ADMIN" : "USER") + '</span>' +
                '<small style="flex:none;color:#94a3b8">' + fmtMemberDate(m.created_at) + '</small>' +
                '</div>';
        }).join("");

    } catch (e) {
        console.error("recent members failed", e);
    }

}

function setStat(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}


/* ========================================
   é’±åŒ…æµæ°´ï¼ˆå…¨å¹³å°ï¼‰
   ======================================== */

async function loadLedger() {

    const container = document.getElementById("ledgerContainer");
    if (!container) return;

    const filter = (document.getElementById("ledgerTypeFilter") || {}).value || "";

    container.innerHTML =
        '<div class="admin-loading-box"><span data-i18n="common.loading">æ­£åœ¨åŠ è½½...</span></div>';

    try {

        const myIds =
            await getMyUserIds();

        let txQuery =
            supabaseClient
            .from("wallet_transactions")
            .select("id, user_id, amount, type, note, created_at")
            .order("created_at", { ascending: false })
            .limit(300);

        if (Array.isArray(myIds) && myIds.length > 0) {
            txQuery = txQuery.in("user_id", myIds);
        }

        const { data: txs, error } =
            await txQuery;

        if (error) throw error;

        const userIds = [];
        (txs || []).forEach(function (t) {
            if (t.user_id && userIds.indexOf(t.user_id) < 0) userIds.push(t.user_id);
        });

        const userMap = {};
        if (userIds.length > 0) {
            const { data: profs } =
                await supabaseClient
                .from("profiles")
                .select("id, display_name, username, email")
                .in("id", userIds);
            (profs || []).forEach(function (p) {
                userMap[p.id] = p.display_name || p.username || p.email || "?";
            });
        }

        const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

        let list = txs || [];
        if (filter) list = list.filter(function (t) { return t.type === filter; });

        // é‡‘é¢æ–¹å‘
        const dirFilter = (document.getElementById("ledgerDirFilter") || {}).value || "";
        if (dirFilter === "in") list = list.filter(function (t) { return Number(t.amount || 0) >= 0; });
        if (dirFilter === "out") list = list.filter(function (t) { return Number(t.amount || 0) < 0; });

        // æ—¥æœŸèŒƒå›´
        const dateFrom = (document.getElementById("ledgerDateFrom") || {}).value || "";
        const dateTo = (document.getElementById("ledgerDateTo") || {}).value || "";
        if (dateFrom) list = list.filter(function (t) { return t.created_at && t.created_at >= dateFrom + "T00:00:00"; });
        if (dateTo) list = list.filter(function (t) { return t.created_at && t.created_at <= dateTo + "T23:59:59"; });

        // å…³é”®è¯æœç´¢ï¼ˆç”¨æˆ·/å¤‡æ³¨ï¼‰
        const kw = ((document.getElementById("ledgerSearch") || {}).value || "").trim().toLowerCase();
        if (kw) list = list.filter(function (t) {
            const un = (userMap[t.user_id] || "").toLowerCase();
            const nt = (t.note || "").toLowerCase();
            return un.indexOf(kw) >= 0 || nt.indexOf(kw) >= 0;
        });

        // æ±‡æ€»ç»Ÿè®¡
        const sumIn = list.filter(function(t){return Number(t.amount||0)>=0;}).reduce(function(s,t){return s+Number(t.amount||0);},0);
        const sumOut = list.filter(function(t){return Number(t.amount||0)<0;}).reduce(function(s,t){return s+Number(t.amount||0);},0);

        // ç»Ÿè®¡æ¡
        const statBar = '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;font-size:13px">' +
            '<span style="background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);padding:6px 12px;border-radius:8px;color:#4ade80">æ”¶å…¥åˆè®¡ï¼š+RM' + sumIn.toFixed(2) + '</span>' +
            '<span style="background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);padding:6px 12px;border-radius:8px;color:#f87171">æ”¯å‡ºåˆè®¡ï¼šRM' + Math.abs(sumOut).toFixed(2) + '</span>' +
            '<span style="background:rgba(255,255,255,.06);padding:6px 12px;border-radius:8px;color:#94a3b8">å…± ' + list.length + ' ç¬”</span>' +
            '</div>';

        if (list.length === 0) {
            container.innerHTML = statBar + '<div class="admin-empty-box">' + (zh ? "æš‚æ— æµæ°´è®°å½•" : "No transactions") + '</div>';
            return;
        }

        const typeName = function (t) {
            if (t === "task_reward") return zh ? "ä»»åŠ¡ä½£é‡‘" : "Reward";
            if (t === "withdrawal") return zh ? "æçŽ°" : "Withdrawal";
            if (t === "adjustment") return zh ? "ç®¡ç†å‘˜è°ƒæ•´" : "Adjustment";
            if (t === "shopping_reward") return zh ? "è´­ç‰©å¥–åŠ±" : "Shopping Reward";
            return zh ? "å…¶ä»–" : "Other";
        };

        const typeCls = function (t) {
            if (t === "task_reward") return "ledger-type-reward";
            if (t === "withdrawal") return "ledger-type-withdrawal";
            if (t === "adjustment") return "ledger-type-adjust";
            if (t === "shopping_reward") return "ledger-type-reward";
            return "ledger-type-other";
        };

        const rowsHtml = list.map(function (t) {
            const a = Number(t.amount || 0);
            const pos = a >= 0;
            const name = userMap[t.user_id] || "â€”";
            const d = t.created_at ? new Date(t.created_at).toLocaleString(zh ? "zh-CN" : "en-GB") : "â€”";
            return '<tr>' +
                '<td><div class="ledger-user"><span class="ledger-ava">' + name.slice(0, 1).toUpperCase() + '</span>' +
                '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px">' + name + '</span></div></td>' +
                '<td><span class="ledger-type-tag ' + typeCls(t.type) + '">' + typeName(t.type) + '</span></td>' +
                '<td class="admin-tx-amt ' + (pos ? "pos" : "neg") + '">' + (pos ? "+" : "-") + "RM" + Math.abs(a).toFixed(2) + '</td>' +
                '<td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (t.note || "â€”") + '</td>' +
                '<td style="white-space:nowrap;color:#94a3b8">' + d + '</td>' +
                '</tr>';
        }).join("");

        container.innerHTML =
            statBar +
            '<div class="admin-ledger-wrap">' +
            '<table class="admin-ledger-table">' +
            '<thead><tr>' +
            '<th>' + (zh ? "ç”¨æˆ·" : "User") + '</th>' +
            '<th>' + (zh ? "ç±»åž‹" : "Type") + '</th>' +
            '<th>' + (zh ? "é‡‘é¢" : "Amount") + '</th>' +
            '<th>' + (zh ? "å¤‡æ³¨" : "Note") + '</th>' +
            '<th>' + (zh ? "æ—¶é—´" : "Time") + '</th>' +
            '</tr></thead><tbody>' + rowsHtml + '</tbody></table></div>';

    } catch (e) {
        console.error("ledger failed", e);
        container.innerHTML = '<div class="admin-error-box">' + e.message + '</div>';
    }

}


let __ledgerSearchTimer = null;
function debounceLedgerSearch() {
    clearTimeout(__ledgerSearchTimer);
    __ledgerSearchTimer = setTimeout(function(){ loadLedger(); }, 350);
}


/* ========================================
   ä¼šå‘˜è¯¦æƒ…å¼¹çª—
   ======================================== */

async function openMemberDetail(uid) {

    closeMemberDetail();

    try {

        const { data: p, error: perr } =
            await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", uid)
            .single();

        if (perr) throw perr;
        if (!p) return;

        const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

        // æµæ°´
        const { data: txs } =
            await supabaseClient
            .from("wallet_transactions")
            .select("id, amount, type, note, created_at")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(20);

        // é¢†å–è®°å½• + ä»»åŠ¡æ ‡é¢˜
        const { data: claims } =
            await supabaseClient
            .from("task_claims")
            .select("id, task_id, status, claimed_at")
            .eq("user_id", uid)
            .order("claimed_at", { ascending: false })
            .limit(20);

        let taskMap = {};
        if (claims && claims.length > 0) {
            const { data: tasks } =
                await supabaseClient
                .from("tasks")
                .select("id, title")
                .in("id", claims.map(function (c) { return c.task_id; }));
            (tasks || []).forEach(function (t) { taskMap[String(t.id)] = t.title; });
        }

        // é‚€è¯·å…³ç³»
        let inviterName = "â€”";
        if (p.invited_by) {
            const { data: inv } = await supabaseClient.from("profiles").select("display_name, username, email").eq("id", p.invited_by).maybeSingle();
            if (inv) inviterName = inv.display_name || inv.username || inv.email || "?";
        }

        const { data: invitedList } =
            await supabaseClient
            .from("profiles")
            .select("display_name, username, email, created_at")
            .eq("invited_by", uid);

        const levelNames = {
            basic: I18N.t("member.basic"),
            silver: I18N.t("member.silver"),
            gold: I18N.t("member.gold"),
            platinum: I18N.t("member.platinum"),
            diamond: I18N.t("member.diamond"),
            radiant: I18N.t("member.radiant")
        };
        const levelOpts = ["basic", "silver", "gold", "platinum", "diamond", "radiant"].map(function (l) {
            return '<option value="' + l + '"' + (p.membership_level === l ? " selected" : "") + '>' + levelNames[l] + '</option>';
        }).join("");

        const isAdmin = p.role === "admin";
        const isAgent = p.role === "agent";
        const roleOpts = '<option value="user"' + (!isAdmin && !isAgent ? " selected" : "") + '>' + (zh ? "æ™®é€šç”¨æˆ·" : "User") + '</option>' +
                         '<option value="agent"' + (isAgent ? " selected" : "") + '>' + (zh ? "ä»£ç†" : "Agent") + '</option>' +
                         '<option value="admin"' + (isAdmin ? " selected" : "") + '>' + (zh ? "ç®¡ç†å‘˜" : "Admin") + '</option>';
        // è§’è‰²å­—æ®µï¼šä»…æ€»ç®¡ç†å‘˜å¯ç¼–è¾‘ï¼›ä»£ç†åªè¯»å±•ç¤ºï¼ˆé˜²æ­¢è¶Šæƒæ„Ÿ/è¯¯æ”¹ï¼‰
        const roleName = isAdmin ? (zh ? "ç®¡ç†å‘˜" : "Admin") : isAgent ? (zh ? "ä»£ç†" : "Agent") : (zh ? "æ™®é€šç”¨æˆ·" : "User");
        const roleFieldHtml = (currentAdminRole === "admin")
            ? '<div class="admin-modal-field"><label>' + (zh ? "è§’è‰²" : "Role") + '</label>' +
              '<select id="mdRole">' + roleOpts + '</select></div>'
            : '<div class="admin-modal-field"><label>' + (zh ? "è§’è‰²" : "Role") + '</label>' +
              '<input value="' + roleName + '" readonly /></div>';

        const txRows = (!txs || txs.length === 0)
            ? '<div class="admin-empty-note">' + (zh ? "æš‚æ— æµæ°´" : "No transactions") + '</div>'
            : txs.map(function (t) {
                const a = Number(t.amount || 0);
                const pos = a >= 0;
                const d = t.created_at ? new Date(t.created_at).toLocaleString(zh ? "zh-CN" : "en-GB") : "â€”";
                const tn = t.type === "task_reward" ? (zh ? "ä½£é‡‘" : "Reward") : t.type === "withdrawal" ? (zh ? "æçŽ°" : "Withdrawal") : t.type === "adjustment" ? (zh ? "è°ƒæ•´" : "Adjust") : t.type === "shopping_reward" ? (zh ? "è´­ç‰©å¥–åŠ±" : "Shopping Reward") : (zh ? "å…¶ä»–" : "Other");
                return '<div class="admin-tx-row"><div class="admin-tx-main"><b>' + tn + '</b><small>' + (t.note || "") + '</small><small> ' + d + '</small></div>' +
                    '<div class="admin-tx-amt ' + (pos ? "pos" : "neg") + '">' + (pos ? "+" : "-") + "RM" + Math.abs(a).toFixed(2) + '</div></div>';
            }).join("");

        const claimRows = (!claims || claims.length === 0)
            ? '<div class="admin-empty-note">' + (zh ? "æš‚æ— ä»»åŠ¡è®°å½•" : "No task records") + '</div>'
            : claims.map(function (c) {
                const title = taskMap[String(c.task_id)] || ("#" + c.task_id);
                const st = c.status;
                const stTxt = st === "approved" ? (zh ? "å·²å®Œæˆ" : "Done") : st === "submitted" ? (zh ? "å¾…å®¡æ ¸" : "Pending") : st === "rejected" ? (zh ? "å·²é©³å›ž" : "Rejected") : st === "claimed" ? (zh ? "è¿›è¡Œä¸­" : "In progress") : st;
                const d = c.claimed_at ? new Date(c.claimed_at).toLocaleString(zh ? "zh-CN" : "en-GB") : "â€”";
                const canCancel = (st === 'claimed' || st === 'submitted');
                const cancelBtn = canCancel 
                    ? '<button class="admin-mini-btn danger" style="margin-left:8px" onclick="adminCancelClaim(' + c.id + ', \'' + title.replace(/'/g, "\\'") + '\')">âŒ ' + (zh ? 'å–æ¶ˆ' : 'Cancel') + '</button>'
                    : '';
                return '<div class="admin-tx-row"><div class="admin-tx-main"><b>' + title + '</b><small>' + stTxt + ' Â· ' + d + cancelBtn + '</small></div></div>';
            }).join("");

        const invitedRows = (!invitedList || invitedList.length === 0)
            ? '<div class="admin-empty-note">' + (zh ? "æš‚æ— é‚€è¯·" : "No invites") + '</div>'
            : invitedList.map(function (u) {
                const nm = u.display_name || u.username || u.email || "?";
                return '<div class="admin-tx-row"><div class="admin-tx-main"><b>' + nm + '</b><small>' + (u.email || "") + ' Â· ' + fmtMemberDate(u.created_at) + '</small></div></div>';
            }).join("");

        const mask = document.createElement("div");
        mask.className = "admin-modal-mask";
        mask.id = "memberDetailMask";
        mask.innerHTML =
            '<div class="admin-modal-box">' +

            '<div class="admin-modal-head">' +
            '<h3>ðŸ‘¤ ' + (p.display_name || p.username || p.email || "?") + '</h3>' +
            '<button class="admin-modal-close" onclick="closeMemberDetail()">âœ•</button>' +
            '</div>' +

            '<div class="admin-modal-grid">' +
            '<div class="admin-modal-field"><label>' + (zh ? "æ˜µç§°" : "Nickname") + '</label>' +
            '<input id="mdDisplayName" value="' + (p.display_name || "") + '" /></div>' +
            '<div class="admin-modal-field"><label>' + (zh ? "ç”µè¯" : "Phone") + '</label>' +
            '<input id="mdPhone" value="' + (p.phone || "") + '" /></div>' +
            '<div class="admin-modal-field"><label>' + (zh ? "ç­‰çº§" : "Level") + '</label>' +
            '<select id="mdLevel">' + levelOpts + '</select></div>' +
            '<div class="admin-modal-field"><label>' + (zh ? "ä½™é¢ (RM)" : "Balance (RM)") + '</label>' +
            '<input id="mdBalance" type="number" step="0.01" value="' + Number(p.balance || 0) + '" /></div>' +
            roleFieldHtml +
            '<div class="admin-modal-field"><label>' + (zh ? "é‚€è¯·ç " : "Invite code") + '</label>' +
            '<input value="' + (p.invite_code || "â€”") + '" readonly /></div>' +
            '</div>' +

            // å¦‚æžœæ˜¯ä»£ç†ï¼Œæ˜¾ç¤ºæ”¶æ¬¾è®¾ç½®
            ((p.role === "agent") ?
            '<div class="admin-modal-sec"><div class="admin-modal-sec-title">ðŸ’³ ' + (zh ? "æ”¶æ¬¾è®¾ç½®ï¼ˆå®¢æˆ·ä»˜æ¬¾æ—¶æ˜¾ç¤ºï¼‰" : "Payment settings") + '</div>' +
            '<div class="admin-modal-field"><label>' + (zh ? "æ”¶æ¬¾ç URL" : "QR Code URL") + '</label>' +
            '<input id="mdQrUrl" value="' + (p.agent_qr_url || "") + '" /></div>' +
            '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">' +
            '<div class="admin-modal-field" style="flex:1;min-width:120px"><label>' + (zh ? "é“¶è¡Œå" : "Bank") + '</label>' +
            '<input id="mdBankName" value="' + (p.agent_bank_name || "") + '" /></div>' +
            '<div class="admin-modal-field" style="flex:1;min-width:120px"><label>' + (zh ? "é“¶è¡Œè´¦å·" : "Account") + '</label>' +
            '<input id="mdBankAccount" value="' + (p.agent_bank_account || "") + '" /></div>' +
            '<div class="admin-modal-field" style="flex:1;min-width:120px"><label>' + (zh ? "æ”¶æ¬¾äºº" : "Holder") + '</label>' +
            '<input id="mdBankHolder" value="' + (p.agent_bank_holder || "") + '" /></div>' +
            '</div>' +
            '</div>'
            : '') +

            '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:6px">' +
            '<button class="admin-action-success" onclick="saveMemberDetail()">ðŸ’¾ ' + (zh ? "ä¿å­˜ä¿®æ”¹" : "Save changes") + '</button>' +
            '<button class="admin-mini-btn gold" onclick="adjustBalance(\'' + uid + '\')">âš–ï¸ ' + (zh ? "è°ƒè´¦" : "Adjust") + '</button>' +
            (currentAdminRole === "admin"
                ? '<button class="admin-mini-btn" onclick="setMemberRole()">ðŸ” ' + (zh ? "åˆ‡æ¢è§’è‰²" : "Switch role") + '</button>'
                : '') +
            (currentAdminRole === "admin"
                ? '<button class="admin-mini-btn warn" onclick="adminResetPassword(\'' + uid + '\')">ðŸ”‘ ' + (zh ? "é‡ç½®å¯†ç " : "Reset password") + '</button>'
                : '') +
            '</div>' +

            '<div class="admin-modal-sec"><div class="admin-modal-sec-title">ðŸ’³ ' + (zh ? "é’±åŒ…æµæ°´ï¼ˆæœ€è¿‘ 20 æ¡ï¼‰" : "Wallet transactions (last 20)") + '</div>' + txRows + '</div>' +

            '<div class="admin-modal-sec"><div class="admin-modal-sec-title">ðŸ“‹ ' + (zh ? "ä»»åŠ¡è®°å½•ï¼ˆæœ€è¿‘ 20 æ¡ï¼‰" : "Task records (last 20)") + '</div>' + claimRows + '</div>' +

            '<div class="admin-modal-sec"><div class="admin-modal-sec-title">ðŸ¤ ' + (zh ? "é‚€è¯·å…³ç³»" : "Invite relations") + '</div>' +
            '<div class="admin-tx-row"><div class="admin-tx-main"><b>' + (zh ? "é‚€è¯·äºº" : "Invited by") + '</b><small>' + inviterName + '</small></div></div>' +
            '<div class="admin-tx-row"><div class="admin-tx-main"><b>' + (zh ? "å·²é‚€è¯· " + ((invitedList || []).length) + " äºº" : "Invited " + ((invitedList || []).length) + " users") + '</b></div></div>' +
            invitedRows +
            '</div>' +

            '<input type="hidden" id="mdUid" value="' + uid + '" />' +
            '<input type="hidden" id="mdRoleVal" value="' + (p.role || "user") + '" />' +
            '</div>';

        document.body.appendChild(mask);

    } catch (e) {
        console.error("detail failed", e);
        alert(e.message);
    }

}


// ç®¡ç†å‘˜/ä»£ç†ï¼šå–æ¶ˆç”¨æˆ·çš„ä»»åŠ¡
async function adminCancelClaim(claimId, taskTitle) {
    if (!confirm('ç¡®å®šè¦å–æ¶ˆè¿™ä¸ªä»»åŠ¡å—ï¼Ÿ\nä»»åŠ¡ï¼š' + taskTitle + '\n\nå–æ¶ˆåŽè¯¥ç”¨æˆ·çš„æ¯æ—¥ä»»åŠ¡åé¢ä¼šé‡Šæ”¾ã€‚')) return;
    
    const { error } = await supabaseClient
        .from('task_claims')
        .update({ status: 'cancelled' })
        .eq('id', claimId);
    
    if (error) {
        alert('âŒ å–æ¶ˆå¤±è´¥ï¼š' + error.message);
        return;
    }
    
    alert('âœ… ä»»åŠ¡å·²å–æ¶ˆ');
    // åˆ·æ–°è¯¦æƒ…
    const uid = document.getElementById('mdUid').value;
    openMemberDetail(uid);
}

function closeMemberDetail() {
    const mask = document.getElementById("memberDetailMask");
    if (mask) mask.remove();
}

/* ========================================
   æ–°å¢žä¼šå‘˜ / åˆ é™¤ä¼šå‘˜ / é‡ç½®å¯†ç ï¼ˆä»…ç®¡ç†å‘˜ï¼‰
   ======================================== */

function openCreateMember() {

    closeMemberDetail();

    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

    const mask = document.createElement("div");
    mask.className = "admin-modal-mask";
    mask.id = "createMemberMask";
    mask.innerHTML =
        '<div class="admin-modal-box">' +
        '<div class="admin-modal-head"><h3>âž• ' + (zh ? "æ–°å¢žä¼šå‘˜" : "Create member") + '</h3>' +
        '<button class="admin-modal-close" onclick="closeCreateMember()">âœ•</button></div>' +

        '<div class="admin-modal-grid">' +
        '<div class="admin-modal-field"><label>' + (zh ? "é‚®ç®±ï¼ˆç™»å½•è´¦å·ï¼‰" : "Email (login)") + '</label>' +
        '<input id="cmEmail" type="email" placeholder="user@example.com" /></div>' +
        '<div class="admin-modal-field"><label>' + (zh ? "å¯†ç ï¼ˆè‡³å°‘ 6 ä½ï¼‰" : "Password (min 6)") + '</label>' +
        '<input id="cmPassword" type="password" placeholder="Aa112233" /></div>' +
        '<div class="admin-modal-field"><label>' + (zh ? "æ˜µç§°" : "Nickname") + '</label>' +
        '<input id="cmName" placeholder="' + (zh ? "é€‰å¡«" : "optional") + '" /></div>' +
        '<div class="admin-modal-field"><label>' + (zh ? "æ‰‹æœºå·" : "Phone") + '</label>' +
        '<input id="cmPhone" placeholder="' + (zh ? "é€‰å¡«" : "optional") + '" /></div>' +
        '<div class="admin-modal-field"><label>' + (zh ? "è§’è‰²" : "Role") + '</label>' +
        '<select id="cmRole"><option value="user">' + (zh ? "æ™®é€šç”¨æˆ·" : "User") + '</option>' +
        '<option value="agent">' + (zh ? "ä»£ç†" : "Agent") + '</option></select></div>' +
        '</div>' +

        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px">' +
        '<button class="admin-refresh-btn" onclick="closeCreateMember()">' + (zh ? "å–æ¶ˆ" : "Cancel") + '</button>' +
        '<button class="admin-action-success" onclick="adminCreateMember()">âœ… ' + (zh ? "åˆ›å»ºä¼šå‘˜" : "Create") + '</button>' +
        '</div>' +
        '</div>';

    document.body.appendChild(mask);
}

function closeCreateMember() {
    const mask = document.getElementById("createMemberMask");
    if (mask) mask.remove();
}

async function adminCreateMember() {

    const email = (document.getElementById("cmEmail").value || "").trim();
    const password = document.getElementById("cmPassword").value || "";
    const name = (document.getElementById("cmName").value || "").trim();
    const phone = (document.getElementById("cmPhone").value || "").trim();
    const role = document.getElementById("cmRole").value;

    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

    if (!email || email.indexOf("@") < 0) {
        alert(zh ? "è¯·å¡«å†™æœ‰æ•ˆçš„é‚®ç®±" : "Please enter a valid email");
        return;
    }
    if (password.length < 6) {
        alert(zh ? "å¯†ç è‡³å°‘éœ€è¦ 6 ä½" : "Password must be at least 6 characters");
        return;
    }

    const { data, error } =
        await supabaseClient
        .rpc("admin_create_member", {
            p_email: email,
            p_password: password,
            p_display_name: name || null,
            p_phone: phone || null,
            p_role: role
        });

    if (error) {
        const msg = error.message || "";
        if (msg.indexOf("EMAIL_TAKEN") >= 0) alert(zh ? "è¯¥é‚®ç®±å·²è¢«æ³¨å†Œ" : "Email already taken");
        else if (msg.indexOf("FORBIDDEN") >= 0) alert(zh ? "æ²¡æœ‰æƒé™" : "Forbidden");
        else alert((zh ? "åˆ›å»ºå¤±è´¥ï¼š" : "Create failed: ") + msg);
        return;
    }

    closeCreateMember();
    alert((zh ? "ä¼šå‘˜åˆ›å»ºæˆåŠŸ" : "Member created") + "ï¼š " + (data && data.email ? data.email : email));
    await loadMembers();
    await loadDashboardStats();
}

async function adminDeleteMember(uid) {

    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

    if (!confirm(zh
        ? "ç¡®å®šåˆ é™¤è¯¥ä¼šå‘˜å—ï¼Ÿ\n\nå°†æ°¸ä¹…åˆ é™¤è¯¥ç”¨æˆ·çš„è´¦å·ã€æµæ°´ã€ä»»åŠ¡è®°å½•ç­‰å…¨éƒ¨æ•°æ®ï¼Œä¸”æ— æ³•æ¢å¤ï¼"
        : "Delete this member permanently?\n\nThis removes the account, transactions and task records. This cannot be undone!")) return;

    const { error } =
        await supabaseClient
        .rpc("admin_delete_member", {
            p_user_id: uid
        });

    if (error) {
        const msg = error.message || "";
        if (msg.indexOf("CANNOT_DELETE_SELF") >= 0) alert(zh ? "ä¸èƒ½åˆ é™¤è‡ªå·±" : "Cannot delete yourself");
        else if (msg.indexOf("CANNOT_DELETE_ADMIN") >= 0) alert(zh ? "ä¸èƒ½åˆ é™¤ç®¡ç†å‘˜è´¦å·" : "Cannot delete an admin");
        else if (msg.indexOf("USER_CREATED_TASKS") >= 0) alert(zh ? "è¯¥ç”¨æˆ·å‘å¸ƒè¿‡ä»»åŠ¡ï¼Œæ— æ³•åˆ é™¤" : "This user created tasks; cannot delete");
        else if (msg.indexOf("USER_NOT_FOUND") >= 0) alert(zh ? "ç”¨æˆ·ä¸å­˜åœ¨" : "User not found");
        else alert((zh ? "åˆ é™¤å¤±è´¥ï¼š" : "Delete failed: ") + msg);
        return;
    }

    alert(zh ? "ä¼šå‘˜å·²åˆ é™¤" : "Member deleted");
    await loadMembers();
    await loadDashboardStats();
}

async function adminResetPassword(uid) {

    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

    const pwd = prompt(zh
        ? "è¯·è¾“å…¥è¯¥ä¼šå‘˜çš„æ–°å¯†ç ï¼ˆè‡³å°‘ 6 ä½ï¼‰ï¼š"
        : "Enter the new password (min 6 characters):");

    if (pwd === null) return;

    if (pwd.length < 6) {
        alert(zh ? "å¯†ç è‡³å°‘éœ€è¦ 6 ä½" : "Password must be at least 6 characters");
        return;
    }

    const { error } =
        await supabaseClient
        .rpc("admin_reset_password", {
            p_user_id: uid,
            p_new_password: pwd
        });

    if (error) {
        const msg = error.message || "";
        if (msg.indexOf("FORBIDDEN") >= 0) alert(zh ? "æ²¡æœ‰æƒé™" : "Forbidden");
        else if (msg.indexOf("USER_NOT_FOUND") >= 0) alert(zh ? "ç”¨æˆ·ä¸å­˜åœ¨" : "User not found");
        else alert((zh ? "é‡ç½®å¤±è´¥ï¼š" : "Reset failed: ") + msg);
        return;
    }

    alert(zh ? "å¯†ç å·²é‡ç½®æˆåŠŸ" : "Password reset successfully");
}

async function saveMemberDetail() {

    const uid = document.getElementById("mdUid").value;
    const level = document.getElementById("mdLevel").value;
    const balance = Number(document.getElementById("mdBalance").value);
    const dname = document.getElementById("mdDisplayName").value;
    const phone = document.getElementById("mdPhone").value;

    const { error } =
        await supabaseClient
        .rpc("admin_update_membership", {
            p_user_id: uid,
            p_level: level,
            p_balance: balance,
            p_display_name: dname,
            p_phone: phone
        });

    if (error) {
        alert((typeof I18N !== "undefined" && I18N.get() === "zh" ? "ä¿å­˜å¤±è´¥ï¼š" : "Save failed: ") + error.message);
        return;
    }

    closeMemberDetail();
    await loadMembers();
    await loadDashboardStats();

}

async function setMemberRole() {

    const uid = document.getElementById("mdUid").value;
    const newRole = document.getElementById("mdRole").value;
    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

    if (!confirm(zh ? "ç¡®å®šå°†è§’è‰²æ”¹ä¸º " + (newRole === "admin" ? "ç®¡ç†å‘˜" : newRole === "agent" ? "ä»£ç†" : "æ™®é€šç”¨æˆ·") + " å—ï¼Ÿ" : "Set role to " + newRole + "?")) return;

    const { error } =
        await supabaseClient
        .rpc("admin_set_role", {
            p_user_id: uid,
            p_role: newRole
        });

    if (error) {
        alert((zh ? "æ“ä½œå¤±è´¥ï¼š" : "Failed: ") + error.message);
        return;
    }

    alert(zh ? "è§’è‰²å·²æ›´æ–°" : "Role updated");
    closeMemberDetail();
    await loadMembers();
    if (currentAdminRole === "admin") await loadAgents();

}

async function adjustBalance(uid) {

    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

    const { data: p } =
        await supabaseClient
        .from("profiles")
        .select("display_name, username, email, balance")
        .eq("id", uid)
        .single();

    const name = (p && (p.display_name || p.username || p.email)) || uid;

    const raw = prompt(
        (zh ? "ä¸º " + name + " è°ƒè´¦\nå½“å‰ä½™é¢ï¼šRM" + (p ? Number(p.balance || 0).toFixed(2) : "0.00") +
         "\næ­£æ•°=å……å€¼ï¼Œè´Ÿæ•°=æ‰£æ¬¾ï¼Œä¾‹ï¼š10 æˆ– -5" : "Adjust balance for " + name +
         "\nCurrent: RM" + (p ? Number(p.balance || 0).toFixed(2) : "0.00") + "\nPositive=credit, Negative=debit, e.g. 10 or -5")
    );

    if (raw === null || raw.trim() === "") return;

    const amount = Number(raw);
    if (isNaN(amount) || amount === 0) {
        alert(zh ? "è¯·è¾“å…¥æœ‰æ•ˆçš„éžé›¶é‡‘é¢" : "Enter a valid non-zero amount");
        return;
    }

    const note = prompt(zh ? "å¤‡æ³¨ï¼ˆå¯é€‰ï¼Œå°†æ˜¾ç¤ºåœ¨ç”¨æˆ·é’±åŒ…è®°å½•ä¸­ï¼‰ï¼š" : "Note (optional, shown in user's wallet):") || "";

    const { data: newBal, error } =
        await supabaseClient
        .rpc("admin_adjust_balance", {
            p_user_id: uid,
            p_amount: amount,
            p_note: note
        });

    if (error) {
        alert((zh ? "è°ƒè´¦å¤±è´¥ï¼š" : "Adjust failed: ") + error.message);
        return;
    }

    alert(zh ? "è°ƒè´¦æˆåŠŸï¼Œå½“å‰ä½™é¢ï¼šRM" + Number(newBal).toFixed(2) : "Done. New balance: RM" + Number(newBal).toFixed(2));
    await loadMembers();
    await loadDashboardStats();
    await loadLedger();

}


function fmtMemberDate(iso) {
    if (!iso) return "â€”";
    const d = new Date(iso);
    return d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");
}

async function saveMember(btn) {

    const uid = btn.getAttribute("data-uid");
    const card = document.querySelector('.admin-member-card[data-uid="' + uid + '"]');
    if (!card) return;

    const level = card.querySelector('[data-field="membership_level"]').value;
    const balance = Number(card.querySelector('[data-field="balance"]').value);

    // è¯¦æƒ…å¼¹çª—ä¸­çš„ç¼–è¾‘è¡¨å•ï¼ˆå¯é€‰ï¼‰
    let dname = null, phone = null;
    if (document.getElementById("mdDisplayName") && document.getElementById("mdUid") && document.getElementById("mdUid").value === uid) {
        dname = document.getElementById("mdDisplayName").value;
        phone = document.getElementById("mdPhone").value;
    }

    btn.disabled = true;

    const { error } =
        await supabaseClient
        .rpc("admin_update_membership", {
            p_user_id: uid,
            p_level: level,
            p_balance: balance,
            p_display_name: dname,
            p_phone: phone
        });

    btn.disabled = false;

    if (error) {
        alert(I18N.t("admin.memberEditFailed") + error.message);
        return;
    }

    alert(I18N.t("admin.memberEdited"));
    await loadMembers();
    await loadDashboardStats();

}


/* ========================================
   ä»»åŠ¡å›¾ç‰‡é€‰æ‹© / æ¸…é™¤
   ======================================== */

let taskImageFile = null;

function previewTaskImage() {

    const input =
        document.getElementById(
            "taskImage"
        );

    const nameEl =
        document.getElementById(
            "taskImageName"
        );

    const preview =
        document.getElementById(
            "taskImagePreview"
        );

    const removeBtn =
        document.getElementById(
            "taskImageRemove"
        );

    const file =
        input && input.files
            ? input.files[0]
            : null;

    if (!file) {

        return;

    }

    if (
        !file.type ||
        file.type.indexOf(
            "image/"
        ) !== 0
    ) {

        alert(
            I18N.t(
                "admin.needImageFile"
            )
        );

        input.value = "";

        return;

    }

    if (
        file.size >
        5 * 1024 * 1024
    ) {

        alert(
            I18N.t(
                "admin.imageTooLarge"
            )
        );

        input.value = "";

        return;

    }

    taskImageFile = file;

    if (nameEl) {

        nameEl.textContent =
            file.name;

    }

    if (preview) {

        preview.src =
            URL.createObjectURL(
                file
            );

        preview.style.display =
            "block";

    }

    if (removeBtn) {

        removeBtn.style.display =
            "";

    }

}


function clearTaskImage() {

    taskImageFile = null;

    const input =
        document.getElementById(
            "taskImage"
        );

    const nameEl =
        document.getElementById(
            "taskImageName"
        );

    const preview =
        document.getElementById(
            "taskImagePreview"
        );

    const removeBtn =
        document.getElementById(
            "taskImageRemove"
        );

    if (input) {

        input.value = "";

    }

    if (nameEl) {

        nameEl.textContent =
            "";

    }

    if (preview) {

        preview.style.display =
            "none";

        preview.src =
            "";

    }

    if (removeBtn) {

        removeBtn.style.display =
            "none";

    }

}


async function uploadTaskImage() {

    if (!taskImageFile) {

        return null;

    }

    const file =
        taskImageFile;

    const ext =
        (
            file.name.split(".").pop() ||
            "jpg"
        ).toLowerCase()
            .replace(
                /[^a-z0-9]/g,
                ""
            );

    const path =
        "task_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 8) +
        "." +
        ext;

    const {
        error: upError
    } =
        await supabaseClient
            .storage
            .from("task-images")
            .upload(
                path,
                file,
                {
                    cacheControl:
                        "3600",
                    upsert: false,
                    contentType:
                        file.type ||
                        "image/jpeg"
                }
            );

    if (upError) {

        throw new Error(
            I18N.t(
                "admin.imageUploadFailed"
            ) +
            upError.message
        );

    }

    const {
        data: pubData
    } =
        supabaseClient
            .storage
            .from("task-images")
            .getPublicUrl(
                path
            );

    return (
        pubData &&
        pubData.publicUrl
    );

}



/* ========================================
   å‘å¸ƒä»»åŠ¡
   ======================================== */

// ========================================
// ä»»åŠ¡ç±»åž‹åˆ‡æ¢ï¼šç‚¹èµž / å•†åŸŽ / è¯„è®º / å…³æ³¨ä»»åŠ¡
// ========================================

function onTaskTypeChange() {

    const typeInput =
        document.querySelector(
            'input[name="taskType"]:checked'
        );

    const type =
        (typeInput && typeInput.value) ||
        "shop";

    const linkGroup =
        document.getElementById(
            "taskLinkGroup"
        );

    if (linkGroup) {

        linkGroup.style.display =
            (type === "like" || type === "review" || type === "follow") ? "" : "none";

    }

    document
        .querySelectorAll(".shop-task-field")
        .forEach(el => {

            el.style.display =
                type === "shop" ? "" : "none";

        });

    const inviteGroup = document.getElementById("inviteSettingsGroup");
    if (inviteGroup) {
        inviteGroup.style.display = type === "invite" ? "" : "none";
    }

    
    // åˆ‡æ¢å¥–åŠ±è¾“å…¥æ¡†æ˜¾ç¤ºï¼šå•†åŸŽ/é‚€è¯·å¥½å‹ä»»åŠ¡è‡ªåŠ¨è®¡ç®—ï¼Œå…¶ä»–ä»»åŠ¡æ˜¾ç¤ºæ‰‹åŠ¨è¾“å…¥æ¡†
    const normalRewardGroup = document.getElementById("normalRewardGroup");
    const shopRewardGroup = document.getElementById("shopRewardGroup");
    if (normalRewardGroup && shopRewardGroup) {
        if (type === "shop" || type === "invite") {
            normalRewardGroup.style.display = "none";
            shopRewardGroup.style.display = "";
            if (type === "shop") {
                shopRewardGroup.querySelector("div").innerText = "âœ… å•†åŸŽä»»åŠ¡ä½£é‡‘æ ¹æ®ç”¨æˆ·ä¼šå‘˜ç­‰çº§æŒ‰è®¢å•é‡‘é¢æ¯”ä¾‹è‡ªåŠ¨è®¡ç®—å‘æ”¾ï¼Œæ— éœ€æ‰‹åŠ¨å¡«å†™";
            } else {
                shopRewardGroup.querySelector("div").innerText = "âœ… é‚€è¯·å¥½å‹ä»»åŠ¡å¥–åŠ±ä¸ºå›ºå®šå•ä»·ï¼ŒæŒ‰é‚€è¯·æˆåŠŸäººæ•°è‡ªåŠ¨å‘æ”¾ï¼Œæ— éœ€æ‰‹åŠ¨å¡«å†™";
            }
            document.getElementById("taskReward").required = false;
        } else {
            normalRewardGroup.style.display = "";
            shopRewardGroup.style.display = "none";
            document.getElementById("taskReward").required = true;
        }
    }
}


async function createTask(event) {

    event.preventDefault();


    const titleElement =
        document.getElementById(
            "taskTitle"
        );

    const descriptionElement =
        document.getElementById(
            "taskDescription"
        );

    const rewardElement =
        document.getElementById(
            "taskReward"
        );

    const maxClaimsElement =
        document.getElementById(
            "taskMaxClaims"
        );

    const statusElement =
        document.getElementById(
            "taskStatus"
        );

    const shopProductElement =
        document.getElementById(
            "taskShopProductCode"
        );


    const shopProductValue =
        shopProductElement && shopProductElement.value.trim()
            ? shopProductElement.value.trim().toUpperCase()
            : null;


    const shopPriceElement =
        document.getElementById(
            "taskShopPrice"
        );

    const shopPriceValue =
        shopPriceElement && shopPriceElement.value.trim()
            ? parseFloat(
                shopPriceElement.value
            )
            : null;

    const taskLinkElement =
        document.getElementById(
            "taskLink"
        );

    const taskLinkValue =
        taskLinkElement && taskLinkElement.value.trim()
            ? taskLinkElement.value.trim()
            : null;

    const taskTypeInput =
        document.querySelector(
            'input[name="taskType"]:checked'
        );

    const taskType =
        (taskTypeInput && taskTypeInput.value) ||
        "shop";


    const title =
        titleElement
            ? titleElement.value.trim()
            : "";


    const description =
        descriptionElement
            ? descriptionElement.value.trim()
            : "";


    // å•†åŸŽ/é‚€è¯·å¥½å‹ä»»åŠ¡ä½£é‡‘è‡ªåŠ¨è®¡ç®—ï¼Œrewardå­˜0ï¼›å…¶ä»–ä»»åŠ¡è¯»ç®¡ç†å‘˜å¡«å†™çš„å¥–åŠ±
    let reward = 0;
    if (taskType !== "shop" && taskType !== "invite") {
        reward = rewardElement ? parseFloat(rewardElement.value) || 0 : 0;
    }

    const maxClaims =
        maxClaimsElement
            ? parseInt(
                maxClaimsElement.value,
                10
            )
            : 0;


    const status =
        statusElement
            ? statusElement.value
            : "open";


    if (!title) {

        alert(
            I18N.t("admin.needTitle")
        );

        return;

    }


    if (!description) {

        alert(
            I18N.t("admin.needDesc")
        );

        return;

    }


    if (taskType !== "shop" && taskType !== "invite" && (!Number.isFinite(reward) || reward <= 0)) {
        !Number.isFinite(reward) ||

        alert(
            I18N.t("admin.needReward")
        );

        return;

    }


    if (
        !Number.isInteger(maxClaims) ||
        maxClaims <= 0
    ) {

        alert(
            I18N.t("admin.needClaims")
        );

        return;

    }


    const form =
        document.getElementById(
            "createTaskForm"
        );


    const button =
        form
            ? form.querySelector(
                "button[type='submit']"
            )
            : null;


    if (button) {

        button.disabled = true;

        button.textContent =
            I18N.t("admin.publishing");

    }


    try {

        const {
            data: { user }
        } =
            await supabaseClient
                .auth
                .getUser();


        if (!user) {

            alert(
                I18N.t("admin.sessionExpired")
            );

            window.location.href =
                "index.html";

            return;

        }


        // ä¸Šä¼ ä»»åŠ¡å›¾ç‰‡ï¼ˆå¯é€‰ï¼‰
        let taskImageUrl = null;

        try {

            taskImageUrl =
                await uploadTaskImage();

        } catch (imgError) {

            console.error(imgError);

            alert(imgError.message);

            return;

        }


        const {
            error
        } =
            await supabaseClient
                .from("tasks")
                .insert({

                    title: title,

                    description: description,

                    reward: reward,

                    max_claims: maxClaims,

                    slots: maxClaims,

                    remaining_slots: maxClaims,

                    status: status,

                    created_by: user.id,

                    image_url:
                        taskImageUrl,

                    shop_product_id:
                        null,

                    shop_product_code:
                        shopProductValue,

                    shop_product_price:
                        shopPriceValue,

                    task_type:
                        taskType,

                    task_link:
                        taskLinkValue,

                    invite_count:
                        taskType === "invite" ? parseInt(document.getElementById("inviteCount").value, 10) : null,

                    invite_unit_price:
                        taskType === "invite" ? parseFloat(document.getElementById("inviteUnitPrice").value) : null

                });


        if (error) {

            console.error(
                I18N.t("admin.publishFailed"),
                error
            );

            alert(
                I18N.t("admin.publishFailedMsg") +
                error.message
            );

            return;

        }


        alert(
            I18N.t("admin.publishSuccess")
        );


        if (form) {

            form.reset();

        }


        clearTaskImage();


        if (maxClaimsElement) {

            maxClaimsElement.value =
                "100";

        }


        if (statusElement) {

            statusElement.value =
                "open";

        }


        await loadAdminTasks();


        const tasksSection =
            document.getElementById(
                "tasks"
            );


        if (tasksSection) {

            tasksSection.scrollIntoView({
                behavior: "smooth"
            });

        }


    } catch (error) {

        console.error(
            I18N.t("admin.publishException"),
            error
        );

        alert(
            I18N.t("admin.sysErrorMsg") +
            error.message
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                I18N.t("admin.publishBtn");

        }

    }

}



/* ========================================
   åŠ è½½æ‰€æœ‰ä»»åŠ¡
   ======================================== */

async function loadAdminTasks() {

    const container =
        document.getElementById(
            "adminTasksContainer"
        );


    if (!container) {

        console.error(
            I18N.t("admin.noContainer")
        );

        return;

    }


    container.innerHTML =
        '<div class="admin-loading">' + I18N.t("admin.taskLoading") + '</div>';


    try {

        const {
            data: tasks,
            error
        } =
            await supabaseClient
                .from("tasks")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                I18N.t("admin.taskReadFailed"),
                error
            );

            container.innerHTML =
                `
                <div class="admin-error-box">
                    ${I18N.t("admin.loadFailed")}<br>
                    ${escapeHtml(
                        error.message
                    )}
                </div>
                `;

            return;

        }


        let taskList =
            tasks || [];


        // å·¥å…·æ¡ç­›é€‰ï¼šå…³é”®è¯ / ç±»åž‹ / çŠ¶æ€
        const searchInput =
            document.getElementById("adminTaskSearch");

        const typeFilter =
            document.getElementById("adminTaskTypeFilter");

        const statusFilter =
            document.getElementById("adminTaskStatusFilter");

        const kw =
            ((searchInput && searchInput.value) || "").trim().toLowerCase();

        const tf =
            typeFilter ? typeFilter.value : "";

        const sf =
            statusFilter ? statusFilter.value : "";

        if (kw || tf || sf) {

            taskList = taskList.filter(function (tk) {

                if (tf && (tk.task_type || "shop") !== tf) return false;

                if (sf && (tk.status || "") !== sf) return false;

                if (kw) {

                    const hay = (
                        (tk.title || "") + " " +
                        (tk.description || "") + " " +
                        (tk.shop_product_code || "") + " " +
                        tk.id
                    ).toLowerCase();

                    if (hay.indexOf(kw) < 0) return false;

                }

                return true;

            });

        }


        updateStatistics(
            taskList
        );


        if (
            taskList.length === 0
        ) {

            container.innerHTML =
                `
                <div class="admin-empty-box">
                    ${I18N.t("admin.noTasks")}
                </div>
                `;

        } else {

            container.innerHTML =
                "";


            // é¢†å–/å®Œæˆç»Ÿè®¡
            const claimStat = {};
            try {
                const { data: allClaims } =
                    await supabaseClient
                    .from("task_claims")
                    .select("task_id, status");
                (allClaims || []).forEach(function (c) {
                    const k = String(c.task_id);
                    claimStat[k] = claimStat[k] || { claims: 0, done: 0 };
                    claimStat[k].claims++;
                    if (c.status === "approved") claimStat[k].done++;
                });
            } catch (e) {
                console.error("claim stat failed", e);
            }

            taskList.forEach(
                function (task) {

                    container.appendChild(
                        createTaskCard(task, claimStat[String(task.id)])
                    );

                }
            );

        }


        await loadPendingSubmissions(
            taskList
        );


        await loadPendingWithdrawals();


    } catch (error) {

        console.error(
            I18N.t("admin.taskLoadException"),
            error
        );

        container.innerHTML =
            `
            <div class="admin-error-box">
                ${I18N.t("admin.sysError")}<br>
                ${escapeHtml(
                    error.message
                )}
            </div>
            `;

    }

}



/* ========================================
   å¾…å®¡æ ¸ä»»åŠ¡
   ======================================== */

async function loadPendingSubmissions(
    tasks = null
) {

    // åˆ·æ–°æ—¶æ¸…ç©ºç¼“å­˜
    reviewCache = null;

    const container =
        document.getElementById(
            "pendingSubmissionsContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        '<div class="admin-loading-box">' + I18N.t("admin.reviewLoading") + '</div>';


    try {

        let taskList = tasks;


        if (!Array.isArray(taskList)) {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("tasks")
                    .select("*");


            if (error) {

                throw error;

            }


            taskList =
                data || [];

        }


        const myIds =
            await getMyUserIds();

        let claimsQuery =
            supabaseClient
                .from("task_claims")
                .select("*")
                .eq(
                    "status",
                    "submitted"
                );

        if (Array.isArray(myIds) && myIds.length > 0) {
            claimsQuery = claimsQuery.in("user_id", myIds);
        }

        const {
            data: claims,
            error: claimsError
        } =
            await claimsQuery;


        if (claimsError) {

            throw claimsError;

        }


        if (
            !claims ||
            claims.length === 0
        ) {

            reviewCache = null;

            updateReviewCount(0);

            container.innerHTML =
                `
                <div class="admin-empty-box">
                    ${I18N.t("admin.noReviews")}
                </div>
                `;

            return;

        }


        const taskMap = {};


        taskList.forEach(
            function (task) {

                taskMap[
                    String(task.id)
                ] = task;

            }
        );


        const claimIds =
            claims.map(
                function (claim) {

                    return claim.id;

                }
            );


        const {
            data: submissions,
            error: submissionsError
        } =
            await supabaseClient
                .from("submissions")
                .select("*")
                .in(
                    "claim_id",
                    claimIds
                );


        if (submissionsError) {

            throw submissionsError;

        }


        const userIds =
            claims.map(
                function (claim) {

                    return claim.user_id;

                }
            );


        const userMap = {};


        if (
            userIds.length > 0
        ) {

            const {
                data: userProfiles,
                error: userError
            } =
                await supabaseClient
                    .from("profiles")
                    .select(
                        "id, display_name, username, phone"
                    )
                    .in(
                        "id",
                        userIds
                    );


            if (userError) {

                console.warn(
                    I18N.t("admin.loadUserFailed"),
                    userError
                );

            }


            (
                userProfiles || []
            ).forEach(
                function (user) {

                    userMap[
                        user.id
                    ] = user;

                }
            );

        }


        const submissionMap = {};


        (
            submissions || []
        ).forEach(
            function (submission) {

                submissionMap[
                    String(
                        submission.claim_id
                    )
                ] = submission;

            }
        );


        // ä¿å­˜ç¼“å­˜ï¼Œä¾›æœç´¢ / æŽ’åºä½¿ç”¨
        reviewCache = {
            claims: claims,
            taskMap: taskMap,
            userMap: userMap,
            submissionMap: submissionMap
        };

        renderReviewList();


    } catch (error) {

        console.error(
            I18N.t("admin.loadReviewFailed"),
            error
        );


        container.innerHTML =
            `
            <div class="admin-error-box">
                ${I18N.t("admin.loadReviewFailed")}<br>
                ${escapeHtml(
                    error.message
                )}
            </div>
            `;

    }

}



/* ========================================
   ä»»åŠ¡å®¡æ ¸ï¼šæœç´¢ + æŽ’åºæ¸²æŸ“
   ======================================== */

let reviewCache = null;

function updateReviewCount(n) {
    const el = document.getElementById("reviewCount");
    if (el) el.firstChild.textContent = n + " ";
}

function renderReviewList() {

    const container =
        document.getElementById(
            "pendingSubmissionsContainer"
        );

    if (!container) return;

    if (!reviewCache || !reviewCache.claims || reviewCache.claims.length === 0) {
        updateReviewCount(0);
        return;
    }

    const q = (
        document.getElementById("reviewSearch") &&
        document.getElementById("reviewSearch").value || ""
    ).toLowerCase().trim();

    const sort = (
        document.getElementById("reviewSort") &&
        document.getElementById("reviewSort").value || "time_desc"
    );

    let items = reviewCache.claims.filter(function (claim) {

        if (!q) return true;

        const task = reviewCache.taskMap[String(claim.task_id)];
        const user = reviewCache.userMap[claim.user_id];

        const title = task ? String(task.title || "").toLowerCase() : "";
        const uname = user ? String(user.display_name || user.username || "").toLowerCase() : "";
        const phone = user && user.phone ? String(user.phone).toLowerCase() : "";

        return title.indexOf(q) >= 0 || uname.indexOf(q) >= 0 || phone.indexOf(q) >= 0;

    });

    items.sort(function (a, b) {

        const ra = Number((reviewCache.taskMap[String(a.task_id)] || {}).reward || 0);
        const rb = Number((reviewCache.taskMap[String(b.task_id)] || {}).reward || 0);

        const ta = new Date(a.updated_at || a.created_at || a.claimed_at || 0).getTime();
        const tb = new Date(b.updated_at || b.created_at || b.claimed_at || 0).getTime();

        switch (sort) {
            case "time_asc": return ta - tb;
            case "reward_desc": return rb - ra;
            case "reward_asc": return ra - rb;
            default: return tb - ta;
        }

    });

    updateReviewCount(items.length);

    if (items.length === 0) {

        container.innerHTML =
            `
            <div class="admin-empty-box">
                ${I18N.t("admin.noFilterResult")}
            </div>
            `;

        return;

    }

    container.innerHTML = "";

    items.forEach(function (claim) {

        container.appendChild(
            createPendingSubmissionCard(
                claim,
                reviewCache.taskMap[String(claim.task_id)] || null,
                reviewCache.submissionMap[String(claim.id)] || null,
                reviewCache.userMap[claim.user_id] || null
            )
        );

    });

}


/* ========================================
   åˆ›å»ºå¾…å®¡æ ¸å¡ç‰‡
   ======================================== */

function createPendingSubmissionCard(
    claim,
    task,
    submission,
    userInfo
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "admin-task-card admin-review-card";


    const userDisplay =
        userInfo
            ? (
                userInfo.display_name ||
                userInfo.username ||
                "-"
            )
            : "-";


    const userPhone =
        userInfo && userInfo.phone
            ? userInfo.phone
            : "-";


    const userInitial =
        userDisplay && userDisplay !== "-"
            ? String(userDisplay)
                .charAt(0)
                .toUpperCase()
            : "?";


    const taskTitle =
        task
            ? task.title
            : I18N.t("admin.taskNo") + claim.task_id;


    const reward =
        task
            ? Number(
                task.reward || 0
            ).toFixed(2)
            : "0.00";


    const submittedTime =
        claim.updated_at ||
        claim.created_at ||
        claim.claimed_at;


    const formattedTime =
        submittedTime
            ? new Date(
                submittedTime
            ).toLocaleString(
                I18N.get() === "en" ? "en-US" : "zh-CN"
            )
            : "-";


    const proofText =
        submission &&
        submission.proof_text
            ? submission.proof_text
            : I18N.t("admin.noProofText");


    const proofUrl =
        submission &&
        submission.proof_url
            ? submission.proof_url
            : "";


    let proofHtml = "";


    if (proofUrl) {

        proofHtml =
            `
            <div class="admin-proof-box">

                <div class="admin-proof-title">
                    ${I18N.t("admin.proofTitle")}
                </div>

                <img
                    src="${escapeHtml(
                        proofUrl
                    )}"
                    alt="${I18N.t("admin.proofAlt")}"
                    class="admin-proof-image"
                    onclick="window.open(
                        '${escapeJs(
                            proofUrl
                        )}',
                        '_blank'
                    )"
                >

                <div style="margin-top:10px;">

                    <a
                        href="${escapeHtml(
                            proofUrl
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                            color:#60a5fa;
                            text-decoration:none;
                        "
                    >
                        ${I18N.t("admin.viewOriginal")}
                    </a>

                </div>

            </div>
            `;

    } else {

        proofHtml =
            `
            <div class="admin-proof-box">

                <div
                    style="
                        color:#f59e0b;
                    "
                >
                    ${I18N.t("admin.noProof")}
                </div>

            </div>
            `;

    }


    card.innerHTML =
        `

        <div class="admin-task-top">
            <div style="display:flex;align-items:center;gap:8px;">
                <span class="admin-task-status status-open" style="font-size:11px;padding:2px 8px;border-radius:4px;">${I18N.t("admin.pending")}</span>
                <h4 style="margin:0;font-size:15px;">${escapeHtml(taskTitle)}</h4>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-weight:600;font-size:16px;">RM ${reward}</span>
                <button type="button" class="admin-small-btn" onclick="approveSubmission(${Number(claim.id)})" style="padding:4px 12px;font-size:12px;">${I18N.t("admin.approveBtn")}</button>
                <button type="button" class="admin-small-btn danger" onclick="rejectSubmission(${Number(claim.id)})" style="padding:4px 12px;font-size:12px;">${I18N.t("admin.rejectBtn")}</button>
            </div>
        </div>

        <div style="display:flex;gap:12px;margin-top:10px;">
            <div style="flex:1;display:flex;flex-direction:column;gap:8px;min-width:0;">
                <div style="display:flex;align-items:center;gap:10px;padding:6px 8px;background:rgba(255,255,255,0.04);border-radius:6px;font-size:13px;">
                    <div class="admin-user-avatar" style="width:28px;height:28px;font-size:13px;">${escapeHtml(userInitial)}</div>
                    <span>${I18N.t("admin.userName")}: <strong>${escapeHtml(userDisplay)}</strong></span>
                    <span style="opacity:0.7;font-size:12px;">${I18N.t("admin.userPhone")}: ${escapeHtml(userPhone)}</span>
                </div>
                <div style="padding:6px 8px;background:rgba(255,255,255,0.03);border-radius:6px;font-size:13px;line-height:1.4;">
                    <strong style="font-size:12px;opacity:0.7;">${I18N.t("admin.proofDesc")}:</strong>
                    <div style="margin-top:2px;">${escapeHtml(proofText)}</div>
                </div>
                <div style="display:flex;gap:15px;font-size:11px;opacity:0.6;">
                    <span>${I18N.t("admin.claimId")}: ${claim.id}</span>
                    <span>${I18N.t("admin.submitTime")}: ${escapeHtml(formattedTime)}</span>
                </div>
            </div>
            <div style="width:200px;flex-shrink:0;">
                ${proofUrl ? `<img src="${escapeHtml(proofUrl)}" style="width:100%;max-height:140px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,0.1);" onclick="window.open('${escapeJs(proofUrl)}','_blank')">` : `<div style="font-size:12px;color:#f59e0b;padding:20px;text-align:center;background:rgba(255,255,255,0.03);border-radius:6px;">${I18N.t("admin.noProof")}</div>`}
            </div>
        </div>

        `;


    return card;
}

async function cancelRefundTask(claimId) {
    if (!confirm("ç¡®è®¤è¦å–æ¶ˆè¿™æ¡é€€æ¬¾ç”³è¯·å—ï¼Ÿå–æ¶ˆåŽè¯¥è®°å½•å°†ä»Žé€€æ¬¾åˆ—è¡¨ç§»é™¤")) return;
    const { error } = await supabaseClient
        .from("task_claims")
        .update({ status: "cancelled" })
        .eq("id", claimId);
    if (error) {
        alert("å–æ¶ˆå¤±è´¥ï¼š" + error.message);
        return;
    }
    alert("âœ… é€€æ¬¾ç”³è¯·å·²å–æ¶ˆ");
    loadPendingRefunds();

}



/* ========================================
   é€šè¿‡ä»»åŠ¡å®¡æ ¸ + å‘æ”¾å¥–åŠ±
   ======================================== */

async function approveSubmission(
    claimId
) {

    if (
        !confirm(
            I18N.t("admin.approveConfirm") +
            I18N.t("admin.approveConfirm2")
        )
    ) {

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .rpc(
                    "approve_task_submission",
                    {
                        p_claim_id:
                            Number(
                                claimId
                            )
                    }
                );


        if (error) {

            console.error(
                I18N.t("admin.rewardFailed"),
                error
            );

            throw error;

        }


        console.log(
            I18N.t("admin.rewardResult"),
            data
        );


        let reward =
            "0.00";


        if (
            data &&
            typeof data === "object" &&
            data.reward !== undefined
        ) {

            reward =
                Number(
                    data.reward
                ).toFixed(2);

        }


        alert(
            I18N.t("admin.approveSuccess") +
            I18N.t("admin.rewardLabel") +
            reward +
            I18N.t("admin.rewardAdded")
        );


        await loadAdminTasks();


    } catch (error) {

        console.error(
            I18N.t("admin.approveFailed"),
            error
        );


        alert(
            I18N.t("admin.approveFailedMsg") +
            error.message
        );

    }

}



/* ========================================
   æ‹’ç»ä»»åŠ¡å®¡æ ¸
   ======================================== */

async function rejectSubmission(
    claimId
) {

    // å¼¹å‡ºè¾“å…¥æ¡†ï¼Œè®©ç®¡ç†å‘˜å¡«æ‹’ç»ç†ç”±
    const reason = prompt("è¯·è¾“å…¥æ‹’ç»ç†ç”±ï¼ˆä¼šæ˜¾ç¤ºç»™ç”¨æˆ·ï¼‰ï¼š", "");
    if (reason === null) return; // ç”¨æˆ·ç‚¹å–æ¶ˆ

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("task_claims")
                .update({
                    status: "rejected",
                    reject_reason: reason || "ä»»åŠ¡ä¸ç¬¦åˆè¦æ±‚"
                })
                .eq(
                    "id",
                    claimId
                )
                .eq(
                    "status",
                    "submitted"
                )
                .select()
                .single();


        if (error) {

            throw error;

        }


        if (!data) {

            throw new Error(
                I18N.t("admin.taskProcessed")
            );

        }


        alert(
            I18N.t("admin.rejectSuccess")
        );


        await loadAdminTasks();


    } catch (error) {

        console.error(
            I18N.t("admin.rejectFailed"),
            error
        );


        alert(
            I18N.t("admin.rejectFailedMsg") +
            error.message
        );

    }

}



/* ========================================
   å¾…å®¡æ ¸æçŽ°
   ======================================== */

async function loadPendingWithdrawals() {

    // åˆ·æ–°æ—¶æ¸…ç©ºç¼“å­˜
    withdrawalsCache = null;

    const container =
        document.getElementById(
            "pendingWithdrawalsContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        '<div class="admin-loading-box">' + I18N.t("admin.withdrawLoading") + '</div>';


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .rpc(
                    "admin_get_pending_withdrawals"
                );


        if (error) {

            console.error(
                I18N.t("admin.loadWithdrawFailed"),
                error
            );


            container.innerHTML =
                `
                <div class="admin-error-box">
                    ${I18N.t("admin.loadWithdrawFailed")}<br>
                    ${escapeHtml(
                        error.message
                    )}
                </div>
                `;

            return;

        }


        if (
            !data ||
            data.length === 0
        ) {

            withdrawalsCache = null;

            updateWithdrawCount(0);

            container.innerHTML =
                `
                <div class="admin-empty-box">
                    ${I18N.t("admin.noWithdrawals")}
                </div>
                `;

            return;

        }


        container.innerHTML =
            "";


        // æ‹‰å–æçŽ°ç”¨æˆ·æ˜µç§° / ç”µè¯
        let wUserMap = {};

        try {

            const ids = (data || []).map(function (d) { return d.user_id; });

            const { data: wProfiles } =
                await supabaseClient
                    .from("profiles")
                    .select("id, display_name, username, email, phone")
                    .in("id", ids);

            (wProfiles || []).forEach(function (p) {

                wUserMap[p.id] = p;

            });

        } catch (e) {

            console.error("withdrawal user map failed", e);

        }


        // ä¿å­˜ç¼“å­˜ï¼Œä¾›æœç´¢ / æŽ’åºä½¿ç”¨
        withdrawalsCache = {
            data: data,
            wUserMap: wUserMap
        };

        renderWithdrawalList();


    } catch (error) {

        console.error(
            I18N.t("admin.withdrawLoadException"),
            error
        );


        container.innerHTML =
            `
            <div class="admin-error-box">
                ${I18N.t("admin.sysError")}<br>
                ${escapeHtml(
                    error.message
                )}
            </div>
            `;

    }

}



/* ========================================
   æçŽ°å®¡æ ¸ï¼šæœç´¢ + æŽ’åºæ¸²æŸ“
   ======================================== */

let withdrawalsCache = null;

function updateWithdrawCount(n) {
    const el = document.getElementById("withdrawCount");
    if (el) el.firstChild.textContent = n + " ";
}

function renderWithdrawalList() {

    const container =
        document.getElementById(
            "pendingWithdrawalsContainer"
        );

    if (!container) return;

    if (!withdrawalsCache || !withdrawalsCache.data || withdrawalsCache.data.length === 0) {
        updateWithdrawCount(0);
        return;
    }

    const q = (
        document.getElementById("withdrawSearch") &&
        document.getElementById("withdrawSearch").value || ""
    ).toLowerCase().trim();

    const sort = (
        document.getElementById("withdrawSort") &&
        document.getElementById("withdrawSort").value || "time_desc"
    );

    let items = withdrawalsCache.data.filter(function (item) {

        if (!q) return true;

        const user = withdrawalsCache.wUserMap[item.user_id];

        const uname = user ? String(user.display_name || user.username || "").toLowerCase() : "";
        const uemail = user && user.email ? String(user.email).toLowerCase() : "";
        const uphone = user && user.phone ? String(user.phone).toLowerCase() : "";
        const method = item.method ? String(item.method).toLowerCase() : "";
        const account = item.account ? String(item.account).toLowerCase() : "";

        return uname.indexOf(q) >= 0 || uemail.indexOf(q) >= 0 ||
               uphone.indexOf(q) >= 0 || method.indexOf(q) >= 0 ||
               account.indexOf(q) >= 0;

    });

    items.sort(function (a, b) {

        const amtA = Number(a.amount || 0);
        const amtB = Number(b.amount || 0);

        const ta = new Date(a.created_at || 0).getTime();
        const tb = new Date(b.created_at || 0).getTime();

        switch (sort) {
            case "time_asc": return ta - tb;
            case "amount_desc": return amtB - amtA;
            case "amount_asc": return amtA - amtB;
            default: return tb - ta;
        }

    });

    updateWithdrawCount(items.length);

    if (items.length === 0) {

        container.innerHTML =
            `
            <div class="admin-empty-box">
                ${I18N.t("admin.noFilterResult")}
            </div>
            `;

        return;

    }

    container.innerHTML = "";

    items.forEach(function (item) {

        container.appendChild(
            createWithdrawalCard(
                item,
                withdrawalsCache.wUserMap[item.user_id] || null
            )
        );

    });

}


/* ========================================
   åˆ›å»ºæçŽ°å¡ç‰‡
   ======================================== */

function createWithdrawalCard(
    item,
    userInfo
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "admin-withdrawal-item";


    const amount =
        Number(
            item.amount || 0
        ).toFixed(2);


    const method =
        item.method || "-";


    const account =
        item.account || "-";


    const createdAt =
        item.created_at
            ? new Date(
                item.created_at
            ).toLocaleString(
                I18N.get() === "en" ? "en-US" : "zh-CN"
            )
            : "-";


    card.innerHTML =
        `

        <div class="withdrawal-amount">
            ${I18N.t("admin.withdrawAmount", { amount: amount })}
        </div>


        <div class="withdrawal-info">

            <div class="withdrawal-user">
                ${I18N.t("admin.userName")}
                ${escapeHtml(
                    userInfo ? (userInfo.display_name || userInfo.username || userInfo.email || "-") : "-"
                )}
            </div>

            <div>
                ðŸ“ž ${I18N.t("admin.userPhone")}
                ${escapeHtml(
                    userInfo && userInfo.phone ? userInfo.phone : "-"
                )}
            </div>

            <div>
                ${I18N.t("admin.userId")}
                ${escapeHtml(
                    item.user_id
                )}
            </div>

            <div>
                ${I18N.t("admin.method")}
                ${escapeHtml(
                    method
                )}
            </div>

            <div>
                ${I18N.t("admin.account")}
                ${escapeHtml(
                    account
                )}
            </div>

            <div>
                ${I18N.t("admin.bankName")}
                ${escapeHtml(
                    item.bank_name || "-"
                )}
            </div>

            <div>
                ${I18N.t("admin.accountName")}
                ${escapeHtml(
                    item.account_name || "-"
                )}
            </div>

            <div>
                ${I18N.t("admin.applyTime")}
                ${escapeHtml(
                    createdAt
                )}
            </div>

            <div>
                ${I18N.t("admin.withdrawId")}
                ${escapeHtml(
                    item.id
                )}
            </div>

        </div>


        <div class="withdrawal-actions">

            <button
                type="button"
                class="admin-action-success"
                onclick="approveWithdrawal(
                    ${Number(
                        item.id
                    )}
                )"
            >
                ${I18N.t("admin.approveWithdraw")}
            </button>


            <button
                type="button"
                class="admin-action-danger"
                onclick="rejectWithdrawal(
                    ${Number(
                        item.id
                    )}
                )"
            >
                ${I18N.t("admin.rejectWithdraw")}
            </button>

        </div>

        `;


    return card;
}

async function cancelRefundTask(claimId) {
    if (!confirm("ç¡®è®¤è¦å–æ¶ˆè¿™æ¡é€€æ¬¾ç”³è¯·å—ï¼Ÿå–æ¶ˆåŽè¯¥è®°å½•å°†ä»Žé€€æ¬¾åˆ—è¡¨ç§»é™¤")) return;
    const { error } = await supabaseClient
        .from("task_claims")
        .update({ status: "cancelled" })
        .eq("id", claimId);
    if (error) {
        alert("å–æ¶ˆå¤±è´¥ï¼š" + error.message);
        return;
    }
    alert("âœ… é€€æ¬¾ç”³è¯·å·²å–æ¶ˆ");
    loadPendingRefunds();

}



/* ========================================
   é€šè¿‡æçŽ°
   ======================================== */

async function approveWithdrawal(
    withdrawalId
) {

    if (
        !confirm(
            I18N.t("admin.approveWithdrawConfirm") +
            I18N.t("admin.approveWithdrawConfirm2")
        )
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .rpc(
                    "admin_approve_withdrawal",
                    {
                        p_withdrawal_id:
                            Number(
                                withdrawalId
                            ),

                        p_admin_note:
                            null
                    }
                );


        if (error) {

            console.error(
                I18N.t("admin.approveWithdrawFailed"),
                error
            );

            alert(
                I18N.t("admin.approveWithdrawFailedMsg") +
                error.message
            );

            return;

        }


        alert(
            I18N.t("admin.approveWithdrawSuccess") +
            I18N.t("admin.approveWithdrawSuccess2")
        );


        await loadPendingWithdrawals();

        await loadAdminTasks();


    } catch (error) {

        console.error(
            I18N.t("admin.withdrawException"),
            error
        );


        alert(
            I18N.t("admin.withdrawError") +
            error.message
        );

    }

}



/* ========================================
   æ‹’ç»æçŽ°
   ======================================== */

async function rejectWithdrawal(
    withdrawalId
) {

    const note =
        prompt(
            I18N.t("admin.rejectReasonPrompt")
        );


    if (note === null) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .rpc(
                    "admin_reject_withdrawal",
                    {
                        p_withdrawal_id:
                            Number(
                                withdrawalId
                            ),

                        p_admin_note:
                            note.trim() ||
                            null
                    }
                );


        if (error) {

            console.error(
                I18N.t("admin.rejectWithdrawFailed"),
                error
            );

            alert(
                I18N.t("admin.rejectWithdrawFailedMsg") +
                error.message
            );

            return;

        }


        alert(
            I18N.t("admin.rejectWithdrawSuccess")
        );


        await loadPendingWithdrawals();


    } catch (error) {

        console.error(
            I18N.t("admin.withdrawException"),
            error
        );


        alert(
            I18N.t("admin.withdrawError") +
            error.message
        );

    }

}



/* ========================================
   é”€å”®ç»Ÿè®¡ï¼ˆä»£ç†é”€å”®é¢ï¼‰
   ======================================== */

async function loadSales() {
    const container = document.getElementById("salesContainer");
    const summary = document.getElementById("salesSummary");
    if (!container) return;

    const dateFrom = (document.getElementById("salesDateFrom") || {}).value || "";
    const dateTo = (document.getElementById("salesDateTo") || {}).value || "";
    const agentFilterEl = document.getElementById("salesAgentFilter");
    const agentFilter = agentFilterEl ? agentFilterEl.value : "";

    container.innerHTML = '<div class="admin-loading-box">æ­£åœ¨åŠ è½½...</div>';

    try {
        // æ€»ç®¡ç†å‘˜ï¼šåŠ è½½ä»£ç†åˆ—è¡¨å¡«ä¸‹æ‹‰æ¡†
        if (currentAdminRole === "admin" && agentFilterEl) {
            agentFilterEl.style.display = "";
            const { data: agents } = await supabaseClient
                .from("profiles")
                .select("id, display_name, email")
                .eq("role", "agent")
                .order("display_name");
            const cur = agentFilterEl.value;
            agentFilterEl.innerHTML = '<option value="">å…¨éƒ¨ä»£ç†</option>';
            (agents || []).forEach(a => {
                const opt = document.createElement("option");
                opt.value = a.id;
                opt.textContent = (a.display_name || a.email || "?") + " (" + (a.email || "") + ")";
                agentFilterEl.appendChild(opt);
            });
            agentFilterEl.value = cur;
        }

        let q = supabaseClient
            .from("shop_orders")
            .select("id, order_no, total, status, reviewed_by, reviewed_at, user_id, created_at")
            .eq("status", "completed")
            .order("reviewed_at", { ascending: false })
            .limit(500);

        // ä»£ç†åªçœ‹è‡ªå·±å®¡æ ¸çš„è®¢å•
        if (currentAdminRole === "agent") {
            const { data: me } = await supabaseClient.auth.getUser();
            if (me && me.user) q = q.eq("reviewed_by", me.user.id);
        } else if (agentFilter) {
            // æ€»ç®¡ç†å‘˜æŒ‰ä»£ç†ç­›é€‰
            q = q.eq("reviewed_by", agentFilter);
        }

        const { data: orders, error } = await q;
        if (error) throw error;

        let list = orders || [];

        // æ—¥æœŸèŒƒå›´ï¼ˆæŒ‰å®¡æ ¸æ—¶é—´ï¼‰
        if (dateFrom) list = list.filter(o => o.reviewed_at && o.reviewed_at >= dateFrom + "T00:00:00");
        if (dateTo) list = list.filter(o => o.reviewed_at && o.reviewed_at <= dateTo + "T23:59:59");

        // æ±‡æ€»
        const totalSales = list.reduce((s, o) => s + Number(o.total || 0), 0);
        const totalOrders = list.length;
        const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

        // æŒ‰æ—¥æœŸåˆ†ç»„
        const byDate = {};
        list.forEach(o => {
            const d = o.reviewed_at ? o.reviewed_at.substring(0, 10) : "æœªçŸ¥";
            if (!byDate[d]) byDate[d] = { count: 0, amount: 0 };
            byDate[d].count++;
            byDate[d].amount += Number(o.total || 0);
        });
        const dates = Object.keys(byDate).sort().reverse();

        // æŸ¥ä¹°å®¶æ˜µç§°
        const buyerIds = [...new Set(list.map(o => o.user_id).filter(Boolean))];
        const buyerMap = {};
        if (buyerIds.length > 0) {
            const { data: profs } = await supabaseClient
                .from("profiles")
                .select("id, display_name, email")
                .in("id", buyerIds);
            (profs || []).forEach(p => { buyerMap[p.id] = p.display_name || p.email || "?"; });
        }

        // æŸ¥å®¡æ ¸äººæ˜µç§°ï¼ˆç®¡ç†å‘˜è§†è§’ï¼‰
        let reviewerMap = {};
        if (currentAdminRole === "admin") {
            const reviewerIds = [...new Set(list.map(o => o.reviewed_by).filter(Boolean))];
            if (reviewerIds.length > 0) {
                const { data: revs } = await supabaseClient
                    .from("profiles")
                    .select("id, display_name, email")
                    .in("id", reviewerIds);
                (revs || []).forEach(p => { reviewerMap[p.id] = p.display_name || p.email || "?"; });
            }
        }

        // ç»Ÿè®¡å¡ç‰‡
        summary.innerHTML =
            '<div style="background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);padding:14px 18px;border-radius:12px;min-width:160px">' +
            '<div style="font-size:12px;color:rgba(255,255,255,0.6)">æ€»é”€å”®é¢</div>' +
            '<div style="font-size:22px;font-weight:700;color:#4ade80;margin-top:4px">RM ' + totalSales.toFixed(2) + '</div></div>' +
            '<div style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);padding:14px 18px;border-radius:12px;min-width:160px">' +
            '<div style="font-size:12px;color:rgba(255,255,255,0.6)">å®Œæˆè®¢å•æ•°</div>' +
            '<div style="font-size:22px;font-weight:700;color:#60a5fa;margin-top:4px">' + totalOrders + '</div></div>' +
            '<div style="background:rgba(250,204,21,.12);border:1px solid rgba(250,204,21,.3);padding:14px 18px;border-radius:12px;min-width:160px">' +
            '<div style="font-size:12px;color:rgba(255,255,255,0.6)">å¹³å‡å®¢å•ä»·</div>' +
            '<div style="font-size:22px;font-weight:700;color:#fbbf24;margin-top:4px">RM ' + avgOrder.toFixed(2) + '</div></div>';

        if (list.length === 0) {
            container.innerHTML = '<div class="admin-empty-box">è¯¥æ—¶é—´æ®µæš‚æ— å®Œæˆè®¢å•</div>';
            return;
        }

        // æŒ‰æ—¥æœŸåˆ†ç»„æ¸²æŸ“
        let html = '';
        dates.forEach(d => {
            const g = byDate[d];
            html += '<div style="margin-bottom:16px">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:8px">' +
                '<b style="font-size:14px">ðŸ“… ' + d + '</b>' +
                '<span style="font-size:13px;color:#4ade80;font-weight:600">RM ' + g.amount.toFixed(2) + ' / ' + g.count + ' å•</span>' +
                '</div>';

            // å½“å¤©è®¢å•æ˜Žç»†
            const dayOrders = list.filter(o => (o.reviewed_at ? o.reviewed_at.substring(0,10) : "æœªçŸ¥") === d);
            dayOrders.forEach(o => {
                const buyer = buyerMap[o.user_id] || "â€”";
                const reviewer = currentAdminRole === "admin" ? (reviewerMap[o.reviewed_by] || "â€”") : "";
                const item = (o.items && o.items[0]) || {};
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;margin-bottom:6px;background:rgba(255,255,255,0.02);border-radius:8px;font-size:13px">' +
                    '<div><b>' + (item.name || o.order_no) + '</b>' +
                    '<div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:2px">è®¢å•å·ï¼š' + o.order_no + ' Â· ä¹°å®¶ï¼š' + buyer +
                    (reviewer ? ' Â· å®¡æ ¸ï¼š' + reviewer : '') + '</div></div>' +
                    '<div style="color:#4ade80;font-weight:600">RM ' + Number(o.total).toFixed(2) + '</div>' +
                    '</div>';
            });
            html += '</div>';
        });

        container.innerHTML = html;

    } catch (e) {
        container.innerHTML = '<div class="admin-error-box">åŠ è½½å¤±è´¥ï¼š' + e.message + '</div>';
    }
}


/* ========================================
   å•†åŸŽè®¢å•å®¡æ ¸ï¼ˆShopHub ä»˜æ¬¾å®¡æ ¸ï¼‰
   ======================================== */

async function loadShopOrders() {
    const container = document.getElementById("shopOrdersContainer");
    if (!container) return;
    const statusFilter = (document.getElementById("soStatusFilter") || {}).value || "";
    container.innerHTML = '<div class="admin-loading-box">æ­£åœ¨åŠ è½½...</div>';

    try {
        let q = supabaseClient.from("shop_orders")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);
        if (statusFilter) q = q.eq("status", statusFilter);

        const { data: orders, error } = await q;
        if (error) throw error;

        // ä»£ç†åªçœ‹è‡ªå·±å›¢é˜Ÿæˆå‘˜çš„è®¢å•
        let filtered = orders || [];
        const myIds = await getMyUserIds();
        if (myIds) {
            const idSet = new Set(myIds);
            filtered = filtered.filter(o => idSet.has(o.user_id));
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-box">æš‚æ— è®¢å•</div>';
            return;
        }

        // æ‰¹é‡æŸ¥ç”¨æˆ·æ˜µç§°
        const userIds = [...new Set(filtered.map(o => o.user_id).filter(Boolean))];
        const { data: profiles } = await supabaseClient
            .from("profiles")
            .select("id, display_name, email")
            .in("id", userIds);
        const pm = {};
        (profiles || []).forEach(p => { pm[p.id] = p; });

        let html = '<div style="display:flex;flex-direction:column;gap:12px">';
        filtered.forEach(o => {
            const buyer = pm[o.user_id] || {};
            const item = (o.items && o.items[0]) || {};
            const addr = o.addr || {};
            const stMap = {
                awaiting_review: '<span style="color:#fbbf24">ðŸŸ  å¾…å®¡æ ¸</span>',
                completed: '<span style="color:#4ade80">ðŸŸ¢ å·²å®Œæˆ</span>',
                rejected: '<span style="color:#f87171">ðŸ”´ å·²æ‹’ç»</span>',
                pending_pay: '<span style="color:#94a3b8">âšª å¾…ä»˜æ¬¾</span>'
            };
            const stHtml = stMap[o.status] || o.status;

            let proofHtml = '';
            if (o.pay_proof_url) {
                proofHtml = '<div style="margin-top:8px;display:flex;gap:10px;align-items:flex-start">'
                    + '<img src="' + o.pay_proof_url + '" onclick="window.open(\'' + o.pay_proof_url + '\')" style="width:80px;height:80px;object-fit:cover;border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,0.15)">'
                    + '<div style="font-size:12px;color:rgba(255,255,255,0.7)">'
                    + (o.pay_currency ? 'æ”¯ä»˜å¸ç§ï¼š' + o.pay_currency : '')
                    + (o.pay_bank ? '<br>æ”¶æ¬¾é“¶è¡Œï¼š' + o.pay_bank : '')
                    + '<br>æäº¤æ—¶é—´ï¼š' + new Date(o.created_at).toLocaleString()
                    + '</div></div>';
            }
            if (o.reject_reason) {
                proofHtml += '<div style="margin-top:6px;color:#f87171;font-size:12px">æ‹’ç»åŽŸå› ï¼š' + (o.reject_reason) + '</div>';
            }

            let btnsHtml = '';
            if (o.status === "awaiting_review") {
                btnsHtml = '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">'
                    + '<button onclick="reviewShopOrder(\'' + o.id + '\',\'completed\')" style="background:#22c55e;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px">âœ… é€šè¿‡ Â· å®Œæˆè®¢å•</button>'
                    + '<input id="soRej' + o.id + '" placeholder="æ‹’ç»åŽŸå› ï¼ˆå¿…å¡«ï¼‰" style="flex:1;min-width:150px;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;font-size:13px">'
                    + '<button onclick="reviewShopOrder(\'' + o.id + '\',\'rejected\')" style="background:#ef4444;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px">âŒ æ‹’ç»</button>'
                    + '</div>';
            }

            html += '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px">'
                + '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">'
                + '<div style="font-weight:600">' + (buyer.display_name || buyer.email || o.user_id)
                + (o.claim_id ? ' <span style="background:#fbbf24;color:#000;font-size:10px;padding:2px 6px;border-radius:4px;margin-left:6px">åˆ·å•ä»»åŠ¡</span>' : '')
                + '</div>'
                + stHtml
                + '</div>'
                + '<div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.6)">è®¢å•å·ï¼š' + o.order_no + '</div>'
                + '<div style="margin-top:6px;display:flex;gap:10px;align-items:center">'
                + (item.img ? '<img src="' + item.img + '" style="width:48px;height:48px;object-fit:cover;border-radius:8px">' : '')
                + '<div style="font-size:13px">'
                + '<div>' + (item.name || 'å•†å“') + (item.sku ? ' Â· ' + item.sku : '') + '</div>'
                + '<div style="color:#fbbf24;font-weight:600;margin-top:2px">RM ' + Number(o.total).toFixed(2) + '</div>'
                + '</div></div>'
                + proofHtml + btnsHtml
                + '</div>';
        });
        html += '</div>';
        container.innerHTML = html;

    } catch (e) {
        container.innerHTML = '<div class="empty-box">åŠ è½½å¤±è´¥ï¼š' + e.message + '</div>';
    }
}

async function reviewShopOrder(orderId, status) {
    let reason = '';
    if (status === "rejected") {
        const input = document.getElementById("soRej" + orderId);
        reason = input ? input.value.trim() : '';
        if (!reason) { alert("è¯·å¡«å†™æ‹’ç»åŽŸå› "); return; }
    }
    if (!confirm(status === "completed" ? "ç¡®è®¤é€šè¿‡è¯¥è®¢å•ï¼Ÿé€šè¿‡åŽå°†è‡ªåŠ¨å®Œæˆåˆ·å•ä»»åŠ¡å¹¶å‘æ”¾ä½£é‡‘ã€‚" : "ç¡®è®¤æ‹’ç»è¯¥è®¢å•ï¼Ÿ")) return;

    try {
        const rpcName = (currentAdminRole === "admin") ? "admin_review_shop_order" : "agent_review_shop_order";
        const { error } = await supabaseClient.rpc(rpcName, {
            p_order_id: orderId,
            p_status: status,
            p_reject_reason: reason || null
        });
        if (error) throw error;
        alert(status === "completed" ? "å·²é€šè¿‡ï¼Œè®¢å•å®Œæˆ" : "å·²æ‹’ç»è¯¥è®¢å•");
        loadShopOrders();
    } catch (e) {
        alert("æ“ä½œå¤±è´¥ï¼š" + e.message);
    }
}


/* ========================================
   ä»»åŠ¡é€€æ¬¾å®¡æ ¸ï¼ˆå½’è¿˜è´­ç‰©å¥–åŠ±ï¼‰
   ======================================== */

async function loadPendingRefunds() {

    // åˆ·æ–°æ—¶æ¸…ç©ºç¼“å­˜
    refundsCache = null;

    const container =
        document.getElementById(
            "pendingRefundsContainer"
        );

    if (!container) {
        return;
    }

    const zh =
        typeof I18N !== "undefined" && I18N.get() === "zh";

    container.innerHTML =
        '<div class="admin-loading-box">' +
        (zh ? "æ­£åœ¨åŠ è½½é€€æ¬¾è®°å½•..." : "Loading refund records...") +
        '</div>';

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .rpc(
                    "admin_get_pending_refunds"
                );

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {

            refundsCache = null;

            updateRefundCount(0);

            container.innerHTML =
                '<div class="admin-empty-box">' +
                (zh ? "æš‚æ— å¯é€€æ¬¾çš„é¢†å–è®°å½•" : "No refundable claims") +
                '</div>';

            return;

        }

        container.innerHTML = "";

        // ä¿å­˜ç¼“å­˜ï¼Œä¾›æœç´¢ / æŽ’åºä½¿ç”¨
        refundsCache = data;

        renderRefundList();

    } catch (error) {

        console.error(
            "åŠ è½½é€€æ¬¾è®°å½•å¤±è´¥:",
            error
        );

        container.innerHTML =
            '<div class="admin-error-box">' +
            (zh ? "åŠ è½½é€€æ¬¾è®°å½•å¤±è´¥ï¼š" : "Failed to load refund records: ") +
            escapeHtml(error.message) +
            '</div>';

    }

}


/* ========================================
   é€€æ¬¾å®¡æ ¸ï¼šæœç´¢ + æŽ’åºæ¸²æŸ“
   ======================================== */

let refundsCache = null;

function updateRefundCount(n) {
    const el = document.getElementById("refundCount");
    if (el) el.firstChild.textContent = n + " ";
}

function renderRefundList() {

    const container =
        document.getElementById(
            "pendingRefundsContainer"
        );

    if (!container) return;

    if (!refundsCache || refundsCache.length === 0) {
        updateRefundCount(0);
        return;
    }

    const q = (
        document.getElementById("refundSearch") &&
        document.getElementById("refundSearch").value || ""
    ).toLowerCase().trim();

    const sort = (
        document.getElementById("refundSort") &&
        document.getElementById("refundSort").value || "time_desc"
    );

    let items = refundsCache.filter(function (item) {

        if (!q) return true;

        const uname = item.user_name ? String(item.user_name).toLowerCase() : "";
        const uemail = item.user_email ? String(item.user_email).toLowerCase() : "";
        const title = item.task_title ? String(item.task_title).toLowerCase() : "";
        const code = item.shop_product_code ? String(item.shop_product_code).toLowerCase() : "";
        const cid = item.id != null ? String(item.id) : "";

        return uname.indexOf(q) >= 0 || uemail.indexOf(q) >= 0 ||
               title.indexOf(q) >= 0 || code.indexOf(q) >= 0 ||
               cid.indexOf(q) >= 0;

    });

    items.sort(function (a, b) {

        const amtA = Number(a.shop_product_price || 0);
        const amtB = Number(b.shop_product_price || 0);

        const ta = new Date(a.claimed_at || 0).getTime();
        const tb = new Date(b.claimed_at || 0).getTime();

        switch (sort) {
            case "time_asc": return ta - tb;
            case "amount_desc": return amtB - amtA;
            case "amount_asc": return amtA - amtB;
            default: return tb - ta;
        }

    });

    updateRefundCount(items.length);

    if (items.length === 0) {

        container.innerHTML =
            '<div class="admin-empty-box">' +
            (typeof I18N !== "undefined" && I18N.get() === "zh" ? "ðŸ˜• æ²¡æœ‰ç¬¦åˆç­›é€‰æ¡ä»¶çš„è®°å½•" : "ðŸ˜• No matching records") +
            '</div>';

        return;

    }

    container.innerHTML = "";

    items.forEach(function (item) {

        container.appendChild(createRefundCard(item));

    });

}


/* ========================================
   åˆ›å»ºé€€æ¬¾å¡ç‰‡
   ======================================== */

function createRefundCard(item) {

    const zh =
        typeof I18N !== "undefined" && I18N.get() === "zh";

    const card =
        document.createElement("div");

    card.className =
        "admin-withdrawal-item";

    const amount =
        Number(
            item.shop_product_price || 0
        ).toFixed(2);

    const userName =
        escapeHtml(
            item.user_name || "?"
        );

    const userEmail =
        escapeHtml(
            item.user_email || "-"
        );

    const taskTitle =
        escapeHtml(
            item.task_title || ("#" + item.task_id)
        );

    const shopCode =
        escapeHtml(
            item.shop_product_code || "-"
        );

    const statusText =
        item.status === "approved" ? (zh ? "å·²å®Œæˆ" : "Done") :
        item.status === "submitted" ? (zh ? "å¾…å®¡æ ¸" : "Pending") :
        item.status === "rejected" ? (zh ? "å·²é©³å›ž" : "Rejected") :
        item.status === "claimed" ? (zh ? "è¿›è¡Œä¸­" : "In progress") :
        escapeHtml(String(item.status || "-"));

    const claimedAt =
        item.claimed_at
            ? new Date(
                item.claimed_at
              ).toLocaleString(
                zh ? "zh-CN" : "en-GB"
              )
            : "-";

    card.innerHTML =
        `
        <div class="withdrawal-amount">
            ${zh ? "è®¢å•æ€»ä»·" : "Order Total"} RM${amount}
        </div>

        <div class="withdrawal-info">

            <div>
                ${zh ? "ç”¨æˆ·" : "User"}
                ${userName} Â· ${userEmail}
            </div>

            <div>
                ${zh ? "ä»»åŠ¡" : "Task"}
                ${taskTitle}
            </div>

            <div>
                ${zh ? "å•†å“è¯†åˆ«ç " : "Product Code"}
                ${shopCode}
            </div>

            <div>
                ${zh ? "çŠ¶æ€" : "Status"}
                ${statusText}
            </div>

            <div>
                ${zh ? "é¢†å–æ—¶é—´" : "Claimed at"}
                ${escapeHtml(claimedAt)}
            </div>

            <div>
                ${zh ? "é¢†å–ID" : "Claim ID"}
                ${escapeHtml(String(item.id))}
            </div>

        </div>

        <div class="withdrawal-actions">
            <button
                type="button"
                class="admin-action-success"
                onclick="refundTask(
                    ${Number(item.id)},
                    ${Number(item.shop_product_price || 0)}
                )"
            >
                ðŸ’¸ ${zh ? "å½’è¿˜è´­ç‰©å¥–åŠ±" : "Return Shopping Reward"}
            </button>
            <button
                type="button"
                class="admin-action-danger"
                onclick="cancelRefundTask(${Number(item.id)})"
                style="margin-left:8px;"
            >
                âŒ ${zh ? "å–æ¶ˆé€€æ¬¾ç”³è¯·" : "Cancel Refund"}
            </button>
        </div>
        `;

    return card;
}

async function cancelRefundTask(claimId) {
    if (!confirm("ç¡®è®¤è¦å–æ¶ˆè¿™æ¡é€€æ¬¾ç”³è¯·å—ï¼Ÿå–æ¶ˆåŽè¯¥è®°å½•å°†ä»Žé€€æ¬¾åˆ—è¡¨ç§»é™¤")) return;
    const { error } = await supabaseClient
        .from("task_claims")
        .update({ status: "cancelled" })
        .eq("id", claimId);
    if (error) {
    }
    // ç›´æŽ¥ä»Žå‰ç«¯ç¼“å­˜è¿‡æ»¤æŽ‰è¿™æ¡è®°å½•ï¼Œç«‹å³ä»Žåˆ—è¡¨æ¶ˆå¤±
    if (refundsCache) {
        refundsCache = refundsCache.filter(item => item.id !== claimId);
        renderRefundList();
    }
    alert("âœ… é€€æ¬¾ç”³è¯·å·²å–æ¶ˆ");
}


/* ========================================
   æ‰§è¡Œä»»åŠ¡é€€æ¬¾ï¼ˆå½’è¿˜è®¢å•æ€»ä»·åˆ°é’±åŒ…ï¼‰
   ======================================== */

async function refundTask(
    claimId,
    amount
) {

    const zh =
        typeof I18N !== "undefined" && I18N.get() === "zh";

    if (
        !confirm(
            (zh
                ? "ç¡®è®¤å°†è®¢å•æ€»ä»· RM" + Number(amount).toFixed(2) + " å½’è¿˜åˆ°è¯¥ç”¨æˆ·é’±åŒ…å—ï¼Ÿ\n\næµæ°´æè¿°å°†æ˜¾ç¤ºä¸ºã€Œè´­ç‰©å¥–åŠ±ã€ï¼Œè¯¥é¢†å–è®°å½•å°†æ ‡è®°ä¸ºå·²é€€æ¬¾ï¼Œä¸”ä¸å¯é‡å¤æ“ä½œã€‚"
                : "Return order total RM" + Number(amount).toFixed(2) + " to this user's wallet?\n\nThe transaction note will show \"Shopping Reward\", and this claim will be marked as refunded.")
        )
    ) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .rpc(
                    "admin_refund_task",
                    {
                        p_claim_id: Number(claimId)
                    }
                );

        if (error) {
            throw error;
        }

        const returned =
            data && data.amount != null
                ? Number(data.amount).toFixed(2)
                : Number(amount).toFixed(2);

        alert(
            (zh
                ? "å·²å½’è¿˜ RM" + returned + " åˆ°ç”¨æˆ·é’±åŒ…ï¼ˆè´­ç‰©å¥–åŠ±ï¼‰ã€‚"
                : "RM" + returned + " returned to the user's wallet (Shopping Reward).")
        );

        await loadPendingRefunds();

    } catch (error) {

        console.error(
            "å½’è¿˜å¤±è´¥:",
            error
        );

        alert(
            (zh ? "å½’è¿˜å¤±è´¥ï¼š" : "Refund failed: ") +
            error.message
        );

    }

}


/* ========================================
   åˆ›å»ºä»»åŠ¡å¡ç‰‡
   ======================================== */

function createTaskCard(
    task,
    claimStat
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "admin-task-card";


    const isOpen =
        task.status === "open";


    const statusText =
        isOpen
            ? I18N.t("admin.statusOpen")
            : I18N.t("admin.statusClosed");


    const statusClass =
        isOpen
            ? "status-open"
            : "status-closed";


    const createdTime =
        task.created_at
            ? new Date(
                task.created_at
            ).toLocaleString(
                I18N.get() === "en" ? "en-US" : "zh-CN"
            )
            : "-";


    const reward =
        Number(
            task.reward || 0
        ).toFixed(2);


    const ttype =
        task.task_type || "shop";


    const typeBadgeCls =
        ttype === "like" ? "like"
            : ttype === "review" ? "review"
                : ttype === "follow" ? "follow"
                    : ttype === "invite" ? "invite"
                        : "shop";


    const typeLabel =
        ttype === "like" ? I18N.t("admin.taskTypeLike")
            : ttype === "review" ? I18N.t("admin.taskTypeReview")
                : ttype === "follow" ? I18N.t("admin.taskTypeFollow")
                    : ttype === "invite" ? I18N.t("admin.taskTypeInvite")
                        : I18N.t("admin.taskTypeShop");


    const claimed =
        claimStat ? (claimStat.claims || 0) : 0;

    const done =
        claimStat ? (claimStat.done || 0) : 0;

    const remaining =
        task.remaining_slots != null
            ? task.remaining_slots
            : "-";

    const totalSlots =
        task.max_claims != null
            ? task.max_claims
            : (task.slots || 0);


    card.innerHTML =
        `

        <div class="admin-task-top">

            <div class="admin-task-title-wrap">

                ${
                    task.image_url
                        ? `<img class="admin-task-thumb" src="${escapeHtml(task.image_url)}" alt="">`
                        : `<div class="admin-task-thumb admin-task-thumb-ph">ðŸ“‹</div>`
                }

                <div>

                    <div class="admin-task-tags">

                        <span class="admin-task-status ${statusClass}">
                            ${statusText}
                        </span>

                        <span class="admin-task-type-badge ${typeBadgeCls}">
                            ${typeLabel}
                        </span>

                    </div>

                    <h3>
                        ${escapeHtml(
                            task.title
                        )}
                    </h3>

                </div>

            </div>


            <div class="admin-task-reward">
                <small>${I18N.t("admin.reward")}</small>
                <b>RM ${reward}</b>
            </div>

        </div>


        <div class="admin-task-description">

            ${escapeHtml(
                task.description || ""
            )}

        </div>


        <div class="admin-task-info">

            <div>
                ${I18N.t("admin.maxLabel")}
                ${escapeHtml(
                    totalSlots
                )}
                ${I18N.t("admin.people")}
            </div>

            <div class="admin-task-slots">
                ${I18N.t("admin.remainingLabel")}
                <b>${remaining}</b>
                / ${escapeHtml(
                    totalSlots
                )}
            </div>

            <div>
                ðŸ“…
                ${escapeHtml(
                    createdTime
                )}
            </div>

            <div>
                ${I18N.t("admin.id")}
                ${escapeHtml(
                    task.id
                )}
            </div>

            ${
                claimStat
                    ? `<div>ðŸ“¥ ${I18N.t("admin.claimedCount")} ${claimed} Â· âœ… ${I18N.t("admin.doneCount")} ${done}</div>`
                    : ""
            }

            ${
                task.task_link
                    ? `<div class="admin-task-shopcode">ðŸ”— <a href="${escapeHtml(task.task_link)}" target="_blank" rel="noopener noreferrer" style="color:#60a5fa">${escapeHtml(task.task_link.slice(0, 60))}</a></div>`
                    : ""
            }

            ${
                task.shop_product_code
                    ? `<div class="admin-task-shopcode">ðŸ›’ ç»‘å®šå•†å“ <b>${escapeHtml(task.shop_product_code)}</b></div>`
                    : ""
            }

            ${
                task.deadline
                    ? `<div>â° ${I18N.t("admin.deadline")} ${new Date(task.deadline).toLocaleString(I18N.get() === "en" ? "en-US" : "zh-CN")}</div>`
                    : ""
            }

        </div>


        <div class="admin-task-actions">

            <button
                type="button"
                class="admin-small-btn"
                onclick="openEditTask(
                    ${Number(
                        task.id
                    )}
                )"
            >
                âœï¸ ${I18N.t("admin.editBtn")}
            </button>

            <button
                type="button"
                class="admin-small-btn"
                onclick="toggleTaskStatus(
                    ${Number(
                        task.id
                    )},
                    '${escapeJs(
                        String(
                            task.status
                        )
                    )}'
                )"
            >
                ${
                    isOpen
                        ? I18N.t("admin.closeTask")
                        : I18N.t("admin.openTask")
                }
            </button>

            <button
                type="button"
                class="admin-small-btn"
                onclick="duplicateTask(
                    ${Number(
                        task.id
                    )}
                )"
            >
                ðŸ“‹ ${I18N.t("admin.copyTask")}
            </button>

            <button
                type="button"
                class="admin-small-btn"
                onclick="viewTaskClaimers(
                    ${Number(
                        task.id
                    )}
                )"
            >
                ðŸ‘¥ ${I18N.t("admin.viewClaimers")}
            </button>

            <button
                type="button"
                class="admin-small-btn danger"
                onclick="deleteTask(
                    ${Number(
                        task.id
                    )}
                )"
            >
                ${I18N.t("admin.deleteBtn")}
            </button>

        </div>

        `;


    return card;
}

async function cancelRefundTask(claimId) {
    if (!confirm("ç¡®è®¤è¦å–æ¶ˆè¿™æ¡é€€æ¬¾ç”³è¯·å—ï¼Ÿå–æ¶ˆåŽè¯¥è®°å½•å°†ä»Žé€€æ¬¾åˆ—è¡¨ç§»é™¤")) return;
    const { error } = await supabaseClient
        .from("task_claims")
        .update({ status: "cancelled" })
        .eq("id", claimId);
    if (error) {
        alert("å–æ¶ˆå¤±è´¥ï¼š" + error.message);
        return;
    }
    // ç›´æŽ¥ä»Žå‰ç«¯ç¼“å­˜è¿‡æ»¤æŽ‰è¿™æ¡è®°å½•ï¼Œç«‹å³ä»Žåˆ—è¡¨æ¶ˆå¤±
    if (refundsCache) {
        refundsCache = refundsCache.filter(item => item.id !== claimId);
        renderRefundList();
    }
    alert("âœ… é€€æ¬¾ç”³è¯·å·²å–æ¶ˆ");
}



/* ========================================
   å¤åˆ¶ä»»åŠ¡
   ======================================== */

async function duplicateTask(
    taskId
) {

    const {
        data: task,
        error
    } =
        await supabaseClient
            .from("tasks")
            .select("*")
            .eq(
                "id",
                taskId
            )
            .single();

    if (error || !task) {

        alert(I18N.t("admin.loadTaskFailed"));

        return;

    }

    if (
        !confirm(
            I18N.t("admin.copyConfirm") +
            escapeHtml(task.title)
        )
    ) {

        return;

    }

    const {
        data: { user }
    } =
        await supabaseClient
            .auth
            .getUser();

    const { error: insError } =
        await supabaseClient
            .from("tasks")
            .insert({

                title:
                    (task.title || "ä»»åŠ¡") +
                    I18N.t("admin.copySuffix"),

                description: task.description || "",

                requirements: task.requirements || null,

                reward: task.reward != null ? task.reward : 0,

                max_claims: task.max_claims != null ? task.max_claims : 100,

                slots: task.max_claims != null ? task.max_claims : 100,

                remaining_slots: task.max_claims != null ? task.max_claims : 100,

                status: "open",

                created_by: user ? user.id : task.created_by,

                image_url: task.image_url || null,

                shop_product_id: task.shop_product_id || null,

                shop_product_code: task.shop_product_code || null,

                shop_product_price: task.shop_product_price || null,

                task_type: task.task_type || "shop",

                task_link: task.task_link || null,

                deadline: task.deadline || null

            });

    if (insError) {

        console.error(insError);

        alert(I18N.t("admin.copyFailed") + insError.message);

        return;

    }

    alert(I18N.t("admin.copyTaskDone"));

    await loadAdminTasks();

}



/* ========================================
   æŸ¥çœ‹é¢†å–ç”¨æˆ·
   ======================================== */

async function viewTaskClaimers(
    taskId
) {

    const {
        data: claims,
        error
    } =
        await supabaseClient
            .from("task_claims")
            .select("id, user_id, status, claimed_at")
            .eq(
                "task_id",
                taskId
            )
            .order(
                "claimed_at",
                { ascending: false }
            )
            .limit(200);

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }

    const userMap = {};

    if (claims && claims.length > 0) {

        const ids = claims.map(c => c.user_id);

        const { data: profiles } =
            await supabaseClient
                .from("profiles")
                .select("id, display_name, username, email, phone")
                .in("id", ids);

        (profiles || []).forEach(function (p) {

            userMap[p.id] = p;

        });

    }

    const zh =
        typeof I18N !== "undefined" && I18N.get() === "zh";

    const statusLabels = {
        claimed: zh ? "å·²é¢†å–" : "Claimed",
        submitted: zh ? "å¾…å®¡æ ¸" : "Submitted",
        approved: zh ? "å·²å®Œæˆ" : "Approved",
        rejected: zh ? "å·²æ‹’ç»" : "Rejected",
        expired: zh ? "å·²å¤±æ•ˆ" : "Expired"
    };

    const rows =
        !claims || claims.length === 0
            ? `<div style="color:#8a94a6;padding:8px 0">${I18N.t("admin.claimersEmpty")}</div>`
            : claims.map(function (c) {

                const u =
                    userMap[c.user_id] || null;

                const name =
                    u ? (u.display_name || u.username || u.email || "?") : "?";

                const phone =
                    u && u.phone ? u.phone : "-";

                const email =
                    u && u.email ? u.email : "-";

                const st =
                    statusLabels[c.status] || c.status;

                const at =
                    c.claimed_at
                        ? new Date(c.claimed_at).toLocaleString(zh ? "zh-MY" : "en-MY")
                        : "-";

                return `
                    <div class="admin-claimer-row">
                        <div class="admin-claimer-ava">${escapeHtml(name.charAt(0).toUpperCase())}</div>
                        <div class="admin-claimer-main">
                            <strong>${escapeHtml(name)}</strong>
                            <small>${escapeHtml(email)} Â· ðŸ“ž ${escapeHtml(phone)}</small>
                        </div>
                        <span class="admin-claimer-status st-${c.status}">${escapeHtml(st)}</span>
                        <small class="admin-claimer-time">${escapeHtml(at)}</small>
                    </div>
                `;

            }).join("");

    const mask =
        document.createElement("div");

    mask.className = "admin-modal-mask";

    mask.id = "claimersModal";

    mask.innerHTML =
        '<div class="admin-modal-box" style="max-width:720px">' +
        '<div class="admin-modal-head">' +
        '<h3>ðŸ‘¥ ' + (zh ? "é¢†å–ç”¨æˆ·æ˜Žç»†" : "Claimed Users") + '</h3>' +
        '<button class="admin-modal-close" onclick="closeClaimersModal()">âœ•</button>' +
        '</div>' +
        '<div style="font-size:12.5px;color:#8a94a6;margin-bottom:10px">' +
        (zh ? "ä»»åŠ¡ ID " : "Task ID ") + taskId + ' Â· ' + (zh ? "å…± " : "") +
        (claims ? claims.length : 0) + (zh ? " äººé¢†å–" : " claims") +
        '</div>' +
        '<div>' + rows + '</div>' +
        '</div>';

    document.body.appendChild(mask);

}


function closeClaimersModal() {

    const m =
        document.getElementById("claimersModal");

    if (m) m.remove();

}



/* ========================================
   ä¿®æ”¹ä»»åŠ¡çŠ¶æ€
/* ========================================
   ä¿®æ”¹ä»»åŠ¡çŠ¶æ€
   ======================================== */

async function toggleTaskStatus(
    taskId,
    currentStatus
) {

    const newStatus =
        currentStatus === "open"
            ? "closed"
            : "open";


    const actionText =
        newStatus === "open"
            ? I18N.t("admin.statusOpen")
            : I18N.t("admin.statusClosed");


    if (
        !confirm(
            I18N.t("admin.toggleConfirm1") +
            actionText +
            I18N.t("admin.toggleConfirm2")
        )
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("tasks")
                .update({
                    status:
                        newStatus
                })
                .eq(
                    "id",
                    taskId
                );


        if (error) {

            throw error;

        }


        alert(
            I18N.t("admin.taskUpdated") +
            actionText
        );


        await loadAdminTasks();


    } catch (error) {

        console.error(
            I18N.t("admin.toggleFailed"),
            error
        );


        alert(
            I18N.t("admin.opFailed") +
            error.message
        );

    }

}



/* ========================================
   åˆ é™¤ä»»åŠ¡
   ======================================== */

async function deleteTask(
    taskId
) {

    if (
        !confirm(
            I18N.t("admin.deleteConfirm") +
            I18N.t("admin.deleteConfirm2")
        )
    ) {

        return;

    }


    try {

        // å…ˆæŸ¥å‡ºè¿™ä¸ªä»»åŠ¡çš„æ‰€æœ‰ claim IDs
        const { data: claims } = await supabaseClient
            .from("task_claims")
            .select("id")
            .eq("task_id", taskId);

        const claimIds = claims ? claims.map(c => c.id) : [];

        // æœ‰ submissions å°±å…ˆåˆ 
        if (claimIds.length > 0) {
            await supabaseClient
                .from("submissions")
                .delete()
                .in("claim_id", claimIds);

            // å†åˆ  task_claims
            await supabaseClient
                .from("task_claims")
                .delete()
                .eq("task_id", taskId);
        }

        // æœ€åŽåˆ ä»»åŠ¡
        const {
            error
        } =
            await supabaseClient
                .from("tasks")
                .delete()
                .eq(
                    "id",
                    taskId
                );


        if (error) {

            throw error;

        }


        alert(
            I18N.t("admin.taskDeleted")
        );


        await loadAdminTasks();


    } catch (error) {

        console.error(
            I18N.t("admin.deleteFailed"),
            error
        );


        alert(
            I18N.t("admin.deleteFailedMsg") +
            error.message
        );

    }

}



/* ========================================
   ç¼–è¾‘ä»»åŠ¡
   ======================================== */

let editingTaskId = null;

let editTaskImageFile = null;

let editTaskImageChanged = false; // false=ä¿ç•™åŽŸå›¾ | "file"=ä¸Šä¼ æ–°å›¾ | "remove"=ç§»é™¤å›¾ç‰‡


function onEditTaskTypeChange() {

    const typeInput =
        document.querySelector(
            'input[name="editTaskType"]:checked'
        );

    const type =
        (typeInput && typeInput.value) ||
        "shop";

    // ä»»åŠ¡é“¾æŽ¥å­—æ®µï¼šä»…ç‚¹èµž/è¯„è®º/å…³æ³¨æ˜¾ç¤º
    const linkField = document.getElementById("editTaskLinkField");
    if (linkField) {
        linkField.style.display = (type === "like" || type === "review" || type === "follow") ? "" : "none";
    }

    // å•†åŸŽå­—æ®µï¼šä»…å•†åŸŽä»»åŠ¡æ˜¾ç¤º
    document.querySelectorAll(".edit-shop-field").forEach(el => {
        el.style.display = type === "shop" ? "" : "none";
    });

    // é‚€è¯·å¥½å‹å­—æ®µï¼šä»…é‚€è¯·å¥½å‹ä»»åŠ¡æ˜¾ç¤º
    document.querySelectorAll(".edit-invite-field").forEach(el => {
        el.style.display = type === "invite" ? "" : "none";
    });

    // å¥–åŠ±è¾“å…¥æ¡†ï¼šå•†åŸŽ/é‚€è¯·å¥½å‹ä»»åŠ¡éšè—ï¼Œå…¶ä»–ä»»åŠ¡æ˜¾ç¤º
    const editNormalRewardGroup = document.getElementById("editNormalRewardGroup");
    const editShopRewardGroup = document.getElementById("editShopRewardGroup");
    if (editNormalRewardGroup && editShopRewardGroup) {
        if (type === "shop" || type === "invite") {
            editNormalRewardGroup.style.display = "none";
            editShopRewardGroup.style.display = "";
            if (type === "shop") {
                editShopRewardGroup.querySelector("div").innerText = "âœ… å•†åŸŽä»»åŠ¡ä½£é‡‘æ ¹æ®ç”¨æˆ·ä¼šå‘˜ç­‰çº§æŒ‰è®¢å•é‡‘é¢æ¯”ä¾‹è‡ªåŠ¨è®¡ç®—ï¼Œæ— éœ€ä¿®æ”¹";
            } else {
                editShopRewardGroup.querySelector("div").innerText = "âœ… é‚€è¯·å¥½å‹ä»»åŠ¡å¥–åŠ±ä¸ºå›ºå®šå•ä»·ï¼ŒæŒ‰é‚€è¯·æˆåŠŸäººæ•°è‡ªåŠ¨å‘æ”¾ï¼Œæ— éœ€ä¿®æ”¹";
            }
        } else {
            editNormalRewardGroup.style.display = "";
            editShopRewardGroup.style.display = "none";
        }
    }
}


async function openEditTask(
    taskId
) {

    const {
        data: task,
        error
    } =
        await supabaseClient
            .from("tasks")
            .select("*")
            .eq(
                "id",
                taskId
            )
            .single();

    if (error || !task) {

        alert(
            I18N.t("admin.loadTaskFailed")
        );

        return;

    }

    editingTaskId =
        taskId;

    editTaskImageFile = null;

    editTaskImageChanged = false;


    // å¡«å……è¡¨å•
    const typeVal =
        task.task_type || "shop";

    const typeRadio =
        document.querySelector(
            'input[name="editTaskType"][value="' + typeVal + '"]'
        );

    if (typeRadio) typeRadio.checked = true;
    if (typeof onEditTaskTypeChange === "function") onEditTaskTypeChange();

    document.getElementById("editTaskTitle").value =
        task.title || "";

    document.getElementById("editTaskDescription").value =
        task.description || "";

    document.getElementById("editTaskRequirements").value =
        task.requirements || "";

    document.getElementById("editTaskLink").value =
        task.task_link || "";

    document.getElementById("editTaskShopCode").value =
        task.shop_product_code || "";

    document.getElementById("editTaskShopPrice").value =
        task.shop_product_price != null ? task.shop_product_price : "";

    // å¡«å……é‚€è¯·å¥½å‹å­—æ®µ
    document.getElementById("editInviteCount").value =
        task.invite_count != null ? task.invite_count : 3;
    document.getElementById("editInviteUnitPrice").value =
        task.invite_unit_price != null ? task.invite_unit_price : 10.0;

    document.getElementById("editTaskReward").value =
        task.reward != null ? task.reward : "";

    
    // ç¼–è¾‘å¼¹çª—é‡Œæ ¹æ®ä»»åŠ¡ç±»åž‹åˆ‡æ¢å¥–åŠ±è¾“å…¥æ¡†/æç¤º
    const editNormalRewardGroup = document.getElementById("editNormalRewardGroup");
    const editShopRewardGroup = document.getElementById("editShopRewardGroup");
    if (editNormalRewardGroup && editShopRewardGroup) {
        if (task.task_type === "shop" || task.task_type === "invite") {
            editNormalRewardGroup.style.display = "none";
            editShopRewardGroup.style.display = "";
            if (task.task_type === "shop") {
                editShopRewardGroup.querySelector("div").innerText = "âœ… å•†åŸŽä»»åŠ¡ä½£é‡‘æ ¹æ®ç”¨æˆ·ä¼šå‘˜ç­‰çº§æŒ‰è®¢å•é‡‘é¢æ¯”ä¾‹è‡ªåŠ¨è®¡ç®—ï¼Œæ— éœ€ä¿®æ”¹";
            } else {
                editShopRewardGroup.querySelector("div").innerText = "âœ… é‚€è¯·å¥½å‹ä»»åŠ¡å¥–åŠ±ä¸ºå›ºå®šå•ä»·ï¼ŒæŒ‰é‚€è¯·æˆåŠŸäººæ•°è‡ªåŠ¨å‘æ”¾ï¼Œæ— éœ€ä¿®æ”¹";
            }
        } else {
            editNormalRewardGroup.style.display = "";
            editShopRewardGroup.style.display = "none";
        }
    }
    document.getElementById("editTaskMaxClaims").value =
        task.max_claims != null ? task.max_claims : "";

    document.getElementById("editTaskStatus").value =
        task.status || "open";

    const dl =
        task.deadline
            ? new Date(task.deadline)
            : null;

    document.getElementById("editTaskDeadline").value =
        dl ? toLocalInputValue(dl) : "";

    document.getElementById("editTaskShopId").value =
        task.shop_product_id != null ? task.shop_product_id : "";

    document.getElementById("editTaskCreatedAt").value =
        task.created_at
            ? new Date(task.created_at).toLocaleString(
                (typeof I18N !== "undefined" && I18N.get() === "zh") ? "zh-MY" : "en-MY"
              )
            : "";


    // åé¢å±•ç¤º
    const claimed =
        (task.slots || 0) -
        (task.remaining_slots || 0);

    document.getElementById("editTaskClaimed").textContent =
        claimed;

    document.getElementById("editTaskRemaining").textContent =
        task.remaining_slots != null
            ? task.remaining_slots
            : "-";


    // å›¾ç‰‡
    const imgInput =
        document.getElementById("editTaskImage");

    const imgName =
        document.getElementById("editTaskImageName");

    const imgPrev =
        document.getElementById("editTaskImagePreview");

    const imgRm =
        document.getElementById("editTaskImageRemove");

    if (imgInput) imgInput.value = "";

    if (task.image_url) {

        imgPrev.src = task.image_url;

        imgPrev.style.display = "block";

        imgName.textContent =
            I18N.t("admin.editImageKeep");

        imgRm.style.display = "";

    } else {

        imgPrev.style.display = "none";

        imgName.textContent = "";

        imgRm.style.display = "none";

    }


    onEditTaskTypeChange();


    document.getElementById("editTaskModal").style.display = "flex";

}


function closeEditTask() {

    document.getElementById("editTaskModal").style.display = "none";

    editingTaskId = null;

}


function previewEditTaskImage() {

    const input =
        document.getElementById(
            "editTaskImage"
        );

    const file =
        input && input.files
            ? input.files[0]
            : null;

    if (!file) return;

    if (
        !file.type ||
        file.type.indexOf(
            "image/"
        ) !== 0
    ) {

        alert(
            I18N.t("admin.needImageFile")
        );

        input.value = "";

        return;

    }

    if (
        file.size >
        5 * 1024 * 1024
    ) {

        alert(
            I18N.t("admin.imageTooLarge")
        );

        input.value = "";

        return;

    }

    editTaskImageFile = file;

    editTaskImageChanged = "file";

    document.getElementById("editTaskImageName").textContent =
        file.name;

    document.getElementById("editTaskImagePreview").src =
        URL.createObjectURL(file);

    document.getElementById("editTaskImagePreview").style.display =
        "block";

    document.getElementById("editTaskImageRemove").style.display =
        "";

}


function clearEditTaskImage() {

    const input =
        document.getElementById(
            "editTaskImage"
        );

    if (input) input.value = "";

    editTaskImageFile = null;

    editTaskImageChanged = "remove";

    document.getElementById("editTaskImageName").textContent = "";

    document.getElementById("editTaskImagePreview").style.display = "none";

    document.getElementById("editTaskImageRemove").style.display = "none";

}


async function uploadEditTaskImage() {

    if (!editTaskImageFile) return null;

    const file =
        editTaskImageFile;

    const ext =
        (
            file.name.split(".").pop() ||
            "jpg"
        ).toLowerCase()
            .replace(
                /[^a-z0-9]/g,
                ""
            );

    const path =
        "task_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 8) +
        "." +
        ext;

    const {
        error: upError
    } =
        await supabaseClient
            .storage
            .from("task-images")
            .upload(
                path,
                file,
                {
                    cacheControl: "3600",
                    upsert: false,
                    contentType:
                        file.type ||
                        "image/jpeg"
                }
            );

    if (upError) {

        throw new Error(
            I18N.t("admin.imageUploadFailed") +
            upError.message
        );

    }

    const {
        data: pubData
    } =
        supabaseClient
            .storage
            .from("task-images")
            .getPublicUrl(
                path
            );

    return (
        pubData &&
        pubData.publicUrl
    );

}


function toLocalInputValue(d) {

    const pad =
        n => String(n).padStart(2, "0");

    return (
        d.getFullYear() +
        "-" +
        pad(d.getMonth() + 1) +
        "-" +
        pad(d.getDate()) +
        "T" +
        pad(d.getHours()) +
        ":" +
        pad(d.getMinutes())
    );

}


async function saveEditTask() {

    if (!editingTaskId) return;

    const title =
        document.getElementById("editTaskTitle").value.trim();

    const desc =
        document.getElementById("editTaskDescription").value.trim();

    const maxClaims =
        parseInt(
            document.getElementById("editTaskMaxClaims").value,
            10
        );

    if (!title) {

        alert(I18N.t("admin.needTitle"));

        return;

    }


    if (!Number.isInteger(maxClaims) || maxClaims <= 0) {

        alert(I18N.t("admin.needClaims"));

        return;

    }

    const typeInput =
        document.querySelector(
            'input[name="editTaskType"]:checked'
        );

    const taskType =
        (typeInput && typeInput.value) ||
        "shop";

    // è®¡ç®—å¥–åŠ±ï¼šå•†åŸŽ/é‚€è¯·ä»»åŠ¡è‡ªåŠ¨è®¡ç®—ï¼Œreward=0ï¼›æ™®é€šä»»åŠ¡è¯»å–è¾“å…¥æ¡†
    let reward = 0;
    if (taskType !== "shop" && taskType !== "invite") {
        reward = parseFloat(document.getElementById("editTaskReward").value) || 0;
        if (!Number.isFinite(reward) || reward <= 0) {
            alert(I18N.t("admin.needReward"));
            return;
        }
    }


    // å›¾ç‰‡å¤„ç†
    let imageUrl = null;

    let keepImage = true;

    if (editTaskImageChanged === "file" && editTaskImageFile) {

        try {

            imageUrl =
                await uploadEditTaskImage();

        } catch (e) {

            alert(e.message);

            return;

        }

        keepImage = false;

    } else if (editTaskImageChanged === "remove") {

        keepImage = false;

    }


    // åé¢ä¸€è‡´æ€§ï¼šå·²é¢†å–äººæ•°ä¿æŒä¸å˜ï¼Œå‰©ä½™åé¢è‡ªåŠ¨é‡ç®—
    const {
        data: cur
    } =
        await supabaseClient
            .from("tasks")
            .select("slots, remaining_slots")
            .eq("id", editingTaskId)
            .single();

    const claimed =
        (cur && ((cur.slots || 0) - (cur.remaining_slots || 0))) || 0;

    const newRemaining =
        Math.max(0, maxClaims - claimed);

    const deadlineVal =
        document.getElementById("editTaskDeadline").value;

    let deadline = null;

    if (deadlineVal) {

        const dd = new Date(deadlineVal);

        if (!isNaN(dd.getTime())) {

            deadline = dd.toISOString();

        }

    }

    const shopCode =
        document.getElementById("editTaskShopCode").value.trim();

    const shopPriceVal =
        document.getElementById("editTaskShopPrice").value.trim();

    const shopIdVal =
        document.getElementById("editTaskShopId").value.trim();

    const updates = {

        title: title,

        description: desc,

        requirements:
            document.getElementById("editTaskRequirements").value.trim() || null,

        reward: reward,

        max_claims: maxClaims,

        slots: maxClaims,

        remaining_slots: newRemaining,

        status:
            document.getElementById("editTaskStatus").value,

        task_type: taskType,

        task_link:
            document.getElementById("editTaskLink").value.trim() || null,

        shop_product_code:
            shopCode ? shopCode.toUpperCase() : null,

        shop_product_price:
            shopPriceVal !== "" ? parseFloat(shopPriceVal) : null,

        shop_product_id:
            shopIdVal !== "" ? parseInt(shopIdVal, 10) : null,

        invite_count:
            taskType === "invite" ? parseInt(document.getElementById("editInviteCount").value, 10) : null,

        invite_unit_price:
            taskType === "invite" ? parseFloat(document.getElementById("editInviteUnitPrice").value) : null,

        deadline: deadline

    };

    if (!keepImage) {

        updates.image_url = imageUrl;

    }


    const {
        error
    } =
        await supabaseClient
            .from("tasks")
            .update(updates)
            .eq(
                "id",
                editingTaskId
            );

    if (error) {

        console.error(error);

        alert(
            I18N.t("admin.saveTaskFailedMsg") +
            error.message
        );

        return;

    }


    alert(
        I18N.t("admin.taskSaved")
    );


    closeEditTask();


    await loadAdminTasks();

}


async function saveTask(
    updates
) {

    try {

        const {
            error
        } =
            await supabaseClient
                .from("tasks")
                .update(
                    updates
                )
                .eq(
                    "id",
                    editingTaskId
                );


        if (error) {

            throw error;

        }


        alert(
            "ä»»åŠ¡å·²æ›´æ–°"
        );


        editingTaskId =
            null;


        await loadAdminTasks();


    } catch (error) {

        console.error(error);


        alert(
            "ä¿å­˜å¤±è´¥ï¼š\n" +
            error.message
        );

    }

}


/* ========================================
   æ›´æ–°ç»Ÿè®¡
   ======================================== */

function updateStatistics(
    tasks
) {

    const total =
        tasks.length;


    const open =
        tasks.filter(
            function (task) {

                return task.status === "open";

            }
        ).length;


    const closed =
        tasks.filter(
            function (task) {

                return task.status !== "open";

            }
        ).length;


    const totalElement =
        document.getElementById(
            "totalTasks"
        );


    const openElement =
        document.getElementById(
            "openTasks"
        );


    const closedElement =
        document.getElementById(
            "closedTasks"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (openElement) {

        openElement.textContent =
            open;

    }


    if (closedElement) {

        closedElement.textContent =
            closed;

    }

}



/* ========================================
   ç®¡ç†å‘˜ç™»å‡º
   ======================================== */

async function adminLogout() {

    try {

        await supabaseClient
            .auth
            .signOut();

    } catch (error) {

        console.error(
            I18N.t("admin.logoutFailed"),
            error
        );

    }


    window.location.href =
        "index.html";

}


// ========================================
// ä¸€é”®é”ç«™ï¼ˆä»… weimengkektt1@gmail.com å¯è§ï¼‰
// ========================================

function openLockModal() {

    closeLockModal();

    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

    const mask = document.createElement("div");
    mask.className = "admin-modal-mask";
    mask.id = "lockSiteMask";
    mask.innerHTML =
        '<div class="admin-modal-box" style="max-width:460px">' +

        '<div class="admin-modal-head">' +
        '<h3>ðŸ”’ ' + (zh ? "ä¸€é”®é”ç«™" : "Lock Site") + '</h3>' +
        '<button class="admin-modal-close" onclick="closeLockModal()">âœ•</button>' +
        '</div>' +

        '<p style="margin:0 0 14px;color:#facc15;font-weight:600;font-size:13px">' +
        (zh ? "âš ï¸ æ­¤åŠŸèƒ½ä»…é™æœˆæœˆä½¿ç”¨" : "âš ï¸ This feature is for YueYue only") +
        '</p>' +

        '<div style="display:flex;flex-direction:column;gap:10px">' +

        '<button type="button" onclick="toggleLockSite(true)" class="admin-lock-option on">' +
        'ðŸŸ¢ ' + (zh ? "å¼€" : "ON") +
        '<span style="display:block;font-size:11px;color:#fca5a5;margin-top:3px">' +
        (zh ? "æ‰“å¼€åŽï¼šæ•´ä¸ªç½‘ç«™é™¤äº†æ‚¨ï¼Œæ‰€æœ‰ç”¨æˆ·åŒ…æ‹¬ç®¡ç†å‘˜éƒ½æ— æ³•ç™»å½•" : "When ON: no one except you (including admins) can log in") +
        '</span></button>' +

        '<button type="button" onclick="toggleLockSite(false)" class="admin-lock-option">' +
        'âšª ' + (zh ? "å…³" : "OFF") +
        '<span style="display:block;font-size:11px;color:#86efac;margin-top:3px">' +
        (zh ? "å…³é—­åŽï¼šç½‘é¡µæ¢å¤æ­£å¸¸ç™»å½•" : "When OFF: normal login is restored") +
        '</span></button>' +

        '</div>' +

        '</div>';

    document.body.appendChild(mask);

}

function closeLockModal() {

    const mask = document.getElementById("lockSiteMask");
    if (mask) mask.remove();

}

async function toggleLockSite(on) {

    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

    if (!confirm(
        on
            ? (zh ? "ç¡®å®šè¦æ‰“å¼€é”ç«™å—ï¼Ÿæ‰“å¼€åŽæ‰€æœ‰ç”¨æˆ·ï¼ˆå«ç®¡ç†å‘˜ï¼‰éƒ½æ— æ³•ç™»å½•ã€‚" : "Lock the site? No one except you can log in.")
            : (zh ? "ç¡®å®šè¦å…³é—­é”ç«™å¹¶æ¢å¤æ­£å¸¸ç™»å½•å—ï¼Ÿ" : "Unlock the site and restore normal login?")
    )) return;

    const { data, error } =
        await supabaseClient.rpc("site_set_lock", { p_on: on });

    if (error) {
        alert((zh ? "æ“ä½œå¤±è´¥ï¼š" : "Failed: ") + error.message);
        return;
    }

    alert(on
        ? (zh ? "å·²å¼€å¯é”ç«™ï¼Œä»…æ‚¨å¯ç™»å½•ã€‚" : "Site locked. Only you can log in.")
        : (zh ? "å·²å…³é—­é”ç«™ï¼Œç½‘é¡µæ¢å¤æ­£å¸¸ç™»å½•ã€‚" : "Site unlocked. Normal login restored."));

    closeLockModal();

}



/* ========================================
   HTML Escape
   ======================================== */

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}



/* ========================================
   JavaScript String Escape
   ======================================== */

function escapeJs(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        )

        .replace(
            /"/g,
            '\\"'
        )

        .replace(
            /\r/g,
            "\\r"
        )

        .replace(
            /\n/g,
            "\\n"
        );

}



        /* ç§»åŠ¨ç«¯åº•éƒ¨ Tab æ ï¼ˆç®¡ç†é¡µï¼šç®¡ç†åŽå°é«˜äº®ï¼Œæ›´å¤šé¢æ¿æä¾›ç”¨æˆ·ä¸­å¿ƒ/ç™»å‡ºï¼‰ */
        function tabMoreLb() {
            var el = document.getElementById("tabMoreLb");
            if (el) el.textContent = (typeof I18N !== "undefined" && I18N.get() === "zh") ? "æ›´å¤š" : "More";
        }
        function toggleMoreMb(force) {
            var panel = document.getElementById("morePanelMb");
            var mask = document.getElementById("moreMaskMb");
            if (!panel || !mask) return;
            renderMoreMb();
            var open = force === undefined ? panel.classList.contains("hidden") : force;
            panel.classList.toggle("hidden", !open);
            mask.classList.toggle("hidden", !open);
        }
        function renderMoreMb() {
            var grid = document.getElementById("moreGridMb");
            if (!grid) return;
            var zh = typeof I18N !== "undefined" && I18N.get() === "zh";
            var items = [
                { v: "mytasks", ic: "ðŸ“‹", lb: zh ? "æˆ‘çš„ä»»åŠ¡" : "My Tasks", href: "dashboard.html#mytasks" },
                { v: "withdraw", ic: "ðŸ’¸", lb: zh ? "æçŽ°" : "Withdraw", href: "dashboard.html#withdraw" },
                { v: "membership", ic: "ðŸ’Ž", lb: zh ? "ä¼šå‘˜ä¸­å¿ƒ" : "Membership", href: "dashboard.html#membership" },
                { v: "logout", ic: "â†ª", lb: zh ? "ç™»å‡º" : "Log out", act: "adminLogout()" }
            ];
            grid.innerHTML = items.map(function (it) {
                var on = "";
                if (it.act) {
                    return '<button type="button" class="mi-mb' + on + '" onclick="' + it.act + '" style="border:none;cursor:pointer;font-family:inherit"><span class="mi-ic-mb">' + it.ic + '</span><span class="mi-lb-mb">' + it.lb + '</span></button>';
                }
                return '<a class="mi-mb' + on + '" href="' + it.href + '" onclick="toggleMoreMb(false)"><span class="mi-ic-mb">' + it.ic + '</span><span class="mi-lb-mb">' + it.lb + '</span></a>';
            }).join("");
        }
        tabMoreLb();
    

