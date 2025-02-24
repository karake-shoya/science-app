document.addEventListener('DOMContentLoaded', function () {
  const userMenuButton = document.getElementById('user-menu-button');
  const userMenu = document.querySelector('[role="menu"]');

  userMenuButton.addEventListener('click', function () {
    const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
    userMenuButton.setAttribute('aria-expanded', !isExpanded);
    userMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', function (event) {
    if (!userMenuButton.contains(event.target) && !userMenu.contains(event.target)) {
      userMenuButton.setAttribute('aria-expanded', 'false');
      userMenu.classList.add('hidden');
    }
  });
});