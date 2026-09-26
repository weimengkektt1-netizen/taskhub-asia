



// ========================================
// FAQ æ‰‹é£Žç´
// ========================================

function toggleFaq(btn) {

    const item =
        btn.closest(".faq-item");

    const isOpen =
        item.classList.contains("open");

    document
        .querySelectorAll(".faq-item.open")
        .forEach(
            function (i) {

                i.classList.remove("open");

            }
        );

    if (!isOpen) {

        item.classList.add("open");

    }

}
    



// ========================================
// DASHBOARD
// ========================================


let currentUser = null;

// å½“å‰ç”¨æˆ·ä¼šå‘˜ç­‰çº§ï¼ˆç”¨äºŽåˆ·å•ä»»åŠ¡å±•ç¤ºé¢„è®¡ä½£é‡‘ï¼‰
let currentMembershipLevel = "basic";

function commissionRate(level) {
    return level === "silver" ? 0.15 :
           level === "gold" ? 0.23 :
           level === "platinum" ? 0.30 :
           level === "diamond" ? 0.46 :
           level === "radiant" ? 0.65 : 0.10;
}


// ========================================
// CHECK LOGIN
// ========================================

async function checkUser() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();


    if (error || !data.user) {

        window.location.href = "index.html";

        return;

    }

    // ä¸€é”®é”ç«™ï¼šéžç‰¹æƒé‚®ç®±ï¼ˆweimengkektt1@gmail.comï¼‰åœ¨é”ç«™æœŸé—´è¢«ç™»å‡º
    try {
        const { data: siteLocked } = await supabaseClient.rpc("site_is_locked");
        if (siteLocked === true && String(data.user.email || "").toLowerCase() !== "weimengkektt1@gmail.com") {
            const zhLock = typeof I18N !== "undefined" && I18N.get() === "zh";
            alert(zhLock ? "ç½‘ç«™ç»´æŠ¤ä¸­ï¼Œæš‚æ—¶æ— æ³•è®¿é—®ï¼Œè¯·ç¨åŽå†è¯•ã€‚" : "Site is under maintenance. Please try again later.");
            await supabaseClient.auth.signOut();
            window.location.href = "index.html";
            return;
        }
    } catch (e) {
        console.warn("site lock check failed", e);
    }


        currentUser = data.user;

    document
        .getElementById("userEmail")
        .textContent = currentUser.email;

    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single();

    if (!profileError && profile && (profile.role === "admin" || profile.role === "agent")) {
        const adminNavLink =
            document.getElementById("adminNavLink");

        if (adminNavLink) {
            adminNavLink.style.display = "flex";
        }
    }


    await loadProfile();

    await loadWalletTransactions();

    await loadTasks();

    await loadMyTasks();
	
	await loadWithdrawHistory();

	await loadMembership();

}


// ========================================
// LOAD PROFILE
// ========================================

async function loadProfile() {

    const {
        data,
        error
    } =
        await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();


    if (error) {

        console.error(error);

        return;

    }


    // æ˜µç§°ä¼˜å…ˆå–æ³¨å†Œæ—¶å­˜å…¥çš„ user_metadataï¼Œ
    // å…¶æ¬¡å– profilesï¼ˆéƒ¨åˆ†æ—§è´¦å·çš„ display_name æ˜¯é‚®ç®±å‰ç¼€ï¼‰
    document
        .getElementById("userName")
        .textContent =
        (currentUser.user_metadata &&
            currentUser.user_metadata.display_name) ||
        data.display_name ||
        data.username ||
        I18N.t("common.user");


    // è®°å½•å½“å‰ä¼šå‘˜ç­‰çº§ï¼ˆç”¨äºŽå±•ç¤ºåˆ·å•ä»»åŠ¡é¢„è®¡ä½£é‡‘ï¼‰
    currentMembershipLevel =
        data.membership_level || "basic";

    // ç­‰çº§é—®å€™è¯­ + ç­‰çº§ä¸“å±žèƒŒæ™¯ï¼ˆLV3+ï¼‰
    setGreeting();
    initTierBackground();
    document.addEventListener("taskhub:langchange", setGreeting);


    document
        .getElementById("userBalance")
        .textContent =
        "RM" +
        Number(data.balance || 0)
        .toFixed(2);


    const withdrawBalance =
        document.getElementById("withdrawBalance");


    if (withdrawBalance) {

        withdrawBalance.textContent =
            "RM" +
            Number(data.balance || 0)
            .toFixed(2);

    }

}


// ========================================
// LOAD WALLET TRANSACTIONS
// ========================================

