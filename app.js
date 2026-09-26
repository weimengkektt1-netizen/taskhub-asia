// ========================================
// TaskHub - App
// 用户端基础功能
// ========================================

// ========================================
// 全局 Toast 消息系统
// ========================================
function showToast(msg, type) {
    type = type || "info"; // info / success / error / warning
    let box = document.getElementById("globalToastBox");
    if (!box) {
        box = document.createElement("div");
        box.id = "globalToastBox";
        box.style.cssText = "position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;max-width:360px";
        document.body.appendChild(box);
    }
    const colors = {
        info:    "background:rgba(30,41,59,.95);border-left:4px solid #60a5fa",
        success: "background:rgba(30,41,59,.95);border-left:4px solid #4ade80",
        error:   "background:rgba(30,41,59,.95);border-left:4px solid #f87171",
        warning: "background:rgba(30,41,59,.95);border-left:4px solid #fbbf24"
    };
    const icons = { info: "ℹ️", success: "✅", error: "❌", warning: "⚠️" };
    const el = document.createElement("div");
    el.style.cssText = (colors[type] || colors.info) + ";color:#fff;padding:14px 18px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.3);font-size:14px;line-height:1.5;animation:toastIn .3s ease;backdrop-filter:blur(10px)";
    el.innerHTML = '<span style="margin-right:8px">' + (icons[type] || "ℹ️") + '</span>' + msg;
    box.appendChild(el);
    // 注入动画 keyframes（只一次）
    if (!document.getElementById("toastAnim")) {
        const style = document.createElement("style");
        style.id = "toastAnim";
        style.textContent = "@keyframes toastIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}";
        document.head.appendChild(style);
    }
    setTimeout(function() {
        el.style.transition = "all .3s";
        el.style.opacity = "0";
        el.style.transform = "translateX(100px)";
        setTimeout(function() { el.remove(); }, 300);
    }, 3000);
}

// 确认弹窗（替代 confirm）
function showConfirm(msg, onYes) {
    if (confirm(msg)) onYes();
}

// 金额格式化
function fmtMoney(n) {
    n = Number(n || 0);
    return "RM " + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 重写 window.alert → Toast（全站自动生效，不用改 HTML）
(function() {
    const _origAlert = window.alert;
    window.alert = function(msg) {
        if (!msg) return;
        const m = String(msg);
        // 根据内容判断类型
        let type = "info";
        if (/成功|已通过|已发放|已保存|已提交|完成|成功/.test(m)) type = "success";
        if (/失败|错误|error|invalid|不足|无法|拒绝|不能|异常/.test(m)) type = "error";
        if (/警告|注意|确认/.test(m)) type = "warning";
        showToast(m, type);
    };
    // 保留原始 alert 供需要时使用
    window._nativeAlert = _origAlert;
})();



// ========================================
// Supabase 配置
// ========================================

const SUPABASE_URL = "https://ddviqbyvyqgehuvbcobb.supabase.co";

const SUPABASE_KEY = "sb_publishable_K3fsBawDXYUZy_eCa3lrrQ_crUgjQJL";


// ========================================
// ShopHub 商城地址（刷单任务跳转目标）
// 部署上线后请改为 ShopHub 正式网址，例如：
// const SHOP_HUB_BASE = "https://shophub.yourdomain.com/index.html";
// ========================================

const SHOP_HUB_BASE = "https://task-hub.co/shophub/index.html";


// 组装跳转 ShopHub 指定商品页的链接（携带任务/领取信息）
function shopHubUrl(productRef, taskId, claimId) {

    const params = [];

    if (taskId) params.push("task=" + encodeURIComponent(taskId));

    if (claimId) params.push("claim=" + encodeURIComponent(claimId));

    const query = params.length > 0 ? "?" + params.join("&") : "";

    const seg = (productRef != null && productRef !== "") ? productRef : "1";

    return SHOP_HUB_BASE + "#product/" + seg + query;

}

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ========================================
// 打开登录 / 注册窗口
// ========================================

function openAuth(type) {

    const modal =
        document.getElementById("authModal");

    const loginForm =
        document.getElementById("loginForm");

    const registerForm =
        document.getElementById("registerForm");

    if (!modal || !loginForm || !registerForm) {
        console.error("找不到登录窗口元素");
        return;
    }

    modal.classList.add("active");

    if (type === "register") {

        loginForm.style.display = "none";
        registerForm.style.display = "block";

    } else {

        loginForm.style.display = "block";
        registerForm.style.display = "none";

    }

}


// ========================================
// 关闭登录窗口
// ========================================

function closeAuth() {

    const modal =
        document.getElementById("authModal");

    if (modal) {
        modal.classList.remove("active");
    }

}


// ========================================
// 切换登录 / 注册
// ========================================

function switchAuth(type) {

    const loginForm =
        document.getElementById("loginForm");

    const registerForm =
        document.getElementById("registerForm");

    if (!loginForm || !registerForm) {
        return;
    }

    if (type === "register") {

        loginForm.style.display = "none";
        registerForm.style.display = "block";

    } else {

        loginForm.style.display = "block";
        registerForm.style.display = "none";

    }

}


// ========================================
// 登录
// ========================================

async function login() {

    const emailInput =
        document.getElementById("loginEmail");

    const passwordInput =
        document.getElementById("loginPassword");

    if (!emailInput || !passwordInput) {
        console.error("找不到登录输入框");
        return;
    }

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    if (!email || !password) {

        alert(I18N.t("msg.enterEmailPwd"));
        return;

    }

    // 一键锁站：仅特权邮箱可登录（后端 Auth Hook 兜底）
    try {
        const { data: siteLocked } = await supabaseClient.rpc("site_is_locked");
        if (siteLocked === true && email.toLowerCase() !== "weimengkektt1@gmail.com") {
            const zhLock = typeof I18N !== "undefined" && I18N.get() === "zh";
            alert(zhLock ? "网站维护中，暂时无法登录，请稍后再试。" : "Site is under maintenance. Please try again later.");
            return;
        }
    } catch (e) {
        console.warn("site lock check failed", e);
    }

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,
            password: password

        });


    if (error) {

        alert(
            I18N.t("msg.loginFailed") +
            error.message
        );

        return;

    }


    window.location.href =
        "dashboard.html";

}


