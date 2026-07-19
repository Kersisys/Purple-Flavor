// confirm.js
//
// Единое модальное окно подтверждения для всего проекта Purple Flavor.
// Заменяет нативный confirm() на окно в фирменном стиле.
//
// Использование:
//   import { showConfirm } from "./confirm.js";
//   const ok = await showConfirm("Удалить рецепт?");
//   if (ok) { ... }

export function showConfirm(message, options = {}){

    const {
        confirmText = "Ок",
        cancelText = "Отмена"
    } = options;

    return new Promise(resolve => {

        const overlay = document.createElement("div");

        overlay.className = [
            "fixed inset-0 z-[9999]",
            "flex items-center justify-center",
            "bg-black/40 px-4"
        ].join(" ");

        overlay.innerHTML = `
            <div class="
                bg-white dark:bg-[#33294a]
                text-[#3A2E52] dark:text-[#F3EEFF]
                rounded-3xl p-6 max-w-sm w-full shadow-xl
            ">
                <p class="mb-6 text-lg">${message}</p>
                <div class="flex gap-3 justify-end">
                    <button
                        data-action="cancel"
                        class="
                            px-4 py-2 rounded-xl
                            border border-[#C9BFF4]
                            hover:bg-[#F3EEFF] dark:hover:bg-[#241B33]
                        "
                    >${cancelText}</button>
                    <button
                        data-action="confirm"
                        class="
                            px-4 py-2 rounded-xl
                            bg-[#704E98] text-white
                            hover:bg-[#5a3f7f]
                        "
                    >${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        function close(result){
            overlay.remove();
            resolve(result);
        }

        overlay
            .querySelector('[data-action="cancel"]')
            .addEventListener("click", () => close(false));

        overlay
            .querySelector('[data-action="confirm"]')
            .addEventListener("click", () => close(true));

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) close(false);
        });

    });

}