async function loadWalletTransactions() {

    const container =
        document.getElementById(
            "walletTransactions"
        );


    if (!container) return;


    container.innerHTML = `
        <div class="empty-box">
            ${I18N.t("wallet.loading")}
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
        .from("wallet_transactions")
        .select(
            "id, amount, type, note, created_at"
        )
        .eq(
            "user_id",
            currentUser.id
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        )
        .limit(20);


    // æ€»ä½£é‡‘æ”¶å…¥ç»Ÿè®¡ï¼šæ‰€æœ‰ task_reward è®°å½•é‡‘é¢ä¹‹å’Œ
    try {

        const {
            data: rewards
        } =
            await supabaseClient
            .from("wallet_transactions")
            .select(
                "amount"
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .eq(
                "type",
                "task_reward"
            )
            .limit(5000);

        const total =
            (rewards || []).reduce(
                (sum, r) => sum + Number(r.amount || 0),
                0
            );

        const totalEl =
            document.getElementById(
                "totalCommission"
            );

        if (totalEl) {

            totalEl.textContent =
                "RM" + total.toFixed(2);

        }

    } catch (e) {

        console.error(
            "Failed to load total commission",
            e
        );

    }


    // å½“å‰ä½™é¢ï¼ˆä»Ž profiles è¯»å–ï¼‰
    const balEl =
        document.getElementById(
            "walletStatBalance"
        );

    try {

        const {
            data: profile
        } =
            await supabaseClient
            .from("profiles")
            .select(
                "balance"
            )
            .eq(
                "id",
                currentUser.id
            )
            .maybeSingle();

        if (balEl && profile) {

            balEl.textContent =
                "RM" + Number(profile.balance || 0).toFixed(2);

        }

    } catch (e) {

        console.error(
            "Failed to load wallet balance",
            e
        );

    }


    if (error) {

        console.error(
            I18N.t("msg.walletLoadFailed"),
            error
        );


        container.innerHTML = `
            <div class="empty-box">
                ${I18N.t("wallet.failed")}
            </div>
        `;

        return;

    }


    if (!data || data.length === 0) {

        container.innerHTML = `
            <div class="empty-box">
                ${I18N.t("wallet.empty")}
            </div>
        `;

        return;

    }


    container.innerHTML =
        data.map(item => {

            const amount =
                Number(item.amount || 0);


            const isIncome =
                amount >= 0;


            const sign =
                isIncome ? "+" : "";

            const typeIcon =
                isIncome ? "ðŸ’°" : "ðŸ’¸";


            const d =
                new Date(
                    item.created_at
                );

            const date =
                d.toLocaleDateString(
                    I18N.get() === "zh" ? "zh-CN" : "en-GB"
                ) +
                " " +
                d.toLocaleTimeString(
                    "en-GB",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            let typeText =
                I18N.t("wallet.generic");


            if (
                item.type ===
                "task_reward"
            ) {

                typeText =
                    I18N.t("wallet.taskReward");

            }


            if (
                item.type ===
                "shopping_reward"
            ) {

                typeText =
                    I18N.t("wallet.shoppingReward");

            }


            return `
                <div class="wallet-transaction-item">

                    <div>

                        <strong>
                            ${typeIcon} ${typeText}
                        </strong>

                        <p>
                            ${item.note || ""}
                        </p>

                        <small>
                            ${date}
                        </small>

                    </div>

                    <strong class="wallet-transaction-amount ${isIncome ? "income" : "expense"}">
                        ${sign}RM${Math.abs(amount).toFixed(2)}
                    </strong>

                </div>
            `;

        }).join("");

}


// ========================================
// LOAD TASKS
// ========================================

function taskBadgeInfo(task) {

    if (
        task.status !== "open" ||
        !(task.remaining_slots > 0)
    ) {

        return {
            cls: "ended",
            text: I18N.t("tasks.ended")
        };

    }

    if (
        task.remaining_slots <= 3
    ) {

        return {
            cls: "limited",
            text: I18N.t("tasks.limited")
        };

    }

    return {
        cls: "recruiting",
        text: I18N.t("tasks.recruiting")
    };

}


function taskDeadlineInfo(task) {

    if (!task.deadline) {

        return {
            text: I18N.t("tasks.noDeadline")
        };

    }

    const d =
        new Date(task.deadline);

    if (
        isNaN(d.getTime())
    ) {

        return {
            text: I18N.t("tasks.noDeadline")
        };

    }

    const mm =
        String(
            d.getMonth() + 1
        ).padStart(2, "0");

    const dd =
        String(
            d.getDate()
        ).padStart(2, "0");

    return {
        text:
            I18N.t("tasks.deadline") +
            " " +
            mm +
            "/" +
            dd
    };

}


async function loadTasks() {

    const taskList =
        document.getElementById(
            "taskList"
        );


    taskList.innerHTML =
        `<div class="loading-box">
            ${I18N.t("msg.loadingTasks")}
        </div>`;


    const {
        data,
        error
    } =
        await supabaseClient
        .from("tasks")
        .select("*")
        .eq(
            "status",
            "open"
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(error);


        taskList.innerHTML =
            `<div class="empty-box">
                ${I18N.t("msg.failedLoadTasks")}
            </div>`;


        return;

    }


    // æŽ’é™¤å½“å‰ç”¨æˆ·å·²é¢†å–çš„ä»»åŠ¡ï¼ˆå·²å–æ¶ˆçš„ä¸ç®—ï¼‰
    // å•†åŸŽä»»åŠ¡ï¼šå·²å®Œæˆ(approved/completed)æˆ–å·²å–æ¶ˆ(cancelled)å¯å†æ¬¡æŽ¥å–ï¼Œä»…æŽ’é™¤è¿›è¡Œä¸­(claimed/submitted)çš„é¢†å–
    const {
        data: myClaims
    } =
        await supabaseClient
        .from("task_claims")
        .select("task_id, status")
        .eq(
            "user_id",
            currentUser.id
        );


    // å•†åŸŽä»»åŠ¡åˆ¤å®šï¼ˆé»˜è®¤ä»»åŠ¡ç±»åž‹å³å•†åŸŽä»»åŠ¡ï¼‰
    const isShopTask =
        (t) =>
            (t.task_type || "shop") === "shop" ||
            !!(t.shop_product_id || t.shop_product_code);

    // è¿›è¡Œä¸­çš„é¢†å–ï¼ˆclaimed/submittedï¼‰å¯¹åº”ä»»åŠ¡ä¸€å¾‹éšè—
    const activeClaimedIds =
        new Set(
            (myClaims || [])
                .filter(c => c.status === "claimed" || c.status === "submitted")
                .map(c => c.task_id)
        );

    // éžå•†åŸŽä»»åŠ¡ï¼šä¿æŒåŽŸé€»è¾‘ï¼ˆå·²å–æ¶ˆçš„ä¸ç®—ï¼Œå…¶ä½™çŠ¶æ€éšè—ï¼‰
    const nonShopClaimedIds =
        new Set(
            (myClaims || [])
                .filter(c => c.status !== "cancelled")
                .map(c => c.task_id)
        );


    const visibleTasks =
        (data || []).filter(
            t => isShopTask(t)
                ? !activeClaimedIds.has(t.id)
                : !nonShopClaimedIds.has(t.id)
        );


    if (
        visibleTasks.length === 0
    ) {

        taskList.innerHTML =
            `<div class="empty-box">
                ${I18N.t("dash.noTasks")}
            </div>`;


        return;

    }


    taskList.innerHTML = "";


    // æœ€å¤šæ˜¾ç¤º 4 ä¸ªï¼Œå…¶ä½™é€šè¿‡"æ›´å¤šä»»åŠ¡"è¿›å…¥ä»»åŠ¡å¤§åŽ…
    const moreBtn =
        document.getElementById(
            "moreTasksBtn"
        );

    if (moreBtn) {

        moreBtn.style.display =
            visibleTasks.length > 4
                ? ""
                : "none";

    }


    visibleTasks.slice(0, 4).forEach(task => {

        const badgeInfo =
            taskBadgeInfo(task);

        const deadlineInfo =
            taskDeadlineInfo(task);

        const appliedCount =
            Math.max(
                0,
                (task.slots || 0) -
                    (task.remaining_slots || 0)
            );

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "dashboard-task-card ht-task-card";


        card.innerHTML = `

            <div class="ht-card-media">

                ${task.image_url
                    ? `<img src="${escapeHtml(task.image_url)}" alt="${escapeHtml(task.title)}" loading="lazy">`
                    : `<div class="ht-card-placeholder">ðŸ“‹</div>`}

                <span class="ht-badge ht-badge-${badgeInfo.cls}">
                    ${badgeInfo.text}
                </span>

                <span class="ht-deadline">
                    ${deadlineInfo.text}
                </span>

            </div>


            <div class="ht-card-body">

                <h3>
                    ${escapeHtml(task.title)}
                    <span class="ht-type-badge ${task.task_type === "like" ? "like" : task.task_type === "review" ? "review" : task.task_type === "follow" ? "follow" : task.task_type === "invite" ? "invite" : "shop"}">
                        ${task.task_type === "like"
                            ? I18N.t("tasks.typeLike")
                            : task.task_type === "review"
                                ? I18N.t("tasks.typeReview")
                                : task.task_type === "follow"
                                    ? I18N.t("tasks.typeFollow")
                                    : task.task_type === "invite"
                                        ? I18N.t("tasks.typeInvite")
                                        : I18N.t("tasks.typeShop")}
                    </span>
                </h3>


                <p class="ht-card-desc">
                    ${escapeHtml(
                        task.description ||
                        I18N.t("dash.noTaskDesc")
                    )}
                </p>


                ${
                    task.task_type === "shop" && task.shop_product_price
                        ? `
                        <div class="ht-commission">
                            <div>
                                <span>${I18N.t("dash.orderPrice")}</span>
                                <b>RM${Number(task.shop_product_price).toFixed(2)}</b>
                            </div>
                            <div>
                                <span>${I18N.t("dash.estCommission")}</span>
                                <b class="ht-commission-value">RM${(Number(task.shop_product_price) * commissionRate(currentMembershipLevel)).toFixed(2)}</b>
                            </div>
                        </div>
                        `
                        : (task.task_type === "like" || task.task_type === "review" || task.task_type === "follow") && Number(task.reward) > 0
                            ? `
                            <div class="ht-commission">
                                <div>
                                    <span>${I18N.t("dash.fixedRewardLabel")}</span>
                                    <b>RM${Number(task.reward).toFixed(2)}</b>
                                </div>
                                <div>
                                    <span>${I18N.t("dash.fixedRewardHint")}</span>
                                    <b class="ht-commission-value">${I18N.t("dash.fixedRewardLabel")}</b>
                                </div>
                            </div>
                            `
                            : ""
                }


                ${
                    task.shop_product_code
                        ? `<div class="ht-shopcode">ðŸ›’ å•†åŸŽä»»åŠ¡ Â· å•†å“è¯†åˆ«ç  <b>${task.shop_product_code}</b></div>`
                        : ""
                }

                <div class="ht-slots">
                    ${I18N.t("tasks.applied")} ${appliedCount} Â·
                    ${I18N.t("tasks.slotsLeft")} <strong>${task.remaining_slots}</strong>
                </div>


                <button
                    class="task-action-btn"
                    onclick="claimTask(${task.id}, '${task.shop_product_code || ""}', ${task.shop_product_id || "null"}, '${(task.task_link || "").replace(/'/g, "\\'")}')">

                    ${
                        task.task_type === "like"
                            ? I18N.t("tasks.claimLike")
                            : task.task_type === "review"
                                ? I18N.t("tasks.claimReview")
                                : task.task_type === "follow"
                                    ? I18N.t("tasks.claimFollow")
                                    : (task.shop_product_code || task.shop_product_id)
                                        ? "åŽ»è´­ç‰©ä¸‹å•"
                                        : I18N.t("dash.claim")
                    }

                </button>

            </div>

        `;


        taskList.appendChild(
            card
        );

    });

}


// ========================================
// CLAIM TASK
// ========================================

async function claimTask(taskId, shopProductCode, shopProductId, taskLink) {

    // å•†åŸŽä»»åŠ¡ï¼šå·²å®Œæˆ(approved/completed)æˆ–å·²å–æ¶ˆ(cancelled)å¯å†æ¬¡æŽ¥å–ï¼Œ
    // ä»…å½“å­˜åœ¨è¿›è¡Œä¸­(claimed/submitted)çš„é¢†å–æ—¶ç¦æ­¢é‡å¤æŽ¥å–
    const isShopClaim =
        !!(shopProductCode || shopProductId);

    const {
        data: myClaimsForTask
    } =
        await supabaseClient
        .from("task_claims")
        .select("id, status")
        .eq(
            "task_id",
            taskId
        )
        .eq(
            "user_id",
            currentUser.id
        );


    if (isShopClaim) {

        const hasActive =
            (myClaimsForTask || []).some(
                c => c.status === "claimed" || c.status === "submitted"
            );

        if (hasActive) {

            alert(
                I18N.t("msg.claimedAlready")
            );

            return;

        }

    } else {

        const existing =
            (myClaimsForTask || []).find(
                c => c.status !== "cancelled"
            );

        if (existing) {

            alert(
                I18N.t("msg.claimedAlready")
            );

            return;

        }

    }


    // ===== ä¼šå‘˜ç­‰çº§æ¯æ—¥é™é¢æ£€æŸ¥ï¼ˆé©¬æ¥è¥¿äºšè‡ªç„¶æ—¥ï¼‰ =====
    const { data: profInfo } =
        await supabaseClient
        .from("profiles")
        .select("membership_level, role")
        .eq("id", currentUser.id)
        .single();

    const mLevel =
        (profInfo && profInfo.membership_level) || "basic";

    const mRole =
        (profInfo && profInfo.role) || "user";

    if (mRole !== "admin") {

        const mLimit =
            mLevel === "silver" ? 2 :
            mLevel === "gold" ? 6 :
            mLevel === "platinum" ? 9 :
            mLevel === "diamond" ? 12 :
            mLevel === "radiant" ? -1 : 1;

        if (mLimit > 0) {

            const malayDate =
                new Date(Date.now() + 8 * 3600 * 1000)
                .toISOString().slice(0, 10);

            const dayStartUTC =
                new Date(malayDate + "T00:00:00Z")
                .getTime() - 8 * 3600 * 1000;

            const { count: todayCount } =
                await supabaseClient
                .from("task_claims")
                .select("id", { count: "exact" })
                .eq("user_id", currentUser.id)
                .gte("claimed_at", new Date(dayStartUTC).toISOString())
                .not("status", "eq", "cancelled");

            if ((todayCount || 0) >= mLimit) {

                alert(
                    I18N.t("msg.claimLimitReached")
                    .replace("{limit}", String(mLimit))
                );

                return;

            }

        }

    }


    const {
        data,
        error
    } =
        await supabaseClient
        .from("task_claims")
        .insert({

            task_id:
                taskId,

            user_id:
                currentUser.id,

            status:
                "claimed"

        })
        .select()
        .single();


    if (error) {

        console.error(error);


        alert(
            I18N.t("msg.claimFailed") +
            error.message
        );


        return;

    }


    alert(
        I18N.t("msg.claimSuccess")
    );


    // ç‚¹èµžä»»åŠ¡ï¼šé¢†å–æˆåŠŸåŽè·³è½¬åˆ°æŒ‡å®šé“¾æŽ¥
    if (taskLink && data && data.id) {
        window.open(taskLink, "_blank");
        return;
    }

    // åˆ·å•ä»»åŠ¡ï¼šé¢†å–æˆåŠŸåŽç›´æŽ¥è·³è½¬ ShopHub ä¸‹å•
    if ((shopProductCode || shopProductId) && data && data.id) {
        window.location.href = shopHubUrl(shopProductCode || shopProductId, taskId, data.id);
        return;
    }


    await loadTasks();

    await loadMyTasks();

}
// ========================================
// LOAD MY TASKS
// ========================================

let myClaimsData = null;

let myTaskTab = "active";


async function loadMyTasks() {

    const list =
        document.getElementById(
            "myTaskList"
        );


    const {
        data,
        error
    } =
        await supabaseClient
        .from("task_claims")
        .select(`
            *,
            tasks (
                title,
                reward,
                shop_product_id,
                shop_product_code,
                shop_product_price,
                task_type,
                task_link,
                status,
                invite_count,
                invite_unit_price
            ),
            task_reviews (
                rating,
                comment,
                created_at
            )
        `)
        .eq(
            "user_id",
            currentUser.id
        )
        .order(
            "claimed_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(error);

        return;

    }


    myClaimsData =
        data || [];


    let completed = 0;

    let active = 0;


    myClaimsData.forEach(item => {

        if (
            item.status ===
            "approved"
        ) {

            completed++;

        }


        if (
            item.status ===
            "claimed" ||
            item.status ===
            "submitted"
        ) {

            active++;

        }

    });


    document
        .getElementById(
            "completedTasks"
        )
        .textContent =
        completed;


    document
        .getElementById(
            "activeTasks"
        )
        .textContent =
        active;


    renderMyTasks();

}


function isExpiredClaim(
    item
) {

    return (
        item.status === "rejected" ||
        item.status === "cancelled" ||
        (
            item.tasks?.status === "closed" &&
            item.status !== "approved"
        )
    );

}


function switchMyTaskTab(
    tab
) {

    myTaskTab =
        tab;


    document
        .querySelectorAll(
            ".my-task-tab"
        )
        .forEach(btn => {

            btn.classList.toggle(
                "active",
                btn.dataset.tab === tab
            );

        });


    renderMyTasks();

}


function renderMyTasks() {

    const list =
        document.getElementById(
            "myTaskList"
        );


    if (
        !myClaimsData ||
        myClaimsData.length === 0
    ) {

        list.innerHTML =
            `<div class="empty-box">
                ${I18N.t("dash.noMyTasks")}
            </div>`;

        return;

    }


    const filtered =
        myClaimsData.filter(item => {

            if (
                myTaskTab ===
                "done"
            ) {

                return (
                    item.status ===
                    "approved"
                );

            }


            if (
                myTaskTab ===
                "expired"
            ) {

                return isExpiredClaim(
                    item
                );

            }


            return (
                item.status ===
                "claimed" ||
                item.status ===
                "submitted"
            );

        });


    list.innerHTML = "";


    if (
        filtered.length === 0
    ) {

        list.innerHTML =
            `<div class="empty-box">
                ${
                    I18N.t(
                        myTaskTab === "active"
                            ? "dash.tabActiveEmpty"
                            : myTaskTab === "done"
                                ? "dash.tabDoneEmpty"
                                : "dash.tabExpiredEmpty"
                    )
                }
            </div>`;

        return;

    }


    filtered.forEach(item => {

        const row =
            document.createElement(
                "div"
            );


        const isLikeTask =
            (item.tasks?.task_type === "like" || item.tasks?.task_type === "review" || item.tasks?.task_type === "follow") ||
            !!item.tasks?.task_link;

        const isShopTask =
            item.tasks?.shop_product_code ||
            item.tasks?.shop_product_id;

        const reviewed =
            Array.isArray(item.task_reviews) &&
            item.task_reviews.length > 0;

        // é¢„è®¡ä½£é‡‘
        let commissionLabel = "";
        let commissionVal = "";
        if (isShopTask && item.tasks?.shop_product_price) {
            commissionLabel = I18N.t("dash.estCommission");
            commissionVal = "RM" + (Number(item.tasks.shop_product_price) * commissionRate(currentMembershipLevel)).toFixed(2);
        } else if (item.tasks?.task_type === "invite" && Number(item.tasks?.invite_unit_price) > 0) {
            // é‚€è¯·å¥½å‹ä»»åŠ¡ï¼šå›ºå®šæ€»å¥–åŠ±
            commissionLabel = I18N.t("dash.fixedRewardLabel");
            commissionVal = "RM" + Number(item.tasks.invite_unit_price).toFixed(2);
        } else if ((item.tasks?.task_type === "like" || item.tasks?.task_type === "review" || item.tasks?.task_type === "follow") && Number(item.tasks?.reward) > 0) {
            commissionLabel = I18N.t("dash.fixedRewardLabel");
            commissionVal = "RM" + Number(item.tasks.reward).toFixed(2);
        } else if (Number(item.tasks?.reward) > 0) {
            commissionLabel = I18N.t("dash.estCommission");
            commissionVal = "RM" + (Number(item.tasks.reward) * commissionRate(currentMembershipLevel)).toFixed(2);
        }


        row.className =
            "my-task-row" +
            (isLikeTask ? " has-actions" : "");


        row.innerHTML = `

            <div class="my-task-title">

                <strong>
                    ${escapeHtml(
                        item.tasks?.title ||
                        I18N.t("dash.task")
                    )}
                </strong>

                <small>
                    ${I18N.t("dash.claimedAt")}
                    ${new Date(
                        item.claimed_at
                    ).toLocaleString(
                        I18N.get() === "zh" ? "zh-MY" : "en-MY"
                    )}
                </small>

            </div>


            <span class="status-${item.status}">
                ${getStatusText(
                    item.status
                )}
            </span>

            ${item.status === "rejected" && item.reject_reason ? `
            <div style="margin-top:8px;padding:8px 12px;background:rgba(239,68,68,0.1);border-left:3px solid #ef4444;border-radius:6px;font-size:13px;color:#fca5a5;">
                âŒ æ‹’ç»ç†ç”±ï¼š${escapeHtml(item.reject_reason)}
            </div>
            ` : ""}

            ${commissionLabel ? `
            <div class="my-task-commission">
                <span>${commissionLabel}</span>
                <b class="my-task-commission-val">${commissionVal}</b>
            </div>
            ` : ""}


            ${
                item.status === "claimed"
                    ? `
                            <div class="my-task-actions">
                                <button
                                    class="task-action-btn"
                                    style="background:#ff4444;color:white;"
                                    onclick="cancelTask(${item.id})">
                                    âŒ å–æ¶ˆä»»åŠ¡
                                </button>
                            </div>
                        ` + (isLikeTask
                        ? `
                            <div class="my-task-actions">
                                <button
                                    class="task-action-btn ht-shop-btn"
                                    onclick="goLikeTask(${item.id}, '${(item.tasks?.task_link || "").replace(/'/g, "\\'")}')">

                                    ${item.tasks?.task_type === "follow" ? I18N.t("dash.followTaskGo") : I18N.t("dash.linkTaskGo")}

                                </button>

                                <button
                                    class="task-action-btn ht-proof-btn"
                                    onclick="submitTask(${item.id})">

                                    ðŸ“· ${I18N.t("dash.submitProofBtn")}

                                </button>
                            </div>
                          `
                        : isShopTask
                            ? `
                            <button
                                class="task-action-btn ht-shop-btn"
                                onclick="goShopTask(${item.id}, ${item.tasks.id}, '${item.tasks.shop_product_code || item.tasks.shop_product_id || ""}')">

                                ${I18N.t("dash.shopTaskGo")}

                            </button>
                          `
                            : `
                            <button
                                class="task-action-btn"
                                onclick="submitTask(${item.id})">

                                ${I18N.t("dash.submitTask")}

                            </button>
                          `)
                    : item.status === "approved" && isShopTask
                        ? (reviewed
                            ? `
                            <span class="my-task-reviewed">
                                âœ“ ${I18N.t("dash.reviewed")}
                            </span>
                          `
                            : `
                            <button
                                class="task-action-btn ht-review-btn"
                                onclick="openReviewModal(${item.id}, '${(item.tasks?.title || "").replace(/'/g, "\\'")}')">

                                ${I18N.t("dash.reviewTask")}

                            </button>
                          `)
                        : ""
            }

        `;


        list.appendChild(
            row
        );

    });

}


// ========================================
// OPEN SUBMIT TASK
// ========================================

let currentSubmitTask = null;



// ========================================
// å–æ¶ˆä»»åŠ¡
// ========================================
async function cancelTask(claimId) {
    if (!confirm("ç¡®å®šè¦å–æ¶ˆè¿™ä¸ªä»»åŠ¡å—ï¼Ÿå–æ¶ˆåŽå¯ä»¥é‡æ–°æŽ¥å–å…¶ä»–ä»»åŠ¡ã€‚")) return;
    
    const { error } = await supabaseClient
        .from('task_claims')
        .update({ status: 'cancelled' })
        .eq('id', claimId)
        .eq('user_id', (await supabaseClient.auth.getUser()).data.user.id);
    
    if (error) {
        alert("å–æ¶ˆå¤±è´¥ï¼š" + error.message);
        return;
    }
    
    alert("âœ… ä»»åŠ¡å·²å–æ¶ˆ");
    loadMyTasks();
}

// ========================================
// åˆ·å•ä»»åŠ¡ï¼šå‰å¾€ ShopHub å•†åŸŽå®Œæˆä¸‹å•ï¼ˆæºå¸¦é¢†å–è®°å½•ï¼‰
// ========================================

function goLikeTask(claimId, taskLink) {

    if (!taskLink) {

        alert(
            I18N.t("msg.shopOrderNotPlaced")
        );

        return;

    }

    window.open(taskLink, "_blank");

}


function goShopTask(claimId, taskId, productRef) {

    if (!productRef) {

        alert(
            I18N.t("msg.shopOrderNotPlaced")
        );

        return;

    }

    window.location.href =
        shopHubUrl(
            productRef,
            taskId,
            claimId
        );

}


// ========================================
// å•†å“ç‚¹è¯„ï¼ˆè´­ä¹°ä»»åŠ¡å®ŒæˆåŽè¯„ä»·ï¼‰
// ========================================

let currentReviewClaim = null;

let currentReviewRating = 0;


function openReviewModal(claimId, title) {

    currentReviewClaim =
        claimId;

    currentReviewRating =
        0;


    document.getElementById(
        "reviewTaskName"
    ).textContent =
        title || "";


    document.getElementById(
        "reviewComment"
    ).value =
        "";


    renderReviewStars();


    document
        .getElementById(
            "reviewModal"
        )
        .classList.add(
            "active"
        );

}


function closeReviewModal() {

    document
        .getElementById(
            "reviewModal"
        )
        .classList.remove(
            "active"
        );

}


function setReviewStar(v) {

    currentReviewRating =
        v;


    renderReviewStars();

}


function renderReviewStars() {

    document
        .querySelectorAll(
            "#reviewStars .ht-star"
        )
        .forEach(btn => {

            btn.classList.toggle(
                "on",
                Number(btn.dataset.v) <=
                currentReviewRating
            );

        });


    document
        .querySelectorAll(
            "#reviewStars .ht-star-zero"
        )
        .forEach(btn => {

            btn.classList.toggle(
                "on",
                currentReviewRating === 0
            );

        });

}


async function submitReview() {

    if (
        !currentReviewClaim
    ) {

        return;

    }


    const comment =
        document
        .getElementById(
            "reviewComment"
        )
        .value
        .trim();


    const {
        data,
        error
    } =
        await supabaseClient
        .rpc(
            "submit_task_review",
            {

                p_claim_id:
                    currentReviewClaim,

                p_rating:
                    currentReviewRating,

                p_comment:
                    comment || null

            }
        );


    if (error) {

        alert(
            I18N.t("msg.reviewError") +
            (error.message || "")
        );


        return;

    }


    closeReviewModal();


    alert(
        I18N.t("msg.reviewSuccess")
    );


    await loadMyTasks();

}


function submitTask(taskId) {

    currentSubmitTask =
        taskId;


    const modal =
        document.getElementById(
            "submitTaskModal"
        );


    const taskName =
        document.getElementById(
            "submitTaskName"
        );


    taskName.textContent =
        I18N.t("submit.submitting") +
        " #" +
        taskId;


    // æ‰¾åˆ°è¿™ä¸ªä»»åŠ¡çš„ç±»åž‹
    const claim = myClaimsData.find(c => c.id === taskId);
    const taskType = claim && claim.tasks ? claim.tasks.task_type : 'shop';

    // ä¸åŒä»»åŠ¡ç±»åž‹æ˜¾ç¤ºä¸åŒé¢æ¿
    const inviteArea = document.getElementById("invitePhonesArea");
    const proofUploadArea = document.getElementById("proofUploadArea");
    const proofTextArea = document.getElementById("proofTextArea");

    if (taskType === 'invite') {
        // é‚€è¯·å¥½å‹ä»»åŠ¡ï¼šæ˜¾ç¤ºç”µè¯å·ç è¾“å…¥åŒº
        if (inviteArea) {
            inviteArea.style.display = "block";
            const inviteList = document.getElementById("invitePhonesList");
            let html = "";
            for (let i = 1; i <= 5; i++) {
                html += '<input type="tel" id="invitePhone_' + i + '" placeholder="å¥½å‹ ' + i + ' çš„ç”µè¯å·ç ï¼ˆé€‰å¡«ï¼‰" style="margin-bottom:8px;width:100%;padding:10px;border-radius:8px;border:1px solid #ddd">';
            }
            inviteList.innerHTML = html;
        }
        // éšè—æˆªå›¾ä¸Šä¼ å’Œè¯´æ˜Ž
        if (proofUploadArea) proofUploadArea.style.display = "none";
        if (proofTextArea) proofTextArea.style.display = "none";
    } else {
        // å…¶ä»–ä»»åŠ¡ï¼ˆç‚¹èµž/è¯„è®º/å…³æ³¨/å•†åŸŽï¼‰ï¼šæ˜¾ç¤ºæˆªå›¾ä¸Šä¼  + è¯´æ˜Ž
        if (inviteArea) inviteArea.style.display = "none";
        if (proofUploadArea) proofUploadArea.style.display = "block";
        if (proofTextArea) proofTextArea.style.display = "block";
    }


    modal.classList.add(
        "active"
    );

}


// ========================================
// CLOSE SUBMIT TASK
// ========================================

function closeSubmitTask() {

    const modal =
        document.getElementById(
            "submitTaskModal"
        );


    modal.classList.remove(
        "active"
    );

}


// ========================================
// SUBMIT PROOF
// ä¸Šä¼ æˆªå›¾ + ä¿å­˜è¯´æ˜Ž + æäº¤å®¡æ ¸
// ========================================

async function submitProof() {

    if (!currentSubmitTask) {

        alert(
            I18N.t("msg.noTaskSelected")
        );

        return;

    }


    const imageInput =
        document.getElementById(
            "proofImage"
        );


    const descriptionInput =
        document.getElementById(
            "proofText"
        );


    const file =
        imageInput ? imageInput.files[0] : null;


    let proofText =
        descriptionInput ? descriptionInput.value.trim() : "";

    // é‚€è¯·å¥½å‹ä»»åŠ¡ï¼šæ”¶é›†ç”µè¯å·ç ï¼ˆä¸ç®¡ isInviteTaskï¼Œåªè¦æœ‰è¾“å…¥æ¡†å°±æ”¶é›†ï¼‰
    let invitePhones = [];
    const inviteList = document.getElementById("invitePhonesList");
    if (inviteList) {
        const inputs = inviteList.querySelectorAll("input[type=tel]");
        inputs.forEach((inp, i) => {
            if (inp.value.trim()) {
                invitePhones.push("å¥½å‹" + (i+1) + ": " + inp.value.trim());
            }
        });
        // æŠŠç”µè¯å·ç æ‹¼åˆ° proofText é‡Œ
        if (invitePhones.length > 0) {
            proofText = (proofText ? proofText + "\n" : "") + invitePhones.join("\n");
        }
    }


    // ================================
    // åŸºæœ¬æ£€æŸ¥
    // ================================

    // é‚€è¯·å¥½å‹ä»»åŠ¡ä¸éœ€è¦å›¾ç‰‡ï¼ˆå…¶ä»–ä»»åŠ¡å¯é€‰ï¼Œä¸å¼ºåˆ¶ï¼‰
    const isInviteTask = false; // å…ˆä¸åˆ¤æ–­ç±»åž‹ï¼Œå›¾ç‰‡éƒ½å¯é€‰


    // è¯´æ˜Žä¸éœ€è¦


    // æ–‡ä»¶ç±»åž‹ä¸éœ€è¦æ£€æŸ¥


    // æ–‡ä»¶å¤§å°ä¸éœ€è¦æ£€æŸ¥


    const submitButton =
        document.querySelector(
            "#submitTaskModal .task-action-btn"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            I18N.t("common.submitting");

    }


    try {

        // ================================
        // èŽ·å–å½“å‰ç”¨æˆ·
        // ================================

        const {
            data: {
                user
            },
            error: userError
        } =
            await supabaseClient
            .auth
            .getUser();


        if (
            userError ||
            !user
        ) {

            throw new Error(
                I18N.t("msg.sessionExpired")
            );

        }


        // ä¸Šä¼ æˆªå›¾åˆ° Storage
        let proofUrl = "";
        let filePath = "";
        if (file) {
            const fileExt = file.name.split(".").pop();
            filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
            const { error: uploadError } = await supabaseClient.storage
                .from("task-proofs")
                .upload(filePath, file, { cacheControl: "3600", upsert: false });
            if (uploadError) throw new Error("æˆªå›¾ä¸Šä¼ å¤±è´¥: " + uploadError.message);
            const { data: urlData } = supabaseClient.storage
                .from("task-proofs")
                .getPublicUrl(filePath);
            proofUrl = urlData.publicUrl;
        }


        // ================================
        // ä¿å­˜æäº¤è®°å½•
        // submissions
        // ================================

        const {
            data: submission,
            error: submissionError
        } =
            await supabaseClient
            .from(
                "submissions"
            )
            .insert({

                claim_id:
                    currentSubmitTask,

                user_id:
                    user.id,

                proof_text:
                    proofText,

                proof_url:
                    proofUrl

            })
            .select()
            .single();


        if (submissionError) {

            console.error(
                I18N.t("msg.saveFailed"),
                submissionError
            );


            // å°è¯•åˆ é™¤åˆšåˆšä¸Šä¼ çš„å›¾ç‰‡

            await supabaseClient
                .storage
                .from(
                    "task-proofs"
                )
                .remove([
                    filePath
                ]);


            throw new Error(
                I18N.t("msg.saveFailed") +
                submissionError.message
            );

        }


        // ================================
        // ä¿®æ”¹ä»»åŠ¡çŠ¶æ€
        // claimed â†’ submitted
        // ================================

        const {
            error: claimError
        } =
            await supabaseClient
            .from(
                "task_claims"
            )
            .update({
                status:
                    "submitted"
            })
            .eq(
                "id",
                currentSubmitTask
            )
            .eq(
                "user_id",
                user.id
            )
            .eq(
                "status",
                "claimed"
            );


        if (claimError) {

            console.error(
                I18N.t("msg.statusUpdateFailed"),
                claimError
            );


            // å°è¯•åˆ é™¤æäº¤è®°å½•

            if (submission) {

                await supabaseClient
                    .from(
                        "submissions"
                    )
                    .delete()
                    .eq(
                        "id",
                        submission.id
                    );

            }


            // å°è¯•åˆ é™¤å›¾ç‰‡

            await supabaseClient
                .storage
                .from(
                    "task-proofs"
                )
                .remove([
                    filePath
                ]);


            throw new Error(
                I18N.t("msg.statusUpdateFailed") +
                claimError.message
            );

        }


        // ================================
        // æäº¤æˆåŠŸ
        // ================================

        alert(
            I18N.t("msg.submitSuccess")
        );


        // å…³é—­çª—å£

        closeSubmitTask();


        // æ¸…ç©ºè¡¨å•
        if (imageInput) imageInput.value = "";
        if (descriptionInput) descriptionInput.value = "";


        // æ¸…é™¤å½“å‰ä»»åŠ¡

        currentSubmitTask =
            null;


        // åˆ·æ–°æˆ‘çš„ä»»åŠ¡

        await loadMyTasks();


    } catch (error) {

        console.error(
            "submitProof error:",
            error
        );


        alert(
            I18N.t("msg.submitFailed") +
            error.message
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                I18N.t("submit.submitBtn");

        }

    }

}


// ========================================
// STATUS
// ========================================

function getStatusText(status) {

    const map = {

        claimed:
            I18N.t("status.claimed"),

        submitted:
            I18N.t("status.submitted"),

        approved:
            I18N.t("status.approved"),

        rejected:
            I18N.t("status.rejected"),

        cancelled:
            I18N.t("status.cancelled")

    };


    return map[status] ||
        status;

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


// ========================================
// WITHDRAW
// SUBMIT WITHDRAWAL
// ========================================

async function submitWithdrawal() {

    const amountInput =
        document.getElementById("withdrawAmount");

    const methodInput =
        document.getElementById("withdrawMethod");

    const accountInput =
        document.getElementById("withdrawAccount");

    const bankInput =
        document.getElementById("withdrawBank");

    const accountNameInput =
        document.getElementById("withdrawAccountName");

    const amount =
        Number(amountInput.value);

    const method =
        methodInput.value;

    const account =
        accountInput.value.trim();

    const bank =
        bankInput ? bankInput.value.trim() : "";

    const accountName =
        accountNameInput ? accountNameInput.value.trim() : "";


    // ========================================
    // åŸºæœ¬æ£€æŸ¥
    // ========================================

    if (!amount || amount <= 0) {

        alert(I18N.t("msg.withdrawAmountInvalid"));

        return;

    }


    if (amount < 250) {

        alert(I18N.t("msg.withdrawMin"));

        return;

    }


    if (!method) {

        alert(I18N.t("msg.withdrawMethodRequired"));

        return;

    }


    if (!account) {

        alert(I18N.t("msg.withdrawAccountRequired"));

        return;

    }


    if (method === "bank" && !bank) {

        alert(I18N.t("msg.bankRequired"));

        return;

    }


    if (!accountName) {

        alert(I18N.t("msg.accountNameRequired"));

        return;

    }


    if (!currentUser) {

        alert(I18N.t("msg.withdrawSession"));

        return;

    }


    // ========================================
    // æ£€æŸ¥å½“å‰ä½™é¢
    // ========================================

    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient
        .from("profiles")
        .select("balance")
        .eq("id", currentUser.id)
        .single();


    if (profileError) {

        console.error(
            I18N.t("msg.balanceReadFailed"),
            profileError
        );

        alert(
            I18N.t("msg.balanceReadFailed") +
            profileError.message
        );

        return;

    }


    const balance =
        Number(profile.balance || 0);


    if (amount > balance) {

        alert(
            I18N.t(
                "msg.balanceNotEnough",
                {
                    balance: balance.toFixed(2)
                }
            )
        );

        return;

    }


    // ========================================
    // é˜²æ­¢é‡å¤ç‚¹å‡»
    // ========================================

    const button =
        document.querySelector(
            ".withdraw-submit-btn"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            I18N.t("common.submitting");

    }


    try {

        // ========================================
        // åˆ›å»ºæçŽ°ç”³è¯·
        // ========================================

        const {
            data,
            error
        } =
            await supabaseClient
            .from("withdrawals")
            .insert({

                user_id:
                    currentUser.id,

                amount:
                    amount,

                method:
                    method,

                account:
                    account,

                bank_name:
                    bank,

                account_name:
                    accountName,

                status:
                    "pending"

            })
            .select()
            .single();


        if (error) {

            console.error(
                I18N.t("msg.withdrawFailed"),
                error
            );

            throw new Error(
                error.message
            );

        }


        // ========================================
        // æˆåŠŸ
        // ========================================

        alert(
            I18N.t(
                "msg.withdrawSuccess",
                {
                    amount: amount.toFixed(2)
                }
            ) +
            "\n" +
            I18N.t("withdraw.status")
        );


        // æ¸…ç©ºè¡¨å•

        amountInput.value = "";

        methodInput.value = "";

        accountInput.value = "";


        // åˆ·æ–°æçŽ°è®°å½•

        await loadWithdrawHistory();


    } catch (error) {

        console.error(
            "submitWithdrawal error:",
            error
        );


        alert(
            I18N.t("msg.withdrawFailed") +
            error.message
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                I18N.t("withdraw.submitBtn");

        }

    }

}


// ========================================
// LOAD WITHDRAW HISTORY
// ========================================

async function loadWithdrawHistory() {

    const container =
        document.getElementById(
            "withdrawHistory"
        );


    if (!container || !currentUser) {

        return;

    }


    container.innerHTML = `
        <div class="empty-box">
            ${I18N.t("withdraw.loading")}
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
        .from("withdrawals")
        .select(`
            id,
            amount,
            method,
            account,
            status,
            admin_note,
            created_at,
            reviewed_at
        `)
        .eq(
            "user_id",
            currentUser.id
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        )
        .limit(20);


    if (error) {

        console.error(
            I18N.t("withdraw.failed"),
            error
        );


        container.innerHTML = `
            <div class="empty-box">
                ${I18N.t("withdraw.failed")}
            </div>
        `;

        return;

    }


    if (!data || data.length === 0) {

        container.innerHTML = `
            <div class="empty-box">
                ${I18N.t("withdraw.noHistory")}
            </div>
        `;

        return;

    }


    container.innerHTML =
        data.map(item => {

            const amount =
                Number(
                    item.amount || 0
                ).toFixed(2);


            const d =
                new Date(
                    item.created_at
                );

            const date =
                d.toLocaleDateString(
                    I18N.get() === "zh" ? "zh-CN" : "en-GB"
                ) +
                " " +
                d.toLocaleTimeString(
                    "en-GB",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            let methodText =
                I18N.t("common.unknown");


            if (
                item.method === "bank"
            ) {

                methodText =
                    I18N.t("common.bank");

            }


            if (
                item.method === "ewallet"
            ) {

                methodText =
                    I18N.t("common.ewallet");

            }


            let statusText =
                I18N.t("withdraw.pending");


            if (
                item.status ===
                "approved"
            ) {

                statusText =
                    I18N.t("withdraw.approved");

            }


            if (
                item.status ===
                "rejected"
            ) {

                statusText =
                    I18N.t("withdraw.rejected");

            }


            if (
                item.status ===
                "cancelled"
            ) {

                statusText =
                    I18N.t("withdraw.cancelled");

            }


            return `
                <div class="withdraw-history-item">

                    <div>

                        <strong>
                            RM${amount}
                        </strong>

                        <p>
                            ${methodText}
                        </p>

                        <small>
                            ${date}
                        </small>

                    </div>


                    <div style="text-align:right;">

                        <span class="withdraw-status">
                            ${statusText}
                        </span>

                    </div>

                </div>
            `;

        }).join("");

}


