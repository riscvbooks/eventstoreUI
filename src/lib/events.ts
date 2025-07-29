const iconOptions = [
    { bgClass: 'bg-primary/10', iconClass: 'fa-calendar', textClass: 'text-primary' },
    { bgClass: 'bg-secondary/10', iconClass: 'fa-music', textClass: 'text-secondary' },
    { bgClass: 'bg-purple-100', iconClass: 'fa-graduation-cap', textClass: 'text-purple-600' },
    { bgClass: 'bg-orange-100', iconClass: 'fa-camera', textClass: 'text-orange-600' },
    { bgClass: 'bg-green-100', iconClass: 'fa-leaf', textClass: 'text-green-600' },
    { bgClass: 'bg-blue-100', iconClass: 'fa-coffee', textClass: 'text-blue-600' },
    { bgClass: 'bg-red-100', iconClass: 'fa-heart', textClass: 'text-red-600' },
    { bgClass: 'bg-pink-100', iconClass: 'fa-gift', textClass: 'text-pink-600' },
    { bgClass: 'bg-indigo-100', iconClass: 'fa-briefcase', textClass: 'text-indigo-600' },
    { bgClass: 'bg-teal-100', iconClass: 'fa-rocket', textClass: 'text-teal-600' }
];

export function selectRandomIcon() {
    const randomIndex = Math.floor(Math.random() * iconOptions.length);
    const selectedIcon = iconOptions[randomIndex];

    return selectedIcon
}