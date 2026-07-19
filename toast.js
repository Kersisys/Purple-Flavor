// toast.js
//
// Единый модуль toast-уведомлений для всего проекта Purple Flavor.
// Заменяет alert() на аккуратные всплывающие сообщения в фирменном стиле.
//
// Использование:
//   import { showToast } from "./toast.js";
//   showToast("Профиль сохранён");                 // success (по умолчанию)
//   showToast("Введите название рецепта", "error"); // ошибка
//   showToast("Рецепт отправлен на модерацию", "info");

const TOAST_STYLES = {
    success: { bg: "bg-[#704E98]", icon: "✅" },
    error: { bg: "bg-red-500", icon: "⚠️" },
    info: { bg: "bg-[#9D91D9]", icon: "ℹ️" }
};

function getContainer() {

    let container = document.getElementById("toastContainer");

    if (container) return container;

    container = document.createElement("div");
    container.id = "toastContainer";
    container.className =
        "fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none";

    document.body.appendChild(container);

    return container;

}

export function showToast(message, type = "success", duration = 3500) {

    const container = getContainer();
    const style = TOAST_STYLES[type] || TOAST_STYLES.success;

    const toast = document.createElement("div");

    toast.className = [
        style.bg,
        "text-white px-5 py-3 rounded-2xl shadow-lg",
        "flex items-center gap-2 text-sm font-medium",
        "opacity-0 translate-y-2 transition-all duration-300",
        "max-w-sm pointer-events-auto"
    ].join(" ");

    toast.innerHTML = `<span>${style.icon}</span><span>${message}</span>`;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove("opacity-0", "translate-y-2");
    });

    setTimeout(() => {

        toast.classList.add("opacity-0", "translate-y-2");

        setTimeout(() => toast.remove(), 300);

    }, duration);

}