// ========================================
// LOGOUT
// ========================================

async function logout() {

    await supabaseClient
        .auth
        .signOut();


    window.location.href =
        "index.html";

}


// ========================================
// åŠ¨æ€å®¢æœé“¾æŽ¥ï¼ˆä»Ž settings è¡¨è¯»å–ï¼‰
// ========================================

let siteContactLink = "https://wa.me/601139706264";

async function loadSiteContactLink() {

    try {

        // ä¼˜å…ˆä½¿ç”¨æ‰€å±žä»£ç†è®¾å®šçš„å›¢é˜Ÿå®¢æœé“¾æŽ¥ï¼ˆç»‘å®šåŽè‡ªåŠ¨ç”Ÿæ•ˆï¼‰
        let agentLink = null;

        try {

            const { data: agentRes } =
                await supabaseClient
                    .rpc("get_my_agent_cs_link");

            if (agentRes) {

                agentLink = agentRes;

            }

        } catch (e) {

            console.error("èŽ·å–ä»£ç†å®¢æœé“¾æŽ¥å¤±è´¥", e);

        }

        if (agentLink) {

            siteContactLink = agentLink;

            document
                .querySelectorAll(".wa-float")
                .forEach(function (a) {

                    a.href = siteContactLink;

                });

            return;

        }

        const { data } =
            await supabaseClient
                .from("settings")
                .select("value")
                .eq("key", "contact_whatsapp")
                .maybeSingle();

        if (data && data.value) {

            siteContactLink = data.value;

            document
                .querySelectorAll(".wa-float")
                .forEach(function (a) {

                    a.href = siteContactLink;

                });

        }

    } catch (e) {

        console.error("åŠ è½½å®¢æœé“¾æŽ¥å¤±è´¥", e);

    }

}