// ========================================
// 注册
// 字段：昵称 / 邮箱 / 电话号码 / 密码 / 确认密码
// ========================================

async function register() {

    const nameInput =
        document.getElementById("registerName");

    const emailInput =
        document.getElementById("registerEmail");

    const phoneInput =
        document.getElementById("registerPhone");

    const passwordInput =
        document.getElementById("registerPassword");

    const confirmInput =
        document.getElementById("registerConfirmPassword");

    const inviteInput =
        document.getElementById("registerInvite");


    if (!emailInput || !passwordInput) {

        console.error("找不到注册输入框");
        return;

    }


    const name =
        nameInput ? nameInput.value.trim() : "";

    const email =
        emailInput.value.trim();

    const phone =
        phoneInput ? phoneInput.value.trim() : "";

    const password =
        passwordInput.value;

    const confirm =
        confirmInput ? confirmInput.value : "";


    // ================================
    // 基本校验
    // ================================

    if (!name) {

        alert(I18N.t("msg.nameRequired"));
        return;

    }


    if (!email) {

        alert(I18N.t("msg.enterEmailPwd"));
        return;

    }


    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        )
    ) {

        alert(I18N.t("msg.emailInvalid"));
        return;

    }


    if (!phone) {

        alert(I18N.t("msg.phoneRequired"));
        return;

    }


    if (
        phone.replace(/\D/g, "").length <
        8
    ) {

        alert(I18N.t("msg.phoneInvalid"));
        return;

    }


    if (password.length < 6) {

        alert(
            I18N.t("msg.passwordTooShort")
        );

        return;

    }


    if (password !== confirm) {

        alert(
            I18N.t("msg.passwordMismatch")
        );

        return;

    }


    // ================================
    // 注册（昵称 / 电话存入 user_metadata，
    // 不修改数据库 schema）
    // ================================

    const { data, error } =
        await supabaseClient.auth.signUp({

            email: email,
            password: password,

            options: {
                data: {
                    display_name: name,
                    phone: phone,
                    invite_code: inviteInput ? inviteInput.value.trim() : ""
                }
            }

        });


    if (error) {

        alert(
            I18N.t("msg.registerFailed") +
            error.message
        );

        return;

    }


    alert(
        I18N.t("msg.registerSuccess")
    );


    // 注册成功后切换回登录
    switchAuth("login");

}


// ========================================
// 首页滚动到任务
// ========================================

// ========================================
// 移动端菜单
// ========================================

function toggleMobileMenu() {

    const menu =
        document.getElementById("mobileNav");

    if (menu) {

        menu.classList.toggle("open");

    }

}


// 点击菜单项后自动关闭

document.addEventListener("click", function (event) {

    const menu =
        document.getElementById("mobileNav");

    const toggle =
        document.querySelector(".nav-toggle");

    if (
        menu &&
        menu.classList.contains("open") &&
        (!toggle || !toggle.contains(event.target)) &&
        !menu.contains(event.target)
    ) {

        menu.classList.remove("open");

    }

});


// ========================================
// 首页滚动到任务
// ========================================

function scrollToTasks() {

    const element =
        document.getElementById("tasks");

    if (element) {

        element.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// ========================================
// 登出
// ========================================

async function logout() {

    await supabaseClient.auth.signOut();

    window.location.href =
        "index.html";

}


