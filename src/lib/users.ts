const colors = [
    'bg-primary', 'bg-secondary', 'bg-purple-500', 'bg-orange-500', 
    'bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-pink-500', 
    'bg-indigo-500', 'bg-teal-500'
];

export  function getColorClass(index) {
    return colors[index % colors.length];
}

export  function getUserName(email) {
    const name = email.split('@')[0];
    const parts = name.split(/[._-]/);
    if (parts.length > 1) {
        return {
            fullName: parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' '),
            initials: parts.map(p => p.charAt(0).toUpperCase()).join('')
        };
    } else {
        const firstChar = name.charAt(0).toUpperCase();
        const rest = name.slice(1);
        const spaceIndex = rest.search(/[A-Z]/);
        if (spaceIndex !== -1) {
            return {
                fullName: firstChar + rest,
                initials: firstChar + rest.charAt(spaceIndex)
            };
        } else {
            return {
                fullName: firstChar + rest,
                initials: firstChar  
            };
        }
    }
}