// ========================================
// START
// ========================================

checkUser();

loadSiteContactLink();

// è¯­è¨€åˆ‡æ¢æ—¶é‡æ–°æ¸²æŸ“åŠ¨æ€å†…å®¹
document.addEventListener(
    "taskhub:langchange",
    function () {

        loadTasks();
        loadMyTasks();
        loadWalletTransactions();
        loadWithdrawHistory();
        loadMembership();

    }
);


// ========================================
// MEMBERSHIPï¼ˆä¼šå‘˜ä¸­å¿ƒï¼‰
// ========================================

const MEMBER_TIERS = [
    { key: "basic",    rate: 10, limit: 1,  price: 0,    invite: 0  },
    { key: "silver",   rate: 15, limit: 2,  price: 0,    invite: 6  },
    { key: "gold",     rate: 23, limit: 6,  price: 19.9, invite: -1 },
    { key: "platinum", rate: 30, limit: 9,  price: 49.9, invite: -1 },
    { key: "diamond",  rate: 46, limit: 12, price: 125,  invite: -1 },
    { key: "radiant",  rate: 65, limit: -1, price: 199.9, invite: -1 }
];

function tierIcon(key) {

    const SVG = {
        basic: '<img class="tier-svg" src="assets/tier/basic.png" alt="">',
        silver: '<img class="tier-svg" src="assets/tier/silver.png" alt="">',
        gold: '<img class="tier-svg" src="assets/tier/gold.png" alt="">',
        platinum: '<img class="tier-svg" src="assets/tier/platinum.png" alt="">',
        diamond: '<img class="tier-svg" src="assets/tier/diamond.png" alt="">',
        radiant: '<img class="tier-svg" src="assets/tier/radiant.png" alt="">'
    };

    return SVG[key] || SVG.basic;

}

