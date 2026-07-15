document.addEventListener('DOMContentLoaded', () => {
    // Alternar abas da Sidebar
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    const tabContents = document.querySelectorAll('.tab-content');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            menuItems.forEach(i => i.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            this.classList.add('active');
            const targetSection = this.getAttribute('data-target');
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Menu sanduíche responsivo
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
});
