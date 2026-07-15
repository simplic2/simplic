// Atua unificando os outros módulos de scripts
document.addEventListener("DOMContentLoaded", () => {
    App.init();
    Dashboard.init();
    WhatsApp.init();
});

const App = {
    init: function() {
        this.setupNavigation();
    },

    setupNavigation: function() {
        const navItems = document.querySelectorAll(".nav-item");
        const tabContents = document.querySelectorAll(".tab-content");

        navItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                const targetTab = item.getAttribute("data-tab");

                navItems.forEach(nav => nav.classList.remove("active"));
                item.classList.add("active");

                tabContents.forEach(tab => {
                    tab.classList.remove("active");
                    if (tab.id === `${targetTab}-tab`) {
                        tab.classList.add("active");
                    }
                });
            });
        });
    }
};