function memberName(key) {
    return I18N.t("member." + key);
}

async function loadMembership() {

    const wrap = document.getElementById("memberTiers");
    if (!wrap) return;

    const { data: prof, error } =
        await supabaseClient
        .from("profiles")
        .select("membership_level, invite_code")
        .eq("id", currentUser.id)
        .single();

    if (error || !prof) return;

    const cur = prof.membership_level || "basic";
    const conf = MEMBER_TIERS.find(function (t) { return t.key === cur; }) || MEMBER_TIERS[0];

    const badgeEl = document.getElementById("memberTierBadge");
    if (badgeEl) {
        badgeEl.innerHTML = tierIcon(cur);
        badgeEl.className = "member-tier-badge tier-" + cur;
    }
    const navIco = document.getElementById("navMemberIco");
    if (navIco) navIco.innerHTML = tierIcon("diamond");

    const { data: invitedCount, error: invErr } =
        await supabaseClient.rpc("get_my_invite_count");

    const invited = (!invErr && typeof invitedCount === "number") ? invitedCount : 0;

    document.getElementById("memberTierName").textContent = memberName(cur);
    document.getElementById("memberCommission").textContent = conf.rate + "%";
    document.getElementById("memberDailyLimit").textContent =
        conf.limit < 0 ? I18N.t("member.unlimited") : (conf.limit + " " + I18N.t("member.perDay"));

    const codeEl = document.getElementById("memberInviteCode");
    if (codeEl && prof.invite_code) codeEl.textContent = prof.invite_code;

    const bar = document.getElementById("memberInviteBar");
    if (bar) bar.style.width = Math.min(100, Math.round(invited / 6 * 100)) + "%";

    const cntEl = document.getElementById("memberInviteCount");
    if (cntEl) cntEl.textContent = I18N.t("member.invited") + " " + invited + " / 6";

    wrap.innerHTML = MEMBER_TIERS.map(function (t) {

        const isCur = t.key === cur;
        // é‚€è¯·è§£é”ï¼šinvite > 0 ä¸”äººæ•°è¾¾æ ‡ï¼ˆdiamond/radiant ä¸º -1ï¼Œä¸å¯é€šè¿‡é‚€è¯·è§£é”ï¼‰
        const inviteUnlocked = t.invite > 0 && invited >= t.invite;
        const freeByInvite = t.invite > 0 && t.price === 0;
        const payOnly = t.invite < 0;
        const canPay = t.price > 0;
        const zh = typeof I18N !== "undefined" && I18N.get() === "zh";

        let action = "";

        if (isCur) {
            action = '<span class="member-badge-cur" data-i18n="member.current">å½“å‰ç­‰çº§</span>';
        } else if (inviteUnlocked) {
            action = '<span class="member-badge-unlocked">âœ“</span>';
        } else if (freeByInvite || t.invite > 0) {
            action = '<span class="member-badge-need">' +
                I18N.t("member.need").replace("{n}", String(t.invite - invited)) + '</span>';
        } else if (payOnly) {
            action = '<span class="member-badge-need">ðŸ’³ ' + (zh ? "ä»˜è´¹è§£é”" : "Pay") + '</span>';
        }

        let priceLine = "";
        if (t.invite > 0 && t.price > 0) {
            priceLine = '<div class="member-tier-price">' + I18N.t("member.inviteOrPay")
                .replace("{n}", String(t.invite)).replace("{price}", t.price.toFixed(1)) + '</div>';
        } else if (payOnly) {
            priceLine = '<div class="member-tier-price">' + I18N.t("member.payUnlock")
                .replace("{price}", t.price.toFixed(1)) + '</div>';
        } else if (t.invite > 0) {
            priceLine = '<div class="member-tier-price"><em>' + I18N.t("member.upgradeByInvite").replace("{n}", String(t.invite)) + '</em></div>';
        } else {
            priceLine = '<div class="member-tier-price"><em>' + I18N.t("member.upgradeByInvite").replace("{n}", "0") + '</em></div>';
        }

        // æŒ‰é’®ï¼šå¯ä»˜è´¹ä¸”æœªè¾¾æ ‡ â†’ æ˜¾ç¤ºå‡çº§ï¼ˆèµ°ä»˜è´¹æµç¨‹ï¼‰
        let btnHtml = "";
        if (!isCur && canPay && !inviteUnlocked) {
            btnHtml = '<button class="member-upgrade-btn" onclick="upgradeMember(\'' + t.key + '\',' + t.price + ')">' +
                I18N.t("member.join") + '</button>';
        }

        return (
            '<div class="member-tier' + (isCur ? " is-current" : "") + '">' +
            '<div class="member-tier-head">' +
            '<span class="member-tier-icon tier-' + t.key + '">' + tierIcon(t.key) + '</span>' +
            '<strong>' + memberName(t.key) + '</strong>' + action +
            '</div>' +
            '<div class="member-tier-rows">' +
            '<div><span data-i18n="member.commission">ä»»åŠ¡ä½£é‡‘</span><b>' + t.rate + '%</b></div>' +
            '<div><span data-i18n="member.dailyLimit">æ¯æ—¥å¯é¢†ä»»åŠ¡</span><b>' +
            (t.limit < 0 ? I18N.t("member.unlimited") : t.limit + " " + I18N.t("member.perDay")) + '</b></div>' +
            '</div>' + priceLine + btnHtml +
            '</div>'
        );

    }).join("");

}

function copyInviteCode() {

    const el = document.getElementById("memberInviteCode");
    if (!el) return;
    const code = el.textContent.trim();
    if (!code || code === "--------") return;

    const done = function () {
        alert(I18N.t("member.copySuccess"));
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done).catch(function () {
            fallbackCopy(code, done);
        });
    } else {
        fallbackCopy(code, done);
    }

}

function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    done();
}

function upgradeMember(level, price) {

    if (price > 0) {

        alert(
            I18N.t("member.upgradeByPay").replace("{price}", String(price)) +
            "\n\n" + I18N.t("member.payHint")
        );
        window.open(siteContactLink || "https://wa.me/601139706264", "_blank");

    } else {

        alert(I18N.t("member.inviteHint"));

    }

}


// ========================================
// TOGGLE SIDEBAR (MOBILE)
// ========================================

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    if (sidebar) {

        sidebar.classList.toggle(
            "open"
        );

    }

}


// ç‚¹å‡»èœå•å¤–éƒ¨åŒºåŸŸæ—¶è‡ªåŠ¨å…³é—­

document.addEventListener(
    "click",
    function (event) {

        const sidebar =
            document.querySelector(
                ".sidebar"
            );

        const toggle =
            document.querySelector(
                ".sidebar-toggle"
            );

        if (
            sidebar &&
            sidebar.classList.contains(
                "open"
            ) &&
            toggle &&
            !sidebar.contains(
                event.target
            ) &&
            !toggle.contains(
                event.target
            )
        ) {

            sidebar.classList.remove(
                "open"
            );

        }

    }
);




// ========================================
// ç­‰çº§é—®å€™è¯­ï¼ˆç­‰çº§è¶Šé«˜è¶Šå°Šæ•¬ï¼‰
// ========================================

const GREETING_BY_TIER = {
    basic:    { zh: "æ¬¢è¿Žåˆ°è®¿ï¼Œå¾ˆé«˜å…´å¼€å¯æ‚¨çš„æ—…ç¨‹ã€‚", en: "Welcome. Glad to begin your journey." },
    silver:   { zh: "æ¬¢è¿Žå›žæ¥ï¼ŒæœŸå¾…ä¸Žæ‚¨ç»§ç»­åŒè¡Œã€‚", en: "Welcome back. Looking forward to our continued journey." },
    gold:     { zh: "æ¬¢è¿Žå›žå®¶ï¼Œæ„Ÿæ©ä¸€è·¯æœ‰æ‚¨ç›¸ä¼´ã€‚", en: "Welcome home. Thank you for walking with us." },
    platinum: { zh: "æ­è¿Žå½’æ¥ï¼Œæ‚¨çš„ä¿¡èµ–æ˜¯æˆ‘ä»¬çš„è£å¹¸ã€‚", en: "A warm welcome back. Your trust is our honor." },
    diamond:  { zh: "æ­å€™æ‚¨å½’æ¥ï¼Œæ­¤åœ°å§‹ç»ˆä¸ºæ‚¨å®ˆå€™ã€‚", en: "We await your return. This place stands ready for you." },
    radiant:  { zh: "æ­è¿Žå°Šé©¾å½’æ¥ï¼Œæ‰¿è’™åŽšçˆ±ï¼Œé™å€™å›ä¸´ã€‚", en: "Welcome back, honored patron. We await your gracious presence." }
};

function setGreeting() {
    const el = document.getElementById("greetingTitle");
    if (!el) return;
    const nameEl = document.getElementById("userName");
    const name = (nameEl && nameEl.textContent) || "VIP";
    const zh = typeof I18N !== "undefined" && I18N.get() === "zh";
    const tier = GREETING_BY_TIER[currentMembershipLevel] || GREETING_BY_TIER.basic;
    el.textContent = (zh ? tier.zh : tier.en).replace("{name}", name);
}

// ========================================
// ç­‰çº§ä¸“å±žèƒŒæ™¯ï¼šLV3 æ˜Ÿç©º / LV4 å‘å…‰æ˜Ÿäº‘ / LV5 æµæ˜ŸåŠ¨æ•ˆ / LV6 å¥¢åŽæ˜Ÿç©º
// ========================================

function initTierBackground() {
    const lv = { gold: 3, platinum: 4, diamond: 5, radiant: 6 }[currentMembershipLevel] || 0;
    if (lv < 3) return;

    let canvas = document.getElementById("bgCanvas");
    if (canvas && canvas.dataset.lv === String(lv)) return; // å·²åˆå§‹åŒ–åŒç­‰çº§
    if (canvas) canvas.remove();

    canvas = document.createElement("canvas");
    canvas.id = "bgCanvas";
    canvas.className = "dashboard-bg";
    canvas.dataset.lv = String(lv);
    canvas.style.opacity = "1";
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext("2d");
    const isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0, H = 0;

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.floor(W * DPR);
        canvas.height = Math.floor(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // æ˜Ÿæ˜Ÿï¼ˆæ›´äº®ã€æ•°é‡éšç­‰çº§é€’å¢žï¼‰
    const starCount = isMobile
        ? ({ 3: 90, 4: 120, 5: 160, 6: 220 })[lv]
        : ({ 3: 200, 4: 280, 5: 340, 6: 460 })[lv];
    const stars = Array.from({ length: starCount }, function () {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.4 + 0.4,
            base: Math.random() * 0.5 + 0.45,
            tw: Math.random() * 0.03 + 0.01,
            ph: Math.random() * Math.PI * 2,
            color: lv >= 6
                ? (Math.random() < 0.3 ? "255,225,160" : (Math.random() < 0.45 ? "255,255,255" : "190,215,255"))
                : (lv >= 4 ? (Math.random() < 0.25 ? "190,215,255" : "255,255,255") : "255,255,255")
        };
    });

    // æ˜Ÿäº‘ï¼ˆLV4+ï¼Œæ˜Žæ˜¾å‘å…‰ï¼‰
    const nebCount = { 3: 0, 4: 4, 5: 5, 6: 7 }[lv];
    const nebs = Array.from({ length: nebCount }, function () {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 190 + 110,
            hue: Math.random() < 0.5 ? (Math.random() * 40 + 215) : (Math.random() * 50 + 265),
            a: Math.random() * 0.15 + 0.12,
            speed: Math.random() * 0.0008 + 0.0004,
            ph: Math.random() * Math.PI * 2
        };
    });

    // å‘å…‰å…‰æ–‘ï¼ˆLV4+ æ–°å¢žå‘å…‰ç´ æï¼Œå‘¼å¸è„‰åŠ¨ï¼‰
    const glowCount = { 3: 0, 4: 6, 5: 10, 6: 16 }[lv];
    const glowHues = [215, 235, 265, 285, 320, 40];
    const glows = Array.from({ length: glowCount }, function () {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 15 + 6,
            hue: glowHues[Math.floor(Math.random() * glowHues.length)],
            a: Math.random() * 0.4 + 0.3,
            speed: Math.random() * 0.05 + 0.02,
            ph: Math.random() * Math.PI * 2
        };
    });

    // æµæ˜Ÿï¼ˆLV5+ï¼‰
    const meteorCount = { 3: 0, 4: 0, 5: 3, 6: 4 }[lv];
    function newMeteor() {
        return {
            x: Math.random() * W,
            y: Math.random() * H * 0.6,
            vx: -(Math.random() * 3 + 2.5),
            vy: Math.random() * 1.6 + 1.4,
            len: Math.random() * 90 + 60,
            life: 0,
            max: Math.random() * 180 + 120
        };
    }
    const meteors = Array.from({ length: meteorCount }, newMeteor);

    // é‡‘è‰²ç²’å­ï¼ˆLV6 ä¸“å±žï¼Œå¥¢åŽæ„Ÿï¼‰
    const dust = lv >= 6
        ? Array.from({ length: isMobile ? 45 : 85 }, function () {
            return {
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.8 + 0.7,
                vx: (Math.random() - 0.5) * 0.14,
                vy: -Math.random() * 0.3 - 0.06,
                ph: Math.random() * Math.PI * 2
            };
        })
        : [];

    // LV6 é¡¶éƒ¨å…‰çŽ¯ï¼ˆç¼“æ…¢æ—‹è½¬çš„æ¤­åœ†å…‰å¸¦ï¼‰
    const halo = lv >= 6 ? { a: 0.10 } : null;

    let t = 0;
    function frame() {
        t++;
        ctx.clearRect(0, 0, W, H);

        // æ˜Ÿäº‘å…‰æ™•
        for (const n of nebs) {
            const a = n.a * (0.7 + 0.3 * Math.sin(t * n.speed + n.ph));
            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
            g.addColorStop(0, "hsla(" + n.hue + ",90%,62%," + a + ")");
            g.addColorStop(0.5, "hsla(" + (n.hue + 15) + ",90%,52%," + (a * 0.45) + ")");
            g.addColorStop(1, "hsla(" + n.hue + ",90%,50%,0)");
            ctx.fillStyle = g;
            ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
        }

        // å‘å…‰å…‰æ–‘ï¼ˆå‘¼å¸è„‰åŠ¨ï¼‰
        for (const g0 of glows) {
            const a = g0.a * (0.6 + 0.4 * Math.sin(t * g0.speed + g0.ph));
            const g = ctx.createRadialGradient(g0.x, g0.y, 0, g0.x, g0.y, g0.r);
            g.addColorStop(0, "hsla(" + g0.hue + ",100%,75%," + Math.max(0, a) + ")");
            g.addColorStop(1, "hsla(" + g0.hue + ",100%,70%,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(g0.x, g0.y, g0.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // æ˜Ÿæ˜Ÿï¼ˆé—ªçƒï¼‰
        for (const s of stars) {
            const alpha = s.base + s.tw * Math.sin(t * 0.06 + s.ph);
            const a = Math.max(0, Math.min(1, alpha));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + s.color + "," + a + ")";
            ctx.fill();
            // LV5+ å¤§æ˜Ÿæ˜ŸåŠ å…‰æ™•
            if (lv >= 5 && s.r > 1.0) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 3.2, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(" + s.color + "," + (a * 0.16) + ")";
                ctx.fill();
            }
        }

        // é‡‘è‰²ç²’å­ï¼ˆLV6ï¼‰
        for (const p of dust) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
            if (p.x < -10) p.x = W + 10;
            if (p.x > W + 10) p.x = -10;
            const a = 0.4 + 0.35 * Math.sin(t * 0.05 + p.ph);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,225,160," + Math.max(0, a) + ")";
            ctx.fill();
            if (p.r > 1.2) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255,225,160," + Math.max(0, a * 0.2) + ")";
                ctx.fill();
            }
        }

        // æµæ˜Ÿï¼ˆLV5+ï¼‰
        for (let i = 0; i < meteors.length; i++) {
            const m = meteors[i];
            m.life++;
            m.x += m.vx;
            m.y += m.vy;
            if (m.life > m.max || m.y > H || m.x < 0) meteors[i] = newMeteor();
            const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * m.len, m.y - m.vy * m.len);
            g.addColorStop(0, "rgba(255,255,255,0.95)");
            g.addColorStop(1, "rgba(180,200,255,0)");
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.vx * m.len, m.y - m.vy * m.len);
            ctx.stroke();
            // æµæ˜Ÿå¤´éƒ¨äº®ç‚¹
            ctx.beginPath();
            ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.fill();
        }

        // LV6 é¡¶éƒ¨å¥¢åŽå…‰æ™• + å…‰çŽ¯
        if (lv >= 6) {
            const cx = W * 0.5, cy = H * 0.26, r = Math.max(W, H) * 0.6;
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            g.addColorStop(0, "rgba(255,220,160,0.09)");
            g.addColorStop(1, "rgba(255,220,160,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);

            // æ—‹è½¬å…‰çŽ¯ï¼ˆä¸¤åœˆï¼‰
            const ex = W * 0.5, ey = H * 0.30, rx = Math.max(W, H) * 0.38, ry = rx * 0.28;
            const ang = t * 0.004;
            ctx.save();
            ctx.translate(ex, ey);
            ctx.rotate(ang);
            ctx.strokeStyle = "rgba(255,225,180," + (halo.a * (0.7 + 0.3 * Math.sin(t * 0.02))) + ")";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.rotate(-ang * 1.6);
            ctx.strokeStyle = "rgba(190,215,255," + (halo.a * 0.5) + ")";
            ctx.beginPath();
            ctx.ellipse(0, 0, rx * 0.62, ry * 0.62, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}


// ========== Realtime å®žæ—¶æŽ¨é€ ==========
(function initRealtime() {
    if (typeof supabaseClient === "undefined") return;

    function safeReload(fnName) {
        return function() {
            var a = document.activeElement;
            if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT")) return;
            if (typeof window[fnName] === "function") {
                try { window[fnName](); } catch(e) { console.warn("realtime reload:", e); }
            }
        };
    }

    // è®¢é˜… tasksï¼ˆä»»åŠ¡åˆ—è¡¨ï¼‰
    try {
        supabaseClient
            .channel("rt-dash-tasks")
            .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, safeReload("loadTasks"))
            .subscribe();
        console.log("âœ… Realtime: tasks è®¢é˜…å·²å¯åŠ¨");
    } catch(e) { console.warn("tasks realtime failed:", e); }

    // è®¢é˜… task_claimsï¼ˆæˆ‘çš„ä»»åŠ¡ï¼‰
    try {
        supabaseClient
            .channel("rt-dash-mytasks")
            .on("postgres_changes", { event: "*", schema: "public", table: "task_claims" }, safeReload("loadMyTasks"))
            .subscribe();
        console.log("âœ… Realtime: task_claims è®¢é˜…å·²å¯åŠ¨");
    } catch(e) { console.warn("task_claims realtime failed:", e); }

    // è®¢é˜… wallet_transactionsï¼ˆé’±åŒ…æµæ°´ï¼‰
    try {
        supabaseClient
            .channel("rt-dash-wallet")
            .on("postgres_changes", { event: "*", schema: "public", table: "wallet_transactions" }, safeReload("loadWalletTransactions"))
            .subscribe();
        console.log("âœ… Realtime: wallet_transactions è®¢é˜…å·²å¯åŠ¨");
    } catch(e) { console.warn("wallet_transactions realtime failed:", e); }

    // è®¢é˜… task_reviewsï¼ˆä»»åŠ¡å®¡æ ¸ç»“æžœé€šçŸ¥ï¼‰
    try {
        supabaseClient
            .channel("rt-dash-reviews")
            .on("postgres_changes", { event: "*", schema: "public", table: "task_reviews" }, safeReload("loadMyTasks"))
            .subscribe();
        console.log("âœ… Realtime: task_reviews è®¢é˜…å·²å¯åŠ¨");
    } catch(e) { console.warn("task_reviews realtime failed:", e); }
})();




